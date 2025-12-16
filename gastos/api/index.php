<?php
/**
 * API Proxy - Sistema de Gastos Symbiot
 * Version: 3.2.0 - Proxy to Main API
 *
 * Este archivo actúa como proxy, redirigiendo todas las llamadas
 * a la API principal ubicada en /api/index.php (raíz del proyecto)
 *
 * Compatible con Plesk PHP 8.1.33 y AppServ 9.3.0
 */

// Desactivar output buffering
if (ob_get_level()) ob_end_clean();

// Configuracion de errores
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Headers CORS y JSON
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Log de request
$request_uri = $_SERVER['REQUEST_URI'] ?? '';
$path_info = $_SERVER['PATH_INFO'] ?? '';
$request_method = $_SERVER['REQUEST_METHOD'];

error_log("🔄 PROXY: {$request_method} {$request_uri}");

// ==========================================
// REDIRIGIR A API PRINCIPAL
// ==========================================

// Ruta a la API principal (dos niveles arriba: gastos/api -> raíz)
$main_api_path = dirname(dirname(__DIR__)) . '/api/index.php';

if (!file_exists($main_api_path)) {
    error_log("❌ API principal no encontrada en: {$main_api_path}");
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'API principal no disponible',
        'debug' => [
            'expected_path' => $main_api_path,
            'current_file' => __FILE__
        ]
    ]);
    exit;
}

// Extraer el endpoint de la ruta
$endpoint = '';
if ($path_info) {
    $endpoint = trim($path_info, '/');
} else {
    // Intentar extraer de request_uri
    $uri_parts = explode('?', $request_uri);
    $path = $uri_parts[0];

    // Remover /gastos/api/index.php/ de la ruta
    $path = preg_replace('#^.*/api/index\.php/#', '', $path);
    $endpoint = trim($path, '/');
}

error_log("🎯 Endpoint detectado: {$endpoint}");
error_log("📂 Redirigiendo a API principal: {$main_api_path}");

// Simular el PATH_INFO para la API principal
$_SERVER['PATH_INFO'] = '/' . $endpoint;
$_SERVER['ORIG_PATH_INFO'] = '/' . $endpoint;

// Incluir la API principal - esto ejecutará el código y responderá
require_once $main_api_path;

// El código de arriba ya habrá enviado la respuesta y hecho exit
// Si llegamos aquí, algo salió mal
error_log("⚠️ La API principal no envió respuesta");
http_response_code(500);
echo json_encode([
    'success' => false,
    'error' => 'Error procesando solicitud en API principal'
]);
?>
