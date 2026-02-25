<?php
/**
 * Migración v2 — Telemetría de sensores (Path A)
 * Ejecutar UNA sola vez: http://localhost/symbiot/.../api/scripts/run_migration_v2.php
 * o via CLI: php run_migration_v2.php
 */
header('Content-Type: text/plain; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

$pdo = getConnection();
$ok  = [];
$err = [];

// ── 1. Nuevas columnas en sensores ──────────────────────────────────────────
$newColumns = [
    'ip_wifi'           => "VARCHAR(45)  NULL COMMENT 'IP actual del dispositivo (wDhcpIP)'",
    'sd_usado_kb'       => "INT UNSIGNED NULL COMMENT 'SD card — espacio usado en KB'",
    'sd_libre_kb'       => "INT UNSIGNED NULL COMMENT 'SD card — espacio libre en KB'",
    'wifi_ssid'         => "VARCHAR(100) NULL COMMENT 'SSID al que está conectado el device'",
    'comando_pendiente' => "VARCHAR(100) NULL COMMENT 'Próximo comando a entregar al device en heartbeat'",
    'config_pendiente'  => "TEXT         NULL COMMENT 'JSON de config pendiente de enviar al device'",
    'firmware_pendiente'=> "TEXT         NULL COMMENT 'JSON de firmware update pendiente'",
];

foreach ($newColumns as $col => $def) {
    // Verificar si la columna ya existe
    $check = $pdo->prepare(
        "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sensores' AND COLUMN_NAME = ?"
    );
    $check->execute([$col]);
    if ($check->fetchColumn() > 0) {
        $ok[] = "SKIP  sensores.$col (ya existe)";
        continue;
    }

    try {
        $pdo->exec("ALTER TABLE sensores ADD COLUMN $col $def");
        $ok[] = "ADD   sensores.$col ✓";
    } catch (Exception $e) {
        $err[] = "ERROR sensores.$col — " . $e->getMessage();
    }
}

// ── 2. Tabla sensor_telemetry ───────────────────────────────────────────────
try {
    $sqlFile = __DIR__ . '/migrate_v2_sensor_telemetry.sql';
    $sql = file_get_contents($sqlFile);
    // Extraer solo el CREATE TABLE ... ; bloque
    $pdo->exec($sql);
    $ok[] = "CREATE TABLE sensor_telemetry ✓";
} catch (Exception $e) {
    // Puede ser que ya exista — no es un error crítico
    $msg = $e->getMessage();
    if (strpos($msg, 'already exists') !== false) {
        $ok[] = "SKIP  sensor_telemetry (ya existe)";
    } else {
        $err[] = "ERROR sensor_telemetry — " . $msg;
    }
}

// ── Resumen ─────────────────────────────────────────────────────────────────
echo "=== Migración v2 — " . date('Y-m-d H:i:s') . " ===\n\n";
foreach ($ok  as $m) echo $m . "\n";
foreach ($err as $m) echo $m . "\n";
echo "\n" . (empty($err) ? "✅ Migración completada sin errores." : "⚠️  Migración con " . count($err) . " error(es). Revisa arriba.") . "\n";
