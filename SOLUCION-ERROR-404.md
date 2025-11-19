# Solución al Error 404 en Login - Sistema de Gastos Symbiot

## 📋 Resumen del Problema

Se identificaron **DOS problemas** que causaban el error 404:

### Problema #1: Base Path Incorrecta ✅ **SOLUCIONADO**
- **Síntoma**: Error 404 en `/gastos/api/index.php/health`
- **Causa**: El código tenía hardcodeado `APP_BASE_PATH = '/gastos'`
- **Impacto**:
  - En producción (symbiot.com.mx): ✅ Funcionaba
  - En local (/symbiot/symbiot_finance_manager/gastos): ❌ Fallaba

### Problema #2: PATH_INFO no configurado en Apache ⚠️ **REQUIERE ACCIÓN**
- **Síntoma**: Apache no procesa correctamente `/index.php/login`
- **Causa**: Apache necesita configuración adicional
- **Status**: Archivos .htaccess creados, pero Apache necesita habilitarse

---

## ✅ Solución Implementada (Problema #1)

### Cambios Realizados

#### 1. API Client v3.1.2 con Auto-Detección
**Archivo**: `gastos/assets/js/api-client.js`

**Antes** (hardcoded):
```javascript
const APP_BASE_PATH = '/gastos';  // ❌ Solo funciona en producción
```

**Después** (detección automática):
```javascript
function detectBasePath() {
    const currentPath = window.location.pathname;
    const gastosIndex = currentPath.indexOf('/gastos/');

    if (gastosIndex !== -1) {
        return currentPath.substring(0, gastosIndex + 7);
    }
    return '/gastos'; // fallback
}

const APP_BASE_PATH = detectBasePath(); // ✅ Funciona en cualquier entorno
```

**Ejemplos de detección**:
- Local: `/symbiot/symbiot_finance_manager/gastos/login.html` → Base: `/symbiot/symbiot_finance_manager/gastos`
- Producción: `/gastos/login.html` → Base: `/gastos`
- Otro: `/proyecto/gastos/dashboard.html` → Base: `/proyecto/gastos`

#### 2. Archivos Actualizados
- ✅ `gastos/assets/js/api-client.js` (v3.1.1 → v3.1.2)
- ✅ `gastos/login.html`
- ✅ `gastos/dashboard.html`
- ✅ `gastos/gastos.html`
- ✅ `gastos/ingresos.html`
- ✅ `gastos/reportes.html`

---

## ⚠️ Acción Requerida (Problema #2)

### Configurar Apache para PATH_INFO

#### En Local (Windows - AppServ)

**Paso 1**: Actualizar el código
```bash
git pull origin claude/fix-database-connection-01E7WB5gndv9499pL7DWsfo3
```

**Paso 2**: Configurar Apache
1. Abrir `C:\AppServ\Apache24\conf\httpd.conf`

2. Verificar que estas líneas **NO** estén comentadas:
   ```apache
   LoadModule rewrite_module modules/mod_rewrite.so
   LoadModule headers_module modules/mod_headers.so
   ```

3. Buscar `<Directory "C:/AppServ/www">` y cambiar:
   ```apache
   <Directory "C:/AppServ/www">
       AllowOverride All      # ← Debe ser "All", no "None"
       Require all granted
   </Directory>
   ```

4. **Guardar y reiniciar Apache**

**Paso 3**: Verificar PATH_INFO
Accede a:
```
http://localhost/symbiot/symbiot_finance_manager/gastos/api/path-info-test.php/hello/world
```

**Resultado esperado**:
```json
{
    "overall_status": "OK",
    "server_vars": {
        "PATH_INFO": "/hello/world"
    }
}
```

Si `PATH_INFO` es "NOT SET", revisa la configuración de Apache.

**Paso 4**: Probar el login
```
http://localhost/symbiot/symbiot_finance_manager/gastos/login.html
```

---

## 🔍 Cómo Verificar que Funciona

### En la Consola del Navegador

Cuando abras `login.html`, deberías ver:

```
✅ API Client v3.1.2 initialized
📂 Base Path (auto-detected): /symbiot/symbiot_finance_manager/gastos
🌐 API URL: /symbiot/symbiot_finance_manager/gastos/api/index.php
🔍 Current location: /symbiot/symbiot_finance_manager/gastos/login.html
```

**Verificar**:
- ✅ Base Path debe contener tu ruta local completa
- ✅ API URL debe ser la concatenación correcta
- ✅ No debe aparecer solo `/gastos` (eso era el problema anterior)

### Health Check Exitoso

Cuando la página carga, debe mostrar:
```
✅ Servidor conectado correctamente
```

