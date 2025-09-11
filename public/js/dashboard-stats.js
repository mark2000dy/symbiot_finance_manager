/* ====================================================
   DASHBOARD STATS MODULE - SYMBIOT FINANCIAL MANAGER
   Archivo: public/js/dashboard-stats.js
   Widget de estadísticas principales y selector de empresa
   ==================================================== */

// ============================================================
// 📊 FUNCIONES PRINCIPALES DE ESTADÍSTICAS
// ============================================================

/**
 * Cargar datos principales del dashboard
 */
async function loadDashboardData() {
    try {
        console.log('📊 Cargando estadísticas con filtro de empresa...');
        
        // Inicializar widget de alumnos si aplica
        console.log('🎓 Inicializando widget de gestión de alumnos...');
        
        // Construir query con filtro si existe
        let queryParam = '';
        if (currentCompanyFilter) {
            queryParam = `?empresa_id=${currentCompanyFilter}`;
        }
        
        console.log('📡 Solicitando estadísticas:', `/gastos/api/dashboard${queryParam}`);
        
        const response = await fetch(`/gastos/api/dashboard${queryParam}`);
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Estadísticas cargadas:', data.data);
            
            // Actualizar estadísticas principales
            updateMainStats(data.data);
            
            // Actualizar estadísticas de empresa si hay filtro
            if (currentCompanyFilter) {
                updateCompanyStats(data.data);
                
                // Mostrar widgets específicos de RockstarSkull
                if (currentCompanyFilter === '1') {
                    await loadRockstarSkullData();
                    showRockstarSkullIndicators();
                }
            }
            
        } else {
            throw new Error(data.message || 'Error cargando estadísticas');
        }
        
    } catch (error) {
        console.error('❌ Error cargando estadísticas del dashboard:', error);
        
        // Mostrar valores por defecto en caso de error
        resetMainStats();
        
        showAlert('warning', 'Error cargando algunas estadísticas. Mostrando datos disponibles.');
    }
}

/**
 *Actualizar estadísticas principales con estructura correcta
 */
function updateMainStats(data) {
    try {
        console.log('📊 Datos recibidos para actualizar estadísticas:', data);
        
        // Extraer datos del resumen
        const resumen = data.resumen || data;
        
        // Mapeo correcto de campos
        const elements = {
            'balanceTotal': resumen.balance || 0,
            'totalIngresos': resumen.total_ingresos || 0, 
            'totalGastos': resumen.total_gastos || 0,
            'esteMes': resumen.balance || 0
        };
        
        console.log('📊 Valores a actualizar:', elements);
        
        // Actualizar cada elemento en el DOM
        Object.entries(elements).forEach(([elementId, value]) => {
            const element = document.getElementById(elementId);
            if (element) {
                // Remover spinner de carga
                const loadingSpinner = element.querySelector('.loading-spinner');
                if (loadingSpinner) {
                    loadingSpinner.remove();
                }
                
                // Actualizar valor con formato de moneda
                element.textContent = formatCurrency(value);
                console.log(`✅ ${elementId} actualizado: ${formatCurrency(value)}`);
            } else {
                console.warn(`⚠️ Elemento ${elementId} no encontrado`);
            }
        });
        
        console.log('✅ Estadísticas principales actualizadas');
        
    } catch (error) {
        console.error('❌ Error actualizando estadísticas:', error);
    }
}

/**
 * Resetear estadísticas principales a valores por defecto
 */
function resetMainStats() {
    try {
        const elements = {
            'balanceTotal': '$0.00',
            'totalIngresos': '$0.00',
            'totalGastos': '$0.00',
            'esteMes': '$0.00'
        };
        
        Object.entries(elements).forEach(([elementId, defaultValue]) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = defaultValue;
                element.className = 'text-info mb-0'; // Color neutro
            }
        });
        
        console.log('🔄 Estadísticas principales reseteadas');
        
    } catch (error) {
        console.error('❌ Error reseteando estadísticas:', error);
    }
}

/**
 * Actualizar estadísticas específicas de empresa
 */
function updateCompanyStats(data) {
    try {
        // Actualizar balance de empresa en el selector
        const companyBalanceElement = document.getElementById('companyBalance');
        if (companyBalanceElement) {
            companyBalanceElement.textContent = formatCurrency(data.balance_general || 0);
        }
        
        // Actualizar número de transacciones
        const companyTransactionsElement = document.getElementById('companyTransactions');
        if (companyTransactionsElement) {
            companyTransactionsElement.textContent = data.total_transacciones || 0;
        }
        
        console.log('✅ Estadísticas de empresa actualizadas');
        
    } catch (error) {
        console.error('❌ Error actualizando estadísticas de empresa:', error);
    }
}

