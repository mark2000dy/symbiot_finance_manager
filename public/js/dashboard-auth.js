/* ====================================================
   DASHBOARD AUTH MODULE - SYMBIOT FINANCIAL MANAGER
   Archivo: public/js/dashboard-auth.js
   Gestión de autenticación y permisos de usuario
   ==================================================== */

// ============================================================
// 👤 FUNCIONES DE AUTENTICACIÓN
// ============================================================

/**
 * Verificar si el usuario está autenticado
 */
async function checkAuthentication() {
    try {
        console.log('🔐 Verificando autenticación del usuario...');
        
        // Intentar cargar información del usuario actual
        const response = await fetch('/gastos/api/user', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.user) {
                currentUser = data.user;
                console.log(`✅ Usuario autenticado: ${currentUser.nombre} (${currentUser.rol})`);
                return true;
            }
        }
        
        // Si llegamos aquí, no hay sesión válida
        console.log('❌ Usuario no autenticado');
        return false;
        
    } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
        return false;
    }
}

/**
 * Redireccionar al login si no está autenticado
 */
async function requireAuthentication() {
    const isAuthenticated = await checkAuthentication();
    
    if (!isAuthenticated) {
        console.log('🔒 Redirigiendo al login...');
        
        // Mostrar mensaje temporal
        showAlert('warning', 'Sesión expirada. Redirigiendo al login...', 2000);
        
        // Redireccionar después de un breve delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
        return false;
    }
    
    return true;
}

/**
 * Cargar y mostrar información del usuario en la interfaz
 */
async function loadAndDisplayUserInfo() {
    try {
        if (!currentUser) {
            const isAuth = await checkAuthentication();
            if (!isAuth) {
                return false;
            }
        }
        
        // Actualizar elementos del DOM con información del usuario
        updateUserInterface();
        
        // Configurar permisos en la interfaz
        configureUserPermissions();
        
        console.log('✅ Información del usuario cargada en la interfaz');
        return true;
        
    } catch (error) {
        console.error('❌ Error cargando información del usuario:', error);
        return false;
    }
}

/**
 * Actualizar elementos de la interfaz con información del usuario
 */
function updateUserInterface() {
    if (!currentUser) {
        console.warn('⚠️ No hay información del usuario para mostrar');
        return;
    }
    
    // Actualizar nombre del usuario en navbar
    const userNameElements = document.querySelectorAll('#userName, #userNameDisplay');
    userNameElements.forEach(element => {
        if (element) {
            element.textContent = currentUser.nombre;
        }
    });
    
    // Actualizar información adicional si existe
    const userRoleElement = document.getElementById('userRole');
    if (userRoleElement) {
        userRoleElement.textContent = currentUser.rol;
    }
    
    const userEmailElement = document.getElementById('userEmail');
    if (userEmailElement) {
        userEmailElement.textContent = currentUser.email;
    }
    
    console.log(`✅ Interfaz actualizada para: ${currentUser.nombre}`);
}

/**
 * Configurar permisos y visibilidad de elementos según el rol del usuario
 */
function configureUserPermissions() {
    if (!currentUser) {
        console.warn('⚠️ No hay información del usuario para configurar permisos');
        return;
    }
    
    const isAdmin = currentUser.rol === 'admin';
    const isManager = currentUser.rol === 'manager';
    const isUser = currentUser.rol === 'user';
    
    console.log(`🔑 Configurando permisos para rol: ${currentUser.rol}`);
    
    // Elementos solo para administradores
    const adminOnlyElements = document.querySelectorAll('[data-auth="admin"]');
    adminOnlyElements.forEach(element => {
        element.style.display = isAdmin ? 'block' : 'none';
    });
    
    // Elementos para administradores y managers
    const managerElements = document.querySelectorAll('[data-auth="manager"]');
    managerElements.forEach(element => {
        element.style.display = (isAdmin || isManager) ? 'block' : 'none';
    });
    
    // Botones de eliminación (solo administradores)
    const deleteButtons = document.querySelectorAll('.btn-danger[onclick*="delete"]');
    deleteButtons.forEach(button => {
        if (isAdmin) {
            button.style.display = 'inline-block';
            button.disabled = false;
        } else {
            button.style.display = 'none';
            button.disabled = true;
        }
    });
    
    // Configurar permisos específicos del módulo de alumnos
    configureStudentsModulePermissions();
    
    // Configurar permisos específicos del módulo de transacciones
    configureTransactionsModulePermissions();
    
    console.log('✅ Permisos configurados según el rol del usuario');
}

