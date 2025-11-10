# 🔧 CORRECCIÓN DE RUTAS - Solución Definitiva para AppServ

## 🎯 Problema Identificado

**Error:** `Failed to load resource: 404 (Not Found)` + `Unexpected token '<'`

**Causa:** Las rutas de la API estaban hardcodeadas como `/gastos/api/login` pero el proyecto está en:
```
C:\AppServ\www\symbiot\symbiot_finance_manager\
```

Por lo tanto, la ruta correcta debe ser:
```
/symbiot/symbiot_finance_manager/gastos/api/index.php/login
```

---

## ✅ Solución Implementada

### 1. Archivo JavaScript de Configuración Automática

**Archivo creado:** `gastos/assets/api-config.js`

Este archivo:
- ✅ Detecta automáticamente la ruta base del proyecto
- ✅ Funciona en cualquier ubicación (localhost, subdirectorios, dominios)
- ✅ Proporciona funciones helper para hacer peticiones API
- ✅ Logging automático de todas las peticiones

**Funciones disponibles:**
```javascript
window.APP_BASE_PATH   // Ej: "/symbiot/symbiot_finance_manager"
window.API_BASE_URL    // Ej: "/symbiot/symbiot_finance_manager/gastos/api/index.php"

window.buildApiUrl(endpoint)  // Construir URL completa
window.apiFetch(endpoint, options)  // Hacer petición API con logging
```

### 2. Archivos HTML Modificados

**Archivo:** `gastos/login.html`

Cambios realizados:
1. ✅ Incluido `<script src="assets/api-config.js"></script>`
2. ✅ Reemplazado `fetch('/gastos/api/login')` por `window.apiFetch('login')`
3. ✅ Reemplazado `fetch('/gastos/api/health')` por `window.apiFetch('health')`
4. ✅ Corregida redirección de `'/gastos/dashboard.html'` a `'dashboard.html'` (relativa)

---

## 📋 Archivos que Necesitan la Misma Corrección

Los siguientes archivos tienen el mismo problema y deben actualizarse:

### ⚠️ Pendientes de Corrección:

1. **gastos/dashboard.html**
   - Buscar: `/gastos/api/`
   - Reemplazar con: `window.apiFetch()`

2. **gastos/gastos.html**
   - Buscar: `/gastos/api/`
   - Reemplazar con: `window.apiFetch()`

3. **gastos/ingresos.html**
   - Buscar: `/gastos/api/`
   - Reemplazar con: `window.apiFetch()`

4. **gastos/reportes.html**
   - Buscar: `/gastos/api/`
   - Reemplazar con: `window.apiFetch()`

### Pasos para Corregir Cada Archivo:

1. **Agregar el script de configuración** en el `<head>` o antes de los scripts:
   ```html
   <script src="assets/api-config.js"></script>
   ```

2. **Buscar todas las llamadas fetch** que usen `/gastos/api/`:
   ```javascript
   // ❌ ANTES (ruta hardcodeada)
   fetch('/gastos/api/transacciones', {
       method: 'GET',
       headers: { 'Content-Type': 'application/json' }
   })

   // ✅ DESPUÉS (ruta dinámica)
   window.apiFetch('transacciones', {
       method: 'GET'
   })
   ```

3. **Actualizar las respuestas** para usar la nueva estructura:
   ```javascript
   // ❌ ANTES
   const response = await fetch('/gastos/api/endpoint');
   const data = await response.json();

   // ✅ DESPUÉS
   const { response, data } = await window.apiFetch('endpoint');
   ```

---

## 🧪 Verificación

### Paso 1: Actualizar desde GitHub

```bash
cd C:\AppServ\www\symbiot\symbiot_finance_manager
git pull
```

### Paso 2: Abrir DevTools del Navegador

1. Abre: `http://localhost/symbiot/symbiot_finance_manager/gastos/login.html`
2. Presiona **F12** para abrir DevTools
3. Ve a la pestaña **Console**

### Paso 3: Verificar Logs

Deberías ver:
```
🔧 Configuración de API:
   Base Path: /symbiot/symbiot_finance_manager
   API URL: /symbiot/symbiot_finance_manager/gastos/api/index.php
```

### Paso 4: Probar Health Check

Al cargar la página, debería aparecer:
```
🌐 API Request: GET /symbiot/symbiot_finance_manager/gastos/api/index.php/health
📡 API Response [200]: {status: "OK", ...}
✅ Servidor conectado: {...}
```

### Paso 5: Probar Login

Al hacer login, debería aparecer:
```
🔐 Intentando login con: marco@symbiot.com
🌐 API Request: POST /symbiot/symbiot_finance_manager/gastos/api/index.php/login
📡 API Response [200]: {success: true, user: {...}}
✅ Login exitoso para: Marco Polo
```

---

## ❌ Errores Comunes y Soluciones

### Error: "API principal no encontrada"

**Síntoma:** Al acceder a `/gastos/api/index.php` aparece un error JSON.

**Causa:** El archivo `api/index.php` no existe o no es accesible.

**Solución:**
```bash
# Verificar que existe
dir C:\AppServ\www\symbiot\symbiot_finance_manager\api\index.php

# Verificar permisos (debería ser legible)
```

### Error: "Database connection failed"

**Síntoma:** Health check dice `"database": "disconnected"`.

