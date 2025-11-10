<?php
// ====================================================
// ARCHIVO DE PRUEBA - Verificar que PHP funciona
// Archivo: gastos/api/test.php
// Acceder: http://localhost/symbiot/symbiot_finance_manager/gastos/api/test.php
// ====================================================

header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'status' => 'OK',
    'message' => 'PHP está funcionando correctamente',
    'timestamp' => date('c'),
    'php_version' => phpversion(),
    'server_info' => [
        'request_uri' => $_SERVER['REQUEST_URI'],
        'script_name' => $_SERVER['SCRIPT_NAME'],
        'script_filename' => $_SERVER['SCRIPT_FILENAME'],
        'document_root' => $_SERVER['DOCUMENT_ROOT'],
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'pwd' => getcwd()
    ],
    'paths' => [
        'main_api' => realpath(__DIR__ . '/../../api/index.php'),
        'database_config' => realpath(__DIR__ . '/../../api/config/database.php'),
        'auth_controller' => realpath(__DIR__ . '/../../api/controllers/AuthController.php')
    ]
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
