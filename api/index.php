<?php
// ====================================================
// SERVIDOR API PRINCIPAL - GASTOS SYMBIOT APP (PHP VERSION)
// Version: 3.1 - Fixed Proxy Routing
// Archivo: api/index.php
// Última modificación: 2024-11-10
// ====================================================

// Iniciar sesión
session_start();

// Headers CORS y JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Cargar configuración
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/TransaccionesController.php';

// Obtener la URI y método
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remover query string
$requestUri = strtok($requestUri, '?');

// Detectar la ruta base automáticamente
$scriptName = dirname($_SERVER['SCRIPT_NAME']);
$basePath = str_replace('\\', '/', $scriptName);

// Remover la ruta base para obtener solo la ruta relativa
if (strpos($requestUri, $basePath) === 0) {
    $requestUri = substr($requestUri, strlen($basePath));
}

// Remover /gastos/api o /api del path para normalizar
$requestUri = preg_replace('#^/(gastos/)?api#', '', $requestUri);

// 🔧 Remover /index.php si está presente (cuando se accede vía proxy gastos/api/index.php)
$requestUri = preg_replace('#^/index\.php#', '', $requestUri);

// Asegurar que empiece con /
if (empty($requestUri) || $requestUri[0] !== '/') {
    $requestUri = '/' . $requestUri;
}

// Log de request con debugging detallado
error_log("========== API REQUEST v3.1 ==========");
error_log("SCRIPT_NAME: " . $_SERVER['SCRIPT_NAME']);
error_log("REQUEST_URI original: " . $_SERVER['REQUEST_URI']);
error_log("Base Path detectado: $basePath");
error_log("URI parseada final: $requestUri");
error_log("Método: $requestMethod");
error_log("=====================================");

