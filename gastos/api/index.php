<?php
/**
 * API Principal - Sistema de Gastos Symbiot
 * Version: 3.1.0
 * Compatible con Plesk PHP 8.1.33
 */

// Desactivar output buffering
if (ob_get_level()) ob_end_clean();

// Configuracion de errores (solo para debugging - comentar en produccion)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Cambiar a 0 en produccion
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

// Rutas base
define('API_ROOT', __DIR__);
define('APP_ROOT', dirname(__DIR__));

// Capturar la ruta solicitada
$request_uri = $_SERVER['REQUEST_URI'] ?? '';
$path_info = $_SERVER['PATH_INFO'] ?? '';
$request_method = $_SERVER['REQUEST_METHOD'];

// Log de request
error_log("API Request: {$request_method} {$request_uri}");

// ==========================================
// HEALTH CHECK ENDPOINT
// ==========================================
if (strpos($request_uri, '/health') !== false || $path_info === '/health') {
    echo json_encode([
        'success' => true,
        'message' => 'API funcionando correctamente',
        'version' => '3.1.0',
        'timestamp' => date('Y-m-d H:i:s'),
        'environment' => [
            'php_version' => PHP_VERSION,
            'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            'api_root' => API_ROOT,
            'app_root' => APP_ROOT
        ],
        'debug' => [
            'request_uri' => $request_uri,
            'path_info' => $path_info,
            'request_method' => $request_method
        ]
    ]);
    exit;
}

// ==========================================
// CARGAR CONFIGURACION
// ==========================================

// Verificar si existe archivo de configuracion
$config_file = APP_ROOT . '/includes/config.php';
if (file_exists($config_file)) {
    require_once $config_file;
} else {
    // Configuracion por defecto si no existe el archivo
    define('DB_HOST', 'localhost');
    define('DB_PORT', '3306');
    define('DB_NAME', 'gastos_app_db');
    define('DB_USER', 'gastos_user');
    define('DB_PASS', 'Gastos2025!');
}

// ==========================================
// CARGAR CLASES NECESARIAS
// ==========================================

// Database class
$db_class = APP_ROOT . '/includes/Database.php';
if (file_exists($db_class)) {
    require_once $db_class;
}

// Session class
$session_class = APP_ROOT . '/includes/Session.php';
if (file_exists($session_class)) {
    require_once $session_class;
}

// ==========================================
// FUNCION DE RESPUESTA JSON
// ==========================================
function sendResponse($data, $status_code = 200) {
    http_response_code($status_code);
    echo json_encode($data);
    exit;
}

function sendError($message, $status_code = 400, $details = null) {
    $response = [
        'success' => false,
        'error' => $message
    ];
    
    if ($details !== null) {
        $response['details'] = $details;
    }
    
    sendResponse($response, $status_code);
}

// ==========================================
// PARSEAR RUTA
// ==========================================

// Extraer endpoint de la ruta
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

error_log("Endpoint detectado: {$endpoint}");

// ==========================================
// ROUTER
// ==========================================

// Si no hay endpoint, mostrar info de la API
if (empty($endpoint)) {
    sendResponse([
        'success' => true,
        'message' => 'API Sistema de Gastos Symbiot',
        'version' => '3.1.0',
        'endpoints' => [
            'health' => 'GET /health - Estado de la API',
            'login' => 'POST /login - Iniciar sesion',
            'logout' => 'POST /logout - Cerrar sesion',
            'auth/check' => 'GET /auth/check - Verificar sesion'
        ]
    ]);
}

