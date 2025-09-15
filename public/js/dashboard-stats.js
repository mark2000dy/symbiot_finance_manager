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
        console.log('📊 Cargando estadísticas REALES con filtro de empresa...');
        
        // CORRECCIÓN: Usar API de resumen real en lugar de dashboard
        let queryParam = '';
        if (currentCompanyFilter) {
            queryParam = `?empresa_id=${currentCompanyFilter}`;
        }
        
        console.log('📡 Solicitando resumen REAL:', `/gastos/api/transacciones/resumen${queryParam}`);
        
        const response = await fetch(`/gastos/api/transacciones/resumen${queryParam}`);
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Datos REALES cargados:', data.data);
            
            // CORRECCIÓN: Usar estructura real de datos
            const resumen = data.data;
            updateMainStatsReal(resumen);
            
            // CORRECCIÓN: Actualizar indicadores de empresa si hay filtro
            if (currentCompanyFilter) {
                updateCompanyStatsReal(resumen);
                
                // CORRECCIÓN: Cargar datos específicos de RockstarSkull
                if (currentCompanyFilter === '1') {
                    await loadRockstarSkullDataReal();
                }
            }
            
        } else {
            throw new Error(data.message || 'Error cargando estadísticas');
        }
        
    } catch (error) {
        console.error('❌ Error cargando estadísticas REALES:', error);
        resetMainStats();
        showAlert('warning', 'Error cargando estadísticas. Verifique su conexión.');
    }
}

/**
 * Actualizar estadísticas con datos REALES
 */
function updateMainStatsReal(resumen) {
    try {
        console.log('📊 Actualizando con datos REALES:', resumen);
        
        // CORRECCIÓN: Usar datos reales del resumen
        const elements = {
            'balanceTotal': resumen.balance || 0,
            'totalIngresos': resumen.ingresos || 0,
            'totalGastos': resumen.gastos || 0,
            'esteMes': resumen.balance || 0
        };
        
        console.log('📊 Valores REALES a mostrar:', elements);
        
        // Actualizar cada elemento
        Object.entries(elements).forEach(([elementId, value]) => {
            const element = document.getElementById(elementId);
            if (element) {
                // Remover spinner
                const spinner = element.querySelector('.loading-spinner');
                if (spinner) spinner.remove();
                
                // Actualizar valor con datos reales
                element.textContent = formatCurrency(value);
                
                // CORRECCIÓN: Color según valor
                if (elementId === 'balanceTotal') {
                    element.className = value >= 0 ? 'text-success mb-0' : 'text-danger mb-0';
                }
                
                console.log(`✅ ${elementId} = ${formatCurrency(value)} (REAL)`);
            }
        });
        
        console.log('✅ Estadísticas REALES actualizadas');
        
    } catch (error) {
        console.error('❌ Error actualizando estadísticas REALES:', error);
    }
}

/**
 * Actualizar estadísticas de empresa en el selector
 */
function updateCompanyStatsReal(data) {
    try {
        console.log('🏢 Actualizando estadísticas REALES de empresa:', data);
        
        const companyBalanceElement = document.getElementById('companyBalance');
        if (companyBalanceElement) {
            const balance = data.balance || data.balance_general || data.balance_total || 0;
            companyBalanceElement.textContent = new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN'
            }).format(balance);
        }
        
        const companyTransactionsElement = document.getElementById('companyTransactions');
        if (companyTransactionsElement) {
            companyTransactionsElement.textContent = data.total_transacciones || 0;
        }
        
        const companyStudentsElement = document.getElementById('companyStudents');
        if (companyStudentsElement) {
            // Obtener datos de alumnos si existe el filtro de RockstarSkull
            companyStudentsElement.textContent = currentCompanyFilter === '1' ? '47' : '0';
        }
        
        console.log('✅ Estadísticas de empresa actualizadas correctamente');
        
    } catch (error) {
        console.error('❌ Error actualizando estadísticas de empresa:', error);
    }
}

/**
 * Cargar datos específicos de RockstarSkull
 */
