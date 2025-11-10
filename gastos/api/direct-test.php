<?php
// ====================================================
// ARCHIVO DE PRUEBA DIRECTO - Sin .htaccess
// Archivo: gastos/api/direct-test.php
// Acceder: http://localhost/symbiot/symbiot_finance_manager/gastos/api/direct-test.php?action=health
// ====================================================

// Headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Cambiar al directorio raíz
chdir(__DIR__ . '/../..');

// Cargar configuración
require_once __DIR__ . '/../../api/config/database.php';

// Obtener la acción
$action = $_GET['action'] ?? 'info';

try {
    switch ($action) {
        case 'health':
            $dbStatus = testConnection();

            $tablesStatus = false;
            if ($dbStatus) {
                try {
                    $result = executeQuery('SELECT COUNT(*) as total FROM transacciones LIMIT 1');
                    $tablesStatus = true;
                } catch (Exception $e) {
                    $tablesStatus = false;
                }
            }

            echo json_encode([
                'status' => 'OK',
                'timestamp' => date('c'),
                'version' => '2.0.0-PHP',
                'services' => [
                    'database' => $dbStatus ? 'connected' : 'disconnected',
                    'tables' => $tablesStatus ? 'ready' : 'not_ready'
                ]
            ], JSON_PRETTY_PRINT);
            break;

        case 'info':
        default:
            echo json_encode([
                'status' => 'OK',
                'message' => 'API de prueba funcionando',
                'actions' => [
                    'health' => '?action=health',
                    'info' => '?action=info'
                ],
                'php_version' => phpversion(),
                'request_uri' => $_SERVER['REQUEST_URI'],
                'script_name' => $_SERVER['SCRIPT_NAME']
            ], JSON_PRETTY_PRINT);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'ERROR',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_PRETTY_PRINT);
}