// ==========================================
// ENDPOINT: LOGIN
// ==========================================
if ($endpoint === 'login' && $request_method === 'POST') {
    // Obtener datos del POST
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // Log para debugging
    error_log("Login attempt - Raw input: " . $input);
    error_log("Login attempt - Parsed data: " . print_r($data, true));

    // Aceptar tanto 'username' como 'email' para flexibilidad
    $username = $data['username'] ?? $data['email'] ?? '';
    $password = $data['password'] ?? '';

    // Log de campos recibidos
    error_log("Username/Email recibido: " . $username);
    error_log("Password recibido: " . (empty($password) ? 'VACIO' : 'PRESENTE'));
    
    // Validaciones basicas
    if (empty($username) || empty($password)) {
        sendError('Usuario y contrasena son requeridos', 400);
    }
    
    try {
        // Conectar a base de datos
        $db = new PDO(
            "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]
        );
        
        error_log("BD Conectada correctamente");
        
        // Buscar usuario por email o username
        $stmt = $db->prepare("
            SELECT id, username, email, nombre, empresa, rol, password_hash, activo 
            FROM usuarios 
            WHERE (email = :username OR username = :username) AND activo = 1
            LIMIT 1
        ");
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch();
        
        error_log("Usuario encontrado: " . ($user ? 'SI' : 'NO'));
        
        // Verificar que existe y password es correcto
        if ($user) {
            error_log("Verificando password...");
            $password_valid = password_verify($password, $user['password_hash']);
            error_log("Password valido: " . ($password_valid ? 'SI' : 'NO'));
            
            if ($password_valid) {
                // Generar token
                $token = bin2hex(random_bytes(32));
                
                error_log("Login exitoso para: " . $user['email']);
                
                // Iniciar sesion
                if (class_exists('Session')) {
                    Session::start();
                    Session::set('user_id', $user['id']);
                    Session::set('username', $user['username']);
                    Session::set('email', $user['email']);
                    Session::set('nombre', $user['nombre']);
                    Session::set('empresa', $user['empresa']);
                    Session::set('rol', $user['rol']);
                    Session::set('auth_token', $token);
                }
                
                sendResponse([
                    'success' => true,
                    'message' => 'Login exitoso',
                    'token' => $token,
                    'user' => [
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'email' => $user['email'],
                        'nombre' => $user['nombre'],
                        'empresa' => $user['empresa'],
                        'rol' => $user['rol']
                    ]
                ]);
            }
        }
        
        // Si llegamos aqui, las credenciales son incorrectas
        error_log("Credenciales incorrectas para: " . $username);
        sendError('Usuario o contrasena incorrectos', 401);
        
    } catch (PDOException $e) {
        error_log("Error de BD en login: " . $e->getMessage());
        sendError('Error de conexion a la base de datos', 500);
    } catch (Exception $e) {
        error_log("Error en login: " . $e->getMessage());
        sendError('Error al procesar login', 500);
    }
}

// ==========================================
// ENDPOINT: LOGOUT
// ==========================================
if ($endpoint === 'logout' && $request_method === 'POST') {
    try {
        if (class_exists('Session')) {
            Session::destroy();
        }
        
        sendResponse([
            'success' => true,
            'message' => 'Logout exitoso'
        ]);
        
    } catch (Exception $e) {
        error_log("Error en logout: " . $e->getMessage());
        sendError('Error al procesar logout', 500);
    }
}

// ==========================================
// ENDPOINT: CHECK AUTH
// ==========================================
if ($endpoint === 'auth/check' && $request_method === 'GET') {
    try {
        $isAuthenticated = false;
        $user = null;
        
        if (class_exists('Session')) {
            Session::start();
            $user_id = Session::get('user_id');
            
            if ($user_id) {
                $isAuthenticated = true;
                $user = [
                    'id' => $user_id,
                    'username' => Session::get('username')
                ];
            }
        }
        
        sendResponse([
            'success' => true,
            'authenticated' => $isAuthenticated,
            'user' => $user
        ]);
        
    } catch (Exception $e) {
        error_log("Error en auth/check: " . $e->getMessage());
        sendError('Error al verificar autenticacion', 500);
    }
}

// ==========================================
// ENDPOINT NO ENCONTRADO
// ==========================================
sendError("Endpoint no encontrado: {$endpoint}", 404);
?>
