# PLAN DE CONCILIACIÓN DE DATOS
## Gastos Socios Symbiot.xlsx vs Base de Datos

**Fecha de Análisis:** 2026-01-23
**Estado:** ANÁLISIS COMPLETADO - ESPERANDO AUTORIZACIÓN

---

## 📊 RESUMEN DEL ANÁLISIS

### A. ESTADO ACTUAL DE LA BASE DE DATOS

| Empresa | Tipo | Cantidad | Monto Total |
|---------|------|----------|-------------|
| **Symbiot Technologies** |
| | Gastos | 53 | $188,553.92 |
| | Ingresos | 3 | $156,575.00 |
| **Rockstar Skull** |
| | Gastos | 720 | $1,606,921.01 |
| | Ingresos | 107 | $212,108.88 |
| **TOTALES GENERALES** | | | |
| | Ingresos | 110 | $368,683.88 |
| | Gastos | 773 | $1,795,474.93 |
| | **Balance** | | **-$1,426,791.05** |

### B. DATOS EN EXCEL "Gastos Socios Symbiot.xlsx"

#### Pestaña: **Ingresos RockstarSkull**
- **109 alumnos** con pagos registrados
- **656 pagos** mensuales de julio 2023 a diciembre 2025
- **Total en Excel:** $953,855.00

**Distribución por mes (muestreo):**
- Agosto 2024: 4 pagos × $5,400.00
- Septiembre 2024: 10 pagos × $16,650.00
- Octubre 2024: 9 pagos × $14,375.00
- Noviembre 2024: 8 pagos × $13,100.00
- ... (continúa hasta diciembre 2025)

#### Pestaña: **Gastos RockstarSkull**
- **729 registros** totales
- **721 gastos positivos** (normales)
- **8 gastos NEGATIVOS** por **$-61,383.88** ← ⚠️ DEBEN SER INGRESOS

**Gastos negativos encontrados:**
1. Fila 50: Transferencia Boker a Marco abono: $-8,224.88
2. Fila 79: Transferencia Boker a Marco abono: $-20,000.00
3. Fila 248: Transferencia Marco a Antonio: $-6,000.00
4. Fila 262: Transferencia Escuela a Antonio Razo: $-10,000.00
5. Fila 308: Transferencia Escuela a Marco: $-5,000.00
6. ... (3 más)

---

## 🔍 DISCREPANCIAS CRÍTICAS DETECTADAS

### 1. **INGRESOS FALTANTES EN BASE DE DATOS**

| Concepto | BD Actual | Excel | Diferencia |
|----------|-----------|-------|------------|
| Ingresos RockstarSkull (pagos alumnos) | $212,108.88 (107 registros) | $953,855.00 (656 pagos) | **-$741,746.12** ⚠️ |

**Análisis:**
- La BD solo tiene el 22.2% de los ingresos de alumnos registrados en Excel
- Faltan **549 pagos** de alumnos (83.7%)
- Periodo afectado: Julio 2023 - Diciembre 2025

### 2. **GASTOS NEGATIVOS (Deben convertirse a ingresos)**

- **8 registros** en "Gastos RockstarSkull" con montos negativos
- **Total:** $-61,383.88
- **Acción requerida:** Convertir a ingresos (cambiar signo y tipo)

---

## 📋 PLAN DE ACCIÓN PROPUESTO

### FASE 1: Corrección de Gastos Negativos (CRÍTICO)

**Acciones:**
1. Identificar los 8 registros con montos negativos en "Gastos RockstarSkull"
2. Convertir estos registros de GASTOS → INGRESOS
3. Cambiar el signo de negativo a positivo
4. Actualizar tipo de transacción de 'G' → 'I'

**Impacto estimado:**
- +$61,383.88 a ingresos
- -$61,383.88 a gastos
- Balance mejora en: $122,767.76

### FASE 2: Importación de Pagos de Alumnos (MAYOR)

**Estructura de datos de alumnos (columnas Excel):**
- A: Num Alumno
- B: Nombre del Alumno
- E: Fecha de inscripción (para día de pago)
- F: Fecha de pago
- R-AU: Pagos mensuales (Julio 2023 - Diciembre 2025)

