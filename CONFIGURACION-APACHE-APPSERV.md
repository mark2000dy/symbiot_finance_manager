# Configuración de Apache en AppServ para Sistema de Gastos

## 🚨 Problema Identificado

Los archivos `.htaccess` causaban **error 500** en tu instalación de AppServ. Esto indica que Apache tiene `AllowOverride None` o una configuración restrictiva que no permite directivas en `.htaccess`.

**Solución**: Configurar Apache directamente en `httpd.conf` en lugar de usar `.htaccess`.

---

## ✅ PASO 1: Restaurar el Sitio (URGENTE)

### Ejecutar git pull

```bash
cd C:\AppServ\www\symbiot\symbiot_finance_manager
git pull origin claude/fix-database-connection-01E7WB5gndv9499pL7DWsfo3
```

Esto eliminará los archivos `.htaccess` problemáticos.

### Verificar que el sitio vuelva a funcionar

Accede a:
```
http://localhost/symbiot/symbiot_finance_manager/gastos/login.html
```

**Debería cargar la página de login sin error 500.**

⚠️ **IMPORTANTE**: La página cargará, pero el login aún no funcionará porque falta configurar PATH_INFO en Apache.

---

## ✅ PASO 2: Configurar Apache para PATH_INFO

### A. Abrir httpd.conf

Ubicación:
```
C:\AppServ\Apache24\conf\httpd.conf
```

Abre este archivo con un editor de texto como **Notepad++** o el Bloc de notas (ejecutar como Administrador).

### B. Habilitar módulos requeridos

Busca estas líneas y **elimina el `#` del inicio** si lo tienen:

```apache
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule headers_module modules/mod_headers.so
```

**Antes** (deshabilitado):
```apache
#LoadModule rewrite_module modules/mod_rewrite.so
```

**Después** (habilitado):
```apache
LoadModule rewrite_module modules/mod_rewrite.so
```

### C. Configurar el directorio de tu proyecto

Busca la sección `<Directory>` para tu directorio web. Debería verse algo así:

```apache
<Directory "C:/AppServ/www">
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>
```

**Agrega** inmediatamente después de esa sección, una nueva sección específica para el directorio de gastos:

```apache
# Configuración para Sistema de Gastos Symbiot
<Directory "C:/AppServ/www/symbiot/symbiot_finance_manager/gastos">
    # Habilitar PATH_INFO para routing de API
    AcceptPathInfo On

    # Permitir .htaccess en el futuro (opcional)
    AllowOverride None

    # Permitir acceso
    Require all granted

    # Index por defecto
    DirectoryIndex login.html index.php index.html
</Directory>

# Configuración específica para el API
<Directory "C:/AppServ/www/symbiot/symbiot_finance_manager/gastos/api">
    # Habilitar PATH_INFO para permitir /index.php/login
    AcceptPathInfo On

    # CORS headers
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"

    Require all granted
</Directory>
```

### D. Guardar y reiniciar Apache

1. **Guardar** el archivo `httpd.conf`
2. **Reiniciar Apache** desde el panel de AppServ o desde Servicios de Windows

---

## ✅ PASO 3: Verificar la Configuración

### Test 1: Verificar que el sitio carga

```
http://localhost/symbiot/symbiot_finance_manager/gastos/login.html
```

✅ Debe cargar sin error 500

### Test 2: Verificar PATH_INFO

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

Si ves `"PATH_INFO": "/hello/world"`, ¡PATH_INFO está funcionando! ✅

Si ves `"PATH_INFO": "NOT SET"`, revisa la configuración en httpd.conf.

### Test 3: Verificar Health Check del API

```
http://localhost/symbiot/symbiot_finance_manager/gastos/api/index.php/health
```

**Resultado esperado**:
```json
{
    "success": true,
    "message": "API funcionando correctamente"
}
```

### Test 4: Verificar Auto-detección de Base Path

Abre la consola del navegador en `login.html` y verifica:

```
✅ API Client v3.1.2 initialized
📂 Base Path (auto-detected): /symbiot/symbiot_finance_manager/gastos
🌐 API URL: /symbiot/symbiot_finance_manager/gastos/api/index.php
✅ Servidor conectado correctamente
```

### Test 5: Probar el Login

Intenta hacer login con tus credenciales.

✅ **Debería funcionar sin error 404 ni error de conexión**

---

## 🔧 Configuración Completa de httpd.conf

Si quieres ver el bloque completo, aquí está:

```apache
# ============================================
# Módulos requeridos (verificar que estén habilitados)
# ============================================
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule headers_module modules/mod_headers.so

# ============================================
# Configuración del directorio web general
# ============================================
<Directory "C:/AppServ/www">
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>

# ============================================
# Configuración específica para Sistema de Gastos
# ============================================
<Directory "C:/AppServ/www/symbiot/symbiot_finance_manager/gastos">
    AcceptPathInfo On
    AllowOverride None
    Require all granted
    DirectoryIndex login.html index.php index.html
</Directory>

<Directory "C:/AppServ/www/symbiot/symbiot_finance_manager/gastos/api">
    AcceptPathInfo On
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Require all granted
</Directory>
```

---

## 🆘 Troubleshooting

### Error: "Syntax error on line X"

Si Apache no inicia después de editar httpd.conf:

1. Revisa que no hayas eliminado paréntesis o comillas
2. Verifica que cada `<Directory>` tenga su `</Directory>` correspondiente
3. Prueba la configuración con:
   ```
   C:\AppServ\Apache24\bin\httpd.exe -t
   ```

### Error: PATH_INFO sigue en "NOT SET"

1. Verifica que `AcceptPathInfo On` esté en la sección correcta de `<Directory>`
2. Asegúrate de haber reiniciado Apache después de los cambios
3. Verifica la ruta del directorio (debe coincidir exactamente)

### Error: "Header: command not found"

Si aparece error relacionado con `Header`:

1. Verifica que `mod_headers` esté habilitado:
   ```apache
   LoadModule headers_module modules/mod_headers.so
   ```

### Sigue sin funcionar

Si después de todo esto sigue sin funcionar:

1. Comparte el contenido del archivo de logs:
   ```
   C:\AppServ\Apache24\logs\error.log
   ```

2. Comparte lo que aparece en la consola del navegador

3. Comparte el resultado de `path-info-test.php`

---

## 📝 Resumen

1. ✅ **git pull** para eliminar .htaccess problemáticos
2. ✅ Editar **httpd.conf** para habilitar módulos
3. ✅ Agregar secciones `<Directory>` para gastos y gastos/api
4. ✅ **Reiniciar Apache**
5. ✅ Probar **path-info-test.php**
6. ✅ Probar el **login**

---

## 🌐 Para Producción (symbiot.com.mx)

En producción con Plesk, los `.htaccess` **SÍ deberían funcionar** porque Plesk configura Apache con `AllowOverride All` por defecto.

Si quieres usar `.htaccess` en producción, estos son los archivos recomendados:

**`gastos/api/.htaccess`**:
```apache
AcceptPathInfo On
```

**`gastos/.htaccess`**:
```apache
DirectoryIndex login.html index.php index.html
AddDefaultCharset UTF-8
```

Estos archivos simples deberían funcionar en Plesk sin problemas.
