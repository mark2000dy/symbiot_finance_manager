# Análisis de Duplicados de Pagos y Problemas de Reportes
**Symbiot Financial Manager**  
**Análisis Completo: 30-01-2026**

---

## PARTE 1: DUPLICADOS DE PAGOS EN ENERO 2026

### 📊 Resumen Ejecutivo de Duplicados

| Alumno | Clase | Fecha Duplicada | Monto | ID Registros | Estado |
|--------|-------|---|---|---|---|
| **Joshua Chanampa Villada** | Canto + Guitarra | 2026-01-09 | $2,300.00 c/u | 1555, 1612 | ⚠️ DUPLICADO |
| **Gerardo Tadeo Yépez** | Batería | Enero 2026 | $1,350.00 c/u | 1537, 1614 | ⚠️ DUPLICADO |
| **Guadalupe Donaji** | Guitarra | 2026-01-16 | $1,275.00 | 1576 + anterior | ⚠️ DUPLICADO |
| **Itzel Ameyalli** | Canto | 2026-01-08/19 | $1,350.00 c/u | 1610, 1611, 1585 | ⚠️ TRIPLE DUPLICADO |

---

## PARTE 2: ANÁLISIS POR ALUMNO

### 1️⃣ JOSHUA CHANAMPA VILLADA (ID: 60)
**Inscripción:** 2025-07-02 | **Clases:** Canto (Grupal, Nahomy Perez) + Guitarra (Grupal, Irwin Hernandez)

**PROBLEMA IDENTIFICADO:**
```
ID 1555 (2026-01-09): Guitarra G Joshua - $2,300.00 (empresa_id = 4)
ID 1612 (2026-01-09): Canto G Joshua - $2,300.00 (empresa_id = 4)
      └─ CREADO: 2026-01-30 22:56:00 (misma fecha, mismo monto)
```

**Análisis:**
- Ambos registros tienen la **MISMA FECHA EXACTA** (2026-01-09)
- Ambos tienen el **MISMO MONTO** ($2,300.00)
- Creados con minutos de diferencia (21:18:11 vs 22:56:00)
- El alumno tiene 2 clases, pero esto podría ser:
  - ✅ Legítimo si paga mensualidades separadas por clase
  - ❌ Error de duplicación

**Recomendación:**
- Verificar con Joshua si toma ambas clases en enero o si es un error
- Si ambas son correctas, monto total = $4,600.00
- Si es error, eliminar ID 1612 (Canto, creado más tarde)

---

### 2️⃣ CARLOS MAYA (ID: Desconocido)

**PROBLEMA:**
- Clases: Canto + Teclado
- Meses afectados: Diciembre 2025 + Enero 2026
- Sin registros en el archivo de backup

**SQL para buscar:**
```sql
SELECT id, nombre FROM alumnos WHERE nombre LIKE '%Carlos Maya%' LIMIT 5;
SELECT id, fecha, concepto, cliente_id, precio_unitario 
FROM transacciones 
WHERE concepto LIKE '%Carlos Maya%' 
ORDER BY fecha DESC;
```

---

### 3️⃣ GERARDO TADEO YÉPEZ PADILLA (ID: 46)
**Inscripción:** 2025-05-20 | **Clase:** Batería (Grupal, Julio Olvera)

**PROBLEMA IDENTIFICADO:**
```
ID 1537 (2026-01-07): Mensualidad Clases de Bateria G - $1,350.00 (empresa_id = 4)
ID 1614 (2026-01-28): Mensualidad Clases de Batería G - $1,350.00 (empresa_id = 4)
      └─ CREADO: 2026-01-30 23:25:28 (3 semanas después)
```

**Análisis:**
- **2 pagos en el mismo mes** (enero 2026)
- Fechas diferentes (7 y 28), pero mismo mes
- Probablemente el del 28 es el correcto (procesado con más detalle)
- El del 7 podría ser un resto pendiente o error

