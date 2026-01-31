# Fix para Reporte de Altas y Bajas - reportes.html

## Problema Identificado

El reporte de **"Altas y Bajas de Alumnos"** en `reportes.html` muestra una discrepancia:

```
Último reporte de enero: 
- Total Alumnos: 41
- Alumnos Activos: 43 ← INCONSISTENCIA (activos > total)
- Bajas Acumuladas: 74
```

## Causa Raíz

En **`api/controllers/TransaccionesController.php`** línea 2209:

```php
'total_alumnos' => count($alumnos)  // Cuenta todos los alumnos de la empresa
'alumnos_activos' => $activos       // Solo los que tienen transacciones en ese mes
```

**El problema:**
- `count($alumnos)` = todos los alumnos registrados (incluyendo bajas)
- `$activos` = solo alumnos con transacción en ese mes
- En enero 2026: hay alumnos sin transacción que aparecen como "activos"

## Análisis de la Lógica Actual

### Función `getReporteAltasBajas()` - Líneas 2013-2209

**Pasos que ejecuta:**
1. Obtiene TODOS los alumnos de la empresa (sin filtro de estatus)
2. Mapea transacciones por alumno
3. Para cada mes, calcula si alumno está "activo" basado en:
   - ✅ Tiene transacción en ese mes
   - ✅ No es "Baja" y última transacción <= mes actual
4. Calcula altas/bajas como cambios de estado entre meses

**Problemas en la lógica:**

```php
// Línea 2141-2153: Cálculo de actividad
if (!$esBaja && $lastTx !== null && $mes >= $lastTx) {
    $alumnoActivoEnMes[$id][$mes] = true;  // ← CONSIDERA ACTIVO INCLUSO SIN PAGO
    continue;
}
```

Esto significa que un alumno sin pago en enero pero que pagó en diciembre se cuenta como "activo" en enero.

## Soluciones Propuestas

### Opción A: Mostrar "Alumnos Registrados" vs "Alumnos Activos" Claramente

**Cambio en reportes.html (línea 750):**

```html
<!-- ANTES -->
<h6 class="text-muted">Alumnos Registrados</h6>
<h3 class="text-orange mb-0" id="totalAlumnosRegistrados">0</h3>

<!-- DESPUÉS - Más claridad -->
<h6 class="text-muted">Alumnos Inscritos</h6>
<h3 class="text-orange mb-0" id="totalAlumnosRegistrados">0</h3>
<small class="text-muted">(incl. dados de baja)</small>
```

**Cambio en reportes.html (línea 760) - Agregar indicador de SOLO ACTIVOS:**

```html
<div class="col-md-3 mb-3">
    <div class="card" style="background: rgba(25, 202, 240, 0.1); border: 1px solid rgba(25, 202, 240, 0.3);">
        <div class="card-body text-center">
            <i class="fas fa-check-circle fa-2x text-info mb-2"></i>
            <h6 class="text-muted">Alumnos ACTIVOS (Ene)</h6>
            <h3 class="text-info mb-0" id="alumnosActivoEste">0</h3>
        </div>
    </div>
</div>
```

### Opción B: Corregir la lógica de cálculo (Más Preciso)

**Cambio en TransaccionesController.php (línea 2209):**

Distinguir entre:
- `total_alumnos` = Total de registro histórico
- `alumnos_activos_reales` = Solo los que tienen transacción EN ESE MES O DESPUÉS

```php
// NUEVO CÁLCULO
$alumnosActivosReales = 0;  // Solo los que PAGARON este mes
$alumnosActivosEstimado = 0; // Los que podrían estar activos

foreach ($alumnoActivoEnMes as $id => $mesesMap) {
    if (isset($mesesMap[$ultimoMes]) && $mesesMap[$ultimoMes]) {
        if (isset($alumnoMeses[$id][$ultimoMes])) {
            $alumnosActivosReales++;  // Tiene pago en este mes
        }
        $alumnosActivosEstimado++;  // Podría estar activo
    }
}

echo json_encode([
    'success' => true,
    'data' => [
        'meses' => $resultado,
        'resumen' => [
            'total_altas' => $totalAltas,
            'total_bajas' => $totalBajas,
            'neto' => $totalAltas - $totalBajas,
            'total_alumnos' => count($alumnos),                 // 41 (inscritos)
            'alumnos_activos_reales' => $alumnosActivosReales, // Solo con pago
            'alumnos_activos_estimado' => $alumnosActivosEstimado  // Estimado
        ]
    ]
]);
```

