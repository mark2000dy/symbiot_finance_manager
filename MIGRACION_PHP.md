# 🔄 Migración de Node.js a PHP - Gastos Symbiot App

## ✅ Estado de la Migración

**Fecha:** 2025-11-07
**Estado:** ✅ COMPLETADO
**Versión PHP:** 2.0.0-PHP

---

## 📋 Resumen de Cambios

Este proyecto ha sido migrado de **Node.js/Express** a **PHP nativo** para mejorar la compatibilidad con entornos de hosting tradicional (Apache/XAMPP/AppServ).

### Archivos Creados (PHP)

```
api/
├── index.php                           # Servidor API principal (reemplaza server/app.js)
├── config/
│   └── database.php                    # Configuración de base de datos PDO
└── controllers/
    ├── AuthController.php              # Controlador de autenticación
    └── TransaccionesController.php     # Controlador de transacciones

.htaccess                               # Configuración de reescritura de URLs
```

### Archivos Marcados para Eliminación (Node.js)

Los siguientes archivos han sido etiquetados con `⚠️ ARCHIVO OBSOLETO - MARCAR PARA ELIMINACIÓN ⚠️`:

```
server/
├── app.js                    → Reemplazado por: api/index.php
├── config/
│   └── database.js          → Reemplazado por: api/config/database.php
├── controllers/
│   ├── auth.js              → Reemplazado por: api/controllers/AuthController.php
│   └── transacciones.js     → Reemplazado por: api/controllers/TransaccionesController.php
└── routes/
    └── api.js               → Reemplazado por: api/index.php

package.json                  → Marcado como OBSOLETO
package-lock.json            → Puede eliminarse
node_modules/                → Puede eliminarse
```

---

## 🚀 Instalación y Configuración

### Requisitos

- **PHP:** >= 7.4 (recomendado 8.0+)
- **MySQL:** >= 5.7
- **Apache:** con mod_rewrite habilitado
- **Extensiones PHP requeridas:**
  - `pdo_mysql`
  - `mbstring`
  - `json`

### Configuración del Servidor

#### Opción 1: Apache (Producción)

1. **Habilitar mod_rewrite:**
   ```bash
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```

2. **Configurar DocumentRoot:**
   Apuntar el DocumentRoot a la carpeta raíz del proyecto:
   ```apache
   <VirtualHost *:80>
       DocumentRoot "/ruta/a/symbiot_finance_manager"
       <Directory "/ruta/a/symbiot_finance_manager">
           AllowOverride All
           Require all granted
       </Directory>
   </VirtualHost>
   ```

3. **Verificar .htaccess:**
   El archivo `.htaccess` ya está configurado para rutear `/gastos/api/*` a `api/index.php`

#### Opción 2: XAMPP/AppServ (Desarrollo)

1. Copiar el proyecto a la carpeta `htdocs` o `www`
2. Acceder a: `http://localhost/symbiot_finance_manager/gastos`
3. El `.htaccess` manejará automáticamente las rutas

### Configuración de Base de Datos

Crear un archivo `.env` en la raíz del proyecto (opcional):

```env
DB_HOST=localhost
DB_DATABASE=gastos_app_db
DB_USERNAME=gastos_user
DB_PASSWORD=Gastos2025!
```

O editar directamente `api/config/database.php` con las credenciales correctas.

---

## 🔗 Endpoints API

Todos los endpoints mantienen la misma estructura que en la versión Node.js:

### Autenticación

- **POST** `/gastos/api/login` - Iniciar sesión
- **POST** `/gastos/api/logout` - Cerrar sesión
- **GET** `/gastos/api/user` - Obtener usuario actual

### Transacciones

- **GET** `/gastos/api/transacciones` - Listar transacciones (con filtros)
- **POST** `/gastos/api/transacciones` - Crear transacción
- **PUT** `/gastos/api/transacciones/:id` - Actualizar transacción
- **DELETE** `/gastos/api/transacciones/:id` - Eliminar transacción
- **GET** `/gastos/api/transacciones/resumen` - Resumen de transacciones

### Gastos e Ingresos

- **GET** `/gastos/api/gastos` - Solo gastos
- **POST** `/gastos/api/gastos` - Crear gasto
- **GET** `/gastos/api/ingresos` - Solo ingresos
- **POST** `/gastos/api/ingresos` - Crear ingreso

### Dashboard

