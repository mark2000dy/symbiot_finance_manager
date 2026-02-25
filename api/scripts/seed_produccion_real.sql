-- =============================================================================
-- SEED PRODUCCIÓN REAL — Reemplazar datos dummy por datos reales
-- Datos tomados de localhost gastos_app_db (2026-02-25)
-- Empresa: Symbiot Technologies (empresa_id = 2)
-- =============================================================================

SET foreign_key_checks = 0;

-- =============================================================================
-- 1. LIMPIAR DUMMY
-- =============================================================================

-- 1a. Sensores dummy del setup (11 registros)
DELETE FROM `sensores`
WHERE empresa_id = 2
  AND nombre IN (
    'Sensor-MX-001', 'Sensor-MX-002', 'Sensor-MX-003',
    'Sensor-MX-004', 'Sensor-MX-005',
    'Sensor-CL-001', 'Sensor-CL-002', 'Sensor-CL-003', 'Sensor-CL-004',
    'Sensor-FAB-001', 'Sensor-FAB-002'
  );

-- 1b. Clientes dummy del setup (5 registros — excepto Felipe Martinez si ya existe)
DELETE FROM `clientes_symbiot`
WHERE empresa_id = 2
  AND nombre IN (
    'Carlos Mendoza', 'Sofía Torres', 'Roberto Silva',
    'Camila Rojas', 'Miguel Herrera'
  );

-- =============================================================================
-- 2. CLIENTE REAL — Felipe Martinez / Huella Estructural
-- =============================================================================
INSERT INTO `clientes_symbiot`
  (`nombre`, `empresa`, `pais`, `email`, `telefono`,
   `tipo_suscripcion`, `precio_suscripcion`,
   `fecha_inicio`, `fecha_vencimiento`, `estatus`, `empresa_id`)
VALUES (
    'Felipe Martinez',
    'Huella Estructural',
    'Chile',
    'felipe@huellaestructural.com',
    '+56 9 9779 0431',
    'Mensual',
    1200.00,
    '2025-09-01',
    '2026-03-01',
    'Activo',
    2
);

SET @cliente_id = LAST_INSERT_ID();

-- =============================================================================
-- 3. SENSOR REAL — XXXX01.A
--    device_id   : UUID del SD card (guardado por ValidateByName)
--    device_code : 'XXXX01.A'  → resolveSensor lo encuentra via LIKE 'XXXX01.%'
--    token       : UUID generado en localhost (coincide con SENSOR_SERVER_TOKEN del SD)
--    api_url     : actualizada a producción Plesk
--    estado      : Inactivo → se vuelve Activo en el 1er heartbeat
--    fecha_instalacion: hoy → aparece en "encendidos este mes"
-- =============================================================================
INSERT INTO `sensores`
  (`nombre`, `device_id`, `device_code`, `token`,
   `tipo_sensor`, `conexion`, `modelo`,
   `ubicacion_pais`, `ubicacion_ciudad`, `cliente_id`,
   `estado`, `fecha_instalacion`, `empresa_id`,
   `version`, `licencia`, `modo_operacion`, `api_url`, `frecuencia`, `intervalo_min`,
   `factor_x`, `factor_y`, `factor_z`)
VALUES (
    'XXXX01.A',
    '728a89ac-19f9-4aaf-b87f-ecdb533f9a13',
    'XXXX01.A',
    'ef1b8735-9ec5-44bb-99bb-54bd5bbb2827',
    'Acelerómetro Inalámbrico',
    'WiFi',
    'SYM-TH-100',
    'México',
    'CDMX',
    @cliente_id,
    'Inactivo',
    CURDATE(),
    2,
    '2.4.004',
    1,
    'M3',
    'https://symbiot.com.mx/gastos/api/index.php/',
    250,
    1,
    0.000003814697266,
    0.000003814697266,
    0.000003814697266
);

-- =============================================================================
-- 4. VERIFICACIÓN
-- =============================================================================
SELECT id, nombre, empresa, pais, email, tipo_suscripcion, precio_suscripcion,
       fecha_vencimiento, estatus
FROM clientes_symbiot WHERE empresa_id = 2;

SELECT id, nombre, device_code, device_id, token, estado,
       fecha_instalacion, ubicacion_pais, ubicacion_ciudad, version, api_url
FROM sensores WHERE empresa_id = 2;

-- Preview "Movimientos del mes" (debe mostrar encendidos=0 hasta 1er heartbeat)
SELECT
    SUM(CASE WHEN estado = 'Activo'      AND DATE_FORMAT(fecha_instalacion,'%Y-%m') = DATE_FORMAT(NOW(),'%Y-%m') THEN 1 ELSE 0 END) AS encendidos_mes,
    SUM(CASE WHEN estado = 'Inactivo'    AND DATE_FORMAT(updated_at,'%Y-%m')        = DATE_FORMAT(NOW(),'%Y-%m') THEN 1 ELSE 0 END) AS desconectados_mes,
    SUM(CASE WHEN estado = 'Fabricacion'                                                                          THEN 1 ELSE 0 END) AS nuevos_pedidos
FROM sensores WHERE empresa_id = 2;

SET foreign_key_checks = 1;
-- FIN
