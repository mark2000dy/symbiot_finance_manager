<?php
// Test simple para verificar que PHP funciona
header('Content-Type: application/json');
echo json_encode([
    'status' => 'OK',
    'message' => 'PHP está funcionando correctamente',
    'timestamp' => date('c'),
    'php_version' => phpversion(),
    'request_uri' => $_SERVER['REQUEST_URI'],
    'script_name' => $_SERVER['SCRIPT_NAME']
]);
