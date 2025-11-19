# Troubleshooting - Error 404 en Login

## Problema
Cuando se intenta hacer login, aparece error 404:
```
Failed to load resource: the server responded with a status of 404 (Not Found)
/gastos/api/index.php/login
```

## Causa
Apache no está procesando correctamente el PATH_INFO en las URLs del tipo:
- `/gastos/api/index.php/login`
- `/gastos/api/index.php/health`

## Solución

### ✅ Paso 1: Verificar que existe el .htaccess
El archivo `/gastos/api/.htaccess` debe existir con la configuración `AcceptPathInfo On`.

Ya está incluido en este commit.

### ✅ Paso 2: Verificar configuración de Apache

#### En Windows (AppServ/XAMPP/WAMP)
1. Abrir el archivo de configuración de Apache: `httpd.conf`
   - AppServ: `C:\AppServ\Apache24\conf\httpd.conf`
   - XAMPP: `C:\xampp\apache\conf\httpd.conf`

2. Verificar que estas líneas **NO** estén comentadas (sin `#` al inicio):
   ```apache
   LoadModule rewrite_module modules/mod_rewrite.so
   LoadModule headers_module modules/mod_headers.so
   ```

3. Buscar la sección `<Directory>` y verificar que `AllowOverride` esté en `All`:
   ```apache
   <Directory "C:/AppServ/www">
       AllowOverride All
       Require all granted
   </Directory>
   ```

4. **Reiniciar Apache** después de cualquier cambio en httpd.conf

#### En Linux/Plesk
El .htaccess debería funcionar automáticamente si mod_rewrite está habilitado.

### ✅ Paso 3: Probar la configuración

#### Opción A: Probar PATH_INFO
Accede a:
```
http://localhost/symbiot/symbiot_finance_manager/gastos/api/path-info-test.php/hello/world
```

Deberías ver:
```json
{
    "overall_status": "OK",
    "server_vars": {
        "PATH_INFO": "/hello/world"
    }
}
```

Si `PATH_INFO` dice "NOT SET", entonces Apache no está procesando correctamente.

#### Opción B: Probar la base de datos
```
http://localhost/symbiot/symbiot_finance_manager/gastos/api/db-test.php
```

Debe mostrar `overall_status: SUCCESS`

### ✅ Paso 4: Probar el login

Una vez que PATH_INFO funcione, el login debería funcionar correctamente.

## Alternativa: Si .htaccess no funciona

Si después de seguir todos los pasos anteriores, el .htaccess sigue sin funcionar, hay una alternativa:

### Modificar el cliente para usar query strings
En lugar de:
```
/gastos/api/index.php/login
```

Usar:
```
/gastos/api/index.php?endpoint=login
```

Esto requeriría modificar tanto el código del cliente (JavaScript) como del servidor (PHP).

## Verificación Final

1. ✅ Archivo `.htaccess` existe en `/gastos/api/`
2. ✅ `AcceptPathInfo On` está en el .htaccess
3. ✅ `mod_rewrite` está habilitado en Apache
4. ✅ `AllowOverride All` está configurado en httpd.conf
5. ✅ Apache ha sido reiniciado
6. ✅ `path-info-test.php` muestra PATH_INFO correctamente
7. ✅ Login funciona sin errores 404

## Contacto
Si el problema persiste, revisar los logs de Apache:
- Windows: `C:\AppServ\Apache24\logs\error.log`
- Linux: `/var/log/apache2/error.log` o `/var/log/httpd/error.log`