// ============================================================
// 🏢 FUNCIONES DEL SELECTOR DE EMPRESA
// ============================================================

/**
 * Manejar cambio de empresa en el selector
 */
async function handleCompanyFilterChange() {
    const companySelect = document.getElementById('companyFilter');
    const selectedCompany = companySelect.value;
    currentCompanyFilter = selectedCompany;
    
    console.log(`🏢 Filtro de empresa cambiado a: ${selectedCompany || 'Todas'}`);
    
    try {
        // Recargar datos con filtro
        await loadDashboardData();
        await loadRecentTransactions(1);
        await loadCompanyStats(selectedCompany);
        
        // Mostrar/ocultar widgets específicos de RockstarSkull
        const rockstarWidgets = document.getElementById('rockstarSkullWidgets');
        if (selectedCompany === '1') { 
            // RockstarSkull
            rockstarWidgets.style.display = 'block';
            await loadRockstarSkullData();
            showRockstarSkullIndicators();
            
            // Cargar lista de alumnos si existe la función
            if (typeof loadStudentsList === 'function') {
                loadStudentsList(1);
            }
        } else {
            // Otras empresas o todas
            rockstarWidgets.style.display = 'none';
            hideRockstarSkullIndicators();
        }
        
        // Actualizar URL sin recargar página (para bookmarks)
        updateURLWithCompanyFilter(selectedCompany);
        
        console.log(`✅ Dashboard actualizado para empresa: ${selectedCompany || 'Todas'}`);
        
    } catch (error) {
        console.error('❌ Error cambiando filtro de empresa:', error);
        showAlert('danger', 'Error aplicando filtro de empresa');
    }
}

/**
 * Cargar estadísticas específicas de empresa
 */
async function loadCompanyStats(companyId) {
    try {
        let queryParam = companyId ? `?empresa_id=${companyId}` : '';
        
        console.log(`📊 Cargando estadísticas de empresa: ${companyId || 'Todas'}`);
        
        const response = await fetch(`/gastos/api/dashboard${queryParam}`);
        const data = await response.json();
        
        if (data.success) {
            // Actualizar estadísticas principales
            updateMainStats(data.data);
            
            // Actualizar estadísticas del selector
            updateCompanyStats(data.data);
            
            console.log(`✅ Estadísticas de empresa ${companyId || 'general'} cargadas`);
            
        } else {
            throw new Error(data.message || 'Error cargando estadísticas de empresa');
        }
        
    } catch (error) {
        console.error('❌ Error cargando estadísticas de empresa:', error);
        throw error;
    }
}

/**
 * Actualizar URL con filtro de empresa (para bookmarks)
 */
function updateURLWithCompanyFilter(companyId) {
    try {
        const url = new URL(window.location);
        
        if (companyId) {
            url.searchParams.set('empresa', companyId);
        } else {
            url.searchParams.delete('empresa');
        }
        
        // Actualizar URL sin recargar página
        window.history.replaceState({}, '', url);
        
    } catch (error) {
        console.error('❌ Error actualizando URL:', error);
    }
}

/**
 * Cargar filtro de empresa desde URL
 */
function loadCompanyFilterFromURL() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const empresaParam = urlParams.get('empresa');
        
        if (empresaParam) {
            currentCompanyFilter = empresaParam;
            
            // Actualizar selector
            const companySelect = document.getElementById('companyFilter');
            if (companySelect) {
                companySelect.value = empresaParam;
            }
            
            console.log(`🔗 Filtro de empresa cargado desde URL: ${empresaParam}`);
        }
        
    } catch (error) {
        console.error('❌ Error cargando filtro desde URL:', error);
    }
}

// ============================================================
// 🎸 FUNCIONES ESPECÍFICAS DE ROCKSTAR SKULL
// ============================================================

/**
 * Cargar datos específicos de RockstarSkull
 */
async function loadRockstarSkullData() {
    try {
        console.log('🎸 Cargando datos específicos de RockstarSkull...');
        
        // Cargar alertas de pagos si existe la función
        if (typeof refreshPaymentAlerts === 'function') {
            await refreshPaymentAlerts();
        }
        
        // Cargar maestros y estadísticas específicas
        await loadTeachersStats();
        
        // Cargar distribución de clases
        await loadClassDistribution();
        
        console.log('✅ Datos de RockstarSkull cargados');
        
    } catch (error) {
        console.error('❌ Error cargando datos de RockstarSkull:', error);
    }
}

/**
 * Cargar estadísticas de maestros
 */
