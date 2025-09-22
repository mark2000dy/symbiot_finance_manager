/* ====================================================
   DASHBOARD STATS MODULE - SYMBIOT FINANCIAL MANAGER
   Archivo: public/js/dashboard-stats.js
   Widget de estadísticas principales y selector de empresa
   ==================================================== */

// ============================================================
// 🏢 VARIABLES GLOBALES REQUERIDAS
// ============================================================

// ============================================================
// 🏢 VARIABLES GLOBALES CRÍTICAS (SCOPE PRINCIPAL)
// ============================================================

// Variable global para filtro de empresa (accesible desde todos los módulos)
if (typeof window.currentCompanyFilter === 'undefined') {
    window.currentCompanyFilter = '';
}
let currentCompanyFilter = window.currentCompanyFilter;

// Variables globales para almacenamiento de datos
if (typeof window.storedClassDistribution === 'undefined') {
    window.storedClassDistribution = [];
}
let storedClassDistribution = window.storedClassDistribution;

// Sincronizar con variables globales del core si existen
if (typeof window.currentStudentFilters === 'undefined') {
    window.currentStudentFilters = {
        teacherFilter: '',
        statusFilter: '',
        instrumentFilter: '',
        paymentFilter: ''
    };
}

// ============================================================
// 📊 FUNCIONES PRINCIPALES DE ESTADÍSTICAS
// ============================================================

/**
 * Cargar datos principales del dashboard
 */
async function loadDashboardData() {
    // 🔥 ASEGURAR que la función sea accesible globalmente
    window.loadDashboardData = loadDashboardData;
    
    try {
        console.log('📊 Cargando estadísticas con filtro de empresa...');
        
        // Construir query con filtro
        let queryParam = '';
        if (currentCompanyFilter) {
            queryParam = `?empresa_id=${currentCompanyFilter}`;
        }
        
        console.log('📡 Solicitando resumen:', `/gastos/api/transacciones/resumen${queryParam}`);
        
        const response = await fetch(`/gastos/api/transacciones/resumen${queryParam}`);
        const data = await response.json();
        
        console.log('📥 Respuesta completa del API:', data);
        
        if (data.success && data.data) {
            console.log('✅ Datos cargados:', data.data);
            
            // 🔥 CRÍTICO: Los datos vienen en data.data
            const resumen = {
                ingresos: data.data.ingresos || 0,
                gastos: data.data.gastos || 0,
                balance: data.data.balance || 0,
                total_transacciones: data.data.total_transacciones || 0
            };
            
            console.log('🔄 Resumen procesado para actualización:', resumen);
            
            // 🔥 FORZAR la actualización inmediata
            updateMainStatsReal(resumen);
            
            // Actualizar selector de empresa
            updateCompanyStatsReal(resumen);
            
            console.log('✅ Estadísticas actualizadas correctamente');
            
        } else {
            console.error('❌ Error en la respuesta:', data);
            throw new Error(data.message || 'Error cargando estadísticas');
        }
        
    } catch (error) {
        console.error('❌ Error cargando estadísticas:', error);
        resetMainStats();
        if (typeof showAlert === 'function') {
            showAlert('warning', 'Error cargando estadísticas. Verifique su conexión.');
        }
    }
}

/**
 * Actualizar estadísticas con datos REALES
 */
