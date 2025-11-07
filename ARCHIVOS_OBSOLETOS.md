# 🗑️ ARCHIVOS OBSOLETOS - LISTA PARA ELIMINACIÓN

## ⚠️ IMPORTANTE: Hacer backup antes de eliminar

Estos archivos han sido **completamente reemplazados por PHP** y ya no son necesarios.

**Recomendación:** Crear un backup antes de eliminar:
```bash
tar -czf nodejs_backup_$(date +%Y%m%d_%H%M%S).tar.gz \
  server/ \
  database/*.js \
  *.js \
  package*.json \
  node_modules/
```

---

## 📋 Archivos Marcados para Eliminación

### 1. Directorio `server/` (Backend Node.js - COMPLETO)

**TODO el directorio puede eliminarse:**

```bash
server/
├── app.js                        ⚠️ → Reemplazado por: api/index.php
├── config/
│   └── database.js              ⚠️ → Reemplazado por: api/config/database.php
├── controllers/
│   ├── auth.js                  ⚠️ → Reemplazado por: api/controllers/AuthController.php
│   └── transacciones.js         ⚠️ → Reemplazado por: api/controllers/TransaccionesController.php
└── routes/
    └── api.js                    ⚠️ → Reemplazado por: api/index.php
```

**Comando para eliminar:**
```bash
rm -rf server/
```

---

### 2. Scripts de Configuración (Raíz del proyecto)

Archivos `.js` en la raíz que ya no son necesarios:

```bash
check-appserv.js          ⚠️ Script de verificación Node.js
diagnose-appserv.js       ⚠️ Script de diagnóstico Node.js
setup-appserv.js          ⚠️ Script de setup Node.js
setup-database.js         ⚠️ Script de setup de BD Node.js
```

**Comando para eliminar:**
```bash
rm check-appserv.js diagnose-appserv.js setup-appserv.js setup-database.js
```

---

### 3. Scripts de Base de Datos (`database/`)

Archivos `.js` de gestión de base de datos:

```bash
database/
├── fix-payment-dates.js          ⚠️ Script de corrección Node.js
├── sample-data.js                ⚠️ Script de datos de muestra Node.js
├── seed-from-excel.js            ⚠️ Script de importación Excel Node.js
└── sync-payment-dates.js         ⚠️ Script de sincronización Node.js
```

**Comando para eliminar:**
```bash
rm database/*.js
```

**NOTA:** Mantener archivos `.sql` si existen en `database/`

---

### 4. Dependencias de Node.js

**Archivos de configuración de dependencias:**

```bash
package.json              ⚠️ Configuración de npm (marcado como obsoleto)
package-lock.json         ⚠️ Lock file de npm
node_modules/             ⚠️ Directorio de dependencias (puede ser muy grande)
```

**Comandos para eliminar:**
```bash
rm package.json package-lock.json
rm -rf node_modules/
```

---

## 📊 Resumen de Eliminación