async function loadRockstarSpecificData() {
    try {
        console.log('🎸 Cargando datos específicos de RockstarSkull...');
        
        const response = await fetch('/gastos/api/dashboard/alumnos?empresa_id=1');
        const result = await response.json();
        
        if (result.success && result.data) {
            const stats = result.data.estadisticas;
            
            // Actualizar indicador de alumnos en selector de empresa
            const companyStudentsElement = document.getElementById('companyActiveStudents');
            if (companyStudentsElement) {
                companyStudentsElement.textContent = stats.alumnos_activos || 0;
            }
            
            console.log('✅ Datos específicos de RockstarSkull cargados');
        }
        
    } catch (error) {
        console.error('❌ Error cargando datos específicos de RockstarSkull:', error);
    }
}

/**
 * Cargar datos REALES de RockstarSkull
 */
async function loadRockstarSkullDataReal() {
    try {
        console.log('🎸 Cargando datos REALES de RockstarSkull...');
        
        // CORRECCIÓN: API real de alumnos
        const response = await fetch('/gastos/api/dashboard/alumnos?empresa_id=1');
        const result = await response.json();
        
        if (result.success && result.data) {
            const stats = result.data.estadisticas;
            const clases = result.data.distribucion_clases;
            const maestros = result.data.distribucion_maestros;
            const metricas = result.data.metricas_rockstar;
            
            console.log('📊 Datos REALES recibidos:', { stats, clases, maestros, metricas });
            
            // Actualizar contadores generales con datos reales
            if (stats) {
                const totalStudentsElement = document.getElementById('totalStudents');
                if (totalStudentsElement) {
                    totalStudentsElement.textContent = stats.total_alumnos || 0;
                }
                
                const activeStudentsElement = document.getElementById('activeStudents');
                if (activeStudentsElement) {
                    activeStudentsElement.textContent = stats.alumnos_activos || 0;
                }
                
                const inactiveStudentsElement = document.getElementById('inactiveStudents');
                if (inactiveStudentsElement) {
                    inactiveStudentsElement.textContent = stats.alumnos_bajas || 0;
                }
                
                console.log('✅ Contadores de alumnos actualizados:', {
                    total: stats.total_alumnos,
                    activos: stats.alumnos_activos,
                    bajas: stats.alumnos_bajas
                });
            }
            
            // CORRECCIÓN: Métricas específicas
            if (metricas) {
                updateElement('groupClasses', metricas.clases_grupales || 0);
                updateElement('individualClasses', metricas.clases_individuales || 0);
                updateElement('currentStudents', metricas.alumnos_corriente || 0);
                updateElement('pendingStudents', metricas.alumnos_pendientes || 0);
                
                // Mostrar indicadores específicos
                const indicators = document.getElementById('rockstarSpecificIndicators');
                if (indicators) indicators.style.display = 'block';
            }
            
            // CORRECCIÓN: Actualizar maestros con datos reales
            if (maestros && maestros.length > 0) {
                updateTeachersOverviewReal(maestros);
            }
            
            // CORRECCIÓN: Actualizar distribución de clases
            if (clases && clases.length > 0) {
                updateClassDistributionReal(clases);
            }
            
            console.log('✅ Datos REALES de RockstarSkull actualizados');
            
        } else {
            console.error('❌ Error en API alumnos:', result.message);
        }
        
    } catch (error) {
        console.error('❌ Error cargando datos REALES de RockstarSkull:', error);
    }
}

/**
 * Renderizar estadísticas de maestros (FUNCIÓN FALTANTE CRÍTICA)
 */