function updateMainStatsReal(resumen) {
    try {
        console.log('📊 Actualizando con datos REALES:', resumen);
        
        const updates = {
            'balanceTotal': {
                value: resumen.balance || 0,
                defaultClass: 'text-info mb-0'
            },
            'totalIngresos': {
                value: resumen.ingresos || 0,
                defaultClass: 'text-success mb-0'
            },
            'totalGastos': {
                value: resumen.gastos || 0,
                defaultClass: 'text-danger mb-0'
            },
            'esteMes': {
                value: resumen.balance || 0,
                defaultClass: 'text-warning mb-0'
            }
        };
        
        console.log('📊 Valores REALES a mostrar:', updates);
        
        // Actualizar cada elemento
        Object.entries(updates).forEach(([elementId, config]) => {
            const element = document.getElementById(elementId);
            
            if (element) {
                // 🔥 LIMPIAR TODO EL CONTENIDO PREVIO (incluido el spinner)
                element.innerHTML = '';
                
                // 🔥 INSERTAR EL VALOR FORMATEADO
                const formattedValue = formatCurrency(config.value);
                element.textContent = formattedValue;
                
                // 🔥 APLICAR LA CLASE CORRECTA
                if (elementId === 'balanceTotal') {
                    // Balance cambia color según si es positivo o negativo
                    element.className = config.value >= 0 ? 'text-success mb-0' : 'text-danger mb-0';
                } else {
                    // Otros elementos mantienen su color por defecto
                    element.className = config.defaultClass;
                }
                
                console.log(`✅ ${elementId} = ${formattedValue} (REAL) - Clase: ${element.className}`);
            } else {
                console.error(`❌ Elemento NO encontrado: ${elementId}`);
            }
        });
        
        console.log('✅ Estadísticas REALES actualizadas exitosamente');
        
    } catch (error) {
        console.error('❌ Error actualizando estadísticas REALES:', error);
    }
}

/**
 * Actualizar estadísticas de empresa en el selector
 */
function updateCompanyStatsReal(resumen) {
    try {
        console.log('🏢 Actualizando estadísticas del selector de empresa:', resumen);
        
        // Balance empresa
        const balanceElement = document.getElementById('companyBalance');
        if (balanceElement) {
            const balance = resumen.balance || 0;
            balanceElement.textContent = formatCurrency(balance);
            balanceElement.className = balance >= 0 ? 'stat-number text-success' : 'stat-number text-danger';
        }
        
        // Total transacciones - ✅ CORREGIDO
        const transactionsElement = document.getElementById('companyTransactions');
        if (transactionsElement) {
            const totalTx = resumen.total_transacciones || 0;
            transactionsElement.textContent = totalTx;
            console.log(`📊 Transacciones mostradas: ${totalTx}`);
        }
        
        // Alumnos activos (solo para RockstarSkull)
        const studentsElement = document.getElementById('companyStudents');
        if (studentsElement && currentCompanyFilter === '1') {
            // Usar misma lógica que alertas de pagos
            fetch(`/gastos/api/dashboard/alertas-pagos?empresa_id=1`, { 
                cache: 'no-store',
                credentials: 'include'
            })
            .then(response => response.json())
            .then(alertsData => {
                if (alertsData.success) {
                    const proximos = Array.isArray(alertsData.data.proximos_vencer) ? 
                        alertsData.data.proximos_vencer.filter(a => String(a.estatus || '').toLowerCase() !== 'baja') : [];
                    const vencidos = Array.isArray(alertsData.data.vencidos) ? 
                        alertsData.data.vencidos.filter(a => String(a.estatus || '').toLowerCase() !== 'baja') : [];
                    
                    const totalPendientes = proximos.length + vencidos.length;
                    studentsElement.textContent = totalPendientes;
                } else {
                    studentsElement.textContent = '0';
                }
            })
            .catch(error => {
                console.error('❌ Error calculando pendientes:', error);
                studentsElement.textContent = '0';
            });
        } else if (studentsElement) {
            studentsElement.textContent = '0';
        }
        
        console.log('✅ Estadísticas del selector actualizadas');
        
    } catch (error) {
        console.error('❌ Error actualizando estadísticas de empresa:', error);
    }
}

/**
 * Cargar datos REALES de RockstarSkull
 */