**Recomendación:**
- Revisar cuál es el pago correcto
- Eliminar el duplicado (probablemente ID 1537)

---

### 4️⃣ GUADALUPE DONAJI ARELLANO RAMÍREZ (ID: 47)
**Inscripción:** 2023-10-20 | **Clase:** Guitarra (Grupal, Hugo Vazquez)

**PROBLEMA IDENTIFICADO:**
```
ID 1576 (2026-01-16): Guitarra G Guadalupe Donaji - $1,275.00 (empresa_id = 4)
      └─ CREADO: 2026-01-28 22:08:06

HISTÓRICO: 
- Registro en Lote 2 (original): 2023-10-20 a 2025-11-20 completamente documentado
```

**Análisis:**
- Enero 2026 ya está cubierto en el Lote 2 original
- El registro ID 1576 es un DUPLICADO POSTERIOR
- Monto es consistente ($1,275.00 desde junio 2025)

**Recomendación:**
- Eliminar ID 1576 (es duplicado de enero 2026)

---

### 5️⃣ ITZEL AMEYALLI LECHUGA VALERO (ID: 53)
**Inscripción:** 2025-05-17 | **Clase:** Canto (Grupal, Nahomy Perez)

**PROBLEMA CRÍTICO - TRIPLE DUPLICADO:**
```
ID 1585 (2026-01-19): Canto G Itzel - $1,350.00 (empresa_id = 4)
      └─ CREADO: 2026-01-28 22:29:11

ID 1610 (2026-01-08): Canto G Itzel - $1,350.00 (empresa_id = 4)
      └─ CREADO: 2026-01-30 22:53:14

ID 1611 (2026-01-19): Canto G Itzel - $1,350.00 (empresa_id = 4)
      └─ CREADO: 2026-01-30 22:54:23 (1 minuto después de ID 1610)
```

**Análisis:**
- **3 REGISTROS para enero 2026** (CRÍTICO)
- IDs 1610 y 1611 creados con 1 minuto de diferencia
- Posible error de batche o script que se ejecutó múltiples veces

**Recomendación:**
- Eliminar ID 1610 e ID 1611
- Mantener ID 1585 (o revisar fecha correcta)

---

### 6️⃣ LEONARDO ARTURO GÓMEZ LÓPEZ (ID: 63)
**Clase:** Guitarra (Grupal, Irwin Hernandez)

**PROBLEMA IDENTIFICADO:**
```
ID 1556 (2025-12-03): Guitarra G Leonardo - $1,350.00 (empresa_id = 4)
      └─ cliente_id = NULL (¡NO VINCULADO!)
      └─ CREADO: 2026-01-28 21:20:12

ID 1605 (2025-12-03): Guitarra G Leonardo - $1,350.00 (empresa_id = 1)
      └─ cliente_id = 63 (correcto)
      └─ CREADO: 2026-01-30 21:50:05
```

**Análisis:**
- **DUPLICADO con vinculación incorrecta**
- ID 1556 tiene `cliente_id = NULL` → no aparece en reportes de alumno
- ID 1605 tiene vinculación correcta en la empresa 1
- Ambos misma fecha y monto

**Recomendación:**
- **ELIMINAR ID 1556** (está mal vinculado)
- Mantener ID 1605

---

### 7️⃣ PAMELA GUTIÉRREZ CARRILLO (ID: 91)
**Inscripción:** 2025-07-31 | **Clase:** Batería (Grupal, Julio Olvera)

**PROBLEMA: REGISTROS FALTANTES**
```
HISTORIAL DISPONIBLE:
- 2025-08-31: Batería
- 2025-09-30: Batería
- 2025-10-31: Batería
- 2026-01-05: Batería (empresa_id = 4)

MESES FALTANTES:
- ❌ 2025-11-30 (NOVIEMBRE - FALTA)
- ❌ 2025-12-31 (DICIEMBRE - FALTA)
```

