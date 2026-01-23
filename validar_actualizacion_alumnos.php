<?php
/**
 * Validar actualización de transacciones de alumnos
 */

require_once __DIR__ . '/api/config/database.php';

echo "====================================================\n";
echo "VALIDACION DE ACTUALIZACION DE TRANSACCIONES\n";
echo "====================================================\n\n";

// 1. Verificar que no haya transacciones con socio='Sistema'
echo "1. Verificando transacciones con socio='Sistema':\n";
echo str_repeat("-", 80) . "\n";

$sistema_count = executeQuery("SELECT COUNT(*) as total FROM transacciones WHERE socio='Sistema'");
echo "Transacciones con socio='Sistema': " . $sistema_count[0]['total'] . "\n";

if ($sistema_count[0]['total'] == 0) {
    echo "[OK] No hay transacciones con socio='Sistema'\n";
} else {
    echo "[WARN] Todavía hay " . $sistema_count[0]['total'] . " transacciones con socio='Sistema'\n";
}

// 2. Verificar formato nuevo
echo "\n2. Verificando nuevo formato de concepto:\n";
echo str_repeat("-", 80) . "\n";

$new_format = executeQuery("SELECT COUNT(*) as total FROM transacciones WHERE concepto LIKE 'Mensualidad Clases de%'");
echo "Transacciones con nuevo formato: " . $new_format[0]['total'] . "\n";

// 3. Distribución por maestro
echo "\n3. Distribución de transacciones por maestro:\n";
echo str_repeat("-", 80) . "\n";

$por_maestro = executeQuery("
    SELECT
        socio as maestro,
        COUNT(*) as cantidad,
        SUM(total) as total_monto
    FROM transacciones
    WHERE concepto LIKE 'Mensualidad Clases de%'
    GROUP BY socio
    ORDER BY cantidad DESC
");

foreach ($por_maestro as $row) {
    printf(
        "%-25s: %3d transacciones | $%12s\n",
        $row['maestro'],
        $row['cantidad'],
        number_format($row['total_monto'], 2)
    );
}

// 4. Distribución por tipo de clase
echo "\n4. Distribución por tipo de clase (G/I):\n";
echo str_repeat("-", 80) . "\n";

$tipo_g = executeQuery("SELECT COUNT(*) as total FROM transacciones WHERE concepto LIKE 'Mensualidad Clases de% G %'");
$tipo_i = executeQuery("SELECT COUNT(*) as total FROM transacciones WHERE concepto LIKE 'Mensualidad Clases de% I %'");

echo "Clases Grupales (G):    " . $tipo_g[0]['total'] . " transacciones\n";
echo "Clases Individuales (I): " . $tipo_i[0]['total'] . " transacciones\n";

// 5. Distribución por instrumento
echo "\n5. Distribución por instrumento:\n";
echo str_repeat("-", 80) . "\n";

$instrumentos = executeQuery("
    SELECT
        SUBSTRING_INDEX(SUBSTRING_INDEX(concepto, 'Clases de ', -1), ' G ', 1) as instrumento,
        COUNT(*) as cantidad
    FROM transacciones
    WHERE concepto LIKE 'Mensualidad Clases de% G %'
    GROUP BY instrumento
    ORDER BY cantidad DESC
");

foreach ($instrumentos as $row) {
    printf("%-20s: %3d transacciones\n", $row['instrumento'], $row['cantidad']);
}

$instrumentos_i = executeQuery("
    SELECT
        SUBSTRING_INDEX(SUBSTRING_INDEX(concepto, 'Clases de ', -1), ' I ', 1) as instrumento,
        COUNT(*) as cantidad
    FROM transacciones
    WHERE concepto LIKE 'Mensualidad Clases de% I %'
    GROUP BY instrumento
    ORDER BY cantidad DESC
");

foreach ($instrumentos_i as $row) {
    printf("%-20s: %3d transacciones (Individual)\n", $row['instrumento'], $row['cantidad']);
}

// 6. Muestra de transacciones actualizadas
echo "\n6. Muestra de 10 transacciones actualizadas:\n";
echo str_repeat("-", 80) . "\n";

$muestra = executeQuery("
    SELECT id, fecha, concepto, socio, total
    FROM transacciones
    WHERE concepto LIKE 'Mensualidad Clases de%'
    ORDER BY RAND()
    LIMIT 10
");

foreach ($muestra as $row) {
    printf(
        "ID:%4d | %s | %-45s | %-18s | $%7.2f\n",
        $row['id'],
        $row['fecha'],
        substr($row['concepto'], 0, 45),
        substr($row['socio'], 0, 18),
        $row['total']
    );
}

// 7. Totales generales
echo "\n7. Totales generales:\n";
echo str_repeat("-", 80) . "\n";

$totales = executeQuery("
    SELECT
        COUNT(*) as cantidad,
        SUM(total) as total_monto
    FROM transacciones
    WHERE concepto LIKE 'Mensualidad Clases de%'
");

printf("Total transacciones de alumnos: %d\n", $totales[0]['cantidad']);
printf("Monto total: $%s\n", number_format($totales[0]['total_monto'], 2));

echo "\n====================================================\n";
echo "[OK] VALIDACION COMPLETADA\n";
echo "====================================================\n";
?>
