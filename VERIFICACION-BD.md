# 🔧 Verificación Urgente - Credenciales de Base de Datos

## 📋 Problema Actual

El login falla con error: **"Error de conexion a la base de datos"**

Esto significa que las credenciales en `gastos/includes/config.php` no son correctas para tu entorno.

---

## ✅ PASO 1: Verificar Conexión a BD

Accede a este script de diagnóstico:

```
http://localhost/symbiot/symbiot_finance_manager/gastos/api/db-test.php
```

**Resultado esperado si funciona**:
```json
{
    "overall_status": "SUCCESS",
    "connection_test": {
        "status": "SUCCESS",
        "message": "Conexión a MySQL establecida"
    },
    "database_test": {
        "status": "SUCCESS",
        "message": "Base de datos existe y es accesible",
        "database": "gastos_app_db"
    },
    "usuarios_table": {
        "status": "SUCCESS",
        "exists": true,
        "total_users": 4
    }
}
```

**Si NO funciona**, verás algo como:
```json
{
    "overall_status": "ERROR",
    "connection_test": {
        "status": "ERROR",
        "message": "Error al conectar a MySQL",
        "error": "SQLSTATE[HY000] [1045] Access denied for user..."
    }
}
```

---

## ✅ PASO 2: Identificar las Credenciales Correctas

### Opción A: Si tienes phpMyAdmin

1. Abre phpMyAdmin: `http://localhost/phpMyAdmin/`
2. Las credenciales que usas ahí son las correctas
3. Anota:
   - Usuario
   - Contraseña
   - Nombre de la base de datos

### Opción B: Si NO tienes phpMyAdmin

Necesitamos saber:
1. **¿Cuál es el nombre de tu base de datos MySQL para el sistema de gastos?**
2. **¿Cuál es el usuario de MySQL?**
3. **¿Cuál es la contraseña?**

Las credenciales actuales en el código son:
```
DB_HOST: localhost
DB_NAME: gastos_app_db
DB_USER: gastos_user
DB_PASS: Gastos2025!
```

¿Son estas las correctas? Si no, ¿cuáles son las tuyas?

---

## ✅ PASO 3: Actualizar Credenciales (Si es necesario)

Si las credenciales son incorrectas, necesito que me digas las correctas para actualizar:

**`gastos/includes/config.php`**

Puedes editar el archivo directamente o decirme las credenciales para que yo lo actualice.

---

## 🔍 Diagnóstico Adicional

Si `db-test.php` tampoco funciona, también revisa los logs de MySQL:

**En AppServ**:
```
C:\AppServ\MySQL\data\[nombre-de-tu-pc].err
```

Busca errores recientes relacionados con conexión.

---

## 📞 Por Favor Reporta

1. ¿Qué resultado te da `db-test.php`?
2. ¿Cuáles son las credenciales correctas de MySQL?
3. ¿El nombre de tu base de datos es `gastos_app_db` o es otro?
4. ¿Puedes acceder a phpMyAdmin? Si sí, ¿con qué usuario/password?

Con esta información puedo corregir las credenciales inmediatamente.
