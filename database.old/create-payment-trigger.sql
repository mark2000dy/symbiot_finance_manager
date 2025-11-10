-- ====================================================
-- TRIGGER PARA ACTUALIZAR fecha_ultimo_pago AUTOMÁTICAMENTE
-- Se ejecuta después de INSERT en tabla transacciones
-- ====================================================

DELIMITER $$

DROP TRIGGER IF EXISTS after_transaction_insert_update_payment_date$$

CREATE TRIGGER after_transaction_insert_update_payment_date
AFTER INSERT ON transacciones
FOR EACH ROW
BEGIN
    DECLARE alumno_nombre VARCHAR(150);
    DECLARE alumno_id_encontrado INT;
    
    -- Solo procesar si es un ingreso (tipo 'I') y empresa_id = 1
    IF NEW.tipo = 'I' AND NEW.empresa_id = 1 THEN
        
        -- Extraer nombre del alumno del concepto
        -- Formato: "Mensualidad clase de [INSTRUMENTO] [I/G] [Nombre Alumno]"
        -- Buscamos después de "I " o "G "
        SET alumno_nombre = TRIM(
            SUBSTRING_INDEX(
                SUBSTRING_INDEX(NEW.concepto, ' I ', -1),
                ',', 1
            )
        );
        
        -- Si no encontró con "I ", intentar con "G "
        IF alumno_nombre = NEW.concepto THEN
            SET alumno_nombre = TRIM(
                SUBSTRING_INDEX(
                    SUBSTRING_INDEX(NEW.concepto, ' G ', -1),
                    ',', 1
                )
            );
        END IF;
        
        -- Buscar alumno por nombre
        SELECT id INTO alumno_id_encontrado
        FROM alumnos
        WHERE empresa_id = 1
            AND (
                nombre = alumno_nombre
                OR nombre LIKE CONCAT('%', alumno_nombre, '%')
            )
        LIMIT 1;
        
        -- Si se encontró el alumno, actualizar fecha_ultimo_pago
        IF alumno_id_encontrado IS NOT NULL THEN
            UPDATE alumnos
            SET fecha_ultimo_pago = NEW.fecha
            WHERE id = alumno_id_encontrado;
        END IF;
        
    END IF;
END$$

DELIMITER ;