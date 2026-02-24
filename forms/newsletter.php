<?php
/**
 * ====================================================
 * FORMULARIO DE NEWSLETTER - SYMBIOT TECHNOLOGIES
 * Archivo: forms/newsletter.php
 * 
 * Procesa suscripciones al newsletter
 * Compatible con PHP 7.3+
 * ====================================================
 */

// Configuración
$admin_email = 'info@symbiot.com.mx'; // ⚠️ CAMBIAR por tu email real
$subscribers_file = __DIR__ . '/../data/newsletter_subscribers.txt'; // Archivo para almacenar suscriptores

// Headers de seguridad
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

// Función para limpiar datos
function clean_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

// Función para validar email
function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Obtener email del formulario (strip \r\n para prevenir inyección de headers)
$email = isset($_POST['email']) ? str_replace(["\r", "\n"], '', clean_input($_POST['email'])) : '';

// Validaciones
if (empty($email)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'El email es requerido'
    ]);
    exit;
}

if (!validate_email($email)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'El email no es válido'
    ]);
    exit;
}

// Protección anti-spam
$honeypot = isset($_POST['website']) ? $_POST['website'] : '';
if (!empty($honeypot)) {
    echo json_encode([
        'success' => true,
        'message' => 'Suscripción exitosa'
    ]);
    exit;
}

// Rate limiting básico por IP
session_start();
$ip = $_SERVER['REMOTE_ADDR'];
$current_time = time();
$rate_limit_time = 120; // 2 minutos entre suscripciones
$rate_limit_key = 'newsletter_' . md5($ip);

if (isset($_SESSION[$rate_limit_key])) {
    $last_submit = $_SESSION[$rate_limit_key];
    if (($current_time - $last_submit) < $rate_limit_time) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error' => 'Por favor espera un momento antes de intentar de nuevo'
        ]);
        exit;
    }
}

// Actualizar timestamp
$_SESSION[$rate_limit_key] = $current_time;

// Crear directorio data si no existe
$data_dir = dirname($subscribers_file);
if (!file_exists($data_dir)) {
    mkdir($data_dir, 0755, true);
}

// Verificar si el email ya está suscrito
$is_duplicate = false;
if (file_exists($subscribers_file)) {
    $subscribers = file($subscribers_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($subscribers as $subscriber) {
        $parts = explode('|', $subscriber);
        if (isset($parts[0]) && strtolower(trim($parts[0])) === strtolower($email)) {
            $is_duplicate = true;
            break;
        }
    }
}

if ($is_duplicate) {
    echo json_encode([
        'success' => true,
        'message' => 'Este email ya está suscrito a nuestro newsletter'
    ]);
    exit;
}

// Guardar suscriptor en archivo
$subscriber_data = sprintf(
    "%s|%s|%s|%s\n",
    $email,
    $ip,
    date('Y-m-d H:i:s'),
    $_SERVER['HTTP_USER_AGENT']
);

$save_success = @file_put_contents($subscribers_file, $subscriber_data, FILE_APPEND | LOCK_EX);

if ($save_success === false) {
    error_log("❌ Error guardando suscriptor: " . $email);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al procesar tu suscripción. Por favor intenta de nuevo.'
    ]);
    exit;
}

// Enviar email de notificación al administrador
$email_subject = "[Newsletter] Nueva suscripción";
$email_body = "Nueva suscripción al newsletter de Symbiot Technologies:\n\n";
$email_body .= "Email: " . $email . "\n";
$email_body .= "IP: " . $ip . "\n";
$email_body .= "Fecha: " . date('Y-m-d H:i:s') . "\n";
$email_body .= "User Agent: " . $_SERVER['HTTP_USER_AGENT'] . "\n";

$headers = array();
$headers[] = "From: Newsletter Symbiot <noreply@symbiot.com.mx>";
$headers[] = "Reply-To: " . $email;
$headers[] = "X-Mailer: PHP/" . phpversion();
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-Type: text/plain; charset=UTF-8";

@mail($admin_email, $email_subject, $email_body, implode("\r\n", $headers));

// Opcional: Enviar email de bienvenida al suscriptor
$welcome_subject = "¡Bienvenido al Newsletter de Symbiot Technologies!";
$welcome_body = "Hola,\n\n";
$welcome_body .= "¡Gracias por suscribirte a nuestro newsletter!\n\n";
$welcome_body .= "Recibirás noticias y actualizaciones sobre:\n";
$welcome_body .= "- Internet de las Cosas (IoT)\n";
$welcome_body .= "- Inteligencia Artificial\n";
$welcome_body .= "- Automatización con n8n\n";
$welcome_body .= "- Desarrollo de Hardware y Software\n";
$welcome_body .= "- Proyectos innovadores\n\n";
$welcome_body .= "Si deseas darte de baja, responde a este email con el asunto 'UNSUSCRIBE'.\n\n";
$welcome_body .= "Saludos,\n";
$welcome_body .= "Equipo Symbiot Technologies\n";
$welcome_body .= "www.symbiot.com.mx";

$welcome_headers = array();
$welcome_headers[] = "From: Symbiot Technologies <info@symbiot.com.mx>";
$welcome_headers[] = "Reply-To: info@symbiot.com.mx";
$welcome_headers[] = "X-Mailer: PHP/" . phpversion();
$welcome_headers[] = "MIME-Version: 1.0";
$welcome_headers[] = "Content-Type: text/plain; charset=UTF-8";

@mail($email, $welcome_subject, $welcome_body, implode("\r\n", $welcome_headers));

// Log opcional
error_log("✅ Nueva suscripción al newsletter: " . $email);

// Respuesta exitosa
echo json_encode([
    'success' => true,
    'message' => '¡Gracias por suscribirte! Recibirás nuestras actualizaciones en tu correo.'
]);

// Cerrar sesión
session_write_close();
?>