<?php
// ====================================================
// CLEAR CACHE - SYMBIOT FINANCE MANAGER v3.1
// ====================================================
// Este archivo limpia el cache de PHP (OPcache) para
// asegurar que los cambios en archivos PHP se apliquen
// inmediatamente sin necesidad de reiniciar Apache.
// ====================================================

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clear PHP Cache - Symbiot v3.1</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
            max-width: 600px;
            width: 100%;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        .version {
            color: #666;
            font-size: 14px;
            margin-bottom: 30px;
            font-weight: normal;
        }
        .result {
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            font-size: 14px;
        }
        .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        .error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        .info {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeeba;
            color: #856404;
        }
        .icon {
            font-size: 24px;
            margin-right: 10px;
        }
        .stats {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .stats-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #dee2e6;
        }
        .stats-item:last-child {
            border-bottom: none;
        }
        .stats-label {
            font-weight: 600;
            color: #495057;
        }
        .stats-value {
            color: #6c757d;
        }
        .btn-back {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            transition: all 0.3s;
        }
        .btn-back:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Clear PHP Cache</h1>
        <p class="version">Symbiot Finance Manager v3.1 - Inline Path Detection</p>

        <?php
        $results = [];
        $allSuccess = true;

        // 1. Limpiar OPcache
        if (function_exists('opcache_reset')) {
            if (opcache_reset()) {
                $results[] = [
                    'type' => 'success',
                    'icon' => '✅',
                    'message' => '<strong>OPcache limpiado exitosamente</strong><br>Todos los archivos PHP se recargarán en la próxima ejecución.'
                ];
            } else {
                $results[] = [
                    'type' => 'error',
                    'icon' => '❌',
                    'message' => '<strong>Error al limpiar OPcache</strong><br>No se pudo limpiar el cache de PHP.'
                ];
                $allSuccess = false;
            }
        } else {
            $results[] = [
                'type' => 'warning',
                'icon' => '⚠️',
                'message' => '<strong>OPcache no está habilitado</strong><br>No es necesario limpiar el cache.'
            ];
        }

        // 2. Limpiar cache de sesiones (opcional)
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        session_regenerate_id(true);
        $results[] = [
            'type' => 'success',
            'icon' => '🔐',
            'message' => '<strong>ID de sesión regenerado</strong><br>Nueva sesión creada correctamente.'
        ];

        // 3. Información del sistema
        $opcacheEnabled = function_exists('opcache_get_status') && opcache_get_status() !== false;
        $opcacheStatus = $opcacheEnabled ? opcache_get_status() : null;

        // Mostrar resultados
        foreach ($results as $result) {
            echo "<div class='result {$result['type']}'>";
            echo "<span class='icon'>{$result['icon']}</span>";
            echo $result['message'];
            echo "</div>";
        }

        // Resumen final
        if ($allSuccess) {
            echo "<div class='result success'>";
            echo "<span class='icon'>🎉</span>";
            echo "<strong>¡Cache limpiado exitosamente!</strong><br>";
            echo "Puedes volver a probar tu aplicación. Los cambios en los archivos PHP se aplicarán inmediatamente.";
            echo "</div>";
        }
        ?>

        <div class="stats">
            <h3 style="margin-top: 0; color: #333;">📊 Información del Sistema</h3>

            <div class="stats-item">
                <span class="stats-label">Versión PHP:</span>
                <span class="stats-value"><?php echo phpversion(); ?></span>
            </div>

            <div class="stats-item">
                <span class="stats-label">OPcache Status:</span>
                <span class="stats-value">
                    <?php
                    if ($opcacheEnabled) {
                        echo "✅ Habilitado";
                        if ($opcacheStatus && isset($opcacheStatus['opcache_enabled'])) {
                            echo " y Activo";
                        }
                    } else {
                        echo "❌ Deshabilitado";
                    }
                    ?>
                </span>
            </div>

            <?php if ($opcacheEnabled && $opcacheStatus): ?>
                <div class="stats-item">
                    <span class="stats-label">Archivos en cache:</span>
                    <span class="stats-value">
                        <?php echo number_format($opcacheStatus['opcache_statistics']['num_cached_scripts'] ?? 0); ?>
                    </span>
                </div>

                <div class="stats-item">
                    <span class="stats-label">Memoria usada:</span>
                    <span class="stats-value">
                        <?php
                        $used = $opcacheStatus['memory_usage']['used_memory'] ?? 0;
                        echo round($used / 1024 / 1024, 2) . ' MB';
                        ?>
                    </span>
                </div>
            <?php endif; ?>

            <div class="stats-item">
                <span class="stats-label">Servidor:</span>
                <span class="stats-value"><?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Desconocido'; ?></span>
            </div>

            <div class="stats-item">
                <span class="stats-label">Hora del servidor:</span>
                <span class="stats-value"><?php echo date('Y-m-d H:i:s'); ?></span>
            </div>
        </div>

        <div style="text-align: center;">
            <a href="gastos/login.html" class="btn-back">🔙 Volver al Login</a>
        </div>

        <div class="result info" style="margin-top: 20px; font-size: 12px;">
            <span class="icon">ℹ️</span>
            <strong>Instrucciones:</strong><br>
            1. Después de limpiar el cache, recarga la página de login con <kbd>Ctrl+F5</kbd><br>
            2. Si sigues teniendo problemas, reinicia Apache desde el panel de AppServ<br>
            3. Este archivo está disponible en: <code>/clear-cache.php</code>
        </div>
    </div>
</body>
</html>
