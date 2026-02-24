<?php
require_once __DIR__ . '/config/GoogleCalendarService.php';

session_start();

if (isset($_GET['code'])) {
    try {
        $service = new GoogleCalendarService();
        if ($service->authenticate($_GET['code'])) {
            // Redirigir de vuelta a la prueba
            header('Location: ../test_calendar.php');
            exit;
        } else {
            echo "Error al autenticar el código.";
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage();
    }
} else {
    echo "No se recibió código de autorización.";
}
?>