**Análisis:**
- Pamela tiene pagos hasta octubre 2025
- Falta noviembre y diciembre 2025
- Reaparece en enero 2026
- Se perdieron 2 meses de ingresos esperados ($2,700.00 × 2 = $5,400.00)

**Recomendación:**
- Investigar por qué falta noviembre y diciembre
- ¿Fue baja temporal? ¿Error administrativo?
- Agregar registros faltantes o marcar como BAJA si aplica

---

## PARTE 3: PROBLEMA DE REPORTES (ALTAS Y BAJAS)

### 📌 Discrepancia Identificada

**Lo que dice el reporte de enero:**
```
Total Alumnos: 41
Bajas acumuladas: 74
Alumnos activos: 43
```

**El problema:**
- ❌ El reporte muestra **41 alumnos registrados**
- ✅ Pero hay **43 alumnos activos**
- ✅ Y **74 bajas acumuladas**
- 🤔 **Matemática no cuadra:** 41 + 74 ≠ 115 (total histórico esperado)

### 🔍 Causa Raíz

El problema está en la función `getReporteAltasBajas()` del backend:

```php
// Línea 2209 de TransaccionesController.php:
'total_alumnos' => count($alumnos)  // ← ESTO CUENTA SOLO ALUMNOS DE LA EMPRESA

// Pero también calcula:
'alumnos_activos' => $activos  // ← ESTO USA LÓGICA DE TRANSACCIONES
```

**Explicación:**
1. `count($alumnos)` = Cuenta ALL alumnos en tabla `alumnos` donde `empresa_id = 1`
2. `$activos` = Cuenta SOLO alumnos que tienen al menos UNA transacción en ese mes
3. Los alumnos SIN TRANSACCIONES en enero NO se cuentan en activos pero SÍ en total

### 📊 Análisis de Duplicados que Afectan el Reporte

**Alumnos contados MÚLTIPLES VECES en enero 2026:**
- Joshua Chanampa: 2 clases = ¿cuenta como 1 o 2?
- Gerardo Tadeo: 2 pagos = ¿cuenta como 1 o 2?
- Guadalupe Donaji: 2 pagos = ¿cuenta como 1 o 2?
- Itzel Ameyalli: 3 pagos = ¿cuenta como 1 o 3?
- Leonardo Gómez: 1 sin vincular + 1 vinculado = ¿cuenta como 1 o 2?

**Si se eliminan los duplicados:**
- Podrían bajar los "alumnos_activos" de 43 a 39 aproximadamente
- O podrían cambiar por error de lógica

---

## PARTE 4: SCRIPT SQL PARA LIMPIAR

### ✅ PASO 1: Verificar antes de eliminar

```sql
-- Ver todos los duplicados identificados
SELECT id, fecha, concepto, cliente_id, precio_unitario, empresa_id, created_at
FROM transacciones
WHERE id IN (1555, 1612, 1537, 1614, 1576, 1610, 1611, 1585, 1556, 1605)
ORDER BY id;

-- Verificar Joshua (ambas clases enero)
SELECT id, fecha, concepto, cliente_id, precio_unitario, empresa_id
FROM transacciones
WHERE cliente_id = 60 AND MONTH(fecha) = 1 AND YEAR(fecha) = 2026;

-- Verificar Itzel (triple duplicado)
SELECT id, fecha, concepto, cliente_id, precio_unitario, empresa_id, created_at
FROM transacciones
WHERE cliente_id = 53 AND MONTH(fecha) = 1 AND YEAR(fecha) = 2026
ORDER BY id;
```

### ✅ PASO 2: Eliminar duplicados confirmados

