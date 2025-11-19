<?php
/**
 * Clase Session
 * Manejo de sesiones PHP
 */

class Session {
    private static $started = false;

    public static function start() {
        if (!self::$started && session_status() === PHP_SESSION_NONE) {
            session_start();
            self::$started = true;
            error_log("✅ Session: Sesión iniciada");
        }
    }

    public static function set($key, $value) {
        self::start();
        $_SESSION[$key] = $value;
    }

    public static function get($key, $default = null) {
        self::start();
        return $_SESSION[$key] ?? $default;
    }

    public static function has($key) {
        self::start();
        return isset($_SESSION[$key]);
    }

    public static function remove($key) {
        self::start();
        if (isset($_SESSION[$key])) {
            unset($_SESSION[$key]);
        }
    }

    public static function destroy() {
        self::start();
        session_destroy();
        self::$started = false;
        error_log("✅ Session: Sesión destruida");
    }

    public static function regenerate() {
        self::start();
        session_regenerate_id(true);
    }
}
