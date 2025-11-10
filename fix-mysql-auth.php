<?php
// ====================================================
// FIX MYSQL AUTHENTICATION - SYMBIOT FINANCE MANAGER v3.1
// ====================================================
// Este script arregla el problema de autenticación de MySQL 8.0
// cambiando el método de 'caching_sha2_password' a 'mysql_native_password'
// para hacerlo compatible con PHP 7.3 PDO.
// ====================================================

// Credenciales (confirmadas por el usuario)
define('ROOT_USER', 'root');
define('ROOT_PASS', 'admin1234');
define('APP_USER', 'gastos_user');
define('APP_PASS', 'Gastos2025!');
define('APP_DB', 'gastos_app_db');

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fix MySQL Auth - Symbiot v3.1</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            margin: 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .version {
            color: #666;
            font-size: 14px;
            margin-bottom: 30px;
        }
        .result {
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 5px solid;
        }
        .success {
            background: #d4edda;
            border-color: #28a745;
            color: #155724;
        }
        .error {
            background: #f8d7da;
            border-color: #dc3545;
            color: #721c24;
        }
        .info {
            background: #d1ecf1;
            border-color: #17a2b8;
            color: #0c5460;
        }
        .warning {
            background: #fff3cd;
            border-color: #ffc107;
            color: #856404;
        }
        .step {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            border-left: 4px solid #667eea;
        }
        .code {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            margin: 10px 0;
            overflow-x: auto;
        }
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin-top: 20px;
            transition: all 0.3s;
            font-weight: bold;
        }
        .btn:hover {
            background: #218838;
            transform: translateY(-2px);
        }
        .btn-secondary {
            background: #667eea;
        }
        .btn-secondary:hover {
            background: #5568d3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Arreglar Autenticación MySQL 8.0</h1>
        <p class="version">Symbiot Finance Manager v3.1 - AppServ 9.3.0 Compatible</p>

        <div class="result info">
            <strong>📋 Problema Detectado:</strong><br>
            MySQL 8.0 usa <code>caching_sha2_password</code> por defecto.<br>
            PHP 7.3 PDO solo soporta <code>mysql_native_password</code>.<br><br>
            <strong>💡 Solución:</strong><br>
            Cambiar el método de autenticación del usuario <code>gastos_user</code>.
        </div>

        <?php
        $allSuccess = true;
        $steps = [];

        // PASO 1: Conectar como ROOT
        try {
            $dsn = "mysql:host=localhost;port=3306;charset=utf8mb4";
            $rootPdo = new PDO($dsn, ROOT_USER, ROOT_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);

            $steps[] = [
                'type' => 'success',
                'title' => 'Paso 1: Conexión como ROOT',
                'message' => '✅ Conectado exitosamente como root@localhost'
            ];

        } catch (PDOException $e) {
            $steps[] = [
                'type' => 'error',
                'title' => 'Paso 1: Conexión como ROOT',
                'message' => '❌ Error conectando como root: ' . $e->getMessage()
            ];
            $allSuccess = false;
        }

        // PASO 2: Verificar que el usuario gastos_user existe
        if ($allSuccess) {
            try {
                $stmt = $rootPdo->query("SELECT user, host, plugin FROM mysql.user WHERE user = '" . APP_USER . "'");
                $userInfo = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($userInfo) {
                    $steps[] = [
                        'type' => 'success',
                        'title' => 'Paso 2: Verificar usuario gastos_user',
                        'message' => '✅ Usuario encontrado<br>' .
                                   'Host: ' . $userInfo['host'] . '<br>' .
                                   'Método actual: <code>' . $userInfo['plugin'] . '</code>'
                    ];

                    if ($userInfo['plugin'] === 'mysql_native_password') {
                        $steps[] = [
                            'type' => 'info',
                            'title' => 'ℹ️ Nota',
                            'message' => 'El usuario ya usa mysql_native_password. No es necesario cambiarlo.'
                        ];
                    }

                } else {
                    $steps[] = [
                        'type' => 'error',
                        'title' => 'Paso 2: Verificar usuario gastos_user',
                        'message' => '❌ El usuario "' . APP_USER . '" NO EXISTE en MySQL'
                    ];
                    $allSuccess = false;
                }

            } catch (PDOException $e) {
                $steps[] = [
                    'type' => 'error',
                    'title' => 'Paso 2: Verificar usuario',
                    'message' => '❌ Error verificando usuario: ' . $e->getMessage()
                ];
                $allSuccess = false;
            }
        }

        // PASO 3: Cambiar método de autenticación
        if ($allSuccess) {
            try {
                // Cambiar a mysql_native_password
                $sql = "ALTER USER '" . APP_USER . "'@'localhost' IDENTIFIED WITH mysql_native_password BY '" . APP_PASS . "'";
                $rootPdo->exec($sql);

                // Flush privileges
                $rootPdo->exec("FLUSH PRIVILEGES");

                $steps[] = [
                    'type' => 'success',
                    'title' => 'Paso 3: Cambiar método de autenticación',
                    'message' => '✅ Usuario actualizado a <code>mysql_native_password</code><br>' .
                               '✅ Privilegios actualizados'
                ];

            } catch (PDOException $e) {
                $steps[] = [
                    'type' => 'error',
                    'title' => 'Paso 3: Cambiar método de autenticación',
                    'message' => '❌ Error cambiando método: ' . $e->getMessage()
                ];
                $allSuccess = false;
            }
        }

        // PASO 4: Verificar que funcione la conexión con el usuario app
        if ($allSuccess) {
            try {
                $dsn = "mysql:host=localhost;port=3306;dbname=" . APP_DB . ";charset=utf8mb4";
                $appPdo = new PDO($dsn, APP_USER, APP_PASS, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                ]);

                // Test query
                $stmt = $appPdo->query('SELECT 1 as test');
                $result = $stmt->fetch();

                $steps[] = [
                    'type' => 'success',
                    'title' => 'Paso 4: Test de conexión con gastos_user',
                    'message' => '✅ ¡Conexión exitosa!<br>' .
                               'Usuario: ' . APP_USER . '<br>' .
                               'Base de datos: ' . APP_DB . '<br>' .
                               'Test query: OK'
                ];

            } catch (PDOException $e) {
                $steps[] = [
                    'type' => 'error',
                    'title' => 'Paso 4: Test de conexión',
                    'message' => '❌ Error probando conexión: ' . $e->getMessage()
                ];
                $allSuccess = false;
            }
        }

        // Mostrar todos los pasos
        foreach ($steps as $step) {
            echo "<div class='step'>";
            echo "<div class='result {$step['type']}'>";
            echo "<strong>{$step['title']}</strong><br>";
            echo $step['message'];
            echo "</div>";
            echo "</div>";
        }

        // Resultado final
        if ($allSuccess) {
            echo "<div class='result success' style='margin-top: 30px; font-size: 16px;'>";
            echo "<strong>🎉 ¡ÉXITO! Todo funcionó correctamente</strong><br><br>";
            echo "El usuario <code>gastos_user</code> ahora usa <code>mysql_native_password</code><br>";
            echo "PHP 7.3 PDO puede conectarse sin problemas.<br><br>";
            echo "<strong>✅ Configuración actual:</strong><br>";
            echo "<div class='code'>";
            echo "DB_HOST=localhost<br>";
            echo "DB_PORT=3306<br>";
            echo "DB_DATABASE=" . APP_DB . "<br>";
            echo "DB_USERNAME=" . APP_USER . "<br>";
            echo "DB_PASSWORD=" . APP_PASS . "<br>";
            echo "</div>";
            echo "<br><strong>🚀 Ya puedes probar el login</strong>";
            echo "</div>";

            echo "<div style='text-align: center; margin-top: 20px;'>";
            echo "<a href='gastos/login.html' class='btn'>🔐 Ir al Login</a>";
            echo "</div>";

        } else {
            echo "<div class='result error' style='margin-top: 30px;'>";
            echo "<strong>❌ Algo salió mal</strong><br>";
            echo "Revisa los errores arriba y comparte los resultados.";
            echo "</div>";

            echo "<div style='text-align: center; margin-top: 20px;'>";
            echo "<a href='diagnose-mysql.php' class='btn btn-secondary'>🔍 Volver a Diagnóstico</a>";
            echo "</div>";
        }
        ?>

    </div>
</body>
</html>
