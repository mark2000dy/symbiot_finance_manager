# ⚠️ Solución para AppServ - Configuración sin .htaccess

## Problema Identificado

El `.htaccess` no está funcionando correctamente en AppServ 9.3.0. La ruta completa del proyecto es:
```
C:\AppServ\www\symbiot\symbiot_finance_manager\
```

Por lo tanto, las URLs correctas son:
```
http://localhost/symbiot/symbiot_finance_manager/gastos/login.html
http://localhost/symbiot/symbiot_finance_manager/gastos/api/health
```

## Solución Implementada

He modificado los archivos PHP para que funcionen **sin necesidad de .htaccess**:

### 1. Archivos de Prueba Creados

#### A. Test Básico PHP
```
URL: http://localhost/symbiot/symbiot_finance_manager/gastos/api/test.php
```
Este archivo verifica que PHP funcione y muestra la configuración del servidor.

#### B. Test Directo de la API
```
URL: http://localhost/symbiot/symbiot_finance_manager/gastos/api/direct-test.php?action=health
```
Este archivo prueba la conexión a la base de datos sin depender de routing.

### 2. Archivos Modificados

#### `api/index.php`
- Ahora detecta automáticamente la ruta base
- Funciona tanto con `.htaccess` como sin él
- Maneja correctamente subdirectorios

#### `gastos/api/index.php`
- Verifica que el archivo principal exista
- Muestra errores detallados si hay problemas
- Funciona en cualquier ubicación

## Pasos para Probar

### Paso 1: Verificar PHP Básico

Abre en tu navegador:
```
http://localhost/symbiot/symbiot_finance_manager/gastos/api/test.php
```

**Resultado esperado:**
```json
{
  "status": "OK",
  "message": "PHP está funcionando correctamente",
  "php_version": "8.x.x",
  ...
}
```

### Paso 2: Verificar Base de Datos

Primero, **configurar credenciales** en:
```
C:\AppServ\www\symbiot\symbiot_finance_manager\api\config\database.php
```

Cambiar estas líneas según tu configuración de AppServ:
```php
$this->host = 'localhost';           // o '127.0.0.1'
$this->database = 'gastos_app_db';   // nombre de tu BD
$this->username = 'root';            // usuario de MySQL (AppServ usa 'root' por defecto)
$this->password = '';                // contraseña (AppServ suele ser vacía o 'root')
```

Luego probar:
```
http://localhost/symbiot/symbiot_finance_manager/gastos/api/direct-test.php?action=health
```

**Resultado esperado:**
```json
{
  "status": "OK",
  "version": "2.0.0-PHP",
  "services": {
    "database": "connected",
    "tables": "ready"
  }
}
```

### Paso 3: Crear la Base de Datos

Si no existe la base de datos, abre **phpMyAdmin** en AppServ:
```
http://localhost/phpMyAdmin/
```

Ejecuta este SQL:
```sql
CREATE DATABASE gastos_app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario (opcional, puedes usar root)
-- CREATE USER 'gastos_user'@'localhost' IDENTIFIED BY 'Gastos2025!';
-- GRANT ALL PRIVILEGES ON gastos_app_db.* TO 'gastos_user'@'localhost';
-- FLUSH PRIVILEGES;
```

Luego importa el schema si existe en:
```
C:\AppServ\www\symbiot\symbiot_finance_manager\database\schema.sql
```

### Paso 4: Probar la API Principal

Una vez que el health check funcione, prueba la API completa:
```
http://localhost/symbiot/symbiot_finance_manager/gastos/api/index.php?health
```

### Paso 5: Probar el Login

Abre:
```
http://localhost/symbiot/symbiot_finance_manager/gastos/login.html
```

**Credenciales por defecto:**
- Email: `admin@symbiot.com`
- Password: `admin123`

## Configuración de AppServ

### Verificar mod_rewrite (Opcional)

Si quieres usar `.htaccess`, verifica que `mod_rewrite` esté habilitado:

1. Abre `C:\AppServ\Apache24\conf\httpd.conf`
2. Busca y descomenta (quitar el #):
   ```apache
   LoadModule rewrite_module modules/mod_rewrite.so
   ```
3. Busca `AllowOverride None` y cámbialo a:
   ```apache
   AllowOverride All
   ```
4. Reinicia Apache desde el panel de AppServ

### Verificar PHP

1. Abre `C:\AppServ\php8\php.ini`
2. Busca y descomenta (quitar el ;):
   ```ini
   extension=pdo_mysql
   extension=mbstring
   ```
3. Reinicia Apache

## Solución Alternativa: Sin .htaccess

Si `.htaccess` no funciona, puedes acceder directamente a:

```
# Health Check
http://localhost/symbiot/symbiot_finance_manager/gastos/api/index.php/health

# Login (en el HTML, cambiar la URL del endpoint)
Editar: C:\AppServ\www\symbiot\symbiot_finance_manager\gastos\login.html
Cambiar: const API_BASE_URL = '/gastos/api';
Por: const API_BASE_URL = '/symbiot/symbiot_finance_manager/gastos/api/index.php';
```

## Troubleshooting

### Error: "API principal no encontrada"

**Causa:** Las rutas no coinciden.

**Solución:**
1. Verifica que `api/index.php` exista en:
   ```
   C:\AppServ\www\symbiot\symbiot_finance_manager\api\index.php
   ```
2. Revisa los permisos de lectura del archivo

### Error: "Database connection failed"

**Causa:** Credenciales incorrectas o MySQL no está corriendo.

**Solución:**
1. Abre el Panel de AppServ
2. Verifica que MySQL esté iniciado (botón verde)
3. Verifica credenciales en `api/config/database.php`
4. Prueba conectarte con phpMyAdmin para verificar usuario/contraseña

### Error 404: "Not Found"

**Causa:** La ruta de acceso es incorrecta.

**Solución:**
Usa la ruta completa incluyendo el subdirectorio:
```
✅ http://localhost/symbiot/symbiot_finance_manager/gastos/api/test.php
❌ http://localhost/gastos/api/test.php
```

## URLs Corregidas para tu Entorno

```
# Frontend
http://localhost/symbiot/symbiot_finance_manager/gastos/login.html
http://localhost/symbiot/symbiot_finance_manager/gastos/dashboard.html

# API (directa, sin .htaccess)
http://localhost/symbiot/symbiot_finance_manager/gastos/api/index.php/health
http://localhost/symbiot/symbiot_finance_manager/gastos/api/index.php/login (POST)
http://localhost/symbiot/symbiot_finance_manager/gastos/api/index.php/transacciones

# Tests
http://localhost/symbiot/symbiot_finance_manager/gastos/api/test.php
http://localhost/symbiot/symbiot_finance_manager/gastos/api/direct-test.php?action=health
```

## Próximos Pasos

1. ✅ Probar `test.php` para verificar PHP
2. ✅ Configurar credenciales de BD en `api/config/database.php`
3. ✅ Crear la base de datos en phpMyAdmin
4. ✅ Probar `direct-test.php?action=health`
5. ✅ Si todo funciona, probar el login

---

**Nota:** Si sigues teniendo problemas, comparte el resultado de:
```
http://localhost/symbiot/symbiot_finance_manager/gastos/api/test.php
```
