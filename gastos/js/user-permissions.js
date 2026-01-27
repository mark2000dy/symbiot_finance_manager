/* ====================================================
   USER PERMISSIONS MODULE - SYMBIOT FINANCIAL MANAGER
   Archivo: gastos/js/user-permissions.js
   Control de permisos y visibilidad por usuario

   Version: 1.1.0
   - Permisos por página (allowedPages)
   - Control de navegación (ocultar links)
   - Widgets específicos por usuario (Escuela)
   - Aplicación inmediata sin setTimeout
   ==================================================== */

// Definición de permisos por email de usuario
const USER_PERMISSIONS = {
    // Administradores con acceso total
    'marco.delgado@symbiot.com.mx': {
        role: 'admin',
        allowedPages: ['dashboard.html', 'gastos.html', 'ingresos.html', 'reportes.html'],
        canFilterAllEmpresas: true,
        canViewStatsCards: true,
        canViewCompanySelector: true,
        canViewMaestrosWidget: true,
        canViewNavGastos: true,
        canViewNavIngresos: true,
        canViewNavReportes: true,
        empresasPermitidas: ['1', '2', ''] // 1=RockstarSkull, 2=Symbiot, ''=Todas
    },
    'antonio.razo@symbiot.com.mx': {
        role: 'admin',
        allowedPages: ['dashboard.html', 'gastos.html', 'ingresos.html', 'reportes.html'],
        canFilterAllEmpresas: true,
        canViewStatsCards: true,
        canViewCompanySelector: true,
        canViewMaestrosWidget: true,
        canViewNavGastos: true,
        canViewNavIngresos: true,
        canViewNavReportes: true,
        empresasPermitidas: ['1', '2', '']
    },

    // Usuario con acceso limitado a RockstarSkull - acceso a todas las páginas
    'hvazquez@rockstarskull.com': {
        role: 'user',
        allowedPages: ['dashboard.html', 'gastos.html', 'ingresos.html', 'reportes.html'],
        canFilterAllEmpresas: false,
        canViewStatsCards: true,
        canViewCompanySelector: true,
        canViewMaestrosWidget: true,
        canViewNavGastos: true,
        canViewNavIngresos: true,
        canViewNavReportes: true,
        empresasPermitidas: ['1'] // Solo RockstarSkull
    },

    // Escuela - solo dashboard con widgets específicos
    'escuela@rockstarskull.com': {
        role: 'viewer',
        allowedPages: ['dashboard.html'],
        canFilterAllEmpresas: false,
        canViewStatsCards: false,
        canViewCompanySelector: false,
        canViewMaestrosWidget: false,
        canViewNavGastos: false,
        canViewNavIngresos: false,
        canViewNavReportes: false,
        empresasPermitidas: ['1'] // Solo RockstarSkull
    }
};

// Permisos por defecto para usuarios no listados
const DEFAULT_PERMISSIONS = {
    role: 'user',
    allowedPages: ['dashboard.html'],
    canFilterAllEmpresas: false,
    canViewStatsCards: true,
    canViewCompanySelector: true,
    canViewMaestrosWidget: true,
    canViewNavGastos: false,
    canViewNavIngresos: false,
    canViewNavReportes: false,
    empresasPermitidas: ['1']
};

// Flag para evitar doble aplicación
let _permissionsApplied = false;

/**
 * Obtener email del usuario actual desde localStorage
 * 🔧 FALLBACK: Si localStorage está vacío, intenta obtener desde currentUser global
 */
function getCurrentUserEmail() {
    try {
        const userDataStr = localStorage.getItem('user_data');
        if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            return userData.email || null;
        }
        
        // 🔧 FALLBACK: Si localStorage está vacío, intentar obtener desde currentUser global
        // (Ocurre cuando se borra localStorage pero hay sesión PHP activa)
        if (typeof window.currentUser !== 'undefined' && window.currentUser && window.currentUser.email) {
            console.log('⚠️  Usando currentUser como fallback para email');
            return window.currentUser.email;
        }
        
        return null;
    } catch (e) {
        console.warn('⚠️  Error obteniendo email del usuario:', e);
        
        // 🔧 FALLBACK: Intentar obtener desde currentUser si hay error en JSON
        if (typeof window.currentUser !== 'undefined' && window.currentUser && window.currentUser.email) {
            console.log('⚠️  Usando currentUser como fallback después de error');
            return window.currentUser.email;
        }
        
        return null;
    }
}

/**
 * Obtener permisos del usuario actual
 */
function getUserPermissions() {
    const email = getCurrentUserEmail();
    if (!email) {
        return DEFAULT_PERMISSIONS;
    }
    return USER_PERMISSIONS[email] || DEFAULT_PERMISSIONS;
}

