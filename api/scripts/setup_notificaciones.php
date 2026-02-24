<?php
// ====================================================
// MIGRACIÓN: Tabla notificaciones (v1.1 — agrega maestro_id)
// Ejecutar en el navegador:
//   http://localhost/symbiot/symbiot_finance_manager/api/scripts/setup_notificaciones.php
// También ejecutar en Plesk el bloque SQL correspondiente.
// ====================================================

require_once dirname(__DIR__) . '/config/database.php';

header('Content-Type: application/json; charset=utf-8');

$results = [];

try {
    $pdo = getConnection();

    // 1. Crear tabla si no existe (incluye maestro_id desde el inicio)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS notificaciones (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            tipo        VARCHAR(50)  NOT NULL,
            mensaje     VARCHAR(500) NOT NULL,
            leida       TINYINT(1)   NOT NULL DEFAULT 0,
            empresa_id  INT          NOT NULL DEFAULT 1,
            maestro_id  INT          NULL DEFAULT NULL,
            created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_empresa_leida (empresa_id, leida),
            INDEX idx_maestro       (maestro_id),
            INDEX idx_created_at    (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    $results[] = 'Tabla notificaciones creada/verificada';

    // 2. Agregar columna maestro_id si ya existía la tabla sin ella
    $cols = $pdo->query("SHOW COLUMNS FROM notificaciones LIKE 'maestro_id'")->fetchAll();
    if (empty($cols)) {
        $pdo->exec("ALTER TABLE notificaciones ADD COLUMN maestro_id INT NULL DEFAULT NULL");
        $pdo->exec("ALTER TABLE notificaciones ADD INDEX idx_maestro (maestro_id)");
        $results[] = 'Columna maestro_id agregada';
    } else {
        $results[] = 'Columna maestro_id ya existía';
    }

    echo json_encode(['success' => true, 'steps' => $results]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage(), 'steps' => $results]);
}