Si muestra "Sin conexión al servidor", revisa:
1. ¿El Base Path se detectó correctamente? (ver consola)
2. ¿Apache tiene AllowOverride All? (httpd.conf)
3. ¿mod_rewrite está habilitado? (httpd.conf)
4. ¿Apache se reinició después de los cambios?

---

## 🧪 Scripts de Diagnóstico

### 1. Verificar Configuración de Base de Datos
```
http://localhost/symbiot/symbiot_finance_manager/gastos/api/db-test.php
```

**Debe mostrar**:
```json
{
    "overall_status": "SUCCESS",
    "connection_test": { "status": "SUCCESS" },
    "database_test": { "status": "SUCCESS" },
    "usuarios_table": { "status": "SUCCESS", "total_users": 4 }
}
```

### 2. Verificar PATH_INFO
```
http://localhost/symbiot/symbiot_finance_manager/gastos/api/path-info-test.php/hello/world
```

**Debe mostrar**:
```json
{
    "overall_status": "OK",
    "server_vars": {
        "PATH_INFO": "/hello/world"
    }
}
```

### 3. Health Check del API
```
http://localhost/symbiot/symbiot_finance_manager/gastos/api/index.php/health
```

**Debe mostrar**:
```json
{
    "success": true,
    "message": "API funcionando correctamente",
    "version": "3.1.0"
}
```

---

## 🌐 En Producción (symbiot.com.mx)

### Paso 1: Subir Archivos
Subir todos los archivos modificados al servidor:
- `gastos/assets/js/api-client.js`
- `gastos/login.html`
- `gastos/dashboard.html`
- `gastos/gastos.html`
- `gastos/ingresos.html`
- `gastos/reportes.html`
- `gastos/api/.htaccess`
- `gastos/.htaccess`

### Paso 2: Verificar
Acceder a:
```
https://symbiot.com.mx/gastos/api/path-info-test.php/hello/world
```

En Plesk, el .htaccess debería funcionar automáticamente.

### Paso 3: Probar Login
```
https://symbiot.com.mx/gastos/login.html
```

---

## 📊 Resumen de Archivos Modificados

### Archivos de Configuración Creados
- ✅ `gastos/includes/config.php` - Configuración de BD
- ✅ `gastos/includes/Database.php` - Clase de conexión
- ✅ `gastos/includes/Session.php` - Manejo de sesiones
- ✅ `gastos/api/.htaccess` - Configuración Apache para API
- ✅ `gastos/.htaccess` - Configuración general

### Archivos de Código Modificados
- ✅ `gastos/assets/js/api-client.js` - Auto-detección de base path
- ✅ `gastos/login.html` - Versión actualizada
- ✅ `gastos/dashboard.html` - Versión actualizada
- ✅ `gastos/gastos.html` - Versión actualizada
- ✅ `gastos/ingresos.html` - Versión actualizada
- ✅ `gastos/reportes.html` - Versión actualizada

### Scripts de Diagnóstico
- ✅ `gastos/api/db-test.php` - Verificar conexión a BD
- ✅ `gastos/api/path-info-test.php` - Verificar PATH_INFO

---

## 🆘 Troubleshooting

### Error: "Sin conexión al servidor"

**Causa posible**: PATH_INFO no configurado
**Solución**: Seguir los pasos de configuración de Apache arriba

### Error: Base Path incorrecto en consola

**Ejemplo**: Muestra `/gastos` pero debería ser `/symbiot/symbiot_finance_manager/gastos`

**Causa**: Cache del navegador
**Solución**:
1. Ctrl + Shift + R (recarga forzada)
2. Verificar que el archivo tenga `?v=3.1.2` en la URL

### Error: "Error de conexión a la base de datos"

**Solución**: Verificar credenciales en `gastos/includes/config.php`

---

## ✅ Checklist Final

- [ ] Actualizar código: `git pull`
- [ ] Configurar Apache: `AllowOverride All` en httpd.conf
- [ ] Habilitar módulos: `mod_rewrite` y `mod_headers`
- [ ] Reiniciar Apache
- [ ] Probar `db-test.php` → SUCCESS
- [ ] Probar `path-info-test.php` → PATH_INFO visible
- [ ] Probar `login.html` → Base path auto-detectado correctamente
- [ ] Hacer login → Sin error 404

---

## 📞 Contacto

Si después de seguir todos los pasos el problema persiste:

1. Comparte el resultado de `db-test.php`
2. Comparte el resultado de `path-info-test.php`
3. Comparte lo que aparece en la consola del navegador al abrir login.html
4. Verifica los logs de Apache: `C:\AppServ\Apache24\logs\error.log`
