<?php
/**
 * ====================================================
 * FORMULARIO DE CONTACTO - SYMBIOT TECHNOLOGIES
 * Archivo: forms/contact.php
 *
 * Procesa y envía emails usando PHPMailer con SMTP
 * Compatible con PHP 7.3+
 * ====================================================
 */

// Cargar PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/PHPMailer/Exception.php';
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';

// Cargar credenciales SMTP desde archivo de configuración local (no en git)
$smtpConfig = __DIR__ . '/smtp-config.php';
if (!file_exists($smtpConfig)) {
    http_response_code(500);
    error_log("❌ Falta forms/smtp-config.php — copia smtp-config.example.php y configura las credenciales");
    echo 'Error de configuración del servidor';
    exit;
}
require_once $smtpConfig;

// Headers de seguridad
header('Content-Type: text/plain; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo 'Método no permitido';
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

// Obtener datos del formulario (strip \r\n para prevenir inyección de headers)
$name = isset($_POST['name']) ? str_replace(["\r", "\n"], '', clean_input($_POST['name'])) : '';
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
    echo implode(', ', $errors);
    exit;
}

// Protección anti-spam simple (honeypot)
$honeypot = isset($_POST['website']) ? $_POST['website'] : '';
if (!empty($honeypot)) {
    // Es un bot, simular éxito pero no enviar
    echo 'OK';
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
        echo 'Por favor espera un momento antes de enviar otro mensaje';
        exit;
    }
}

// Actualizar timestamp
$_SESSION[$rate_limit_key] = $current_time;

// Preparar el contenido del email
$email_subject = "[Contacto Web] " . $subject;

$email_body = "
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a2e; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #1a1a2e; }
        .message-box { background: white; padding: 15px; border-left: 4px solid #4CAF50; margin-top: 15px; }
        .footer { font-size: 12px; color: #666; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>Nuevo Mensaje de Contacto</h2>
            <p>Symbiot Technologies</p>
        </div>
        <div class='content'>
            <div class='field'>
                <span class='label'>Nombre:</span> {$name}
            </div>
            <div class='field'>
                <span class='label'>Email:</span> <a href='mailto:{$email}'>{$email}</a>
            </div>
            <div class='field'>
                <span class='label'>Asunto:</span> {$subject}
            </div>
            <div class='message-box'>
                <span class='label'>Mensaje:</span><br><br>
                " . nl2br($message) . "
            </div>
            <div class='footer'>
                <strong>Información adicional:</strong><br>
                IP: {$ip}<br>
                Fecha: " . date('Y-m-d H:i:s') . "<br>
                User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'No disponible') . "
            </div>
        </div>
    </div>
</body>
</html>
";

// Enviar usando PHPMailer
try {
    $mail = new PHPMailer(true);

    // Configuración del servidor SMTP
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // SSL para puerto 465
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';

    // Remitente y destinatario
    $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
    $mail->addAddress(RECEIVING_EMAIL);
    $mail->addReplyTo($email, $name);

    // Contenido del email
    $mail->isHTML(true);
    $mail->Subject = $email_subject;
    $mail->Body    = $email_body;
    $mail->AltBody = strip_tags(str_replace(['<br>', '<br/>', '<br />'], "\n", $email_body));

    $mail->send();

    error_log("✅ Email de contacto enviado desde: " . $email);

    // El validate.js de php-email-form espera "OK" como respuesta exitosa
    echo 'OK';

} catch (Exception $e) {
    error_log("❌ Error enviando email: " . $mail->ErrorInfo);

    http_response_code(500);
    // El validate.js muestra directamente este texto como error
    echo 'Hubo un error al enviar tu mensaje. Por favor intenta de nuevo o contáctanos directamente a contacto@symbiot.com.mx';
}

// Cerrar sesión
session_write_close();
?>
