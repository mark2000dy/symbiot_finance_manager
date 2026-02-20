<?php
// ============================================================
// REPORTE OPERATIVO — Maestros, Salones, Altas/Bajas, Flujo,
//                     ROI, VPN y Utilidad Neta
// Generado con Dompdf. GET params: empresa (int), ano (int)
// ============================================================

// 1. Autenticación por sesión
session_start();
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    die('<h1 style="font-family:sans-serif;color:#dc3545">Acceso no autorizado.</h1><p><a href="gastos/index.html">Iniciar sesión</a></p>');
}

ob_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
ini_set('memory_limit', '512M');
set_time_limit(300);

// 2. Dependencias
if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
    die("Error crítico: No se encuentra vendor/. Ejecuta 'composer install'.");
}
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/api/config/database.php';

use Dompdf\Dompdf;
use Dompdf\Options;

// 3. Parámetros
$empresa_id = max(1, (int)($_GET['empresa'] ?? 1));
$ano        = max(2020, (int)($_GET['ano'] ?? (int)date('Y')));

// 4. Migraciones de BD (idempotentes)
try {
    $pdo = getConnection();

    $pdo->exec("CREATE TABLE IF NOT EXISTS salones (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        nombre      VARCHAR(100)  NOT NULL,
        capacidad   INT           DEFAULT 4,
        empresa_id  INT           NOT NULL,
        descripcion VARCHAR(255),
        activo      TINYINT       DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Salones reales de la escuela — ON DUPLICATE KEY UPDATE para corregir registros previos
    $pdo->exec("INSERT INTO salones (id, nombre, capacidad, empresa_id, descripcion) VALUES
        (1, 'Salón Batería',   2, 1, 'Batería: máx 2 alumnos'),
        (2, 'Salón Guitarra',  5, 1, 'Guitarra: máx 5 alumnos'),
        (3, 'Salón Múltiple',  3, 1, 'Bajo/Canto: máx 3 — Teclado: máx 2 (solo 2 teclados)')
        ON DUPLICATE KEY UPDATE
            nombre      = VALUES(nombre),
            capacidad   = VALUES(capacidad),
            descripcion = VALUES(descripcion)");

    // Agregar salon_id si aún no existe
    $cols = $pdo->query("SHOW COLUMNS FROM alumnos LIKE 'salon_id'")->fetchAll();
    if (empty($cols)) {
        $pdo->exec("ALTER TABLE alumnos ADD COLUMN salon_id INT DEFAULT NULL");
    }

    // Auto-asignación por instrumento (reemplaza la anterior por tipo_clase, actualiza todos)
    $pdo->exec("UPDATE alumnos SET salon_id = 1 WHERE clase = 'Batería'                     AND empresa_id = 1 AND nombre NOT LIKE '[ELIMINADO]%'");
    $pdo->exec("UPDATE alumnos SET salon_id = 2 WHERE clase = 'Guitarra'                    AND empresa_id = 1 AND nombre NOT LIKE '[ELIMINADO]%'");
    $pdo->exec("UPDATE alumnos SET salon_id = 3 WHERE clase IN ('Canto','Bajo','Teclado')   AND empresa_id = 1 AND nombre NOT LIKE '[ELIMINADO]%'");

} catch (Exception $e) {
    error_log("Reporte operativo — migración: " . $e->getMessage());
}

// ============================================================
// 5. QUERIES DE DATOS
// ============================================================
try {

    // 5a. Nombre de empresa
    $empRow = executeQuery("SELECT nombre FROM empresas WHERE id = ? LIMIT 1", [$empresa_id]);
    $empNombre = !empty($empRow) ? $empRow[0]['nombre'] : 'Empresa #' . $empresa_id;

    // 5b. Resumen financiero del año
    $finRow = executeQuery("
        SELECT
            SUM(CASE WHEN tipo = 'I' THEN total ELSE 0 END) AS ingresos,
            SUM(CASE WHEN tipo = 'G' THEN total ELSE 0 END) AS gastos
        FROM transacciones
        WHERE empresa_id = ? AND YEAR(fecha) = ?
    ", [$empresa_id, $ano]);
    $totalIngresos = floatval($finRow[0]['ingresos'] ?? 0);
    $totalGastos   = floatval($finRow[0]['gastos']   ?? 0);
    $utilidadNeta  = $totalIngresos - $totalGastos;

    // 5c. Inversión neta de socios (mismo criterio que getReporteBalanceGeneralV2)
    $sociosInversores = ['Marco Delgado', 'Hugo Vazquez', 'Antonio Razo'];
    $ph = implode(',', array_fill(0, count($sociosInversores), '?'));
    $invRow = executeQuery("
        SELECT
            SUM(CASE WHEN tipo = 'G' THEN total ELSE 0 END)                                           AS total_gastos,
            SUM(CASE WHEN tipo = 'I' AND LOWER(concepto) LIKE '%abono%' THEN total ELSE 0 END)        AS total_abonos
        FROM transacciones
        WHERE empresa_id = ? AND YEAR(fecha) = ? AND socio IN ($ph)
    ", array_merge([$empresa_id, $ano], $sociosInversores));
    $invGastos  = floatval($invRow[0]['total_gastos'] ?? 0);
    $invAbonos  = floatval($invRow[0]['total_abonos'] ?? 0);
    $inversionNeta = $invGastos - $invAbonos;
    $roi = ($inversionNeta > 0) ? (($utilidadNeta / $inversionNeta) * 100) : null;

    // 5d. Total alumnos activos (distintos por nombre, empresa)
    $activosRow = executeQuery("
        SELECT COUNT(DISTINCT nombre) AS activos
        FROM alumnos
        WHERE empresa_id = ? AND estatus = 'Activo' AND nombre NOT LIKE '[ELIMINADO]%'
    ", [$empresa_id]);
    $totalActivos = (int)($activosRow[0]['activos'] ?? 0);

    // 5e. Flujo mensual del año (para flujo de efectivo y VPN)
    $flujoMensual = executeQuery("
        SELECT
            DATE_FORMAT(fecha, '%Y-%m')                                        AS mes,
            SUM(CASE WHEN tipo = 'I' THEN total ELSE 0 END)                   AS ingresos,
            SUM(CASE WHEN tipo = 'G' THEN total ELSE 0 END)                   AS gastos
        FROM transacciones
        WHERE empresa_id = ? AND YEAR(fecha) = ?
        GROUP BY DATE_FORMAT(fecha, '%Y-%m')
        ORDER BY mes
    ", [$empresa_id, $ano]);

    // Calcular VPN (tasa 1% mensual = 12% anual)
    $tasaMensual = 0.01;
    $vpn = 0.0;
    $flujoAcumulado = 0.0;
    $flujoConVPN = [];
    $t = 1;
    foreach ($flujoMensual as $fm) {
        $flujoNeto = floatval($fm['ingresos']) - floatval($fm['gastos']);
        $flujoAcumulado += $flujoNeto;
        $vpnMes = $flujoNeto / pow(1 + $tasaMensual, $t);
        $vpn += $vpnMes;
        $flujoConVPN[] = [
            'mes'       => $fm['mes'],
            'ingresos'  => floatval($fm['ingresos']),
            'gastos'    => floatval($fm['gastos']),
            'neto'      => $flujoNeto,
            'acumulado' => $flujoAcumulado,
            'vpn_mes'   => $vpnMes,
        ];
        $t++;
    }

    // 5f. Altas por mes del año
    // Subquery: 1 fila por nombre con su MIN(fecha_inscripcion); HAVING filtra el año
    $altasMes = executeQuery("
        SELECT mes, COUNT(*) AS altas
        FROM (
            SELECT DATE_FORMAT(MIN(fecha_inscripcion), '%Y-%m') AS mes
            FROM alumnos
            WHERE empresa_id = ?
              AND nombre NOT LIKE '[ELIMINADO]%'
            GROUP BY nombre
            HAVING YEAR(MIN(fecha_inscripcion)) = ?
        ) sub
        GROUP BY mes
        ORDER BY mes
    ", [$empresa_id, $ano]);
    $altasPorMes = [];
    foreach ($altasMes as $row) {
        $altasPorMes[$row['mes']] = (int)$row['altas'];
    }
    ksort($altasPorMes);

    // 5g. Bajas por mes (aproximación con fecha_ultimo_pago de estatus=Baja)
    // Subquery: 1 fila por nombre con su fecha de baja estimada; filtramos año en PHP
    $bajasMes = executeQuery("
        SELECT mes, COUNT(*) AS bajas
        FROM (
            SELECT DATE_FORMAT(
                       COALESCE(MAX(fecha_ultimo_pago), MAX(fecha_inscripcion)),
                       '%Y-%m'
                   ) AS mes
            FROM alumnos
            WHERE empresa_id = ?
              AND nombre NOT LIKE '[ELIMINADO]%'
              AND estatus = 'Baja'
            GROUP BY nombre
            HAVING mes IS NOT NULL AND LEFT(mes, 4) = ?
        ) sub
        GROUP BY mes
        ORDER BY mes
    ", [$empresa_id, (string)$ano]);
    $bajasPorMes = [];
    foreach ($bajasMes as $row) {
        $bajasPorMes[$row['mes']] = (int)$row['bajas'];
    }
    ksort($bajasPorMes);

    // Resumen altas/bajas
    $totalAltas = array_sum($altasPorMes);
    $totalBajas = array_sum($bajasPorMes);

    // Meses únicos (unión de ambos sets)
    $mesesAB = array_unique(array_merge(array_keys($altasPorMes), array_keys($bajasPorMes)));
    sort($mesesAB);

    // 5h. Ocupación de maestros
    $maestros = executeQuery("
        SELECT
            COALESCE(m.nombre, 'Sin asignar')                                                    AS maestro,
            m.especialidad,
            COUNT(CASE WHEN a.estatus = 'Activo' THEN 1 END)                                    AS activos,
            COUNT(CASE WHEN a.estatus = 'Baja'   THEN 1 END)                                    AS bajas,
            SUM(CASE WHEN a.estatus = 'Activo' THEN COALESCE(a.precio_mensual, 0) ELSE 0 END)   AS ingreso_potencial
        FROM alumnos a
        LEFT JOIN maestros m ON a.maestro_id = m.id
        WHERE a.empresa_id = ? AND a.nombre NOT LIKE '[ELIMINADO]%'
        GROUP BY m.id, m.nombre, m.especialidad
        ORDER BY activos DESC
    ", [$empresa_id]);

    // 5i. Ocupación de salones (Batería y Guitarra tienen capacidad fija)
    $salones = executeQuery("
        SELECT
            s.id,
            s.nombre                                                                               AS salon,
            s.capacidad,
            COUNT(CASE WHEN a.estatus = 'Activo' AND a.nombre NOT LIKE '[ELIMINADO]%' THEN 1 END) AS activos
        FROM salones s
        LEFT JOIN alumnos a ON a.salon_id = s.id AND a.empresa_id = s.empresa_id
        WHERE s.empresa_id = ?
        GROUP BY s.id, s.nombre, s.capacidad
        ORDER BY s.id
    ", [$empresa_id]);

    // 5i-bis. Desglose de Sala Múltiple por instrumento (capacidad varía por clase)
    $salonMultipleDetalle = executeQuery("
        SELECT
            a.clase,
            COUNT(CASE WHEN a.estatus = 'Activo' THEN 1 END) AS activos,
            COUNT(CASE WHEN a.estatus = 'Baja'   THEN 1 END) AS bajas
        FROM alumnos a
        WHERE a.salon_id = 3 AND a.empresa_id = ?
          AND a.nombre NOT LIKE '[ELIMINADO]%'
        GROUP BY a.clase
        ORDER BY a.clase
    ", [$empresa_id]);
    // Capacidad real por instrumento en Sala Múltiple
    $capMultiple = ['Bajo' => 3, 'Canto' => 3, 'Teclado' => 2];

    // 5i-ter. Alumnos activos con horario para grilla semanal
    $horariosAlumnos = executeQuery("
        SELECT a.nombre, a.clase, a.tipo_clase, a.horario, a.salon_id
        FROM alumnos a
        WHERE a.empresa_id = ? AND a.estatus = 'Activo'
          AND a.nombre NOT LIKE '[ELIMINADO]%'
          AND a.horario IS NOT NULL AND a.horario != ''
    ", [$empresa_id]);

    // 5j. Participación de socios (acumulado histórico, mismo criterio que V2)
    $sociosData = executeQuery("
        SELECT
            socio,
            SUM(CASE WHEN tipo = 'G' THEN total ELSE 0 END)                                    AS gastos,
            SUM(CASE WHEN tipo = 'I' AND LOWER(concepto) LIKE '%abono%' THEN total ELSE 0 END) AS abonos
        FROM transacciones
        WHERE empresa_id = ? AND socio IN ($ph)
        GROUP BY socio
        ORDER BY gastos DESC
    ", array_merge([$empresa_id], $sociosInversores));

    $totalInversionHistorica = 0;
    foreach ($sociosData as &$s) {
        $s['inversion'] = floatval($s['gastos']) - floatval($s['abonos']);
        $totalInversionHistorica += $s['inversion'];
    }
    unset($s);
    foreach ($sociosData as &$s) {
        $s['pct'] = $totalInversionHistorica > 0 ? ($s['inversion'] / $totalInversionHistorica * 100) : 0;
    }
    unset($s);

} catch (Exception $e) {
    $output = ob_get_clean();
    die("<h1>Error consultando datos</h1><pre>" . htmlspecialchars($e->getMessage()) . "</pre>");
}

// ============================================================
// 6. HELPERS
// ============================================================
function fmt($n, $decimals = 0) {
    return '$' . number_format($n, $decimals, '.', ',');
}
function fmtPct($n) {
    return number_format($n, 1) . '%';
}
function mesLabel($ym) {
    $meses = ['01'=>'Ene','02'=>'Feb','03'=>'Mar','04'=>'Abr','05'=>'May','06'=>'Jun',
              '07'=>'Jul','08'=>'Ago','09'=>'Sep','10'=>'Oct','11'=>'Nov','12'=>'Dic'];
    [$y, $m] = explode('-', $ym);
    return ($meses[$m] ?? $m) . ' ' . $y;
}

// Replica de _parseSlots() de dashboard-horarios.js
// Formato: "15:00 a 16:00 Lunes y 17:00 a 18:00 Miércoles"
function parseSlots($horarioStr) {
    if (!$horarioStr) return [];
    $dayMap = [
        'lun'=>1,'lunes'=>1,'mar'=>2,'martes'=>2,
        'mie'=>3,'mier'=>3,'miercoles'=>3,'jue'=>4,'jueves'=>4,
        'vie'=>5,'viernes'=>5,'sab'=>6,'sabado'=>6
    ];
    $slots = [];
    preg_match_all('/(\d{1,2}):(\d{2})\s+a\s+(\d{1,2}):(\d{2})\s+([A-Za-záéíóúÁÉÍÓÚ]+)/u',
                   $horarioStr, $matches, PREG_SET_ORDER);
    foreach ($matches as $m) {
        $startH = (int)$m[1];
        $endH   = (int)$m[3];
        $raw    = strtolower($m[5]);
        $norm   = str_replace(['á','é','í','ó','ú'], ['a','e','i','o','u'], $raw);
        $dayNum = null;
        foreach ($dayMap as $k => $v) {
            if (strpos($norm, $k) === 0) { $dayNum = $v; break; }
        }
        if ($dayNum === null) continue;
        for ($h = $startH; $h < $endH; $h++) {
            $slots[] = ['day' => $dayNum, 'hour' => $h];
        }
    }
    return $slots;
}

// Configuración de horario escolar (igual que JS)
$SCHOOL_SCHEDULE = [1=>[15,20],2=>[15,20],3=>[15,20],4=>[15,20],5=>[15,20],6=>[11,16]];
$SCHOOL_HOURS    = [11,12,13,14,15,16,17,18,19];
$DIAS            = [1=>'Lun',2=>'Mar',3=>'Mié',4=>'Jue',5=>'Vie',6=>'Sáb'];
$DIAS_NUMS       = [1,2,3,4,5,6];
$INSTR_CAP       = ['Guitarra'=>5,'Batería'=>2,'Canto'=>3,'Bajo'=>3,'Teclado'=>2];

// Construir matriz de slots por salón
// $slotsMatrix[$salonId][$day][$hour] = ['count'=>n, 'cap'=>n, 'hasIndiv'=>bool]
$slotsMatrix = [1=>[], 2=>[], 3=>[]];
foreach ($horariosAlumnos as $al) {
    $salonId = (int)($al['salon_id'] ?? 0);
    if (!array_key_exists($salonId, $slotsMatrix)) continue;
    $clase   = $al['clase'];
    $cap     = $INSTR_CAP[$clase] ?? 3;
    $isIndiv = ($al['tipo_clase'] === 'Individual');
    foreach (parseSlots($al['horario']) as $slot) {
        $d = $slot['day']; $h = $slot['hour'];
        if (!isset($slotsMatrix[$salonId][$d]))       $slotsMatrix[$salonId][$d]    = [];
        if (!isset($slotsMatrix[$salonId][$d][$h]))   $slotsMatrix[$salonId][$d][$h] =
            ['count'=>0, 'cap'=>$cap, 'hasIndiv'=>false];
        $cell = &$slotsMatrix[$salonId][$d][$h];
        if ($isIndiv) { $cell['hasIndiv'] = true; } else { $cell['count']++; }
        unset($cell);
    }
}

// Helper: renderiza la grilla HTML de un salón para Dompdf
function buildSalonGrid($salonId, $salonNombre, $slotsMatrix, $SCHOOL_SCHEDULE, $SCHOOL_HOURS, $DIAS, $DIAS_NUMS) {
    $grid = $slotsMatrix[$salonId] ?? [];

    // Solo horas que sean operativas en al menos un día
    $opHours = [];
    foreach ($SCHOOL_HOURS as $h) {
        foreach ($DIAS_NUMS as $d) {
            $s = $SCHOOL_SCHEDULE[$d];
            if ($h >= $s[0] && $h < $s[1]) { $opHours[] = $h; break; }
        }
    }

    $html = '<p style="font-size:9px;font-weight:bold;margin:10px 0 3px;">'
          . htmlspecialchars($salonNombre) . '</p>';
    $html .= '<table class="sched-table"><thead><tr>'
           . '<th style="width:26px;">Hora</th>';
    foreach ($DIAS_NUMS as $d) {
        $html .= '<th>' . $DIAS[$d] . '</th>';
    }
    $html .= '</tr></thead><tbody>';

    foreach ($opHours as $h) {
        $html .= '<tr><td style="background:#444;color:#fff;font-weight:bold;">' . $h . 'h</td>';
        foreach ($DIAS_NUMS as $d) {
            $sched = $SCHOOL_SCHEDULE[$d];
            $isOp  = ($h >= $sched[0] && $h < $sched[1]);
            if (!$isOp) {
                $html .= '<td class="sched-closed">—</td>';
                continue;
            }
            $cell = $grid[$d][$h] ?? null;
            if (!$cell) {
                $html .= '<td class="sched-free">libre</td>';
                continue;
            }
            if ($cell['hasIndiv']) {
                $html .= '<td class="sched-indiv">indiv.</td>';
                continue;
            }
            $cnt = $cell['count'];
            $cap = $cell['cap'];
            $pct = $cap > 0 ? ($cnt / $cap) : 0;
            $cls = $pct >= 1 ? 'sched-full' : ($pct >= 0.5 ? 'sched-mid' : 'sched-low');
            $html .= '<td class="' . $cls . '">' . $cnt . '/' . $cap . '</td>';
        }
        $html .= '</tr>';
    }
    $html .= '</tbody></table>';
    return $html;
}

// Capacidad real semanal (alumno-slots disponibles por semana)
// Lun-Vie 15:00-20:00 = 5h × 5 días = 25 slots
// Sáb    11:00-16:00 = 5h × 1 día  =  5 slots → total: 30 slots/sem
$totalSlotsSemanales = 0;
foreach ($DIAS_NUMS as $d) {
    $sch = $SCHOOL_SCHEDULE[$d];
    $totalSlotsSemanales += $sch[1] - $sch[0];  // = 30
}

// Capacidad por slot de cada salón (alumnos simultáneos por franja de 1 h)
// Múltiple = 3 (máx Bajo/Canto); Teclado = 2 se detalla aparte
$CAP_POR_SLOT = [1 => 2, 2 => 5, 3 => 3];

$realCap     = [];   // alumno-slots máximos por semana
$realOcupado = [];   // alumno-slots efectivamente usados

foreach ([1, 2, 3] as $sid) {
    $capSlot = $CAP_POR_SLOT[$sid];
    $realCap[$sid] = $capSlot * $totalSlotsSemanales;
    $occ = 0;
    foreach (($slotsMatrix[$sid] ?? []) as $daySlots) {
        foreach ($daySlots as $cell) {
            // Clase individual → bloquea salón completo → cuenta cap. entera del slot
            $occ += $cell['hasIndiv'] ? $capSlot : $cell['count'];
        }
    }
    $realOcupado[$sid] = $occ;
}

// 7. Logo en base64
$imgLogo = '';
$pathLogo = __DIR__ . '/assets/img/LOGO_CM_R.png';
if (file_exists($pathLogo)) {
    $ext  = strtolower(pathinfo($pathLogo, PATHINFO_EXTENSION));
    $data = file_get_contents($pathLogo);
    $imgLogo = '<img src="data:image/' . $ext . ';base64,' . base64_encode($data) . '" style="max-width:160px;margin-bottom:8px"><br>';
}

// ============================================================
// 8. HTML DEL REPORTE
// ============================================================
$amarillo = '#dec329';
$gris     = '#555';
$claro    = '#f5f5f5';

// Colores condicionales
$utilidadColor = $utilidadNeta >= 0 ? '#28a745' : '#dc3545';
$roiStr   = $roi !== null ? fmtPct($roi) : 'N/D';
$roiColor = ($roi !== null && $roi >= 0) ? '#28a745' : '#dc3545';
$vpnColor = $vpn >= 0 ? '#28a745' : '#dc3545';

ob_start(); ?>
<html>
<head>
<meta charset="utf-8">
<style>
    * { box-sizing: border-box; }
    body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #333; margin: 0; padding: 0; }

    /* ---- ENCABEZADO ---- */
    .header { text-align:center; margin-bottom:20px; border-bottom:3px solid <?= $amarillo ?>; padding-bottom:12px; }
    .header h1 { margin:4px 0; font-size:20px; color:#111; }
    .header h2 { margin:2px 0; font-size:14px; color:<?= $gris ?>; font-weight:normal; }
    .header p  { margin:2px 0; font-size:10px; color:#888; }

    /* ---- SECCIONES ---- */
    .section { margin-bottom:22px; }
    .section-title {
        background: <?= $amarillo ?>;
        color: #111;
        font-weight: bold;
        font-size: 12px;
        padding: 6px 10px;
        margin-bottom: 8px;
        border-radius: 3px;
    }
    .section-subtitle { font-size:10px; color:<?= $gris ?>; margin-bottom:6px; font-style:italic; }

    /* ---- TABLAS ---- */
    table { width:100%; border-collapse:collapse; margin-bottom:6px; }
    th { background:<?= $amarillo ?>; color:#111; padding:7px 8px; text-align:left; font-size:10px; }
    td { border-bottom:1px solid #ddd; padding:6px 8px; font-size:10px; }
    tr.totals td { background:#e8e8e8; font-weight:bold; }
    tr:nth-child(even) td { background:<?= $claro ?>; }
    .text-right { text-align:right; }
    .text-center { text-align:center; }

    /* ---- KPI CARDS ---- */
    .kpi-table { width:100%; border-collapse:separate; border-spacing:6px; margin-bottom:12px; }
    .kpi-cell {
        border:1px solid #ddd;
        border-radius:6px;
        padding:10px;
        width:33%;
        vertical-align:top;
        background:#fff;
    }
    .kpi-label { font-size:9px; color:<?= $gris ?>; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; }
    .kpi-value { font-size:16px; font-weight:bold; }
    .kpi-sub   { font-size:9px; color:#999; margin-top:2px; }

    /* ---- BARRA DE OCUPACIÓN ---- */
    .bar-bg  { background:#ddd; border-radius:4px; height:8px; width:100%; overflow:hidden; margin-top:3px; }
    .bar-fill { height:8px; border-radius:4px; background:<?= $amarillo ?>; }

    /* ---- GRILLA DE HORARIOS ---- */
    .sched-table { width:100%; border-collapse:collapse; margin-bottom:6px; font-size:8px; }
    .sched-table th { background:#444; color:#fff; padding:3px 4px; text-align:center; font-size:8px; }
    .sched-table td { padding:3px 4px; text-align:center; border:1px solid #ccc; font-size:8px; }
    .sched-closed { background:#e8e8e8; color:#bbb; }
    .sched-free   { background:#d4edda; color:#155724; }
    .sched-low    { background:#d1ecf1; color:#0c5460; font-weight:bold; }
    .sched-mid    { background:#fff3cd; color:#856404; font-weight:bold; }
    .sched-full   { background:#f8d7da; color:#721c24; font-weight:bold; }
    .sched-indiv  { background:#e8d0ff; color:#5a009d; font-weight:bold; }

    /* ---- SALTO DE PÁGINA ---- */
    .page-break { page-break-before: always; }

    /* ---- POSITIVO / NEGATIVO ---- */
    .pos { color:#28a745; } .neg { color:#dc3545; }

    /* ---- FOOTER ---- */
    .footer { position:fixed; bottom:0; width:100%; text-align:center; font-size:9px;
              color:#aaa; border-top:1px solid #eee; padding-top:6px; }
</style>
</head>
<body>

<!-- FOOTER fijo -->
<div class="footer">
    Reporte generado automáticamente por Symbiot Finance Manager &mdash; <?= date('d/m/Y H:i') ?>
</div>

<!-- ============================================================
     PORTADA
     ============================================================ -->
<div class="header">
    <?= $imgLogo ?>
    <h1>Reporte Operativo <?= $ano ?></h1>
    <h2><?= htmlspecialchars($empNombre) ?></h2>
    <p>Generado el <?= date('d/m/Y \a \l\a\s H:i') ?> &nbsp;|&nbsp; Usuario: <?= htmlspecialchars($_SESSION['user']['nombre'] ?? 'Sistema') ?></p>
    <p>Tasa de descuento VPN: 12% anual (1% mensual)</p>
</div>

<!-- ============================================================
     SECCIÓN 1 — RESUMEN EJECUTIVO (KPIs)
     ============================================================ -->
<div class="section">
    <div class="section-title">1. Resumen Ejecutivo</div>
    <table class="kpi-table">
        <tr>
            <td class="kpi-cell">
                <div class="kpi-label">Ingresos <?= $ano ?></div>
                <div class="kpi-value" style="color:#28a745"><?= fmt($totalIngresos) ?></div>
                <div class="kpi-sub">Total cobrado en el período</div>
            </td>
            <td class="kpi-cell">
                <div class="kpi-label">Gastos <?= $ano ?></div>
                <div class="kpi-value" style="color:#dc3545"><?= fmt($totalGastos) ?></div>
                <div class="kpi-sub">Total erogado en el período</div>
            </td>
            <td class="kpi-cell">
                <div class="kpi-label">Utilidad Neta</div>
                <div class="kpi-value" style="color:<?= $utilidadColor ?>"><?= fmt($utilidadNeta) ?></div>
                <div class="kpi-sub">Ingresos &minus; Gastos</div>
            </td>
        </tr>
        <tr>
            <td class="kpi-cell">
                <div class="kpi-label">Alumnos Activos</div>
                <div class="kpi-value" style="color:#0d6efd"><?= $totalActivos ?></div>
                <div class="kpi-sub">Personas únicas con estatus Activo</div>
            </td>
            <td class="kpi-cell">
                <div class="kpi-label">ROI (<?= $ano ?>)</div>
                <div class="kpi-value" style="color:<?= $roiColor ?>"><?= $roiStr ?></div>
                <div class="kpi-sub">Utilidad / Inversión neta de socios</div>
            </td>
            <td class="kpi-cell">
                <div class="kpi-label">VPN (12% anual)</div>
                <div class="kpi-value" style="color:<?= $vpnColor ?>"><?= fmt($vpn) ?></div>
                <div class="kpi-sub">Valor Presente Neto de flujos del año</div>
            </td>
        </tr>
    </table>
</div>

<!-- ============================================================
     SECCIÓN 2 — ALTAS Y BAJAS
     ============================================================ -->
<div class="section">
    <div class="section-title">2. Altas y Bajas de Alumnos</div>
    <div class="section-subtitle">
        Altas: fecha de inscripción. Bajas: fecha del último pago registrado (aproximación).
    </div>
    <?php if (empty($mesesAB)): ?>
        <p>Sin datos de altas/bajas para <?= $ano ?>.</p>
    <?php else: ?>
    <table>
        <thead>
            <tr>
                <th>Mes</th>
                <th class="text-center">Altas</th>
                <th class="text-center">Bajas</th>
                <th class="text-center">Neto</th>
            </tr>
        </thead>
        <tbody>
            <?php
            $sumA = 0; $sumB = 0;
            foreach ($mesesAB as $m):
                $a = $altasPorMes[$m] ?? 0;
                $b = $bajasPorMes[$m] ?? 0;
                $neto = $a - $b;
                $sumA += $a; $sumB += $b;
            ?>
            <tr>
                <td><?= mesLabel($m) ?></td>
                <td class="text-center <?= $a > 0 ? 'pos' : '' ?>"><?= $a > 0 ? '+' . $a : '—' ?></td>
                <td class="text-center <?= $b > 0 ? 'neg' : '' ?>"><?= $b > 0 ? '-' . $b : '—' ?></td>
                <td class="text-center <?= $neto >= 0 ? 'pos' : 'neg' ?>"><?= ($neto >= 0 ? '+' : '') . $neto ?></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
        <tfoot>
            <tr class="totals">
                <td><strong>Total <?= $ano ?></strong></td>
                <td class="text-center pos">+<?= $sumA ?></td>
                <td class="text-center neg"><?= $sumB > 0 ? '-' . $sumB : '0' ?></td>
                <td class="text-center <?= ($sumA - $sumB) >= 0 ? 'pos' : 'neg' ?>"><?= ($sumA - $sumB >= 0 ? '+' : '') . ($sumA - $sumB) ?></td>
            </tr>
        </tfoot>
    </table>
    <?php endif; ?>
</div>

<!-- ============================================================
     SECCIÓN 3 — OCUPACIÓN DE MAESTROS
     ============================================================ -->
<div class="section page-break">
    <div class="section-title">3. Ocupación de Maestros</div>
    <?php if (empty($maestros)): ?>
        <p>Sin datos de maestros.</p>
    <?php else: ?>
    <table>
        <thead>
            <tr>
                <th>Maestro</th>
                <th>Especialidad</th>
                <th class="text-center">Activos</th>
                <th class="text-center">Bajas</th>
                <th class="text-center">Total</th>
                <th class="text-right">Ingreso Mensual Potencial</th>
            </tr>
        </thead>
        <tbody>
            <?php
            $totA = 0; $totB = 0; $totIP = 0;
            foreach ($maestros as $m):
                $a = (int)$m['activos'];
                $b = (int)$m['bajas'];
                $ip = floatval($m['ingreso_potencial']);
                $totA += $a; $totB += $b; $totIP += $ip;
            ?>
            <tr>
                <td><?= htmlspecialchars($m['maestro']) ?></td>
                <td><?= htmlspecialchars($m['especialidad'] ?? '—') ?></td>
                <td class="text-center"><?= $a ?></td>
                <td class="text-center"><?= $b ?></td>
                <td class="text-center"><?= $a + $b ?></td>
                <td class="text-right"><?= fmt($ip) ?></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
        <tfoot>
            <tr class="totals">
                <td colspan="2"><strong>Total</strong></td>
                <td class="text-center"><?= $totA ?></td>
                <td class="text-center"><?= $totB ?></td>
                <td class="text-center"><?= $totA + $totB ?></td>
                <td class="text-right"><?= fmt($totIP) ?></td>
            </tr>
        </tfoot>
    </table>
    <?php endif; ?>
</div>

<!-- ============================================================
     SECCIÓN 4 — OCUPACIÓN DE SALONES
     ============================================================ -->
<div class="section">
    <div class="section-title">4. Ocupación de Salones</div>
    <div class="section-subtitle">
        Asignación por instrumento: Batería → Salón Batería | Guitarra → Salón Guitarra | Bajo, Canto, Teclado → Salón Múltiple
    </div>
    <?php if (empty($salones)): ?>
        <p>Sin datos de salones.</p>
    <?php else: ?>

    <!-- Tabla resumen por salón -->
    <table>
        <thead>
            <tr>
                <th>Salón</th>
                <th class="text-center">Cap./hora</th>
                <th class="text-center">Horas op./sem</th>
                <th class="text-center">Cap. real/sem</th>
                <th class="text-center">Alumnos inscritos</th>
                <th class="text-center">Slots usados/sem</th>
                <th class="text-center">% Uso real</th>
                <th>Uso visual</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($salones as $s):
                $sid      = (int)$s['id'];
                $activos  = (int)$s['activos'];
                $capHora  = $CAP_POR_SLOT[$sid] ?? (int)$s['capacidad'];
                $capReal  = $realCap[$sid]     ?? ($capHora * $totalSlotsSemanales);
                $ocupado  = $realOcupado[$sid] ?? 0;
                $pct      = $capReal > 0 ? min(100, round($ocupado / $capReal * 100)) : 0;
                $barColor = $pct >= 80 ? '#dc3545' : ($pct >= 50 ? $amarillo : '#28a745');
                $esMultiple = ($sid === 3);
            ?>
            <tr>
                <td><?= htmlspecialchars($s['salon']) ?><?= $esMultiple ? ' *' : '' ?></td>
                <td class="text-center"><?= $capHora ?><?= $esMultiple ? ' †' : '' ?></td>
                <td class="text-center"><?= $totalSlotsSemanales ?></td>
                <td class="text-center"><strong><?= $capReal ?></strong></td>
                <td class="text-center"><?= $activos ?></td>
                <td class="text-center"><?= $ocupado ?></td>
                <td class="text-center <?= $pct >= 80 ? 'neg' : ($pct >= 50 ? '' : 'pos') ?>"><strong><?= $pct ?>%</strong></td>
                <td>
                    <div class="bar-bg">
                        <div class="bar-fill" style="width:<?= $pct ?>%;background:<?= $barColor ?>;"></div>
                    </div>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <!-- Desglose Salón Múltiple por instrumento -->
    <?php if (!empty($salonMultipleDetalle)): ?>
    <p style="font-size:10px;font-weight:bold;margin:10px 0 4px">
        * Salón Múltiple — desglose por instrumento (capacidades distintas):
    </p>
    <table style="width:80%">
        <thead>
            <tr>
                <th>Instrumento</th>
                <th class="text-center">Cap./hora</th>
                <th class="text-center">Cap. real/sem</th>
                <th class="text-center">Inscritos</th>
                <th class="text-center">Slots usados</th>
                <th class="text-center">% Uso real</th>
                <th>Visual</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($salonMultipleDetalle as $d):
                $clase   = $d['clase'];
                $act     = (int)$d['activos'];
                $capI    = $capMultiple[$clase] ?? 3;
                $capRealI = $capI * $totalSlotsSemanales;
                // Contar slots realmente ocupados por este instrumento en slotsMatrix[3]
                $occI = 0;
                foreach (($slotsMatrix[3] ?? []) as $daySlots) {
                    foreach ($daySlots as $cell) {
                        // Solo contamos si la celda es de este instrumento
                        // (en slotsMatrix cada instrumento tiene su propia celda)
                        if ($cell['hasIndiv']) { $occI += $capI; }
                        // Nota: count ya está desagregado por instrumento en la clave de slotsMatrix
                    }
                }
                // Fallback: usar conteo directo de alumnos con slots parseados
                // Calculamos por instrumento desde los horariosAlumnos
                $occI = 0;
                foreach ($horariosAlumnos as $al) {
                    if ((int)($al['salon_id'] ?? 0) !== 3 || $al['clase'] !== $clase) continue;
                    $isIndiv = ($al['tipo_clase'] === 'Individual');
                    foreach (parseSlots($al['horario']) as $slot) {
                        $occI += $isIndiv ? $capI : 1;
                    }
                }
                $pctI    = $capRealI > 0 ? min(100, round($occI / $capRealI * 100)) : 0;
                $barI    = $pctI >= 80 ? '#dc3545' : ($pctI >= 50 ? $amarillo : '#28a745');
            ?>
            <tr>
                <td><?= htmlspecialchars($clase) ?></td>
                <td class="text-center"><?= $capI ?></td>
                <td class="text-center"><strong><?= $capRealI ?></strong></td>
                <td class="text-center"><?= $act ?></td>
                <td class="text-center"><?= $occI ?></td>
                <td class="text-center <?= $pctI >= 80 ? 'neg' : ($pctI >= 50 ? '' : 'pos') ?>"><strong><?= $pctI ?>%</strong></td>
                <td>
                    <div class="bar-bg">
                        <div class="bar-fill" style="width:<?= $pctI ?>%;background:<?= $barI ?>;"></div>
                    </div>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <p style="font-size:9px;color:#999">† Salón Múltiple: Bajo=3/hora, Canto=3/hora, Teclado=2/hora (solo 2 teclados). Cap. real/sem = cap/hora × <?= $totalSlotsSemanales ?> horas operativas.</p>
    <?php endif; ?>

    <p style="font-size:9px;color:#555;margin:6px 0 14px;">
        <em>Cap. real/sem = alumnos simultáneos/hora × <?= $totalSlotsSemanales ?> horas operativas (Lun–Vie 15-20h + Sáb 11-16h).
        Clase individual bloquea el salón completo en esa franja.
        Verde &lt;50% · Amarillo 50-79% · Rojo &ge;80%.</em>
    </p>

    <!-- Grilla semanal de horarios por salón -->
    <p style="font-size:10px;font-weight:bold;margin:0 0 4px;">Disponibilidad por franja horaria</p>
    <p style="font-size:9px;color:#666;margin:0 0 6px;">
        Lun–Vie 15:00–20:00 &nbsp;|&nbsp; Sáb 11:00–16:00
    </p>

    <?php
    $salonNames = [1=>'Salón Batería', 2=>'Salón Guitarra', 3=>'Salón Múltiple'];
    foreach ($salonNames as $sid => $snom):
        echo buildSalonGrid($sid, $snom, $slotsMatrix, $SCHOOL_SCHEDULE, $SCHOOL_HOURS, $DIAS, $DIAS_NUMS);
    endforeach;
    ?>

    <p style="font-size:8px;color:#999;margin-top:6px;">
        <span style="background:#d1ecf1;padding:1px 5px;border-radius:2px;">X/cap</span> = alumnos / capacidad &nbsp;
        <span style="background:#fff3cd;padding:1px 5px;border-radius:2px;">&ge;50%</span> = carga media &nbsp;
        <span style="background:#f8d7da;padding:1px 5px;border-radius:2px;">lleno</span> = sin cupo &nbsp;
        <span style="background:#e8d0ff;padding:1px 5px;border-radius:2px;">indiv.</span> = clase individual &nbsp;
        <span style="background:#d4edda;padding:1px 5px;border-radius:2px;">libre</span> = disponible
    </p>
    <?php endif; ?>
</div>

<!-- ============================================================
     SECCIÓN 5 — FLUJO DE EFECTIVO
     ============================================================ -->
<div class="section page-break">
    <div class="section-title">5. Flujo de Efectivo <?= $ano ?></div>
    <?php if (empty($flujoConVPN)): ?>
        <p>Sin transacciones registradas para <?= $ano ?>.</p>
    <?php else: ?>
    <table>
        <thead>
            <tr>
                <th>Mes</th>
                <th class="text-right">Ingresos</th>
                <th class="text-right">Gastos</th>
                <th class="text-right">Flujo Neto</th>
                <th class="text-right">Flujo Acumulado</th>
                <th class="text-right">VPN del mes</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($flujoConVPN as $f):
                $netoClass = $f['neto'] >= 0 ? 'pos' : 'neg';
                $acumClass = $f['acumulado'] >= 0 ? 'pos' : 'neg';
            ?>
            <tr>
                <td><?= mesLabel($f['mes']) ?></td>
                <td class="text-right"><?= fmt($f['ingresos']) ?></td>
                <td class="text-right"><?= fmt($f['gastos']) ?></td>
                <td class="text-right <?= $netoClass ?>"><?= fmt($f['neto']) ?></td>
                <td class="text-right <?= $acumClass ?>"><?= fmt($f['acumulado']) ?></td>
                <td class="text-right"><?= fmt($f['vpn_mes']) ?></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
        <tfoot>
            <tr class="totals">
                <td><strong>Total</strong></td>
                <td class="text-right"><?= fmt($totalIngresos) ?></td>
                <td class="text-right"><?= fmt($totalGastos) ?></td>
                <td class="text-right <?= $utilidadNeta >= 0 ? 'pos' : 'neg' ?>"><?= fmt($utilidadNeta) ?></td>
                <td class="text-right <?= end($flujoConVPN)['acumulado'] >= 0 ? 'pos' : 'neg' ?>"><?= fmt(end($flujoConVPN)['acumulado']) ?></td>
                <td class="text-right <?= $vpn >= 0 ? 'pos' : 'neg' ?>"><?= fmt($vpn) ?></td>
            </tr>
        </tfoot>
    </table>
    <p style="font-size:9px;color:#999">
        VPN calculado con tasa de descuento 1% mensual (12% anual). Columna "VPN del mes" = Flujo neto / (1.01)^t.
    </p>
    <?php endif; ?>
</div>

<!-- ============================================================
     SECCIÓN 6 — MÉTRICAS FINANCIERAS Y PARTICIPACIÓN DE SOCIOS
     ============================================================ -->
<div class="section">
    <div class="section-title">6. Métricas Financieras y Participación de Socios</div>

    <!-- KPIs verticales -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px">
        <tr>
            <td style="width:50%;padding-right:8px;vertical-align:top">
                <table>
                    <thead><tr><th colspan="2">Indicadores del período <?= $ano ?></th></tr></thead>
                    <tbody>
                        <tr><td>Ingresos totales</td><td class="text-right pos"><?= fmt($totalIngresos) ?></td></tr>
                        <tr><td>Gastos totales</td><td class="text-right neg"><?= fmt($totalGastos) ?></td></tr>
                        <tr><td>Utilidad Neta</td><td class="text-right <?= $utilidadNeta >= 0 ? 'pos' : 'neg' ?>"><?= fmt($utilidadNeta) ?></td></tr>
                        <tr><td>Inversión neta de socios</td><td class="text-right"><?= fmt($inversionNeta) ?></td></tr>
                        <tr><td><strong>ROI</strong></td><td class="text-right <?= ($roi !== null && $roi >= 0) ? 'pos' : 'neg' ?>"><strong><?= $roiStr ?></strong></td></tr>
                        <tr><td><strong>VPN (12% anual)</strong></td><td class="text-right <?= $vpn >= 0 ? 'pos' : 'neg' ?>"><strong><?= fmt($vpn) ?></strong></td></tr>
                        <tr><td>Alumnos activos</td><td class="text-right"><?= $totalActivos ?></td></tr>
                    </tbody>
                </table>
            </td>
            <td style="width:50%;padding-left:8px;vertical-align:top">
                <?php if (!empty($sociosData)): ?>
                <table>
                    <thead><tr><th colspan="4">Participación de Socios (histórico)</th></tr></thead>
                    <thead><tr><th>Socio</th><th class="text-right">Inversión</th><th class="text-right">Abonos</th><th class="text-center">%</th></tr></thead>
                    <tbody>
                        <?php foreach ($sociosData as $s): ?>
                        <tr>
                            <td><?= htmlspecialchars($s['socio']) ?></td>
                            <td class="text-right"><?= fmt($s['gastos']) ?></td>
                            <td class="text-right"><?= fmt($s['abonos']) ?></td>
                            <td class="text-center"><?= fmtPct($s['pct']) ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                    <tfoot>
                        <tr class="totals">
                            <td><strong>Total</strong></td>
                            <td class="text-right"><?= fmt($totalInversionHistorica) ?></td>
                            <td></td>
                            <td class="text-center">100%</td>
                        </tr>
                    </tfoot>
                </table>
                <?php else: ?>
                <p style="color:#999">Sin datos de socios inversores.</p>
                <?php endif; ?>
            </td>
        </tr>
    </table>

    <!-- Nota VPN -->
    <p style="font-size:9px;color:#777;border-top:1px solid #eee;padding-top:6px">
        <strong>ROI</strong> = Utilidad Neta del período / Inversión neta acumulada de socios en el período.<br>
        <strong>VPN</strong> = Valor Presente Neto. Suma de los flujos mensuales descontados a una tasa del 1% mensual (12% anual).<br>
        Un VPN positivo indica que el proyecto genera más valor del que costaría el capital invertido a la tasa de referencia.
    </p>
</div>

</body>
</html>
<?php
$html = ob_get_clean();

// ============================================================
// 9. RENDERIZAR PDF CON DOMPDF
// ============================================================
$options = new Options();
$options->set('isHtml5ParserEnabled', true);
$options->set('isRemoteEnabled', false);

$dompdf = new Dompdf($options);

try {
    $dompdf->loadHtml($html, 'UTF-8');
    $dompdf->setPaper('A4', 'portrait');
    $dompdf->render();

    $preOutput = ob_get_contents();
    ob_end_clean();

    if (!empty($preOutput)) {
        echo "<h1>Error generando PDF</h1><pre style='background:#fdd;padding:10px;border:1px solid red'>" . htmlspecialchars($preOutput) . "</pre>";
        exit;
    }

    $nombre = 'reporte_operativo_' . $empNombre . '_' . $ano . '.pdf';
    $nombre = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $nombre);
    $dompdf->stream($nombre, ['Attachment' => false]);

} catch (Throwable $e) {
    ob_end_clean();
    die("<h1>Error fatal</h1><pre>" . htmlspecialchars($e->getMessage()) . "</pre>");
}
