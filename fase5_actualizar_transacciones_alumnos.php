<?php
/**
 * FASE 5: Actualizar transacciones de alumnos
 * - Cambiar concepto: "Mensualidad - Nombre" → "Mensualidad Clases de [Instrumento] [G/I] Nombre"
 * - Cambiar socio: "Sistema" → "Nombre del Maestro"
 */

require_once __DIR__ . '/api/config/database.php';

echo "====================================================\n";
echo "FASE 5: ACTUALIZAR TRANSACCIONES DE ALUMNOS\n";
echo "====================================================\n\n";

try {
    // 1. Crear backup de tabla transacciones
    echo "1. Creando backup de tabla transacciones...\n";

    $backup_file = 'backup_transacciones_' . date('Ymd_His') . '.sql';
    $backup_content = "-- Backup de tabla transacciones\n";
    $backup_content .= "-- Fecha: " . date('Y-m-d H:i:s') . "\n\n";

    $create_table = executeQuery("SHOW CREATE TABLE transacciones");
    $backup_content .= "DROP TABLE IF EXISTS `transacciones_backup`;\n";
    $backup_content .= str_replace('transacciones', 'transacciones_backup', $create_table[0]['Create Table']) . ";\n\n";

    $rows = executeQuery("SELECT * FROM transacciones WHERE socio='Sistema'");
    foreach ($rows as $row) {
        $values = array_map(function($val) {
            if ($val === null) return 'NULL';
            return "'" . addslashes($val) . "'";
        }, array_values($row));

        $backup_content .= "INSERT INTO `transacciones_backup` VALUES (" . implode(", ", $values) . ");\n";
    }

    file_put_contents($backup_file, $backup_content);
    echo "[OK] Backup creado: $backup_file (" . number_format(filesize($backup_file) / 1024, 2) . " KB)\n\n";

    // 2. Obtener transacciones a actualizar
    echo "2. Obteniendo transacciones con socio='Sistema'...\n";

    $transacciones = executeQuery("
        SELECT id, concepto, fecha, total
        FROM transacciones
        WHERE socio = 'Sistema'
        ORDER BY id
    ");

    echo "Transacciones a actualizar: " . count($transacciones) . "\n\n";

    // 3. Obtener alumnos y maestros
    echo "3. Cargando datos de alumnos y maestros...\n";

    $alumnos = executeQuery("SELECT * FROM alumnos");
    $maestros = executeQuery("SELECT * FROM maestros");

    // Crear mapas para búsqueda rápida
    $alumnos_map = [];
    foreach ($alumnos as $alumno) {
        $alumnos_map[$alumno['nombre']] = $alumno;
    }

    $maestros_map = [];
    foreach ($maestros as $maestro) {
        $maestros_map[$maestro['id']] = $maestro['nombre'];
    }

    echo "[OK] " . count($alumnos_map) . " alumnos cargados\n";
    echo "[OK] " . count($maestros_map) . " maestros cargados\n\n";

    // 4. Actualizar transacciones
    echo "4. Actualizando transacciones...\n";
    echo str_repeat("-", 80) . "\n";

    $stats = [
        'actualizados' => 0,
        'sin_alumno' => 0,
        'sin_maestro' => 0,
        'errores' => 0
    ];

    foreach ($transacciones as $trans) {
        // Extraer nombre del alumno del concepto
        if (preg_match('/Mensualidad - (.+)$/', $trans['concepto'], $matches)) {
            $nombre_alumno = trim($matches[1]);

            // Buscar alumno en mapa
            if (isset($alumnos_map[$nombre_alumno])) {
                $alumno = $alumnos_map[$nombre_alumno];

                // Obtener datos del alumno
                $clase = $alumno['clase'];
                $tipo_clase_letra = ($alumno['tipo_clase'] == 'Individual') ? 'I' : 'G';
                $maestro_id = $alumno['maestro_id'];

                // Obtener nombre del maestro
                if (isset($maestros_map[$maestro_id])) {
                    $nombre_maestro = $maestros_map[$maestro_id];

                    // Construir nuevo concepto
                    $nuevo_concepto = "Mensualidad Clases de {$clase} {$tipo_clase_letra} {$nombre_alumno}";

                    // Actualizar transacción
                    try {
                        $update_query = "
                            UPDATE transacciones
                            SET concepto = ?,
                                socio = ?
                            WHERE id = ?
                        ";

                        executeUpdate($update_query, [$nuevo_concepto, $nombre_maestro, $trans['id']]);

                        $stats['actualizados']++;

                        if ($stats['actualizados'] <= 10 || $stats['actualizados'] % 100 == 0) {
                            printf(
                                "[%4d] %s | %-30s -> %s\n",
                                $trans['id'],
                                $trans['fecha'],
                                substr($nombre_alumno, 0, 30),
                                $nombre_maestro
                            );
                        }

                    } catch (Exception $e) {
                        $stats['errores']++;
                        echo "[ERROR] ID {$trans['id']}: {$e->getMessage()}\n";
                    }

                } else {
                    $stats['sin_maestro']++;
                    echo "[WARN] ID {$trans['id']}: Alumno '{$nombre_alumno}' sin maestro asignado\n";
                }

            } else {
                $stats['sin_alumno']++;
                echo "[WARN] ID {$trans['id']}: Alumno '{$nombre_alumno}' no encontrado en BD\n";
            }
        }
    }

    echo str_repeat("-", 80) . "\n\n";

    // 5. Resumen
    echo "====================================================\n";
    echo "[OK] FASE 5 COMPLETADA\n";
    echo "====================================================\n";
    echo "Transacciones actualizadas:     {$stats['actualizados']}\n";
    echo "Alumnos no encontrados:         {$stats['sin_alumno']}\n";
    echo "Sin maestro asignado:           {$stats['sin_maestro']}\n";
    echo "Errores:                        {$stats['errores']}\n";
    echo "\n";

    // 6. Verificar resultados
    echo "====================================================\n";
    echo "MUESTRA DE TRANSACCIONES ACTUALIZADAS\n";
    echo "====================================================\n";

    $sample_updated = executeQuery("
        SELECT id, fecha, concepto, socio, total
        FROM transacciones
        WHERE concepto LIKE 'Mensualidad Clases de%'
        ORDER BY id
        LIMIT 5
    ");

    foreach ($sample_updated as $row) {
        printf(
            "ID: %4d | %s | %-50s | Maestro: %-20s | $%.2f\n",
            $row['id'],
            $row['fecha'],
            substr($row['concepto'], 0, 50),
            $row['socio'],
            $row['total']
        );
    }

    echo "\n[OK] Actualizacion completada exitosamente\n";
    echo "Backup guardado en: $backup_file\n";

} catch (Exception $e) {
    echo "[ERROR] Error en fase 5: " . $e->getMessage() . "\n";
    exit(1);
}
?>
