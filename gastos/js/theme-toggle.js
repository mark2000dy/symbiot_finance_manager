/* ====================================================
   THEME TOGGLE MODULE - SYMBIOT FINANCIAL MANAGER
   Archivo: gastos/js/theme-toggle.js
   Manejo de modo claro/oscuro con persistencia
   ==================================================== */

(function() {
    'use strict';

    // Constantes
    const THEME_KEY = 'symbiot-theme';
    const DARK_THEME = 'dark';
    const LIGHT_THEME = 'light';

    /**
     * Obtener el tema guardado o el preferido del sistema
     */
    function getSavedTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);

        if (savedTheme) {
            return savedTheme;
        }

        // Si no hay tema guardado, usar preferencia del sistema
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return LIGHT_THEME;
        }

        return DARK_THEME;
    }

    /**
     * Aplicar tema al documento
     */
    function applyTheme(theme) {
        if (theme === LIGHT_THEME) {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        // Actualizar icono del botón si existe
        updateToggleIcon(theme);

        console.log(`🎨 Tema aplicado: ${theme}`);
    }

    /**
     * Guardar tema en localStorage
     */
    function saveTheme(theme) {
        localStorage.setItem(THEME_KEY, theme);
    }

    /**
     * Actualizar el icono del botón de toggle
     */
    function updateToggleIcon(theme) {
        const toggleBtn = document.getElementById('themeToggleBtn');
        if (!toggleBtn) return;

        const icon = toggleBtn.querySelector('i');
        if (!icon) return;

        if (theme === LIGHT_THEME) {
            icon.className = 'fas fa-moon';
            toggleBtn.setAttribute('title', 'Cambiar a modo oscuro');
        } else {
            icon.className = 'fas fa-sun';
            toggleBtn.setAttribute('title', 'Cambiar a modo claro');
        }
    }

    /**
     * Alternar entre temas
     */
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? DARK_THEME : LIGHT_THEME;

        applyTheme(newTheme);
        saveTheme(newTheme);

        // Efecto visual de feedback
        const toggleBtn = document.getElementById('themeToggleBtn');
        if (toggleBtn) {
            toggleBtn.classList.add('theme-switching');
            setTimeout(() => {
                toggleBtn.classList.remove('theme-switching');
            }, 300);
        }
    }

    /**
     * Inicializar el sistema de temas
     */
    function initTheme() {
        // Aplicar tema guardado inmediatamente (antes de que cargue el DOM completo)
        const savedTheme = getSavedTheme();
        applyTheme(savedTheme);

        // Esperar a que el DOM esté listo para configurar el botón
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupToggleButton);
        } else {
            setupToggleButton();
        }

        // Escuchar cambios en la preferencia del sistema
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
                // Solo aplicar si no hay preferencia guardada
                if (!localStorage.getItem(THEME_KEY)) {
                    applyTheme(e.matches ? LIGHT_THEME : DARK_THEME);
                }
            });
        }
    }

    /**
     * Configurar el botón de toggle
     */
    function setupToggleButton() {
        const toggleBtn = document.getElementById('themeToggleBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleTheme);

            // Actualizar icono al estado actual
            const currentTheme = document.documentElement.getAttribute('data-theme') || DARK_THEME;
            updateToggleIcon(currentTheme === 'light' ? LIGHT_THEME : DARK_THEME);
        }
    }

    /**
     * Crear el botón de toggle dinámicamente (si no existe en el HTML)
     */
    function createToggleButton() {
        const navbar = document.querySelector('.navbar-nav:last-child');
        if (!navbar || document.getElementById('themeToggleBtn')) return null;

        const li = document.createElement('li');
        li.className = 'nav-item d-flex align-items-center';

        const btn = document.createElement('button');
        btn.id = 'themeToggleBtn';
        btn.className = 'theme-toggle-btn';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Cambiar tema');

        const icon = document.createElement('i');
        icon.className = 'fas fa-sun';

        btn.appendChild(icon);
        li.appendChild(btn);

        // Insertar antes del dropdown de usuario
        const userDropdown = navbar.querySelector('.dropdown');
        if (userDropdown) {
            navbar.insertBefore(li, userDropdown);
        } else {
            navbar.appendChild(li);
        }

        return btn;
    }

    // Exponer funciones globales
    window.toggleTheme = toggleTheme;
    window.initTheme = initTheme;
    window.createToggleButton = createToggleButton;
    // Inicializar inmediatamente
    initTheme();

    console.log('✅ Theme Toggle Module cargado');
})();
