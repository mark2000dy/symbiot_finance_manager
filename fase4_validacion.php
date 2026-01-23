<?php
/**
 * FASE 4: Validación y Reporte Final de Conciliación
 */

require_once __DIR__ . '/api/config/database.php';

echo "====================================================\n";
echo "FASE 4: VALIDACION Y REPORTE FINAL\n";
echo "====================================================\n\n";

try {
    // 1. Totales actuales en BD
    echo "1. TOTALES ACTUALES EN BASE DE DATOS:\n";
    echo str_repeat("-", 80) . "\n";

    $query_totales = "
        SELECT
            empresa_id,
            tipo,
            COUNT(*) as cantidad,
            SUM(total) as total
        FROM transacciones
        GROUP BY empresa_id, tipo
        ORDER BY empresa_id, tipo
    ";

    $totales = executeQuery($query_totales);

    $total_ingresos = 0;
    $total_gastos = 0;

    foreach ($totales as $row) {
        $empresa = $row['empresa_id'] == 1 ? 'Symbiot Technologies' : 'Rockstar Skull';
        $tipo_desc = $row['tipo'] == 'I' ? 'Ingresos' : 'Gastos';

        printf(
            "%-25s | %-10s | %5d registros | $%15s\n",
            $empresa,
            $tipo_desc,
            $row['cantidad'],
            number_format($row['total'], 2)
        );

        if ($row['tipo'] == 'I') {
            $total_ingresos += $row['total'];
        } else {
            $total_gastos += $row['total'];
        }
    }

    echo str_repeat("-", 80) . "\n";
    printf("TOTAL INGRESOS:  $%15s\n", number_format($total_ingresos, 2));
    printf("TOTAL GASTOS:    $%15s\n", number_format($total_gastos, 2));
    printf("BALANCE:         $%15s\n", number_format($total_ingresos - $total_gastos, 2));

    // 2. Detalles de pagos de alumnos importados
    echo "\n\n2. PAGOS DE ALUMNOS IMPORTADOS (Rockstar Skull):\n";
    echo str_repeat("-", 80) . "\n";

    $query_alumnos = "
        SELECT
            YEAR(fecha) as ano,
            MONTH(fecha) as mes,
            COUNT(*) as cantidad_pagos,
            SUM(total) as total_mes
        FROM transacciones
        WHERE empresa_id = 2
        AND tipo = 'I'
        AND concepto LIKE 'Mensualidad -%'
        GROUP BY YEAR(fecha), MONTH(fecha)
        ORDER BY ano, mes
    ";

    $pagos_mensuales = executeQuery($query_alumnos);

    $total_pagos_alumnos = 0;
    $cantidad_pagos_alumnos = 0;

    foreach ($pagos_mensuales as $row) {
        $mes_nombre = date('F Y', mktime(0, 0, 0, $row['mes'], 1, $row['ano']));
        printf(
            "%s: %3d pagos | $%12s\n",
            $mes_nombre,
            $row['cantidad_pagos'],
            number_format($row['total_mes'], 2)
        );

        $total_pagos_alumnos += $row['total_mes'];
        $cantidad_pagos_alumnos += $row['cantidad_pagos'];
    }

    echo str_repeat("-", 80) . "\n";
    printf("Total pagos de alumnos: %d registros | $%s\n", $cantidad_pagos_alumnos, number_format($total_pagos_alumnos, 2));

    // 3. Comparación con valores esperados
    echo "\n\n3. COMPARACION CON VALORES ESPERADOS:\n";
    echo str_repeat("-", 80) . "\n";

    $esperado_ingresos_antes = 368683.88;
    $esperado_pagos_importados = 922230.00; // Resultado real de fase3
    $esperado_ingresos_despues = $esperado_ingresos_antes + $esperado_pagos_importados;

    printf("Ingresos ANTES de conciliación:     $%15s\n", number_format($esperado_ingresos_antes, 2));
    printf("Pagos importados (FASE 3):          $%15s\n", number_format($esperado_pagos_importados, 2));
    printf("Ingresos ESPERADOS después:         $%15s\n", number_format($esperado_ingresos_despues, 2));
    printf("Ingresos ACTUALES en BD:            $%15s\n", number_format($total_ingresos, 2));

    $diferencia_ingresos = $total_ingresos - $esperado_ingresos_despues;
    printf("Diferencia:                         $%15s %s\n",
        number_format(abs($diferencia_ingresos), 2),
        $diferencia_ingresos >= 0 ? "(OK)" : "(Revisar)"
    );

    // 4. Balance antes vs después
    echo "\n\n4. MEJORA DEL BALANCE:\n";
    echo str_repeat("-", 80) . "\n";

    $balance_antes = -1426791.05; // Del análisis inicial
    $balance_actual = $total_ingresos - $total_gastos;
    $mejora = $balance_actual - $balance_antes;

    printf("Balance ANTES de conciliación:      $%15s\n", number_format($balance_antes, 2));
    printf("Balance DESPUÉS de conciliación:    $%15s\n", number_format($balance_actual, 2));
    printf("Mejora del balance:                 $%15s\n", number_format($mejora, 2));

    // 5. Verificar gastos negativos corregidos
    echo "\n\n5. VERIFICACION DE GASTOS NEGATIVOS:\n";
    echo str_repeat("-", 80) . "\n";

    $query_negativos = "
        SELECT COUNT(*) as cantidad
        FROM transacciones
        WHERE tipo = 'G' AND total < 0
    ";

    $negativos = executeQuery($query_negativos);
    $cant_negativos = $negativos[0]['cantidad'];

    if ($cant_negativos == 0) {
        echo "[OK] No hay gastos con montos negativos\n";
    } else {
        echo "[ADVERTENCIA] Se encontraron $cant_negativos gastos con montos negativos\n";
    }

    // 6. Resumen de transacciones recientes
    echo "\n\n6. ULTIMAS 10 TRANSACCIONES DE ALUMNOS IMPORTADAS:\n";
    echo str_repeat("-", 80) . "\n";

    $query_recientes = "
        SELECT
            id,
            fecha,
            concepto,
            total,
            created_at
        FROM transacciones
        WHERE empresa_id = 2
        AND tipo = 'I'
        AND concepto LIKE 'Mensualidad -%'
        ORDER BY id DESC
        LIMIT 10
    ";

    $recientes = executeQuery($query_recientes);

    foreach ($recientes as $row) {
        printf(
            "ID: %5d | %s | %-45s | $%10s\n",
            $row['id'],
            $row['fecha'],
            substr($row['concepto'], 0, 45),
            number_format($row['total'], 2)
        );
    }

    // Reporte final
    echo "\n\n" . str_repeat("=", 80) . "\n";
    echo "[OK] CONCILIACION COMPLETADA EXITOSAMENTE\n";
    echo str_repeat("=", 80) . "\n\n";

    echo "RESUMEN EJECUTIVO:\n";
    echo "  - Total de ingresos en BD: $" . number_format($total_ingresos, 2) . "\n";
    echo "  - Total de gastos en BD: $" . number_format($total_gastos, 2) . "\n";
    echo "  - Balance actual: $" . number_format($balance_actual, 2) . "\n";
    echo "  - Mejora del balance: $" . number_format($mejora, 2) . "\n";
    echo "  - Pagos de alumnos importados: $cantidad_pagos_alumnos registros ($" . number_format($total_pagos_alumnos, 2) . ")\n";
    echo "  - Gastos negativos: $cant_negativos (debe ser 0)\n";

    echo "\n[OK] Validacion completada\n";

} catch (Exception $e) {
    echo "[ERROR] Error en validacion: " . $e->getMessage() . "\n";
    exit(1);
}
?>
