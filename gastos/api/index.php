<?php
// ====================================================
// PROXY/ROUTER - Redirige a api/index.php principal
// Archivo: gastos/api/index.php
// ====================================================

// Deshabilitar output buffering para ver errores inmediatamente
if (ob_get_level()) {
    ob_end_clean();
}

// Cambiar al directorio raíz del proyecto para rutas relativas
chdir(__DIR__ . '/../..');

// Verificar que el archivo principal existe
$mainApiFile = __DIR__ . '/../../api/index.php';
if (!file_exists($mainApiFile)) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'API principal no encontrada',
        'path' => $mainApiFile,
        'cwd' => getcwd()
    ]);
    exit;
}

// Incluir el archivo principal de la API
require_once $mainApiFile;