async function loadRockstarSkullDataReal() {
    try {
        console.log('🎸 Cargando datos REALES de RockstarSkull...');
        
        const response = await fetch('/gastos/api/dashboard/alumnos?empresa_id=1');
        const result = await response.json();
        
        if (result.success && result.data) {
            const stats = result.data.estadisticas;
            const clases = result.data.distribucion_clases;
            const maestros = result.data.distribucion_maestros;
            const metricas = result.data.metricas_rockstar;
            
            console.log('📊 Datos REALES recibidos:', { stats, clases, maestros, metricas });

            // Actualizar campo companyStudents en el selector
            if (stats && stats.alumnos_activos) {
                const companyStudentsElement = document.getElementById('companyStudents');
                if (companyStudentsElement) {
                    companyStudentsElement.textContent = stats.alumnos_activos;
                    console.log(`✅ Alumnos activos en selector: ${stats.alumnos_activos}`);
                }
            }
            
            // Actualizar contadores generales con datos reales
            if (stats) {
                updateElement('totalStudents', stats.total_alumnos || 0);
                updateElement('activeStudents', stats.alumnos_activos || 0);
                updateElement('inactiveStudents', stats.alumnos_bajas || 0);
                
                console.log('✅ Contadores de alumnos actualizados:', {
                    total: stats.total_alumnos,
                    activos: stats.alumnos_activos,
                    bajas: stats.alumnos_bajas
                });
            }
            
            // Métricas específicas
            if (metricas) {
                updateElement('groupClasses', metricas.clases_grupales || 0);
                updateElement('individualClasses', metricas.clases_individuales || 0);
                updateElement('currentStudents', metricas.alumnos_corriente || 0);
                updateElement('pendingStudents', metricas.alumnos_pendientes || 0);
                
                // Mostrar indicadores específicos
                const indicators = document.getElementById('rockstarSpecificIndicators');
                if (indicators) indicators.style.display = 'block';
            }

            // Calcular métricas de pagos con datos actualizados
            await updatePaymentMetrics();
            
            // Almacenar datos para filtros
            if (clases && clases.length > 0) {
                // Llamada inmediata para mostrar datos al cargar
                if (typeof updateClassDistributionOriginal === 'function') {
                    updateClassDistributionOriginal(clases);
                } else if (typeof window.updateClassDistributionOriginal === 'function') {
                    window.updateClassDistributionOriginal(clases);
                }
            }

            // Actualizar maestros
            if (maestros && maestros.length > 0) {
                updateTeachersOverview(maestros);
            }

            // Almacenar datos para filtros (SINCRONIZACIÓN CON ORIGINAL)
            if (clases && clases.length > 0) {
                setClassDistributionData(clases);
                
                // CRÍTICO: Sincronizar con variable global classDistributionData del módulo students
                if (typeof window.setClassDistributionDataOriginal === 'function') {
                    window.setClassDistributionDataOriginal(clases);
                }
                
                updateClassDistribution(clases, 'all');
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
 * Calcular y actualizar métricas de pagos de alumnos
 */
async function updatePaymentMetrics() {
    try {
        console.log('💰 Calculando métricas de pagos de alumnos...');
        
        // CRÍTICO: Solicitar TODOS los alumnos sin paginación
        const response = await fetch('/gastos/api/alumnos?empresa_id=1&estatus=Activo&limit=1000', {
            credentials: 'same-origin'
        });
        
        const result = await response.json();
        
        console.log('📊 Alumnos recibidos:', result.data?.length || 0);
        
        if (result.success && result.data) {
            const alumnos = result.data;
            const today = new Date();
            
            let alCorriente = 0;
            let pendientes = 0;
            let proximos = 0; // Para debugging
            
            alumnos.forEach(alumno => {
                const proximoPago = alumno.proximo_pago || alumno.fecha_ultimo_pago;
                            
                if (!proximoPago) {
                    pendientes++;
                    console.log(`⚠️ ${alumno.nombre}: Sin fecha de pago`);
                    return;
                }
                            
                // Verificar si pagó este mes
                const lastPaymentDate = alumno.fecha_ultimo_pago ? new Date(alumno.fecha_ultimo_pago) : null;
                const hasPaidThisMonth = lastPaymentDate && 
                    lastPaymentDate.getMonth() === today.getMonth() && 
                    lastPaymentDate.getFullYear() === today.getFullYear();
                
                if (hasPaidThisMonth) {
                    alCorriente++;
                    console.log(`🟢 ${alumno.nombre}: Al corriente (pagó este mes)`);
                    return;
                }
                
                // Calcular días desde fecha próximo pago
                const fechaPago = new Date(proximoPago);
                const diffDays = Math.ceil((fechaPago - today) / (1000 * 60 * 60 * 24));
                            
                if (diffDays < -5) {
                    pendientes++;
                    console.log(`🔴 ${alumno.nombre}: Vencido ${Math.abs(diffDays)} días`);
                } else if (diffDays >= 0 && diffDays <= 3) {
                    proximos++;
                    console.log(`🟡 ${alumno.nombre}: Próximo ${diffDays} días`);
                } else {
                    alCorriente++;
                    console.log(`🟢 ${alumno.nombre}: Al corriente +${diffDays} días`);
                }
            });
            
            // Actualizar UI (sin contar próximos)
            updateElement('currentStudents', alCorriente);
            updateElement('pendingStudents', pendientes);
            
            console.log(`✅ Métricas: ${alCorriente} al corriente, ${pendientes} vencidos, ${proximos} próximos`);
            console.log(`📊 Total procesado: ${alCorriente + pendientes + proximos} de ${alumnos.length} alumnos`);
        }
    } catch (error) {
        console.error('❌ Error calculando métricas de pagos:', error);
    }
}

/**
 * Actualizar elemento de forma segura
 */
function updateElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
        console.log(`✅ ${elementId} = ${value}`);
    } else {
        console.warn(`⚠️ Elemento ${elementId} no encontrado`);
    }
}

/**
 * Resetear estadísticas principales a valores por defecto
 */
function resetMainStats() {
    try {
        const defaults = {
            'balanceTotal': { value: '$0.00', class: 'text-info mb-0' },
            'totalIngresos': { value: '$0.00', class: 'text-success mb-0' },
            'totalGastos': { value: '$0.00', class: 'text-danger mb-0' },
            'esteMes': { value: '$0.00', class: 'text-warning mb-0' }
        };
        
        Object.entries(defaults).forEach(([elementId, config]) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = '';
                element.textContent = config.value;
                element.className = config.class;
            }
        });
        
        console.log('🔄 Estadísticas principales reseteadas');
        
    } catch (error) {
        console.error('❌ Error reseteando estadísticas:', error);
    }
}