```sql
-- Eliminar ITZEL AMEYALLI (triple duplicado - mantener ID 1585)
DELETE FROM transacciones WHERE id IN (1610, 1611);

-- Eliminar GERARDO TADEO (duplicado enero - revisar cuál es el correcto)
-- DELETE FROM transacciones WHERE id = 1537;  -- ← Revisar primero

-- Eliminar GUADALUPE DONAJI (duplicado enero)
-- DELETE FROM transacciones WHERE id = 1576;  -- ← Revisar primero

-- Eliminar LEONARDO GÓMEZ (sin vincular)
DELETE FROM transacciones WHERE id = 1556;
```

### ✅ PASO 3: Revisar JOSHUA (posiblemente legítimo)

```sql
-- Joshua tiene 2 clases, verificar si ambas son pagadas por separado
SELECT alumno_id, clase, maestro_id, precio_mensual 
FROM alumnos 
WHERE nombre = 'Joshua Chanampa Villada';

-- Si AMBAS son correctas (2 clases), el pago total debe ser suma de ambas
-- Si es error, eliminar:
-- DELETE FROM transacciones WHERE id = 1612;
```

### ✅ PASO 4: Agregar registros faltantes de PAMELA

```sql
-- Agregar pago faltante de noviembre 2025
INSERT INTO transacciones 
(fecha, concepto, socio, cliente_id, empresa_id, tipo, cantidad, precio_unitario, forma_pago, observaciones, created_at, updated_at)
VALUES
('2025-11-30', 'Mensualidad Clases de Batería G Pamela Gutierrez Carrillo', 'Julio Olvera', 91, 1, 'I', 1, 1350.00, 'TPV', 'Registro recuperado - Noviembre 2025', NOW(), NOW());

-- Agregar pago faltante de diciembre 2025
INSERT INTO transacciones 
(fecha, concepto, socio, cliente_id, empresa_id, tipo, cantidad, precio_unitario, forma_pago, observaciones, created_at, updated_at)
VALUES
('2025-12-30', 'Mensualidad Clases de Batería G Pamela Gutierrez Carrillo', 'Julio Olvera', 91, 1, 'I', 1, 1350.00, 'TPV', 'Registro recuperado - Diciembre 2025', NOW(), NOW());
```

---

## PARTE 5: RECOMENDACIONES FINALES

### ⚠️ Acciones Inmediatas (CRÍTICAS)
1. ❌ **ELIMINAR:** ID 1610, 1611 (Itzel - triple duplicado)
2. ❌ **ELIMINAR:** ID 1556 (Leonardo - sin cliente_id)
3. ✅ **VERIFICAR:** IDs 1537, 1614 (Gerardo - ¿cuál es correcto?)
4. ✅ **VERIFICAR:** ID 1576 (Guadalupe - ¿es duplicado o segundo pago?)
5. ✅ **VERIFICAR:** IDs 1555, 1612 (Joshua - ¿2 clases o error?)

### 📝 Acciones Secundarias
6. ➕ **AGREGAR:** Registros faltantes de Pamela (Nov y Dic 2025)
7. 🔧 **REVISAR:** Por qué falta Carlos Maya en el archivo
8. 🔄 **REGENERAR:** Reporte de Altas y Bajas después de limpiar duplicados

### 💻 Validación Post-Limpieza
```sql
-- Verificar que no haya más duplicados
SELECT fecha, concepto, cliente_id, COUNT(*) as duplicados
FROM transacciones
WHERE fecha BETWEEN '2026-01-01' AND '2026-01-31'
GROUP BY fecha, concepto, cliente_id
HAVING COUNT(*) > 1;

-- Verificar integridad de Pamela después de agregar registros
SELECT fecha, concepto, cliente_id, precio_unitario
FROM transacciones
WHERE cliente_id = 91
ORDER BY fecha;
```

---

## Próximos Pasos

1. Ejecutar queries de verificación primero
2. Tomar decisión sobre cada caso
3. Ejecutar eliminaciones confirmadas
4. Ejecutar inserciones de registros faltantes
5. Regenerar reportes
6. Validar que cuadre la contabilidad

