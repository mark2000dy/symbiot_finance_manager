<?php
/**
 * Script para BORRAR y RE-SEED de ingresos de alumnos desde Excel exportado a CSV
 *
 * USO:
 * 1. El script usa el CSV exportado de "Ingresos RockstarSkull" del Excel
 * 2. Ejecutar: php reseed_ingresos_alumnos.php
 *
 * OPCIONES:
 *   --dry-run     Solo muestra qué haría, sin modificar la BD
 *   --no-delete   No borra transacciones existentes, solo inserta nuevas
 *
 * FORMATO DE CONCEPTO GENERADO:
 * "Mensualidad Clases de [Instrumento] [I/G] [Nombre Alumno]"
 */

// Cargar configuración de base de datos
require_once dirname(__DIR__) . '/config/database.php';

// Configuración
$csvFile = __DIR__ . '/csv_export/Ingresos RockstarSkull.csv';
$dryRun = in_array('--dry-run', $argv ?? []);
$noDelete = in_array('--no-delete', $argv ?? []);

echo "===========================================\n";
echo "  RESEED DE INGRESOS DE ALUMNOS (EXCEL)\n";
echo "===========================================\n\n";

if ($dryRun) {
    echo "⚠️  MODO DRY-RUN: No se modificará la BD\n\n";
}

// Verificar que existe el archivo CSV
if (!file_exists($csvFile)) {
    echo "❌ ERROR: No se encontró el archivo CSV\n";
    echo "   Ruta esperada: $csvFile\n\n";
    echo "   Ejecuta primero el script de exportación de Excel:\n";
    echo "   powershell -ExecutionPolicy Bypass -File export_all_sheets.ps1\n";
    exit(1);
}

// ============================================================
// MAPEO DE COLUMNAS MENSUALES A FECHAS
// ============================================================
// La estructura del Excel tiene columnas mensuales que corresponden a:
// - Julio 2023 hasta Enero 2026
$monthColumns = [
    17 => ['month' => 7, 'year' => 2023],   // Julio
    18 => ['month' => 8, 'year' => 2023],   // Agosto
    19 => ['month' => 9, 'year' => 2023],   // Septiembre
    20 => ['month' => 10, 'year' => 2023],  // Octubre
    21 => ['month' => 11, 'year' => 2023],  // Noviembre
    22 => ['month' => 12, 'year' => 2023],  // Diciembre
    23 => ['month' => 1, 'year' => 2024],   // Enero
    24 => ['month' => 2, 'year' => 2024],   // Febrero
    25 => ['month' => 3, 'year' => 2024],   // Marzo
    26 => ['month' => 4, 'year' => 2024],   // Abril
    27 => ['month' => 5, 'year' => 2024],   // Mayo
    28 => ['month' => 6, 'year' => 2024],   // Junio
    29 => ['month' => 7, 'year' => 2024],   // Julio2
    30 => ['month' => 8, 'year' => 2024],   // Agosto2
    31 => ['month' => 9, 'year' => 2024],   // Septiembre2
    32 => ['month' => 10, 'year' => 2024],  // Octubre2
    33 => ['month' => 11, 'year' => 2024],  // Noviembre2
    34 => ['month' => 12, 'year' => 2024],  // Diciembre3
    35 => ['month' => 1, 'year' => 2025],   // Enero2
    36 => ['month' => 2, 'year' => 2025],   // Febrero2
    37 => ['month' => 3, 'year' => 2025],   // Marzo2
    38 => ['month' => 4, 'year' => 2025],   // Abril2
    39 => ['month' => 5, 'year' => 2025],   // Mayo2
    40 => ['month' => 6, 'year' => 2025],   // Junio2
    41 => ['month' => 7, 'year' => 2025],   // Julio3
    42 => ['month' => 8, 'year' => 2025],   // Agosto3
    43 => ['month' => 9, 'year' => 2025],   // Septiembre3
    44 => ['month' => 10, 'year' => 2025],  // Octubre3
    45 => ['month' => 11, 'year' => 2025],  // Noviembre3
    46 => ['month' => 12, 'year' => 2025],  // Diciembre2
    47 => ['month' => 1, 'year' => 2026],   // Enero3
];

