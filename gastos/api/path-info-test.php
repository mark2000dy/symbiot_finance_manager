<?php
/**
 * Script de Prueba de PATH_INFO
 * Verificar que Apache está pasando correctamente el PATH_INFO
 *
 * Probar accediendo a:
 * /gastos/api/path-info-test.php/hello/world
 */

header('Content-Type: application/json; charset=UTF-8');

$result = [
    'test' => 'PATH_INFO Configuration Test',
    'instructions' => 'Accede a esta URL con /hello/world al final para probar',
    'example_url' => '/gastos/api/path-info-test.php/hello/world',
    'server_vars' => [
        'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? 'NOT SET',
        'SCRIPT_NAME' => $_SERVER['SCRIPT_NAME'] ?? 'NOT SET',
        'PATH_INFO' => $_SERVER['PATH_INFO'] ?? 'NOT SET',
        'QUERY_STRING' => $_SERVER['QUERY_STRING'] ?? 'NOT SET',
        'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'] ?? 'NOT SET',
        'SCRIPT_FILENAME' => $_SERVER['SCRIPT_FILENAME'] ?? 'NOT SET',
    ],
    'analysis' => []
];

// Análisis
if (!isset($_SERVER['PATH_INFO']) || empty($_SERVER['PATH_INFO'])) {
    $result['analysis'][] = [
        'status' => 'WARNING',
        'message' => 'PATH_INFO no está configurado. Apache puede necesitar AcceptPathInfo On en .htaccess'
    ];
    $result['overall_status'] = 'NEEDS_CONFIGURATION';
} else {
    $result['analysis'][] = [
        'status' => 'SUCCESS',
        'message' => 'PATH_INFO está funcionando correctamente',
        'path_info_value' => $_SERVER['PATH_INFO']
    ];
    $result['overall_status'] = 'OK';
}

// Verificar si .htaccess existe
$htaccess_path = __DIR__ . '/.htaccess';
if (file_exists($htaccess_path)) {
    $result['htaccess'] = [
        'exists' => true,
        'path' => $htaccess_path,
        'size' => filesize($htaccess_path) . ' bytes'
    ];
} else {
    $result['htaccess'] = [
        'exists' => false,
        'message' => 'Archivo .htaccess no existe en /gastos/api/'
    ];
    $result['analysis'][] = [
        'status' => 'WARNING',
        'message' => 'Se recomienda crear .htaccess con AcceptPathInfo On'
    ];
}

// Verificar mod_rewrite
if (function_exists('apache_get_modules')) {
    $modules = apache_get_modules();
    $result['apache_modules'] = [
        'mod_rewrite' => in_array('mod_rewrite', $modules),
        'mod_headers' => in_array('mod_headers', $modules),
    ];
} else {
    $result['apache_modules'] = 'Cannot detect (function apache_get_modules not available)';
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
