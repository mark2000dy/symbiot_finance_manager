<?php
// ====================================================
// CONTROLADOR DE AUTENTICACIÓN (PHP VERSION)
// Version: 3.1 - Session-based Auth with bcrypt
// Archivo: api/controllers/AuthController.php
// Última modificación: 2024-11-10
// ====================================================

require_once __DIR__ . '/../config/database.php';

class AuthController {

    // Login de usuario
    public static function login() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $email = $input['email'] ?? null;
            $password = $input['password'] ?? null;

            if (!$email || !$password) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Email y contraseña son requeridos'
                ]);
                return;
            }

            // Buscar usuario por email
            $users = executeQuery(
                'SELECT * FROM usuarios WHERE email = ? AND activo = TRUE',
                [$email]
            );

            if (empty($users)) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'error' => 'Credenciales inválidas'
                ]);
                return;
            }

            $user = $users[0];
            $passwordValid = false;

            // Verificar contraseña con hash bcrypt
            if ($user['password_hash'] && strpos($user['password_hash'], '$2') === 0) {
                // Hash válido de bcrypt
                $passwordValid = password_verify($password, $user['password_hash']);
            } else {
                // Hash inválido o temporal - rechazar login
                // El administrador debe resetear la contraseña del usuario
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'error' => 'Contraseña no configurada. Contacte al administrador.'
                ]);
                return;
            }

            if (!$passwordValid) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'error' => 'Credenciales inválidas'
                ]);
                return;
            }

            // Crear sesión (guard: evita error si ya fue iniciada por otro include)
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            $_SESSION['user'] = [
                'id' => $user['id'],
                'nombre' => $user['nombre'],
                'email' => $user['email'],
                'rol' => $user['rol'],
                'empresa' => $user['empresa']
            ];

            error_log("✅ Login exitoso: {$user['email']} ({$user['rol']})");

            require_once __DIR__ . '/NotificacionesController.php';

            // Notificación: inicio de sesión de maestro (empresa_id=1)
            $maestroEmailsNot = [
                'hvazquez@rockstarskull.com', 'jolvera@rockstarskull.com',
                'dandrade@rockstarskull.com', 'ihernandez@rockstarskull.com',
                'nperez@rockstarskull.com',   'lblanquet@rockstarskull.com',
                'mreyes@rockstarskull.com',   'hlopez@rockstarskull.com'
            ];
            if (in_array($user['email'], $maestroEmailsNot)) {
                NotificacionesController::crearNotificacion('login_maestro', "{$user['nombre']} ha iniciado sesión", $user['empresa'] ?? 1);
            }

            // Notificación: cualquier login → Symbiot (empresa_id=2)
            NotificacionesController::crearNotificacion('login_usuario', "{$user['nombre']} ha iniciado sesión ({$user['email']})", 2);

            echo json_encode([
                'success' => true,
                'message' => 'Login exitoso',
                'user' => [
                    'id' => $user['id'],
                    'nombre' => $user['nombre'],
                    'email' => $user['email'],
                    'rol' => $user['rol'],
                    'empresa' => $user['empresa']
                ]
                // redirectUrl eliminado - el frontend maneja la redirección con rutas dinámicas
            ]);

        } catch (Exception $e) {
            error_log("Error en login: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error interno del servidor'
            ]);
        }
    }

    // Logout de usuario
    public static function logout() {
        try {
            session_start();

            // Capturar usuario antes de destruir la sesión
            $logoutUser = $_SESSION['user'] ?? null;
            session_destroy();

            // Notificación: cierre de sesión → Symbiot (empresa_id=2)
            if ($logoutUser) {
                require_once __DIR__ . '/NotificacionesController.php';
                NotificacionesController::crearNotificacion(
                    'logout_usuario',
                    "{$logoutUser['nombre']} ha cerrado sesión ({$logoutUser['email']})",
                    2
                );
            }

            echo json_encode([
                'success' => true,
                'message' => 'Sesión cerrada exitosamente',
                'redirectUrl' => '/gastos/login.html'
            ]);

        } catch (Exception $e) {
            error_log("Error en logout: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error interno del servidor'
            ]);
        }
    }

    // Obtener usuario actual
    public static function getCurrentUser() {
        try {
            session_start();

            if (!isset($_SESSION['user'])) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'error' => 'No hay sesión activa'
                ]);
                return;
            }

            echo json_encode([
                'success' => true,
                'user' => $_SESSION['user']
            ]);

        } catch (Exception $e) {
            error_log("Error obteniendo usuario actual: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error interno del servidor'
            ]);
        }
    }

    // Middleware de autenticación
    public static function requireAuth() {
        session_start();

        if (!isset($_SESSION['user'])) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'error' => 'Acceso no autorizado'
            ]);
            exit;
        }

        return $_SESSION['user'];
    }

    // Obtener perfil completo del usuario
    public static function getProfile() {
        try {
            session_start();

            if (!isset($_SESSION['user'])) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'error' => 'No hay sesión activa'
                ]);
                return;
            }

            $userId = $_SESSION['user']['id'];

            // Obtener datos completos del usuario
            $users = executeQuery(
                'SELECT id, nombre, apellidos, email, rol, empresa, puesto, celular FROM usuarios WHERE id = ?',
                [$userId]
            );

            if (empty($users)) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Usuario no encontrado'
                ]);
                return;
            }

            echo json_encode([
                'success' => true,
                'user' => $users[0]
            ]);

        } catch (Exception $e) {
            error_log("Error obteniendo perfil: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error interno del servidor'
            ]);
        }
    }

    // Actualizar perfil del usuario
    public static function updateProfile() {
        try {
            session_start();

            if (!isset($_SESSION['user'])) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'error' => 'No hay sesión activa'
                ]);
                return;
            }

            $userId = $_SESSION['user']['id'];
            $input = json_decode(file_get_contents('php://input'), true);

            // Campos actualizables
            $fields = [];
            $params = [];

            if (isset($input['nombre']) && !empty(trim($input['nombre']))) {
                $fields[] = 'nombre = ?';
                $params[] = trim($input['nombre']);
            }

            if (isset($input['apellidos'])) {
                $fields[] = 'apellidos = ?';
                $params[] = trim($input['apellidos']);
            }

            if (isset($input['puesto'])) {
                $fields[] = 'puesto = ?';
                $params[] = trim($input['puesto']);
            }

            if (isset($input['celular'])) {
                $fields[] = 'celular = ?';
                $params[] = trim($input['celular']);
            }

            // Email requiere validación especial
            if (isset($input['email']) && !empty(trim($input['email']))) {
                $newEmail = trim($input['email']);

                // Validar formato de email
                if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => 'El formato del email no es válido'
                    ]);
                    return;
                }

                // Verificar que el email no esté en uso por otro usuario
                $existing = executeQuery(
                    'SELECT id FROM usuarios WHERE email = ? AND id != ?',
                    [$newEmail, $userId]
                );

                if (!empty($existing)) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => 'El email ya está en uso por otro usuario'
                    ]);
                    return;
                }

                $fields[] = 'email = ?';
                $params[] = $newEmail;
            }

            // Cambio de contraseña
            if (isset($input['password']) && !empty($input['password'])) {
                $newPassword = $input['password'];

                // Validar longitud mínima
                if (strlen($newPassword) < 6) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => 'La contraseña debe tener al menos 6 caracteres'
                    ]);
                    return;
                }

                // Si se proporciona contraseña actual, verificarla
                if (isset($input['current_password']) && !empty($input['current_password'])) {
                    $users = executeQuery(
                        'SELECT password_hash FROM usuarios WHERE id = ?',
                        [$userId]
                    );

                    if (!empty($users) && !password_verify($input['current_password'], $users[0]['password_hash'])) {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'error' => 'La contraseña actual es incorrecta'
                        ]);
                        return;
                    }
                }

                $fields[] = 'password_hash = ?';
                $params[] = password_hash($newPassword, PASSWORD_DEFAULT);
            }

            if (empty($fields)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'No hay campos para actualizar'
                ]);
                return;
            }

            // Ejecutar actualización
            $params[] = $userId;
            $query = 'UPDATE usuarios SET ' . implode(', ', $fields) . ' WHERE id = ?';
            executeUpdate($query, $params);

            // Actualizar sesión con los nuevos datos
            $updatedUser = executeQuery(
                'SELECT id, nombre, apellidos, email, rol, empresa, puesto, celular FROM usuarios WHERE id = ?',
                [$userId]
            );

            if (!empty($updatedUser)) {
                $_SESSION['user'] = [
                    'id' => $updatedUser[0]['id'],
                    'nombre' => $updatedUser[0]['nombre'],
                    'email' => $updatedUser[0]['email'],
                    'rol' => $updatedUser[0]['rol'],
                    'empresa' => $updatedUser[0]['empresa']
                ];
            }

            error_log("✅ Perfil actualizado para usuario ID: {$userId}");

            echo json_encode([
                'success' => true,
                'message' => 'Perfil actualizado correctamente',
                'user' => $updatedUser[0] ?? null
            ]);

        } catch (Exception $e) {
            error_log("Error actualizando perfil: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error interno del servidor'
            ]);
        }
    }
}
