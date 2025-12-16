/**
 * API Client v3.1.3
 * Cliente para comunicación con la API del Sistema de Gastos
 * Compatible con Plesk PHP 8.1.33 y AppServ 9.3.0
 *
 * CHANGELOG v3.1.3:
 * - Agregados helpers HTTP: apiGet, apiPost, apiPut, apiDelete
 * - Compatibilidad completa con dashboard modules
 *
 * CHANGELOG v3.1.2:
 * - Detección automática de base path para soportar múltiples entornos
 * - Funciona en local (ej: /symbiot/symbiot_finance_manager/gastos) y producción (/gastos)
 */

(function(window) {
    'use strict';

    // ==========================================
    // CONFIGURACIÓN
    // ==========================================

    /**
     * Detectar automáticamente la base path de la aplicación
     * Busca '/gastos/' en la ruta actual y extrae todo hasta ahí
     *
     * Ejemplos:
     * - /symbiot/symbiot_finance_manager/gastos/login.html → /symbiot/symbiot_finance_manager/gastos
     * - /gastos/login.html → /gastos
     * - /produccion/gastos/dashboard.html → /produccion/gastos
     */
    function detectBasePath() {
        const currentPath = window.location.pathname;

        // Buscar '/gastos/' en la ruta
        const gastosIndex = currentPath.indexOf('/gastos/');

        if (gastosIndex !== -1) {
            // Encontramos '/gastos/', extraer todo hasta (e incluyendo) gastos
            return currentPath.substring(0, gastosIndex + 7); // 7 = length of '/gastos'
        }

        // Si estamos exactamente en '/gastos' sin slash final
        if (currentPath === '/gastos' || currentPath.startsWith('/gastos?')) {
            return '/gastos';
        }

        // Fallback: buscar si la ruta termina en /gastos
        if (currentPath.endsWith('/gastos')) {
            return currentPath;
        }

        // Último fallback: usar /gastos fijo (para producción estándar)
        console.warn('⚠️ No se pudo detectar base path automáticamente, usando /gastos');
        return '/gastos';
    }

    // Detectar base path dinámicamente
    const APP_BASE_PATH = detectBasePath();
    const API_PATH = '/api/index.php';

    // URL completa de la API
    const API_BASE_URL = APP_BASE_PATH + API_PATH;

    console.log('✅ API Client v3.1.3 initialized');
    console.log('📂 Base Path (auto-detected):', APP_BASE_PATH);
    console.log('🌐 API URL:', API_BASE_URL);
    console.log('🔍 Current location:', window.location.pathname);

    // ==========================================
    // FUNCIONES DE UTILIDAD
    // ==========================================

    /**
     * Construir URL de página
     */
    function buildPageUrl(page) {
        const cleanPage = page.replace(/^\/+/, '');
        return `${APP_BASE_PATH}/${cleanPage}`;
    }

    /**
     * Realizar petición a la API
     */
    async function apiFetch(endpoint, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin'
        };

        // Merge options
        const fetchOptions = { ...defaultOptions, ...options };

        // Si hay headers adicionales, hacer merge
        if (options.headers) {
            fetchOptions.headers = { ...defaultOptions.headers, ...options.headers };
        }

        // Agregar token si existe
        const token = sessionStorage.getItem('auth_token');
        if (token) {
            fetchOptions.headers['Authorization'] = `Bearer ${token}`;
        }

        // Construir URL completa
        const cleanEndpoint = endpoint.replace(/^\/+/, '');
        const url = `${API_BASE_URL}/${cleanEndpoint}`;

        console.log(`🚀 API Request: ${fetchOptions.method} ${url}`);

        try {
            const response = await fetch(url, fetchOptions);
            
            // Log de respuesta
            console.log(`📥 API Response: ${response.status} ${response.statusText}`);

            // Intentar parsear JSON
            const contentType = response.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // Si no es JSON, obtener como texto
                const text = await response.text();
                console.warn('⚠️ Respuesta no es JSON:', text.substring(0, 200));
                
                // Intentar parsear de todas formas
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    data = {
                        success: false,
                        error: 'Respuesta no válida del servidor',
                        raw: text.substring(0, 500)
                    };
                }
            }

            // Si la respuesta HTTP no es OK, marcar como error
            if (!response.ok) {
                data.success = false;
                if (!data.error) {
                    data.error = `Error ${response.status}: ${response.statusText}`;
                }
            }

            return data;

        } catch (error) {
            console.error('❌ API Error:', error);
            return {
                success: false,
                error: error.message || 'Error de conexión con el servidor'
            };
        }
    }

    /**
     * Verificar salud de la API
     */
    async function checkHealth() {
        try {
            const response = await apiFetch('health');
            return response;
        } catch (error) {
            console.error('❌ Health check failed:', error);
            return {
                success: false,
                error: 'No se pudo conectar con la API'
            };
        }
    }

    /**
     * Login
     */
    async function login(username, password) {
        return await apiFetch('login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    /**
     * Logout
     */
    async function logout() {
        const response = await apiFetch('logout', {
            method: 'POST'
        });
        
        // Limpiar storage
        sessionStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        
        return response;
    }

    /**
     * Verificar autenticación
     */
    function isAuthenticated() {
        return !!sessionStorage.getItem('auth_token');
    }

    /**
     * Obtener datos del usuario
     */
    function getUserData() {
        const data = localStorage.getItem('user_data');
        return data ? JSON.parse(data) : null;
    }

    /**
     * Guardar datos del usuario
     */
    function setUserData(userData) {
        localStorage.setItem('user_data', JSON.stringify(userData));
    }

    /**
     * Guardar token
     */
    function setAuthToken(token) {
        sessionStorage.setItem('auth_token', token);
    }

    /**
     * Redirigir a página
     */
    function redirect(page) {
        const url = buildPageUrl(page);
        console.log('🔄 Redirecting to:', url);
        window.location.href = url;
    }

    /**
     * Helper: GET request
     */
    async function apiGet(endpoint, params = {}) {
        let url = endpoint;

        // Si hay parámetros, construir query string
        if (Object.keys(params).length > 0) {
            const queryString = new URLSearchParams(params).toString();
            url = `${endpoint}?${queryString}`;
        }

        return await apiFetch(url, { method: 'GET' });
    }

    /**
     * Helper: POST request
     */
    async function apiPost(endpoint, data = {}) {
        return await apiFetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Helper: PUT request
     */
    async function apiPut(endpoint, data = {}) {
        return await apiFetch(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * Helper: DELETE request
     */
    async function apiDelete(endpoint) {
        return await apiFetch(endpoint, {
            method: 'DELETE'
        });
    }

    /**
     * Mostrar notificación
     */
    function showNotification(message, type = 'info') {
        // Si existe una función global showToast, usarla
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
            return;
        }

        // Si no, usar alert simple
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        if (type === 'error') {
            alert(`Error: ${message}`);
        } else if (type === 'success') {
            console.log(`✅ ${message}`);
        }
    }

    // ==========================================
    // EXPORTAR API PÚBLICA
    // ==========================================

    window.APIClient = {
        // Configuración
        APP_BASE_PATH,
        API_BASE_URL,
        
        // Funciones de utilidad
        buildPageUrl,
        redirect,
        showNotification,
        
        // Funciones de API
        apiFetch,
        checkHealth,
        
        // Autenticación
        login,
        logout,
        isAuthenticated,
        getUserData,
        setUserData,
        setAuthToken,
        
        // Alias para compatibilidad
        fetch: apiFetch
    };

    // También exportar como variables globales para compatibilidad
    window.APP_BASE_PATH = APP_BASE_PATH;
    window.API_BASE_URL = API_BASE_URL;
    window.apiFetch = apiFetch;
    window.buildPageUrl = buildPageUrl;

    // Exportar helpers HTTP
    window.apiGet = apiGet;
    window.apiPost = apiPost;
    window.apiPut = apiPut;
    window.apiDelete = apiDelete;

    console.log('✅ APIClient ready');
    console.log('📦 Available methods:', Object.keys(window.APIClient));

})(window);