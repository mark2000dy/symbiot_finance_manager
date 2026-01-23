-- Backup de gastos_app_db
-- Fecha: 2026-01-23 19:52:48
-- ANTES DE CONCILIACIÓN

SET FOREIGN_KEY_CHECKS=0;


-- Tabla: alumnos
DROP TABLE IF EXISTS `alumnos`;
CREATE TABLE `alumnos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `edad` int(11) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `clase` varchar(50) NOT NULL,
  `tipo_clase` enum('Individual','Grupal') DEFAULT 'Individual',
  `maestro_id` int(11) DEFAULT NULL,
  `horario` varchar(100) DEFAULT NULL,
  `fecha_inscripcion` date NOT NULL,
  `promocion` varchar(100) DEFAULT NULL,
  `precio_mensual` decimal(8,2) NOT NULL,
  `forma_pago` varchar(50) DEFAULT NULL,
  `domiciliado` tinyint(1) DEFAULT '0',
  `titular_domicilado` varchar(150) DEFAULT NULL,
  `estatus` enum('Activo','Baja') DEFAULT 'Activo',
  `fecha_ultimo_pago` date DEFAULT NULL,
  `pago_fuera_tiempo` tinyint(1) DEFAULT '0',
  `empresa_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_alumnos_maestro` (`maestro_id`),
  KEY `fk_alumnos_empresa` (`empresa_id`),
  CONSTRAINT `fk_alumnos_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_alumnos_maestro` FOREIGN KEY (`maestro_id`) REFERENCES `maestros` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=111 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `alumnos` VALUES ('1', 'Abril Torres Jimenez', '17', NULL, NULL, 'Batería', 'Grupal', '3', '17:00 a 18:00 Vie', '2025-06-27', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('2', 'Aidan Crosby Lobo', '11', NULL, NULL, 'Batería', 'Grupal', '2', '19:00 a 20:00 Mar', '2024-06-04', 'Inscripción $0.00', '1350.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('3', 'Aileen Muñoa', '11', NULL, NULL, 'Guitarra', 'Grupal', '4', '17:00 a 18:00 Vie', '2025-06-27', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('4', 'Aisee Nuñez Lopez', '28', NULL, NULL, 'Guitarra', 'Grupal', '4', '12:00 a 13:00 Sab', '2025-07-12', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('5', 'Alan Mateo Gomez Juarez', '12', NULL, NULL, 'Guitarra', 'Individual', '4', '13:00 a 14:00 Sab', '2023-09-09', 'Inscripción $0.00', '1900.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('6', 'Alejandro Navarro Baltazar', '36', NULL, NULL, 'Guitarra', 'Grupal', '1', '17:00 a 18:00 Mie', '2023-08-02', 'Inscripción $0.00', '1500.00', 'Efectivo', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('7', 'Alejandro Paris Hernandez Suarez', '36', NULL, NULL, 'Guitarra', 'Grupal', '1', '19:00 a 20:00 Lun', '2025-07-21', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('8', 'Alejandro Quijano', '35', NULL, NULL, 'Teclado', 'Grupal', '7', '18:00 a 19:00 Lun', '2024-08-28', 'Inscripción $0.00', '1350.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('9', 'Alexis Cordova', '39', NULL, NULL, 'Bajo', 'Grupal', '6', '17:00 a 18:00 Mie', '2024-09-13', 'Inscripción $0.00', '1350.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('10', 'Alondra Cecilia Morales Alvarez', '15', NULL, NULL, 'Guitarra', 'Grupal', '1', '19:00 a 20:00 Vie', '2024-03-15', 'Inscripción $0.00', '1350.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('11', 'Andrés Daza Flores', '13', NULL, NULL, 'Guitarra', 'Grupal', '4', '16:00 a 17:00 Vie', '2025-05-15', 'Inscripción $0.00', '0.00', 'Efectivo', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('12', 'Arath Martinez Gomez', '9', NULL, NULL, 'Batería', 'Grupal', '3', '16:00 a 17:00 Vie', '2024-12-20', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('13', 'Ares Maximiliano Gonzalez', '7', NULL, NULL, 'Batería', 'Grupal', '3', '17:00 a 18:00 Vie', '2024-10-02', 'Inscripción $0.00', '1275.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('14', 'Arianne Nahomy Rodriguez Grajeda', '17', NULL, NULL, 'Teclado', 'Grupal', '7', '18:00 a 19:00 Lun y Vie', '2025-08-04', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('15', 'Axel Adrian Hernandez Martinez', '12', NULL, NULL, 'Guitarra', 'Grupal', '1', '15:00 a 16:00 Sab', '2024-05-31', 'Inscripción $0.00', '1350.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('16', 'Axel Emiliano Rojas Aviles', '13', NULL, NULL, 'Batería', 'Grupal', '3', '18:00 a 19:00 Jue', '2025-05-30', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('17', 'Ayin Michelle Peña Gonzalez', NULL, NULL, NULL, 'Canto', 'Grupal', '5', '17:00 a 18:00 Mie', '2025-07-23', 'Inscripción $0.00', '0.00', 'Efectivo', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('18', 'Brenda Serrano Cervantes', '26', NULL, NULL, 'Bajo', 'Grupal', '6', '18:00 a 19:00 Jue', '2023-09-30', 'Inscripción $0.00', '1500.00', 'Transferencia', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('19', 'Carlos Alejandro Maya Rodriguez', '30', NULL, NULL, 'Canto', 'Grupal', '5', '18:00 a 19:00 Jue', '2025-01-29', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('20', 'Carlos Alejandro Maya Rodriguez', NULL, NULL, NULL, 'Teclado', 'Grupal', '8', '18:00 a 19:00 Jue', '2025-01-29', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('21', 'Carlos Bennet', '21', NULL, NULL, 'Bajo', 'Grupal', '6', '19:00 a 20:00 Lun', '2024-12-02', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('22', 'Cesar Augusto Ancona Tellez', '19', NULL, NULL, 'Guitarra', 'Grupal', '4', '16:00 a 17:00 Lun', '2025-04-21', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('23', 'Cristopher Eduardo Lopez Guzman', '30', NULL, NULL, 'Canto', 'Grupal', '5', '12:00 a 13:00 Sab', '2025-06-21', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('24', 'Cristopher Rafael Huerta Robledo', '24', NULL, NULL, 'Teclado', 'Grupal', '7', '19:00 a 20:00 Ma', '2025-01-07', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('25', 'Daniel Alexander Hernandez Arce', '10', NULL, NULL, 'Guitarra', 'Grupal', '1', '18:00 a 19:00 Mie', '2024-05-08', 'Inscripción $0.00', '1200.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('26', 'Daniel Alexander Hernandez Arce', '10', NULL, NULL, 'Teclado', 'Grupal', '7', '15:00 a 16:00 Ma', '2024-05-08', 'Inscripción $0.00', '1200.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('27', 'Daniel Yamir Quiroz Dias', '8', NULL, NULL, 'Batería', 'Grupal', '3', '13:00 a 14:00 Sab', '2025-07-28', 'Inscripción $0.00', '0.00', 'Transferencia', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('28', 'David Alejandro Allende Avila', '49', NULL, NULL, 'Canto', 'Grupal', '5', '19:00 a 20:00 Jue', '2025-03-28', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('29', 'Diego Alonso Grajeda', '12', NULL, NULL, 'Batería', 'Grupal', '2', '18:00 a 19:00 Lun y Mie', '2025-03-19', 'Inscripción $0.00', '0.00', 'Transferencia', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('30', 'Diego Yael Cano Soto', '17', NULL, NULL, 'Guitarra', 'Grupal', '4', '17:00 a 18:00 Lun y 16:00 a 17:00 Mar', '2025-09-02', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('31', 'Dulce Yael Tarrios', '23', NULL, NULL, 'Canto', 'Grupal', '5', '15:00 a 16:00 Sab', '2024-10-05', 'Inscripción $0.00', '1350.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('32', 'Edgar Javier Chavez Reyes', '45', NULL, NULL, 'Guitarra', 'Grupal', '1', '19:00 a 20:00 Lun', '2024-09-29', 'Inscripción $0.00', '1350.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('33', 'Edwin Kevin Salazar Saenz', '31', NULL, NULL, 'Guitarra', 'Grupal', '4', '16:00 a 17:00 Mie', '2025-06-23', 'Inscripción $0.00', '0.00', 'Efectivo', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('34', 'Eitan Peña Gonzalez', '15', NULL, NULL, 'Guitarra', 'Grupal', '4', '12:00 a 13:00 Sab', '2025-02-15', 'Inscripción $0.00', '0.00', 'Transferencia', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('35', 'Elian Matias Ayala Vaca', '10', NULL, NULL, 'Guitarra', 'Grupal', '4', '19:00 a 20:00 Mie', '2024-12-10', 'Inscripción $0.00', '0.00', 'Transferencia', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('36', 'Emilia Delgado', '5', NULL, NULL, 'Teclado', 'Grupal', '8', '17:00 a 18:00 Vie', '2025-09-12', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('37', 'Emiliano Alberto Cano Soto', '15', NULL, NULL, 'Batería', 'Grupal', '2', '17:00 a 18:00 Lun y 16:00 a 17:00 Mar', '2025-09-02', 'Inscripción $0.00', '0.00', 'Transferencia', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('38', 'Enrique Alexander Roldan Lopez', '16', NULL, NULL, 'Guitarra', 'Grupal', '1', '17:00 a 18:00 Mie', '2023-09-27', 'Inscripción $0.00', '1350.00', 'Transferencia', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('39', 'Enrique Alexander Roldan Lopez', '16', NULL, NULL, 'Batería', 'Grupal', '2', '19:00 a 20:00 Mar', '2023-09-27', 'Inscripción $0.00', '1350.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('40', 'Erik Alcantara Trejo', '22', NULL, NULL, 'Guitarra', 'Grupal', '1', '15:00 a 16:00 Sab', '2024-06-10', 'Inscripción $0.00', '1350.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('41', 'Fabricio Tello Hernandez', NULL, NULL, NULL, 'Canto', 'Grupal', '5', '11:00 a 12:00 Sab', '2025-07-05', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('42', 'Fanny Ieraldini Guitierrez Jasso', '32', NULL, NULL, 'Batería', 'Grupal', '2', '17:00 a 18:00 Mar', '2023-09-17', 'Inscripción $0.00', '1500.00', 'Transferencia', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('43', 'Felix Santamaría Peña', '34', NULL, NULL, 'Batería', 'Grupal', '2', '11:00 a 12:00 Sab', '2025-05-17', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('44', 'Frida Valentina Vazquez Sanchez', '9', NULL, NULL, 'Teclado', 'Grupal', '8', '18:00 a 19:00 Mar', '2025-09-30', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('45', 'Gerardo Alexis Ayala Castillo', NULL, NULL, NULL, 'Guitarra', 'Grupal', '4', NULL, '2025-03-26', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('46', 'Gerardo Tadeo Yépez Padilla', '7', NULL, NULL, 'Batería', 'Grupal', '2', '16:00 a 17:00 Mie', '2025-05-20', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('47', 'Guadalupe Donaji Arellano Ramirez', '15', NULL, NULL, 'Guitarra', 'Grupal', '1', '15:00 a 16:00 Sab', '2023-10-20', 'Inscripción $0.00', '1350.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('48', 'Guadalupe Rebeca Juarez Vergara', '40', NULL, NULL, 'Batería', 'Individual', '2', '19:00 a 20:00 Lun', '2024-03-04', 'Inscripción $0.00', '2000.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('49', 'Gwyneth Adriana Tagliabue Cruz', '15', NULL, NULL, 'Guitarra', 'Grupal', '1', '19:00 a 20:00 Vie', '2023-08-01', 'Inscripción $0.00', '1500.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('50', 'Iktan Nezzo Buendía Ramírez', '14', NULL, NULL, 'Guitarra', 'Grupal', '4', NULL, '2025-06-04', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('51', 'Irving Omar Pacheco Flores', '27', NULL, NULL, 'Guitarra', 'Grupal', '4', '19:00 a 20:00 Jue', '2025-03-04', 'Inscripción $0.00', '0.00', 'Efectivo', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('52', 'Isabel Ramos', '59', NULL, NULL, 'Guitarra', 'Grupal', '1', '20:00 a 21:00 Ma', '2023-11-11', 'Inscripción $0.00', '1500.00', 'Transferencia', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('53', 'Itzel Ameyalli Lechuga Valero', '28', NULL, NULL, 'Canto', 'Grupal', '5', '17:00 a 18:00 Lun', '2025-05-17', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('54', 'Ivan Eidan Espinosa', '42', NULL, NULL, 'Guitarra', 'Grupal', '1', '16:00 a 17:00 Mi', '2024-09-27', 'Inscripción $0.00', '1125.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('55', 'Ivan Eidan Espinosa', '42', NULL, NULL, 'Canto', 'Grupal', '5', '14:00 a 15:00 Sa', '2024-09-27', 'Inscripción $0.00', '1125.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('56', 'Joaquin Pimentel', '70', NULL, NULL, 'Guitarra', 'Grupal', '1', '17:00 a 18:00 Mi', '2023-10-30', 'Inscripción $0.00', '1275.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('57', 'Jorge Armando Hernandez', '39', NULL, NULL, 'Batería', 'Grupal', '2', '18:00 a 19:00 Lun', '2024-10-07', 'Inscripción $0.00', '1125.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('58', 'Jose Fernando Campos Esparza', '28', NULL, NULL, 'Guitarra', 'Individual', '1', '16:00 a 17:00 Vie', '2023-09-08', 'Inscripción $0.00', '2000.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('59', 'Jose Francisco Rangel Alonso', '59', NULL, NULL, 'Guitarra', 'Grupal', '1', 'Baja', '2023-08-25', 'Inscripción $0.00', '1000.00', 'Efectivo', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('60', 'Joshua Chanampa Villada', '18', NULL, NULL, 'Canto', 'Grupal', '5', '17:00 a 19:00 Jue', '2025-07-02', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('61', 'Joshua Chanampa Villada', '18', NULL, NULL, 'Guitarra', 'Grupal', '4', '17:00 a 19:00 Jue', '2025-07-02', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('62', 'Julissa Lopez Guevara', '36', NULL, NULL, 'Teclado', 'Grupal', '8', NULL, '2025-10-03', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('63', 'Leonardo Arturo Gomez Lopez', '8', NULL, NULL, 'Guitarra', 'Grupal', '4', '18:00 a 19:00 Mie', '2024-07-05', 'Inscripción $0.00', '1350.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('64', 'Leonardo Landa Sanchez', '11', NULL, NULL, 'Batería', 'Grupal', '2', '18:00 a 19:00 Mar', '2024-01-09', 'Inscripción $0.00', '1350.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('65', 'Leonardo Perez Gomez', '14', NULL, NULL, 'Batería', 'Grupal', '2', '11:00 a 12:00 Sab', '2024-11-09', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('66', 'Leonardo Saul Ayala Vaca', '10', NULL, NULL, 'Batería', 'Grupal', '2', '19:00 a 20:00 Mie', '2024-12-10', 'Inscripción $0.00', '0.00', 'Transferencia', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('67', 'Luciano Ariel Hernandez Arce', '6', NULL, NULL, 'Batería', 'Grupal', '2', '18:00 a 19:00 Mie', '2024-05-08', 'Inscripción $0.00', '1200.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('68', 'Luciano Ariel Hernandez Arce', '6', NULL, NULL, 'Teclado', 'Grupal', '7', '15:00 a 16:00 Mar', '2024-05-08', 'Inscripción $0.00', '1200.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('69', 'Luciano Gastelum Crosby', '11', NULL, NULL, 'Batería', 'Grupal', '2', '17:00 a 18:00 Mar', '2024-10-05', 'Inscripción $0.00', '1350.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('70', 'Luis Alberto Guizar Garcia', '40', NULL, NULL, 'Canto', 'Grupal', '5', '13:00 a 14:00 Sab', '2024-09-05', 'Inscripción $0.00', '1350.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('71', 'Luis Erik Arias Ayala', '11', NULL, NULL, 'Teclado', 'Grupal', '7', '17:00 a 18:00 Lun y Vie', '2023-09-01', 'Inscripción $0.00', '1500.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('72', 'Luis Fernando Ferruzca Perez', '5', NULL, NULL, 'Batería', 'Grupal', '2', '19:00 a 20:00 Vie', '2024-10-05', 'Inscripción $0.00', '1350.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('73', 'Luis Mario Oropeza', '40', NULL, NULL, 'Canto', 'Grupal', '5', '15:00 a 16:00 Mie', '2024-11-25', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('74', 'Luis Mario Oropeza', '40', NULL, NULL, 'Guitarra', 'Grupal', '4', '16:00 a 17:00 Mie', '2024-11-25', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('75', 'Luis Tadeo Diaz Servín', '15', NULL, NULL, 'Bajo', 'Grupal', '6', '17:00 a 18:00 Mar', '2025-03-25', 'Inscripción $0.00', '0.00', 'Efectivo', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('76', 'Luna Daniela Flores Alvarez', '16', NULL, NULL, 'Teclado', 'Grupal', '7', '17:00 a 18:00 Jue', '2025-06-25', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('77', 'Luzbel Rueda Muñoz', '16', NULL, NULL, 'Guitarra', 'Grupal', '1', '17:00 a 18:00 Mie', '2024-06-01', 'Inscripción $0.00', '1350.00', 'Transferencia', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('78', 'Manuel Santiago Mendoza', '15', NULL, NULL, 'Guitarra', 'Grupal', '4', '19:00 a 20:00 Jue', '2024-07-04', 'Inscripción $0.00', '1350.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('79', 'Manuel Zacate Millan', '62', NULL, NULL, 'Guitarra', 'Grupal', '1', '12:30 a 13:30 Sab', '2023-08-31', 'Inscripción $0.00', '1400.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('80', 'Maria de Lourdes Galindo Becerra', NULL, NULL, NULL, 'Teclado', 'Grupal', '7', NULL, '2025-05-31', 'Inscripción $0.00', '0.00', 'Efectivo', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('81', 'Mariana Diaz Garcia', '30', NULL, NULL, 'Guitarra', 'Grupal', '4', '17:00 a 18:00 Mar', '2025-01-21', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('82', 'Mario Andrés Alpízar Venegas', '34', NULL, NULL, 'Guitarra', 'Grupal', '4', '11:00 a 12:00 Sab', '2025-05-27', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('83', 'Marty Isabella Alcaraz Olvera', '16', NULL, NULL, 'Guitarra', 'Grupal', '4', '16:00 a 17:00 Jue', '2025-05-08', 'Inscripción $0.00', '0.00', 'Efectivo', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('84', 'Mateo Gonzalez', '11', NULL, NULL, 'Teclado', 'Grupal', '8', '19:00 a 20:00 Jue', '2024-10-02', 'Inscripción $0.00', '1275.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('85', 'Mateo Ludwig', '12', NULL, NULL, 'Bajo', 'Grupal', '6', '18:00 a 19:00 Mar', '2024-03-19', 'Inscripción $0.00', '1500.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('86', 'Max Flores Alvarez', '14', NULL, NULL, 'Guitarra', 'Grupal', '4', '17:00 a 18:00 Jue', '2025-06-25', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('87', 'Montserrat Paulina Talavera Huarcacha', '33', NULL, NULL, 'Teclado', 'Grupal', '8', '16:00 a 17:00 Lun y Mie', '2025-08-25', 'Inscripción $0.00', '0.00', 'Transferencia', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('88', 'Nicolas Gutierrez Rebollo', '5', NULL, NULL, 'Teclado', 'Grupal', '7', '11:00 a 12:00 Sab', '2024-11-09', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('89', 'Oscar Castilla', '10', NULL, NULL, 'Teclado', 'Grupal', '7', '12:00 a 13:00 Mie', '2024-03-22', 'Inscripción $0.00', '1350.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('90', 'Oscar Godinez Martinez', '44', NULL, NULL, 'Guitarra', 'Grupal', '4', '11:00 a 12:00 Sab', '2024-08-31', 'Inscripción $0.00', '1350.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('91', 'Pamela Gutierrez Carrillo', '13', NULL, NULL, 'Batería', 'Grupal', '2', '17:00 a 18:00 Mie', '2025-07-31', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('92', 'Paulina Yazmin Vallejo Nava', '15', NULL, NULL, 'Batería', 'Grupal', '2', '18:00 a 19:00 Mar', '2025-01-28', 'Inscripción $0.00', '0.00', 'Efectivo', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('93', 'Rania Victoria Alcaraz Olvera', '14', NULL, NULL, 'Batería', 'Grupal', '3', '16:00 a 17:00 Jue', '2025-09-03', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('94', 'Rebeca Ramirez', '35', NULL, NULL, 'Batería', 'Grupal', '2', '19:00 a 20:00 Vie', '2024-09-01', 'Inscripción $0.00', '1250.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('95', 'Rebeca Ramirez', '35', NULL, NULL, 'Canto', 'Grupal', '5', '19:00 a 20:00 Vie', '2024-09-01', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('96', 'Romina Rojas Aviles', '14', NULL, NULL, 'Guitarra', 'Grupal', '4', '18:00 a 19:00 Jue', '2025-05-30', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('97', 'Rui Ortiz', '16', NULL, NULL, 'Guitarra', 'Grupal', '1', '19:00 a 20:00 Vie', '2024-07-05', 'Inscripción $0.00', '1350.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('98', 'Samantha Sandoval', '9', NULL, NULL, 'Teclado', 'Grupal', '7', NULL, '2025-10-02', 'Inscripción $0.00', '0.00', 'Transferencia', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('99', 'Santiago Bustamante', '6', NULL, NULL, 'Batería', 'Grupal', '3', NULL, '2025-06-12', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('100', 'Santiago Rosas Estrada', '23', NULL, NULL, 'Batería', 'Grupal', '2', '18:00 a 19:00 Mar', '2025-06-17', 'Inscripción $0.00', '0.00', 'Becado', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('101', 'Sergio Hector Rivera Trejo', '6', NULL, NULL, 'Batería', 'Grupal', '2', '12:00 a 13:00 Sab', '2025-01-11', 'Inscripción $0.00', '0.00', 'Transferencia', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('102', 'Sofia Patiño Gonzalez', NULL, NULL, NULL, 'Teclado', 'Grupal', '7', NULL, '2025-05-31', 'Inscripción $0.00', '0.00', 'Efectivo', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('103', 'Vanessa Desire Maya Bermudez', '37', NULL, NULL, 'Batería', 'Grupal', '2', '18:00 a 19:00 Mar', '2025-07-29', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('104', 'Veronica Ramirez Ruano', '36', NULL, NULL, 'Guitarra', 'Grupal', '1', '15:00 a 16:00 Sab', '2025-06-30', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('105', 'Victor Eduardo Caballero Nieto', '24', NULL, NULL, 'Teclado', 'Grupal', '7', '19:00 a 20:00 Mie', '2024-10-05', 'Inscripción $0.00', '1350.00', 'TPV', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('106', 'Xanat Yamil Carmona Jimenez', '13', NULL, NULL, 'Canto', 'Grupal', '5', '13:00 a 14:00 Sab', '2025-07-26', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('107', 'Yoanna Barrios', '30', NULL, NULL, 'Teclado', 'Grupal', '7', '11:00 a 12:00 Jue', '2024-07-18', 'Inscripción $0.00', '1500.00', 'Transferencia', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('108', 'Yoanna Barrios', '30', NULL, NULL, 'Canto', 'Grupal', '5', '11:00 a 12:00 Jue', '2024-07-18', 'Inscripción $0.00', '1500.00', 'Transferencia', '0', NULL, 'Baja', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('109', 'Yolotl Zeltzin Aguilar Villagrán', '30', NULL, NULL, 'Guitarra', 'Grupal', '1', NULL, '2025-10-04', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `alumnos` VALUES ('110', 'Yolotl Zeltzin Aguilar Villagrán', '30', NULL, NULL, 'Canto', 'Grupal', '5', NULL, '2025-10-04', 'Inscripción $0.00', '0.00', 'TPV', '0', NULL, 'Activo', NULL, '0', '1', '2026-01-22 20:22:49', '2026-01-22 20:22:49');


-- Tabla: clientes
DROP TABLE IF EXISTS `clientes`;
CREATE TABLE `clientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `empresa_id` int(11) NOT NULL,
  `tipo` enum('alumno','externo') DEFAULT 'externo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=111 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `clientes` VALUES ('1', 'Abril Torres Jimenez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('2', 'Aidan Crosby Lobo', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('3', 'Aileen Muñoa', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('4', 'Aisee Nuñez Lopez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('5', 'Alan Mateo Gomez Juarez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('6', 'Alejandro Navarro Baltazar', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('7', 'Alejandro Paris Hernandez Suarez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('8', 'Alejandro Quijano', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('9', 'Alexis Cordova', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('10', 'Alondra Cecilia Morales Alvarez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('11', 'Andrés Daza Flores', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('12', 'Arath Martinez Gomez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('13', 'Ares Maximiliano Gonzalez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('14', 'Arianne Nahomy Rodriguez Grajeda', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('15', 'Axel Adrian Hernandez Martinez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('16', 'Axel Emiliano Rojas Aviles', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('17', 'Ayin Michelle Peña Gonzalez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('18', 'Brenda Serrano Cervantes', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('19', 'Carlos Alejandro Maya Rodriguez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('20', 'Carlos Alejandro Maya Rodriguez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('21', 'Carlos Bennet', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('22', 'Cesar Augusto Ancona Tellez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('23', 'Cristopher Eduardo Lopez Guzman', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('24', 'Cristopher Rafael Huerta Robledo', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('25', 'Daniel Alexander Hernandez Arce', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('26', 'Daniel Alexander Hernandez Arce', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('27', 'Daniel Yamir Quiroz Dias', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('28', 'David Alejandro Allende Avila', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('29', 'Diego Alonso Grajeda', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('30', 'Diego Yael Cano Soto', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('31', 'Dulce Yael Tarrios', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('32', 'Edgar Javier Chavez Reyes', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('33', 'Edwin Kevin Salazar Saenz', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('34', 'Eitan Peña Gonzalez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('35', 'Elian Matias Ayala Vaca', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('36', 'Emilia Delgado', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('37', 'Emiliano Alberto Cano Soto', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('38', 'Enrique Alexander Roldan Lopez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('39', 'Enrique Alexander Roldan Lopez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('40', 'Erik Alcantara Trejo', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('41', 'Fabricio Tello Hernandez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('42', 'Fanny Ieraldini Guitierrez Jasso', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('43', 'Felix Santamaría Peña', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('44', 'Frida Valentina Vazquez Sanchez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('45', 'Gerardo Alexis Ayala Castillo', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('46', 'Gerardo Tadeo Yépez Padilla', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('47', 'Guadalupe Donaji Arellano Ramirez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('48', 'Guadalupe Rebeca Juarez Vergara', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('49', 'Gwyneth Adriana Tagliabue Cruz', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('50', 'Iktan Nezzo Buendía Ramírez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('51', 'Irving Omar Pacheco Flores', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('52', 'Isabel Ramos', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('53', 'Itzel Ameyalli Lechuga Valero', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('54', 'Ivan Eidan Espinosa', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('55', 'Ivan Eidan Espinosa', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('56', 'Joaquin Pimentel', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('57', 'Jorge Armando Hernandez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('58', 'Jose Fernando Campos Esparza', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('59', 'Jose Francisco Rangel Alonso', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('60', 'Joshua Chanampa Villada', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('61', 'Joshua Chanampa Villada', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('62', 'Julissa Lopez Guevara', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('63', 'Leonardo Arturo Gomez Lopez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('64', 'Leonardo Landa Sanchez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('65', 'Leonardo Perez Gomez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('66', 'Leonardo Saul Ayala Vaca', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('67', 'Luciano Ariel Hernandez Arce', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('68', 'Luciano Ariel Hernandez Arce', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('69', 'Luciano Gastelum Crosby', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('70', 'Luis Alberto Guizar Garcia', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('71', 'Luis Erik Arias Ayala', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('72', 'Luis Fernando Ferruzca Perez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('73', 'Luis Mario Oropeza', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('74', 'Luis Mario Oropeza', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('75', 'Luis Tadeo Diaz Servín', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('76', 'Luna Daniela Flores Alvarez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('77', 'Luzbel Rueda Muñoz', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('78', 'Manuel Santiago Mendoza', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('79', 'Manuel Zacate Millan', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('80', 'Maria de Lourdes Galindo Becerra', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('81', 'Mariana Diaz Garcia', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('82', 'Mario Andrés Alpízar Venegas', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('83', 'Marty Isabella Alcaraz Olvera', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('84', 'Mateo Gonzalez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('85', 'Mateo Ludwig', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('86', 'Max Flores Alvarez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('87', 'Montserrat Paulina Talavera Huarcacha', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('88', 'Nicolas Gutierrez Rebollo', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('89', 'Oscar Castilla', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('90', 'Oscar Godinez Martinez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('91', 'Pamela Gutierrez Carrillo', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('92', 'Paulina Yazmin Vallejo Nava', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('93', 'Rania Victoria Alcaraz Olvera', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('94', 'Rebeca Ramirez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('95', 'Rebeca Ramirez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('96', 'Romina Rojas Aviles', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('97', 'Rui Ortiz', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('98', 'Samantha Sandoval', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('99', 'Santiago Bustamante', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('100', 'Santiago Rosas Estrada', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('101', 'Sergio Hector Rivera Trejo', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('102', 'Sofia Patiño Gonzalez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('103', 'Vanessa Desire Maya Bermudez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('104', 'Veronica Ramirez Ruano', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('105', 'Victor Eduardo Caballero Nieto', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('106', 'Xanat Yamil Carmona Jimenez', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('107', 'Yoanna Barrios', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('108', 'Yoanna Barrios', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('109', 'Yolotl Zeltzin Aguilar Villagrán', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `clientes` VALUES ('110', 'Yolotl Zeltzin Aguilar Villagrán', NULL, NULL, '1', 'alumno', '2026-01-22 20:22:49', '2026-01-22 20:22:49');


-- Tabla: empresas
DROP TABLE IF EXISTS `empresas`;
CREATE TABLE `empresas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `tipo_negocio` varchar(100) NOT NULL,
  `activa` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `empresas` VALUES ('1', 'Rockstar Skull', 'Academia de Música', '1', '2025-09-01 15:54:17', '2025-10-06 15:11:22');
INSERT INTO `empresas` VALUES ('2', 'Symbiot Technologies', 'Desarrollo IoT y Aplicaciones', '1', '2025-09-01 15:54:17', '2025-10-06 15:11:22');


-- Tabla: maestros
DROP TABLE IF EXISTS `maestros`;
CREATE TABLE `maestros` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `empresa_id` int(11) NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_maestros_empresa` (`empresa_id`),
  CONSTRAINT `fk_maestros_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `maestros` VALUES ('1', 'Hugo Vazquez', 'hugo.vazquez@rockstarskull.com', NULL, 'Director y Guitarra Eléctrica', '1', '1', '2025-09-01 15:54:17');
INSERT INTO `maestros` VALUES ('2', 'Julio Olvera', 'julio@rockstarskull.com', NULL, 'Batería', '1', '1', '2025-09-01 15:54:17');
INSERT INTO `maestros` VALUES ('3', 'Demian Andrade', 'demian@rockstarskull.com', NULL, 'Batería', '1', '1', '2025-09-01 15:54:17');
INSERT INTO `maestros` VALUES ('4', 'Irwin Hernandez', 'irwin@rockstarskull.com', NULL, 'Guitarra Eléctrica', '1', '1', '2025-09-01 15:54:17');
INSERT INTO `maestros` VALUES ('5', 'Nahomy Perez', 'nahomy@rockstarskull.com', NULL, 'Canto', '1', '1', '2025-09-01 15:54:17');
INSERT INTO `maestros` VALUES ('6', 'Luis Blanquet', 'luis@rockstarskull.com', NULL, 'Bajo Eléctrico', '1', '1', '2025-09-01 15:54:17');
INSERT INTO `maestros` VALUES ('7', 'Manuel Reyes', 'manuel@rockstarskull.com', NULL, 'Piano/Teclado', '1', '1', '2025-09-01 15:54:17');
INSERT INTO `maestros` VALUES ('8', 'Harim Lopez', 'harim.lopez@rockstarskull.com', NULL, 'Piano/Teclado', '1', '1', '2025-09-01 15:54:17');


-- Tabla: pagos_mensuales
DROP TABLE IF EXISTS `pagos_mensuales`;
CREATE TABLE `pagos_mensuales` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `alumno_id` int(11) NOT NULL,
  `año` int(11) NOT NULL,
  `mes` int(11) NOT NULL,
  `monto_pagado` decimal(8,2) NOT NULL DEFAULT '0.00',
  `fecha_pago` date DEFAULT NULL,
  `metodo_pago` varchar(50) DEFAULT NULL,
  `notas` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_pagos_alumno` (`alumno_id`),
  CONSTRAINT `fk_pagos_alumno` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `pagos_mensuales` VALUES ('1', '2', '2025', '6', '1350.00', '2025-06-04', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('2', '5', '2024', '9', '1900.00', '2024-09-09', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('3', '5', '2024', '10', '2000.00', '2024-10-09', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('4', '5', '2024', '11', '2000.00', '2024-11-09', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('5', '5', '2024', '12', '2000.00', '2024-12-09', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('6', '5', '2025', '1', '2000.00', '2025-01-09', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('7', '5', '2025', '2', '2000.00', '2025-02-09', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('8', '5', '2025', '3', '2000.00', '2025-03-09', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('9', '5', '2025', '4', '2000.00', '2025-04-09', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('10', '5', '2025', '5', '2000.00', '2025-05-09', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('11', '5', '2025', '6', '2000.00', '2025-06-09', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('12', '6', '2024', '8', '1500.00', '2024-08-02', 'Efectivo', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('13', '6', '2024', '9', '1500.00', '2024-09-02', 'Efectivo', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('14', '10', '2025', '3', '1350.00', '2025-03-15', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('15', '10', '2025', '4', '1350.00', '2025-04-15', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('16', '10', '2025', '5', '1350.00', '2025-05-15', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('17', '10', '2025', '6', '1350.00', '2025-06-15', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('18', '15', '2025', '5', '1350.00', '2025-05-31', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('19', '15', '2025', '6', '1350.00', '2025-06-30', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('20', '18', '2024', '9', '1500.00', '2024-09-30', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('21', '18', '2024', '10', '1500.00', '2024-10-30', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('22', '18', '2024', '11', '1500.00', '2024-11-30', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('23', '18', '2024', '12', '1500.00', '2024-12-30', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('24', '18', '2025', '1', '1500.00', '2025-01-30', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('25', '18', '2025', '2', '1500.00', '2025-02-28', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('26', '18', '2025', '3', '1500.00', '2025-03-30', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('27', '26', '2025', '5', '1200.00', '2025-05-08', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('28', '26', '2025', '5', '1200.00', '2025-05-08', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('29', '39', '2024', '9', '1350.00', '2024-09-27', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('30', '39', '2024', '10', '1350.00', '2024-10-27', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('31', '39', '2024', '11', '1350.00', '2024-11-27', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('32', '39', '2024', '12', '1350.00', '2024-12-27', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('33', '39', '2025', '1', '1350.00', '2025-01-27', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('34', '39', '2025', '2', '1350.00', '2025-02-27', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('35', '39', '2025', '3', '1350.00', '2025-03-27', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('36', '39', '2024', '9', '1350.00', '2024-09-27', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('37', '39', '2024', '10', '1350.00', '2024-10-27', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('38', '39', '2024', '11', '1350.00', '2024-11-27', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('39', '39', '2024', '12', '1350.00', '2024-12-27', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('40', '39', '2025', '1', '1350.00', '2025-01-27', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('41', '39', '2025', '2', '1350.00', '2025-02-27', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('42', '40', '2025', '6', '1350.00', '2025-06-10', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('43', '42', '2024', '9', '1500.00', '2024-09-17', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('44', '42', '2024', '10', '1500.00', '2024-10-17', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('45', '42', '2024', '12', '1500.00', '2024-12-17', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('46', '42', '2025', '1', '1500.00', '2025-01-17', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('47', '42', '2025', '2', '1500.00', '2025-02-17', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('48', '42', '2025', '3', '1500.00', '2025-03-17', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('49', '42', '2025', '4', '1500.00', '2025-04-17', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('50', '42', '2025', '5', '1500.00', '2025-05-17', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('51', '42', '2025', '6', '1500.00', '2025-06-17', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('52', '47', '2024', '10', '1350.00', '2024-10-20', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('53', '47', '2024', '11', '1350.00', '2024-11-20', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('54', '47', '2024', '12', '1350.00', '2024-12-20', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('55', '47', '2025', '1', '1350.00', '2025-01-20', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('56', '47', '2025', '2', '1350.00', '2025-02-20', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('57', '47', '2025', '3', '1350.00', '2025-03-20', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('58', '47', '2025', '4', '1350.00', '2025-04-20', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('59', '47', '2025', '5', '1350.00', '2025-05-20', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('60', '47', '2025', '6', '1350.00', '2025-06-20', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('61', '48', '2025', '3', '2000.00', '2025-03-04', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('62', '48', '2025', '4', '2000.00', '2025-04-04', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('63', '48', '2025', '5', '2000.00', '2025-05-04', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('64', '48', '2025', '6', '2000.00', '2025-06-04', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('65', '49', '2024', '8', '1500.00', '2024-08-01', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('66', '49', '2024', '9', '1350.00', '2024-09-01', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('67', '49', '2024', '10', '1350.00', '2024-10-01', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('68', '49', '2024', '11', '1350.00', '2024-11-01', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('69', '52', '2024', '11', '1500.00', '2024-11-11', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('70', '52', '2024', '12', '1500.00', '2024-12-11', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('71', '52', '2025', '1', '1500.00', '2025-01-11', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('72', '56', '2024', '10', '1275.00', '2024-10-30', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('73', '58', '2024', '9', '2000.00', '2024-09-08', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('74', '59', '2024', '8', '1000.00', '2024-08-25', 'Efectivo', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('75', '64', '2024', '12', '1350.00', '2024-12-09', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('76', '64', '2025', '1', '1350.00', '2025-01-09', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('77', '64', '2025', '2', '1350.00', '2025-02-09', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('78', '64', '2025', '3', '1350.00', '2025-03-09', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('79', '64', '2025', '4', '1350.00', '2025-04-09', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('80', '64', '2025', '5', '1350.00', '2025-05-09', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('81', '64', '2025', '6', '1350.00', '2025-06-09', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('82', '68', '2025', '5', '1200.00', '2025-05-08', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('83', '68', '2025', '5', '1200.00', '2025-05-08', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('84', '71', '2024', '9', '2700.00', '2024-09-01', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('85', '71', '2024', '10', '2700.00', '2024-10-01', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('86', '71', '2024', '11', '2700.00', '2024-11-01', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('87', '71', '2024', '12', '1500.00', '2024-12-01', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('88', '71', '2025', '1', '1500.00', '2025-01-01', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('89', '71', '2025', '2', '1500.00', '2025-02-01', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('90', '71', '2025', '3', '1500.00', '2025-03-01', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('91', '71', '2025', '5', '1500.00', '2025-05-01', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('92', '77', '2025', '6', '1350.00', '2025-06-01', 'Transferencia', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('93', '79', '2024', '8', '1400.00', '2024-08-31', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('94', '79', '2024', '9', '1500.00', '2024-09-30', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('95', '85', '2025', '3', '1500.00', '2025-03-19', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('96', '89', '2025', '3', '1350.00', '2025-03-22', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('97', '89', '2025', '4', '1350.00', '2025-04-22', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('98', '89', '2025', '5', '1350.00', '2025-05-22', 'TPV', NULL, '2026-01-22 20:22:51');
INSERT INTO `pagos_mensuales` VALUES ('99', '89', '2025', '6', '1350.00', '2025-06-22', 'TPV', NULL, '2026-01-22 20:22:51');


-- Tabla: staff
DROP TABLE IF EXISTS `staff`;
CREATE TABLE `staff` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `puesto` varchar(100) NOT NULL,
  `empresa_id` int(11) NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_staff_empresa` (`empresa_id`),
  CONSTRAINT `fk_staff_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `staff` VALUES ('1', 'Marco Delgado', 'marco.delgado@symbiot.com.mx', NULL, 'Financial Manager', '2', '1', '2025-09-01 15:54:17');
INSERT INTO `staff` VALUES ('2', 'Antonio Razo', 'antonio.razo@symbiot.com.mx', NULL, 'Marketing Manager', '2', '1', '2025-09-01 15:54:17');
INSERT INTO `staff` VALUES ('3', 'Santiago Rosas', 'santiago.rosas@rockstarskull.com', NULL, 'Staff Leader', '1', '1', '2025-09-01 15:54:17');
INSERT INTO `staff` VALUES ('4', 'Emiliano Rosas', 'emiliano.rosas@rockstarskull.com', NULL, 'MKT Leader', '1', '1', '2025-09-01 15:54:17');
INSERT INTO `staff` VALUES ('5', 'Maria de la Luz Nava', 'maria.nava@rockstarskull.com', NULL, 'Cleaning Concierge', '1', '1', '2025-09-01 15:54:17');


-- Tabla: transacciones
DROP TABLE IF EXISTS `transacciones`;
CREATE TABLE `transacciones` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `concepto` varchar(500) NOT NULL,
  `socio` varchar(50) NOT NULL,
  `cliente_id` int(11) DEFAULT NULL,
  `empresa_id` int(11) NOT NULL,
  `forma_pago` varchar(50) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `precio_unitario` decimal(15,2) NOT NULL,
  `total` decimal(17,2) GENERATED ALWAYS AS ((`cantidad` * `precio_unitario`)) STORED,
  `tipo` enum('G','I') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=884 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `transacciones` VALUES ('1', '2023-03-31', 'Domino y Cuentas Rockstarskull', 'Antonio Razo', NULL, '1', 'TDC', '1.00', '569.00', '569.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('2', '2023-03-31', 'Logo', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '1000.00', '1000.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('3', '2023-05-05', 'Videos de Frank Abril', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('4', '2023-05-13', 'Investigación jurídica', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '6000.00', '6000.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('5', '2023-05-13', 'Servicios de Tramite', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('6', '2023-05-17', 'Renta 1 de 12 Local, pago por adelantado', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '12000.00', '12000.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('7', '2023-05-17', 'Depósito de arrendamiento', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '12000.00', '12000.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('8', '2023-05-17', 'Cinta metrica 5m', 'Marco Delgado', NULL, '1', 'Efectivo', '1.00', '60.00', '60.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('9', '2023-05-22', 'Videos de Frank Mayo', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '1200.00', '1200.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('10', '2023-05-23', 'Cámara IP PTZ Exterior v380Pro', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '1349.00', '1349.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('11', '2023-05-23', 'Cámara IP PTZ Interior v380Pro', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '298.00', '298.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('12', '2023-05-23', 'Cámara IP Visión Nocturna Interior v380Pro', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '953.16', '953.16', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('13', '2023-05-23', 'Memoria MicroSD 64Gb', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '645.00', '645.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('14', '2023-05-23', 'Cargador 5V 2A', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '287.97', '287.97', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('15', '2023-05-30', 'Ampli Orange 32RT', 'Hugo Vazquez', NULL, '1', 'Efectivo', '1.00', '8250.00', '8250.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('16', '2023-05-30', 'Ampli Blackstar ID CORE 100', 'Hugo Vazquez', NULL, '1', 'Efectivo', '1.00', '13419.00', '13419.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('17', '2023-05-30', 'Jackson Monarkh', 'Hugo Vazquez', NULL, '1', 'Efectivo', '1.00', '15196.00', '15196.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('18', '2023-05-30', 'Foot switch', 'Hugo Vazquez', NULL, '1', 'Efectivo', '1.00', '2315.00', '2315.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('19', '2023-05-30', 'Baterías Alesis Nitro Mesh Kit', 'Hugo Vazquez', NULL, '1', 'TDC', '1.00', '15198.00', '15198.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('20', '2023-05-31', 'Ventilador de torre 34\"', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '2427.00', '2427.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('21', '2023-05-31', 'Extintor ABC 6Kg', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '880.44', '880.44', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('22', '2023-05-31', 'Tiras LED luz neon flex manguera con fuente 25m', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '3284.49', '3284.49', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('23', '2023-05-31', 'Interruptor Sonoff', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '406.89', '406.89', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('24', '2023-05-31', 'Kit de señalización protección civil 10 piezas', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '350.00', '350.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('25', '2023-05-31', 'Videos de Frank bloque 3 de 4', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '600.00', '600.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('26', '2023-05-31', 'Silla eames negra', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '5697.00', '5697.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('27', '2023-06-02', 'Aislante acustico 1.22 x 2.44 Foamular 250', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '2994.00', '2994.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('28', '2023-06-02', 'Taquetes de madera', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '14.67', '14.67', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('29', '2023-06-02', 'Tornillos para madera', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '79.00', '79.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('30', '2023-06-02', 'Canes de madera', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '275.00', '275.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('31', '2023-06-02', 'Puerta tambor', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '4395.00', '4395.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('32', '2023-06-02', 'Canal de amarre', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '426.00', '426.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('33', '2023-06-02', 'Poste metálico', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '980.00', '980.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('34', '2023-06-02', 'Marco de madera puerta c bisagra', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '3675.00', '3675.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('35', '2023-06-04', 'Parte 1 de 2 Mano de obra y panel OSB 12mm', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '7000.00', '7000.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('36', '2023-06-06', 'Fuente regulada 12V 5A', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '1105.95', '1105.95', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('37', '2023-06-06', 'Mini amplificador de Audio 600W', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '1330.29', '1330.29', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('38', '2023-06-06', 'Parte 2 de 2 Mano de obra y panel OSB 12mm', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '10468.00', '10468.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('39', '2023-06-11', 'Compra de componentes eléctricos (Home Depot)', 'Antonio Razo', NULL, '1', 'TDC', '1.00', '1928.64', '1928.64', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('40', '2023-06-14', 'Compra de paneles acusticos Pi Acustica', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '21942.34', '21942.34', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('41', '2023-06-15', 'Empastado con redimix y pintado de muros', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '7621.00', '7621.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('42', '2023-06-16', 'Botiquin de Primeros Auxilios', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '778.05', '778.05', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('43', '2023-06-17', 'Botes de basura', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '675.00', '675.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('44', '2023-06-18', 'Aspiradora', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '1078.00', '1078.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('45', '2023-06-19', 'Renta 2 de 12 Local', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('46', '2023-06-20', 'Videos de Frank 4/4 Mayo y 3/4 Junio', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2400.00', '2400.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('47', '2023-06-21', 'Smart TV Led 32\" Amaz', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '2598.00', '2598.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('48', '2023-06-23', 'Transferencia Boker a Marco cargo', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '8224.88', '8224.88', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('49', '2023-06-23', 'Transferencia Boker a Marco abono', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '8224.88', '8224.88', 'I', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('50', '2023-06-23', 'Recogedor', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '75.00', '75.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('51', '2023-06-23', 'Toalla manos', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '138.00', '138.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('52', '2023-06-23', 'Trapo', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '36.00', '36.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('53', '2023-06-23', 'Microfibra', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '20.00', '20.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('54', '2023-06-23', 'Fibra 3 x 14', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '42.00', '42.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('55', '2023-06-23', 'Pinol', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '40.00', '40.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('56', '2023-06-23', 'Jabon de manos Equate', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '29.00', '29.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('57', '2023-06-23', 'Cepillo para baño', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '25.00', '25.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('58', '2023-06-23', 'Cloralex', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '14.50', '14.50', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('59', '2023-06-23', 'Mini rodillo', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '49.00', '49.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('60', '2023-06-23', 'Glade desinfectante', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '59.00', '59.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('61', '2023-06-23', 'Guantes de hule 2 x 25', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '50.00', '50.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('62', '2023-06-23', 'Brocha', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '25.00', '25.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('63', '2023-06-23', 'Bomba para taza de baño', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '69.50', '69.50', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('64', '2023-06-23', 'Jerga', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '26.00', '26.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('65', '2023-06-23', 'Cepillo para retrete con base', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '55.00', '55.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('66', '2023-06-23', 'Papel de baño 4 rollos', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '27.00', '27.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('67', '2023-06-23', 'Jalador', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '65.00', '65.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('68', '2023-06-26', 'Anuncio luminoso Neon flex rojo', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '3000.00', '3000.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('69', '2023-06-26', 'Caja de luz 2.10 x 1.20 logo translúcido (fabr + inst)', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '9000.00', '9000.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('70', '2023-06-30', 'Mueble Recepción Michigan 1.10m frente', 'Marco Delgado', NULL, '1', 'Efectivo', '1.00', '3550.00', '3550.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('71', '2023-07-01', 'Pago de mantenimiento Julio', 'Antonio Razo', NULL, '1', 'Efectivo', '1.00', '440.00', '440.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('72', '2023-07-04', 'Pizarrón blanco 80x120 cm', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '2547.00', '2547.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('73', '2023-07-04', 'Monitor 19\" Stylos', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '1399.00', '1399.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('74', '2023-07-04', 'Mouse y teclado inalambrico Logitech', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '416.00', '416.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('75', '2023-07-04', 'Mini Pc Intel N5105 De 11.ª Generación, 16 Gb, 512 Gb', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '3525.35', '3525.35', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('76', '2023-07-04', 'Alfombra Astra Color gris 37m2', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '6845.00', '6845.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('77', '2023-07-04', 'Transferencia Boker a Marco cargo', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '20000.00', '20000.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('78', '2023-07-04', 'Transferencia Boker a Marco abono', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '20000.00', '20000.00', 'I', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('79', '2023-07-04', 'Cafetera Oster', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '365.00', '365.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('80', '2023-07-04', '50% de adelanto a contrato mensual de CM', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '3712.00', '3712.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('81', '2023-07-06', 'Registro de marca en el IMPI', 'Marco Delgado', NULL, '1', 'Efectivo', '1.00', '2813.77', '2813.77', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('82', '2023-07-06', 'Pago recibo CFE Local', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '192.00', '192.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('83', '2023-07-07', 'Anuncio exterior luminoso', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '6800.00', '6800.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('84', '2023-07-09', 'Invitación Grand Opening', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('85', '2023-07-09', 'Materiales: Pintura y Pegamento', 'Antonio Razo', NULL, '1', 'Efectivo', '1.00', '650.00', '650.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('86', '2023-07-11', 'Candado', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '242.00', '242.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('87', '2023-07-12', 'Regleta Cargador Multicontactos 8 salidas 3 USB 1 C', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '427.24', '427.24', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('88', '2023-07-12', 'Soporte para cámara IP Universal Base', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '318.00', '318.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('89', '2023-07-12', 'Cámara IP Adicional (Salón Batería)', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '317.72', '317.72', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('90', '2023-07-13', 'Meta Ads', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '5000.00', '5000.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('91', '2023-07-13', 'TikTok Ads', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '3500.00', '3500.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('92', '2023-07-13', 'Meta Ads (extra)', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '5000.00', '5000.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('93', '2023-07-13', 'Amplificador de Bajo Meteoro 250 W', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '3000.00', '3000.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('94', '2023-07-13', 'Amplificador Orange 20W', 'Marco Delgado', NULL, '1', 'Efectivo', '1.00', '3199.00', '3199.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('95', '2023-07-13', 'Lector tarjetas Point Smart TPV Mercado Pago', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '3499.00', '3499.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('96', '2023-07-15', '16 Cuadros canva b/n - Decoración', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '3598.00', '3598.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('97', '2023-07-17', 'Audifonos', 'Hugo Vazquez', NULL, '1', 'Efectivo', '1.00', '237.00', '237.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('98', '2023-07-17', 'Extensiones', 'Hugo Vazquez', NULL, '1', 'Efectivo', '1.00', '52.00', '52.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('99', '2023-07-17', 'Cables RCA - Plug', 'Hugo Vazquez', NULL, '1', 'Efectivo', '1.00', '270.00', '270.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('100', '2023-07-17', 'Cables Plug a Plug', 'Hugo Vazquez', NULL, '1', 'Efectivo', '1.00', '525.00', '525.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('101', '2023-07-17', 'Convertidores audifonos', 'Hugo Vazquez', NULL, '1', 'Efectivo', '1.00', '50.00', '50.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('102', '2023-07-17', 'Extensiones de audifonos', 'Hugo Vazquez', NULL, '1', 'Efectivo', '1.00', '50.00', '50.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('103', '2023-07-17', 'Instalación y contratación Total Play 75 Megas', 'Marco Delgado', NULL, '1', 'Efectivo', '1.00', '550.00', '550.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('104', '2023-07-20', 'Renta 3 de 12 Local', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('105', '2023-07-21', 'Diseño gráfico para impresiones', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '500.00', '500.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('106', '2023-07-21', 'Pago 2 Jul CM', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '4408.00', '4408.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('107', '2023-07-22', 'Videos de Frank bloque Julio', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2400.00', '2400.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('108', '2023-07-22', 'Estante Plastico 4 repisas Pretul', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '297.00', '297.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('109', '2023-07-24', 'Bajo JS Series Concert Bass', 'Hugo Vazquez', NULL, '1', 'Efectivo', '1.00', '6999.00', '6999.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('110', '2023-07-24', 'Soporte Guitarra Onstage', 'Hugo Vazquez', NULL, '1', 'Efectivo', '1.00', '1332.00', '1332.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('111', '2023-07-24', 'Banco Batería Power Beat', 'Hugo Vazquez', NULL, '1', 'Efectivo', '1.00', '2766.00', '2766.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('112', '2023-07-25', 'Redistribución de cableado y habilitación de iluminación', 'Marco Delgado', NULL, '1', 'Efectivo', '1.00', '1400.00', '1400.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('113', '2023-07-29', 'Limpieza 29-jul', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('114', '2023-07-29', 'Banco Batería genérico', 'Marco Delgado', NULL, '1', 'Efectivo', '1.00', '1000.00', '1000.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('115', '2023-07-29', 'Pago de impresiones', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '3839.00', '3839.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('116', '2023-07-31', 'Resanado de pared y caja para el tablero eléctrico', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '1150.00', '1150.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('117', '2023-07-31', 'Depósito Google Ads', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '7200.00', '7200.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('118', '2023-08-01', 'Mesa auxiliar', 'Hugo Vazquez', NULL, '1', 'TDC', '1.00', '482.00', '482.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('119', '2023-08-01', 'Mesa para computadora', 'Hugo Vazquez', NULL, '1', 'TDC', '1.00', '580.00', '580.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('120', '2023-08-05', 'Letreros decorativos Zona de Musica', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '2555.98', '2555.98', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('121', '2023-08-05', 'Limpieza 05-Ago', 'Escuela', NULL, '1', 'Efectivo', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('122', '2023-08-06', 'Pago 1 Ago CM', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '4408.00', '4408.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('123', '2023-08-12', 'Limpieza 12-Ago', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('124', '2023-08-15', 'Pago Frank - Quincena', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('125', '2023-08-15', 'Base de amplificador', 'Hugo Vazquez', NULL, '1', 'TDC', '1.00', '780.00', '780.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('126', '2023-08-15', 'Bancopie', 'Hugo Vazquez', NULL, '1', 'TDC', '1.00', '810.00', '810.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('127', '2023-08-15', 'Base de teclado', 'Hugo Vazquez', NULL, '1', 'TDC', '1.00', '560.00', '560.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('128', '2023-08-17', 'Total Play', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '499.00', '499.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('129', '2023-08-17', 'Letrero 911 - Emergencias', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '75.00', '75.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('130', '2023-08-19', 'Limpieza 19-Ago', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('131', '2023-08-21', 'Renta 4 de 12 Local', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('132', '2023-08-22', 'Meta Ads - Agosto', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '6000.00', '6000.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('133', '2023-08-22', 'Mantenimiento Agosto', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '700.00', '700.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('134', '2023-08-22', 'Mantenimiento Septiembre', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '640.00', '640.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('135', '2023-08-22', 'Depósito Google Ads - Agosto', 'Antonio Razo', NULL, '1', 'TDC', '1.00', '7200.00', '7200.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('136', '2023-08-23', 'Dos carpetas', 'Hugo Vazquez', NULL, '1', 'Efectivo', '1.00', '100.00', '100.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('137', '2023-08-24', 'Pago 2 Ago CM', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '4408.00', '4408.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('138', '2023-08-24', 'Copias de formatos de inscripción, reglamento y pautadas', 'Hugo Vazquez', NULL, '1', 'Efectivo', '1.00', '80.00', '80.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('139', '2023-08-26', 'Limpieza 26-Ago', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('140', '2023-08-28', 'Poster y diurex', 'Escuela', NULL, '1', 'Efectivo', '1.00', '75.00', '75.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('141', '2023-08-29', 'Mezcladora 4 CH', 'Hugo Vazquez', NULL, '1', 'TDC', '1.00', '242.00', '242.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('142', '2023-08-31', 'Pago Frank - Quincena', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('143', '2023-08-31', 'Pago clases de Guitarra', 'Hugo Vazquez', NULL, '1', 'Transferencia', '1.00', '810.00', '810.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('144', '2023-08-31', 'Comisiones TPV', 'Escuela', NULL, '1', 'TPV', '1.00', '488.36', '488.36', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('145', '2023-09-02', 'Limpieza 02-Sep', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('146', '2023-09-08', 'Engrapadora y grapas', 'Escuela', NULL, '1', 'Efectivo', '1.00', '150.00', '150.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('147', '2023-09-08', 'Cloralex y Roma', 'Escuela', NULL, '1', 'Efectivo', '1.00', '50.00', '50.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('148', '2023-09-09', 'Limpieza 09-Sep', 'Escuela', NULL, '1', 'Efectivo', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('149', '2023-09-09', 'Pago recibo CFE Local', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '579.00', '579.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('150', '2023-09-15', 'Pago Frank - Quincena', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('151', '2023-09-20', 'Renta 5 de 12 Local', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:49', '2026-01-22 20:22:49');
INSERT INTO `transacciones` VALUES ('152', '2023-09-21', 'Total Play', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '549.00', '549.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('153', '2023-09-24', 'Limpieza 24-Sep', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('154', '2023-09-26', 'Pago 1 y 2 Sep CM', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '8816.00', '8816.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('155', '2023-09-30', 'Pago Frank - Quincena', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('156', '2023-09-30', 'Limpieza 30-Sep', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('157', '2023-09-30', 'Pago clases de Teclado', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('158', '2023-09-30', 'Pago clases de muestra teclado', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '80.00', '80.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('159', '2023-09-30', 'Pago clases de Batería', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('160', '2023-09-30', 'Pago clases de muestra Batería', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '320.00', '320.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('161', '2023-09-30', 'Pago clases de Guitarra', 'Hugo Vazquez', NULL, '1', 'Transferencia', '1.00', '2300.00', '2300.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('162', '2023-09-30', 'Comisiones TPV', 'Escuela', NULL, '1', 'TPV', '1.00', '945.11', '945.11', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('163', '2023-10-01', 'Pilas AAA', 'Hugo Vazquez', NULL, '1', 'Efectivo', '1.00', '40.00', '40.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('164', '2023-10-01', 'Teléfono fijo', 'Hugo Vazquez', NULL, '1', 'Efectivo', '1.00', '1350.00', '1350.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('165', '2023-10-04', 'Mantenimiento Octubre', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '640.00', '640.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('166', '2023-10-06', 'Jabon de manos Equate', 'Hugo Vazquez', NULL, '1', 'Efectivo', '1.00', '25.00', '25.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('167', '2023-10-07', 'Limpieza 7-Oct', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('168', '2023-10-14', 'Limpieza 14-Oct', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('169', '2023-10-15', 'Pago Frank - Quincena', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('170', '2023-10-16', 'Total Play', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '499.00', '499.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('171', '2023-10-20', 'Papel de baño 4 rollos', 'Hugo Vazquez', NULL, '1', 'Efectivo', '1.00', '25.00', '25.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('172', '2023-10-20', 'Renta Octubre', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('173', '2023-10-21', 'Limpieza 21-Oct', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('174', '2023-10-28', 'Limpieza 28-Oct', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('175', '2023-10-31', 'Pago Frank - Quincena', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('176', '2023-10-31', 'Pegamento', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '150.00', '150.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('177', '2023-10-31', 'Adornos Halloween', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '250.00', '250.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('178', '2023-10-31', 'Pago CFE', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '841.00', '841.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('179', '2023-10-31', 'Comisiones TPV', 'Escuela', NULL, '1', 'TPV', '1.00', '852.75', '852.75', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('180', '2023-10-31', 'Pago 1 de 2 mes de Octubre - Jorge MKT', 'Escuela', NULL, '1', 'Mercado Pago', '1.00', '4408.00', '4408.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('181', '2023-10-31', 'Clases de Bajo Luis Blanquet', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('182', '2023-10-31', 'Clases de prueba canto Lizett Espinoza', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '160.00', '160.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('183', '2023-10-31', 'Clases de prueba Bajo Luis Blanquet', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '80.00', '80.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('184', '2023-10-31', 'Clases de piano Agueda Pecina', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('185', '2023-10-31', 'Clases de Batería Julio Olvera', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('186', '2023-10-31', 'Clases de Guitarra Hugo Vazquez', 'Hugo Vazquez', NULL, '1', 'Transferencia', '1.00', '1600.00', '1600.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('187', '2023-10-31', 'Clases de Guitarra Individual Hugo Vazquez', 'Hugo Vazquez', NULL, '1', 'Transferencia', '1.00', '560.00', '560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('188', '2023-11-04', 'Limpieza 04-Nov', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('189', '2023-11-10', 'Mantenimiento Noviembre y Diciembre', 'Antonio Razo', NULL, '1', 'Efectivo', '1.00', '1310.00', '1310.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('190', '2023-11-12', 'Limpieza 11-Nov', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('191', '2023-11-14', 'Total Play', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '499.00', '499.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('192', '2023-11-16', 'Pago Frank - Quincena', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('193', '2023-11-17', 'Pago 1 mes de Noviembre Jorge', 'Escuela', NULL, '1', 'Mercado Pago', '1.00', '4408.00', '4408.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('194', '2023-11-18', 'Limpieza 18-Nov', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('195', '2023-11-20', 'Renta Noviembre', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('196', '2023-11-25', 'Limpieza 25-Nov', 'Escuela', NULL, '1', 'Mercado Pago', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('197', '2023-11-25', 'Pago 2 mes de Noviembre Jorge', 'Escuela', NULL, '1', 'Mercado Pago', '1.00', '4408.00', '4408.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('198', '2023-11-27', 'Google Ads', 'Escuela', NULL, '1', 'Mercado Pago', '1.00', '5000.00', '5000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('199', '2023-11-29', 'Facebook', 'Escuela', NULL, '1', 'Transferencia', '1.00', '5000.00', '5000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('200', '2023-11-30', 'Pago Frank - Quincena', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('201', '2023-11-30', 'Comisiones TPV', 'Escuela', NULL, '1', 'TPV', '1.00', '800.98', '800.98', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('202', '2023-11-30', 'Clases de Guitarra Hugo Vazquez', 'Marco Delgado', NULL, '1', 'Efectivo', '1.00', '2160.00', '2160.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('203', '2023-11-30', 'Clases de piano Agueda Pecina', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('204', '2023-11-30', 'Clases de Batería Julio Olvera', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('205', '2023-11-30', 'Clases de Bajo Luis Blanquet', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('206', '2023-11-30', 'Clases de prueba canto Lizett Espinoza', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '80.00', '80.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('207', '2023-12-02', 'Limpieza 02-Dic', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('208', '2023-12-09', 'Limpieza 09-Dic', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('209', '2023-12-11', 'Servicio AI para Anuncios', 'Escuela', NULL, '1', 'Mercado Pago', '1.00', '349.12', '349.12', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('210', '2023-12-16', 'Total Play', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '499.00', '499.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('211', '2023-12-16', 'Pago Frank - Quincena', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('212', '2023-12-16', 'Pago Frank - Aguinaldo', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('213', '2023-12-18', 'Limpieza 16-Dic', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('214', '2023-12-20', 'Google Ads', 'Escuela', NULL, '1', 'Mercado Pago', '1.00', '5000.00', '5000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('215', '2023-12-21', 'Renta Dic (1)', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '3000.00', '3000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('216', '2023-12-21', 'Renta Dic (2)', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '2560.00', '2560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('217', '2023-12-21', 'Renta Dic (3)', 'Escuela', NULL, '1', 'Transferencia', '1.00', '6000.00', '6000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('218', '2023-12-31', 'Comisiones TPV', 'Escuela', NULL, '1', 'TPV', '1.00', '813.16', '813.16', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('219', '2023-12-31', 'Pago Frank - Quincena', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('220', '2023-12-31', 'Clases de Batería Julio Olvera', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('221', '2023-12-31', 'Clases de Bajo Luis Blanquet', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('222', '2023-12-31', 'Clases de piano Agueda Pecina', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('223', '2023-12-31', 'Clases de Guitarra Hugo Vazquez', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2160.00', '2160.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('224', '2024-01-05', 'Mantenimiento Enero', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '684.00', '684.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('225', '2024-01-05', 'Pago Diciembre Jorge', 'Escuela', NULL, '1', 'Transferencia', '1.00', '4486.00', '4486.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('226', '2024-01-06', 'Limpieza 06-Ene', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('227', '2024-01-07', 'Pago CFE', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '704.00', '704.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('228', '2024-01-12', 'Servicio AI para Anuncios', 'Escuela', NULL, '1', 'Transferencia', '1.00', '341.52', '341.52', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('229', '2024-01-14', 'Limpieza 14-Ene', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('230', '2024-01-15', 'Pago Frank - Quincena', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('231', '2024-01-15', 'Google Ads', 'Escuela', NULL, '1', 'Transferencia', '1.00', '5000.00', '5000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('232', '2024-01-16', 'Total Play', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '499.00', '499.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('233', '2024-01-20', 'Limpieza 20-Ene', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('234', '2024-01-22', 'Renta Ene (1)', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '6000.00', '6000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('235', '2024-01-22', 'Renta Ene (2)', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '3000.00', '3000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('236', '2024-01-22', 'Renta Ene (3)', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '2560.00', '2560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('237', '2024-01-29', 'Limpieza 27-Ene', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('238', '2024-01-31', 'Comisiones TPV', 'Escuela', NULL, '1', 'TPV', '1.00', '813.16', '813.16', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('239', '2024-01-31', 'Clases de Guitarra Hugo Vazquez', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '1900.00', '1900.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('240', '2024-01-31', 'Clases de Teclado Manuel Reyes', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('241', '2024-01-31', 'Clases de Bajo Luis Blanquet', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('242', '2024-01-31', 'Clases de Batería Julio Olvera', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '1760.00', '1760.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('243', '2024-01-31', 'Pago Frank - Quincena', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('244', '2024-02-02', 'Mantenimiento Febrero', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '684.00', '684.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('245', '2024-02-02', 'Google Ads', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '5000.00', '5000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('246', '2024-02-03', 'Transferencia Marco a Antonio (Cargo)', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '6000.00', '6000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('247', '2024-02-03', 'Transferencia Marco a Antonio (Abono)', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '6000.00', '6000.00', 'I', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('248', '2024-02-03', 'Gel antibacterial', 'Escuela', NULL, '1', 'Efectivo', '1.00', '115.00', '115.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('249', '2024-02-03', 'Cables', 'Escuela', NULL, '1', 'Efectivo', '1.00', '750.00', '750.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('250', '2024-02-03', 'Papel de baño 4 rollos', 'Escuela', NULL, '1', 'Efectivo', '1.00', '50.00', '50.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('251', '2024-02-03', 'Limpieza 03-Feb', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('252', '2024-02-10', 'Limpieza 10-Feb', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('253', '2024-02-12', 'Servicio AI para Anuncios', 'Escuela', NULL, '1', 'Transferencia', '1.00', '343.42', '343.42', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('254', '2024-02-16', 'Pago Frank - Quincena', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('255', '2024-02-18', 'Total Play', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '549.00', '549.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('256', '2024-02-19', 'Limpieza 17-Feb', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('257', '2024-02-23', 'Renta Febrero', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('258', '2024-02-23', 'Google Ads', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '5000.00', '5000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('259', '2024-02-24', 'Limpieza 24-Feb', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('260', '2024-02-28', 'Transferencia Escuela a Antonio Razo - Cargo', 'Escuela', NULL, '1', 'Transferencia', '1.00', '10000.00', '10000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('261', '2024-02-28', 'Transferencia Escuela a Antonio Razo - Abono', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '10000.00', '10000.00', 'I', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('262', '2024-02-29', 'Comisiones TPV', 'Escuela', NULL, '1', 'TPV', '1.00', '752.26', '752.26', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('263', '2024-02-29', 'Pago Frank - Quincena', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('264', '2024-02-29', 'Clases de Batería Julio Olvera', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1200.00', '1200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('265', '2024-02-29', 'Clases de Guitarra Hugo Vazquez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1200.00', '1200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('266', '2024-02-29', 'Clases de Teclado Manuel Reyes', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('267', '2024-02-29', 'Clases de Bajo Luis Blanquet', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('268', '2024-03-02', 'Mantenimiento Marzo', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '684.00', '684.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('269', '2024-03-02', 'Limpieza 01-Mar', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('270', '2024-03-08', 'Cloro, jabón, papel de baño', 'Escuela', NULL, '1', 'Efectivo', '1.00', '150.00', '150.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('271', '2024-03-09', 'Limpieza 08-Mar', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('272', '2024-03-12', 'Pago CFE', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '643.00', '643.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('273', '2024-03-15', 'Pago Frank - Quincena', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('274', '2024-03-16', 'Total Play', 'Escuela', NULL, '1', 'Transferencia', '1.00', '499.00', '499.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('275', '2024-03-18', 'Limpieza 15-Mar', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('276', '2024-03-22', 'Limpieza 22-Mar', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('277', '2024-03-22', 'Renta Marzo', 'Escuela', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('278', '2024-03-25', 'Google Ads', 'Antonio Razo', NULL, '1', 'TDC', '1.00', '5000.00', '5000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('279', '2024-03-30', 'Limpieza 29-Mar', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('280', '2024-03-31', 'Comisiones TPV', 'Escuela', NULL, '1', 'TPV', '1.00', '949.17', '949.17', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('281', '2024-03-31', 'Pago Frank - Quincena', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('282', '2024-03-31', 'Clases de Batería Julio Olvera', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1820.00', '1820.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('283', '2024-03-31', 'Clases de Guitarra Hugo Vazquez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2200.00', '2200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('284', '2024-03-31', 'Clases de Teclado Manuel Reyes', 'Escuela', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('285', '2024-03-31', 'Clases de Bajo Luis Blanquet', 'Escuela', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('286', '2024-04-04', 'Mantenimiento Abril', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '684.00', '684.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('287', '2024-04-08', 'Limpieza 08-Abr', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('288', '2024-04-14', 'Limpieza 13-Abr', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('289', '2024-04-17', 'Quincena Frank', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('290', '2024-04-17', 'Videos Frank Rockstar Skull', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2050.00', '2050.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('291', '2024-04-17', 'Renta parte 1 de 3', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '3000.00', '3000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('292', '2024-04-21', 'Renta parte 2 de 3', 'Escuela', NULL, '1', 'Transferencia', '1.00', '6000.00', '6000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('293', '2024-04-21', 'Renta parte 3 de 3', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '2560.00', '2560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('294', '2024-04-21', 'Total Play', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '549.00', '549.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('295', '2024-04-21', 'Limpieza 20-Abr', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('296', '2024-04-27', 'Limpieza 27-Abr', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('297', '2024-04-29', 'Meta Ads', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '5000.00', '5000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('298', '2024-04-30', 'Pago Frank - Quincena', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '3500.00', '3500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('299', '2024-04-30', 'Clases de Teclado Manuel Reyes', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '560.00', '560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('300', '2024-04-30', 'Clases de Guitarra Electrica', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '1660.00', '1660.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('301', '2024-04-30', 'Clases de Batería Julio Olvera', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '1660.00', '1660.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('302', '2024-04-30', 'Comisiones TPV', 'Escuela', NULL, '1', 'TPV', '1.00', '711.66', '711.66', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('303', '2024-05-04', 'Hosting Suempresa.com', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '986.00', '986.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('304', '2024-05-04', 'Mantenimiento Mayo', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '684.00', '684.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('305', '2024-05-05', 'Limpieza 5-May', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('306', '2024-05-08', 'Transferencia Escuela a Marco (cargo)', 'Escuela', NULL, '1', 'Transferencia', '1.00', '5000.00', '5000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('307', '2024-05-08', 'Transferencia Escuela a Marco (abono)', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '5000.00', '5000.00', 'I', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('308', '2024-05-08', 'Pago CFE', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '730.00', '730.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('309', '2024-05-09', 'Google Ads', 'Escuela', NULL, '1', 'Transferencia', '1.00', '5000.00', '5000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('310', '2024-05-10', 'Transferencia Escuela a Marco (cargo)', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3659.00', '3659.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('311', '2024-05-10', 'Transferencia Escuela a Marco (abono)', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '3659.00', '3659.00', 'I', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('312', '2024-05-13', 'Limpieza 12-May', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('313', '2024-05-18', 'Pago Frank - Quincena', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '3500.00', '3500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('314', '2024-05-19', 'Limpieza 18-May', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('315', '2024-05-20', 'Total Play', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '549.00', '549.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('316', '2024-05-20', 'Renta parte 1 de 3', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '3000.00', '3000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('317', '2024-05-22', 'Renta parte 2 de 3', 'Escuela', NULL, '1', 'Transferencia', '1.00', '6000.00', '6000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('318', '2024-05-22', 'Renta parte 3 de 3', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '2560.00', '2560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('319', '2024-05-27', 'Limpieza 25-May', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('320', '2024-05-31', 'Comisiones TPV', 'Escuela', NULL, '1', 'TPV', '1.00', '1022.25', '1022.25', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('321', '2024-05-31', 'Pago Frank - Quincena', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '3500.00', '3500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('322', '2024-05-31', 'Clases de Teclado Manuel Reyes', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1600.00', '1600.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('323', '2024-05-31', 'Clases de Guitarra Electrica', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2060.00', '2060.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('324', '2024-05-31', 'Clases de Batería Julio Olvera', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '1900.00', '1900.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('325', '2024-06-01', 'Limpieza 1-Jun', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('326', '2024-06-03', 'Transferencia Escuela a Marco (cargo)', 'Escuela', NULL, '1', 'Transferencia', '1.00', '5000.00', '5000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('327', '2024-06-03', 'Transferencia Escuela a Marco (abono)', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '5000.00', '5000.00', 'I', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('328', '2024-06-09', 'Limpieza - 9 Jun', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('329', '2024-06-11', 'Playeras y Tazas Rockstar Skull', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '4488.00', '4488.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('330', '2024-06-15', 'Quincena Frank', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '3500.00', '3500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('331', '2024-06-16', 'Limpieza 16 Jun', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('332', '2024-06-16', 'Total Play', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '519.00', '519.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('333', '2024-06-18', 'Transferencia Escuela a Marco (cargo)', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3500.00', '3500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('334', '2024-06-18', 'Transferencia Escuela a Marco (abono)', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '3500.00', '3500.00', 'I', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('335', '2024-06-22', 'Renta Junio 1 de 3', 'Escuela', NULL, '1', 'Transferencia', '1.00', '6000.00', '6000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('336', '2024-06-22', 'Renta Junio 2 de 3', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '3000.00', '3000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('337', '2024-06-22', 'Renta Junio 3 de 3', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2560.00', '2560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('338', '2024-06-23', 'Limpieza 23 Jun', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('339', '2024-06-29', 'Meta Ads', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '5000.00', '5000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('340', '2024-06-30', 'Limpieza 30 Jun', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('341', '2024-06-30', 'Clases de Batería Julio Olvera', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '1980.00', '1980.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('342', '2024-06-30', 'Quincena Frank', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '3500.00', '3500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('343', '2024-06-30', 'Clases de Guitarra Electrica', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2940.00', '2940.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('344', '2024-06-30', 'Clase de muestra Bajo', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '80.00', '80.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('345', '2024-06-30', 'Clase de muestra Canto', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '80.00', '80.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('346', '2024-06-30', 'Clases de Teclado Manuel Reyes', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '720.00', '720.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('347', '2024-06-30', 'Pago CFE', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '753.00', '753.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('348', '2024-06-30', 'Comisiones TPV', 'Escuela', NULL, '1', 'Transferencia', '1.00', '930.90', '930.90', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('349', '2024-07-06', 'Limpieza 06-Jul', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('350', '2024-07-08', 'Mantenimiento Julio', 'Escuela', NULL, '1', 'Transferencia', '1.00', '750.00', '750.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('351', '2024-07-13', 'Limpieza 13-Jul', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('352', '2024-07-13', 'Quincena Frank', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3500.00', '3500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('353', '2024-07-15', 'Total Play', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '569.00', '569.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('354', '2024-07-16', 'Gastos Escuela (Aclarar Hugo)', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1500.00', '1500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('355', '2024-07-22', 'Limpieza 20-Jul', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('356', '2024-07-25', 'Renta Julio 1 de 3', 'Escuela', NULL, '1', 'Transferencia', '1.00', '6000.00', '6000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('357', '2024-07-25', 'Renta Julio 2 de 3', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '2560.00', '2560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('358', '2024-07-25', 'Renta Julio 3 de 3', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '3000.00', '3000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('359', '2024-07-27', 'Limpieza 27-Jul', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('360', '2024-07-30', 'Clases de Guitarra Hugo Vazquez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2880.00', '2880.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('361', '2024-07-30', 'Quincena Frank', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3500.00', '3500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('362', '2024-07-30', 'Clases de Batería Julio Olvera', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1900.00', '1900.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('363', '2024-07-30', 'Clases de Teclado Manuel Reyes', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1200.00', '1200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('364', '2024-07-30', 'Clase de muestra Bajo Luis Blanquet', 'Escuela', NULL, '1', 'Transferencia', '1.00', '80.00', '80.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('365', '2024-07-30', 'Clases de Guitarra Irwin Hernandez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1180.00', '1180.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('366', '2024-07-30', 'Comisiones TPV', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1186.68', '1186.68', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('367', '2024-07-30', 'Clases de Teclado Manuel Reyes (complemento)', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('368', '2024-08-04', 'Limpieza 4-Ago', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('369', '2024-08-06', 'Mantenimiento Agosto', 'Escuela', NULL, '1', 'Transferencia', '1.00', '750.00', '750.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('370', '2024-08-12', 'Limpieza 12 Ago', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('371', '2024-08-16', 'Quincena Frank', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3500.00', '3500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('372', '2024-08-16', 'Total Play', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '519.00', '519.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('373', '2024-08-18', 'Limpieza 18 Ago', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('374', '2024-08-19', 'Banner y lona Rockstar (Hugo)', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1200.00', '1200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('375', '2024-08-21', 'Renta Agosto', 'Escuela', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('376', '2024-08-24', 'Limpieza 24 Ago', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('377', '2024-08-30', 'Pago CFE', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '762.00', '762.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('378', '2024-08-31', 'Quincena Frank', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3500.00', '3500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('379', '2024-08-31', 'Limpieza 31 Ago', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('380', '2024-08-31', 'Clases de Batería Julio Olvera', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '900.00', '900.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('381', '2024-08-31', 'Clases de Batería Julio Olvera', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1000.00', '1000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('382', '2024-08-31', 'Clases de Guitarra Irwin Hernandez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1000.00', '1000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('383', '2024-08-31', 'Clases de Guitarra Hugo Vazquez', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '2800.00', '2800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('384', '2024-08-31', 'Clases de Teclado Manuel Reyes', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '1200.00', '1200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('385', '2024-08-31', 'Clases de Canto Annie Carrizales', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1600.00', '1600.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('386', '2024-08-31', 'Comisiones TPV', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1401.86', '1401.86', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('387', '2024-09-02', 'Mantenimiento', 'Escuela', NULL, '1', 'Transferencia', '1.00', '700.00', '700.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('388', '2024-09-06', 'Meta Ads', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '5000.00', '5000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('389', '2024-09-07', 'Limpieza 07-Sep', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('390', '2024-09-16', 'Limpieza 14-Sep', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('391', '2024-09-17', 'Total Play', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '519.00', '519.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('392', '2024-09-17', 'Quincena Frank', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3500.00', '3500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('393', '2024-09-21', 'Renta Local Septiembre', 'Escuela', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('394', '2024-09-23', 'Limpieza 21-Sep', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('395', '2024-09-30', 'Clases de Batería Julio Olvera', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1900.00', '1900.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('396', '2024-09-30', 'Clases de Guitarra Irwin Hernandez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2100.00', '2100.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('397', '2024-09-30', 'Clases de Guitarra Hugo Vazquez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2800.00', '2800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('398', '2024-09-30', 'Clases de Teclado Manuel Reyes', 'Escuela', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('399', '2024-09-30', 'Clases de Canto Nahomy Perez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('400', '2024-09-30', 'Clases de Bajo Luis Blanquet', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('401', '2024-09-30', 'Quincena Frank', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3500.00', '3500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('402', '2024-09-30', 'Comisiones TPV', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1298.33', '1298.33', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('403', '2024-09-30', 'Limpieza 28-Sep', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('404', '2024-10-04', 'Mantenimiento Octubre', 'Escuela', NULL, '1', 'Transferencia', '1.00', '700.00', '700.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('405', '2024-10-06', 'Limpieza 05-Oct', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('406', '2024-10-11', 'Articulos de limpieza', 'Escuela', NULL, '1', 'Efectivo', '1.00', '403.00', '403.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('407', '2024-10-15', 'Limpieza 12-Oct', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('408', '2024-10-15', 'Total Play', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '519.00', '519.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('409', '2024-10-16', 'Quincena Frank', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3500.00', '3500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('410', '2024-10-21', 'Limpieza 19-Oct', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('411', '2024-10-26', 'Renta Local Octubre', 'Escuela', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('412', '2024-10-29', 'Limpieza 26-Oct', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('413', '2024-10-31', 'Clases de Batería Julio Olvera', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2860.00', '2860.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('414', '2024-10-31', 'Clases de Batería Demian Andrade', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('415', '2024-10-31', 'Clases de Guitarra Irwin Hernandez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2100.00', '2100.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('416', '2024-10-31', 'Clases de Guitarra Hugo Vazquez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3680.00', '3680.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('417', '2024-10-31', 'Clases de Teclado Manuel Reyes', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1600.00', '1600.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('418', '2024-10-31', 'Clases de Canto Nahomy Perez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1200.00', '1200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('419', '2024-10-31', 'Clases de Bajo Luis Blanquet', 'Escuela', NULL, '1', 'Transferencia', '1.00', '480.00', '480.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('420', '2024-10-31', 'Quincena Frank', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3500.00', '3500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('421', '2024-10-31', 'Comisiones TPV', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1773.35', '1773.35', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('422', '2024-11-02', 'Behrninger B210D Bafle Activo', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '15180.00', '15180.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('423', '2024-11-04', 'Limpieza 4 Nov', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('424', '2024-11-04', 'Mantenimiento Nov', 'Escuela', NULL, '1', 'Transferencia', '1.00', '690.00', '690.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('425', '2024-11-08', 'Alto professional TX2125 SW Activo 12\" 900W con DSP', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '14798.00', '14798.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('426', '2024-11-09', 'Meta Ads', 'Escuela', NULL, '1', 'Transferencia', '1.00', '5250.00', '5250.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('427', '2024-11-12', 'Limpieza 12 Nov', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('428', '2024-11-12', 'Limpieza 09-Nov', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('429', '2024-11-14', 'Zoom Anualidad', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2453.30', '2453.30', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('430', '2024-11-15', 'Quincena Frank', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3300.94', '3300.94', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('431', '2024-11-16', 'Limpieza 16 Nov', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('432', '2024-11-16', 'Total Play', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '519.00', '519.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('433', '2024-11-21', 'Renta Local Noviembre', 'Escuela', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('434', '2024-11-30', 'Pago Nov - Irving', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2900.00', '2900.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('435', '2024-11-30', 'Pago Nov - Manuel Reyes', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('436', '2024-11-30', 'Pago Nov - Demian Andrade', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('437', '2024-11-30', 'Pago Nov - Luis Blanquet', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('438', '2024-11-30', 'Pago Nov - Arcelia Armijo', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '2700.00', '2700.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('439', '2024-11-30', 'Pago Nov - Hugo', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3600.00', '3600.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('440', '2024-11-30', 'Limpieza 30 Nov', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('441', '2024-11-30', 'Clases de Canto Nahomy Perez', 'Escuela', NULL, '1', 'Symbiot', '1.00', '1200.00', '1200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('442', '2024-11-30', 'Quincena Frank', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '3500.00', '3500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('443', '2024-11-30', 'Pago CFE', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '803.00', '803.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('444', '2024-11-30', 'Comisiones TPV', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1719.76', '1719.76', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('445', '2024-12-03', 'Mantenimiento Dic', 'Escuela', NULL, '1', 'Transferencia', '1.00', '684.00', '684.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('446', '2024-12-03', 'Impresiones reconocimientos', 'Escuela', NULL, '1', 'Efectivo', '1.00', '145.00', '145.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('447', '2024-12-03', 'Plumon Permanente', 'Escuela', NULL, '1', 'Efectivo', '1.00', '25.00', '25.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('448', '2024-12-03', 'Guillotinado reconocimientos', 'Escuela', NULL, '1', 'Efectivo', '1.00', '20.00', '20.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('449', '2024-12-03', 'Papel de baño 1 rollo', 'Escuela', NULL, '1', 'Efectivo', '1.00', '15.00', '15.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('450', '2024-12-09', 'Limpieza 9 Dic', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('451', '2024-12-11', 'Poste de bafle metalico', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '1192.44', '1192.44', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('452', '2024-12-16', 'Frank Aguinaldo 2024', 'Escuela', NULL, '1', 'Transferencia', '1.00', '7000.00', '7000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('453', '2024-12-16', 'Limpieza 16 Dic + Aguinaldo 2024', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1200.00', '1200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('454', '2024-12-17', 'Cuerda Ernie Ball', 'Escuela', NULL, '1', 'Efectivo', '1.00', '35.00', '35.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('455', '2024-12-18', 'Reconocimiento', 'Escuela', NULL, '1', 'Efectivo', '1.00', '25.00', '25.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('456', '2024-12-18', 'Plumas y copia', 'Escuela', NULL, '1', 'Efectivo', '1.00', '17.00', '17.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('457', '2024-12-18', 'Papel de baño 1 rollo', 'Escuela', NULL, '1', 'Efectivo', '1.00', '15.00', '15.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('458', '2024-12-20', 'Renta Local Diciembre', 'Escuela', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('459', '2024-12-20', 'Mantenimiento Enero', 'Escuela', NULL, '1', 'Transferencia', '1.00', '740.00', '740.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('460', '2024-12-23', 'Limpieza 23 Dic', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('461', '2024-12-23', 'Total Play', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '569.00', '569.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('462', '2024-12-30', 'Hector R Solis Q', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1500.00', '1500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('463', '2024-12-31', 'Quincena Frank', 'Escuela', NULL, '1', 'Symbiot', '1.00', '3500.00', '3500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('464', '2024-12-31', 'Clases de Batería Demian Andrade', 'Escuela', NULL, '1', 'Symbiot', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('465', '2024-12-31', 'Clases de Canto Nahomy Perez', 'Escuela', NULL, '1', 'Symbiot', '1.00', '650.00', '650.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('466', '2024-12-31', 'Clases de Teclado Manuel Reyes', 'Escuela', NULL, '1', 'Symbiot', '1.00', '1050.00', '1050.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('467', '2024-12-31', 'Sueldos', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2231.00', '2231.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('468', '2024-12-31', 'Clases de Bajo Luis Blanquet', 'Escuela', NULL, '1', 'Symbiot', '1.00', '1050.00', '1050.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('469', '2024-12-31', 'Clases de Batería Julio Olvera', 'Escuela', NULL, '1', 'Symbiot', '1.00', '3350.00', '3350.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('470', '2024-12-31', 'Clases de Guitarra Irwin Hernandez', 'Escuela', NULL, '1', 'Symbiot', '1.00', '3150.00', '3150.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('471', '2024-12-31', 'Clases de Guitarra Hugo Vazquez', 'Escuela', NULL, '1', 'Symbiot', '1.00', '2650.00', '2650.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('472', '2024-12-31', 'Comisiones TPV', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1608.92', '1608.92', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('473', '2025-01-06', 'Limpieza 6 Enero', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('474', '2025-01-08', 'Meta Ads', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '5000.00', '5000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('475', '2025-01-13', 'Pedalera', 'Hugo Vazquez', NULL, '1', 'Efectivo', '1.00', '1500.00', '1500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('476', '2025-01-14', 'Formularios de inscripción y encuestas', 'Escuela', NULL, '1', 'Efectivo', '1.00', '50.00', '50.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('477', '2025-01-14', 'Limpieza 14-Ene', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('478', '2025-01-16', 'Quincena Frank', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2150.00', '2150.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('479', '2025-01-16', 'Quincena Frank', 'Escuela', NULL, '1', 'Efectivo', '1.00', '1350.00', '1350.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('480', '2025-01-20', 'Papel de baño 4 rollos', 'Escuela', NULL, '1', 'Efectivo', '1.00', '39.00', '39.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('481', '2025-01-20', 'Pago CFE', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '812.00', '812.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('482', '2025-01-21', 'Renta', 'Escuela', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('483', '2025-01-21', 'Limpieza 21-Ene', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('484', '2025-01-22', 'Total Play', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '569.00', '569.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('485', '2025-01-25', 'Limpieza', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('486', '2025-01-31', 'Clases de Canto Nahomy Perez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '480.00', '480.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('487', '2025-01-31', 'Clases de Batería Julio Olvera', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3980.00', '3980.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('488', '2025-01-31', 'Quincena Frank', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3500.00', '3500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('489', '2025-01-31', 'Clases de Teclado Manuel Reyes', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1280.00', '1280.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('490', '2025-01-31', 'Clases de Bajo Luis Blanquet', 'Escuela', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('491', '2025-01-31', 'Clases de Batería Demian Andrade', 'Escuela', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('492', '2025-01-31', 'Clases de Guitarra Irwin Hernandez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2900.00', '2900.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('493', '2025-01-31', 'Clases de Guitarra Hugo Vazquez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1600.00', '1600.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('494', '2025-01-31', 'Comisiones TPV', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1718.54', '1718.54', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('495', '2025-02-02', 'Cuerdas Ernieball', 'Escuela', NULL, '1', 'Efectivo', '1.00', '70.00', '70.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('496', '2025-02-04', 'Limpieza 01-Feb', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('497', '2025-02-04', 'Brocha', 'Escuela', NULL, '1', 'Efectivo', '1.00', '45.00', '45.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('498', '2025-02-05', '3 Multicontactos', 'Escuela', NULL, '1', 'Efectivo', '1.00', '210.00', '210.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('499', '2025-02-05', 'Articulos de limpieza', 'Escuela', NULL, '1', 'Efectivo', '1.00', '87.00', '87.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('500', '2025-02-11', 'Limpieza 08-Feb', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('501', '2025-02-14', 'Mantenimiento Febrero', 'Escuela', NULL, '1', 'Efectivo', '1.00', '792.00', '792.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('502', '2025-02-16', 'Total Play', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '518.99', '518.99', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('503', '2025-02-17', 'Cuerda 2, Ernieball', 'Escuela', NULL, '1', 'Efectivo', '1.00', '35.00', '35.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('504', '2025-02-17', 'Papel de baño', 'Escuela', NULL, '1', 'Efectivo', '1.00', '45.00', '45.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('505', '2025-02-17', 'Limpieza 15-Feb', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('506', '2025-02-17', 'Quincena Frank', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3500.00', '3500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('507', '2025-02-24', 'Limpieza 22-Feb', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('508', '2025-02-27', 'Renta', 'Escuela', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('509', '2025-02-28', 'Comisiones TPV', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1822.07', '1822.07', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('510', '2025-02-28', 'Quincena Frank', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3500.00', '3500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('511', '2025-02-28', 'Clases de Batería Demian Andrade', 'Escuela', NULL, '1', 'Transferencia', '1.00', '880.00', '880.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('512', '2025-02-28', 'Clases de Guitarra Hugo Vazquez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1600.00', '1600.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('513', '2025-02-28', 'Clases de Guitarra Irwin Hernandez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2900.00', '2900.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('514', '2025-02-28', 'Clases de Bajo Luis Blanquet', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('515', '2025-02-28', 'Clases de Teclado Manuel Reyes', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1200.00', '1200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('516', '2025-02-28', 'Clases de Batería Julio Olvera', 'Escuela', NULL, '1', 'Transferencia', '1.00', '4300.00', '4300.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('517', '2025-02-28', 'Clases de Canto Nahomy Perez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1200.00', '1200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('518', '2025-03-01', 'Limpieza 01-Mar', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('519', '2025-03-01', 'Pago CFE', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '713.00', '713.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('520', '2025-03-10', 'Limpieza 08-Mar', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('521', '2025-03-15', 'Limpieza 15-Mar', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('522', '2025-03-15', 'Quincena Santiago', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2250.00', '2250.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('523', '2025-03-16', 'Total Play', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '519.00', '519.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('524', '2025-03-21', 'Renta', 'Escuela', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('525', '2025-03-23', 'Limpieza 22-Mar', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('526', '2025-03-23', 'Adelanto involuntario Santiago', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('527', '2025-03-23', 'Smartphone Motorola Moto G04s', 'Marco Delgado', NULL, '1', 'TDC', '1.00', '1750.00', '1750.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('528', '2025-03-31', 'Comisiones TPV', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2110.33', '2110.33', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('529', '2025-03-31', 'Clases de Guitarra Hugo Vazquez', 'Escuela', NULL, '1', 'Efectivo', '1.00', '1600.00', '1600.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('530', '2025-03-31', 'Clases de Guitarra Irwin Hernandez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '4100.00', '4100.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('531', '2025-03-31', 'Clases de Batería Demian Andrade', 'Escuela', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('532', '2025-03-31', 'Clases de Teclado Manuel Reyes', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1280.00', '1280.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('533', '2025-03-31', 'Clases de Bajo Luis Blanquet', 'Escuela', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('534', '2025-03-31', 'Clases de Batería Julio Olvera', 'Escuela', NULL, '1', 'Transferencia', '1.00', '4380.00', '4380.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('535', '2025-03-31', 'Clases de Canto Nahomy Perez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1200.00', '1200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('536', '2025-03-31', 'Quincena Santiago', 'Escuela', NULL, '1', 'Efectivo', '1.00', '1850.00', '1850.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('537', '2025-04-01', 'Limpieza 29-Mar', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('538', '2025-04-08', 'Limpieza 05-Abr', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('539', '2025-04-13', 'Finiquito Frank', 'Escuela', NULL, '1', 'Transferencia', '1.00', '600.00', '600.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('540', '2025-04-13', 'Limpieza 12-Abr', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('541', '2025-04-16', 'Quincena Santiago', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2250.00', '2250.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('542', '2025-04-16', 'Total Play', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '519.00', '519.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('543', '2025-04-22', 'Renta', 'Escuela', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('544', '2025-04-22', 'Limpieza 19-Abr', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('545', '2025-04-29', 'Limpieza 26-Abr', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('546', '2025-04-30', 'Comisiones TPV', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2041.31', '2041.31', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('547', '2025-04-30', 'Clases de Guitarra Hugo Vazquez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1200.00', '1200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('548', '2025-04-30', 'Clases de Guitarra Irwin Hernandez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3700.00', '3700.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('549', '2025-04-30', 'Clases de Batería Demian Andrade', 'Escuela', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('550', '2025-04-30', 'Clases de Teclado Manuel Reyes', 'Escuela', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('551', '2025-04-30', 'Clases de Bajo Luis Blanquet', 'Escuela', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('552', '2025-04-30', 'Clases de Batería Julio Olvera', 'Escuela', NULL, '1', 'Transferencia', '1.00', '4860.00', '4860.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('553', '2025-04-30', 'Clases de Canto Nahomy Perez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('554', '2025-04-30', 'Quincena Santiago', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2310.00', '2310.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('555', '2025-05-03', 'Limpieza 03-May', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('556', '2025-05-05', 'Pago CFE', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '646.00', '646.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('557', '2025-05-08', 'Prestamo Hugo', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3000.00', '3000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('558', '2025-05-09', 'Meta Ads', 'Escuela', NULL, '1', 'Transferencia', '1.00', '4500.00', '4500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('559', '2025-05-12', 'Limpieza 10-May', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('560', '2025-05-16', 'Quincena Santiago', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2250.00', '2250.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('561', '2025-05-19', 'Limpieza 17-May', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('562', '2025-05-22', 'Total Play', 'Escuela', NULL, '1', 'Transferencia', '1.00', '620.00', '620.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('563', '2025-05-27', 'Renta Local', 'Escuela', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('564', '2025-05-27', 'Limpieza 24-May', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('565', '2025-05-31', 'Clases de Batería Demian Andrade', 'Escuela', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('566', '2025-05-31', 'Clases de Bajo Luis Blanquet', 'Escuela', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('567', '2025-05-31', 'Clases de Teclado Manuel Reyes', 'Escuela', NULL, '1', 'Transferencia', '1.00', '880.00', '880.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('568', '2025-05-31', 'Clases de Guitarra Irwin Hernandez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '5300.00', '5300.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('569', '2025-05-31', 'Clases de Canto Nahomy Perez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('570', '2025-05-31', 'Clases de Batería Julio Olvera', 'Escuela', NULL, '1', 'Transferencia', '1.00', '5100.00', '5100.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('571', '2025-05-31', 'Clases de Guitarra Hugo Vazquez', 'Escuela', NULL, '1', 'Efectivo', '1.00', '1200.00', '1200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('572', '2025-05-31', 'Comisiones TPV', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2313.32', '2313.32', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('573', '2025-05-31', 'Quincena Santiago', 'Escuela', NULL, '1', 'Efectivo', '1.00', '2250.00', '2250.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('574', '2025-05-31', 'Marketing Emiliano Rosas', 'Antonio Razo', NULL, '1', 'Transferencia', '1.00', '2500.00', '2500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('575', '2025-06-10', 'Limpieza 07-Jun', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('576', '2025-06-16', 'Quincena Santiago', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2250.00', '2250.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('577', '2025-06-16', 'Limpieza 14-Jun', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('578', '2025-06-21', 'Total Play', 'Escuela', NULL, '1', 'Transferencia', '1.00', '620.00', '620.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('579', '2025-06-23', 'Renta Local', 'Escuela', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('580', '2025-06-24', 'Limpieza 21-Jun', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('581', '2025-06-24', 'Cables XLR', 'Escuela', NULL, '1', 'Efectivo', '1.00', '3200.00', '3200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('582', '2025-06-24', 'Plumones', 'Escuela', NULL, '1', 'Efectivo', '1.00', '200.00', '200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('583', '2025-06-30', 'Mantenimiento de Junio y Julio', 'Escuela', NULL, '1', 'Efectivo', '1.00', '1524.00', '1524.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('584', '2025-06-30', 'Papel Higienico', 'Escuela', NULL, '1', 'Efectivo', '1.00', '78.00', '78.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('585', '2025-06-30', '25 Juegos de Inscripción', 'Escuela', NULL, '1', 'Efectivo', '1.00', '31.00', '31.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('586', '2025-06-30', 'Corrector de cinta', 'Escuela', NULL, '1', 'Efectivo', '1.00', '31.00', '31.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('587', '2025-06-30', 'Comisiones TPV', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2875.64', '2875.64', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('588', '2025-06-30', 'Quincena Santiago', 'Escuela', NULL, '1', 'Efectivo', '1.00', '2250.00', '2250.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('589', '2025-06-30', 'Clases de Guitarra Hugo Vazquez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('590', '2025-06-30', 'Clases de Teclado Manuel Reyes', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2400.00', '2400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('591', '2025-06-30', 'Clases de Guitarra Irwin Hernandez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '6980.00', '6980.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('592', '2025-06-30', 'Clases de Bajo Luis Blanquet', 'Escuela', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('593', '2025-06-30', 'Clases de Batería Demian Andrade', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2080.00', '2080.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('594', '2025-06-30', 'Marketing Emiliano Rosas', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2500.00', '2500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('595', '2025-06-30', 'Clases de Batería Julio Olvera', 'Escuela', NULL, '1', 'Transferencia', '1.00', '4860.00', '4860.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('596', '2025-06-30', 'Clases de Canto Nahomy Perez', 'Escuela', NULL, '1', 'Efectivo', '1.00', '2640.00', '2640.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('597', '2025-07-01', 'Limpieza 28-Jun', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('598', '2025-07-08', 'Limpieza 05-Jul', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('599', '2025-07-12', 'Meta Ads', 'Escuela', NULL, '1', 'Transferencia', '1.00', '5000.00', '5000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('600', '2025-07-15', 'Quincena Santiago', 'Escuela', NULL, '1', 'Efectivo', '1.00', '2250.00', '2250.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('601', '2025-07-16', 'Limpieza 12-Jul', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('602', '2025-07-16', 'Total Play', 'Escuela', NULL, '1', 'Transferencia', '1.00', '569.99', '569.99', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('603', '2025-07-16', 'Pago CFE', 'Escuela', NULL, '1', 'Transferencia', '1.00', '659.00', '659.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('604', '2025-07-22', 'Limpieza 19-Jul', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('605', '2025-07-22', 'Carpeta y hojas', 'Escuela', NULL, '1', 'Efectivo', '1.00', '21.00', '21.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('606', '2025-07-23', 'Pago Renta Mes Julio', 'Escuela', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('607', '2025-07-23', 'Pago Renta Mes Agosto', 'Escuela', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('608', '2025-07-24', 'Teclado Alesis 88 teclas 480 sonidos MIDI', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3999.00', '3999.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('609', '2025-07-28', 'Mantenimiento Guitarras', 'Escuela', NULL, '1', 'Efectivo', '1.00', '2200.00', '2200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('610', '2025-07-29', 'Limpieza 26-Jul', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('611', '2025-07-31', 'Articulos de limpieza', 'Escuela', NULL, '1', 'Efectivo', '1.00', '143.00', '143.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('612', '2025-07-31', 'Papel Higienico', 'Escuela', NULL, '1', 'Efectivo', '1.00', '85.00', '85.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('613', '2025-07-31', 'Quincena Santiago', 'Escuela', NULL, '1', 'Efectivo', '1.00', '2250.00', '2250.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('614', '2025-07-31', 'Comisiones TPV', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3155.78', '3155.78', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('615', '2025-07-31', 'MKT Emiliano Rosas', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2500.00', '2500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('616', '2025-07-31', 'Clase de muestra Teclado', 'Escuela', NULL, '1', 'Transferencia', '1.00', '320.00', '320.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('617', '2025-07-31', 'Clase de muestra Guitarra (Irwin)', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('618', '2025-07-31', 'Clase de muestra Canto', 'Escuela', NULL, '1', 'Transferencia', '1.00', '80.00', '80.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('619', '2025-07-31', 'Clase de muestra Bajo', 'Escuela', NULL, '1', 'Transferencia', '1.00', '80.00', '80.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('620', '2025-07-31', 'Clases de muestra Bateria (Demian)', 'Escuela', NULL, '1', 'Transferencia', '1.00', '160.00', '160.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('621', '2025-07-31', 'Clases de muestra Guitarra (Hugo)', 'Escuela', NULL, '1', 'Transferencia', '1.00', '160.00', '160.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('622', '2025-07-31', 'Clases de Teclado Manuel Reyes', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1600.00', '1600.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('623', '2025-07-31', 'Clases de Guitarra Hugo Vazquez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1600.00', '1600.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('624', '2025-07-31', 'Clases de Guitarra Irwin Hernandez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '7700.00', '7700.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('625', '2025-07-31', 'Clases de Bajo Luis Blanquet', 'Escuela', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('626', '2025-07-31', 'Clases de Canto Nahomy Perez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2400.00', '2400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('627', '2025-07-31', 'Clases de Batería Julio Olvera', 'Escuela', NULL, '1', 'Transferencia', '1.00', '5100.00', '5100.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('628', '2025-07-31', 'Clases de Batería Demian Andrade', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('629', '2025-08-07', 'Limpieza 02-Ago', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('630', '2025-08-09', 'Limpieza 09-Ago', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('631', '2025-08-09', 'Luthier y cuerdas guitarra Washburn', 'Escuela', NULL, '1', 'Transferencia', '1.00', '700.00', '700.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('632', '2025-08-14', 'Mantenimiento y agua', 'Escuela', NULL, '1', 'Efectivo', '1.00', '792.00', '792.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('633', '2025-08-14', 'Honorarios Contadora Rocio', 'Escuela', NULL, '1', 'Transferencia', '1.00', '15000.00', '15000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('634', '2025-08-14', 'Resistol 5000 tubo', 'Escuela', NULL, '1', 'Efectivo', '1.00', '60.00', '60.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('635', '2025-08-14', 'Total Play', 'Escuela', NULL, '1', 'Efectivo', '1.00', '570.00', '570.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('636', '2025-08-15', 'Quincena Santiago', 'Escuela', NULL, '1', 'Efectivo', '1.00', '2250.00', '2250.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('637', '2025-08-18', 'Mantenimiento mezcladora Yamaha', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2150.00', '2150.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('638', '2025-08-19', 'Camara de seguridad WiFi Foco HD Nocturna', 'Escuela', NULL, '1', 'Transferencia', '1.00', '447.44', '447.44', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('639', '2025-08-19', 'Limpieza 16-Ago', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('640', '2025-08-27', 'Limpieza 23-Ago', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('641', '2025-08-27', 'Meta Ads', 'Escuela', NULL, '1', 'Transferencia', '1.00', '5000.00', '5000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('642', '2025-08-30', 'Limpieza 30-Ago', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('643', '2025-08-30', 'Quincena Santiago', 'Escuela', NULL, '1', 'Efectivo', '1.00', '2250.00', '2250.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('644', '2025-08-31', 'Comisiones TPV', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2619.86', '2619.86', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('645', '2025-08-31', 'MKT Emiliano Rosas', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2500.00', '2500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('646', '2025-08-31', 'Clases de Guitarra Hugo Vazquez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1600.00', '1600.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('647', '2025-08-31', 'Clases de Guitarra Irwin Hernandez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '5700.00', '5700.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('648', '2025-08-31', 'Clases de Bajo Luis Blanquet', 'Escuela', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('649', '2025-08-31', 'Clases de Teclado Manuel Reyes', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1200.00', '1200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('650', '2025-08-31', 'Clases de Canto Nahomy Perez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('651', '2025-08-31', 'Clases de Batería Demian Andrade', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1200.00', '1200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('652', '2025-08-31', 'Clases de Batería Julio Olvera', 'Escuela', NULL, '1', 'Transferencia', '1.00', '5580.00', '5580.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('653', '2025-09-03', 'Prestamo Hugo', 'Escuela', NULL, '1', 'Transferencia', '1.00', '7000.00', '7000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('654', '2025-09-05', 'Mantenimiento y agua', 'Escuela', NULL, '1', 'Efectivo', '1.00', '732.00', '732.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('655', '2025-09-05', '15 fotocopias reglamento de la escuela', 'Escuela', NULL, '1', 'Efectivo', '1.00', '20.00', '20.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('656', '2025-09-05', '2 paquetes de rollos de papel higienico', 'Escuela', NULL, '1', 'Efectivo', '1.00', '56.00', '56.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('657', '2025-09-05', 'Clases de Teclado Harim Lopez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('658', '2025-09-09', 'Limpieza 06-Sept', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('659', '2025-09-11', 'Pago CFE', 'Escuela', NULL, '1', 'Transferencia', '1.00', '672.00', '672.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('660', '2025-09-15', 'Quincena Santiago', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2250.00', '2250.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('661', '2025-09-15', 'Finiquito Santiago', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1950.00', '1950.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('662', '2025-09-15', 'Limpieza 13-Sept', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('663', '2025-09-18', 'Total Play', 'Escuela', NULL, '1', 'Transferencia', '1.00', '620.01', '620.01', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('664', '2025-09-23', 'Pago Renta Mes Septiembre', 'Escuela', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('665', '2025-09-24', 'Transporte para visitar alcaldía', 'Escuela', NULL, '1', 'Efectivo', '1.00', '50.00', '50.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('666', '2025-09-24', 'Limpieza 20-Sept', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('667', '2025-09-30', 'Comisiones TPV', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3128.38', '3128.38', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('668', '2025-09-30', 'Quincena Ximena', 'Escuela', NULL, '1', 'Efectivo', '1.00', '2750.00', '2750.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('669', '2025-09-30', 'Limpieza 27-Sept', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('670', '2025-09-30', 'Clases de Batería Demian Andrade', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('671', '2025-09-30', 'Clases de Batería Julio Olvera', 'Escuela', NULL, '1', 'Transferencia', '1.00', '5500.00', '5500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('672', '2025-09-30', 'Clases de Guitarra Hugo Vazquez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1600.00', '1600.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('673', '2025-09-30', 'Clases de Guitarra Irwin Hernandez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '8100.00', '8100.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('674', '2025-09-30', 'Clases de Teclado Manuel Reyes', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1200.00', '1200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('675', '2025-09-30', 'Clases de Teclado Harim Lopez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1200.00', '1200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('676', '2025-09-30', 'Clases de Canto Nahomy Perez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('677', '2025-09-30', 'Clases de Bajo Luis Blanquet', 'Escuela', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('678', '2025-09-30', 'MKT Emiliano Rosas', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2500.00', '2500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('679', '2025-10-07', 'Limpíeza 04-Oct', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('680', '2025-10-13', 'Paquete de rollos de papel higienico', 'Escuela', NULL, '1', 'Efectivo', '1.00', '70.00', '70.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('681', '2025-10-13', 'Jabon liquido para manos', 'Escuela', NULL, '1', 'Efectivo', '1.00', '29.00', '29.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('682', '2025-10-14', 'Mantenimiento', 'Escuela', NULL, '1', 'Efectivo', '1.00', '792.00', '792.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('683', '2025-10-16', 'Limpieza 11-Oct', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('684', '2025-10-17', 'Total Play', 'Marco Delgado', NULL, '1', 'Transferencia', '1.00', '620.00', '620.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('685', '2025-10-20', 'Limpieza 18-Oct', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('686', '2025-10-20', 'Honorarios Contadora Rocio', 'Escuela', NULL, '1', 'Transferencia', '1.00', '15000.00', '15000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('687', '2025-10-21', 'Meta Ads', 'Escuela', NULL, '1', 'Transferencia', '1.00', '5000.00', '5000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('688', '2025-10-21', 'Renta Local', 'Escuela', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('689', '2025-10-28', 'Limpieza 25-Oct', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('690', '2025-10-31', 'Saldo del celular', 'Escuela', NULL, '1', 'Efectivo', '1.00', '50.00', '50.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('691', '2025-10-31', 'Clases de Batería Demian Andrade', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2400.00', '2400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('692', '2025-10-31', 'Clases de Teclado Harim Lopez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('693', '2025-10-31', 'Clases de Guitarra Hugo Vazquez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1600.00', '1600.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('694', '2025-10-31', 'Clases de Guitarra Irwin Hernandez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '8100.00', '8100.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('695', '2025-10-31', 'Clases de Batería Julio Olvera', 'Escuela', NULL, '1', 'Transferencia', '1.00', '6300.00', '6300.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('696', '2025-10-31', 'Clases de Bajo Luis Blanquet', 'Escuela', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('697', '2025-10-31', 'Clases de Teclado Manuel Reyes', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1200.00', '1200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('698', '2025-10-31', 'Clases de Canto Nahomy Perez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2400.00', '2400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('699', '2025-10-31', 'Marketing Emiliano Rosas', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2500.00', '2500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('700', '2025-10-31', 'Comisiones TPV', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3295.85', '3295.85', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('701', '2025-10-31', 'Quincena Ximena', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2500.00', '2500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('702', '2025-10-31', 'Quincena Ximena', 'Escuela', NULL, '1', 'Efectivo', '1.00', '3000.00', '3000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('703', '2025-11-03', 'Mantenimiento', 'Escuela', NULL, '1', 'Efectivo', '1.00', '732.00', '732.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('704', '2025-11-04', 'Prestamo Juan Antonio', 'Escuela', NULL, '1', 'Transferencia', '1.00', '30000.00', '30000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('705', '2025-11-05', 'Limpieza 01-Nov', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('706', '2025-11-07', 'Pago CFE', 'Escuela', NULL, '1', 'Transferencia', '1.00', '735.00', '735.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('707', '2025-11-08', 'PADs para Batería 8\"', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1600.00', '1600.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('708', '2025-11-13', 'Limpieza 08-Nov', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('709', '2025-11-13', 'Total Play', 'Escuela', NULL, '1', 'Transferencia', '1.00', '660.01', '660.01', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('710', '2025-11-14', 'Zoom Communications, anualidad', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2453.30', '2453.30', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('711', '2025-11-17', 'Limpieza 15-Nov', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('712', '2025-11-21', 'Renta Local', 'Escuela', NULL, '1', 'Transferencia', '1.00', '11560.00', '11560.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('713', '2025-11-21', 'Saldo de Celular', 'Escuela', NULL, '1', 'Efectivo', '1.00', '50.00', '50.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('714', '2025-11-22', 'Paquete de rollos de papel higienico', 'Escuela', NULL, '1', 'Efectivo', '1.00', '53.00', '53.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('715', '2025-11-25', 'Limpieza 22-Nov', 'Escuela', NULL, '1', 'Transferencia', '1.00', '400.00', '400.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('716', '2025-11-28', 'Relleno de Pino y Cloro', 'Escuela', NULL, '1', 'Efectivo', '1.00', '123.00', '123.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('717', '2025-11-30', 'Sillas', 'Antonio Razo', NULL, '1', 'TDC', '1.00', '4998.00', '4998.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('718', '2025-11-30', 'Clases de Batería Demian Andrade', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('719', '2025-11-30', 'Clases de Teclado Harim Lopez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('720', '2025-11-30', 'Clases de Guitarra Hugo Vazquez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2000.00', '2000.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('721', '2025-11-30', 'Clases de Guitarra Irwin Hernandez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '7700.00', '7700.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('722', '2025-11-30', 'Clases de Batería Julio Olvera', 'Escuela', NULL, '1', 'Transferencia', '1.00', '5900.00', '5900.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('723', '2025-11-30', 'Clases de Bajo Luis Blanquet', 'Escuela', NULL, '1', 'Transferencia', '1.00', '800.00', '800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('724', '2025-11-30', 'Clases de Teclado Manuel Reyes', 'Escuela', NULL, '1', 'Transferencia', '1.00', '1200.00', '1200.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('725', '2025-11-30', 'Clases de Canto Nahomy Perez', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2800.00', '2800.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('726', '2025-11-30', 'Marketing Emiliano Rosas', 'Escuela', NULL, '1', 'Transferencia', '1.00', '2500.00', '2500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('727', '2025-11-30', 'Quincena Ximena', 'Escuela', NULL, '1', 'Transferencia', '1.00', '5500.00', '5500.00', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('728', '2025-11-30', 'Comisiones TPV', 'Escuela', NULL, '1', 'Transferencia', '1.00', '3302.96', '3302.96', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('729', '2024-05-09', 'CTIM-3 Huella Estructural', 'Escuela', NULL, '2', 'Transferencia', '1.00', '42125.00', '42125.00', 'I', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('730', '2025-01-13', 'CTIM-3 Huella Estructural', 'Escuela', NULL, '2', 'Transferencia', '1.00', '77250.00', '77250.00', 'I', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('731', '2025-08-12', 'CTIM-3 Huella Estructural', 'Escuela', NULL, '2', 'Transferencia', '1.00', '37200.00', '37200.00', 'I', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('732', '2023-04-26', 'Certificado SSL symbiot-technologies.com', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '519.68', '519.68', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('733', '2023-04-26', 'Servicio Hosting y Dominio symbiot-technologies.com', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '893.20', '893.20', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('734', '2023-04-27', 'Servicio Hosting y Dominio Symbiot.com.mx', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '1010.82', '1010.82', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('735', '2024-02-25', 'SSL Emprendedor (25/02/2024 - 24/02/2025) *	$448.00', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '519.68', '519.68', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('736', '2024-03-27', 'Renovar Dominio - symbiot-technologies.com - 1 Año(s) (26/04/2024 - 25/04/2025) *', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '270.98', '270.98', 'G', '4', '2026-01-22 20:22:50', '2026-01-22 20:22:50');
INSERT INTO `transacciones` VALUES ('737', '2024-03-29', 'Plan Emprendedor (Plesk) - symbiot.com.mx (27/04/2024 - 26/04/2025) *', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '660.04', '660.04', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('738', '2024-04-27', 'Renovar Dominio - symbiot.com.mx - 1 Año(s) (28/04/2024 - 27/04/2025) *', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '350.78', '350.78', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('739', '2024-05-08', 'Módulo lector de Micro SD', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '43.60', '43.60', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('740', '2024-05-08', 'Modulo Carga Tipo C Batería De Litio Tp4056 18650 10 Piezas', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '87.40', '87.40', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('741', '2024-05-08', 'Modulo Bluetooth Hc-06 Para Arduino Pic Raspberry', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '76.89', '76.89', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('742', '2024-05-08', 'Modulo Red Ethernet Enc28j60 Versión Mini Lan', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '140.00', '140.00', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('743', '2024-05-08', 'Placa De Comunicación Cp2102 Usb Uart (tipo C), Usb A Uart', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '399.00', '399.00', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('744', '2024-05-08', 'Módulo de sensor de aceleración NRF51822 LIS3DH placa', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '134.21', '134.21', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('745', '2024-05-08', 'Módulo acelerómetro NRF51822 LIS3DH', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '136.12', '136.12', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('746', '2024-05-08', 'Fielect Caja de cable impemeable de plástico IP65 120x80x65', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '977.92', '977.92', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('747', '2024-05-15', 'Tester Acelerómetro ADXL355B', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '2303.59', '2303.59', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('748', '2024-05-17', 'DHL Express Import Taxes', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '919.39', '919.39', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('749', '2024-05-30', 'Baterías recargables, módulos porta Baterías, módulos de carga', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '1097.89', '1097.89', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('750', '2024-06-05', 'Comida con Socios de Huella Estructural - La Buena Barra', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '8204.10', '8204.10', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('751', '2024-07-31', 'Caja de bateria', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '132.48', '132.48', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('752', '2024-07-31', 'Simcom SIM7600G', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '3939.69', '3939.69', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('753', '2024-11-07', 'Comida con Socios de Huella Estructural - La Bikina', 'Antonio Razo', NULL, '2', 'TDC', '1.00', '5781.05', '5781.05', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('754', '2024-11-07', 'Comida con Socios de Huella Estructural - Sonora Grill Prime', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '5329.95', '5329.95', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('755', '2024-11-07', 'Conectores DC IP68', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '209.90', '209.90', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('756', '2024-11-07', 'Placa de desarrollo ESP-32-S3', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '311.82', '311.82', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('757', '2024-11-07', 'Conectores Ethernet IP68', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '398.67', '398.67', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('758', '2024-11-07', 'Caja de plastico ABS impermeable 200-120-75 with ears negra', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '1385.45', '1385.45', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('759', '2024-12-31', 'Sueldo Maestros Rockstar Skull', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '18300.00', '18300.00', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('760', '2025-01-14', 'JLCPCB Manufacturing', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '25656.46', '25656.46', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('761', '2025-02-09', 'Simcom SIM7600G PCIe', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '2981.79', '2981.79', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('762', '2025-03-12', 'Kit de seperadores y tornillos de nylon', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '259.00', '259.00', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('763', '2025-03-12', 'Espaciadores y tornillos de latón', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '285.24', '285.24', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('764', '2025-03-12', 'Juego de tornillos para caja', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '167.96', '167.96', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('765', '2025-03-24', 'JLCPCB Manufacturing - Versión 2 del Prototipo', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '21237.30', '21237.30', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('766', '2025-04-18', 'Fuente Regulada 9V 4A', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '597.00', '597.00', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('767', '2025-04-18', 'Cable Polarizado 22 AWG para batería Sanelec', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '179.00', '179.00', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('768', '2025-04-18', 'Conectores JST XH 2 pines (200 conectores)', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '158.00', '158.00', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('769', '2025-04-24', 'JLCPCB Manufacturing - Versión 3 del Prototipo', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '30916.06', '30916.06', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('770', '2025-04-24', 'Baterías recargables, soportes batería, jumpers y rollo de niquel', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '5256.00', '5256.00', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('771', '2025-04-30', 'Planta portatil para soldadura por puntos', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '1105.44', '1105.44', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('772', '2025-05-21', 'Anillos de goma IP65, Modulos Bluetooth HC05, PLC Shield', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '1695.15', '1695.15', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('773', '2025-05-22', 'Micro SD Cards y cable ethernet 30m', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '866.97', '866.97', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('774', '2025-05-27', '2x Micro SD Cards Lexar', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '1290.09', '1290.09', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('775', '2025-08-18', 'JLCPCB Manufacturing - Versión 4 del Prototipo', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '15977.11', '15977.11', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('776', '2025-08-18', 'Caja de plastico ABS impermeable 200-120-75 with ears blanca', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '2973.10', '2973.10', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('777', '2025-08-18', 'Conectores DC IP68', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '607.50', '607.50', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('778', '2025-08-18', 'Conectores Ethernet IP68', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '810.40', '810.40', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('779', '2025-08-19', '20 baterias 18650', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '5798.00', '5798.00', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('780', '2025-08-19', 'Kit de 10 memorias MicroSD 32GB Adata', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '599.00', '599.00', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('781', '2025-08-19', '25 Etiquetas CTIM-3 metalizadas Creatify', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '1608.35', '1608.35', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('782', '2025-08-19', 'Power Supply 9V 4A Verifone', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '2487.90', '2487.90', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('783', '2025-08-20', 'Envío UPS CN MX', 'Marco Delgado', NULL, '2', 'TDC', '1.00', '3756.80', '3756.80', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('784', '2025-10-29', 'Curso de creación de Agentes de AI con n8n', 'Marco Delgado', NULL, '2', 'Transferencia', '1.00', '6750.00', '6750.00', 'G', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('785', '2025-06-04', 'Mensualidad Junio 2025 - Aidan Crosby Lobo', 'Escuela', '2', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('786', '2024-09-09', 'Mensualidad Septiembre 2024 - Alan Mateo Gomez Juarez', 'Escuela', '5', '1', 'TPV', '1.00', '1900.00', '1900.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('787', '2024-10-09', 'Mensualidad Octubre 2024 - Alan Mateo Gomez Juarez', 'Escuela', '5', '1', 'TPV', '1.00', '2000.00', '2000.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('788', '2024-11-09', 'Mensualidad Noviembre 2024 - Alan Mateo Gomez Juarez', 'Escuela', '5', '1', 'TPV', '1.00', '2000.00', '2000.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('789', '2024-12-09', 'Mensualidad Diciembre 2024 - Alan Mateo Gomez Juarez', 'Escuela', '5', '1', 'TPV', '1.00', '2000.00', '2000.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('790', '2025-01-09', 'Mensualidad Enero 2025 - Alan Mateo Gomez Juarez', 'Escuela', '5', '1', 'TPV', '1.00', '2000.00', '2000.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('791', '2025-02-09', 'Mensualidad Febrero 2025 - Alan Mateo Gomez Juarez', 'Escuela', '5', '1', 'TPV', '1.00', '2000.00', '2000.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('792', '2025-03-09', 'Mensualidad Marzo 2025 - Alan Mateo Gomez Juarez', 'Escuela', '5', '1', 'TPV', '1.00', '2000.00', '2000.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('793', '2025-04-09', 'Mensualidad Abril 2025 - Alan Mateo Gomez Juarez', 'Escuela', '5', '1', 'TPV', '1.00', '2000.00', '2000.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('794', '2025-05-09', 'Mensualidad Mayo 2025 - Alan Mateo Gomez Juarez', 'Escuela', '5', '1', 'TPV', '1.00', '2000.00', '2000.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('795', '2025-06-09', 'Mensualidad Junio 2025 - Alan Mateo Gomez Juarez', 'Escuela', '5', '1', 'TPV', '1.00', '2000.00', '2000.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('796', '2024-08-02', 'Mensualidad Agosto 2024 - Alejandro Navarro Baltazar', 'Escuela', '6', '1', 'Efectivo', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('797', '2024-09-02', 'Mensualidad Septiembre 2024 - Alejandro Navarro Baltazar', 'Escuela', '6', '1', 'Efectivo', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('798', '2025-03-15', 'Mensualidad Marzo 2025 - Alondra Cecilia Morales Alvarez', 'Escuela', '10', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('799', '2025-04-15', 'Mensualidad Abril 2025 - Alondra Cecilia Morales Alvarez', 'Escuela', '10', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('800', '2025-05-15', 'Mensualidad Mayo 2025 - Alondra Cecilia Morales Alvarez', 'Escuela', '10', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('801', '2025-06-15', 'Mensualidad Junio 2025 - Alondra Cecilia Morales Alvarez', 'Escuela', '10', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('802', '2025-05-31', 'Mensualidad Mayo 2025 - Axel Adrian Hernandez Martinez', 'Escuela', '15', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('803', '2025-06-30', 'Mensualidad Junio 2025 - Axel Adrian Hernandez Martinez', 'Escuela', '15', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('804', '2024-09-30', 'Mensualidad Septiembre 2024 - Brenda Serrano Cervantes', 'Escuela', '18', '1', 'Transferencia', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('805', '2024-10-30', 'Mensualidad Octubre 2024 - Brenda Serrano Cervantes', 'Escuela', '18', '1', 'Transferencia', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('806', '2024-11-30', 'Mensualidad Noviembre 2024 - Brenda Serrano Cervantes', 'Escuela', '18', '1', 'Transferencia', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('807', '2024-12-30', 'Mensualidad Diciembre 2024 - Brenda Serrano Cervantes', 'Escuela', '18', '1', 'Transferencia', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('808', '2025-01-30', 'Mensualidad Enero 2025 - Brenda Serrano Cervantes', 'Escuela', '18', '1', 'Transferencia', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('809', '2025-02-28', 'Mensualidad Febrero 2025 - Brenda Serrano Cervantes', 'Escuela', '18', '1', 'Transferencia', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('810', '2025-03-30', 'Mensualidad Marzo 2025 - Brenda Serrano Cervantes', 'Escuela', '18', '1', 'Transferencia', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('811', '2025-05-08', 'Mensualidad Mayo 2025 - Daniel Alexander Hernandez Arce', 'Escuela', '26', '1', 'TPV', '1.00', '1200.00', '1200.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('812', '2025-05-08', 'Mensualidad Mayo 2025 - Daniel Alexander Hernandez Arce', 'Escuela', '26', '1', 'TPV', '1.00', '1200.00', '1200.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('813', '2024-09-27', 'Mensualidad Septiembre 2024 - Enrique Alexander Roldan Lopez', 'Escuela', '39', '1', 'Transferencia', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('814', '2024-10-27', 'Mensualidad Octubre 2024 - Enrique Alexander Roldan Lopez', 'Escuela', '39', '1', 'Transferencia', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('815', '2024-11-27', 'Mensualidad Noviembre 2024 - Enrique Alexander Roldan Lopez', 'Escuela', '39', '1', 'Transferencia', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('816', '2024-12-27', 'Mensualidad Diciembre 2024 - Enrique Alexander Roldan Lopez', 'Escuela', '39', '1', 'Transferencia', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('817', '2025-01-27', 'Mensualidad Enero 2025 - Enrique Alexander Roldan Lopez', 'Escuela', '39', '1', 'Transferencia', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('818', '2025-02-27', 'Mensualidad Febrero 2025 - Enrique Alexander Roldan Lopez', 'Escuela', '39', '1', 'Transferencia', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('819', '2025-03-27', 'Mensualidad Marzo 2025 - Enrique Alexander Roldan Lopez', 'Escuela', '39', '1', 'Transferencia', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('820', '2024-09-27', 'Mensualidad Septiembre 2024 - Enrique Alexander Roldan Lopez', 'Escuela', '39', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('821', '2024-10-27', 'Mensualidad Octubre 2024 - Enrique Alexander Roldan Lopez', 'Escuela', '39', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('822', '2024-11-27', 'Mensualidad Noviembre 2024 - Enrique Alexander Roldan Lopez', 'Escuela', '39', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('823', '2024-12-27', 'Mensualidad Diciembre 2024 - Enrique Alexander Roldan Lopez', 'Escuela', '39', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('824', '2025-01-27', 'Mensualidad Enero 2025 - Enrique Alexander Roldan Lopez', 'Escuela', '39', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('825', '2025-02-27', 'Mensualidad Febrero 2025 - Enrique Alexander Roldan Lopez', 'Escuela', '39', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('826', '2025-06-10', 'Mensualidad Junio 2025 - Erik Alcantara Trejo', 'Escuela', '40', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('827', '2024-09-17', 'Mensualidad Septiembre 2024 - Fanny Ieraldini Guitierrez Jasso', 'Escuela', '42', '1', 'Transferencia', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('828', '2024-10-17', 'Mensualidad Octubre 2024 - Fanny Ieraldini Guitierrez Jasso', 'Escuela', '42', '1', 'Transferencia', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('829', '2024-12-17', 'Mensualidad Diciembre 2024 - Fanny Ieraldini Guitierrez Jasso', 'Escuela', '42', '1', 'Transferencia', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('830', '2025-01-17', 'Mensualidad Enero 2025 - Fanny Ieraldini Guitierrez Jasso', 'Escuela', '42', '1', 'Transferencia', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('831', '2025-02-17', 'Mensualidad Febrero 2025 - Fanny Ieraldini Guitierrez Jasso', 'Escuela', '42', '1', 'Transferencia', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('832', '2025-03-17', 'Mensualidad Marzo 2025 - Fanny Ieraldini Guitierrez Jasso', 'Escuela', '42', '1', 'Transferencia', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('833', '2025-04-17', 'Mensualidad Abril 2025 - Fanny Ieraldini Guitierrez Jasso', 'Escuela', '42', '1', 'Transferencia', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('834', '2025-05-17', 'Mensualidad Mayo 2025 - Fanny Ieraldini Guitierrez Jasso', 'Escuela', '42', '1', 'Transferencia', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('835', '2025-06-17', 'Mensualidad Junio 2025 - Fanny Ieraldini Guitierrez Jasso', 'Escuela', '42', '1', 'Transferencia', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('836', '2024-10-20', 'Mensualidad Octubre 2024 - Guadalupe Donaji Arellano Ramirez', 'Escuela', '47', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('837', '2024-11-20', 'Mensualidad Noviembre 2024 - Guadalupe Donaji Arellano Ramirez', 'Escuela', '47', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('838', '2024-12-20', 'Mensualidad Diciembre 2024 - Guadalupe Donaji Arellano Ramirez', 'Escuela', '47', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('839', '2025-01-20', 'Mensualidad Enero 2025 - Guadalupe Donaji Arellano Ramirez', 'Escuela', '47', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('840', '2025-02-20', 'Mensualidad Febrero 2025 - Guadalupe Donaji Arellano Ramirez', 'Escuela', '47', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('841', '2025-03-20', 'Mensualidad Marzo 2025 - Guadalupe Donaji Arellano Ramirez', 'Escuela', '47', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('842', '2025-04-20', 'Mensualidad Abril 2025 - Guadalupe Donaji Arellano Ramirez', 'Escuela', '47', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('843', '2025-05-20', 'Mensualidad Mayo 2025 - Guadalupe Donaji Arellano Ramirez', 'Escuela', '47', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('844', '2025-06-20', 'Mensualidad Junio 2025 - Guadalupe Donaji Arellano Ramirez', 'Escuela', '47', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('845', '2025-03-04', 'Mensualidad Marzo 2025 - Guadalupe Rebeca Juarez Vergara', 'Escuela', '48', '1', 'TPV', '1.00', '2000.00', '2000.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('846', '2025-04-04', 'Mensualidad Abril 2025 - Guadalupe Rebeca Juarez Vergara', 'Escuela', '48', '1', 'TPV', '1.00', '2000.00', '2000.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('847', '2025-05-04', 'Mensualidad Mayo 2025 - Guadalupe Rebeca Juarez Vergara', 'Escuela', '48', '1', 'TPV', '1.00', '2000.00', '2000.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('848', '2025-06-04', 'Mensualidad Junio 2025 - Guadalupe Rebeca Juarez Vergara', 'Escuela', '48', '1', 'TPV', '1.00', '2000.00', '2000.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('849', '2024-08-01', 'Mensualidad Agosto 2024 - Gwyneth Adriana Tagliabue Cruz', 'Escuela', '49', '1', 'TPV', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('850', '2024-09-01', 'Mensualidad Septiembre 2024 - Gwyneth Adriana Tagliabue Cruz', 'Escuela', '49', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('851', '2024-10-01', 'Mensualidad Octubre 2024 - Gwyneth Adriana Tagliabue Cruz', 'Escuela', '49', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('852', '2024-11-01', 'Mensualidad Noviembre 2024 - Gwyneth Adriana Tagliabue Cruz', 'Escuela', '49', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('853', '2024-11-11', 'Mensualidad Noviembre 2024 - Isabel Ramos', 'Escuela', '52', '1', 'Transferencia', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('854', '2024-12-11', 'Mensualidad Diciembre 2024 - Isabel Ramos', 'Escuela', '52', '1', 'Transferencia', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('855', '2025-01-11', 'Mensualidad Enero 2025 - Isabel Ramos', 'Escuela', '52', '1', 'Transferencia', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('856', '2024-10-30', 'Mensualidad Octubre 2024 - Joaquin Pimentel', 'Escuela', '56', '1', 'TPV', '1.00', '1275.00', '1275.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('857', '2024-09-08', 'Mensualidad Septiembre 2024 - Jose Fernando Campos Esparza', 'Escuela', '58', '1', 'TPV', '1.00', '2000.00', '2000.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('858', '2024-08-25', 'Mensualidad Agosto 2024 - Jose Francisco Rangel Alonso', 'Escuela', '59', '1', 'Efectivo', '1.00', '1000.00', '1000.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('859', '2024-12-09', 'Mensualidad Diciembre 2024 - Leonardo Landa Sanchez', 'Escuela', '64', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('860', '2025-01-09', 'Mensualidad Enero 2025 - Leonardo Landa Sanchez', 'Escuela', '64', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('861', '2025-02-09', 'Mensualidad Febrero 2025 - Leonardo Landa Sanchez', 'Escuela', '64', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('862', '2025-03-09', 'Mensualidad Marzo 2025 - Leonardo Landa Sanchez', 'Escuela', '64', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('863', '2025-04-09', 'Mensualidad Abril 2025 - Leonardo Landa Sanchez', 'Escuela', '64', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('864', '2025-05-09', 'Mensualidad Mayo 2025 - Leonardo Landa Sanchez', 'Escuela', '64', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('865', '2025-06-09', 'Mensualidad Junio 2025 - Leonardo Landa Sanchez', 'Escuela', '64', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('866', '2025-05-08', 'Mensualidad Mayo 2025 - Luciano Ariel Hernandez Arce', 'Escuela', '68', '1', 'TPV', '1.00', '1200.00', '1200.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('867', '2025-05-08', 'Mensualidad Mayo 2025 - Luciano Ariel Hernandez Arce', 'Escuela', '68', '1', 'TPV', '1.00', '1200.00', '1200.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('868', '2024-09-01', 'Mensualidad Septiembre 2024 - Luis Erik Arias Ayala', 'Escuela', '71', '1', 'TPV', '1.00', '2700.00', '2700.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('869', '2024-10-01', 'Mensualidad Octubre 2024 - Luis Erik Arias Ayala', 'Escuela', '71', '1', 'TPV', '1.00', '2700.00', '2700.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('870', '2024-11-01', 'Mensualidad Noviembre 2024 - Luis Erik Arias Ayala', 'Escuela', '71', '1', 'TPV', '1.00', '2700.00', '2700.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('871', '2024-12-01', 'Mensualidad Diciembre 2024 - Luis Erik Arias Ayala', 'Escuela', '71', '1', 'TPV', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('872', '2025-01-01', 'Mensualidad Enero 2025 - Luis Erik Arias Ayala', 'Escuela', '71', '1', 'TPV', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('873', '2025-02-01', 'Mensualidad Febrero 2025 - Luis Erik Arias Ayala', 'Escuela', '71', '1', 'TPV', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('874', '2025-03-01', 'Mensualidad Marzo 2025 - Luis Erik Arias Ayala', 'Escuela', '71', '1', 'TPV', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('875', '2025-05-01', 'Mensualidad Mayo 2025 - Luis Erik Arias Ayala', 'Escuela', '71', '1', 'TPV', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('876', '2025-06-01', 'Mensualidad Junio 2025 - Luzbel Rueda Muñoz', 'Escuela', '77', '1', 'Transferencia', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('877', '2024-08-31', 'Mensualidad Agosto 2024 - Manuel Zacate Millan', 'Escuela', '79', '1', 'TPV', '1.00', '1400.00', '1400.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('878', '2024-09-30', 'Mensualidad Septiembre 2024 - Manuel Zacate Millan', 'Escuela', '79', '1', 'TPV', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('879', '2025-03-19', 'Mensualidad Marzo 2025 - Mateo Ludwig', 'Escuela', '85', '1', 'TPV', '1.00', '1500.00', '1500.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('880', '2025-03-22', 'Mensualidad Marzo 2025 - Oscar Castilla', 'Escuela', '89', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('881', '2025-04-22', 'Mensualidad Abril 2025 - Oscar Castilla', 'Escuela', '89', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('882', '2025-05-22', 'Mensualidad Mayo 2025 - Oscar Castilla', 'Escuela', '89', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');
INSERT INTO `transacciones` VALUES ('883', '2025-06-22', 'Mensualidad Junio 2025 - Oscar Castilla', 'Escuela', '89', '1', 'TPV', '1.00', '1350.00', '1350.00', 'I', '4', '2026-01-22 20:22:51', '2026-01-22 20:22:51');


-- Tabla: usuarios
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('admin','user') NOT NULL DEFAULT 'user',
  `empresa` varchar(50) NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `usuarios` VALUES ('1', 'Marco Delgado', 'marco.delgado@symbiot.com.mx', '$2y$10$FBFU3yZhUFXv7uFc5waMX.saGd1rAK7ocrdd0p1y724odIbiyucs6', 'admin', 'Symbiot Technologies', '1', '2025-09-01 15:54:17', '2025-11-10 17:01:05');
INSERT INTO `usuarios` VALUES ('2', 'Antonio Razo', 'antonio.razo@symbiot.com.mx', '$2b$10$uPIuj/iZbfazhRb.rHlece5kZafSd0q4PQTxdDrN6w2b8iw6jYD7C', 'admin', 'Symbiot Technologies', '1', '2025-09-01 15:54:17', '2025-10-06 15:11:22');
INSERT INTO `usuarios` VALUES ('3', 'Hugo Vazquez', 'hugo.vazquez@rockstarskull.com', '$2b$10$uPIuj/iZbfazhRb.rHlece5kZafSd0q4PQTxdDrN6w2b8iw6jYD7C', 'user', 'Rockstar Skull', '1', '2025-09-01 15:54:17', '2025-10-06 15:11:22');
INSERT INTO `usuarios` VALUES ('4', 'Escuela', 'escuela@rockstarskull.com', '$2b$10$uPIuj/iZbfazhRb.rHlece5kZafSd0q4PQTxdDrN6w2b8iw6jYD7C', 'user', 'Rockstar Skull', '1', '2025-09-01 15:54:17', '2025-10-06 15:11:22');


SET FOREIGN_KEY_CHECKS=1;
