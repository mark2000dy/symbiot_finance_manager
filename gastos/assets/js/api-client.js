// ====================================================
// API CLIENT - SYMBIOT FINANCE MANAGER v3.1
// ====================================================
// Cliente universal para llamadas API con detección
// automática de rutas base (compatible con subdirectorios)
// Version: 3.1 - Dynamic Path Detection
// Última modificación: 2024-11-10
// ====================================================

(function(window) {
    'use strict';

    // ========================================
    // DETECCIÓN AUTOMÁTICA DE RUTA BASE
    // ========================================

    function detectBasePath() {
        // Obtener la ruta actual de la página
        const currentPath = window.location.pathname;

        // Buscar el índice donde empieza /gastos/
        const gastosIndex = currentPath.indexOf('/gastos/');

        if (gastosIndex !== -1) {
            // Extraer todo lo que está ANTES de /gastos/
            return currentPath.substring(0, gastosIndex);
        }

        // Fallback: sin subdirectorios (raíz del servidor)
        return '';
    }

    // Detectar base path al cargar el script
    const APP_BASE_PATH = detectBasePath();
    const API_BASE_URL = APP_BASE_PATH + '/gastos/api/index.php';

    // Exponer globalmente para acceso desde otros scripts
    window.APP_BASE_PATH = APP_BASE_PATH;
    window.API_BASE_URL = API_BASE_URL;

    // Log de configuración (solo en desarrollo)
    if (window.DEBUG_MODE || localStorage.getItem('debug') === 'true') {
        console.log('%c🔧 API CLIENT v3.1 - INITIALIZED', 'background: #222; color: #00ff00; font-size: 14px; font-weight: bold; padding: 8px;');
        console.log('  📍 Current Path:', window.location.pathname);
        console.log('  📂 Base Path:', APP_BASE_PATH || '(root)');
        console.log('  🌐 API Base URL:', API_BASE_URL);
    }

    // ========================================
    // FUNCIÓN PARA CONSTRUIR URLs DE LA API
    // ========================================

    /**
     * Construye una URL completa para un endpoint de la API
     * @param {string} endpoint - El endpoint sin el prefijo /gastos/api (ej: 'login', 'transacciones', 'user')
     * @returns {string} - URL completa
     *
     * Ejemplos:
     *   buildApiUrl('login') → '/symbiot/symbiot_finance_manager/gastos/api/index.php/login'
     *   buildApiUrl('transacciones') → '/symbiot/.../gastos/api/index.php/transacciones'
     *   buildApiUrl('/login') → '/symbiot/.../gastos/api/index.php/login' (quita / inicial)
     */
    function buildApiUrl(endpoint) {
        // Quitar / inicial si existe
        endpoint = endpoint.replace(/^\/+/, '');

        // Construir URL completa
        return API_BASE_URL + '/' + endpoint;
    }

    // ========================================
    // FUNCIÓN PRINCIPAL: apiFetch
    // ========================================

    /**
     * Realiza una petición a la API con configuración automática
     * @param {string} endpoint - El endpoint (ej: 'login', 'transacciones')
     * @param {Object} options - Opciones de fetch (method, body, headers, etc.)
     * @returns {Promise<{response: Response, data: Object}>}
     */
    async function apiFetch(endpoint, options = {}) {
        const url = buildApiUrl(endpoint);

        // Configuración por defecto
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'same-origin' // Incluir cookies/sesiones
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

        // Log de debug (si está activo)
        if (window.DEBUG_MODE || localStorage.getItem('debug') === 'true') {
            console.log(`%c🌐 API REQUEST`, 'background: #00aa00; color: white; font-weight: bold; padding: 4px;');
            console.log('   Method:', options.method || 'GET');
            console.log('   Endpoint:', endpoint);
            console.log('   Full URL:', url);
            console.log('   Options:', mergedOptions);
        }

        try {
            const response = await fetch(url, mergedOptions);

            // Intentar parsear JSON
            let data;
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // Si no es JSON, obtener texto
                const text = await response.text();
                console.warn('⚠️ Response is not JSON:', text);
                data = { error: 'Invalid response format', rawText: text };
            }

            // Log de debug
            if (window.DEBUG_MODE || localStorage.getItem('debug') === 'true') {
                console.log(`%c📡 API RESPONSE`, 'background: #0066cc; color: white; font-weight: bold; padding: 4px;');
                console.log('   Status:', response.status, response.statusText);
                console.log('   Data:', data);
            }

            return { response, data };

        } catch (error) {
            console.error(`%c❌ API ERROR`, 'background: #cc0000; color: white; font-weight: bold; padding: 4px;');
            console.error('   Endpoint:', endpoint);
            console.error('   URL:', url);
            console.error('   Error:', error);
            throw error;
        }
    }

    // ========================================
    // FUNCIONES HELPER (GET, POST, PUT, DELETE)
    // ========================================

    /**
     * Realiza una petición GET
     * @param {string} endpoint
     * @param {Object} params - Query parameters (opcional)
     * @returns {Promise<Object>} - Solo devuelve data
     */
    async function apiGet(endpoint, params = {}) {
        // Construir query string si hay params
        const queryString = Object.keys(params).length > 0
            ? '?' + new URLSearchParams(params).toString()
            : '';

        const { data } = await apiFetch(endpoint + queryString, {
            method: 'GET'
        });

        return data;
    }

    /**
     * Realiza una petición POST
     * @param {string} endpoint
     * @param {Object} body - Datos a enviar
     * @returns {Promise<Object>} - Solo devuelve data
     */
    async function apiPost(endpoint, body = {}) {
        const { data } = await apiFetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });

        return data;
    }

    /**
     * Realiza una petición PUT
     * @param {string} endpoint
     * @param {Object} body - Datos a enviar
     * @returns {Promise<Object>} - Solo devuelve data
     */
    async function apiPut(endpoint, body = {}) {
        const { data } = await apiFetch(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });

        return data;
    }

    /**
     * Realiza una petición DELETE
     * @param {string} endpoint
     * @returns {Promise<Object>} - Solo devuelve data
     */
    async function apiDelete(endpoint) {
        const { data } = await apiFetch(endpoint, {
            method: 'DELETE'
        });

        return data;
    }

    // ========================================
    // EXPORTAR FUNCIONES AL SCOPE GLOBAL
    // ========================================

    window.buildApiUrl = buildApiUrl;
    window.apiFetch = apiFetch;
    window.apiGet = apiGet;
    window.apiPost = apiPost;
    window.apiPut = apiPut;
    window.apiDelete = apiDelete;

    // ========================================
    // UTILIDADES ADICIONALES
    // ========================================

    /**
     * Habilita modo debug (logs detallados en consola)
     */
    window.enableApiDebug = function() {
        localStorage.setItem('debug', 'true');
        console.log('✅ API Debug mode enabled');
    };

    /**
     * Deshabilita modo debug
     */
    window.disableApiDebug = function() {
        localStorage.removeItem('debug');
        console.log('❌ API Debug mode disabled');
    };

    /**
     * Construye una ruta completa del frontend (para navegación)
     * @param {string} page - Página (ej: 'dashboard.html', 'gastos.html')
     * @returns {string} - Ruta completa
     */
    window.buildPageUrl = function(page) {
        // Quitar / inicial si existe
        page = page.replace(/^\/+/, '');
        return APP_BASE_PATH + '/gastos/' + page;
    };

    // ========================================
    // MANEJADOR DE ERRORES DE AUTENTICACIÓN
    // ========================================

    /**
     * Verifica si la respuesta indica sesión expirada
     * y redirige al login si es necesario
     */
    window.handleApiError = function(error, data) {
        if (data && data.error === 'No autorizado') {
            console.warn('🔒 Sesión expirada, redirigiendo a login...');
            window.location.href = window.buildPageUrl('login.html');
            return true;
        }
        return false;
    };

    // Mensaje de inicialización exitosa
    console.log('✅ API Client v3.1 initialized');

})(window);
