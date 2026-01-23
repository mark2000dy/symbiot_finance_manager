<?php
/**
 * Script de diagnóstico para tipo_clase
 * Temporal - verificar distribución de datos
 */

require_once 'config/database.php';

echo "\n🔍 DIAGNÓSTICO: Distribución de tipo_clase en tabla alumnos\n";
echo "================================================================\n\n";

// Query 1: Distribución por tipo_clase y estatus
echo "📊 1. DISTRIBUCIÓN POR TIPO_CLASE Y ESTATUS:\n";
echo "---------------------------------------------\n";
$query1 = "
    SELECT
        tipo_clase,
        estatus,
        COUNT(*) as total
    FROM alumnos
    WHERE empresa_id = 1
        AND nombre NOT LIKE '[ELIMINADO]%'
    GROUP BY tipo_clase, estatus
    ORDER BY estatus, tipo_clase
";
$result1 = executeQuery($query1, []);
foreach ($result1 as $row) {
    printf("   %-15s | %-10s | %3d alumnos\n", $row['tipo_clase'], $row['estatus'], $row['total']);
}

echo "\n📋 2. VALORES ÚNICOS DE TIPO_CLASE (detectar variaciones):\n";
echo "----------------------------------------------------------\n";
$query2 = "
    SELECT
        CONCAT('[', tipo_clase, ']') as tipo_clase_raw,
        LENGTH(tipo_clase) as longitud,
        COUNT(*) as cantidad
    FROM alumnos
    WHERE empresa_id = 1
        AND nombre NOT LIKE '[ELIMINADO]%'
    GROUP BY tipo_clase
    ORDER BY cantidad DESC
";
$result2 = executeQuery($query2, []);
foreach ($result2 as $row) {
    printf("   %s (longitud: %d caracteres) → %d registros\n",
        $row['tipo_clase_raw'],
        $row['longitud'],
        $row['cantidad']
    );
}

echo "\n🎯 3. CONTEO ESPECÍFICO (query actual del endpoint):\n";
echo "-----------------------------------------------------\n";
$query3 = "
    SELECT
        SUM(CASE WHEN tipo_clase = 'Grupal' AND estatus = 'Activo' THEN 1 ELSE 0 END) as clases_grupales,
        SUM(CASE WHEN tipo_clase = 'Individual' AND estatus = 'Activo' THEN 1 ELSE 0 END) as clases_individuales,
        SUM(CASE WHEN estatus = 'Activo' THEN 1 ELSE 0 END) as total_activos,
        SUM(CASE WHEN estatus = 'Baja' THEN 1 ELSE 0 END) as total_bajas
    FROM alumnos
    WHERE empresa_id = 1
        AND nombre NOT LIKE '[ELIMINADO]%'
";
$result3 = executeQuery($query3, []);
$metricas = $result3[0];
echo "   Clases Grupales (Activos):     " . $metricas['clases_grupales'] . "\n";
echo "   Clases Individuales (Activos): " . $metricas['clases_individuales'] . "\n";
echo "   Total Activos:                 " . $metricas['total_activos'] . "\n";
echo "   Total Bajas:                   " . $metricas['total_bajas'] . "\n";
echo "   SUMA (Grupales + Individuales): " . ($metricas['clases_grupales'] + $metricas['clases_individuales']) . "\n";

// Verificar si la suma coincide
if (($metricas['clases_grupales'] + $metricas['clases_individuales']) != $metricas['total_activos']) {
    echo "\n⚠️  ADVERTENCIA: La suma de Grupales + Individuales NO coincide con Total Activos\n";
    echo "   Esto indica que hay alumnos activos con tipo_clase diferente a 'Grupal' o 'Individual'\n";
}

echo "\n🔍 4. MUESTRA DE ALUMNOS INDIVIDUALES (primeros 10):\n";
echo "----------------------------------------------------\n";
$query4 = "
    SELECT
        nombre,
        tipo_clase,
        estatus,
        fecha_inscripcion
    FROM alumnos
    WHERE empresa_id = 1
        AND tipo_clase = 'Individual'
        AND estatus = 'Activo'
        AND nombre NOT LIKE '[ELIMINADO]%'
    ORDER BY fecha_inscripcion DESC
    LIMIT 10
";
$result4 = executeQuery($query4, []);
if (count($result4) > 0) {
    foreach ($result4 as $i => $alumno) {
        printf("   %2d. %-30s | %s | %s\n",
            $i + 1,
            $alumno['nombre'],
            $alumno['tipo_clase'],
            $alumno['fecha_inscripcion']
        );
    }
} else {
    echo "   (No hay alumnos individuales activos)\n";
}

echo "\n🔍 5. MUESTRA DE ALUMNOS GRUPALES (primeros 5):\n";
echo "------------------------------------------------\n";
$query5 = "
    SELECT
        nombre,
        tipo_clase,
        estatus,
        fecha_inscripcion
    FROM alumnos
    WHERE empresa_id = 1
        AND tipo_clase = 'Grupal'
        AND estatus = 'Activo'
        AND nombre NOT LIKE '[ELIMINADO]%'
    ORDER BY fecha_inscripcion DESC
    LIMIT 5
";
$result5 = executeQuery($query5, []);
if (count($result5) > 0) {
    foreach ($result5 as $i => $alumno) {
        printf("   %2d. %-30s | %s | %s\n",
            $i + 1,
            $alumno['nombre'],
            $alumno['tipo_clase'],
            $alumno['fecha_inscripcion']
        );
    }
} else {
    echo "   (No hay alumnos grupales activos)\n";
}

echo "\n================================================================\n";
echo "✅ Diagnóstico completado\n\n";
?>
