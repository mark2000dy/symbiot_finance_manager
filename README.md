# 🚀 SYMBIOT TECHNOLOGIES - LANDING PAGE

Sitio web corporativo de Symbiot Technologies con portafolio de proyectos IoT, IA y automatización.

---

## 📋 CONTENIDO

- [Características](#-características)
- [Tecnologías](#-tecnologías-utilizadas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación Local](#-instalación-local)
- [Configuración](#-configuración)
- [Deploy a Plesk](#-deploy-a-plesk-producción)
- [Optimización](#-optimización)
- [Mantenimiento](#-mantenimiento)

---

## ✨ CARACTERÍSTICAS

### **Secciones Incluidas:**
- ✅ Hero section con slider animado
- ✅ About (Nosotros)
- ✅ Servicios de IA (6 servicios)
- ✅ Servicios de IoT (6 servicios)
- ✅ Portafolio (11 proyectos)
- ✅ Clientes (5 clientes)
- ✅ Estadísticas animadas
- ✅ Formulario de contacto funcional
- ✅ Newsletter con almacenamiento
- ✅ Aviso de privacidad
- ✅ Responsive (móvil, tablet, desktop)
- ✅ Animaciones con AOS
- ✅ SEO optimizado

### **Tecnologías:**
- Bootstrap 5.3.3
- PHP 7.3+ (formularios)
- JavaScript vanilla
- CSS3 con variables
- Font Awesome / Bootstrap Icons

---

## 🛠️ TECNOLOGÍAS UTILIZADAS

```
Frontend:
├── Bootstrap 5.3.3
├── AOS (Animate On Scroll)
├── Swiper.js (sliders)
├── GLightbox (lightbox)
└── PureCounter (animación números)

Backend:
├── PHP 7.3+
├── Session management
└── File storage (newsletter)

Colores Institucionales:
├── Amarillo: #dec329
├── Gris: #999999
├── Blanco: #ffffff
└── Negro: #000000
```

---

## 📁 ESTRUCTURA DEL PROYECTO

```
symbiot_landing/
├── index.html                      # Página principal
├── avisodeprivacidad.html         # Aviso de privacidad
├── README.md                       # Este archivo
├── OPTIMIZACION_IMAGENES.md       # Guía de optimización
│
├── assets/
│   ├── css/
│   │   └── main.css               # Estilos principales
│   ├── js/
│   │   └── main.js                # JavaScript principal
│   ├── img/
│   │   ├── hero-bg.jpg            # Hero background ⚠️ AGREGAR
│   │   ├── about.jpg              # About section ⚠️ AGREGAR
│   │   └── stats-bg.jpg           # Stats background ⚠️ AGREGAR
│   └── vendor/
│       ├── bootstrap/             # Bootstrap 5.3.3
│       ├── aos/                   # Animaciones
│       ├── swiper/                # Slider
│       └── glightbox/             # Lightbox
│
├── logo/
│   ├── symbiot_logo_mini_horizontal.png  ⚠️ AGREGAR
│   ├── favicon.ico                       ⚠️ AGREGAR
│   └── apple-touch-icon.png             ⚠️ AGREGAR
│
├── forms/
│   ├── contact.php                # Formulario de contacto
│   └── newsletter.php             # Formulario de newsletter
│
└── data/
    └── newsletter_subscribers.txt # Almacén de suscriptores (se crea auto)
```

---

## 💻 INSTALACIÓN LOCAL

### **Prerequisitos:**
- AppServ 9.3.0 (Apache + PHP + MySQL)
- VSCode con extensiones PHP
- Navegador web moderno

### **Paso 1: Clonar/Descargar Archivos**

Coloca todos los archivos en:
```
C:\AppServ\www\symbiot\
```

### **Paso 2: Copiar Assets de Plantilla GP**

Descarga la plantilla GP de:
https://bootstrapmade.com/gp-free-multipurpose-html-bootstrap-template/

Copia la carpeta `assets/vendor/` completa a tu proyecto.

### **Paso 3: Agregar Imágenes**

Revisa `OPTIMIZACION_IMAGENES.md` para las especificaciones.

Coloca las imágenes en:
```
assets/img/hero-bg.jpg
assets/img/about.jpg
assets/img/stats-bg.jpg
logo/symbiot_logo_mini_horizontal.png
logo/favicon.ico
```

### **Paso 4: Configurar Formularios**

Edita `forms/contact.php` línea 13:
```php
$receiving_email_address = 'info@symbiot.com.mx'; // ⚠️ TU EMAIL
```

Edita `forms/newsletter.php` línea 13:
```php
$admin_email = 'info@symbiot.com.mx'; // ⚠️ TU EMAIL
```

### **Paso 5: Probar Localmente**

Abre en navegador:
```
http://localhost/symbiot/index.html
```

---

## ⚙️ CONFIGURACIÓN

### **Colores Institucionales**

Los colores ya están configurados en `index.html` dentro del tag `<style>`:

```css
:root {
  --symbiot-yellow: #dec329;
  --symbiot-gray: #999999;
  --symbiot-white: #ffffff;
  --symbiot-black: #000000;
}
```

### **Ruta del Login**

El botón de login ya apunta a:
```html
<a class="btn-login" href="gastos/login.html">
```

**Para cambiarla**, edita línea 88 de `index.html`.

### **Email de Contacto**

Configura en múltiples lugares:

1. **Footer** (línea ~900):
```html
<p><strong>Email:</strong> <span>info@symbiot.com.mx</span></p>
```

2. **Formulario de Contacto** (`forms/contact.php` línea 13)

3. **Newsletter** (`forms/newsletter.php` línea 13)

### **Redes Sociales**

Edita en footer (línea ~905):
```html
<a href="https://twitter.com/SymbIoT_MX">
<a href="https://www.facebook.com/SymbiotTechnologies/">
<a href="https://www.youtube.com/channel/UCLsjhbsTtmlmKeAdySG6P7A">
```

---

## 🚀 DEPLOY A PLESK (PRODUCCIÓN)

### **Método 1: WinSCP (Recomendado)**

#### **Paso 1: Conectar con WinSCP**

1. Abre WinSCP
2. Protocolo: **SFTP** o **FTP**
3. Host: Tu servidor Plesk (ej: `symbiot.com.mx`)
4. Usuario: Tu usuario de Plesk
5. Contraseña: Tu contraseña
6. Click **Login**

#### **Paso 2: Navegar a la Carpeta Web**

En el servidor, navega a:
```
/httpdocs/
```
o
```
/var/www/vhosts/symbiot.com.mx/httpdocs/
```

#### **Paso 3: Subir Archivos**

**Arrastra desde tu PC (lado izquierdo) al servidor (lado derecho):**

```
LOCAL                          →  SERVIDOR
C:\AppServ\www\symbiot\        →  /httpdocs/

Archivos a subir:
├── index.html                 →  /httpdocs/index.html
├── avisodeprivacidad.html    →  /httpdocs/avisodeprivacidad.html
├── assets/                    →  /httpdocs/assets/
├── logo/                      →  /httpdocs/logo/
├── forms/                     →  /httpdocs/forms/
└── data/ (opcional)          →  /httpdocs/data/
```

#### **Paso 4: Configurar Permisos**

En WinSCP, click derecho en carpeta `data/`:
- Properties
- Permissions: `755` (rwxr-xr-x)
- Apply to directories: ✅
- Click OK

Para archivo `newsletter_subscribers.txt`:
- Permissions: `644` (rw-r--r--)

#### **Paso 5: Probar en Producción**

Abre en navegador:
```
https://symbiot.com.mx
```

### **Método 2: Panel de Plesk**

1. Login a Plesk: `https://tu-servidor:8443`
2. Selecciona dominio: `symbiot.com.mx`
3. File Manager
4. Navega a `httpdocs/`
5. Upload files (arrastra archivos)
6. Done

### **Método 3: Git (Avanzado)**

Si tienes Git configurado en Plesk:

```bash
# En servidor via SSH
cd /var/www/vhosts/symbiot.com.mx/httpdocs/
git clone https://github.com/tu-usuario/symbiot-landing.git .
```

---

## 🎨 OPTIMIZACIÓN

### **1. Optimizar Imágenes**

Lee guía completa en: `OPTIMIZACION_IMAGENES.md`

**Herramientas recomendadas:**
- https://tinypng.com/
- https://squoosh.app/

**Metas:**
- Hero: <300KB
- About: <150KB
- Stats: <200KB
- Portfolio: <100KB c/u

### **2. Habilitar Compresión GZIP**

En Plesk:
1. Hosting Settings
2. Apache & nginx settings
3. Enable **gzip compression** ✅
4. Save

### **3. Configurar Caché**

Agrega en `.htaccess`:

```apache
# Enable caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### **4. Minificar CSS/JS**

Herramientas online:
- CSS: https://cssminifier.com/
- JS: https://javascript-minifier.com/

---

## 🔧 MANTENIMIENTO

### **Agregar Nuevo Proyecto al Portafolio**

Edita `index.html` línea ~550 (sección Portfolio):

```html
<div class="col-lg-6 mb-4" data-aos="fade-up" data-aos-delay="100">
  <div class="portfolio-card p-4 rounded shadow-sm">
    <h4><i class="bi bi-ICONO text-warning me-2"></i>NOMBRE PROYECTO</h4>
    <p class="text-muted mb-2"><strong>Cliente:</strong> NOMBRE CLIENTE</p>
    <p>DESCRIPCIÓN CORTA</p>
    <p><strong>Características:</strong></p>
    <ul class="mb-3">
      <li>Característica 1</li>
      <li>Característica 2</li>
      <li>Característica 3</li>
    </ul>
    <div>
      <span class="tech-badge">Tech 1</span>
      <span class="tech-badge">Tech 2</span>
    </div>
  </div>
</div>
```

### **Agregar Nuevo Cliente**

Edita `index.html` línea ~750 (sección Clientes):

```html
<div class="col-lg-3 col-md-4 col-6" data-aos="zoom-in" data-aos-delay="XXX">
  <div class="client-card text-center p-4 bg-white rounded shadow-sm h-100">
    <h5 class="mb-3">NOMBRE CLIENTE</h5>
    <p class="text-muted small mb-2"><i class="bi bi-geo-alt-fill text-warning"></i> PAÍS</p>
    <p class="small">DESCRIPCIÓN BREVE</p>
  </div>
</div>
```

### **Actualizar Newsletter Subscribers**

Los suscriptores se guardan en:
```
data/newsletter_subscribers.txt
```

Formato:
```
email@ejemplo.com|IP|FECHA|USER_AGENT
```

**Descargar lista:**
1. Conecta con WinSCP
2. Navega a `/httpdocs/data/`
3. Descarga `newsletter_subscribers.txt`
4. Abre con Excel (separador: `|`)

### **Ver Logs de Errores PHP**

En Plesk:
1. Logs
2. Error Log
3. Busca errores relacionados con `contact.php` o `newsletter.php`

---

## 🐛 TROUBLESHOOTING

### **Problema: Formulario no envía emails**

**Solución 1:** Verificar función `mail()` de PHP

Crea archivo `test-mail.php`:
```php
<?php
$to = "tu@email.com";
$subject = "Test";
$message = "Prueba de email";
$headers = "From: noreply@symbiot.com.mx";

if (mail($to, $subject, $message, $headers)) {
    echo "Email enviado";
} else {
    echo "Error enviando email";
}
?>
```

**Solución 2:** Configurar SMTP en Plesk

Contacta a tu proveedor de hosting para configurar SMTP.

### **Problema: Imágenes no cargan**

**Verificar:**
1. Ruta correcta: `assets/img/hero-bg.jpg`
2. Mayúsculas/minúsculas en nombres
3. Permisos de archivos: `644`
4. Formato correcto (JPG, PNG)

### **Problema: CSS no aplica**

1. Limpia caché del navegador: `Ctrl+F5`
2. Verifica ruta: `assets/css/main.css`
3. Revisa permisos: `644`

### **Problema: Página en blanco**

1. Revisa errores PHP en Plesk → Logs
2. Activa display_errors en `php.ini` (solo en desarrollo)
3. Verifica que todos los archivos estén subidos

---

## 📊 MÉTRICAS DE PERFORMANCE

**Metas de Google PageSpeed:**
- Performance: >90
- Accessibility: >95
- Best Practices: >90
- SEO: >95

**Verificar en:**
- https://pagespeed.web.dev/

---

## 📞 SOPORTE

**Desarrollado por:** Symbiot Technologies

**Contacto:**
- Email: info@symbiot.com.mx
- Web: www.symbiot.com.mx
- GitHub: [Repositorio del proyecto]

---

## 📝 CHANGELOG

### **v1.0.0 - Noviembre 2025**
- ✅ Versión inicial
- ✅ 11 proyectos en portafolio
- ✅ 5 clientes
- ✅ Formularios funcionales
- ✅ Responsive design
- ✅ SEO optimizado
- ✅ Aviso de privacidad

---

## 📄 LICENCIA

© 2025 Symbiot Technologies. Todos los derechos reservados.

---

**Última actualización:** Noviembre 2025