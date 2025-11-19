<?php
/**
 * Script de Diagnóstico de Conexión a Base de Datos
 * Usar para verificar la configuración de la base de datos
 */

header('Content-Type: application/json; charset=UTF-8');

// Cargar configuración
$config_file = dirname(__DIR__) . '/includes/config.php';
if (file_exists($config_file)) {
    require_once $config_file;
    $config_loaded = true;
} else {
    $config_loaded = false;
    // Valores por defecto si no existe config
    define('DB_HOST', 'localhost');
    define('DB_PORT', '3306');
    define('DB_NAME', 'gastos_app_db');
    define('DB_USER', 'gastos_user');
    define('DB_PASS', 'Gastos2025!');
}

$result = [
    'config_file' => [
        'path' => $config_file,
        'exists' => $config_loaded,
        'realpath' => realpath($config_file) ?: 'N/A'
    ],
    'database_config' => [
        'host' => DB_HOST,
        'port' => DB_PORT,
        'database' => DB_NAME,
        'user' => DB_USER,
        'password_set' => !empty(DB_PASS),
        'password_length' => strlen(DB_PASS)
    ],
    'connection_test' => null,
    'php_info' => [
        'version' => PHP_VERSION,
        'pdo_available' => extension_loaded('pdo'),
        'pdo_mysql_available' => extension_loaded('pdo_mysql')
    ]
];

// Intentar conectar
try {
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $result['connection_test'] = [
        'status' => 'SUCCESS',
        'message' => 'Conexión a MySQL establecida',
        'server_info' => $pdo->getAttribute(PDO::ATTR_SERVER_VERSION)
    ];

    // Verificar si la base de datos existe
    try {
        $pdo->exec("USE " . DB_NAME);
        $result['database_test'] = [
            'status' => 'SUCCESS',
            'message' => 'Base de datos existe y es accesible',
            'database' => DB_NAME
        ];

        // Verificar si la tabla usuarios existe
        try {
            $stmt = $pdo->query("SHOW TABLES LIKE 'usuarios'");
            $table_exists = $stmt->rowCount() > 0;

            if ($table_exists) {
                $stmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios");
                $count = $stmt->fetch();

                $result['usuarios_table'] = [
                    'status' => 'SUCCESS',
                    'exists' => true,
                    'total_users' => $count['total']
                ];
            } else {
                $result['usuarios_table'] = [
                    'status' => 'WARNING',
                    'exists' => false,
                    'message' => 'Tabla usuarios no existe'
                ];
            }
        } catch (PDOException $e) {
            $result['usuarios_table'] = [
                'status' => 'ERROR',
                'message' => $e->getMessage()
            ];
        }

    } catch (PDOException $e) {
        $result['database_test'] = [
            'status' => 'ERROR',
            'message' => 'Base de datos no existe o no es accesible',
            'error' => $e->getMessage()
        ];
    }

} catch (PDOException $e) {
    $result['connection_test'] = [
        'status' => 'ERROR',
        'message' => 'Error al conectar a MySQL',
        'error' => $e->getMessage(),
        'error_code' => $e->getCode()
    ];
}

// Determinar status general
if ($result['connection_test']['status'] === 'SUCCESS' &&
    isset($result['database_test']) && $result['database_test']['status'] === 'SUCCESS') {
    $result['overall_status'] = 'SUCCESS';
    http_response_code(200);
} else {
    $result['overall_status'] = 'ERROR';
    http_response_code(500);
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
