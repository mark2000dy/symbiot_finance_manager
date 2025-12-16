# 🚨 RECUPERACIÓN URGENTE - Error 500 Global

## ❌ Problema Identificado

Había un archivo `.htaccess` en la **RAÍZ del proyecto** (`symbiot_finance_manager/.htaccess`) que estaba causando error 500 en **TODO el sitio**, no solo en `/gastos`.

Este archivo tenía:
- Sintaxis de Apache 2.2 incompatible con Apache 2.4
- Directivas que requieren módulos no habilitados
- Configuración que afectaba a TODOS los subdirectorios

---

## ✅ INSTRUCCIONES DE RECUPERACIÓN INMEDIATA

Sigue estos pasos EN ORDEN:

### PASO 1: Revertir httpd.conf (URGENTE)

1. **Abrir**: `C:\AppServ\Apache24\conf\httpd.conf`

2. **ELIMINAR** las líneas que agregaste al final (las secciones `<Directory>` para gastos):

```apache
# Configuración para Sistema de Gastos Symbiot
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

**ELIMINAR TODO ESO ⬆️**

3. **NO** descomentes nada más (deja los módulos como estaban)

4. **Guardar** httpd.conf

5. **Reiniciar Apache** inmediatamente

### PASO 2: Actualizar el código

```bash
cd C:\AppServ\www\symbiot\symbiot_finance_manager
git pull origin claude/fix-database-connection-01E7WB5gndv9499pL7DWsfo3
```

Esto renombrará `.htaccess` a `.htaccess.BACKUP`, desactivándolo.

### PASO 3: Verificar que todo funciona

**Test 1**: Página principal
```
http://localhost/symbiot/symbiot_finance_manager/index.html
```

✅ **DEBE CARGAR SIN ERROR 500**

**Test 2**: Login de gastos
```
http://localhost/symbiot/symbiot_finance_manager/gastos/login.html
```

✅ **DEBE CARGAR SIN ERROR 500**

---

## 📊 Estado Actual

### ✅ Después de seguir estos pasos:

- ✅ `index.html` funcionará
- ✅ `gastos/login.html` cargará
- ⚠️ El login **NO funcionará** (dirá "Sin conexión al servidor")
- ⚠️ Esto es NORMAL por ahora

### ¿Por qué el login no funciona?

El login requiere que Apache procese PATH_INFO (`/index.php/login`), pero eso necesita configuración especial.

**LO IMPORTANTE AHORA**: Que el sitio vuelva a cargar sin error 500.

---

## 🔍 Explicación Técnica

### ¿Qué estaba pasando?

1. **`.htaccess` en raíz** tenía directivas incompatibles
2. Esto causaba error 500 en **TODO** el directorio
3. Afectaba a `/index.html`, `/gastos/`, etc.
4. Las modificaciones en `httpd.conf` podían agravar el problema

### ¿Qué hice?

1. Renombré `.htaccess` a `.htaccess.BACKUP`
2. Esto **desactiva** el archivo sin eliminarlo
3. Ahora Apache no lo procesa
4. El sitio vuelve a funcionar

---

## 🎯 Próximos Pasos (DESPUÉS de que el sitio funcione)

Una vez que el sitio vuelva a cargar:

### Opción A: Vivir sin PATH_INFO (más simple)

El `api-client.js` v3.1.2 ya tiene **auto-detección de base path**, que funciona perfectamente.

El único problema es que Apache no procesa `/index.php/login`.

**Solución simple**: Modificar el API para que use query strings en lugar de PATH_INFO:
- En vez de: `/api/index.php/login`
- Usar: `/api/index.php?endpoint=login`

Esto requiere modificar SOLO el archivo `/gastos/api/index.php` y funciona sin configuración de Apache.

### Opción B: Configurar PATH_INFO correctamente

Requiere editar httpd.conf con MUCHO cuidado y conocimiento de Apache.

**NO recomendado** hasta que el sitio esté completamente estable.

---

## 📝 Resumen de Recuperación

1. ✅ **Revertir httpd.conf** (eliminar las secciones `<Directory>` agregadas)
2. ✅ **Reiniciar Apache**
3. ✅ **git pull** (para renombrar .htaccess)
4. ✅ **Verificar** que index.html y login.html carguen
5. ⏳ **Reportar** el resultado

---

## 🆘 Si Sigue Sin Funcionar

### Revisar logs de Apache

```
C:\AppServ\Apache24\logs\error.log
```

Busca las líneas más recientes con "error" o "500".

### Verificar sintaxis de httpd.conf

Abre CMD como Administrador:

```
C:\AppServ\Apache24\bin\httpd.exe -t
```

Si dice "Syntax OK", la configuración es válida.
Si dice "Syntax error", hay un error en httpd.conf.

### Última opción: Reinstalar httpd.conf

Si httpd.conf está corrupto:

1. Renombrar el actual: `httpd.conf.backup`
2. Buscar `httpd.conf.default` en el mismo directorio
3. Copiar `httpd.conf.default` a `httpd.conf`
4. Reiniciar Apache

---

## ❓ Preguntas Frecuentes

### ¿Por qué no simplemente arreglar el .htaccess?

El `.htaccess` requiere que Apache tenga `AllowOverride All`, pero tu instalación aparentemente tiene `AllowOverride None`. Además, el archivo usa sintaxis de Apache 2.2 que es incompatible con Apache 2.4.

### ¿Puedo eliminar .htaccess.BACKUP?

SÍ, pero **DESPUÉS** de verificar que todo funciona. Lo dejé renombrado por seguridad.

### ¿Qué pasa con los archivos .htaccess de /gastos/?

Ya los eliminé en commits anteriores. El problema era el .htaccess de la RAÍZ que yo no había tocado.

---

## 📞 Reporte de Status

Por favor reporta:
1. ¿Revertiste httpd.conf? ✅/❌
2. ¿Reiniciaste Apache? ✅/❌
3. ¿Hiciste git pull? ✅/❌
4. ¿Carga index.html sin error 500? ✅/❌
5. ¿Carga gastos/login.html sin error 500? ✅/❌
6. ¿Qué dice httpd.exe -t? (Syntax OK o error)
