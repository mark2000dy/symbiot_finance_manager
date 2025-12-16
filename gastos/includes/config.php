<?php
/**
 * Configuración de Base de Datos
 * Sistema de Gastos Symbiot
 *
 * Este archivo define las constantes de conexión a la base de datos
 */

// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'gastos_app_db');
define('DB_USER', 'gastos_user');
define('DB_PASS', 'Gastos2025!');

// Configuración adicional
define('DB_CHARSET', 'utf8mb4');

// Timezone
date_default_timezone_set('America/Mexico_City');

// Configuración de errores (solo para desarrollo)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Cambiar a 1 para ver errores en pantalla durante debugging
ini_set('log_errors', 1);