try {
    // ============================================================
    // RUTAS DE AUTENTICACIÓN
    // ============================================================
    if ($requestUri === '/login' && $requestMethod === 'POST') {
        AuthController::login();
        exit;
    }

    if ($requestUri === '/logout' && $requestMethod === 'POST') {
        AuthController::logout();
        exit;
    }

    if ($requestUri === '/user' && $requestMethod === 'GET') {
        AuthController::getCurrentUser();
        exit;
    }

    // ============================================================
    // HEALTH CHECK
    // ============================================================
    if ($requestUri === '/health' && $requestMethod === 'GET') {
        $dbStatus = testConnection();

        $tablesStatus = false;
        if ($dbStatus) {
            try {
                $result = executeQuery('SELECT COUNT(*) as total FROM transacciones LIMIT 1');
                $tablesStatus = true;
                error_log("💾 Transacciones en BD: " . $result[0]['total']);
            } catch (Exception $e) {
                error_log("⚠️ Tabla transacciones no accesible: " . $e->getMessage());
            }
        }

        echo json_encode([
            'status' => 'OK',
            'timestamp' => date('c'),
            'environment' => getenv('ENV') ?: 'production',
            'version' => '2.0.0-PHP',
            'services' => [
                'database' => $dbStatus ? 'connected' : 'disconnected',
                'tables' => $tablesStatus ? 'ready' : 'not_ready'
            ],
            'endpoints' => [
                'login' => '/gastos/api/login',
                'gastos' => '/gastos/api/gastos',
                'ingresos' => '/gastos/api/ingresos',
                'transacciones' => '/gastos/api/transacciones',
                'resumen' => '/gastos/api/transacciones/resumen',
                'dashboard' => '/gastos/api/dashboard'
            ]
        ]);
        exit;
    }

    // ============================================================
    // RUTAS DE TRANSACCIONES
    // ============================================================
    if (preg_match('#^/transacciones$#', $requestUri)) {
        switch ($requestMethod) {
            case 'GET':
                TransaccionesController::getTransacciones();
                break;
            case 'POST':
                TransaccionesController::createTransaccion();
                break;
            default:
                http_response_code(405);
                echo json_encode(['success' => false, 'error' => 'Método no permitido']);
        }
        exit;
    }

    if (preg_match('#^/transacciones/(\d+)$#', $requestUri, $matches)) {
        $id = $matches[1];
        switch ($requestMethod) {
            case 'PUT':
                TransaccionesController::updateTransaccion($id);
                break;
            case 'DELETE':
                TransaccionesController::deleteTransaccion($id);
                break;
            default:
                http_response_code(405);
                echo json_encode(['success' => false, 'error' => 'Método no permitido']);
        }
        exit;
    }

    if ($requestUri === '/transacciones/resumen' && $requestMethod === 'GET') {
        TransaccionesController::getResumen();
        exit;
    }

    // ============================================================
    // RUTAS DE GASTOS
    // ============================================================
    if ($requestUri === '/gastos' && $requestMethod === 'GET') {
        TransaccionesController::getGastos();
        exit;
    }

    if ($requestUri === '/gastos' && $requestMethod === 'POST') {
        TransaccionesController::createGasto();
        exit;
    }

    // ============================================================
    // RUTAS DE INGRESOS
    // ============================================================
    if ($requestUri === '/ingresos' && $requestMethod === 'GET') {
        TransaccionesController::getIngresos();
        exit;
    }

    if ($requestUri === '/ingresos' && $requestMethod === 'POST') {
        TransaccionesController::createIngreso();
        exit;
    }

    // ============================================================
    // RUTAS DE EMPRESAS
    // ============================================================
    if ($requestUri === '/empresas' && $requestMethod === 'GET') {
        TransaccionesController::getEmpresas();
        exit;
    }

    // ============================================================
    // RUTAS DE ALUMNOS
    // ============================================================
    if ($requestUri === '/alumnos' && $requestMethod === 'GET') {
        TransaccionesController::getAlumnos();
        exit;
    }

    // ============================================================
    // RUTAS DE DASHBOARD
    // ============================================================
    if ($requestUri === '/dashboard' && $requestMethod === 'GET') {
        AuthController::requireAuth();

        $empresa_id = $_GET['empresa_id'] ?? null;
        $periodo = $_GET['periodo'] ?? 12;

        $whereClause = 'WHERE 1=1';
        $params = [];

        if ($empresa_id) {
            $whereClause .= ' AND empresa_id = ?';
            $params[] = $empresa_id;
        }

        $whereClause .= ' AND fecha >= DATE_SUB(NOW(), INTERVAL ? MONTH)';
        $params[] = (int)$periodo;

        $resumenQuery = "
            SELECT
                COUNT(*) as total_transacciones,
                SUM(CASE WHEN tipo = 'I' THEN total ELSE 0 END) as total_ingresos,
                SUM(CASE WHEN tipo = 'G' THEN total ELSE 0 END) as total_gastos,
                COUNT(CASE WHEN tipo = 'I' THEN 1 END) as count_ingresos,
                COUNT(CASE WHEN tipo = 'G' THEN 1 END) as count_gastos
            FROM transacciones $whereClause
        ";

        $resumen = executeQuery($resumenQuery, $params);

        $tendenciaQuery = "
            SELECT
                DATE_FORMAT(fecha, '%Y-%m') as mes,
                DATE_FORMAT(fecha, '%M %Y') as mes_label,
                SUM(CASE WHEN tipo = 'I' THEN total ELSE 0 END) as ingresos,
                SUM(CASE WHEN tipo = 'G' THEN total ELSE 0 END) as gastos,
                COUNT(*) as transacciones
            FROM transacciones $whereClause
            GROUP BY DATE_FORMAT(fecha, '%Y-%m')
            ORDER BY DATE_FORMAT(fecha, '%Y-%m') ASC
        ";

        $tendenciaMensual = executeQuery($tendenciaQuery, $params);

        $totalIngresos = floatval($resumen[0]['total_ingresos'] ?? 0);
        $totalGastos = floatval($resumen[0]['total_gastos'] ?? 0);
        $balance = $totalIngresos - $totalGastos;
        $margenPorcentaje = $totalIngresos > 0
            ? round(($balance / $totalIngresos) * 100)
            : 0;

        echo json_encode([
            'success' => true,
            'data' => [
                'resumen' => [
                    'total_transacciones' => (int)($resumen[0]['total_transacciones'] ?? 0),
                    'total_ingresos' => $totalIngresos,
                    'total_gastos' => $totalGastos,
                    'balance' => $balance,
                    'margen_porcentaje' => $margenPorcentaje,
                    'count_ingresos' => (int)($resumen[0]['count_ingresos'] ?? 0),
                    'count_gastos' => (int)($resumen[0]['count_gastos'] ?? 0)
                ],
                'tendencia_mensual' => $tendenciaMensual,
                'periodo_consultado' => "Últimos $periodo meses"
            ]
        ]);
        exit;
    }

    // ============================================================
    // RUTA NO ENCONTRADA
    // ============================================================
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'Endpoint no encontrado',
        'path' => $requestUri,
        'method' => $requestMethod
    ]);

} catch (Exception $e) {
    error_log("Error no manejado: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error interno del servidor',
        'message' => $e->getMessage()
    ]);
}