// ============================================================
// 🏢 FUNCIONES DEL SELECTOR DE EMPRESA
// ============================================================

/**
 * Manejar cambio de empresa completo
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
        window.currentCompanyFilter = selectedCompany; // Sincronizar globalmente
        
        console.log(`🏢 Empresa seleccionada: ${selectedCompany || 'Todas las empresas'}`);
        
        // Ocultar/mostrar widgets específicos INMEDIATAMENTE
        const rockstarWidgets = document.getElementById('rockstarSkullWidgets');
        const rockstarMetrics = document.getElementById('rockstarSpecificIndicators');
        
        if (selectedCompany === '1') {
            // ROCKSTAR SKULL seleccionada
            console.log('🎸 Mostrando widgets de RockstarSkull');

            // Mostrar campo "Alumnos Activos"
            const companyStudentsContainer = document.querySelector('#companyStudents').closest('.col-md-3');
            if (companyStudentsContainer) {
                companyStudentsContainer.style.display = 'block';
            }
            
            if (rockstarWidgets) {
                rockstarWidgets.style.display = 'block';
            }
            if (rockstarMetrics) {
                rockstarMetrics.style.display = 'block';
            }
        } else {
            // OTRAS EMPRESAS O TODAS
            console.log('🏢 Ocultando widgets específicos de RockstarSkull');

            const companyStudentsContainer = document.querySelector('#companyStudents').closest('.col-md-3');
            if (companyStudentsContainer) {
                companyStudentsContainer.style.display = 'none';
            }
            
            if (rockstarWidgets) {
                rockstarWidgets.style.display = 'none';
            }
            if (rockstarMetrics) {
                rockstarMetrics.style.display = 'none';
            }
            
            // RESETEAR métricas específicas a 0
            ['groupClasses', 'individualClasses', 'currentStudents', 'pendingStudents', 'companyStudents'].forEach(id => {
                const element = document.getElementById(id);
                if (element) element.textContent = '0';
            });
        }
        
        // Cargar datos con filtro
        await loadDashboardData();
        
        // CRÍTICO: Cargar datos específicos si es RockstarSkull (SIN verificaciones como el original)
        if (selectedCompany === '1') {
            await loadRockstarSkullDataReal();
            
            if (typeof loadStudentsList === 'function') {
                await loadStudentsList(1);
                console.log('✅ Lista de alumnos cargada después de cambio de empresa');
            }
            
            // Refrescar alertas de pagos (COMO EN EL ORIGINAL - SIN typeof)
            if (window.refreshPaymentAlerts) {
                refreshPaymentAlerts();
            }

            await updatePaymentMetrics();
        }
        
        console.log('✅ Cambio de empresa completado');
        
    } catch (error) {
        console.error('❌ Error en handleCompanyChange:', error);
        if (typeof showAlert === 'function') {
            showAlert('danger', 'Error cambiando filtro de empresa');
        }
    }
}

// ============================================================
// FUNCIONES PARA FILTROS DE DISTRIBUCIÓN DE CLASES
// ============================================================

/**
 * Almacenar datos de distribución de clases para filtros
 */
