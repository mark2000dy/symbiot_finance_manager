<?php
// Test de diagnóstico .htaccess
header('Content-Type: text/plain; charset=utf-8');

echo "=== DIAGNÓSTICO DE ROUTING ===\n\n";

echo "REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'NO DEFINIDO') . "\n";
echo "SCRIPT_NAME: " . ($_SERVER['SCRIPT_NAME'] ?? 'NO DEFINIDO') . "\n";
echo "SCRIPT_FILENAME: " . ($_SERVER['SCRIPT_FILENAME'] ?? 'NO DEFINIDO') . "\n";
echo "PATH_INFO: " . ($_SERVER['PATH_INFO'] ?? 'NO DEFINIDO') . "\n";
echo "DOCUMENT_ROOT: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'NO DEFINIDO') . "\n";
echo "HTTP_HOST: " . ($_SERVER['HTTP_HOST'] ?? 'NO DEFINIDO') . "\n";

echo "\n=== ARCHIVOS .htaccess ===\n\n";

$htaccessRaiz = __DIR__ . '/.htaccess';
echo ".htaccess raíz existe: " . (file_exists($htaccessRaiz) ? "SÍ" : "NO") . "\n";
if (file_exists($htaccessRaiz)) {
    echo "Ubicación: $htaccessRaiz\n";
    echo "Última modificación: " . date('Y-m-d H:i:s', filemtime($htaccessRaiz)) . "\n";
}

echo "\n=== MOD_REWRITE ===\n\n";
if (function_exists('apache_get_modules')) {
    $modules = apache_get_modules();
    echo "mod_rewrite activo: " . (in_array('mod_rewrite', $modules) ? "SÍ" : "NO") . "\n";
} else {
    echo "Función apache_get_modules no disponible\n";
}

echo "\n=== RUTAS DE API ===\n\n";
$apiIndexRaiz = __DIR__ . '/api/index.php';
$apiIndexGastos = __DIR__ . '/gastos/api/index.php';

echo "API raíz (/api/index.php): " . (file_exists($apiIndexRaiz) ? "EXISTE" : "NO EXISTE") . "\n";
echo "API gastos (/gastos/api/index.php): " . (file_exists($apiIndexGastos) ? "EXISTE" : "NO EXISTE") . "\n";

echo "\n=== FIN DIAGNÓSTICO ===\n";
?>
