<?php
// ====================================================
// PROXY/ROUTER - Redirige a api/index.php principal
// Archivo: gastos/api/index.php
// ====================================================

// Cambiar al directorio raíz del proyecto para rutas relativas
chdir(__DIR__ . '/../..');

// Incluir el archivo principal de la API
require_once __DIR__ . '/../../api/index.php';
