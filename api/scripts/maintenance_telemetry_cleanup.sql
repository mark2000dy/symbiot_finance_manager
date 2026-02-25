-- =============================================================================
-- RUTINA DE LIMPIEZA MENSUAL — sensor_telemetry
-- Retención: últimos 6 meses de telemetría completa
-- Ejecutar: último día de cada mes (o programar con MySQL Event Scheduler)
--
-- Uso manual en phpMyAdmin:
--   Selecciona gastos_app_db → SQL → pegar y ejecutar
-- =============================================================================

-- 1. Ver cuántas filas se van a eliminar antes de borrar (opcional, solo lectura)
SELECT
    COUNT(*)                              AS filas_a_eliminar,
    MIN(recorded_at)                      AS registro_mas_antiguo,
    MAX(recorded_at)                      AS limite_corte,
    ROUND(COUNT(*) * 143 / 1024 / 1024, 2) AS espacio_liberado_MB
FROM sensor_telemetry
WHERE recorded_at < NOW() - INTERVAL 6 MONTH;

-- 2. Eliminar telemetría con más de 6 meses de antigüedad
DELETE FROM sensor_telemetry
WHERE recorded_at < NOW() - INTERVAL 6 MONTH;

-- 3. Liberar espacio real en disco (reorganiza el tablespace InnoDB)
OPTIMIZE TABLE sensor_telemetry;

-- 4. Verificación post-limpieza
SELECT
    COUNT(*)         AS filas_restantes,
    MIN(recorded_at) AS dato_mas_antiguo,
    MAX(recorded_at) AS dato_mas_reciente,
    ROUND(COUNT(*) * 143 / 1024 / 1024, 2) AS espacio_estimado_MB
FROM sensor_telemetry;


-- =============================================================================
-- AUTOMATIZACIÓN CON MySQL EVENT SCHEDULER (ejecutar una sola vez en Plesk)
-- Crea un evento que limpia automáticamente el último día de cada mes
-- Requisito: EVENT privilege en el usuario gastos_user, o ejecutar como root
-- =============================================================================

-- Verificar si el scheduler está activo:
-- SHOW VARIABLES LIKE 'event_scheduler';
-- Si dice OFF, activar con: SET GLOBAL event_scheduler = ON;

DROP EVENT IF EXISTS evt_limpieza_telemetria_mensual;

CREATE EVENT evt_limpieza_telemetria_mensual
ON SCHEDULE
    EVERY 1 MONTH
    STARTS (LAST_DAY(NOW()) + INTERVAL 1 DAY - INTERVAL 1 DAY + INTERVAL '02:00' HOUR_MINUTE)
COMMENT 'Elimina telemetría de sensores con más de 6 meses de antigüedad'
DO
BEGIN
    DELETE FROM sensor_telemetry
    WHERE recorded_at < NOW() - INTERVAL 6 MONTH;

    OPTIMIZE TABLE sensor_telemetry;
END;

-- Verificar que el evento quedó registrado:
-- SELECT event_name, status, last_executed, next_execution
-- FROM information_schema.EVENTS
-- WHERE event_schema = DATABASE();
