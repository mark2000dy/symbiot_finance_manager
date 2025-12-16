<?php
/**
 * Clase Session
 * Manejo de sesiones PHP
 * Compatible con Plesk PHP 8.1.33 y AppServ 9.3.0
 */

class Session {
    private static $started = false;

    /**
     * Configurar parámetros de sesión para compatibilidad con Plesk y AppServ
     */
    private static function configure() {
        // Configuración de sesión compatible con Plesk y AppServ
        ini_set('session.cookie_httponly', '1');
        ini_set('session.use_only_cookies', '1');
        ini_set('session.cookie_samesite', 'Lax');

        // Tiempo de vida de la sesión: 24 horas
        ini_set('session.gc_maxlifetime', '86400');
        ini_set('session.cookie_lifetime', '86400');

        // Nombre de sesión personalizado
        session_name('SYMBIOT_SESSION');

        // Configurar path de cookies para que funcione con subdirectorios
        $cookie_path = '/';

        // Detectar si estamos en subdirectorio
        $script_name = $_SERVER['SCRIPT_NAME'] ?? '';
        if (strpos($script_name, '/gastos/') !== false) {
            // Extraer el path hasta /gastos
            $parts = explode('/gastos/', $script_name);
            $cookie_path = $parts[0] . '/gastos';
        }

        session_set_cookie_params([
            'lifetime' => 86400,
            'path' => $cookie_path,
            'domain' => '',
            'secure' => false, // Cambiar a true en producción con HTTPS
            'httponly' => true,
            'samesite' => 'Lax'
        ]);

        error_log("🔧 Session configurada - Cookie path: {$cookie_path}");
    }

    public static function start() {
        if (!self::$started && session_status() === PHP_SESSION_NONE) {
            // Configurar antes de iniciar
            self::configure();

            // Iniciar sesión
            session_start();
            self::$started = true;

            $session_id = session_id();
            error_log("✅ Session: Sesión iniciada - ID: {$session_id}");
            error_log("📦 Session data: " . json_encode($_SESSION));
        }
    }

    public static function set($key, $value) {
        self::start();
        $_SESSION[$key] = $value;
        error_log("💾 Session set: {$key} = " . json_encode($value));
    }

    public static function get($key, $default = null) {
        self::start();
        $value = $_SESSION[$key] ?? $default;
        error_log("📖 Session get: {$key} = " . json_encode($value));
        return $value;
    }

    public static function has($key) {
        self::start();
        return isset($_SESSION[$key]);
    }

    public static function remove($key) {
        self::start();
        if (isset($_SESSION[$key])) {
            unset($_SESSION[$key]);
            error_log("🗑️ Session removed: {$key}");
        }
    }

    public static function destroy() {
        self::start();

        // Limpiar variables de sesión
        $_SESSION = [];

        // Eliminar cookie de sesión
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }

        // Destruir sesión
        session_destroy();
        self::$started = false;
        error_log("✅ Session: Sesión destruida completamente");
    }

    public static function regenerate() {
        self::start();
        session_regenerate_id(true);
        error_log("🔄 Session: ID regenerado");
    }

    /**
     * Obtener información de debug de la sesión
     */
    public static function debug() {
        self::start();
        return [
            'session_id' => session_id(),
            'session_name' => session_name(),
            'session_status' => session_status(),
            'cookie_params' => session_get_cookie_params(),
            'session_data' => $_SESSION,
            'started' => self::$started
        ];
    }
}
