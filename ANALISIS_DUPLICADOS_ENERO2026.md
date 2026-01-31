# Análisis de Duplicados de Pagos - Enero 2026
**Symbiot Financial Manager**  
**Fecha de análisis: 30-01-2026**

---

## Resumen Ejecutivo

Se han identificado **DUPLICADOS DE PAGOS** en los siguientes alumnos en enero 2026 y pagos faltantes en noviembre/diciembre 2025:

| Alumno | Clase | Mes | Problema | Estado |
|--------|-------|-----|----------|--------|
| Joshua Chanampa Villada | Guitarra + Canto | Enero 2026 | Pagos duplicados | ⚠️ CRÍTICO |
| Carlos Maya | Canto + Teclado | Dic 2025/Ene 2026 | Pagos duplicados | ⚠️ CRÍTICO |
| Gerardo Tadeo Yépez Padilla | Batería | Enero 2026 | Duplicado (2 registros) | ⚠️ CRÍTICO |
| Guadalupe Donaji Arellano | Guitarra | Enero 2026 | Duplicado (2 registros) | ⚠️ CRÍTICO |
| Itzel Ameyalli Lechuga | Canto | Enero 2026 | Duplicado (3 registros) | ⚠️ CRÍTICO |
| Leonardo Gómez López | Guitarra | Diciembre 2025 | Duplicado + NULL cliente_id | ⚠️ CRÍTICO |
| Pamela Gutiérrez Carrillo | Batería | Nov/Dic 2025 | Registros faltantes | ⚠️ CRÍTICO |

---

## Detalle de Duplicados por Alumno

### 1️⃣ **JOSHUA CHANAMPA VILLADA** (ID: 60)
**Inscripción:** 2025-07-02 | **Clases:** Canto (Grupal) + Guitarra (Grupal)

#### Problema:
- **Guitarra**: Tiene pago de **2026-01-09** (ID 1555) - $2,300.00
- **Canto**: Tiene pago duplicado de **2026-01-09** (ID 1612) - $2,300.00
  - Registrado 2 veces con la misma fecha en empresa_id = 4

#### SQL para verificar:
```sql
SELECT id, fecha, concepto, socio, precio_unitario, empresa_id 
FROM transacciones 
WHERE cliente_id = 60 AND fecha = '2026-01-09'
ORDER BY id;
```

#### Registros a revisar:
- ID 1555: Guitarra $2,300.00
- ID 1612: Canto $2,300.00 (DUPLICADO)

---

### 2️⃣ **CARLOS MAYA** (ID: ?)
**Clases:** Canto + Teclado

#### Problema:
- Pagos duplicados en **diciembre 2025 y enero 2026**
- Ambas clases mostran registros con la misma fecha

#### SQL para verificar:
```sql
SELECT * FROM alumnos WHERE nombre LIKE '%Carlos Maya%';
SELECT id, fecha, concepto, cliente_id, precio_unitario 
FROM transacciones 
WHERE concepto LIKE '%Carlos Maya%' 
ORDER BY fecha DESC;
```

---

### 3️⃣ **GERARDO TADEO YÉPEZ PADILLA** (ID: 46)
**Clase:** Batería (Grupal)

#### Problema:
- Tiene **2 registros** para **2026-01-** (enero)
  - ID 1537: 2026-01-07 en empresa_id = 4
  - ID 1614: 2026-01-28 en empresa_id = 4

#### SQL para verificar:
```sql
SELECT id, fecha, concepto, precio_unitario, empresa_id 
FROM transacciones 
WHERE cliente_id = 46 AND YEAR(fecha) = 2026 AND MONTH(fecha) = 1
ORDER BY fecha;
```

---

### 4️⃣ **GUADALUPE DONAJI ARELLANO RAMÍREZ** (ID: 47)
**Clase:** Guitarra (Grupal)

#### Problema:
- Tiene **2 registros** para **enero 2026**
  - ID 1576: 2026-01-16 en empresa_id = 4 - $1,275.00
  - Existía registro previo en el lote original (Lote 2)

#### SQL para verificar:
```sql
SELECT id, fecha, concepto, precio_unitario, empresa_id 
FROM transacciones 
WHERE cliente_id = 47 AND fecha LIKE '2026-01%'
ORDER BY id;
```

---

### 5️⃣ **ITZEL AMEYALLI LECHUGA VALERO** (ID: 53)
**Clase:** Canto (Grupal)

#### Problema:
- Tiene **3 registros para enero 2026** (DUPLICADO TRIPLE):
  - ID 1585: 2026-01-19 en empresa_id = 4
  - ID 1610: 2026-01-08 en empresa_id = 4
  - ID 1611: 2026-01-19 en empresa_id = 4

#### SQL para verificar:
```sql
SELECT id, fecha, concepto, precio_unitario, empresa_id, created_at 
FROM transacciones 
WHERE cliente_id = 53 AND fecha LIKE '2026-01%'
ORDER BY id;
```

---

### 6️⃣ **LEONARDO ARTURO GÓMEZ LÓPEZ** (ID: 63, pero hay uno con NULL)
**Clase:** Guitarra (Grupal)

#### Problema:
- **2 registros** con la misma fecha 2025-12-03:
  - ID 1556: cliente_id = **NULL**, empresa_id = 4 (FALTA VINCULACIÓN)
  - ID 1605: cliente_id = 63, empresa_id = 1

#### SQL para verificar:
```sql
SELECT id, fecha, concepto, cliente_id, precio_unitario, empresa_id 
FROM transacciones 
WHERE fecha = '2025-12-03' AND concepto LIKE '%Leonardo%Gomez%'
ORDER BY id;
```

---

### 7️⃣ **PAMELA GUTIÉRREZ CARRILLO** (ID: 91)
**Clase:** Batería (Grupal)

#### Problema:
- **REGISTROS FALTANTES** en noviembre y diciembre 2025
- Último pago registrado: 2025-10-31
- Siguiente pago: 2026-01-05

#### SQL para verificar:
```sql
SELECT id, fecha, concepto, precio_unitario 
FROM transacciones 
WHERE cliente_id = 91 AND fecha BETWEEN '2025-11-01' AND '2025-12-31'
ORDER BY fecha;
```

---

## Recomendaciones de Corrección

### ✅ Acción 1: Eliminar duplicados de enero 2026
```sql
-- IDs a eliminar (revisar antes de ejecutar):
-- Joshua Canto: ID 1612
-- Gerardo Tadeo: ID 1614 o ID 1537 (mantener el correcto)
-- Guadalupe Donaji: ID 1576 (si es duplicado)
-- Itzel Ameyalli: IDs 1610 y 1611 (mantener solo uno con fecha correcta)
```

### ✅ Acción 2: Vincular Leonardo Gómez
```sql
UPDATE transacciones 
SET cliente_id = 63 
WHERE id = 1556 AND concepto LIKE '%Leonardo%Gomez%';
```

### ✅ Acción 3: Agregar registros faltantes de Pamela Gutiérrez
```sql
-- Falta noviembre y diciembre 2025
-- Insertar:
-- 2025-11-30 - Batería
-- 2025-12-31 - Batería (o 2025-12-30)
```

---

## Próximos Pasos

1. **Verificar manualmente** cada duplicado antes de eliminar
2. **Confirmar con Carlos Maya** sus clases y fechas de pago
3. **Actualizar reportes.html** para mostrar datos consistentes
4. **Validar cuadre** entre alumnos activos y pagos registrados