/**
 * Verificar si el usuario puede acceder a la página actual
 * Si no tiene acceso, redirige al dashboard
 */
function checkPageAccess() {
    const permissions = getUserPermissions();
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';

    if (!permissions.allowedPages.includes(currentPage)) {
        window.location.href = 'dashboard.html';
        return false;
    }
    return true;
}

/**
 * Aplicar restricción de empresa al filtro global del dashboard
 * DEBE llamarse ANTES de cualquier carga de datos
 */
function applyEmpresaRestriction() {
    const permissions = getUserPermissions();

    if (!permissions.canFilterAllEmpresas && permissions.empresasPermitidas.length === 1) {
        const empresaId = permissions.empresasPermitidas[0];
        if (empresaId) {
            window.currentCompanyFilter = empresaId;
            localStorage.setItem('dashboardCompanyFilter', empresaId);
        }
    }
}

/**
 * Re-aplicar permisos del usuario (llamado después de cambios de contexto)
 * Útil cuando los datos se recargan o el usuario cambia
 */
function reapplyUserPermissions() {
    console.log('🔄 Re-aplicando permisos del usuario...');
    applyEmpresaRestriction();
    applyUserPermissions();
    setupEmpresaFilterInterceptor();
    
    // Si existe la función de permisos específicos del widget, llamarla
    if (typeof window.applyStudentsWidgetPermissions === 'function') {
        window.applyStudentsWidgetPermissions();
    }
    
    console.log('✅ Permisos re-aplicados completamente');
}

/**
 * Aplicar permisos al DOM - Ocultar/mostrar widgets, nav links y filtrar dropdowns
 */
function applyUserPermissions() {
    const permissions = getUserPermissions();

    // 1. Ocultar Statistics Cards
    if (!permissions.canViewStatsCards) {
        const statsCards = document.getElementById('statisticsCardsRow');
        if (statsCards) statsCards.style.display = 'none';
    }

    // 2. Ocultar Company Selector Widget
    if (!permissions.canViewCompanySelector) {
        const companySelector = document.getElementById('companySelectorWidget');
        if (companySelector) companySelector.style.display = 'none';
    }

    // 3. Ocultar Widget Maestros
    if (!permissions.canViewMaestrosWidget) {
        const maestrosWidget = document.getElementById('maestrosWidget');
        if (maestrosWidget) maestrosWidget.style.display = 'none';
    }

    // 4. Ocultar links de navegación según permisos
    if (!permissions.canViewNavGastos) {
        const navGastos = document.getElementById('navLinkGastos');
        if (navGastos) navGastos.style.display = 'none';
    }
    if (!permissions.canViewNavIngresos) {
        const navIngresos = document.getElementById('navLinkIngresos');
        if (navIngresos) navIngresos.style.display = 'none';
    }
    if (!permissions.canViewNavReportes) {
        const navReportes = document.getElementById('navLinkReportes');
        if (navReportes) navReportes.style.display = 'none';
    }

    // 5. Filtrar opciones del dropdown de empresa
    filterEmpresaOptions(permissions);

    // 6. Si el usuario solo puede ver una empresa, forzar el filtro
    if (!permissions.canFilterAllEmpresas && permissions.empresasPermitidas.length === 1) {
        const empresaId = permissions.empresasPermitidas[0];
        if (empresaId) {
            forceEmpresaFilter(empresaId);
        }
    }

    _permissionsApplied = true;
}

/**
 * Filtrar opciones del dropdown de empresa según permisos
 */
function filterEmpresaOptions(permissions) {
    const selectorIds = [
        'companyFilter',       // Dashboard
        'filterEmpresa',       // Reportes, Gastos, Ingresos
        'transactionEmpresa',  // Modal transacciones (dashboard)
        'transactionCompany',  // Modal transacciones (dashboard alt)
        'empresaFilter'        // Otros filtros
    ];

    selectorIds.forEach(id => {
        const selector = document.getElementById(id);
        if (!selector) return;

        const options = selector.querySelectorAll('option');
        options.forEach(option => {
            const value = option.value;
            let shouldShow = false;

            if (value === '') {
                shouldShow = permissions.canFilterAllEmpresas;
            } else {
                shouldShow = permissions.empresasPermitidas.includes(value);
            }

            if (!shouldShow) {
                option.style.display = 'none';
                option.disabled = true;
            } else {
                option.style.display = '';
                option.disabled = false;
            }
        });

        // Si solo hay una empresa permitida, seleccionarla automáticamente
        if (!permissions.canFilterAllEmpresas && permissions.empresasPermitidas.length === 1) {
            const empresaId = permissions.empresasPermitidas[0];
            if (empresaId && selector.value !== empresaId) {
                selector.value = empresaId;
            }
        }
    });
}

