/* ====================================================
   USER PERMISSIONS MODULE - SYMBIOT FINANCIAL MANAGER
   Archivo: gastos/js/user-permissions.js
   Control de permisos y visibilidad por usuario

   Version: 1.0.0
   ==================================================== */

// Definición de permisos por email de usuario
const USER_PERMISSIONS = {
    // Administradores con acceso total
    'marco.delgado@symbiot.com.mx': {
        role: 'admin',
        canFilterAllEmpresas: true,
        canViewStatsCards: true,
        canViewCompanySelector: true,
        canViewMaestrosWidget: true,
        empresasPermitidas: ['1', '2', ''] // 1=RockstarSkull, 2=Symbiot, ''=Todas
    },
    'antonio.razo@symbiot.com.mx': {
        role: 'admin',
        canFilterAllEmpresas: true,
        canViewStatsCards: true,
        canViewCompanySelector: true,
        canViewMaestrosWidget: true,
        empresasPermitidas: ['1', '2', '']
    },

    // Usuario con acceso limitado a RockstarSkull
    'hvazquez@rockstarskull.com': {
        role: 'user',
        canFilterAllEmpresas: false,
        canViewStatsCards: true,
        canViewCompanySelector: true,
        canViewMaestrosWidget: true,
        empresasPermitidas: ['1'] // Solo RockstarSkull
    },

    // Usuario escuela - acceso muy limitado
    'escuela@rockstarskull.com': {
        role: 'viewer',
        canFilterAllEmpresas: false,
        canViewStatsCards: false,
        canViewCompanySelector: false,
        canViewMaestrosWidget: false,
        empresasPermitidas: ['1'] // Solo RockstarSkull
    }
};

// Permisos por defecto para usuarios no listados
const DEFAULT_PERMISSIONS = {
    role: 'user',
    canFilterAllEmpresas: false,
    canViewStatsCards: true,
    canViewCompanySelector: true,
    canViewMaestrosWidget: true,
    empresasPermitidas: ['1'] // Por defecto solo RockstarSkull
};

/**
 * Obtener permisos del usuario actual
 * @returns {Object} Permisos del usuario
 */
function getUserPermissions() {
    // Obtener usuario de sessionStorage (guardado por dashboard-auth.js)
    const userDataStr = sessionStorage.getItem('user_data');
    if (!userDataStr) {
        return DEFAULT_PERMISSIONS;
    }

    try {
        const userData = JSON.parse(userDataStr);
        const email = userData.email || '';
        return USER_PERMISSIONS[email] || DEFAULT_PERMISSIONS;
    } catch (e) {
        return DEFAULT_PERMISSIONS;
    }
}

/**
 * Aplicar permisos al DOM
 * Debe llamarse después de que la página cargue y el usuario esté autenticado
 */
function applyUserPermissions() {
    const permissions = getUserPermissions();

    // 1. Ocultar Statistics Cards si no tiene permiso
    if (!permissions.canViewStatsCards) {
        const statsCards = document.getElementById('statisticsCardsRow');
        if (statsCards) {
            statsCards.style.display = 'none';
        }
    }

    // 2. Ocultar Company Selector Widget si no tiene permiso
    if (!permissions.canViewCompanySelector) {
        const companySelector = document.getElementById('companySelectorWidget');
        if (companySelector) {
            companySelector.style.display = 'none';
        }
    }

    // 3. Ocultar Widget Maestros si no tiene permiso
    if (!permissions.canViewMaestrosWidget) {
        const maestrosWidget = document.getElementById('maestrosWidget');
        if (maestrosWidget) {
            maestrosWidget.style.display = 'none';
        }
    }

    // 4. Filtrar opciones del dropdown de empresa
    filterEmpresaOptions(permissions.empresasPermitidas);

    // 5. Si el usuario tiene empresa forzada, seleccionarla
    if (!permissions.canFilterAllEmpresas && permissions.empresasPermitidas.length === 1) {
        forceEmpresaFilter(permissions.empresasPermitidas[0]);
    }
}

/**
 * Filtrar opciones del dropdown de empresa según permisos
 * @param {Array} empresasPermitidas - IDs de empresas permitidas
 */
function filterEmpresaOptions(empresasPermitidas) {
    // Buscar todos los selectores de empresa en la página
    const selectors = [
        document.getElementById('companyFilter'),      // Dashboard
        document.getElementById('filterEmpresa'),      // Reportes
        document.getElementById('transactionEmpresa'), // Modal transacciones
        document.getElementById('empresaFilter')       // Otros filtros
    ];

    selectors.forEach(selector => {
        if (!selector) return;

        // Obtener todas las opciones
        const options = selector.querySelectorAll('option');
        options.forEach(option => {
            const value = option.value;
            // Si el valor no está en las empresas permitidas, ocultar la opción
            // Excepto si es '' (Todas) y el usuario puede ver todas
            if (value === '' && !empresasPermitidas.includes('')) {
                option.style.display = 'none';
                option.disabled = true;
            } else if (value !== '' && !empresasPermitidas.includes(value)) {
                option.style.display = 'none';
                option.disabled = true;
            }
        });

        // Si solo hay una empresa permitida, seleccionarla
        if (empresasPermitidas.length === 1 && empresasPermitidas[0] !== '') {
            selector.value = empresasPermitidas[0];
        }
    });
}

/**
 * Forzar el filtro de empresa a un valor específico
 * @param {string} empresaId - ID de la empresa a forzar
 */
function forceEmpresaFilter(empresaId) {
    const selectors = [
        { el: document.getElementById('companyFilter'), handler: 'handleCompanyChange' },
        { el: document.getElementById('filterEmpresa'), handler: 'applyFilters' }
    ];

    selectors.forEach(({ el, handler }) => {
        if (el && el.value !== empresaId) {
            el.value = empresaId;
            // Disparar el evento change para que se apliquen los filtros
            if (typeof window[handler] === 'function') {
                window[handler]();
            }
        }
    });
}

/**
 * Verificar si el usuario tiene permiso para una acción específica
 * @param {string} action - Acción a verificar
 * @returns {boolean}
 */
function hasPermission(action) {
    const permissions = getUserPermissions();
    switch (action) {
        case 'filterAllEmpresas':
            return permissions.canFilterAllEmpresas;
        case 'viewStatsCards':
            return permissions.canViewStatsCards;
        case 'viewCompanySelector':
            return permissions.canViewCompanySelector;
        case 'viewMaestrosWidget':
            return permissions.canViewMaestrosWidget;
        default:
            return false;
    }
}

/**
 * Verificar si el usuario puede acceder a una empresa específica
 * @param {string} empresaId - ID de la empresa
 * @returns {boolean}
 */
function canAccessEmpresa(empresaId) {
    const permissions = getUserPermissions();
    return permissions.empresasPermitidas.includes(empresaId) ||
           permissions.empresasPermitidas.includes('');
}

// Exponer funciones globalmente
window.getUserPermissions = getUserPermissions;
window.applyUserPermissions = applyUserPermissions;
window.hasPermission = hasPermission;
window.canAccessEmpresa = canAccessEmpresa;

// Aplicar permisos cuando el DOM esté listo y el usuario autenticado
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un momento para que se carguen los datos del usuario
    setTimeout(applyUserPermissions, 500);
});
