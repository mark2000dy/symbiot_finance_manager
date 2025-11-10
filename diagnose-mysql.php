<?php
// ====================================================
// DIAGNÓSTICO DE MYSQL - SYMBIOT FINANCE MANAGER v3.1
// ====================================================
// Este script intenta conectarse a MySQL con diferentes
// configuraciones para identificar el problema exacto.
// ====================================================

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MySQL Diagnostics - Symbiot v3.1</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            margin: 0;
        }
        .container {
            max-width: 900px;
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
        .test-result {
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
        .code {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            margin-top: 10px;
            overflow-x: auto;
        }
        .section {
            margin-top: 30px;
            border-top: 2px solid #dee2e6;
            padding-top: 20px;
        }
        h2 {
            color: #495057;
            font-size: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
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
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin-top: 20px;
            transition: all 0.3s;
        }
        .btn:hover {
            background: #5568d3;
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Diagnóstico de MySQL</h1>
        <p class="version">Symbiot Finance Manager v3.1 - AppServ 9.3.0 Compatible</p>

        <?php
        echo "<div class='test-result info'>";
        echo "<strong>📊 Información del Sistema</strong><br>";
        echo "PHP Version: " . phpversion() . "<br>";
        echo "PDO Driver: " . (extension_loaded('pdo_mysql') ? '✅ Instalado' : '❌ NO Instalado') . "<br>";
        echo "Servidor: " . $_SERVER['SERVER_SOFTWARE'] . "<br>";
        echo "</div>";

        // Test 1: Intentar conexión con root sin password (AppServ default)
        echo "<div class='section'>";
        echo "<h2>Test 1: Conexión como ROOT (sin password)</h2>";

        try {
            $dsn = "mysql:host=localhost;port=3306;charset=utf8mb4";
            $pdo = new PDO($dsn, 'root', '', [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ]);

            echo "<div class='test-result success'>";
            echo "<strong>✅ CONEXIÓN EXITOSA</strong><br>";
            echo "Usuario: root<br>";
            echo "Password: (vacío)<br>";
            echo "Host: localhost:3306<br>";
            echo "</div>";

            // Obtener versión de MySQL
            $version = $pdo->query('SELECT VERSION()')->fetchColumn();
            echo "<div class='test-result info'>";
            echo "<strong>MySQL Version:</strong> $version<br>";
            echo "</div>";

            // Listar bases de datos
            $databases = $pdo->query('SHOW DATABASES')->fetchAll(PDO::FETCH_COLUMN);
            echo "<div class='test-result info'>";
            echo "<strong>📁 Bases de datos disponibles:</strong><br>";
            echo "<ul>";
            foreach ($databases as $db) {
                $highlight = ($db === 'gastos_app_db') ? ' <strong style="color: #28a745;">← ESTA ES LA QUE NECESITAMOS</strong>' : '';
                echo "<li>$db$highlight</li>";
            }
            echo "</ul>";

            if (!in_array('gastos_app_db', $databases)) {
                echo "<div class='test-result warning'>";
                echo "<strong>⚠️ La base de datos 'gastos_app_db' NO EXISTE</strong><br>";
                echo "Necesitas crearla en phpMyAdmin o ejecutar el script SQL.";
                echo "</div>";
            } else {
                echo "<div class='test-result success'>";
                echo "<strong>✅ La base de datos 'gastos_app_db' EXISTE</strong>";
                echo "</div>";

                // Test de tablas
                $pdo->exec('USE gastos_app_db');
                $tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);

                if (count($tables) > 0) {
                    echo "<div class='test-result success'>";
                    echo "<strong>✅ Tablas encontradas en gastos_app_db:</strong><br>";
                    echo "<ul>";
                    foreach ($tables as $table) {
                        echo "<li>$table</li>";
                    }
                    echo "</ul>";
                    echo "</div>";
                } else {
                    echo "<div class='test-result warning'>";
                    echo "<strong>⚠️ La base de datos existe pero está VACÍA</strong><br>";
                    echo "Necesitas importar el schema SQL con las tablas.";
                    echo "</div>";
                }
            }

            echo "</div>";

        } catch (PDOException $e) {
            echo "<div class='test-result error'>";
            echo "<strong>❌ ERROR DE CONEXIÓN</strong><br>";
            echo "Código: " . $e->getCode() . "<br>";
            echo "Mensaje: " . $e->getMessage() . "<br>";

            if ($e->getCode() == 1045) {
                echo "<br><strong>💡 Solución:</strong> El usuario 'root' tiene password. Intenta recordar el password que pusiste al instalar AppServ.";
            } elseif ($e->getCode() == 2054) {
                echo "<br><strong>💡 Solución:</strong> MySQL 8.0 usa un método de autenticación nuevo. Necesitas cambiar el método del usuario root.";
            }
            echo "</div>";
        }

        // Test 2: Intentar con el usuario gastos_user
        echo "<div class='section'>";
        echo "<h2>Test 2: Conexión como GASTOS_USER</h2>";

        try {
            $dsn = "mysql:host=localhost;port=3306;charset=utf8mb4";
            $pdo = new PDO($dsn, 'gastos_user', 'Gastos2025!', [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);

            echo "<div class='test-result success'>";
            echo "<strong>✅ CONEXIÓN EXITOSA</strong><br>";
            echo "Usuario: gastos_user<br>";
            echo "Password: Gastos2025!<br>";
            echo "</div>";

        } catch (PDOException $e) {
            echo "<div class='test-result error'>";
            echo "<strong>❌ ERROR DE CONEXIÓN</strong><br>";
            echo "Código: " . $e->getCode() . "<br>";
            echo "Mensaje: " . $e->getMessage() . "<br>";

            if ($e->getCode() == 1045) {
                echo "<br><strong>💡 Explicación:</strong> El usuario 'gastos_user' NO EXISTE o el password es incorrecto.<br>";
                echo "<strong>💡 Solución:</strong> Usa el usuario 'root' o crea el usuario 'gastos_user' en phpMyAdmin.";
            } elseif ($e->getCode() == 2054) {
                echo "<br><strong>💡 Solución:</strong> MySQL 8.0 requiere configuración adicional para PHP.";
            }
            echo "</div>";
        }

        echo "</div>";

        // Recomendaciones
        echo "<div class='section'>";
        echo "<h2>📝 Recomendaciones</h2>";

        echo "<div class='test-result info'>";
        echo "<strong>Para AppServ 9.3.0, la configuración recomendada es:</strong>";
        echo "<div class='code'>";
        echo "DB_HOST=localhost<br>";
        echo "DB_PORT=3306<br>";
        echo "DB_DATABASE=gastos_app_db<br>";
        echo "DB_USERNAME=root<br>";
        echo "DB_PASSWORD=   (tu password de root, o vacío si no pusiste ninguno)";
        echo "</div>";
        echo "</div>";

        echo "<div class='test-result warning'>";
        echo "<strong>⚠️ Pasos siguientes:</strong><br>";
        echo "1. Anota cuál test funcionó (Test 1 o Test 2)<br>";
        echo "2. Si ninguno funcionó, anota el código de error<br>";
        echo "3. Comparte los resultados para que actualice la configuración";
        echo "</div>";

        echo "</div>";
        ?>

        <div style="text-align: center;">
            <a href="gastos/login.html" class="btn">🔙 Volver al Login</a>
            <a href="clear-cache.php" class="btn" style="background: #17a2b8;">🔧 Clear Cache</a>
        </div>
    </div>
</body>
</html>
