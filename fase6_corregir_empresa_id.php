<?php
/**
 * FASE 6: Corregir empresa_id de transacciones de alumnos
 * Cambiar de empresa_id = 2 a empresa_id = 1 (Rockstar Skull)
 */

require_once __DIR__ . '/api/config/database.php';

echo "====================================================\n";
echo "FASE 6: CORREGIR EMPRESA_ID DE TRANSACCIONES\n";
echo "====================================================\n\n";

try {
    // 1. Verificar estado actual
    echo "1. Verificando estado actual...\n";
    echo str_repeat("-", 80) . "\n";

    $check_empresa_2 = executeQuery("
        SELECT COUNT(*) as total
        FROM transacciones
        WHERE concepto LIKE 'Mensualidad Clases%'
        AND empresa_id = 2
    ");

    $check_empresa_1 = executeQuery("
        SELECT COUNT(*) as total
        FROM transacciones
        WHERE concepto LIKE 'Mensualidad Clases%'
        AND empresa_id = 1
    ");

    echo "Transacciones con empresa_id = 2 (incorrecto): " . $check_empresa_2[0]['total'] . "\n";
    echo "Transacciones con empresa_id = 1 (correcto):   " . $check_empresa_1[0]['total'] . "\n\n";

    if ($check_empresa_2[0]['total'] == 0) {
        echo "[OK] No hay transacciones que corregir\n";
        exit(0);
    }

    // 2. Crear backup
    echo "2. Creando backup de transacciones a corregir...\n";

    $backup_file = 'backup_empresa_id_' . date('Ymd_His') . '.sql';
    $backup_content = "-- Backup antes de corregir empresa_id\n";
    $backup_content .= "-- Fecha: " . date('Y-m-d H:i:s') . "\n\n";

    $rows_to_backup = executeQuery("
        SELECT * FROM transacciones
        WHERE concepto LIKE 'Mensualidad Clases%'
        AND empresa_id = 2
    ");

    $backup_content .= "-- Transacciones con empresa_id = 2 (antes de corrección)\n";
    foreach ($rows_to_backup as $row) {
        $backup_content .= sprintf(
            "-- ID: %d | Fecha: %s | Concepto: %s | Empresa: %d\n",
            $row['id'],
            $row['fecha'],
            substr($row['concepto'], 0, 50),
            $row['empresa_id']
        );
    }

    file_put_contents($backup_file, $backup_content);
    echo "[OK] Backup creado: $backup_file\n\n";

    // 3. Actualizar empresa_id
    echo "3. Actualizando empresa_id de 2 a 1...\n";
    echo str_repeat("-", 80) . "\n";

    $update_query = "
        UPDATE transacciones
        SET empresa_id = 1
        WHERE concepto LIKE 'Mensualidad Clases%'
        AND empresa_id = 2
    ";

    executeUpdate($update_query, []);

    echo "[OK] Transacciones actualizadas\n\n";

    // 4. Verificar resultado
    echo "4. Verificando resultado...\n";
    echo str_repeat("-", 80) . "\n";

    $verify_empresa_2 = executeQuery("
        SELECT COUNT(*) as total
        FROM transacciones
        WHERE concepto LIKE 'Mensualidad Clases%'
        AND empresa_id = 2
    ");

    $verify_empresa_1 = executeQuery("
        SELECT COUNT(*) as total
        FROM transacciones
        WHERE concepto LIKE 'Mensualidad Clases%'
        AND empresa_id = 1
    ");

    echo "Transacciones con empresa_id = 2 (después): " . $verify_empresa_2[0]['total'] . "\n";
    echo "Transacciones con empresa_id = 1 (después): " . $verify_empresa_1[0]['total'] . "\n\n";

    if ($verify_empresa_2[0]['total'] == 0) {
        echo "[OK] Todas las transacciones de alumnos ahora tienen empresa_id = 1\n";
    } else {
        echo "[WARN] Todavía hay " . $verify_empresa_2[0]['total'] . " transacciones con empresa_id = 2\n";
    }

    // 5. Verificar totales por empresa
    echo "\n5. Verificando totales por empresa:\n";
    echo str_repeat("-", 80) . "\n";

    $totales = executeQuery("
        SELECT
            empresa_id,
            tipo,
            COUNT(*) as cantidad,
            SUM(total) as total_monto
        FROM transacciones
        GROUP BY empresa_id, tipo
        ORDER BY empresa_id, tipo
    ");

    foreach ($totales as $row) {
        $empresa_nombre = ($row['empresa_id'] == 1) ? 'Rockstar Skull' : 'Symbiot Technologies';
        $tipo_nombre = ($row['tipo'] == 'I') ? 'Ingresos' : 'Gastos';

        printf(
            "%-25s | %-10s | %4d transacciones | $%15s\n",
            $empresa_nombre,
            $tipo_nombre,
            $row['cantidad'],
            number_format($row['total_monto'], 2)
        );
    }

    // 6. Muestra de transacciones corregidas
    echo "\n6. Muestra de transacciones corregidas:\n";
    echo str_repeat("-", 80) . "\n";

    $sample = executeQuery("
        SELECT id, empresa_id, fecha, concepto, total
        FROM transacciones
        WHERE concepto LIKE 'Mensualidad Clases%'
        ORDER BY id
        LIMIT 5
    ");

    foreach ($sample as $row) {
        printf(
            "ID: %4d | Empresa: %d | %s | %-45s | $%.2f\n",
            $row['id'],
            $row['empresa_id'],
            $row['fecha'],
            substr($row['concepto'], 0, 45),
            $row['total']
        );
    }

    echo "\n" . str_repeat("=", 80) . "\n";
    echo "[OK] FASE 6 COMPLETADA\n";
    echo str_repeat("=", 80) . "\n";
    echo "Transacciones corregidas: " . $check_empresa_2[0]['total'] . "\n";
    echo "Ahora todas las mensualidades tienen empresa_id = 1 (Rockstar Skull)\n";

} catch (Exception $e) {
    echo "[ERROR] Error en fase 6: " . $e->getMessage() . "\n";
    exit(1);
}
?>