| Categoría | Archivos | Tamaño Aprox. |
|-----------|----------|---------------|
| **server/** | 5 archivos | ~50 KB |
| **Scripts raíz** | 4 archivos | ~23 KB |
| **database/*.js** | 4 archivos | ~37 KB |
| **package*.json** | 2 archivos | ~92 KB |
| **node_modules/** | Miles de archivos | 50-200 MB |
| **TOTAL** | ~Miles | **50-200 MB** |

---

## 🚀 Comando de Eliminación Completo

### Opción 1: Eliminación Segura (Con Backup)

```bash
#!/bin/bash

# 1. Crear backup con timestamp
echo "📦 Creando backup..."
tar -czf nodejs_backup_$(date +%Y%m%d_%H%M%S).tar.gz \
  server/ \
  database/*.js \
  check-appserv.js \
  diagnose-appserv.js \
  setup-appserv.js \
  setup-database.js \
  package.json \
  package-lock.json \
  node_modules/ \
  2>/dev/null

echo "✅ Backup creado"

# 2. Eliminar archivos
echo "🗑️ Eliminando archivos obsoletos..."
rm -rf server/
rm -f database/*.js
rm -f check-appserv.js diagnose-appserv.js setup-appserv.js setup-database.js
rm -f package.json package-lock.json
rm -rf node_modules/

echo "✅ Archivos eliminados"
echo ""
echo "📋 Archivos restantes:"
ls -lah
```

### Opción 2: Eliminación Directa (Sin Backup - ⚠️ Peligroso)

```bash
# ⚠️ ADVERTENCIA: Esto eliminará permanentemente los archivos
rm -rf server/ database/*.js node_modules/
rm -f check-appserv.js diagnose-appserv.js setup-appserv.js setup-database.js
rm -f package.json package-lock.json

echo "✅ Archivos Node.js eliminados"
```

---

## ✅ Verificación Post-Eliminación

Después de eliminar, verifica que la aplicación PHP funcione correctamente:

### 1. Verificar estructura PHP:
```bash
ls -la api/
# Debe mostrar:
# - index.php
# - config/database.php
# - controllers/AuthController.php
# - controllers/TransaccionesController.php
```

### 2. Verificar estructura gastos/:
```bash
ls -la gastos/
# Debe mostrar:
# - login.html, dashboard.html, etc.
# - api/index.php
# - css/, js/, assets/
```

### 3. Probar la aplicación:
```bash
# Health check
curl http://localhost/symbiot_finance_manager/gastos/api/health

# Debe responder:
# {"status":"OK","version":"2.0.0-PHP",...}
```

### 4. Probar el login:
```
http://localhost/symbiot_finance_manager/gastos/login.html
```

---

## 📁 Estructura Final (Solo PHP)

Después de la eliminación, el proyecto debe tener:

```
symbiot_finance_manager/
├── api/                          ✅ Backend PHP
│   ├── index.php
│   ├── config/
│   │   └── database.php
│   └── controllers/
│       ├── AuthController.php
│       └── TransaccionesController.php
│
├── gastos/                       ✅ Frontend + API Proxy
│   ├── api/
│   │   └── index.php
│   ├── *.html
│   ├── css/
│   ├── js/
│   └── assets/
│
├── public/                       ✅ Archivos estáticos originales
│   ├── *.html
│   ├── css/
│   ├── js/
│   └── assets/
│
├── database/                     ✅ Archivos SQL (si existen)
│   └── *.sql
│
├── .htaccess                     ✅ Configuración Apache
├── MIGRACION_PHP.md              ✅ Documentación
├── INSTALACION_RAPIDA.md         ✅ Guía de instalación
├── ARCHIVOS_OBSOLETOS.md         ✅ Este archivo
└── README.md                     ✅ README original

ELIMINADOS:
❌ server/
❌ database/*.js
❌ *.js (raíz)
❌ package*.json
❌ node_modules/
```

---

## ⚠️ Archivos a MANTENER

**NO eliminar:**
- `public/` - Archivos estáticos originales
- `gastos/` - Nueva estructura funcional
- `api/` - Backend PHP
- `database/*.sql` - Schemas SQL (si existen)
- `.htaccess` - Configuración Apache
- `*.md` - Documentación
- `*.php` - Todos los archivos PHP

---

## 🆘 Si Algo Sale Mal

Si después de eliminar algo no funciona:

1. **Restaurar desde backup:**
   ```bash
   tar -xzf nodejs_backup_YYYYMMDD_HHMMSS.tar.gz
   ```

2. **Verificar logs:**
   ```bash
   tail -f /var/log/apache2/error.log  # Linux
   tail -f C:/xampp/apache/logs/error.log  # XAMPP
   ```

3. **Revisar documentación:**
   - `INSTALACION_RAPIDA.md` - Guía de instalación
   - `MIGRACION_PHP.md` - Detalles técnicos

---

## 📝 Checklist de Eliminación

Marcar cuando se complete:

- [ ] Backup creado (archivo `.tar.gz`)
- [ ] `server/` eliminado
- [ ] `database/*.js` eliminados
- [ ] Scripts raíz (*.js) eliminados
- [ ] `package.json` y `package-lock.json` eliminados
- [ ] `node_modules/` eliminado
- [ ] Verificación: `/gastos/api/health` responde OK
- [ ] Verificación: Login funciona
- [ ] Verificación: Dashboard carga datos
- [ ] Backup guardado en lugar seguro (por si acaso)

---

**Versión:** 2.0.0-PHP
**Fecha:** 2025-11-07
**Estado:** Migración completada - Listo para eliminación

**⚠️ RECORDATORIO:** Siempre hacer backup antes de eliminar archivos.