### Opción C: Mostrar Tabla de Detalles por Estatus

**En reportes.html - Agregar después de la tabla mensual:**

```html
<div class="row mt-4">
    <div class="col-12">
        <h6 class="text-white mb-3">
            <i class="fas fa-filter me-2"></i>Desglose de Alumnos (Enero 2026)
        </h6>
        <div class="table-responsive">
            <table class="table table-dark table-sm">
                <thead>
                    <tr>
                        <th><i class="fas fa-list me-1"></i>Categoría</th>
                        <th class="text-end"><i class="fas fa-users me-1"></i>Cantidad</th>
                        <th><i class="fas fa-info-circle me-1"></i>Descripción</th>
                    </tr>
                </thead>
                <tbody id="detalleAlumnos">
                    <tr>
                        <td colspan="3" class="text-center text-muted">
                            <i class="fas fa-spinner fa-spin me-2"></i>Cargando...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
```

**En reportes-widgets.js - Nueva función:**

```javascript
function updateDetalleAlumnos(datos) {
    const tbody = document.getElementById('detalleAlumnos');
    if (!tbody) return;
    
    const ultimoMes = datos.meses[datos.meses.length - 1];
    const activos = ultimoMes.alumnos_activos;
    const inscritos = datos.resumen.total_alumnos;
    const bajas = inscritos - activos; // Aproximado
    
    const html = `
        <tr>
            <td><strong>Inscritos Total</strong></td>
            <td class="text-end"><strong>${inscritos}</strong></td>
            <td>Todos los alumnos en el sistema (activos + bajas)</td>
        </tr>
        <tr style="background: rgba(25, 135, 84, 0.2);">
            <td><i class="fas fa-user-check text-success me-2"></i>Activos (${ultimoMes.mes})</td>
            <td class="text-end text-success"><strong>${activos}</strong></td>
            <td>Alumnos con transacción o estimado activo</td>
        </tr>
        <tr style="background: rgba(220, 53, 69, 0.2);">
            <td><i class="fas fa-user-times text-danger me-2"></i>Bajas (acumuladas)</td>
            <td class="text-end text-danger"><strong>${datos.resumen.total_bajas}</strong></td>
            <td>Alumnos dados de baja desde inicio</td>
        </tr>
        <tr style="background: rgba(255, 165, 0, 0.2);">
            <td><i class="fas fa-chart-line text-warning me-2"></i>Neto Acumulado</td>
            <td class="text-end text-warning"><strong>${datos.resumen.neto}</strong></td>
            <td>Altas totales menos bajas totales</td>
        </tr>
    `;
    
    tbody.innerHTML = html;
}
```

---

## Recomendación Final

**Recomiendo OPCIÓN B + OPCIÓN C:**

1. **Modificar TransaccionesController.php** para retornar 3 métricas claras:
   - `total_alumnos`: Todos inscritos (41)
   - `alumnos_activos_reales`: Con pago en ese mes (X)
   - `alumnos_activos_estimado`: Estimado activos (43)

2. **Actualizar reportes.html** para mostrar:
   - Un indicador que diga "Inscritos" (41)
   - Otro que diga "Activos Este Mes" (43)
   - Una tabla descriptiva que explique la diferencia

3. **Después de limpiar duplicados**, el número debería:
   - Bajar de 43 a ~39 alumnos activos
   - O mantenerse si la lógica es correcta

---

## Impacto de Duplicados en el Reporte

**Los duplicados identificados AFECTAN el cálculo así:**

| Alumno | Duplicados | Impacto en "Activos" |
|--------|-----------|---|
| Joshua (IDs 1555, 1612) | 2 registros en enero | ±1 alumno (si se cuenta como 1 o 2) |
| Gerardo (IDs 1537, 1614) | 2 registros en enero | ±1 alumno |
| Guadalupe (ID 1576) | 1 duplicado | ±1 alumno |
| Itzel (IDs 1610, 1611) | 2 extra duplicados | ±2 alumnos |
| Leonardo (ID 1556) | 1 sin vincular | 0 (no cuenta sin cliente_id) |
| **TOTAL IMPACTO** | ~6 registros extra | **±5 alumnos** |

**Después de limpiar duplicados:**
- Alumnos activos podría bajar de 43 a 38-39
- Esto haría el reporte más consistente con 41 inscritos

