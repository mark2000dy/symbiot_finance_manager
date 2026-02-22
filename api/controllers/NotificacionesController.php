<?php
// ====================================================
// CONTROLADOR DE NOTIFICACIONES
// Version: 1.2.0  — leídas expiran en 24 hrs
// Archivo: api/controllers/NotificacionesController.php
// ====================================================

define('NOTIF_EXPIRY_HOURS', 24);

// Fuente de verdad: mismo mapa que MAESTRO_EMAIL_MAP en maestros-init.js
// Hugo (hvazquez, id=1) incluido: es maestro y coordinador
define('MAESTRO_EMAIL_MAP', [
    'hvazquez@rockstarskull.com'   => 1,
    'jolvera@rockstarskull.com'    => 2,
    'dandrade@rockstarskull.com'   => 3,
    'ihernandez@rockstarskull.com' => 4,
    'nperez@rockstarskull.com'     => 5,
    'lblanquet@rockstarskull.com'  => 6,
    'mreyes@rockstarskull.com'     => 7,
    'hlopez@rockstarskull.com'     => 8,
]);

class NotificacionesController {

    /**
     * Crear una notificación (uso interno desde otros controladores).
     * $maestro_id = null → notificación general de admin/empresa
     * $maestro_id = int  → notificación personal para ese maestro
     * Silencia errores para no afectar la operación principal.
     */
    public static function crearNotificacion($tipo, $mensaje, $empresa_id, $maestro_id = null) {
        try {
            executeQuery(
                "INSERT INTO notificaciones (tipo, mensaje, empresa_id, maestro_id) VALUES (?, ?, ?, ?)",
                [$tipo, (string)$mensaje, (int)$empresa_id, $maestro_id !== null ? (int)$maestro_id : null]
            );
            error_log("🔔 Notificación creada [$tipo]: $mensaje");
        } catch (Exception $e) {
            error_log("⚠️ [Notificaciones] No se pudo crear notificación: " . $e->getMessage());
        }
    }

    /**
     * GET /notificaciones
     * Maestro → filtra por su maestro_id (detectado por email en sesión)
     * Admin   → filtra por empresa_id, excluye notificaciones de maestros
     */
    public static function getNotificaciones() {
        $user = AuthController::requireAuth();

        try {
            $email  = $user['email'];
            // portal=maestro lo envía notifications.js cuando estamos en maestros.html
            $portal = $_GET['portal'] ?? 'admin';
            $maestroMap = MAESTRO_EMAIL_MAP;

            $esMaestroPortal = $portal === 'maestro' && array_key_exists($email, $maestroMap);

            if ($esMaestroPortal) {
                // Maestro viendo su portal: solo sus notificaciones personales
                $maestroId = $maestroMap[$email];

                // Limpiar leídas expiradas
                executeQuery(
                    "DELETE FROM notificaciones WHERE maestro_id = ? AND leida = 1 AND created_at < NOW() - INTERVAL ? HOUR",
                    [$maestroId, NOTIF_EXPIRY_HOURS]
                );

                $rows = executeQuery(
                    "SELECT id, tipo, mensaje, leida, created_at
                     FROM notificaciones
                     WHERE maestro_id = ?
                       AND (leida = 0 OR created_at >= NOW() - INTERVAL ? HOUR)
                     ORDER BY created_at DESC
                     LIMIT 50",
                    [$maestroId, NOTIF_EXPIRY_HOURS]
                );
            } else {
                // Admin / coordinador / cualquier usuario en página de admin
                $empresa_id = (int)($_GET['empresa_id'] ?? 0);
                if ($empresa_id <= 0) $empresa_id = 1;

                // Limpiar leídas expiradas
                executeQuery(
                    "DELETE FROM notificaciones WHERE empresa_id = ? AND maestro_id IS NULL AND leida = 1 AND created_at < NOW() - INTERVAL ? HOUR",
                    [$empresa_id, NOTIF_EXPIRY_HOURS]
                );

                $rows = executeQuery(
                    "SELECT id, tipo, mensaje, leida, created_at
                     FROM notificaciones
                     WHERE empresa_id = ? AND maestro_id IS NULL
                       AND (leida = 0 OR created_at >= NOW() - INTERVAL ? HOUR)
                     ORDER BY created_at DESC
                     LIMIT 50",
                    [$empresa_id, NOTIF_EXPIRY_HOURS]
                );
            }

            foreach ($rows as &$row) {
                $row['leida'] = (bool)$row['leida'];
            }
            unset($row);

            $unread = count(array_filter($rows, function($r) { return !$r['leida']; }));

            echo json_encode([
                'success' => true,
                'data'    => $rows,
                'unread'  => $unread
            ]);

        } catch (Exception $e) {
            error_log("Error obteniendo notificaciones: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error interno del servidor']);
        }
    }

    /**
     * PUT /notificaciones/{id}/leida
     * Marca una notificación como leída/descartada.
     */
    public static function marcarLeida($id) {
        AuthController::requireAuth();

        try {
            executeQuery(
                "UPDATE notificaciones SET leida = 1 WHERE id = ?",
                [(int)$id]
            );
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            error_log("Error marcando notificación como leída: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error interno del servidor']);
        }
    }
}