async function loadTeachersStats() {
    try {
        console.log('👨‍🏫 Cargando estadísticas de maestros...');
        
        // Por ahora simulamos datos de maestros
        // En el futuro se puede cargar desde API
        const teachersStats = [
            { id: 1, name: 'Hugo Vazquez', specialty: 'Guitarra', students: 0, active: true },
            { id: 2, name: 'Julio Olvera', specialty: 'Batería', students: 0, active: true },
            { id: 3, name: 'Demian Andrade', specialty: 'Batería', students: 0, active: true },
            { id: 4, name: 'Irwin Hernandez', specialty: 'Guitarra', students: 0, active: true },
            { id: 5, name: 'Nahomy Perez', specialty: 'Canto', students: 0, active: true },
            { id: 6, name: 'Luis Blanquet', specialty: 'Bajo', students: 0, active: true },
            { id: 7, name: 'Manuel Reyes', specialty: 'Teclado', students: 0, active: true },
            { id: 8, name: 'Harim Lopez', specialty: 'Teclado', students: 0, active: true }
        ];
        
        // Renderizar estadísticas de maestros si hay contenedor
        renderTeachersStats(teachersStats);
        
        console.log('✅ Estadísticas de maestros cargadas');
        
    } catch (error) {
        console.error('❌ Error cargando estadísticas de maestros:', error);
    }
}

/**
 * Renderizar estadísticas de maestros
 */
