-- =============================================================================
-- MIGRACIÓN v2: Telemetría de sensores + columnas heartbeat
-- MySQL 8.0 compatible (sin IF NOT EXISTS en ALTER)
-- Ejecutar vía script PHP run_migration_v2.php
-- =============================================================================

-- 2. Tabla de historial de telemetría
CREATE TABLE IF NOT EXISTS sensor_telemetry (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    sensor_id      INT NOT NULL,
    recorded_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    eje_x          DECIMAL(12,6) NULL,
    eje_y          DECIMAL(12,6) NULL,
    eje_z          DECIMAL(12,6) NULL,
    temperatura    DECIMAL(6,2)  NULL,
    bateria_mv     SMALLINT      NULL,
    modo_operacion VARCHAR(50)   NULL,
    ip_wifi        VARCHAR(45)   NULL,
    sd_usado_kb    INT           NULL,
    sd_libre_kb    INT           NULL,
    CONSTRAINT fk_telemetry_sensor FOREIGN KEY (sensor_id) REFERENCES sensores(id) ON DELETE CASCADE,
    INDEX idx_sensor_time (sensor_id, recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Historial de heartbeats del dispositivo';
