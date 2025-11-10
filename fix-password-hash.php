<?php
// ====================================================
// FIX USER PASSWORD HASH - SYMBIOT FINANCE MANAGER v3.1
// ====================================================
// Este script convierte las contraseñas en texto plano
// a hashes bcrypt compatibles con PHP password_verify()
// ====================================================

// Credenciales de DB (confirmadas)
define('DB_HOST', 'localhost');
define('DB_USER', 'gastos_user');
define('DB_PASS', 'Gastos2025!');
define('DB_NAME', 'gastos_app_db');

// Usuario a arreglar
define('USER_EMAIL', 'marco.delgado@symbiot.com.mx');
define('USER_PLAIN_PASSWORD', 'admin1234');

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fix Password Hash - Symbiot v3.1</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            margin: 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .version {
            color: #666;
            font-size: 14px;
            margin-bottom: 30px;
        }
        .result {
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 5px solid;
        }
        .success {
            background: #d4edda;
            border-color: #28a745;
            color: #155724;
        }
        .error {
            background: #f8d7da;
            border-color: #dc3545;
            color: #721c24;
        }
        .info {
            background: #d1ecf1;
            border-color: #17a2b8;
            color: #0c5460;
        }
        .warning {
            background: #fff3cd;
            border-color: #ffc107;
            color: #856404;
        }
        .step {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            border-left: 4px solid #667eea;
        }
        .code {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            margin: 10px 0;
            overflow-x: auto;
            word-break: break-all;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        th {
            background: #f8f9fa;
            font-weight: 600;
        }
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin-top: 20px;
            transition: all 0.3s;
            font-weight: bold;
        }
        .btn:hover {
            background: #218838;
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 Arreglar Password Hash</h1>
        <p class="version">Symbiot Finance Manager v3.1 - Bcrypt Password Hashing</p>

        <div class="result info">
            <strong>📋 Problema Detectado:</strong><br>
            La contraseña está almacenada en <strong>texto plano</strong> en la base de datos.<br>
            El código PHP usa <code>password_verify()</code> que requiere <strong>hash bcrypt</strong>.<br><br>
            <strong>💡 Solución:</strong><br>
            Convertir la contraseña a hash bcrypt usando <code>password_hash()</code>.
        </div>

        <?php
        $allSuccess = true;
        $steps = [];

        // PASO 1: Conectar a la base de datos
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);

            $steps[] = [
                'type' => 'success',
                'title' => 'Paso 1: Conexión a Base de Datos',
                'message' => '✅ Conectado exitosamente a ' . DB_NAME
            ];

        } catch (PDOException $e) {
            $steps[] = [
                'type' => 'error',
                'title' => 'Paso 1: Conexión a Base de Datos',
                'message' => '❌ Error conectando: ' . $e->getMessage()
            ];
            $allSuccess = false;
        }

        // PASO 2: Verificar usuario actual
        if ($allSuccess) {
            try {
                $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
                $stmt->execute([USER_EMAIL]);
                $usuario = $stmt->fetch();

                if ($usuario) {
                    $steps[] = [
                        'type' => 'success',
                        'title' => 'Paso 2: Verificar Usuario',
                        'message' => '✅ Usuario encontrado<br>' .
                                   '<table>' .
                                   '<tr><th>Campo</th><th>Valor</th></tr>' .
                                   '<tr><td>ID</td><td>' . $usuario['id'] . '</td></tr>' .
                                   '<tr><td>Nombre</td><td>' . $usuario['nombre'] . '</td></tr>' .
                                   '<tr><td>Email</td><td>' . $usuario['email'] . '</td></tr>' .
                                   '<tr><td>Password Actual</td><td><code>' . htmlspecialchars($usuario['password_hash']) . '</code></td></tr>' .
                                   '<tr><td>Rol</td><td>' . $usuario['rol'] . '</td></tr>' .
                                   '<tr><td>Empresa</td><td>' . $usuario['empresa'] . '</td></tr>' .
                                   '<tr><td>Activo</td><td>' . ($usuario['activo'] ? '✅ Sí' : '❌ No') . '</td></tr>' .
                                   '</table>'
                    ];

                    // Verificar si ya es un hash bcrypt
                    if (substr($usuario['password_hash'], 0, 4) === '$2y$') {
                        $steps[] = [
                            'type' => 'warning',
                            'title' => '⚠️ Nota',
                            'message' => 'La contraseña ya parece ser un hash bcrypt. Si aún no puedes hacer login, puede ser que el hash sea de una contraseña diferente.'
                        ];
                    }

                } else {
                    $steps[] = [
                        'type' => 'error',
                        'title' => 'Paso 2: Verificar Usuario',
                        'message' => '❌ Usuario no encontrado: ' . USER_EMAIL
                    ];
                    $allSuccess = false;
                }

            } catch (PDOException $e) {
                $steps[] = [
                    'type' => 'error',
                    'title' => 'Paso 2: Verificar Usuario',
                    'message' => '❌ Error consultando usuario: ' . $e->getMessage()
                ];
                $allSuccess = false;
            }
        }

        // PASO 3: Generar hash bcrypt
        if ($allSuccess) {
            try {
                $newHash = password_hash(USER_PLAIN_PASSWORD, PASSWORD_BCRYPT);

                $steps[] = [
                    'type' => 'success',
                    'title' => 'Paso 3: Generar Hash Bcrypt',
                    'message' => '✅ Hash generado exitosamente<br>' .
                               '<strong>Contraseña original:</strong> <code>' . USER_PLAIN_PASSWORD . '</code><br>' .
                               '<strong>Hash bcrypt:</strong><br>' .
                               '<div class="code">' . $newHash . '</div>'
                ];

            } catch (Exception $e) {
                $steps[] = [
                    'type' => 'error',
                    'title' => 'Paso 3: Generar Hash',
                    'message' => '❌ Error generando hash: ' . $e->getMessage()
                ];
                $allSuccess = false;
            }
        }

        // PASO 4: Actualizar contraseña en la BD
        if ($allSuccess) {
            try {
                $stmt = $pdo->prepare("UPDATE usuarios SET password_hash = ?, updated_at = NOW() WHERE email = ?");
                $stmt->execute([$newHash, USER_EMAIL]);

                $rowsAffected = $stmt->rowCount();

                if ($rowsAffected > 0) {
                    $steps[] = [
                        'type' => 'success',
                        'title' => 'Paso 4: Actualizar Base de Datos',
                        'message' => '✅ Contraseña actualizada exitosamente<br>' .
                                   'Filas afectadas: ' . $rowsAffected
                    ];
                } else {
                    $steps[] = [
                        'type' => 'warning',
                        'title' => 'Paso 4: Actualizar Base de Datos',
                        'message' => '⚠️ No se actualizó ninguna fila (puede que el hash ya fuera el mismo)'
                    ];
                }

            } catch (PDOException $e) {
                $steps[] = [
                    'type' => 'error',
                    'title' => 'Paso 4: Actualizar Base de Datos',
                    'message' => '❌ Error actualizando: ' . $e->getMessage()
                ];
                $allSuccess = false;
            }
        }

        // PASO 5: Verificar el hash con password_verify
        if ($allSuccess) {
            try {
                // Obtener el usuario actualizado
                $stmt = $pdo->prepare("SELECT password_hash FROM usuarios WHERE email = ?");
                $stmt->execute([USER_EMAIL]);
                $usuario = $stmt->fetch();

                // Verificar que el hash funcione
                if (password_verify(USER_PLAIN_PASSWORD, $usuario['password_hash'])) {
                    $steps[] = [
                        'type' => 'success',
                        'title' => 'Paso 5: Verificar Hash',
                        'message' => '✅ ¡Verificación exitosa!<br>' .
                                   'La función <code>password_verify("' . USER_PLAIN_PASSWORD . '", hash)</code> devuelve <strong>TRUE</strong>.<br>' .
                                   'El login debería funcionar ahora.'
                    ];
                } else {
                    $steps[] = [
                        'type' => 'error',
                        'title' => 'Paso 5: Verificar Hash',
                        'message' => '❌ La verificación falló. Algo salió mal.'
                    ];
                    $allSuccess = false;
                }

            } catch (Exception $e) {
                $steps[] = [
                    'type' => 'error',
                    'title' => 'Paso 5: Verificar Hash',
                    'message' => '❌ Error verificando: ' . $e->getMessage()
                ];
                $allSuccess = false;
            }
        }

        // Mostrar todos los pasos
        foreach ($steps as $step) {
            echo "<div class='step'>";
            echo "<div class='result {$step['type']}'>";
            echo "<strong>{$step['title']}</strong><br>";
            echo $step['message'];
            echo "</div>";
            echo "</div>";
        }

        // Resultado final
        if ($allSuccess) {
            echo "<div class='result success' style='margin-top: 30px; font-size: 16px;'>";
            echo "<strong>🎉 ¡TODO LISTO! El usuario ha sido actualizado</strong><br><br>";
            echo "✅ Usuario: <code>" . USER_EMAIL . "</code><br>";
            echo "✅ Contraseña: <code>" . USER_PLAIN_PASSWORD . "</code><br>";
            echo "✅ Hash: Bcrypt (compatible con PHP password_verify)<br><br>";
            echo "<strong>🚀 Ya puedes hacer login en la aplicación</strong>";
            echo "</div>";

            echo "<div style='text-align: center; margin-top: 20px;'>";
            echo "<a href='gastos/login.html' class='btn'>🔐 Ir al Login</a>";
            echo "</div>";

        } else {
            echo "<div class='result error' style='margin-top: 30px;'>";
            echo "<strong>❌ Algo salió mal</strong><br>";
            echo "Revisa los errores arriba y comparte los resultados.";
            echo "</div>";
        }
        ?>

        <div class="result info" style="margin-top: 30px; font-size: 12px;">
            <strong>ℹ️ Información Técnica:</strong><br>
            PHP usa <code>password_hash()</code> con el algoritmo <strong>BCRYPT</strong>.<br>
            Los hashes bcrypt empiezan con <code>$2y$</code> y tienen 60 caracteres.<br>
            Son unidireccionales (no se pueden desencriptar) y seguros.
        </div>
    </div>
</body>
</html>