/**
 * Configurar permisos específicos del módulo de alumnos
 */
function configureStudentsModulePermissions() {
    if (!currentUser) return;
    
    const isAdmin = currentUser.rol === 'admin';
    const isManager = currentUser.rol === 'manager';
    
    // Botón de nuevo alumno (managers y admins)
    const newStudentButton = document.querySelector('button[onclick="showAddStudentModal()"]');
    if (newStudentButton) {
        newStudentButton.style.display = (isAdmin || isManager) ? 'inline-block' : 'none';
    }
    
    // Botones de edición en tabla de alumnos (todos pueden ver, pero no editar)
    const editStudentButtons = document.querySelectorAll('button[onclick*="editStudent"]');
    editStudentButtons.forEach(button => {
        if (isAdmin || isManager) {
            button.disabled = false;
            button.title = 'Editar alumno';
        } else {
            button.disabled = true;
            button.title = 'Sin permisos para editar';
        }
    });
    
    console.log('✅ Permisos del módulo de alumnos configurados');
}

/**
 * Configurar permisos específicos del módulo de transacciones
 */
function configureTransactionsModulePermissions() {
    if (!currentUser) return;
    
    const isAdmin = currentUser.rol === 'admin';
    const isManager = currentUser.rol === 'manager';
    
    // Botón de nueva transacción (managers y admins)
    const newTransactionButton = document.querySelector('button[onclick="showAddTransactionModal()"]');
    if (newTransactionButton) {
        newTransactionButton.style.display = (isAdmin || isManager) ? 'inline-block' : 'none';
    }
    
    // Botones de edición de transacciones
    const editTransactionButtons = document.querySelectorAll('button[onclick*="editTransaction"]');
    editTransactionButtons.forEach(button => {
        if (isAdmin || isManager) {
            button.disabled = false;
            button.title = 'Editar transacción';
        } else {
            button.disabled = true;
            button.title = 'Sin permisos para editar';
        }
    });
    
    console.log('✅ Permisos del módulo de transacciones configurados');
}

// ============================================================
// 🔒 FUNCIONES DE SEGURIDAD Y VALIDACIÓN
// ============================================================

/**
 * Verificar si el usuario tiene permisos para una acción específica
 */
function hasPermission(action) {
    if (!currentUser) {
        console.warn('⚠️ No hay usuario autenticado para verificar permisos');
        return false;
    }
    
    const userRole = currentUser.rol;
    
    // Definir permisos por acción
    const permissions = {
        // Permisos de lectura (todos los usuarios autenticados)
        'view_dashboard': ['admin', 'manager', 'user'],
        'view_transactions': ['admin', 'manager', 'user'],
        'view_students': ['admin', 'manager', 'user'],
        
        // Permisos de escritura (managers y admins)
        'create_transaction': ['admin', 'manager'],
        'edit_transaction': ['admin', 'manager'],
        'create_student': ['admin', 'manager'],
        'edit_student': ['admin', 'manager'],
        
        // Permisos de eliminación (solo admins)
        'delete_transaction': ['admin'],
        'delete_student': ['admin'],
        'bulk_operations': ['admin'],
        
        // Permisos administrativos (solo admins)
        'manage_users': ['admin'],
        'system_settings': ['admin'],
        'export_data': ['admin', 'manager']
    };
    
    const allowedRoles = permissions[action];
    
    if (!allowedRoles) {
        console.warn(`⚠️ Acción no definida en permisos: ${action}`);
        return false;
    }
    
    const hasAccess = allowedRoles.includes(userRole);
    
    console.log(`🔑 Permiso para '${action}': ${hasAccess ? '✅ Permitido' : '❌ Denegado'} (rol: ${userRole})`);
    
    return hasAccess;
}

/**
 * Middleware para verificar permisos antes de ejecutar una acción
 */
function requirePermission(action, callback, ...args) {
    if (hasPermission(action)) {
        return callback(...args);
    } else {
        showAlert('warning', 'No tienes permisos para realizar esta acción');
        console.warn(`🚫 Acción '${action}' denegada para usuario: ${currentUser?.nombre} (${currentUser?.rol})`);
        return false;
    }
}

/**
 * Verificar token de sesión y renovar si es necesario
 */
