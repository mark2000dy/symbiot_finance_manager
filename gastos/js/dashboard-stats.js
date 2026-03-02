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
// ✅ ELIMINADA: Línea que creaba copia local estancada
// Usar SIEMPRE window.currentCompanyFilter en lugar de currentCompanyFilter local

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
        tipoClaseFilter: '',
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
    // Permission Check: Abort if the user is a 'viewer' (EXCEPT for Escuela)
    const permissions = window.getUserPermissions && window.getUserPermissions();
    
    // 🔧 EXCEPCIÓN para Escuela: puede cargar datos específicos del dashboard
    // Obtener email del usuario actual
    let userEmail = null;
    try {
        const userDataStr = localStorage.getItem('user_data');
        if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            userEmail = userData.email;
        }
    } catch (e) {
        console.log('⚠️ No se pudo obtener email del usuario:', e);
    }
    
    // Bloquear SOLO si es viewer y NO es Escuela
    if (permissions && permissions.role === 'viewer' && userEmail !== 'escuela@rockstarskull.com') {
        console.log('📊 Usuario "viewer" detectado. Omitiendo carga de estadísticas financieras.');
        const statsRow = document.getElementById('statisticsCardsRow');
        if (statsRow) statsRow.style.display = 'none';
        const companySelector = document.getElementById('companySelectorWidget');
        if (companySelector) companySelector.style.display = 'none';
        return; // Stop execution for this user
    }
    
    // ✅ Escuela continúa aquí - puede cargar sus datos específicos
    if (userEmail === 'escuela@rockstarskull.com') {
        console.log('🎓 Escuela detectada: Permitiendo carga de datos específicos...');
    }

    // 🔥 ASEGURAR que la función sea accesible globalmente
    window.loadDashboardData = loadDashboardData;
    
    try {
        console.log('📊 Cargando estadísticas con filtro de empresa...');

        // v3.1.2: Construir params object para apiGet en lugar de query string
        const params = {};
        if (window.currentCompanyFilter) {
            params.empresa_id = window.currentCompanyFilter;
        }

        console.log('📡 Solicitando resumen de transacciones...');

        // v3.1.2: Usar API Client en lugar de fetch directo
        const data = await window.apiGet('transacciones/resumen', params);
        
        console.log('📥 Respuesta completa del API:', data);
        
        if (data.success && data.data) {
            console.log('✅ Datos cargados:', data.data);
            
            // 🔥 CRÍTICO: Los datos vienen en data.data
            const resumen = {
                ingresos: data.data.ingresos || 0,
                gastos: data.data.gastos || 0,
                inversion: data.data.inversion || 0,
                balance: data.data.balance || 0,
                total_transacciones: data.data.total_transacciones || 0
            };
            
            console.log('🔄 Resumen procesado para actualización:', resumen);
            
            // 🔥 FORZAR la actualización inmediata
            updateMainStatsReal(resumen);
            
            // Actualizar selector de empresa
            updateCompanyStatsReal(resumen);
            
            console.log('✅ Estadísticas actualizadas correctamente');

            // Cargar estadísticas del mes actual
            await loadCurrentMonthData();
            
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
            'inversionSocios': {
                value: resumen.inversion || 0,
                defaultClass: 'mb-0',
                customStyle: 'color: #8b5cf6'
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

                // Aplicar estilo custom si existe (ej: color purple para inversión)
                if (config.customStyle) {
                    element.style.cssText = config.customStyle;
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
async function updateCompanyStatsReal(resumen) {
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
        
        // Alumnos activos (RockstarSkull): cargar si está seleccionada o si es la carga inicial (filtro vacío)
        const studentsElement = document.getElementById('companyStudents');
        if (studentsElement && (window.currentCompanyFilter === '1' || window.currentCompanyFilter === '')) {
            try {
                // v3.1.3: Usar API Client en lugar de fetch directo
                const alumnosData = await window.apiGet('dashboard/alumnos', { empresa_id: 1 });

                if (alumnosData.success) {
                    const totalActivos = alumnosData.data.total_alumnos || 0;
                    studentsElement.textContent = totalActivos;
                    console.log(`Alumnos activos: ${totalActivos}`);
                }
            } catch (error) {
                console.error('Error cargando alumnos:', error);
                studentsElement.textContent = '0';
            }
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

        const result = await window.apiGet('dashboard/alumnos', { empresa_id: 1 });

        if (result.success && result.data) {
            const stats = result.data.estadisticas;
            const clases = result.data.distribucion_clases;
            const maestros = result.data.distribucion_maestros;
            const metricas = result.data.metricas_rockstar;
            
            console.log('📊 Datos REALES recibidos:', { stats, clases, maestros, metricas });

            // Actualizar campo companyStudents en el selector (personas únicas activas)
            if (stats && stats.personas_activas !== undefined) {
                const companyStudentsElement = document.getElementById('companyStudents');
                if (companyStudentsElement) {
                    companyStudentsElement.textContent = stats.personas_activas;
                    console.log(`✅ Alumnos activos (únicos) en selector: ${stats.personas_activas}`);
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
                updateElement('groupClasses', metricas.total_clases || 0);
                updateElement('individualClasses', metricas.clases_individuales || 0);
                // v3.6.0: currentStudents y pendingStudents se actualizan en updatePaymentMetrics()
                // para usar getPaymentStatusHomologado() como única fuente de verdad

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

            // Cargar altas/bajas del mes en curso e inversión MKT
            loadAltasBajasCurrentMonth();
            loadInversionMKT();

        } else {
            console.error('❌ Error en API alumnos:', result.message);
        }

    } catch (error) {
        console.error('❌ Error cargando datos REALES de RockstarSkull:', error);
    }
}

/**
 * Cargar altas y bajas del mes en curso desde el endpoint de reportes
 */
async function loadAltasBajasCurrentMonth() {
    try {
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const result = await window.apiGet('reportes/altas-bajas', {
            empresa: '1',
            ano: String(now.getFullYear())
        });

        if (result.success && result.data && result.data.meses) {
            const mesActual = result.data.meses.find(m => m.mes === currentMonthKey);
            const altasEl = document.getElementById('altasMesActual');
            const bajasEl = document.getElementById('bajasMesActual');
            const nuevosEl = document.getElementById('nuevosAlumnosMes');
            if (altasEl) altasEl.textContent = mesActual ? mesActual.altas : 0;
            if (bajasEl) bajasEl.textContent = mesActual ? mesActual.bajas : 0;
            if (nuevosEl) nuevosEl.textContent = mesActual ? mesActual.altas : 0;
        }
    } catch (error) {
        console.error('Error cargando altas/bajas del mes:', error);
    }
}

/**
 * Cargar inversión MKT del mes en curso
 * Filtra gastos cuyo concepto contenga "MKT Emiliano Rosas" o "Meta Ads"
 */
async function loadInversionMKT() {
    try {
        const now = new Date();
        const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const lastDayStr = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

        const result = await window.apiGet('transacciones', {
            empresa_id: 1,
            tipo: 'G',
            fechaInicio: firstDay,
            fechaFin: lastDayStr,
            limit: 1000
        });

        if (result.success && result.data) {
            const mktKeywords = ['mkt emiliano rosas', 'meta ads'];
            const totalMKT = result.data
                .filter(t => {
                    const concepto = (t.concepto || '').toLowerCase();
                    return mktKeywords.some(kw => concepto.includes(kw));
                })
                .reduce((sum, t) => sum + parseFloat(t.total || 0), 0);

            const el = document.getElementById('inversionMKT');
            if (el) el.textContent = formatCurrency(totalMKT);
        }
    } catch (error) {
        console.error('Error cargando inversión MKT:', error);
    }
}

/**
 * Actualizar métricas de pagos del widget usando la misma fuente que las alertas.
 * Usa /dashboard/alertas-pagos (alumnos únicos, lógica PHP calcularEstadoPagoHomologado)
 * para que "Al Corriente" y "Pendientes" cuadren siempre con el widget de alertas.
 */
async function updatePaymentMetrics() {
    try {
        console.log('💰 Actualizando métricas de pagos desde alertas...');

        const result = await window.apiGet('dashboard/alertas-pagos', { empresa_id: 1 });

        if (result.success && result.data) {
            const alCorriente = result.data.al_corriente || 0;
            const pendientes  = (result.data.proximos_vencer || []).length
                              + (result.data.vencidos || []).length;

            updateElement('currentStudents', alCorriente);
            updateElement('pendingStudents',  pendientes);

            console.log(`✅ MÉTRICAS: ${alCorriente} al corriente, ${pendientes} pendientes`);
        }
    } catch (error) {
        console.error('❌ Error actualizando métricas de pagos:', error);
    }
}

/**
 * ✅ FUNCIÓN FINAL CORREGIDA: Estado de pago homologado
 * Lógica: El periodo de gracia SOLO aplica si pagó el mes anterior
 */
/**
 * Parsear fecha 'YYYY-MM-DD' como fecha LOCAL (evita desfase UTC)
 * new Date('2025-11-12') → UTC midnight → Nov 11 en MX. Esta función corrige eso.
 */
function parseLocalDate(dateStr) {
    if (!dateStr) return null;
    const parts = String(dateStr).split('-');
    if (parts.length !== 3) return new Date(dateStr);
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
}

function getPaymentStatusHomologado(student) {
    try {
        // Alumnos dados de baja no generan alertas
        if (student.estatus === 'Baja') return 'inactive';

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalizar a medianoche

        const fechaInscripcion = parseLocalDate(student.fecha_inscripcion);
        const diaCorte = fechaInscripcion.getDate();

        // Calcular fecha de corte del mes ACTUAL
        let fechaCorteActual = new Date(today.getFullYear(), today.getMonth(), diaCorte);
        fechaCorteActual.setHours(0, 0, 0, 0);

        // Si el día no existe en el mes (ej: 31 en febrero), usar último día del mes
        if (fechaCorteActual.getDate() !== diaCorte) {
            fechaCorteActual = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            fechaCorteActual.setHours(0, 0, 0, 0);
        }

        // Calcular inicio y fin del periodo de pago del mes ACTUAL
        const inicioPeriodoPago = new Date(fechaCorteActual);
        inicioPeriodoPago.setDate(inicioPeriodoPago.getDate() - 3); // 3 días antes

        const finPeriodoGracia = new Date(fechaCorteActual);
        finPeriodoGracia.setDate(finPeriodoGracia.getDate() + 5); // 5 días después

        // Verificar si estamos en el periodo de pago del mes actual
        const enPeriodoPago = today >= inicioPeriodoPago && today <= finPeriodoGracia;

        // Verificar pagos
        const fechaUltimoPago = parseLocalDate(student.fecha_ultimo_pago);

        const pagoEsteMes = fechaUltimoPago &&
            fechaUltimoPago.getMonth() === today.getMonth() &&
            fechaUltimoPago.getFullYear() === today.getFullYear();

        const pagoMesAnterior = fechaUltimoPago &&
            fechaUltimoPago.getMonth() === (today.getMonth() - 1 + 12) % 12 &&
            (fechaUltimoPago.getFullYear() === today.getFullYear() ||
             (today.getMonth() === 0 && fechaUltimoPago.getFullYear() === today.getFullYear() - 1));

        // ✅ REGLA 1: Si pagó ESTE MES → Al corriente (siempre)
        if (pagoEsteMes) {
            return 'current';
        }

        // ✅ REGLA 2: No pagó el mes anterior → verificar gracia del primer corte incumplido.
        // Usar el DÍA del último pago (no diaCorte de inscripción) para reflejar el ciclo real del alumno.
        // Ej: Andrés pagó ene-9 → corte feb-9, gracia feb-14. Mar-2 > feb-14 → VENCIDO ✓
        // Ej: alumno pagó ene-28 → corte feb-28, gracia mar-5. Mar-2 ≤ mar-5 → PRÓXIMO ✓
        if (!pagoMesAnterior) {
            if (fechaUltimoPago) {
                const diaUltimoPago = fechaUltimoPago.getDate();
                const mesSigPago = new Date(fechaUltimoPago.getFullYear(), fechaUltimoPago.getMonth() + 1, 1);
                let fechaCorteDeuda = new Date(mesSigPago.getFullYear(), mesSigPago.getMonth(), diaUltimoPago);
                fechaCorteDeuda.setHours(0, 0, 0, 0);
                // Si el día no existe en ese mes (ej: 31 en feb), usar último día del mes
                if (fechaCorteDeuda.getMonth() !== mesSigPago.getMonth()) {
                    fechaCorteDeuda = new Date(mesSigPago.getFullYear(), mesSigPago.getMonth() + 1, 0);
                    fechaCorteDeuda.setHours(0, 0, 0, 0);
                }
                const finGraciaDeuda = new Date(fechaCorteDeuda);
                finGraciaDeuda.setDate(finGraciaDeuda.getDate() + 5);
                finGraciaDeuda.setHours(23, 59, 59, 999);
                if (today <= finGraciaDeuda) return 'upcoming';
            }
            return 'overdue';
        }

        // ✅ REGLA 3: Pagó mes anterior Y estamos en periodo de pago → PRÓXIMO A VENCER
        if (pagoMesAnterior && enPeriodoPago) {
            return 'upcoming';
        }
        
        // ✅ REGLA 4: Pagó mes anterior Y ya pasó periodo de gracia → VENCIDO
        if (pagoMesAnterior && today > finPeriodoGracia) {
            return 'overdue';
        }
        
        // ✅ REGLA 5: Pagó mes anterior Y aún no inicia periodo → AL CORRIENTE
        if (pagoMesAnterior && today < inicioPeriodoPago) {
            return 'current';
        }
        
        // Por defecto: Al corriente
        return 'current';
        
    } catch (error) {
        console.error(`❌ Error calculando estado para ${student.nombre}:`, error);
        return 'current';
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
            'inversionSocios': { value: '$0.00', class: 'mb-0', style: 'color: #8b5cf6' },
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
                if (config.style) element.style.cssText = config.style;
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
        window.currentCompanyFilter = selectedCompany;

        // ✅ Guardar en sessionStorage (persiste en la misma pestaña, no entre sesiones)
        try {
            sessionStorage.setItem('dashboardCompanyFilter', selectedCompany);
            const _email = typeof getCurrentUserEmail === 'function' ? getCurrentUserEmail() : '';
            if (_email) sessionStorage.setItem('dashboardFilterEmail', _email);
            console.log(`💾 Filtro guardado en sessionStorage: ${selectedCompany || 'Todas'}`);
        } catch (e) {
            console.warn('⚠️ No se pudo guardar en sessionStorage:', e);
        }
        
        console.log(`🏢 Empresa seleccionada: ${selectedCompany || 'Todas las empresas'}`);
        
        // Ocultar/mostrar widgets específicos INMEDIATAMENTE
        const rockstarWidgets = document.getElementById('rockstarSkullWidgets');
        const rockstarMetrics = document.getElementById('rockstarSpecificIndicators');
        
        const symbiotWidgets  = document.getElementById('symbiotWidgets');
        const symbiotMetrics  = document.getElementById('symbiotSpecificIndicators');

        if (selectedCompany === '1') {
            // ROCKSTAR SKULL seleccionada
            console.log('🎸 Mostrando widgets de RockstarSkull');

            const companyStudentsContainer = document.querySelector('#companyStudents').closest('.col-md-3');
            if (companyStudentsContainer) companyStudentsContainer.style.display = 'block';

            if (rockstarWidgets) rockstarWidgets.style.display = 'block';
            if (rockstarMetrics) rockstarMetrics.style.display = 'block';
            if (symbiotWidgets)  symbiotWidgets.style.display  = 'none';
            if (symbiotMetrics)  symbiotMetrics.style.display  = 'none';

        } else if (selectedCompany === '2') {
            // SYMBIOT TECHNOLOGIES seleccionada
            console.log('🌐 Mostrando widgets de Symbiot Technologies');

            const companyStudentsContainer = document.querySelector('#companyStudents').closest('.col-md-3');
            if (companyStudentsContainer) companyStudentsContainer.style.display = 'none';

            if (rockstarWidgets) rockstarWidgets.style.display = 'none';
            if (rockstarMetrics) rockstarMetrics.style.display = 'none';
            if (symbiotWidgets)  symbiotWidgets.style.display  = 'block';
            if (symbiotMetrics)  symbiotMetrics.style.display  = 'block';

        } else {
            // TODAS LAS EMPRESAS
            console.log('🏢 Vista general — ocultando widgets específicos');

            const companyStudentsContainer = document.querySelector('#companyStudents').closest('.col-md-3');
            if (companyStudentsContainer) companyStudentsContainer.style.display = 'none';

            if (rockstarWidgets) rockstarWidgets.style.display = 'none';
            if (rockstarMetrics) rockstarMetrics.style.display = 'none';
            if (symbiotWidgets)  symbiotWidgets.style.display  = 'none';
            if (symbiotMetrics)  symbiotMetrics.style.display  = 'none';

            // Resetear métricas Rockstar
            ['groupClasses', 'individualClasses', 'currentStudents', 'pendingStudents', 'companyStudents', 'inversionMKT', 'nuevosAlumnosMes'].forEach(id => {
                const element = document.getElementById(id);
                if (element) element.textContent = '0';
            });
        }
        
        // Cargar datos con filtro
        await loadDashboardData();

        // ⭐ RECARGAR TRANSACCIONES RECIENTES con el nuevo filtro de empresa
        if (typeof loadRecentTransactions === 'function') {
            await loadRecentTransactions(1);
            console.log('✅ Transacciones recientes recargadas con filtro de empresa');
        }

        // Cargar datos específicos según empresa seleccionada
        if (selectedCompany === '1') {
            await loadRockstarSkullDataReal();

            if (typeof loadStudentsList === 'function') {
                await loadStudentsList(1);
                console.log('✅ Lista de alumnos cargada después de cambio de empresa');
            }

            if (window.refreshPaymentAlerts) {
                refreshPaymentAlerts();
            }

            await updatePaymentMetrics();

        } else if (selectedCompany === '2') {
            if (typeof loadSymbiotDataReal === 'function') {
                await loadSymbiotDataReal();
            }
            if (typeof loadSensoresList === 'function') {
                await loadSensoresList();
            }
            if (typeof loadClientesList === 'function') {
                await loadClientesList();
            }
            if (typeof _populateClienteSelect === 'function') {
                await _populateClienteSelect('symFilterCliente');
            }
        }
        
        console.log('✅ Cambio de empresa completado');

        // Actualizar logo en welcome banner
        if (typeof window.updateCompanyLogo === 'function') {
            window.updateCompanyLogo(selectedCompany);
        }

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
 * Actualizar vista de maestros - HOMOLOGADO CON REFERENCIA
 */
function updateTeachersOverview(maestros = []) {
    console.log('👨‍🏫 Actualizando maestros:', maestros);
    
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
                <button class="btn btn-sm btn-outline-info mt-2" onclick="if(typeof refreshMaestrosData === 'function') refreshMaestrosData();">
                    <i class="fas fa-sync-alt me-1"></i>Recargar
                </button>
            </div>
        `;
        return;
    }

    const html = `
        <div class="teachers-grid">
            ${maestros.map(maestro => {
                const ingresosActivos = parseFloat(maestro.ingresos_activos) || 0;
                const ingresosBajas = parseFloat(maestro.ingresos_bajas) || 0;
                const ingresosMes = parseFloat(maestro.ingresos_mes) || 0;

                return `
                    <div class="teacher-card mb-3 p-3" style="background: rgba(255,255,255,0.1); border-radius: 8px; border-left: 4px solid #007bff;">
                        <!-- Header del maestro -->
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div class="flex-grow-1">
                                <h6 class="text-white mb-1 fw-bold">
                                    <i class="${getClassIcon(maestro.especialidad)} me-2 text-primary"></i>
                                    ${maestro.maestro}
                                </h6>
                                <small class="text-info fw-bold">${maestro.especialidad}</small>
                            </div>
                        </div>

                        <!-- Resumen en línea: activos | bajas | este mes -->
                        <div class="mb-3" style="font-size: 0.85em;">
                            <i class="fas fa-users me-1 text-info"></i>
                            <strong class="text-white">${maestro.alumnos_activos || 0}</strong>
                            <span class="text-success">activos</span>
                            <span class="text-muted mx-1">|</span>
                            <strong class="text-white">${maestro.alumnos_bajas || 0}</strong>
                            <span class="text-danger">bajas</span>
                            <span class="text-muted mx-1">|</span>
                            <strong class="text-warning">${formatCurrency(ingresosMes)}</strong>
                            <span class="text-warning">este mes</span>
                        </div>

                        <!-- Ingresos históricos (banners) -->
                        <div class="row">
                            <div class="col-6">
                                <div class="text-center p-2" style="background: rgba(40,167,69,0.3); border-radius: 6px; border: 1px solid rgba(40,167,69,0.5);">
                                    <div class="text-white fw-bold" style="font-size: 0.95em;">
                                        ${formatCurrency(ingresosActivos)}
                                    </div>
                                    <small class="text-white fw-bold">Activos</small>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="text-center p-2" style="background: rgba(220,53,69,0.3); border-radius: 6px; border: 1px solid rgba(220,53,69,0.5);">
                                    <div class="text-white fw-bold" style="font-size: 0.95em;">
                                        ${formatCurrency(ingresosBajas)}
                                    </div>
                                    <small class="text-white fw-bold">Bajas</small>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    container.innerHTML = html;
    console.log('✅ Maestros actualizados con diseño homologado (activos/bajas separados)');
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

    // Cambiar título del dashboard (usar h4 en welcome-banner, NO h2 que es el contador de alumnos)
    const dashboardTitle = document.querySelector('.welcome-banner h4');
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
 * Cargar estadísticas del mes actual
 */
async function loadCurrentMonthData() {
    try {
        const currentDate = new Date();
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const fechaInicio = firstDay.toISOString().split('T')[0];
        const fechaFin = lastDay.toISOString().split('T')[0];

        // v3.1.2: Construir params object para apiGet en lugar de query string
        const params = {
            fechaInicio: fechaInicio,
            fechaFin: fechaFin
        };
        if (window.currentCompanyFilter) {
            params.empresa_id = window.currentCompanyFilter;
        }

        console.log(`Cargando balance del mes actual: ${fechaInicio} a ${fechaFin}`);

        // v3.1.2: Usar API Client en lugar de fetch directo
        const data = await window.apiGet('transacciones/resumen', params);
        
        if (data.success) {
            const resumen = data.data;
            const balanceMes = (resumen.ingresos || 0) - (resumen.gastos || 0);
            
            const element = document.getElementById('esteMes');
            if (element) {
                element.textContent = formatCurrency(balanceMes);
                element.className = balanceMes >= 0 ? 'text-success mb-0' : 'text-danger mb-0';
                console.log(`Balance del mes actualizado: ${formatCurrency(balanceMes)}`);
            }
        }
        
    } catch (error) {
        console.error('Error cargando balance del mes:', error);
    }
}

/**
 * Ocultar indicadores específicos de RockstarSkull
 */
function hideRockstarSkullIndicators() {
    console.log('🏢 Ocultando indicadores específicos de RockstarSkull');

    // Restaurar título del dashboard (usar h4 en welcome-banner, NO h2 que es el contador de alumnos)
    const dashboardTitle = document.querySelector('.welcome-banner h4');
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

// ✅ EXPORTAR funciones homologadas
window.parseLocalDate = parseLocalDate;
window.getPaymentStatusHomologado = getPaymentStatusHomologado;

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

/**
 * Actualizar título del welcome-banner y visibilidad de indicadores según la empresa seleccionada.
 * Definida aquí para que dashboard-init.js y handleCompanyChange() puedan llamarla.
 */
window.updateCompanyLogo = function(companyId) {
    const dashboardTitle = document.querySelector('.welcome-banner h4');
    const currentStudentsIndicator = document.getElementById('currentStudentsIndicator');
    const pendingStudentsIndicator  = document.getElementById('pendingStudentsIndicator');

    if (companyId === '1') {
        if (dashboardTitle) dashboardTitle.innerHTML = '<i class="fas fa-guitar me-2"></i>Dashboard RockstarSkull';
        if (currentStudentsIndicator) currentStudentsIndicator.style.display = 'block';
        if (pendingStudentsIndicator)  pendingStudentsIndicator.style.display  = 'block';
    } else if (companyId === '2') {
        if (dashboardTitle) dashboardTitle.innerHTML = '<i class="fas fa-microchip me-2"></i>Dashboard Symbiot';
        if (currentStudentsIndicator) currentStudentsIndicator.style.display = 'none';
        if (pendingStudentsIndicator)  pendingStudentsIndicator.style.display  = 'none';
    } else {
        if (dashboardTitle) dashboardTitle.innerHTML = '<i class="fas fa-chart-pie me-2"></i>Dashboard Financiero';
        if (currentStudentsIndicator) currentStudentsIndicator.style.display = 'none';
        if (pendingStudentsIndicator)  pendingStudentsIndicator.style.display  = 'none';
    }
};

console.log('✅ Dashboard Stats Module cargado - Todas las funciones disponibles');