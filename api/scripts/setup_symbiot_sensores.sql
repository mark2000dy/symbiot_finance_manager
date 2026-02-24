-- =============================================================
-- Symbiot Technologies — Tablas de Sensores y Clientes IoT
-- Ejecutar en phpMyAdmin sobre la base de datos del proyecto
-- =============================================================

-- 1. Clientes IoT
CREATE TABLE IF NOT EXISTS `clientes_symbiot` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(255) NOT NULL,
  `empresa` VARCHAR(255) DEFAULT NULL,
  `pais` VARCHAR(100) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `telefono` VARCHAR(50) DEFAULT NULL,
  `tipo_suscripcion` ENUM('Mensual','Anual') DEFAULT 'Mensual',
  `precio_suscripcion` DECIMAL(10,2) DEFAULT 0.00,
  `fecha_inicio` DATE DEFAULT NULL,
  `fecha_vencimiento` DATE DEFAULT NULL,
  `estatus` ENUM('Activo','Baja') DEFAULT 'Activo',
  `empresa_id` INT NOT NULL DEFAULT 2,
  `notas` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 2. Sensores IoT
CREATE TABLE IF NOT EXISTS `sensores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(255) NOT NULL,
  `tipo_sensor` VARCHAR(100) DEFAULT NULL,
  `modelo` VARCHAR(100) DEFAULT NULL,
  `ubicacion_pais` VARCHAR(100) DEFAULT NULL,
  `ubicacion_ciudad` VARCHAR(100) DEFAULT NULL,
  `cliente_id` INT DEFAULT NULL,
  `estado` ENUM('Activo','Inactivo','Fabricacion') DEFAULT 'Fabricacion',
  `fecha_instalacion` DATE DEFAULT NULL,
  `fecha_ultimo_contacto` DATETIME DEFAULT NULL,
  `empresa_id` INT NOT NULL DEFAULT 2,
  `notas` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`cliente_id`) REFERENCES `clientes_symbiot`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 3. Datos dummy — Clientes
INSERT INTO `clientes_symbiot`
  (`nombre`, `empresa`, `pais`, `email`, `telefono`, `tipo_suscripcion`, `precio_suscripcion`, `fecha_inicio`, `fecha_vencimiento`, `estatus`, `empresa_id`)
VALUES
  ('Carlos Mendoza',  'Agro-MX S.A.',            'México', 'cmendoza@agromx.com',   '55-1234-5678', 'Mensual', 1200.00, '2025-09-01', '2026-03-01', 'Activo', 2),
  ('Sofía Torres',    'FarmChile Ltda',           'Chile',  'storres@farmchile.cl',  '9-8765-4321',  'Anual',   12000.00,'2025-06-01', '2026-06-01', 'Activo', 2),
  ('Roberto Silva',   'Invernaderos del Norte',   'México', 'rsilva@invnorte.mx',    '33-9988-7766', 'Mensual', 1200.00, '2025-11-01', '2026-03-01', 'Activo', 2),
  ('Camila Rojas',    'AgroConcepción',           'Chile',  'crojas@agroconce.cl',   '9-1122-3344',  'Mensual', 1200.00, '2025-10-01', '2026-02-28', 'Activo', 2),
  ('Miguel Herrera',  'TechFarm Jalisco',         'México', 'mherrera@techfarm.mx',  '33-5566-7788', 'Anual',   12000.00,'2025-01-01', '2026-01-01', 'Baja',   2);

-- 4. Datos dummy — Sensores
INSERT INTO `sensores`
  (`nombre`, `tipo_sensor`, `modelo`, `ubicacion_pais`, `ubicacion_ciudad`, `cliente_id`, `estado`, `fecha_instalacion`, `fecha_ultimo_contacto`, `empresa_id`)
VALUES
  ('Sensor-MX-001', 'Temperatura/Humedad', 'SYM-TH-100', 'México', 'CDMX',          1, 'Activo',      '2025-09-15', '2026-02-24 10:30:00', 2),
  ('Sensor-MX-002', 'Temperatura/Humedad', 'SYM-TH-100', 'México', 'CDMX',          1, 'Activo',      '2025-09-15', '2026-02-24 10:28:00', 2),
  ('Sensor-MX-003', 'pH Suelo',            'SYM-PH-200', 'México', 'CDMX',          1, 'Inactivo',    '2025-09-15', '2026-02-10 08:00:00', 2),
  ('Sensor-CL-001', 'Temperatura/Humedad', 'SYM-TH-100', 'Chile',  'Concepción',    2, 'Activo',      '2025-06-20', '2026-02-24 10:31:00', 2),
  ('Sensor-CL-002', 'Temperatura/Humedad', 'SYM-TH-100', 'Chile',  'Santiago',      2, 'Activo',      '2025-06-20', '2026-02-24 10:29:00', 2),
  ('Sensor-CL-003', 'pH Suelo',            'SYM-PH-200', 'Chile',  'Concepción',    2, 'Activo',      '2025-07-01', '2026-02-24 10:27:00', 2),
  ('Sensor-MX-004', 'Riego',               'SYM-RG-300', 'México', 'Guadalajara',   3, 'Activo',      '2025-11-10', '2026-02-24 10:25:00', 2),
  ('Sensor-MX-005', 'Temperatura/Humedad', 'SYM-TH-100', 'México', 'Monterrey',     4, 'Activo',      '2025-10-05', '2026-02-24 10:22:00', 2),
  ('Sensor-CL-004', 'pH Suelo',            'SYM-PH-200', 'Chile',  'Concepción',    4, 'Inactivo',    '2025-10-05', '2026-01-15 14:00:00', 2),
  ('Sensor-FAB-001','Multi-sensor',        'SYM-MS-500', NULL,     NULL,           NULL,'Fabricacion', NULL,         NULL,                  2),
  ('Sensor-FAB-002','Multi-sensor',        'SYM-MS-500', NULL,     NULL,           NULL,'Fabricacion', NULL,         NULL,                  2);