async function validateAndRefreshSession() {
    try {
        console.log('🔄 Validando sesión activa...');
        
        const response = await fetch('/gastos/api/user', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Sesión válida');
                return true;
            }
        }

        console.log('❌ Sesión inválida');
        return false;
        
    } catch (error) {
        console.error('❌ Error validando sesión:', error);
        return false;
    }
}

/**
 * Refrescar la sesión del usuario
 */
async function refreshSession() {
    try {
        console.log('🔄 Verificando sesión...');
        
        const response = await fetch('/gastos/api/user', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Sesión válida');
                return true;
            }
        }
        
        console.log('❌ Sesión inválida');
        return false;
        
    } catch (error) {
        console.error('❌ Error verificando sesión:', error);
        return false;
    }
}

// ============================================================
// 🚪 FUNCIONES DE CIERRE DE SESIÓN
// ============================================================

/**
 * Cerrar sesión del usuario
 */
async function logout() {
    try {
        console.log('🚪 Cerrando sesión...');
        
        // Mostrar confirmación
        const confirmLogout = confirm('¿Estás seguro de que quieres cerrar sesión?');
        if (!confirmLogout) {
            console.log('🚫 Cierre de sesión cancelado');
            return;
        }
        
        // Mostrar loading
        showAlert('info', 'Cerrando sesión...', 2000);
        
        // Llamar API de logout
        const response = await fetch('/gastos/api/logout', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        // Limpiar datos locales independientemente de la respuesta
        currentUser = null;
        window.recentTransactionsCache = [];
        studentsData = [];
        
        // Limpiar localStorage si se usa
        try {
            localStorage.removeItem('dashboardPreferences');
            sessionStorage.clear();
        } catch (e) {
            // Ignorar errores de storage
        }
        
        console.log('✅ Sesión cerrada correctamente');
        
        // Redireccionar al login
        window.location.href = '/gastos/login.html';
        
    } catch (error) {
        console.error('❌ Error cerrando sesión:', error);
        
        // Forzar redirección al login aunque falle la API
        showAlert('warning', 'Error cerrando sesión. Redirigiendo al login...', 2000);
        setTimeout(() => {
            window.location.href = '/gastos/login.html';
        }, 2000);
    }
}

/**
 * Manejar cierre de sesión por inactividad
 */
function handleInactivityLogout() {
    console.log('⏰ Sesión cerrada por inactividad');
    
    showAlert('warning', 'Tu sesión ha expirado por inactividad. Redirigiendo al login...', 3000);
    
    setTimeout(() => {
        window.location.href = '/gastos/login.html';
    }, 3000);
}

// ============================================================
// ⏰ FUNCIONES DE MONITOREO DE SESIÓN
// ============================================================

/**
 * Iniciar monitoreo de sesión
 */
function startSessionMonitoring() {
    // Verificar sesión cada 10 minutos
    setInterval(async () => {
        const isValid = await validateAndRefreshSession();
        
        if (!isValid) {
            console.log('🔒 Sesión inválida detectada durante monitoreo');
            handleInactivityLogout();
        }
    }, 10 * 60 * 1000); // 10 minutos
    
    // Detectar actividad del usuario para resetear el timer de inactividad
    let inactivityTimer;
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos
    
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            handleInactivityLogout();
        }, INACTIVITY_TIMEOUT);
    }
    
    // Eventos que indican actividad del usuario
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true);
    });
    
    // Inicializar timer
    resetInactivityTimer();
    
    console.log('✅ Monitoreo de sesión iniciado');
}

// ============================================================
// 🔗 EXPOSICIÓN DE FUNCIONES GLOBALES
// ============================================================

// Funciones de autenticación
window.checkAuthentication = checkAuthentication;
window.requireAuthentication = requireAuthentication;
window.loadAndDisplayUserInfo = loadAndDisplayUserInfo;

// Funciones de permisos
window.hasPermission = hasPermission;
window.requirePermission = requirePermission;
window.configureUserPermissions = configureUserPermissions;

// Funciones de sesión
window.validateAndRefreshSession = validateAndRefreshSession;
window.refreshSession = refreshSession;
window.logout = logout;
window.startSessionMonitoring = startSessionMonitoring;

// Funciones de utilidad
window.updateUserInterface = updateUserInterface;
window.handleInactivityLogout = handleInactivityLogout;

console.log('✅ Dashboard Auth Module cargado - Funciones de autenticación disponibles');