**Causa:** Credenciales incorrectas o MySQL no está corriendo.

**Solución:**
1. Abre `api/config/database.php`
2. Verifica las credenciales (en AppServ: usuario=`root`, password=`` vacío)
3. Verifica que MySQL esté corriendo en el Panel de AppServ

### Error: "ReferenceError: window.apiFetch is not defined"

**Síntoma:** Error en consola del navegador.

**Causa:** El archivo `api-config.js` no se cargó.

**Solución:**
1. Verifica que existe: `gastos/assets/api-config.js`
2. Verifica que está incluido en el HTML:
   ```html
   <script src="assets/api-config.js"></script>
   ```
3. Abre DevTools → Network → Busca `api-config.js` (debe cargar con código 200)

### Error 404 en api-config.js

**Síntoma:** `Failed to load resource: api-config.js (404)`

**Causa:** Ruta incorrecta del archivo.

**Solución:**
```bash
# Crear el directorio si no existe
mkdir C:\AppServ\www\symbiot\symbiot_finance_manager\gastos\assets

# Copiar el archivo (hacer git pull para obtenerlo)
git pull origin claude/nodejs-to-php-conversion-011CUu6AGjXpGytKixX9goTW
```

---

## 🎯 URLs Correctas para tu Entorno

Después de las correcciones, estas URLs deberían funcionar:

```
✅ Login:
http://localhost/symbiot/symbiot_finance_manager/gastos/login.html

✅ Health Check API:
http://localhost/symbiot/symbiot_finance_manager/gastos/api/index.php/health

✅ Test PHP:
http://localhost/symbiot/symbiot_finance_manager/gastos/api/test.php

✅ Test directo BD:
http://localhost/symbiot/symbiot_finance_manager/gastos/api/direct-test.php?action=health
```

---

## 🔄 VERSION 3.0 - INLINE PATH DETECTION

### ¿Qué cambió en v3.0?

**Problema de v2.0:** El archivo `api-config.js` a veces no se cargaba correctamente debido a:
- Cache del navegador
- Rutas relativas incorrectas
- Dependencia de archivo externo

**Solución v3.0:** Todo el código de detección de rutas ahora está **INLINE** (embebido directamente en el HTML)

### Cómo Verificar que Tienes v3.0:

1. **Abre** `http://localhost/symbiot/symbiot_finance_manager/gastos/login.html`

2. **Deberías ver** debajo del logo:
   ```
   ✅ VERSION 3.0 - INLINE PATH DETECTION
   ```

3. **En la consola del navegador (F12)** deberías ver:
   ```
   🚀 LOGIN PAGE v3.0 - INLINE PATH DETECTION
   📍 Current page path: /symbiot/symbiot_finance_manager/gastos/login.html
   ✅ Base path detected: /symbiot/symbiot_finance_manager
   📡 API Configuration:
      APP_BASE_PATH: /symbiot/symbiot_finance_manager
      API_BASE_URL: /symbiot/symbiot_finance_manager/gastos/api/index.php
   ```

4. **En la página** deberías ver un mensaje azul mostrando:
   ```
   🔧 Configuración Detectada:
   Ruta Base: /symbiot/symbiot_finance_manager
   API URL: /symbiot/symbiot_finance_manager/gastos/api/index.php
   Health Check: /symbiot/symbiot_finance_manager/gastos/api/index.php/health
   ```

### Si NO ves estos indicadores:

1. **Hacer git pull:**
   ```bash
   cd C:\AppServ\www\symbiot\symbiot_finance_manager
   git pull origin claude/nodejs-to-php-conversion-011CUu6AGjXpGytKixX9goTW
   ```

2. **Limpiar cache del navegador:**
   - Presiona `Ctrl + Shift + Del`
   - Selecciona "Imágenes y archivos en caché"
   - Haz clic en "Borrar datos"
   - O simplemente presiona `Ctrl + F5` para recarga forzada

3. **Verificar el archivo:**
   ```bash
   type gastos\login.html | findstr "VERSION 3.0"
   ```
   Debería mostrar: `✅ VERSION 3.0 - INLINE PATH DETECTION`

---

## 📝 Checklist de Verificación

- [x] ✅ login.html corregido v3.0 (INLINE path detection)
- [x] ✅ api-config.js creado (v2.0 - deprecado pero mantenido por compatibilidad)
- [ ] ⏳ dashboard.html pendiente de corrección
- [ ] ⏳ gastos.html pendiente de corrección
- [ ] ⏳ ingresos.html pendiente de corrección
- [ ] ⏳ reportes.html pendiente de corrección

---

## 🚀 Próximos Pasos

1. **Actualizar código desde GitHub:**
   ```bash
   git pull
   ```

2. **Probar el login:**
   - Abrir: `http://localhost/symbiot/symbiot_finance_manager/gastos/login.html`
   - Credenciales: `marco@symbiot.com` / `admin123`
   - Verificar que no aparezca error 404
   - Verificar que el login funcione

3. **Si el login funciona correctamente**, necesitaré corregir los otros archivos HTML (dashboard, gastos, ingresos, reportes) de la misma manera.

4. **Notificarme si sigues viendo errores** y compartiré los logs de la consola.

---

**Versión:** 2.0.0-PHP
**Fecha:** 2025-11-07
**Estado:** login.html corregido, pendientes otros archivos HTML
