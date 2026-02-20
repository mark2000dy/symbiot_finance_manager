<?php
// 1. Iniciar buffer de salida para atrapar errores antes de generar el PDF
ob_start();

// ACTIVAR REPORTE DE ERRORES (Para solucionar el Error 500)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Aumentar límites para evitar Error 500 por memoria o tiempo
ini_set('memory_limit', '512M');
set_time_limit(300);

// 1. Cargar dependencias y conexión a BD
if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
    die("Error crítico: No se encuentra la carpeta vendor. Ejecuta 'composer install'.");
}
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/api/config/database.php'; // Usar ruta absoluta para evitar fallos

use Dompdf\Dompdf;
use Dompdf\Options;

// 2. Obtener datos reales de la BD
// Usamos la función executeQuery disponible en tu sistema
try {
    $usuarios = executeQuery("SELECT id, nombre, email, rol, empresa, activo FROM usuarios ORDER BY id ASC");
} catch (Exception $e) {
    die("Error de conexión: " . $e->getMessage());
}

// 3. Configurar opciones de Dompdf
$options = new Options();
$options->set('isHtml5ParserEnabled', true);
$options->set('isRemoteEnabled', true); // Permite cargar imágenes (logos)

$dompdf = new Dompdf($options);

// Preparar logo (convertir a Base64 para evitar errores de rutas)
// Asegúrate de que la carpeta sea 'img' o 'images' según tu estructura real
$pathLogo = __DIR__ . '/assets/img/LOGO_CM_R.png'; 
$imgLogo = '';

try {
    if (file_exists($pathLogo)) {
        $type = strtolower(pathinfo($pathLogo, PATHINFO_EXTENSION));
        $data = file_get_contents($pathLogo);
        $base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
        $imgLogo = '<img src="' . $base64 . '" style="max-width: 180px; margin-bottom: 10px;"><br>';
    }
} catch (Exception $e) {
    // Si falla el logo, continuamos sin él para no romper el PDF
    $imgLogo = ''; 
}

// 4. Construir el HTML del reporte
// Usamos los colores institucionales de Symbiot (#dec329)
$html = '
<html>
<head>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; color: #000; }
        .header p { margin: 5px 0; color: #777; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #dec329; color: white; padding: 10px; text-align: left; }
        td { border-bottom: 1px solid #ddd; padding: 8px; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        
        .badge { padding: 3px 8px; border-radius: 10px; color: white; font-size: 10px; }
        .bg-success { background-color: #28a745; }
        .bg-danger { background-color: #dc3545; }
        
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        ' . $imgLogo . '
        <h1>Reporte de Usuarios</h1>
        <p>Symbiot Finance Manager</p>
        <p>Fecha: ' . date('d/m/Y H:i') . '</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Empresa</th>
            </tr>
        </thead>
        <tbody>';

foreach ($usuarios as $user) {
    $html .= '<tr>
        <td>' . $user['id'] . '</td>
        <td>' . htmlspecialchars($user['nombre']) . '</td>
        <td>' . htmlspecialchars($user['email']) . '</td>
        <td>' . htmlspecialchars($user['rol']) . '</td>
        <td>' . htmlspecialchars($user['empresa']) . '</td>
    </tr>';
}

$html .= '</tbody></table>

    <div class="footer">
        Generado automáticamente por el sistema Symbiot
    </div>
</body>
</html>';

// 5. Renderizar y mostrar
try {
    $dompdf->loadHtml($html);
    $dompdf->setPaper('A4', 'portrait');
    $dompdf->render();

    // Verificar si hubo errores de PHP capturados en el buffer
    $output = ob_get_contents();
    ob_end_clean(); // Limpiar el buffer

    if (!empty($output)) {
        // Si hay contenido previo (errores/warnings), mostrarlo como HTML para poder leerlo
        echo "<h1>Error al generar PDF</h1><p>Se detectaron los siguientes errores de PHP:</p><pre style='background:#fdd; padding:10px; border:1px solid #f00;'>" . htmlspecialchars($output) . "</pre>";
        exit;
    }

    // "Attachment" => false hace que se abra en el navegador en lugar de descargar
    $dompdf->stream("reporte_usuarios.pdf", ["Attachment" => false]);
} catch (Throwable $e) {
    die("Error fatal al generar PDF: " . $e->getMessage());
}
?>