- **GET** `/gastos/api/dashboard` - Datos del dashboard
- **GET** `/gastos/api/empresas` - Listar empresas
- **GET** `/gastos/api/alumnos` - Listar alumnos

### Health Check

- **GET** `/gastos/api/health` - Estado del servidor

---

## 🧪 Pruebas

### Probar la API

1. **Health Check:**
   ```bash
   curl http://localhost/gastos/api/health
   ```

   Respuesta esperada:
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

2. **Login:**
   ```bash
   curl -X POST http://localhost/gastos/api/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@symbiot.com","password":"admin123"}'
   ```

3. **Obtener Transacciones:**
   ```bash
   curl http://localhost/gastos/api/transacciones \
     -H "Cookie: PHPSESSID=tu_session_id"
   ```

---

## 🔒 Seguridad

### Mejoras Implementadas

- ✅ **PDO Prepared Statements** - Previene inyección SQL
- ✅ **password_hash/password_verify** - Hash seguro de contraseñas (bcrypt)
- ✅ **Sesiones PHP nativas** - Manejo de autenticación
- ✅ **Headers de seguridad** - X-Frame-Options, X-Content-Type-Options
- ✅ **CORS configurado** - Control de acceso entre orígenes
- ✅ **Validación de entrada** - Sanitización de datos

### Recomendaciones Adicionales

1. **Habilitar HTTPS** en producción
2. **Configurar sesiones seguras:**
   ```php
   ini_set('session.cookie_httponly', 1);
   ini_set('session.cookie_secure', 1); // Solo HTTPS
   ```
3. **Ocultar errores PHP en producción:**
   ```php
   ini_set('display_errors', 0);
   ini_set('log_errors', 1);
   ```

---

## 🗑️ Limpieza de Archivos Node.js

Una vez verificada la migración, puedes eliminar:

```bash
# Eliminar archivos de Node.js
rm -rf server/
rm -rf node_modules/
rm package.json package-lock.json

# Archivos de setup Node.js
rm setup-appserv.js check-appserv.js diagnose-appserv.js setup-database.js

# Archivos de base de datos Node.js
rm -rf database/*.js
```

**⚠️ IMPORTANTE:** Haz un backup antes de eliminar:
```bash
tar -czf nodejs_backup_$(date +%Y%m%d).tar.gz server/ package*.json node_modules/
```

---

## 🐛 Troubleshooting

### Error: "Endpoint no encontrado"

**Solución:** Verificar que `mod_rewrite` esté habilitado y `.htaccess` se esté leyendo:
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### Error: "Database connection failed"

**Solución:** Verificar credenciales en `api/config/database.php` y que MySQL esté corriendo:
```bash
sudo systemctl status mysql
```

### Error: "Session not found"

**Solución:** Verificar permisos de la carpeta de sesiones:
```bash
sudo chmod 1777 /var/lib/php/sessions  # Linux
```

### Error 500 - Internal Server Error

**Solución:** Revisar logs de PHP:
```bash
tail -f /var/log/apache2/error.log    # Linux
tail -f C:/xampp/apache/logs/error.log # XAMPP Windows
```

---

## 📊 Diferencias Técnicas Clave

| Aspecto | Node.js | PHP |
|---------|---------|-----|
| **Servidor** | Express.js | Apache + mod_rewrite |
| **Enrutamiento** | Express Router | .htaccess + PHP routing |
| **Base de datos** | mysql2 (Promises) | PDO (Prepared Statements) |
| **Sesiones** | express-session | Sesiones PHP nativas |
| **Hash passwords** | bcrypt | password_hash (bcrypt) |
| **Manejo async** | async/await | Try-catch tradicional |
| **Variables entorno** | dotenv | parse_ini_file / getenv |

---

## ✅ Checklist de Migración

- [x] Configuración de base de datos PHP
- [x] Controlador de autenticación
- [x] Controlador de transacciones
- [x] Ruteo de API principal
- [x] Configuración .htaccess
- [x] Etiquetado de archivos Node.js obsoletos
- [x] Documentación de migración
- [ ] Pruebas de integración
- [ ] Deploy en producción
- [ ] Eliminación de archivos Node.js (después de verificación)

---

## 📞 Soporte

Para reportar problemas con la migración, contactar al equipo de desarrollo de Symbiot Technologies.

**Versión:** 2.0.0-PHP
**Última actualización:** 2025-11-07
