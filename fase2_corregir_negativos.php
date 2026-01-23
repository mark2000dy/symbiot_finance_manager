<?php
/**
 * FASE 2: Corregir gastos negativos → convertir a ingresos
 */

require_once __DIR__ . '/api/config/database.php';

echo "====================================================\n";
echo "FASE 2: CORREGIR GASTOS NEGATIVOS → INGRESOS\n";
echo "====================================================\n\n";

try {
    // 1. Buscar gastos negativos
    echo "1. Buscando gastos con montos negativos...\n";

    $query = "
        SELECT
            id,
            fecha,
            concepto,
            total,
            empresa_id,
            tipo
        FROM transacciones
        WHERE tipo = 'G' AND total < 0
        ORDER BY fecha
    ";

    $gastos_negativos = executeQuery($query);

    echo "Encontrados: " . count($gastos_negativos) . " registros\n\n";

    if (empty($gastos_negativos)) {
        echo "No hay gastos negativos para corregir.\n";
        exit(0);
    }

    // 2. Mostrar registros a corregir
    echo "2. Registros que serán convertidos de GASTOS → INGRESOS:\n";
    echo str_repeat("-", 80) . "\n";

    $total_a_corregir = 0;
    foreach ($gastos_negativos as $registro) {
        printf(
            "ID: %5d | Fecha: %s | %-50s | $%12.2f\n",
            $registro['id'],
            $registro['fecha'],
            substr($registro['concepto'], 0, 50),
            $registro['total']
        );
        $total_a_corregir += abs($registro['total']);
    }

    echo str_repeat("-", 80) . "\n";
    echo sprintf("Total a convertir a ingresos: $%12.2f\n\n", $total_a_corregir);

    // 3. Confirmar y aplicar cambios
    echo "3. Aplicando correcciones...\n\n";

    $corregidos = 0;
    foreach ($gastos_negativos as $registro) {
        $nuevo_total = abs($registro['total']);

        $update = "
            UPDATE transacciones
            SET
                tipo = 'I',
                total = ?,
                concepto = CONCAT('[CORREGIDO] ', concepto)
            WHERE id = ?
        ";

        executeUpdate($update, [$nuevo_total, $registro['id']]);

        echo sprintf(
            "✅ ID %d corregido: $%12.2f (GASTO) → $%12.2f (INGRESO)\n",
            $registro['id'],
            $registro['total'],
            $nuevo_total
        );

        $corregidos++;
    }

    echo "\n====================================================\n";
    echo "✅ FASE 2 COMPLETADA\n";
    echo "====================================================\n";
    echo "Registros corregidos: $corregidos\n";
    echo "Impacto en balance: +$" . number_format($total_a_corregir * 2, 2) . "\n";
    echo "  (+ Ingresos: $" . number_format($total_a_corregir, 2) . ")\n";
    echo "  (- Gastos: $" . number_format($total_a_corregir, 2) . ")\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
?>