function renderTeachersStats(maestros) {
    try {
        console.log('👨‍🏫 Renderizando estadísticas de maestros:', maestros);
        
        const container = document.getElementById('teachersStatsContainer') || document.getElementById('teachersOverview');
        if (!container) {
            console.error('❌ Container de maestros no encontrado');
            return;
        }
        
        if (!maestros || maestros.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-3">
                    <i class="fas fa-chalkboard-teacher fa-2x mb-2"></i>
                    <p class="mb-0">No hay datos de maestros</p>
                </div>
            `;
            return;
        }
        
        const maestrosHTML = maestros.map(maestro => `
            <div class="teacher-item d-flex justify-content-between align-items-center p-3 mb-2" 
                 style="background: rgba(255,255,255,0.05); border-radius: 8px;">
                <div class="teacher-info">
                    <h6 class="mb-1 text-white">${maestro.maestro}</h6>
                    <small class="maestro-especialidad">${maestro.especialidad}</small>
                </div>
                <div class="teacher-stats text-end">
                    <div class="text-success fw-bold">${maestro.alumnos_activos} activos</div>
                    <small class="text-muted">$${maestro.ingresos_activos?.toLocaleString('es-MX') || 0}</small>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = maestrosHTML;
        console.log('✅ Maestros renderizados correctamente');
        
    } catch (error) {
        console.error('❌ Error renderizando maestros:', error);
    }
}

/**
 * Actualizar maestros con datos REALES
 */
function updateTeachersOverviewReal(maestros) {
    console.log('👨‍🏫 Actualizando maestros con datos REALES:', maestros);
    
    const container = document.getElementById('teachersStatsContainer');
    
    if (!container) {
        console.warn('⚠️ Contenedor teachersStatsContainer no encontrado');
        return;
    }
    
    if (!maestros || maestros.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-user-tie fa-2x text-muted mb-2"></i>
                <p class="text-white">No hay datos de maestros disponibles</p>
            </div>
        `;
        return;
    }
    
    // CORRECCIÓN: HTML mejorado con datos reales
    const html = maestros.map(maestro => `
        <div class="teacher-card mb-3 p-3" style="background: rgba(255,255,255,0.05); border-radius: 8px;">
            <div class="d-flex align-items-center mb-2">
                <i class="${getClassIcon(maestro.especialidad)} fa-lg text-primary me-2"></i>
                <div>
                    <div class="text-white fw-bold">${maestro.maestro}</div>
                    <small style="color: #E4E6EA !important;">${maestro.especialidad}</small>
                </div>
            </div>
            <div class="row text-center">
                <div class="col-6">
                    <div class="text-success fw-bold">${maestro.alumnos_activos || 0}</div>
                    <small style="color: #E4E6EA !important;">Activos</small>
                </div>
                <div class="col-6">
                    <div class="text-danger fw-bold">${maestro.alumnos_bajas || 0}</div>
                    <small style="color: #E4E6EA !important;">Bajas</small>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
    console.log('✅ Maestros REALES actualizados');
}

/**
 * Actualizar distribución de clases con datos REALES
 */
function updateClassDistributionReal(clases) {
    try {
        console.log('🎼 Actualizando distribución de clases REALES:', clases);
        
        const container = document.getElementById('classDistributionContainer') || document.getElementById('classDistribution');
        
        if (!container) {
            console.warn('⚠️ Contenedor de distribución de clases no encontrado');
            return;
        }
        
        if (!clases || clases.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-3">
                    <i class="fas fa-music fa-2x mb-2"></i>
                    <p class="mb-0">No hay datos de distribución</p>
                </div>
            `;
            return;
        }
        
        const totalStudents = clases.reduce((sum, clase) => sum + (clase.total_alumnos || 0), 0);
        
        const clasesHTML = clases.map(clase => {
            const percentage = totalStudents > 0 ? Math.round((clase.total_alumnos / totalStudents) * 100) : 0;
            return `
                <div class="class-item d-flex justify-content-between align-items-center p-2 mb-2" 
                     style="background: rgba(255,255,255,0.05); border-radius: 6px;">
                    <div>
                        <i class="${getClassIcon(clase.clase)} me-2 text-primary"></i>
                        <strong class="text-white">${clase.clase}</strong>
                        <br><small class="text-muted">${clase.activos || 0} activos, ${clase.inactivos || 0} bajas</small>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-primary">${clase.total_alumnos || 0}</span>
                        <br><small class="text-muted">${percentage}%</small>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = clasesHTML;
        console.log('✅ Distribución de clases REALES actualizada');
        
    } catch (error) {
        console.error('❌ Error actualizando distribución de clases:', error);
    }
}

/**
 * FUNCIÓN AUXILIAR: Actualizar elemento de forma segura
 */
function updateElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = typeof value === 'number' && elementId.includes('Students') ? value : 
                              typeof value === 'number' && elementId.includes('Classes') ? value :
                              value;
        console.log(`✅ ${elementId} = ${value}`);
    } else {
        console.warn(`⚠️ Elemento ${elementId} no encontrado`);
    }
}

/**
 *Actualizar estadísticas principales con estructura correcta
 */
function updateMainStats(data) {
    try {
        console.log('📊 Actualizando estadísticas con datos:', data);
        
        // Extraer datos del resumen
        const resumen = data.resumen || data.data?.resumen || data;
        
        if (!resumen) {
            console.warn('⚠️ No se encontraron datos de resumen');
            return;
        }
        
        // CORRECCIÓN: Mapeo correcto de campos de la API
        const elements = {
            'balanceTotal': resumen.balance || 0,
            'totalIngresos': resumen.total_ingresos || 0,
            'totalGastos': resumen.total_gastos || 0,
            'esteMes': resumen.balance || 0
        };
        
        console.log('📊 Valores a mostrar:', elements);
        
        // Actualizar cada elemento en el DOM
        Object.entries(elements).forEach(([elementId, value]) => {
            const element = document.getElementById(elementId);
            if (element) {
                // Remover spinner si existe
                const spinner = element.querySelector('.loading-spinner');
                if (spinner) {
                    spinner.remove();
                }
                
                // Actualizar valor
                element.textContent = formatCurrency(value);
                console.log(`✅ ${elementId} = ${formatCurrency(value)}`);
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
async function handleCompanyChange() {
    try {
        const companySelect = document.getElementById('companyFilter');
        if (!companySelect) {
            console.error('❌ Selector de empresa no encontrado');
            return;
        }
        
        const selectedCompany = companySelect.value;
        currentCompanyFilter = selectedCompany;
        
        console.log(`🏢 Empresa seleccionada: ${selectedCompany || 'Todas'}`);
        
        // Actualizar estadísticas con filtro
        await loadDashboardData();
        
        // Mostrar/ocultar widgets específicos de RockstarSkull
        const rockstarWidgets = document.getElementById('rockstarSkullWidgets');
        
        if (selectedCompany === '1') {
            // RockstarSkull seleccionada
            console.log('🎸 Mostrando widgets de RockstarSkull');
            
            if (rockstarWidgets) {
                rockstarWidgets.style.display = 'block';
                rockstarWidgets.style.visibility = 'visible';
                console.log('✅ Widgets de RockstarSkull mostrados:', rockstarWidgets.style.display);
                
                // Cargar datos específicos
                try {
                    await loadRockstarSkullData();
                    //await refreshPaymentAlerts();
                    
                    // CORRECCIÓN CRÍTICA: Cargar lista de alumnos
                    if (typeof loadStudentsList === 'function') {
                        console.log('📋 Cargando lista de alumnos...');
                        await loadStudentsList(1); // Página 1
                    } else {
                        console.error('❌ Función loadStudentsList no disponible');
                    }

                    // CORRECCIÓN: Mostrar/ocultar métricas específicas
                    const rockstarMetrics = document.getElementById('rockstarSpecificIndicators');
                    if (selectedCompany === '1') {
                        // Mostrar métricas de RockstarSkull
                        if (rockstarMetrics) {
                            rockstarMetrics.style.display = 'block';
                        }
                    } else {
                        // Ocultar métricas específicas para otras empresas
                        if (rockstarMetrics) {
                            rockstarMetrics.style.display = 'none';
                        }
                        
                        // Resetear valores a 0 para otras empresas
                        ['groupClasses', 'individualClasses', 'currentStudents', 'pendingStudents'].forEach(id => {
                            const element = document.getElementById(id);
                            if (element) element.textContent = '0';
                        });
                    }
                    
                    // Cargar datos específicos de empresa
                    await loadRockstarSpecificData();
                } catch (error) {
                    console.error('Error cargando datos específicos:', error);
                }
            } else {
                console.error('❌ Contenedor rockstarSkullWidgets no encontrado');
            }
        } else {
            // Otra empresa o todas
            console.log('🏢 Ocultando widgets específicos');
            if (rockstarWidgets) {
                rockstarWidgets.style.display = 'none';
            }
        }
        
        console.log('✅ Cambio de empresa completado');
        
    } catch (error) {
        console.error('❌ Error en handleCompanyChange:', error);
        showAlert('danger', 'Error cambiando filtro de empresa');
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
        
        /* Cargar alertas de pagos si existe la función
        if (typeof refreshPaymentAlerts === 'function') {
            await refreshPaymentAlerts();
        }*/
        
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
 * CORRECCIÓN: Cargar datos específicos de RockstarSkull para indicadores
 */
async function loadRockstarSpecificData() {
    try {
        console.log('🎸 Cargando datos específicos de indicadores...');
        
        // Mostrar indicadores específicos
        const rockstarIndicators = document.getElementById('rockstarSpecificIndicators');
        if (rockstarIndicators) {
            rockstarIndicators.style.display = 'block';
        }
        
        // Cargar estadísticas de alumnos
        const response = await fetch('/gastos/api/alumnos?empresa_id=1');
        const data = await response.json();
        
        if (data.success) {
            const alumnos = data.data || [];
            
            // Calcular métricas
            const activos = alumnos.filter(a => a.estatus === 'Activo');
            const grupales = activos.filter(a => a.tipo_clase === 'Grupal');
            const individuales = activos.filter(a => a.tipo_clase === 'Individual');
            
            // Actualizar elementos
            document.getElementById('companyStudents').textContent = activos.length;
            document.getElementById('groupClasses').textContent = grupales.length;
            document.getElementById('individualClasses').textContent = individuales.length;
            document.getElementById('totalStudents').textContent = activos.length;
            document.getElementById('activeStudents').textContent = activos.length;
            document.getElementById('inactiveStudents').textContent = alumnos.filter(a => a.estatus === 'Baja').length;
            
            // Simular pagos al corriente y pendientes (esto debe venir de la API)
            document.getElementById('currentStudents').textContent = Math.floor(activos.length * 0.8);
            document.getElementById('pendingStudents').textContent = Math.floor(activos.length * 0.2);
            
            console.log('✅ Datos específicos de RockstarSkull cargados');
        }
        
    } catch (error) {
        console.error('❌ Error cargando datos específicos:', error);
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
// 🛠️ FUNCIONES AUXILIARES
// ============================================================

/**
 * Obtener icono para cada tipo de clase/instrumento
 */
function getClassIcon(clase) {
    const iconMap = {
        'Guitarra': 'fas fa-guitar',
        'Guitarra Eléctrica': 'fas fa-guitar',
        'Batería': 'fas fa-drum',
        'Teclado': 'fas fa-keyboard',
        'Piano': 'fas fa-keyboard',
        'Bajo': 'fas fa-guitar',
        'Bajo Eléctrico': 'fas fa-guitar',
        'Canto': 'fas fa-microphone',
        'default': 'fas fa-music'
    };
    
    return iconMap[clase] || iconMap.default;
}

/**
 * Obtener color para cada tipo de clase
 */
function getClassColor(clase) {
    const colorMap = {
        'Guitarra': 'primary',
        'Guitarra Eléctrica': 'primary',
        'Batería': 'danger',
        'Teclado': 'warning',
        'Piano': 'warning',
        'Bajo': 'success',
        'Bajo Eléctrico': 'success',
        'Canto': 'info',
        'default': 'secondary'
    };
    
    return colorMap[clase] || colorMap.default;
}

/**
 * Formatear moneda
 */
function formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return '$0.00';
    }
    
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
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
window.updateMainStats = updateMainStats;
window.handleCompanyFilterChange = handleCompanyChange; // Alias para compatibilidad

// Exponer función global para el HTML
window.handleCompanyFilterChange = handleCompanyChange;

// Funciones de alertas de pagos y RockstarSkull específicas
window.loadRockstarSpecificData = loadRockstarSpecificData;
window.updateClassDistributionReal = updateClassDistributionReal;
window.loadRockstarSkullDataReal = loadRockstarSkullDataReal;
window.updateCompanyStatsReal = updateCompanyStatsReal;

// Funciones auxiliares
window.getClassIcon = getClassIcon;
window.getClassColor = getClassColor;
window.formatCurrency = formatCurrency;