function setClassDistributionData(clases) {
    storedClassDistribution = clases || [];
    window.storedClassDistribution = storedClassDistribution;
    
    // CRÍTICO: Sincronizar con classDistributionData del módulo students
    if (typeof window.setClassDistributionDataOriginal === 'function') {
        window.setClassDistributionDataOriginal(clases);
    }
    
    console.log('💾 Datos de distribución almacenados y sincronizados:', storedClassDistribution);
}

/**
 * Actualizar distribución de clases con filtro
 */
function updateClassDistribution(clases, filter = 'all') {
    if (typeof clases === 'undefined') {
        console.warn('⚠️ Clases no definidas en updateClassDistribution');
        return;
    }
    
    const container = document.getElementById('classDistributionContainer');
    if (!container) {
        // Silenciar warning - contenedor opcional en vista modular
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
    
    // Calcular totales según filtro
    let totalStudents = 0;
    let clasesHTML = '';
    
    clases.forEach(clase => {
        let count = 0;
        switch(filter) {
            case 'active':
                count = clase.activos || 0;
                totalStudents += count;
                break;
            case 'inactive':
                count = clase.inactivos || 0;
                totalStudents += count;
                break;
            default:
                count = clase.total_alumnos || 0;
                totalStudents += count;
        }
        
        if (count > 0 || filter === 'all') {
            clasesHTML += `
                <div class="class-item d-flex justify-content-between align-items-center p-2 mb-2" 
                     style="background: rgba(255,255,255,0.05); border-radius: 6px;">
                    <div>
                        <i class="${getClassIcon(clase.clase)} me-2 text-primary"></i>
                        <strong class="text-white">${clase.clase}</strong>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-primary">${count}</span>
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = clasesHTML || '<div class="text-center text-muted">Sin datos para este filtro</div>';
}

/**
 * Función original para maestros (homologada con original)
 */
/**
 * Función original para maestros (HOMOLOGADA CON ESTRUCTURA SEMÁNTICA ORIGINAL)
 */
function updateTeachersOverview(maestros = []) {
    console.log('👨‍🏫 Actualizando maestros con datos REALES:', maestros);
    
    // Debugging directo
    if (window.debugMaestros) {
        window.debugMaestros(maestros);
    }
    
    // Debugging: Verificar datos de cada maestro
    maestros.forEach((maestro, index) => {
        console.log(`🔍 Maestro ${index + 1}:`, {
            nombre: maestro.maestro,
            especialidad: maestro.especialidad,
            alumnos_activos: maestro.alumnos_activos,
            alumnos_bajas: maestro.alumnos_bajas,
            ingresos_activos: maestro.ingresos_activos,
            ingresos_bajas: maestro.ingresos_bajas
        });
    });
    
    const container = document.getElementById('teachersOverview');
    if (!container) {
        console.warn('⚠️ Contenedor teachersOverview no encontrado');
        return;
    }
    
    if (!maestros || maestros.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-exclamation-triangle text-warning fa-2x mb-2"></i>
                <div class="text-white fw-bold">Sin datos de maestros</div>
                <small class="text-warning">Verifique que hay alumnos asignados a maestros</small>
                <button class="btn btn-sm btn-outline-info mt-2" onclick="refreshMaestrosData()">
                    <i class="fas fa-sync-alt me-1"></i>Recargar
                </button>
            </div>
        `;
        return;
    }

    // ESTRUCTURA SEMÁNTICA ORIGINAL SIN ESTILOS INLINE
    const html = `
        <div class="teachers-grid">
            ${maestros.map(maestro => `
                <div class="teacher-card">
                    <div class="teacher-header">
                        <i class="${getClassIcon(maestro.especialidad)} teacher-icon"></i>
                        <div class="teacher-info">
                            <div class="teacher-name">${maestro.maestro}</div>
                            <small class="teacher-specialty">${maestro.especialidad}</small>
                        </div>
                    </div>
                    <div class="teacher-stats">
                        <div class="stat-item active">
                            <div class="stat-number">${maestro.alumnos_activos || 0}</div>
                            <small class="stat-label">Activos</small>
                        </div>
                        <div class="stat-item inactive">
                            <div class="stat-number">${maestro.alumnos_bajas || 0}</div>
                            <small class="stat-label">Bajas</small>
                        </div>
                    </div>
                    <div class="teacher-income">
                        <small>Ingresos: ${formatCurrency(maestro.ingresos_activos || 0)}</small>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    container.innerHTML = html;
    console.log('✅ Maestros actualizados con estructura semántica original');
}

/**
 * Refrescar datos de maestros
 */
async function refreshMaestrosData() {
    try {
        console.log('🔄 Refrescando datos de maestros...');
        await loadRockstarSkullDataReal();
        if (typeof showAlert === 'function') {
            showAlert('success', 'Datos de maestros actualizados', 2000);
        }
    } catch (error) {
        console.error('❌ Error refrescando maestros:', error);
        if (typeof showAlert === 'function') {
            showAlert('danger', 'Error actualizando datos de maestros');
        }
    }
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

/**
 * Cargar filtro de empresa desde URL
 */
function loadCompanyFilterFromURL() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const empresaParam = urlParams.get('empresa');
        
        if (empresaParam) {
            currentCompanyFilter = empresaParam;
            window.currentCompanyFilter = empresaParam;
            
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
// 🔗 EXPOSICIÓN DE FUNCIONES GLOBALES
// ============================================================

// CRÍTICO: Marcar que el módulo stats está cargado
window.dashboardStatsLoaded = true;

// Variables globales críticas
window.currentCompanyFilter = currentCompanyFilter;
window.storedClassDistribution = storedClassDistribution;

// Funciones principales (CRÍTICAS PARA dashboard-init.js)
window.loadDashboardData = loadDashboardData;
window.handleCompanyChange = handleCompanyChange;

// Funciones de distribución de clases
window.setClassDistributionData = setClassDistributionData;
window.updateClassDistribution = updateClassDistribution;

// Función de maestros
window.updateTeachersOverview = updateTeachersOverview;
window.refreshMaestrosData = refreshMaestrosData;

// Funciones de RockstarSkull
window.loadRockstarSkullDataReal = loadRockstarSkullDataReal;
window.updatePaymentMetrics = updatePaymentMetrics; 

// Funciones auxiliares
window.getClassIcon = getClassIcon;
window.getClassColor = getClassColor;
window.formatCurrency = formatCurrency;

// Funciones faltantes críticas
window.loadCompanyFilterFromURL = loadCompanyFilterFromURL;
// CORRECCIÓN: Verificar que la función se exportó correctamente
if (typeof window.loadCompanyFilterFromURL !== 'function') {
    console.error('❌ loadCompanyFilterFromURL no se exportó correctamente');
} else {
    console.log('✅ loadCompanyFilterFromURL disponible globalmente');
}
window.startStatsAutoRefresh = startStatsAutoRefresh;
window.showRockstarSkullIndicators = showRockstarSkullIndicators;
window.hideRockstarSkullIndicators = hideRockstarSkullIndicators;

console.log('✅ Dashboard Stats Module cargado - Todas las funciones disponibles');