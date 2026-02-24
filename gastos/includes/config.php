<?php
/**
 * Configuración de Base de Datos
 * Sistema de Gastos Symbiot
 *
 * Este archivo define las constantes de conexión a la base de datos
 */

// Configuración de la base de datos (credenciales desde .env, parser propio para soportar caracteres especiales)
$_envVars = [];
$_envFile = __DIR__ . '/../../.env';
if (file_exists($_envFile)) {
    foreach (file($_envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $_line) {
        if ($_line[0] === '#' || strpos($_line, '=') === false) continue;
        [$_k, $_v] = explode('=', $_line, 2);
        $_envVars[trim($_k)] = trim($_v);
    }
}

define('DB_HOST', $_envVars['DB_HOST'] ?? 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', $_envVars['DB_DATABASE'] ?? 'gastos_app_db');
define('DB_USER', $_envVars['DB_USERNAME'] ?? '');
define('DB_PASS', $_envVars['DB_PASSWORD'] ?? '');

unset($_envFile, $_envVars, $_line, $_k, $_v);

// Configuración adicional
define('DB_CHARSET', 'utf8mb4');

// Timezone
date_default_timezone_set('America/Mexico_City');

// Configuración de errores (solo para desarrollo)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Cambiar a 1 para ver errores en pantalla durante debugging
ini_set('log_errors', 1);
