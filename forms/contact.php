<?php
/**
 * ====================================================
 * FORMULARIO DE CONTACTO - SYMBIOT TECHNOLOGIES
 * Archivo: forms/contact.php
 * 
 * Procesa y envía emails del formulario de contacto
 * Compatible con PHP 7.3+
 * ====================================================
 */

// Configuración
$receiving_email_address = 'contacto@symbiot.com.mx'; // ⚠️ CAMBIAR por tu email real
$from_name = 'Formulario Web Symbiot';
$from_email = 'contacto@symbiot.com.mx'; // ⚠️ CAMBIAR por un email válido de tu dominio

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

// Obtener datos del formulario
$name = isset($_POST['name']) ? clean_input($_POST['name']) : '';
$email = isset($_POST['email']) ? clean_input($_POST['email']) : '';
$subject = isset($_POST['subject']) ? clean_input($_POST['subject']) : '';
$message = isset($_POST['message']) ? clean_input($_POST['message']) : '';

// Array de errores
$errors = [];

// Validaciones
if (empty($name)) {
    $errors[] = 'El nombre es requerido';
}

if (empty($email)) {
    $errors[] = 'El email es requerido';
} elseif (!validate_email($email)) {
    $errors[] = 'El email no es válido';
}

if (empty($subject)) {
    $errors[] = 'El asunto es requerido';
}

if (empty($message)) {
    $errors[] = 'El mensaje es requerido';
} elseif (strlen($message) < 10) {
    $errors[] = 'El mensaje debe tener al menos 10 caracteres';
}

// Si hay errores, retornar
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => implode(', ', $errors)
    ]);
    exit;
}

// Protección anti-spam simple
$honeypot = isset($_POST['website']) ? $_POST['website'] : '';
if (!empty($honeypot)) {
    // Es un bot, simular éxito pero no enviar
    echo json_encode([
        'success' => true,
        'message' => 'Mensaje enviado correctamente'
    ]);
    exit;
}

// Rate limiting básico por IP
session_start();
$ip = $_SERVER['REMOTE_ADDR'];
$current_time = time();
$rate_limit_time = 60; // 1 minuto entre envíos
$rate_limit_key = 'contact_form_' . md5($ip);

if (isset($_SESSION[$rate_limit_key])) {
    $last_submit = $_SESSION[$rate_limit_key];
    if (($current_time - $last_submit) < $rate_limit_time) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error' => 'Por favor espera un momento antes de enviar otro mensaje'
        ]);
        exit;
    }
}

// Actualizar timestamp
$_SESSION[$rate_limit_key] = $current_time;

// Preparar el email
$email_subject = "[Contacto Web] " . $subject;

$email_body = "Has recibido un nuevo mensaje desde el formulario de contacto de Symbiot Technologies.\n\n";
$email_body .= "=================================================\n\n";
$email_body .= "DATOS DEL REMITENTE:\n";
$email_body .= "Nombre: " . $name . "\n";
$email_body .= "Email: " . $email . "\n";
$email_body .= "Asunto: " . $subject . "\n\n";
$email_body .= "=================================================\n\n";
$email_body .= "MENSAJE:\n\n";
$email_body .= $message . "\n\n";
$email_body .= "=================================================\n\n";
$email_body .= "Información adicional:\n";
$email_body .= "IP: " . $ip . "\n";
$email_body .= "Fecha: " . date('Y-m-d H:i:s') . "\n";
$email_body .= "User Agent: " . $_SERVER['HTTP_USER_AGENT'] . "\n";

// Headers del email
$headers = array();
$headers[] = "From: " . $from_name . " <" . $from_email . ">";
$headers[] = "Reply-To: " . $name . " <" . $email . ">";
$headers[] = "X-Mailer: PHP/" . phpversion();
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-Type: text/plain; charset=UTF-8";

// Intentar enviar el email
$mail_sent = @mail($receiving_email_address, $email_subject, $email_body, implode("\r\n", $headers));

if ($mail_sent) {
    // Email enviado exitosamente
    
    // Log opcional (comentar en producción)
    error_log("✅ Email de contacto enviado desde: " . $email);
    
    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Tu mensaje ha sido enviado exitosamente. Te contactaremos pronto.'
    ]);
} else {
    // Error al enviar
    error_log("❌ Error enviando email de contacto desde: " . $email);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Hubo un error al enviar tu mensaje. Por favor intenta de nuevo o contáctanos directamente a info@symbiot.com.mx'
    ]);
}

// Cerrar sesión
session_write_close();
?>