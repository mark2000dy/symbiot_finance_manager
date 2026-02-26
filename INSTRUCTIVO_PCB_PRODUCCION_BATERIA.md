# Instructivo — Migración Voltaje Batería para PCB de Producción (Tarjeta Negra)

## Contexto

El sensor **XXXX01.A (tarjeta azul)** usa GPIO16 para leer el voltaje de batería.
GPIO16 = **ADC2_CH5**, que es bloqueado por el stack WiFi del ESP32-S3 mientras la
radio está activa. Resultado: `analogRead()` devuelve 0 con WiFi activo, y el valor
reportado en heartbeat queda congelado en la lectura inicial del `setup()`.

El rediseño del PCB de producción (tarjeta negra) es la oportunidad de resolver esto
de raíz, sin workarounds de software.

---

## Cambios requeridos en el PCB de producción

### 1. Mover traza BAT_SENS de GPIO16 → GPIO9

| | Tarjeta azul (actual) | Tarjeta negra (producción) |
|---|---|---|
| Pin ESP32 | GPIO16 (ADC2_CH5) | **GPIO9 (ADC1_CH8)** |
| Funciona con WiFi activo | ❌ No | ✅ Sí |

- GPIO9 está libre en el firmware actual (sin asignación)
- Verificar en layout que no hay traza existente en GPIO9 antes de rutearlo
- Alternativas igualmente válidas: GPIO6, GPIO7, GPIO8 (todos ADC1, todos libres)

### 2. Resistencias del divisor de voltaje

| Board | R_top | R_bottom | V_out @ 8.4V (carga completa) |
|-------|-------|----------|-------------------------------|
| Azul (actual, 22k+15k) | 22 kΩ | 15 kΩ | 3.41 V (roza el límite 3.3V) |
| **Negra (producción, 18k+10k)** | **18 kΩ** | **10 kΩ** | **3.00 V ✅** |

La combinación 18k + 10k da margen cómodo en todo el rango de la batería 2S Li-ion
(6.0 V – 8.4 V).

---

## Cambios requeridos en firmware (`main.cpp`)

### Opción A — Firmware único con `#define` por revisión (recomendada)

```cpp
// ~línea 165 — seleccionar según board a flashear
#define HW_REV_BLUE    // ← activo para XXXX01.A
// #define HW_REV_BLACK // ← descomentar para producción

#ifdef HW_REV_BLUE
  #define BATTERY_PIN   16              // ADC2 — solo válido antes de conectar WiFi
  #define VDIV_FACTOR   (37.0f / 15.0f) // 22k + 15k
#else
  #define BATTERY_PIN   9               // ADC1 — funciona con WiFi activo ✓
  #define VDIV_FACTOR   (28.0f / 10.0f) // 18k + 10k
#endif
```

En `helper_getVoltage()`, reemplazar la línea de la fórmula por:

```cpp
float batteryVoltage = voltageAtPin * VDIV_FACTOR;
```

### Opción B — Firmware separado por board (más simple si no convergen)

Solo cambiar dos líneas:

```cpp
#define BATTERY_PIN 9                          // línea 166
float batteryVoltage = voltageAtPin * 2.8f;    // en helper_getVoltage()
```

---

## Fórmulas de referencia

```
V_bat = V_adc * (R_top + R_bottom) / R_bottom

Azul  → V_bat = V_adc * (22 + 15) / 15 = V_adc * 2.467
Negra → V_bat = V_adc * (18 + 10) / 10 = V_adc * 2.800
```

---

## Checklist antes de flashear producción

- [ ] PCB ruteado con BAT_SENS en GPIO9 (o GPIO6/7/8)
- [ ] Resistencias 18kΩ y 10kΩ soldadas y verificadas con multímetro
- [ ] `#define BATTERY_PIN` actualizado al nuevo pin
- [ ] `VDIV_FACTOR` o fórmula actualizada a `× 2.8`
- [ ] `HW_REV_BLACK` activo (si se usa Opción A)
- [ ] Verificar con `SELECT bateria_mv, recorded_at FROM sensor_telemetry ORDER BY recorded_at DESC LIMIT 20` que el valor baja gradualmente al usar batería

---

## Nota sobre tarjeta azul XXXX01.A

El firmware actual para XXXX01.A **es correcto** con la fórmula `× 2.467` (22k+15k).
La limitación de ADC2/WiFi persiste: el valor reportado en heartbeat corresponde
a la lectura tomada en `setup()` antes de conectar WiFi, y no se actualiza en tiempo
real. Esto es aceptable mientras no haya revisión de hardware de la tarjeta azul.
