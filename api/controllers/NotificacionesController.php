<?php
// ====================================================
// CONTROLADOR DE NOTIFICACIONES
// Version: 1.4.0  — leídas expiran en 24 hrs
//                  — Marco/Antonio ven empresa 1+2
//                  — Hugo (coordinador) ve personales + generales RS
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

// Admins que ven notificaciones de ambas empresas (Rockstar Skull + Symbiot)
define('NOTIF_ADMIN_EMAILS', [
    'marco.delgado@symbiot.com.mx',
    'antonio.razo@symbiot.com.mx',
]);

// Coordinadores RS: ven notificaciones personales + generales de empresa_id=1
// (email => maestro_id, igual que MAESTRO_EMAIL_MAP)
define('COORDINADOR_EMAIL_MAP', [
    'hvazquez@rockstarskull.com' => 1, // Hugo: maestro y coordinador
]);

// Todos los usuarios de Rockstar Skull (empresa_id=1)
// Sus notificaciones de login/logout se crean en empresa_id=1
define('RS_USER_EMAILS', [
    'hvazquez@rockstarskull.com',
    'jolvera@rockstarskull.com',
    'dandrade@rockstarskull.com',
    'ihernandez@rockstarskull.com',
    'nperez@rockstarskull.com',
    'lblanquet@rockstarskull.com',
    'mreyes@rockstarskull.com',
    'hlopez@rockstarskull.com',
    'escuela@rockstarskull.com',
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
     * Marco/Antonio → ven notificaciones de empresa_id IN (1, 2)
     * Resto admins → solo empresa_id=1
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
                $maestroId    = $maestroMap[$email];
                $esCoordinador = array_key_exists($email, COORDINADOR_EMAIL_MAP);

                if ($esCoordinador) {
                    // Coordinador (Hugo): ve sus notificaciones personales
                    // + las generales de empresa_id=1 (login/logout de maestros, alertas, etc.)
                    executeQuery(
                        "DELETE FROM notificaciones WHERE maestro_id = ? AND leida = 1 AND created_at < NOW() - INTERVAL ? HOUR",
                        [$maestroId, NOTIF_EXPIRY_HOURS]
                    );
                    executeQuery(
                        "DELETE FROM notificaciones WHERE empresa_id = 1 AND maestro_id IS NULL AND leida = 1 AND created_at < NOW() - INTERVAL ? HOUR",
                        [NOTIF_EXPIRY_HOURS]
                    );

                    $rows = executeQuery(
                        "SELECT id, tipo, mensaje, leida, created_at
                         FROM notificaciones
                         WHERE (maestro_id = ? OR (empresa_id = 1 AND maestro_id IS NULL))
                           AND (leida = 0 OR created_at >= NOW() - INTERVAL ? HOUR)
                         ORDER BY created_at DESC
                         LIMIT 50",
                        [$maestroId, NOTIF_EXPIRY_HOURS]
                    );
                } else {
                    // Maestro regular: solo sus notificaciones personales
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
                }

            } elseif (in_array($email, NOTIF_ADMIN_EMAILS)) {
                // Marco y Antonio: notificaciones de empresa_id IN (1, 2)
                executeQuery(
                    "DELETE FROM notificaciones
                      WHERE empresa_id IN (1,2) AND maestro_id IS NULL AND leida = 1
                        AND created_at < NOW() - INTERVAL ? HOUR",
                    [NOTIF_EXPIRY_HOURS]
                );

                $rows = executeQuery(
                    "SELECT id, tipo, mensaje, leida, created_at
                     FROM notificaciones
                     WHERE empresa_id IN (1,2) AND maestro_id IS NULL
                       AND (leida = 0 OR created_at >= NOW() - INTERVAL ? HOUR)
                     ORDER BY created_at DESC
                     LIMIT 50",
                    [NOTIF_EXPIRY_HOURS]
                );

            } else {
                // Resto de usuarios: solo empresa_id=1 (Rockstar Skull)
                $empresa_id = 1;

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