/**
 * Forzar el filtro de empresa a un valor específico
 * NO dispara eventos - solo establece el valor del select
 */
function forceEmpresaFilter(empresaId) {
    const companyFilter = document.getElementById('companyFilter');
    if (companyFilter && companyFilter.value !== empresaId) {
        companyFilter.value = empresaId;
        window.currentCompanyFilter = empresaId;
    }

    const filterEmpresa = document.getElementById('filterEmpresa');
    if (filterEmpresa && filterEmpresa.value !== empresaId) {
        filterEmpresa.value = empresaId;
    }
}

/**
 * Verificar si el usuario puede acceder a una empresa específica
 */
function canAccessEmpresa(empresaId) {
    const permissions = getUserPermissions();
    if (permissions.canFilterAllEmpresas) {
        return true;
    }
    return permissions.empresasPermitidas.includes(empresaId);
}

/**
 * Interceptar cambios en el filtro de empresa para validar permisos
 */
function setupEmpresaFilterInterceptor() {
    const selectorIds = ['companyFilter', 'filterEmpresa'];

    selectorIds.forEach(id => {
        const selector = document.getElementById(id);
        if (!selector) return;

        selector.addEventListener('change', function(e) {
            const permissions = getUserPermissions();
            const selectedValue = this.value;

            if (!canAccessEmpresa(selectedValue)) {
                const allowedValue = permissions.empresasPermitidas[0] || '1';
                this.value = allowedValue;
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }, true);
    });
}

// ✅ REMOVED: Duplicated window exposure at line 315-322
// All functions are now exposed at the end of the file

// APLICACIÓN INMEDIATA: Restricción de empresa ANTES de que cargue el DOM
applyEmpresaRestriction();

// Aplicar permisos DOM cuando el DOM esté listo (SIN delay)
document.addEventListener('DOMContentLoaded', function() {
    applyUserPermissions();
    setupEmpresaFilterInterceptor();
});

// Fallback: re-aplicar cuando la ventana termine decargar
window.addEventListener('load', function() {
    if (!_permissionsApplied) {
        applyUserPermissions();
        setupEmpresaFilterInterceptor();
    }
});

// ====================================================
// PERMISSION CHECKING FUNCTIONS
// ====================================================

/**
 * Checks if the current user has permission for a specific action.
 * This is the central source of truth for action-level permissions on the frontend.
 * @param {string} action - The action to check (e.g., 'create_student', 'delete_transaction').
 * @returns {boolean} - True if the user has permission, false otherwise.
 */
function hasPermission(action) {
    const permissions = getUserPermissions();
    if (!permissions || !permissions.role) return false;

    const userRole = permissions.role;

    // Defines which roles can perform which actions.
    // UPDATED: Viewer role (Escuela) can now create and edit both students and transactions
    const rolePermissions = {
        // View permissions
        'view_dashboard': ['admin', 'manager', 'user', 'viewer'],
        'view_transactions': ['admin', 'manager', 'user', 'viewer'],
        'view_students': ['admin', 'manager', 'user', 'viewer'],

        // Transaction CRUD - Viewer can create and edit
        'create_transaction': ['admin', 'manager', 'viewer'],
        'edit_transaction': ['admin', 'manager', 'viewer'],
        'delete_transaction': ['admin', 'viewer'],

        // Student CRUD - Viewer can create and edit (Escuela needs this)
        'create_student': ['admin', 'manager', 'viewer'],
        'edit_student': ['admin', 'manager', 'viewer'],
        'delete_student': ['admin', 'viewer'],

        // Other permissions
        'export_data': ['admin', 'manager'],
        'bulk_operations': ['admin'],
        'manage_users': ['admin'],
        'system_settings': ['admin']
    };

    const allowedRoles = rolePermissions[action];
    if (!allowedRoles) {
        console.warn(`Action not defined in permissions map: ${action}`);
        return false;
    }

    return allowedRoles.includes(userRole);
}

/**
 * Convenience function to check if the current user is an admin.
 * @returns {boolean} - True if the user is an admin.
 */
function isUserAdmin() {
    const permissions = getUserPermissions();
    return permissions.role === 'admin';
}

// Expose permission functions globally so other modules can use them
window.hasPermission = hasPermission;
window.isUserAdmin = isUserAdmin;
window.reapplyUserPermissions = reapplyUserPermissions;
window.getUserPermissions = getUserPermissions;
window.applyUserPermissions = applyUserPermissions;
window.applyEmpresaRestriction = applyEmpresaRestriction;
window.canAccessEmpresa = canAccessEmpresa;
window.getCurrentUserEmail = getCurrentUserEmail;
window.setupEmpresaFilterInterceptor = setupEmpresaFilterInterceptor;
window.checkPageAccess = checkPageAccess;
