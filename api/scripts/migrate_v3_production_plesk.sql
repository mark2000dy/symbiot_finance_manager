-- =============================================================================
-- MIGRACIÓN v3: Columnas IoT pendientes + tabla sensor_telemetry
-- Base: setup_produccion_plesk.sql ya ejecutado (sensores tiene las 19 cols base)
-- Agregar: ip_wifi, sd_usado_kb, sd_libre_kb, comando_pendiente,
--          config_pendiente, firmware_pendiente + CREATE sensor_telemetry
--
-- Compatible MySQL 8.0 (Plesk). Idempotente via INFORMATION_SCHEMA.
-- Ejecutar como: mysql -u user -p gastos_app_db < migrate_v3_production_plesk.sql
-- =============================================================================

-- Evitar errores de FK durante ALTER
SET foreign_key_checks = 0;

-- =============================================================================
-- 1. Columnas nuevas en tabla `sensores`
--    Se agregan sólo si no existen (via procedimiento temporal)
-- =============================================================================
DROP PROCEDURE IF EXISTS _migrate_v3;

DELIMITER $$
CREATE PROCEDURE _migrate_v3()
BEGIN
    -- ip_wifi: última IP reportada por el dispositivo
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sensores' AND COLUMN_NAME = 'ip_wifi'
    ) THEN
        ALTER TABLE `sensores` ADD COLUMN `ip_wifi` VARCHAR(45) DEFAULT NULL AFTER `bateria_mv`;
        SELECT 'ADDED: ip_wifi' AS migration_log;
    ELSE
        SELECT 'SKIP : ip_wifi (ya existe)' AS migration_log;
    END IF;

    -- sd_usado_kb: espacio usado en tarjeta SD (KB)
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sensores' AND COLUMN_NAME = 'sd_usado_kb'
    ) THEN
        ALTER TABLE `sensores` ADD COLUMN `sd_usado_kb` INT DEFAULT NULL AFTER `ip_wifi`;
        SELECT 'ADDED: sd_usado_kb' AS migration_log;
    ELSE
        SELECT 'SKIP : sd_usado_kb (ya existe)' AS migration_log;
    END IF;

    -- sd_libre_kb: espacio libre en tarjeta SD (KB)
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sensores' AND COLUMN_NAME = 'sd_libre_kb'
    ) THEN
        ALTER TABLE `sensores` ADD COLUMN `sd_libre_kb` INT DEFAULT NULL AFTER `sd_usado_kb`;
        SELECT 'ADDED: sd_libre_kb' AS migration_log;
    ELSE
        SELECT 'SKIP : sd_libre_kb (ya existe)' AS migration_log;
    END IF;

    -- comando_pendiente: comando OTA/RESET/etc. a enviar al device en el próximo heartbeat
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sensores' AND COLUMN_NAME = 'comando_pendiente'
    ) THEN
        ALTER TABLE `sensores` ADD COLUMN `comando_pendiente` VARCHAR(100) DEFAULT NULL;
        SELECT 'ADDED: comando_pendiente' AS migration_log;
    ELSE
        SELECT 'SKIP : comando_pendiente (ya existe)' AS migration_log;
    END IF;

    -- config_pendiente: JSON de configuración a enviar al device vía /GetConfiguration
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sensores' AND COLUMN_NAME = 'config_pendiente'
    ) THEN
        ALTER TABLE `sensores` ADD COLUMN `config_pendiente` TEXT DEFAULT NULL;
        SELECT 'ADDED: config_pendiente' AS migration_log;
    ELSE
        SELECT 'SKIP : config_pendiente (ya existe)' AS migration_log;
    END IF;

    -- firmware_pendiente: JSON con URL+version del firmware a descargar vía OTA
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sensores' AND COLUMN_NAME = 'firmware_pendiente'
    ) THEN
        ALTER TABLE `sensores` ADD COLUMN `firmware_pendiente` TEXT DEFAULT NULL;
        SELECT 'ADDED: firmware_pendiente' AS migration_log;
    ELSE
        SELECT 'SKIP : firmware_pendiente (ya existe)' AS migration_log;
    END IF;
END$$
DELIMITER ;

CALL _migrate_v3();
DROP PROCEDURE IF EXISTS _migrate_v3;

-- =============================================================================
-- 2. Tabla sensor_telemetry (historial de heartbeats)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `sensor_telemetry` (
    `id`             BIGINT        AUTO_INCREMENT PRIMARY KEY,
    `sensor_id`      INT           NOT NULL,
    `recorded_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `eje_x`          DECIMAL(12,6) NULL,
    `eje_y`          DECIMAL(12,6) NULL,
    `eje_z`          DECIMAL(12,6) NULL,
    `temperatura`    DECIMAL(6,2)  NULL,
    `bateria_mv`     SMALLINT      NULL,
    `modo_operacion` VARCHAR(50)   NULL,
    `ip_wifi`        VARCHAR(45)   NULL,
    `sd_usado_kb`    INT           NULL,
    `sd_libre_kb`    INT           NULL,
    CONSTRAINT `fk_telemetry_sensor`
        FOREIGN KEY (`sensor_id`) REFERENCES `sensores`(`id`) ON DELETE CASCADE,
    INDEX `idx_sensor_time` (`sensor_id`, `recorded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Historial de heartbeats del dispositivo';

-- =============================================================================
-- 3. Verificación final
-- =============================================================================
SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'sensores'
  AND COLUMN_NAME IN ('ip_wifi','sd_usado_kb','sd_libre_kb',
                      'comando_pendiente','config_pendiente','firmware_pendiente')
ORDER BY ORDINAL_POSITION;

SELECT 'sensor_telemetry' AS tabla,
       COUNT(*) AS columnas
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'sensor_telemetry';

SET foreign_key_checks = 1;
-- FIN DE MIGRACIÓN v3