**Proceso propuesto:**
1. **Leer columnas R-AU** (30 meses de pagos)
2. **Para cada alumno:**
   - Obtener día de inscripción (columna E)
   - Para cada mes con pago (columnas R-AU):
     - Crear fecha de pago: Mes/Año + DÍA de inscripción
     - Ejemplo: Alumno inscrito 09-sep-2023 → pagos serán día 9 de cada mes
3. **Crear transacción en BD:**
   - empresa_id: 2 (Rockstar Skull)
   - tipo: 'I' (Ingreso)
   - concepto: "Mensualidad - [Nombre Alumno]"
   - total: [Monto del Excel]
   - fecha: [Mes/Año + día inscripción]
   - forma_pago: Según columna K del Excel
   - categoria: "Mensualidades"

**Validaciones antes de importar:**
- ✅ Verificar que no existan duplicados
- ✅ Validar rangos de fechas (julio 2023 - diciembre 2025)
- ✅ Verificar montos > 0
- ✅ Crear backup de BD antes de importar

**Impacto estimado:**
- +656 transacciones de ingresos
- +$953,855.00 a ingresos totales
- Balance mejora en: $953,855.00

### FASE 3: Verificación y Conciliación Final

1. **Re-calcular totales:**
   - Ingresos esperados: $368,683.88 + $953,855.00 + $61,383.88 = $1,383,922.76
   - Gastos ajustados: $1,795,474.93 - $61,383.88 = $1,734,091.05
   - Nuevo balance: $1,383,922.76 - $1,734,091.05 = **-$350,168.29**

2. **Generar reporte de conciliación:**
   - Comparar BD vs Excel por mes
   - Identificar cualquier discrepancia restante
   - Documentar cambios realizados

---

## ⚠️ RIESGOS Y CONSIDERACIONES

1. **Duplicados:**
   - Riesgo: Algunos pagos de alumnos podrían ya estar en BD
   - Mitigación: Verificar por alumno+mes+monto antes de insertar

2. **Fechas de pago:**
   - Riesgo: Día de inscripción podría no coincidir con día real de pago
   - Mitigación: Usar fecha de columna F cuando esté disponible

3. **Integridad de datos:**
   - Riesgo: Modificar datos históricos
   - Mitigación: **CREAR BACKUP COMPLETO DE BD ANTES**

---

## 🎯 PASOS SIGUIENTES (Requieren Autorización)

### ¿Qué necesito hacer?

1. ✅ **CREAR BACKUP de la base de datos**
   - Exportar BD completa antes de cualquier cambio

2. 🔄 **FASE 1: Corregir 8 gastos negativos**
   - Convertir a ingresos
   - Tiempo estimado: 5 minutos

3. 🔄 **FASE 2: Importar 656 pagos de alumnos**
   - Leer Excel columnas R-AU
   - Crear transacciones con fecha = día inscripción + mes/año
   - Tiempo estimado: 10-15 minutos

4. ✅ **FASE 3: Validar y generar reporte**
   - Comparar totales BD vs Excel
   - Documentar cambios
   - Tiempo estimado: 5 minutos

---

## 📊 RESULTADO ESPERADO

### Antes de conciliación:
```
Balance actual: -$1,426,791.05
  Ingresos: $368,683.88
  Gastos: $1,795,474.93
```

### Después de conciliación:
```
Balance esperado: -$350,168.29
  Ingresos: $1,383,922.76 (+$1,015,238.88)
  Gastos: $1,734,091.05 (-$61,383.88)
```

**Mejora del balance: $1,076,622.76**

---

## ❓ PREGUNTAS PARA AUTORIZACIÓN

1. ¿Procedo con crear el backup de la BD?
2. ¿Autoriza convertir los 8 gastos negativos a ingresos?
3. ¿Autoriza importar los 656 pagos de alumnos desde Excel?
4. ¿Confirma que las fechas de pago deben usar el DÍA de inscripción de cada alumno?
5. ¿Hay alguna consideración adicional antes de proceder?

---

**ESTADO: ESPERANDO AUTORIZACIÓN DEL USUARIO**
