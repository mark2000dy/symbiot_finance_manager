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

            // Crear sesión
            session_start();
            $_SESSION['user'] = [
                'id' => $user['id'],
                'nombre' => $user['nombre'],
                'email' => $user['email'],
                'rol' => $user['rol'],
                'empresa' => $user['empresa']
            ];

            error_log("✅ Login exitoso: {$user['email']} ({$user['rol']})");

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
            session_destroy();

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
}
