# 🚀 Instalación Rápida - Gastos Symbiot App (PHP)

## ✅ La aplicación ya está lista para usar

### Estructura del Proyecto

```
symbiot_finance_manager/
├── gastos/                          ← Punto de entrada principal
│   ├── api/
│   │   └── index.php               ← API REST (proxy a /api/index.php)
│   ├── login.html                  ← Página de inicio
│   ├── dashboard.html
│   ├── gastos.html
│   ├── ingresos.html
│   ├── reportes.html
│   ├── css/                        ← Estilos
│   ├── js/                         ← Scripts del frontend
│   └── assets/                     ← Recursos estáticos
│
├── api/                            ← Backend PHP principal
│   ├── index.php                   ← Controlador principal
│   ├── config/
│   │   └── database.php            ← Configuración de base de datos
│   └── controllers/
│       ├── AuthController.php
│       └── TransaccionesController.php
│
└── .htaccess                       ← Configuración Apache (opcional)
```

---

## 🔧 Configuración Rápida

### Opción 1: Servidor Web Local (Apache/XAMPP/WAMP)

1. **Copiar el proyecto** a tu servidor web:
   ```bash
   # En XAMPP/WAMP/MAMP
   cp -r symbiot_finance_manager C:/xampp/htdocs/
   # o en Linux/Mac
   cp -r symbiot_finance_manager /var/www/html/
   ```

2. **Configurar base de datos** en `api/config/database.php`:
   ```php
   $this->host = 'localhost';
   $this->database = 'gastos_app_db';
   $this->username = 'gastos_user';
   $this->password = 'Gastos2025!';
   ```

3. **Acceder a la aplicación**:
   ```
   http://localhost/symbiot_finance_manager/gastos/login.html
   ```

### Opción 2: Servidor PHP Integrado (Desarrollo)

```bash
cd symbiot_finance_manager
php -S localhost:8000
```

Luego accede a:
```
http://localhost:8000/gastos/login.html
```

---

## 🌐 URLs de la Aplicación

### Frontend (Páginas HTML)
- **Login:** `http://localhost/symbiot_finance_manager/gastos/login.html`
- **Dashboard:** `http://localhost/symbiot_finance_manager/gastos/dashboard.html`
- **Gastos:** `http://localhost/symbiot_finance_manager/gastos/gastos.html`
- **Ingresos:** `http://localhost/symbiot_finance_manager/gastos/ingresos.html`
- **Reportes:** `http://localhost/symbiot_finance_manager/gastos/reportes.html`

### API REST (Endpoints)
- **Health Check:** `http://localhost/symbiot_finance_manager/gastos/api/health`
- **Login:** `POST http://localhost/symbiot_finance_manager/gastos/api/login`
- **Transacciones:** `GET http://localhost/symbiot_finance_manager/gastos/api/transacciones`
- **Dashboard:** `GET http://localhost/symbiot_finance_manager/gastos/api/dashboard`

---

## 🧪 Pruebas Rápidas

### 1. Verificar que PHP funciona

Accede a:
```
http://localhost/symbiot_finance_manager/api/test.php
```

Deberías ver:
```json
{
  "status": "OK",
  "message": "PHP está funcionando correctamente",
  "php_version": "8.x.x"
}
```

### 2. Verificar la API

```bash
# Health Check
curl http://localhost/symbiot_finance_manager/gastos/api/health

# Login
curl -X POST http://localhost/symbiot_finance_manager/gastos/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@symbiot.com","password":"admin123"}'
```

---

## ⚙️ Configuración de Base de Datos

### Crear la base de datos

```sql
CREATE DATABASE gastos_app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'gastos_user'@'localhost' IDENTIFIED BY 'Gastos2025!';
GRANT ALL PRIVILEGES ON gastos_app_db.* TO 'gastos_user'@'localhost';
FLUSH PRIVILEGES;
```

### Importar el schema (si existe)

```bash
mysql -u gastos_user -p gastos_app_db < database/schema.sql
```

---

## 🔒 Credenciales por Defecto

**Usuario Admin:**
- Email: `admin@symbiot.com`
- Password: `admin123`

⚠️ **IMPORTANTE:** Cambia la contraseña después del primer login en producción.

---

## 🐛 Solución de Problemas

### Error 404 en `/gastos/api/*`

**Problema:** La API no responde, error 404.

**Soluciones:**
1. Verifica que el archivo existe: `gastos/api/index.php`
2. Verifica permisos: `chmod 644 gastos/api/index.php`
3. Si usas Apache, verifica que `mod_rewrite` esté habilitado:
   ```bash
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```

### Error de conexión a base de datos

**Problema:** "Database connection failed"

**Soluciones:**
1. Verifica credenciales en `api/config/database.php`
2. Verifica que MySQL esté corriendo:
   ```bash
   sudo systemctl status mysql  # Linux
   # o en XAMPP: abrir el panel y verificar MySQL
   ```
3. Verifica que el usuario tenga permisos:
   ```sql
   SHOW GRANTS FOR 'gastos_user'@'localhost';
   ```

### Error: "Unexpected token '<'"

**Problema:** El frontend recibe HTML en lugar de JSON.

**Causa:** La API no está respondiendo correctamente, Apache está devolviendo página de error.

**Solución:**
1. Verifica los logs de PHP:
   ```bash
   tail -f /var/log/apache2/error.log  # Linux
   tail -f C:/xampp/apache/logs/error.log  # XAMPP
   ```
2. Verifica sintaxis PHP:
   ```bash
   php -l api/index.php
   php -l gastos/api/index.php
   ```

### Sesiones no funcionan

**Problema:** El login funciona pero la sesión no persiste.

**Soluciones:**
1. Verifica permisos de carpeta de sesiones:
   ```bash
   sudo chmod 1777 /var/lib/php/sessions  # Linux
   ```
2. Verifica configuración de PHP:
   ```php
   echo session_save_path();  // Ver dónde se guardan las sesiones
   ```

---

## 📋 Checklist de Instalación

- [ ] PHP 7.4+ instalado
- [ ] MySQL 5.7+ instalado y corriendo
- [ ] Extensión PDO de PHP habilitada
- [ ] Base de datos creada
- [ ] Usuario de BD con permisos
- [ ] Credenciales configuradas en `api/config/database.php`
- [ ] Proyecto copiado al servidor web
- [ ] Health check responde: `/gastos/api/health`
- [ ] Login funciona: `/gastos/login.html`
- [ ] Dashboard carga datos: `/gastos/dashboard.html`

---

## 📚 Documentación Completa

Para más detalles sobre la migración y características avanzadas:
- **Migración Node.js → PHP:** `MIGRACION_PHP.md`
- **README original:** `README.md`

---

## 🆘 Soporte

Si encuentras problemas:

1. **Revisa los logs:**
   - Apache: `/var/log/apache2/error.log`
   - PHP: `error_log` en la configuración de PHP
   - Aplicación: `api/index.php` (usa `error_log()`)

2. **Verifica requisitos:**
   - PHP >= 7.4
   - MySQL >= 5.7
   - Extensiones: pdo_mysql, mbstring, json

3. **Contacta al equipo de desarrollo de Symbiot Technologies**

---

**Versión:** 2.0.0-PHP
**Última actualización:** 2025-11-07
