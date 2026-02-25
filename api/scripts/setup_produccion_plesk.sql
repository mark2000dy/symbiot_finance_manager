-- =============================================================
-- Symbiot Technologies — Setup completo para Producción (Plesk)
-- Ejecutar en phpMyAdmin sobre la base de datos del proyecto
-- Fecha: 2026-02-24
-- Incluye: tablas nuevas + schema extendido + datos dummy
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. TABLA: clientes_symbiot
-- ============================================================
CREATE TABLE IF NOT EXISTS `clientes_symbiot` (
  `id`                 INT AUTO_INCREMENT PRIMARY KEY,
  `nombre`             VARCHAR(255) NOT NULL,
  `empresa`            VARCHAR(255) DEFAULT NULL,
  `pais`               VARCHAR(100) DEFAULT NULL,
  `email`              VARCHAR(255) DEFAULT NULL,
  `telefono`           VARCHAR(50)  DEFAULT NULL,
  `tipo_suscripcion`   ENUM('Mensual','Anual') DEFAULT 'Mensual',
  `precio_suscripcion` DECIMAL(10,2) DEFAULT 0.00,
  `fecha_inicio`       DATE         DEFAULT NULL,
  `fecha_vencimiento`  DATE         DEFAULT NULL,
  `estatus`            ENUM('Activo','Baja') DEFAULT 'Activo',
  `empresa_id`         INT          NOT NULL DEFAULT 2,
  `notas`              TEXT         DEFAULT NULL,
  `created_at`         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  `updated_at`         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. TABLA: sensores
--    Schema completo (base + 19 columnas: firmware, telemetría)
-- ============================================================
CREATE TABLE IF NOT EXISTS `sensores` (
  -- Identificación
  `id`                    INT           AUTO_INCREMENT PRIMARY KEY,
  `nombre`                VARCHAR(255)  NOT NULL,
  `device_id`             VARCHAR(100)  DEFAULT NULL,
  `device_code`           VARCHAR(100)  DEFAULT NULL,
  `token`                 VARCHAR(255)  DEFAULT NULL,
  -- Tipo y conectividad
  `tipo_sensor`           VARCHAR(100)  DEFAULT NULL,
  `conexion`              VARCHAR(50)   DEFAULT 'WiFi',
  `modelo`                VARCHAR(100)  DEFAULT NULL,
  -- Ubicación y asignación
  `ubicacion_pais`        VARCHAR(100)  DEFAULT NULL,
  `ubicacion_ciudad`      VARCHAR(100)  DEFAULT NULL,
  `cliente_id`            INT           DEFAULT NULL,
  -- Estado y fechas
  `estado`                ENUM('Activo','Inactivo','Fabricacion') DEFAULT 'Fabricacion',
  `fecha_instalacion`     DATE          DEFAULT NULL,
  `fecha_ultimo_contacto` DATETIME      DEFAULT NULL,
  `empresa_id`            INT           NOT NULL DEFAULT 2,
  `notas`                 TEXT          DEFAULT NULL,
  -- Configuración de firmware
  `version`               VARCHAR(20)   DEFAULT NULL,
  `licencia`              TINYINT(1)    DEFAULT NULL,
  `modo_operacion`        VARCHAR(50)   DEFAULT NULL,
  `api_url`               VARCHAR(255)  DEFAULT NULL,
  `frecuencia`            INT           DEFAULT NULL,  -- Hz
  `intervalo_min`         INT           DEFAULT NULL,  -- minutos entre lecturas
  -- Telemetría: Acelerómetro (ejes en g, factores de calibración)
  `eje_x`                 DECIMAL(10,4) DEFAULT NULL,
  `eje_y`                 DECIMAL(10,4) DEFAULT NULL,
  `eje_z`                 DECIMAL(10,4) DEFAULT NULL,
  `factor_x`              DECIMAL(15,12) DEFAULT NULL,
  `factor_y`              DECIMAL(15,12) DEFAULT NULL,
  `factor_z`              DECIMAL(15,12) DEFAULT NULL,
  -- Telemetría: Temperatura (°C)
  `temperatura`           DECIMAL(6,2)  DEFAULT NULL,
  -- Alimentación (mV)
  `bateria_mv`            SMALLINT      DEFAULT NULL,
  `alimentacion_mv`       SMALLINT      DEFAULT NULL,
  -- Auditoría
  `created_at`            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  `updated_at`            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`cliente_id`) REFERENCES `clientes_symbiot`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. TABLA: notificaciones
-- ============================================================
CREATE TABLE IF NOT EXISTS `notificaciones` (
  `id`         INT          AUTO_INCREMENT PRIMARY KEY,
  `tipo`       VARCHAR(50)  NOT NULL,
  `mensaje`    VARCHAR(500) NOT NULL,
  `leida`      TINYINT(1)   NOT NULL DEFAULT 0,
  `empresa_id` INT          NOT NULL DEFAULT 1,
  `maestro_id` INT          NULL DEFAULT NULL,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_empresa_leida` (`empresa_id`, `leida`),
  INDEX `idx_maestro`       (`maestro_id`),
  INDEX `idx_created_at`    (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. MIGRACIÓN: columnas de perfil en tabla usuarios
--    (seguro re-ejecutar — solo agrega si no existen)
-- ============================================================
SET @dbname = DATABASE();

-- apellidos
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'apellidos') = 0,
  'ALTER TABLE `usuarios` ADD COLUMN `apellidos` VARCHAR(100) NULL DEFAULT NULL AFTER `nombre`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- puesto
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'puesto') = 0,
  'ALTER TABLE `usuarios` ADD COLUMN `puesto` VARCHAR(100) NULL DEFAULT NULL AFTER `empresa`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- celular
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'celular') = 0,
  'ALTER TABLE `usuarios` ADD COLUMN `celular` VARCHAR(20) NULL DEFAULT NULL AFTER `puesto`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ============================================================
-- 5. DATOS DUMMY: Clientes Symbiot (5 registros)
-- ============================================================
INSERT INTO `clientes_symbiot`
  (`nombre`, `empresa`, `pais`, `email`, `telefono`,
   `tipo_suscripcion`, `precio_suscripcion`, `fecha_inicio`, `fecha_vencimiento`, `estatus`, `empresa_id`)
VALUES
  ('Carlos Mendoza',  'Agro-MX S.A.',           'México', 'cmendoza@agromx.com',  '55-1234-5678', 'Mensual', 1200.00,  '2025-09-01', '2026-03-01', 'Activo', 2),
  ('Sofía Torres',    'FarmChile Ltda',           'Chile',  'storres@farmchile.cl', '9-8765-4321',  'Anual',   12000.00, '2025-06-01', '2026-06-01', 'Activo', 2),
  ('Roberto Silva',   'Invernaderos del Norte',   'México', 'rsilva@invnorte.mx',   '33-9988-7766', 'Mensual', 1200.00,  '2025-11-01', '2026-03-01', 'Activo', 2),
  ('Camila Rojas',    'AgroConcepción',           'Chile',  'crojas@agroconce.cl',  '9-1122-3344',  'Mensual', 1200.00,  '2025-10-01', '2026-02-28', 'Activo', 2),
  ('Miguel Herrera',  'TechFarm Jalisco',         'México', 'mherrera@techfarm.mx', '33-5566-7788', 'Anual',   12000.00, '2025-01-01', '2026-01-01', 'Baja',   2);

-- ============================================================
-- 6. DATOS DUMMY: Sensores (11 dispositivos)
--    Tipos reales: Acelerómetro Inalámbrico, Temperatura Digital
--    ESP01, Control IR Aire Acondicionado Trane, Control IR HVAC
-- ============================================================
INSERT INTO `sensores`
  (`nombre`, `device_id`, `device_code`, `token`,
   `tipo_sensor`, `conexion`, `modelo`,
   `ubicacion_pais`, `ubicacion_ciudad`, `cliente_id`,
   `estado`, `fecha_instalacion`, `fecha_ultimo_contacto`, `empresa_id`,
   `version`, `licencia`, `modo_operacion`, `api_url`, `frecuencia`, `intervalo_min`,
   `eje_x`, `eje_y`, `eje_z`, `factor_x`, `factor_y`, `factor_z`,
   `temperatura`, `bateria_mv`, `alimentacion_mv`)
VALUES

-- ── Acelerómetros CDMX (cliente 1: Carlos Mendoza / Agro-MX) ──────────────
('Sensor-MX-001',
 'ACC001-MX-A7F3', 'SYM-ACC-001', 'tkn_a7f3b2c1d4e5f6g7h8i9j0k1l2m3n4o5',
 'Acelerómetro Inalámbrico', 'WiFi', 'SYM-ACC-100',
 'México', 'CDMX', 1,
 'Activo', '2025-09-15', '2026-02-24 10:30:00', 2,
 '1.4.2', 1, 'Continuo', 'https://api.symbiot.io/v1/data', 100, 5,
 0.0194, -0.0087, 9.8136,  0.000000059605, 0.000000059605, 0.000000059605,
 NULL, 3920, NULL),

('Sensor-MX-002',
 'ACC002-MX-B2D1', 'SYM-ACC-002', 'tkn_b2d1c3e4f5g6h7i8j9k0l1m2n3o4p5',
 'Acelerómetro Inalámbrico', 'WiFi', 'SYM-ACC-100',
 'México', 'CDMX', 1,
 'Activo', '2025-09-15', '2026-02-24 10:28:00', 2,
 '1.4.2', 1, 'Continuo', 'https://api.symbiot.io/v1/data', 100, 5,
 0.0112,  0.0231, 9.8024,  0.000000059605, 0.000000059605, 0.000000059605,
 NULL, 4050, NULL),

-- ── Temperatura CDMX (cliente 1 — inactivo) ───────────────────────────────
('Sensor-MX-003',
 'TMP001-MX-C9E4', 'SYM-TMP-001', 'tkn_c9e4d0f1g2h3i4j5k6l7m8n9o0p1',
 'Temperatura Digital ESP01', 'WiFi', 'SYM-TMP-200',
 'México', 'CDMX', 1,
 'Inactivo', '2025-09-15', '2026-02-10 08:00:00', 2,
 '2.1.0', 1, 'Intervalos', 'https://api.symbiot.io/v1/data', NULL, 15,
 NULL, NULL, NULL, NULL, NULL, NULL,
 22.50, NULL, 3300),

-- ── Acelerómetro Concepción (cliente 2: Sofía Torres / FarmChile) ─────────
('Sensor-CL-001',
 'ACC003-CL-D5F8', 'SYM-ACC-003', 'tkn_d5f8e6g7h8i9j0k1l2m3n4o5p6q7',
 'Acelerómetro Inalámbrico', 'WiFi', 'SYM-ACC-100',
 'Chile', 'Concepción', 2,
 'Activo', '2025-06-20', '2026-02-24 10:31:00', 2,
 '1.4.2', 1, 'Continuo', 'https://api.symbiot.io/v1/data', 200, 5,
 -0.0265,  0.0198, 9.7981,  0.000000059605, 0.000000059605, 0.000000059605,
 NULL, 3750, NULL),

-- ── Temperatura Santiago (cliente 2) ─────────────────────────────────────
('Sensor-CL-002',
 'TMP002-CL-E1A2', 'SYM-TMP-002', 'tkn_e1a2f3g4h5i6j7k8l9m0n1o2p3q4',
 'Temperatura Digital ESP01', 'WiFi', 'SYM-TMP-200',
 'Chile', 'Santiago', 2,
 'Activo', '2025-06-20', '2026-02-24 10:29:00', 2,
 '2.1.0', 1, 'Intervalos', 'https://api.symbiot.io/v1/data', NULL, 10,
 NULL, NULL, NULL, NULL, NULL, NULL,
 18.30, NULL, 3300),

-- ── Temperatura Concepción (cliente 2) ───────────────────────────────────
('Sensor-CL-003',
 'TMP003-CL-F6B9', 'SYM-TMP-003', 'tkn_f6b9g7h8i9j0k1l2m3n4o5p6q7r8',
 'Temperatura Digital ESP01', 'WiFi', 'SYM-TMP-200',
 'Chile', 'Concepción', 2,
 'Activo', '2025-07-01', '2026-02-24 10:27:00', 2,
 '2.1.0', 1, 'Intervalos', 'https://api.symbiot.io/v1/data', NULL, 10,
 NULL, NULL, NULL, NULL, NULL, NULL,
 21.70, NULL, 3300),

-- ── Control IR Guadalajara (cliente 3: Roberto Silva / Invernaderos) ──────
('Sensor-MX-004',
 'IR001-MX-G3C7', 'SYM-IR-001', 'tkn_g3c7h4i5j6k7l8m9n0o1p2q3r4s5',
 'Control IR Aire Acondicionado Trane', 'WiFi', 'SYM-IR-300',
 'México', 'Guadalajara', 3,
 'Activo', '2025-11-10', '2026-02-24 10:25:00', 2,
 '3.0.1', 1, 'Continuo', 'https://api.symbiot.io/v1/data', NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, NULL),

-- ── Acelerómetro Monterrey (cliente 4: Camila Rojas / AgroConcepción) ────
('Sensor-MX-005',
 'ACC004-MX-H8D2', 'SYM-ACC-004', 'tkn_h8d2i9j0k1l2m3n4o5p6q7r8s9t0',
 'Acelerómetro Inalámbrico', 'WiFi', 'SYM-ACC-100',
 'México', 'Monterrey', 4,
 'Activo', '2025-10-05', '2026-02-24 10:22:00', 2,
 '1.4.2', 1, 'Continuo', 'https://api.symbiot.io/v1/data', 100, 5,
 0.0043, -0.0156, 9.8201,  0.000000059605, 0.000000059605, 0.000000059605,
 NULL, 3680, NULL),

-- ── Acelerómetro Concepción (cliente 4 — inactivo) ───────────────────────
('Sensor-CL-004',
 'ACC005-CL-I2E6', 'SYM-ACC-005', 'tkn_i2e6j3k4l5m6n7o8p9q0r1s2t3u4',
 'Acelerómetro Inalámbrico', 'WiFi', 'SYM-ACC-100',
 'Chile', 'Concepción', 4,
 'Inactivo', '2025-10-05', '2026-01-15 14:00:00', 2,
 '1.4.1', 1, 'Continuo', 'https://api.symbiot.io/v1/data', 100, 5,
 0.0087,  0.0034, 9.7943,  0.000000059605, 0.000000059605, 0.000000059605,
 NULL, 2940, NULL),

-- ── En fabricación ────────────────────────────────────────────────────────
('Sensor-FAB-001',
 NULL, NULL, NULL,
 'Acelerómetro Inalámbrico', 'WiFi', 'SYM-ACC-100',
 NULL, NULL, NULL,
 'Fabricacion', NULL, NULL, 2,
 NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, NULL),

('Sensor-FAB-002',
 NULL, NULL, NULL,
 'Control IR HVAC', 'WiFi', 'SYM-IR-400',
 NULL, NULL, NULL,
 'Fabricacion', NULL, NULL, 2,
 NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, NULL);

-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- VERIFICACIÓN (opcional — ejecutar después del setup)
-- ============================================================
-- SELECT 'clientes_symbiot' AS tabla, COUNT(*) AS registros FROM clientes_symbiot WHERE empresa_id = 2
-- UNION ALL
-- SELECT 'sensores', COUNT(*) FROM sensores WHERE empresa_id = 2
-- UNION ALL
-- SELECT 'sensores activos', COUNT(*) FROM sensores WHERE empresa_id = 2 AND estado = 'Activo'
-- UNION ALL
-- SELECT 'sensores México activos', COUNT(*) FROM sensores WHERE empresa_id = 2 AND estado = 'Activo' AND ubicacion_pais = 'México'
-- UNION ALL
-- SELECT 'sensores Chile activos', COUNT(*) FROM sensores WHERE empresa_id = 2 AND estado = 'Activo' AND ubicacion_pais = 'Chile';