// ============================================================
// PASO 1: ELIMINAR TRANSACCIONES DE MENSUALIDADES EXISTENTES
// ============================================================
if (!$noDelete) {
    echo "🗑️  PASO 1: Eliminando transacciones de mensualidades existentes...\n";

    // Contar cuántas se van a eliminar
    $countQuery = executeQuery("
        SELECT COUNT(*) as total
        FROM transacciones
        WHERE tipo = 'I'
        AND empresa_id = 1
        AND LOWER(concepto) LIKE '%mensualidad%'
    ");
    $totalToDelete = $countQuery[0]['total'] ?? 0;

    echo "   📊 Transacciones a eliminar: $totalToDelete\n";

    if (!$dryRun && $totalToDelete > 0) {
        executeQuery("
            DELETE FROM transacciones
            WHERE tipo = 'I'
            AND empresa_id = 1
            AND LOWER(concepto) LIKE '%mensualidad%'
        ");
        echo "   ✅ Eliminadas $totalToDelete transacciones de mensualidades\n";
    } else if ($dryRun) {
        echo "   [DRY-RUN] Se eliminarían $totalToDelete transacciones\n";
    }
    echo "\n";
}

// ============================================================
// PASO 2: LEER Y PROCESAR CSV
// ============================================================
echo "📂 PASO 2: Leyendo archivo CSV...\n";

$handle = fopen($csvFile, 'r');
if (!$handle) {
    echo "❌ ERROR: No se pudo abrir el archivo CSV\n";
    exit(1);
}

// Detectar BOM de UTF-8 y saltarlo
$bom = fread($handle, 3);
if ($bom !== "\xEF\xBB\xBF") {
    rewind($handle);
}

// Leer encabezados
$headers = fgetcsv($handle);
if (!$headers) {
    echo "❌ ERROR: El archivo CSV está vacío\n";
    exit(1);
}

echo "   📋 Total columnas: " . count($headers) . "\n";
echo "   📋 Columnas relevantes:\n";
echo "      - Alumno (col 1)\n";
echo "      - Maestro (col 3)\n";
echo "      - Fecha inscripción (col 4)\n";
echo "      - Clase (col 7)\n";
echo "      - Tipo I/G (col 8)\n";
echo "      - Forma de Pago (col 10)\n";
echo "      - Meses: columnas 17-47\n\n";

// ============================================================
// PASO 3: PROCESAR FILAS E INSERTAR TRANSACCIONES
// ============================================================
echo "🔄 PASO 3: Procesando alumnos e insertando transacciones...\n\n";

$totalRows = 0;
$totalTransactions = 0;
$skipped = 0;
$errors = 0;

// Función para parsear monto
function parseMonto($value) {
    if (empty($value)) return 0;
    $value = str_replace(['$', ',', ' ', 'MXN'], '', $value);
    return floatval($value);
}

// Función para parsear fecha de inscripción y obtener el día
function getPaymentDay($fechaInscripcion) {
    // Formatos posibles: 29-Jan-2025, 4-Jun-2024, etc.
    $formatos = ['j-M-Y', 'd-M-Y', 'j-M-y', 'd-M-y'];
    foreach ($formatos as $formato) {
        $dt = DateTime::createFromFormat($formato, $fechaInscripcion);
        if ($dt !== false) {
            return (int)$dt->format('j');
        }
    }
    // Si no parseó, intentar strtotime
    $ts = strtotime($fechaInscripcion);
    if ($ts !== false) {
        return (int)date('j', $ts);
    }
    return 15; // Por defecto día 15
}

while (($row = fgetcsv($handle)) !== false) {
    $totalRows++;

    // Saltar filas vacías o sin nombre de alumno
    if (empty($row[1]) || empty(trim($row[1]))) {
        $skipped++;
        continue;
    }

    // Extraer datos del alumno
    $alumno = trim($row[1] ?? '');
    $maestro = trim($row[3] ?? 'Escuela');
    $fechaInscripcion = trim($row[4] ?? '');
    $clase = trim($row[7] ?? '');
    $tipo = strtoupper(trim($row[8] ?? 'G'));
    $formaPago = trim($row[10] ?? 'TPV');

    // Validar datos mínimos
    if (empty($alumno) || empty($clase)) {
        echo "   ⚠️  Fila $totalRows: Datos incompletos - alumno='$alumno', clase='$clase'\n";
        $skipped++;
        continue;
    }

    // Normalizar tipo
    if (!in_array($tipo, ['I', 'G'])) {
        $tipo = 'G';
    }

    // Normalizar forma de pago
    if (empty($formaPago) || $formaPago === 'Efectivo') {
        $formaPago = 'Efectivo';
    } elseif (stripos($formaPago, 'Transfer') !== false) {
        $formaPago = 'Transferencia';
    } else {
        $formaPago = 'TPV';
    }

    // Obtener día de pago de la fecha de inscripción
    $paymentDay = getPaymentDay($fechaInscripcion);

    // Construir concepto
    $concepto = "Mensualidad Clases de $clase $tipo $alumno";

    // Procesar cada columna mensual
    $studentTransactions = 0;
    foreach ($monthColumns as $colIndex => $dateInfo) {
        if (!isset($row[$colIndex])) continue;

        $monto = parseMonto($row[$colIndex]);
        if ($monto <= 0) continue;

        // Construir fecha de pago
        $year = $dateInfo['year'];
        $month = $dateInfo['month'];

        // Ajustar día si es mayor al último día del mes
        $lastDayOfMonth = (int)date('t', mktime(0, 0, 0, $month, 1, $year));
        $day = min($paymentDay, $lastDayOfMonth);

        $fechaPago = sprintf('%04d-%02d-%02d', $year, $month, $day);

        // Insertar transacción
        if (!$dryRun) {
            try {
                $insertQuery = "
                    INSERT INTO transacciones (
                        fecha, concepto, socio, empresa_id, forma_pago,
                        cantidad, precio_unitario, tipo, created_by
                    ) VALUES (?, ?, ?, 1, ?, 1, ?, 'I', 1)
                ";

                executeQuery($insertQuery, [
                    $fechaPago,
                    $concepto,
                    $maestro,
                    $formaPago,
                    $monto
                ]);

                $totalTransactions++;
                $studentTransactions++;

            } catch (Exception $e) {
                echo "   ❌ Error fila $totalRows ($alumno): " . $e->getMessage() . "\n";
                $errors++;
            }
        } else {
            $totalTransactions++;
            $studentTransactions++;
        }
    }

    // Mostrar progreso por alumno
    if ($studentTransactions > 0) {
        if ($dryRun && $totalRows <= 5) {
            echo "   [DRY] $alumno ($clase $tipo): $studentTransactions transacciones\n";
        }
    }

    // Mostrar progreso cada 20 alumnos
    if ($totalRows % 20 === 0) {
        echo "   📈 Procesados $totalRows alumnos, $totalTransactions transacciones...\n";
    }
}

fclose($handle);

// ============================================================
// RESUMEN
// ============================================================
echo "\n===========================================\n";
echo "  RESUMEN\n";
echo "===========================================\n";
echo "Total filas en CSV: $totalRows\n";
echo "Alumnos omitidos: $skipped\n";
echo "Transacciones creadas: $totalTransactions\n";
echo "Errores: $errors\n";

if ($dryRun) {
    echo "\n⚠️  Esto fue un DRY-RUN. Ejecuta sin --dry-run para modificar la BD.\n";
    echo "   Comando: php reseed_ingresos_alumnos.php\n";
}

// ============================================================
// VERIFICACIÓN POST-SEED
// ============================================================
if (!$dryRun && $totalTransactions > 0) {
    echo "\n📊 Verificación de Carlos Maya:\n";
    $carlosTransactions = executeQuery("
        SELECT concepto, fecha, (cantidad * precio_unitario) as total
        FROM transacciones
        WHERE tipo = 'I'
        AND empresa_id = 1
        AND LOWER(concepto) LIKE '%carlos%maya%'
        ORDER BY fecha DESC
        LIMIT 10
    ");

    if (!empty($carlosTransactions)) {
        foreach ($carlosTransactions as $t) {
            echo "   - {$t['fecha']}: {$t['concepto']} - \${$t['total']}\n";
        }
    } else {
        echo "   No se encontraron transacciones para Carlos Maya\n";
    }
}

echo "\n✅ Proceso completado\n";