function renderTeachersStats(teachers) {
    const container = document.getElementById('teachersStatsContainer');
    
    if (!container) {
        console.log('⚠️ Contenedor de estadísticas de maestros no encontrado');
        return;
    }
    
    container.innerHTML = `
        <div class="row">
            ${teachers.map(teacher => `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card teacher-card">
                        <div class="card-body text-center">
                            <div class="teacher-avatar mb-2">
                                <i class="${getClassIcon(teacher.specialty)} fa-2x text-primary"></i>
                            </div>
                            <h6 class="card-title">${teacher.name}</h6>
                            <p class="card-text text-muted">${teacher.specialty}</p>
                            <div class="teacher-stats">
                                <small class="text-success">
                                    <i class="fas fa-users me-1"></i>
                                    ${teacher.students} alumnos
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Cargar distribución de clases
 */
async function loadClassDistribution() {
    try {
        console.log('🎼 Cargando distribución de clases...');
        
        // Simular datos de distribución de clases
        // En el futuro se cargará desde API de alumnos
        const classDistribution = [
            { clase: 'Guitarra', count: 0, percentage: 0 },
            { clase: 'Teclado', count: 0, percentage: 0 },
            { clase: 'Batería', count: 0, percentage: 0 },
            { clase: 'Bajo', count: 0, percentage: 0 },
            { clase: 'Canto', count: 0, percentage: 0 }
        ];
        
        // Renderizar distribución si hay contenedor
        renderClassDistribution(classDistribution);
        
        console.log('✅ Distribución de clases cargada');
        
    } catch (error) {
        console.error('❌ Error cargando distribución de clases:', error);
    }
}

/**
 * Renderizar distribución de clases
 */
function renderClassDistribution(distribution) {
    const container = document.getElementById('classDistributionContainer');
    
    if (!container) {
        console.log('⚠️ Contenedor de distribución de clases no encontrado');
        return;
    }
    
    const totalStudents = distribution.reduce((sum, item) => sum + item.count, 0);
    
    container.innerHTML = `
        <div class="class-distribution">
            <h6 class="mb-3">
                <i class="fas fa-chart-pie me-2"></i>
                Distribución de Clases
                <small class="text-muted">(${totalStudents} alumnos totales)</small>
            </h6>
            ${distribution.map(item => {
                const percentage = totalStudents > 0 ? Math.round((item.count / totalStudents) * 100) : 0;
                return `
                    <div class="class-item mb-2">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <i class="${getClassIcon(item.clase)} me-2 text-${getClassColor(item.clase)}"></i>
                                <strong>${item.clase}</strong>
                            </div>
                            <div>
                                <span class="badge bg-${getClassColor(item.clase)}">${item.count}</span>
                                <small class="text-muted ms-1">(${percentage}%)</small>
                            </div>
                        </div>
                        <div class="progress mt-1" style="height: 4px;">
                            <div class="progress-bar bg-${getClassColor(item.clase)}" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

/**
 * Mostrar indicadores específicos de RockstarSkull
 */
function showRockstarSkullIndicators() {
    console.log('🎸 Mostrando indicadores de RockstarSkull');
    
    // Cambiar título del dashboard
    const dashboardTitle = document.querySelector('.main-content h2');
    if (dashboardTitle) {
        dashboardTitle.innerHTML = '<i class="fas fa-guitar me-2"></i>Dashboard RockstarSkull';
    }
    
    // Mostrar indicadores específicos si existen
    const currentStudentsIndicator = document.getElementById('currentStudentsIndicator');
    const pendingStudentsIndicator = document.getElementById('pendingStudentsIndicator');
    
    if (currentStudentsIndicator) currentStudentsIndicator.style.display = 'block';
    if (pendingStudentsIndicator) pendingStudentsIndicator.style.display = 'block';
}

/**
 * Ocultar indicadores específicos de RockstarSkull
 */
function hideRockstarSkullIndicators() {
    console.log('🏢 Ocultando indicadores específicos de RockstarSkull');
    
    // Restaurar título del dashboard
    const dashboardTitle = document.querySelector('.main-content h2');
    if (dashboardTitle) {
        dashboardTitle.innerHTML = '<i class="fas fa-chart-pie me-2"></i>Dashboard Financiero';
    }
    
    // Ocultar indicadores específicos
    const currentStudentsIndicator = document.getElementById('currentStudentsIndicator');
    const pendingStudentsIndicator = document.getElementById('pendingStudentsIndicator');
    
    if (currentStudentsIndicator) currentStudentsIndicator.style.display = 'none';
    if (pendingStudentsIndicator) pendingStudentsIndicator.style.display = 'none';
}

// ============================================================
// 📈 FUNCIONES DE GRÁFICOS Y VISUALIZACIONES
// ============================================================

/**
 * Crear gráfico de balance mensual (si Chart.js está disponible)
 */
function createBalanceChart(data) {
    if (typeof Chart === 'undefined') {
        console.log('⚠️ Chart.js no disponible, saltando creación de gráfico');
        return;
    }
    
    try {
        const canvas = document.getElementById('balanceChart');
        if (!canvas) {
            console.log('⚠️ Canvas para gráfico de balance no encontrado');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels || [],
                datasets: [{
                    label: 'Balance Mensual',
                    data: data.values || [],
                    borderColor: '#EB1616',
                    backgroundColor: 'rgba(235, 22, 22, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#ffffff'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#ffffff',
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
        
        console.log('✅ Gráfico de balance creado');
        
    } catch (error) {
        console.error('❌ Error creando gráfico de balance:', error);
    }
}

// ============================================================
// 🔄 FUNCIONES DE ACTUALIZACIÓN AUTOMÁTICA
// ============================================================

/**
 * Iniciar actualización automática de estadísticas
 */
function startStatsAutoRefresh() {
    // Actualizar estadísticas cada 5 minutos
    setInterval(async () => {
        try {
            console.log('🔄 Auto-actualización de estadísticas...');
            await loadDashboardData();
        } catch (error) {
            console.error('❌ Error en auto-actualización:', error);
        }
    }, 5 * 60 * 1000); // 5 minutos
    
    console.log('🔄 Auto-actualización de estadísticas iniciada (cada 5 minutos)');
}

// ============================================================
// 🔗 EXPOSICIÓN DE FUNCIONES GLOBALES
// ============================================================

// Funciones principales
window.loadDashboardData = loadDashboardData;
window.handleCompanyChange = handleCompanyChange;
window.loadCompanyStats = loadCompanyStats;

// Funciones de RockstarSkull
window.loadRockstarSkullData = loadRockstarSkullData;
window.showRockstarSkullIndicators = showRockstarSkullIndicators;
window.hideRockstarSkullIndicators = hideRockstarSkullIndicators;

// Funciones de utilidad
window.updateMainStats = updateMainStats;
window.resetMainStats = resetMainStats;
window.updateCompanyStats = updateCompanyStats;
window.loadCompanyFilterFromURL = loadCompanyFilterFromURL;
window.startStatsAutoRefresh = startStatsAutoRefresh;

// Funciones de visualización
window.createBalanceChart = createBalanceChart;
window.renderTeachersStats = renderTeachersStats;
window.renderClassDistribution = renderClassDistribution;

console.log('✅ Dashboard Stats Module cargado - Funciones de estadísticas disponibles');

// 🔗 EXPOSICIÓN DE FUNCIONES GLOBALES CRÍTICAS
window.handleCompanyChange = handleCompanyChange;
window.loadDashboardData = loadDashboardData;
window.handleCompanyFilterChange = handleCompanyChange; // Alias para compatibilidad

// Exponer función global para el HTML
window.handleCompanyFilterChange = handleCompanyFilterChange;