// ====================================================
// CONFIGURACIÓN AUTOMÁTICA DE RUTAS - API BASE PATH
// Archivo: gastos/assets/api-config.js
// ====================================================

/**
 * Detecta automáticamente la ruta base del proyecto
 * Funciona en cualquier ubicación: localhost, subdirectorios, dominios
 */
(function() {
    // Obtener la ruta del script actual
    const currentScript = document.currentScript || document.querySelector('script[src*="api-config"]');

    if (currentScript) {
        const scriptPath = currentScript.src;
        const url = new URL(scriptPath);

        // Extraer el pathname hasta /gastos/
        let pathname = url.pathname;
        const gastosIndex = pathname.indexOf('/gastos/');

        if (gastosIndex !== -1) {
            // Ruta hasta gastos/ (sin incluir gastos/)
            window.APP_BASE_PATH = pathname.substring(0, gastosIndex);
            window.API_BASE_URL = window.APP_BASE_PATH + '/gastos/api/index.php';
        } else {
            // Fallback: asumir raíz
            window.APP_BASE_PATH = '';
            window.API_BASE_URL = '/gastos/api/index.php';
        }
    } else {
        // Fallback si no se puede detectar
        window.APP_BASE_PATH = '';
        window.API_BASE_URL = '/gastos/api/index.php';
    }

    console.log('🔧 Configuración de API:');
    console.log('   Base Path:', window.APP_BASE_PATH);
    console.log('   API URL:', window.API_BASE_URL);

    // Helper para construir URLs de la API
    window.buildApiUrl = function(endpoint) {
        // Quitar / inicial si existe
        endpoint = endpoint.replace(/^\//, '');
        return window.API_BASE_URL + '/' + endpoint;
    };

    // Helper para fetch a la API
    window.apiFetch = async function(endpoint, options = {}) {
        const url = window.buildApiUrl(endpoint);

        // Agregar headers por defecto
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        // Merge options
        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...(options.headers || {})
            }
        };

        console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

        try {
            const response = await fetch(url, mergedOptions);
            const data = await response.json();

            console.log(`📡 API Response [${response.status}]:`, data);

            return { response, data };
        } catch (error) {
            console.error('❌ API Error:', error);
            throw error;
        }
    };

})();
