/* ====================================================
   REPORTES WIDGETS MODULE - SYMBIOT FINANCIAL MANAGER
   Archivo: public/js/reportes-widgets.js
   Widgets específicos para reportes

   Version: 3.4.0
   Changelog v3.4.0:
   - NEW: Gráfica Flujo de Efectivo se agrupa por trimestre en móvil (<768px)
   - NEW: Widget Altas y Bajas de Alumnos (visible solo con Rockstar Skull)

   Version: 3.3.4
   Changelog v3.3.4:
   - FIX: Estado de Cuenta con reglas específicas por cuenta
   - Mercado Pago: Ingresos TPV + Gastos TPV/MP + Gastos transferencia (Clases, Limpieza, Quincena, etc.)
   - Inbursa: Ingresos Transferencia/CTIM + Gastos transferencia (Honorarios, Prestamo)
   - Caja Fuerte: Ingresos/Gastos en Efectivo
   - UI: Cards de cuentas muestran detalle de ingresos y gastos

   Version: 3.3.3
   Changelog v3.3.3:
   - FIX: Widgets respetan filtros globales de la página
   - FIX: Por defecto: todas empresas, todos años, todos meses, todos tipos
   - FIX: Datos se actualizan correctamente al cambiar filtros

   Version: 3.3.1
   Changelog v3.3.1:
   - FIX: Balance General muestra histórico completo (sin filtro de año por defecto)
   - FIX: Inversión neta = Gastos - Abonos (solo conceptos con 'abono')

   Version: 3.3.0
   Changelog v3.3.0:
   - NEW: Balance General v2 con inversión por socio (Marco Delgado, Hugo Vazquez, Antonio Razo)
   - NEW: Estado de Cuenta por forma de pago (TPV→Mercado Pago, Transferencia→Inbursa, Efectivo→Caja Fuerte)
   - NEW: Participación Sociedad calculada desde gastos de socios inversores
   - Usa nuevo endpoint: reportes/balance-general-v2

   Version: 3.2.0
   Changelog v3.2.0:
   - FIX: Filtro Tipo ahora afecta el gráfico (Gastos solo muestra salidas, Ingresos solo entradas)
   - Compatible con TransaccionesController v3.2.0 (filtro año opcional)

   Version: 3.1.9
   Changelog v3.1.9:
   - FIX: Gráfico ordenado de más antiguo a más reciente (ascendente)
   - FIX: Tabla ordenada de más reciente a más antiguo (descendente)
   - FIX: Corregido nombre de parámetro empresa_id → empresa para backend
   - FIX: Filtro "Todos" ahora funciona correctamente

   Version: 3.1.8
   Changelog v3.1.8:
   - FIX: Ordenar tabla mensual de más reciente a más antiguo
   - Compatible con api-client.js v3.1.4

   Version: 3.1.7
   Changelog v3.1.7:
   - FIX: Correcciones en llamadas a API (apiGet en lugar de apiFetch)
   - Compatible con api-client.js v3.1.4

   Version: 3.1.6 - Adapter Functions for Backend Data
   ==================================================== */

console.log('📊 Cargando Reportes Widgets Module...');

// ============================================================
// 🔄 DATA ADAPTERS - Transform backend responses to expected format
// ============================================================

/**
 * Adapter for reportes/gastos-reales endpoint
 * Transforms backend transaction array to monthly aggregated data
 * @param {Object} backendResponse - {success: true, data: [...], resumen: {...}}
 * @returns {Object} - {detalle_mensual: [...], total_entradas: N, total_salidas: N, flujo_neto: N}
 */
function adaptGastosReales(backendResponse) {
    if (!backendResponse.success || !backendResponse.data) {
        return {
            detalle_mensual: [],
            total_entradas: 0,
            total_salidas: 0,
            flujo_neto: 0
        };
    }

    const transacciones = backendResponse.data;
    const monthlyData = {};

    // Group transactions by month
    transacciones.forEach(tx => {
        if (tx.fecha && tx.total && tx.tipo) {
            const fecha = new Date(tx.fecha);
            const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[mesKey]) {
                monthlyData[mesKey] = {
                    mes: mesKey,
                    entradas: 0,
                    salidas: 0,
                    flujo: 0
                };
            }

            const monto = parseFloat(tx.total);
            if (tx.tipo === 'I') {
                monthlyData[mesKey].entradas += monto;
            } else if (tx.tipo === 'G') {
                monthlyData[mesKey].salidas += monto;
            }
        }
    });

    // Calculate flujo for each month and convert to array
    const detalleMensual = Object.values(monthlyData).map(month => {
        month.flujo = month.entradas - month.salidas;
        return month;
    });

    // Sort by month (ascending - más antiguo primero, para el gráfico)
    detalleMensual.sort((a, b) => a.mes.localeCompare(b.mes));

    // Calculate totals
    const totalEntradas = detalleMensual.reduce((sum, m) => sum + m.entradas, 0);
    const totalSalidas = detalleMensual.reduce((sum, m) => sum + m.salidas, 0);
    const flujoNeto = totalEntradas - totalSalidas;

    return {
        detalle_mensual: detalleMensual,
        total_entradas: totalEntradas,
        total_salidas: totalSalidas,
        flujo_neto: flujoNeto
    };
}

/**
 * Adapter for reportes/balance-general-v2 endpoint
 * Transforms backend balance data to expected format with investment metrics
 * @param {Object} backendResponse - {success: true, data: {inversion_total, numero_socios, saldo_total_cuentas, socios, cuentas_bancarias, ...}}
 * @returns {Object} - {inversion_total, numero_socios, saldo_disponible, ...}
 */
function adaptBalanceGeneral(backendResponse) {
    if (!backendResponse.success || !backendResponse.data) {
        return {
            inversion_total: 0,
            numero_socios: 0,
            saldo_disponible: 0
        };
    }

    const data = backendResponse.data;

    // Map backend fields to expected frontend fields (v2 ya tiene la estructura correcta)
    return {
        inversion_total: data.inversion_total || 0,
        numero_socios: data.numero_socios || 0,
        saldo_disponible: data.saldo_total_cuentas || 0
    };
}

// ============================================================
// 📱 MOBILE HELPERS - Agrupación trimestral para pantallas pequeñas
// ============================================================

/**
 * Agrupa datos mensuales en trimestres para mejor visualización en móvil
 * @param {Array} detalleMensual - [{mes: "2025-01", entradas, salidas, flujo}, ...]
 * @returns {Array} - [{mes: "2025-Q1", entradas, salidas, flujo}, ...]
 */
function aggregateByTrimester(detalleMensual) {
    const trimestres = {};

    detalleMensual.forEach(item => {
        const [year, month] = item.mes.split('-');
        const q = Math.ceil(parseInt(month) / 3);
        const key = `${year}-T${q}`;

        if (!trimestres[key]) {
            trimestres[key] = { mes: key, entradas: 0, salidas: 0, flujo: 0 };
        }
        trimestres[key].entradas += item.entradas;
        trimestres[key].salidas += item.salidas;
    });

    return Object.values(trimestres).map(t => {
        t.flujo = t.entradas - t.salidas;
        return t;
    }).sort((a, b) => a.mes.localeCompare(b.mes));
}

/**
 * Detecta si la pantalla es móvil
 */
function isMobileViewport() {
    return window.innerWidth < 768;
}

// ============================================================
// 🌍 VARIABLES GLOBALES DE WIDGETS
// ============================================================

let gastosRealesChart = null;
let gastosRealesData = null;

// ============================================================
// 🎨 HELPERS DE FORMATO PARA EXCEL
// ============================================================

/**
 * Aplicar formato de moneda a una celda
 */
function setCellCurrency(cell) {
    cell.z = '"$"#,##0.00';
    return cell;
}

/**
 * Aplicar formato de porcentaje a una celda
 */
function setCellPercentage(cell) {
    cell.z = '0.00%';
    return cell;
}

/**
 * Crear celda con estilo
 */
function createStyledCell(value, style = {}) {
    const cell = { v: value };
    
    // Tipo de celda
    if (typeof value === 'number') {
        cell.t = 'n';
    } else if (typeof value === 'string') {
        cell.t = 's';
    }
    
    // Aplicar estilo
    if (style.currency) {
        setCellCurrency(cell);
    }
    if (style.percentage) {
        setCellPercentage(cell);
    }
    
    return cell;
}

/**
 * Combinar celdas en un rango
 */
function mergeCells(worksheet, startRow, startCol, endRow, endCol) {
    if (!worksheet['!merges']) {
        worksheet['!merges'] = [];
    }
    worksheet['!merges'].push({
        s: { r: startRow, c: startCol },
        e: { r: endRow, c: endCol }
    });
}

/**
 * Establecer ancho de columna
 */
function setColumnWidth(worksheet, colIndex, width) {
    if (!worksheet['!cols']) {
        worksheet['!cols'] = [];
    }
    worksheet['!cols'][colIndex] = { wch: width };
}

// ============================================================
// 📊 WIDGET: GASTOS REALES
// ============================================================

/**
 * Inicializar widget de Gastos Reales
 */
async function initializeGastosRealesWidget() {
    try {
        console.log('📊 Inicializando widget Gastos Reales...');

        // Cargar datos iniciales - Por defecto: todos los filtros vacíos (mostrar todo)
        const filters = {
            empresa: '',
            ano: '',
            mes: '',
            tipo: ''
        };

        await loadGastosRealesData(filters);
        
        console.log('✅ Widget Gastos Reales inicializado');
        
    } catch (error) {
        console.error('❌ Error inicializando widget Gastos Reales:', error);
        if (typeof showAlert === 'function') {
            showAlert('danger', 'Error inicializando reporte de Gastos Reales');
        }
    }
}

/**
 * Cargar datos del reporte de Gastos Reales
 */
async function loadGastosRealesData(filters = {}) {
    try {
        // Construir parámetros
        const params = {};
        if (filters.empresa) params.empresa = filters.empresa;
        if (filters.ano) params.ano = filters.ano;
        if (filters.mes) params.mes = filters.mes;
        if (filters.tipo) params.tipo = filters.tipo;

        // Llamar al endpoint
        const data = await window.apiGet('reportes/gastos-reales', params);

        if (!data.success) {
            throw new Error(data.message || 'Error en respuesta del servidor');
        }

        // Transform backend response to expected format
        const adaptedData = adaptGastosReales(data);

        // Actualizar indicadores
        updateGastosRealesIndicators(adaptedData);

        // Actualizar gráfico (pasar filtro tipo para mostrar solo las curvas relevantes)
        updateGastosRealesChart(adaptedData.detalle_mensual, filters.tipo);

        // Actualizar tabla
        updateGastosRealesTable(adaptedData.detalle_mensual);

        // Guardar datos para exportación
        gastosRealesData = adaptedData;
        
    } catch (error) {
        console.error('❌ Error cargando datos de Gastos Reales:', error);
        if (typeof showAlert === 'function') {
            showAlert('danger', 'Error cargando datos del reporte: ' + error.message);
        }
        
        // Mostrar mensaje en la tabla
        const tbody = document.getElementById('tablaGastosReales');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Error cargando datos: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
}

/**
 * Actualizar indicadores (cards) de Gastos Reales
 */
function updateGastosRealesIndicators(data) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };
    
    // Total Entradas
    const totalEntradasEl = document.getElementById('totalEntradas');
    if (totalEntradasEl) {
        totalEntradasEl.textContent = formatCurrency(data.total_entradas);
    }
    
    // Total Salidas
    const totalSalidasEl = document.getElementById('totalSalidas');
    if (totalSalidasEl) {
        totalSalidasEl.textContent = formatCurrency(data.total_salidas);
    }
    
    // Flujo Neto
    const flujoNetoEl = document.getElementById('flujoNeto');
    if (flujoNetoEl) {
        flujoNetoEl.textContent = formatCurrency(data.flujo_neto);
        
        // Cambiar color según sea positivo o negativo
        if (data.flujo_neto >= 0) {
            flujoNetoEl.className = 'text-success mb-0';
        } else {
            flujoNetoEl.className = 'text-danger mb-0';
        }
    }
}

/**
 * Actualizar gráfico de Gastos Reales
 * @param {Array} detalleMensual - Datos mensuales
 * @param {String} tipoFiltro - Filtro de tipo: '' (todos), 'I' (ingresos), 'G' (gastos)
 */
function updateGastosRealesChart(detalleMensual, tipoFiltro = '') {
    const ctx = document.getElementById('chartGastosReales');
    if (!ctx) return;

    // Destruir gráfico anterior si existe
    if (gastosRealesChart) {
        gastosRealesChart.destroy();
    }

    // En móvil, agrupar por trimestre para mejor legibilidad
    const mobile = isMobileViewport();
    const chartData = mobile ? aggregateByTrimester(detalleMensual) : detalleMensual;

    const meses = chartData.map(d => d.mes);
    const entradas = chartData.map(d => d.entradas);
    const salidas = chartData.map(d => d.salidas);
    const flujos = chartData.map(d => d.flujo);

    // Construir datasets según el filtro de tipo
    const datasets = [];

    // Si filtro es '' (Todos) o 'I' (Ingresos), mostrar Entradas
    if (tipoFiltro === '' || tipoFiltro === 'I') {
        datasets.push({
            label: 'Entradas',
            data: entradas,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1
        });
    }

    // Si filtro es '' (Todos) o 'G' (Gastos), mostrar Salidas
    if (tipoFiltro === '' || tipoFiltro === 'G') {
        datasets.push({
            label: 'Salidas',
            data: salidas,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.1
        });
    }

    // Flujo Neto: si filtro es '' (Todos) o 'F' (Flujo Neto)
    if (tipoFiltro === '' || tipoFiltro === 'F') {
        datasets.push({
            label: 'Flujo Neto',
            data: flujos,
            borderColor: 'rgb(255, 206, 86)',
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            tension: 0.1
        });
    }

    gastosRealesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: meses,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#E4E6EA',
                        font: { size: mobile ? 10 : 12 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#E4E6EA',
                        font: { size: mobile ? 9 : 12 },
                        callback: function(value) {
                            if (mobile) return '$' + (value / 1000).toFixed(0) + 'k';
                            return '$' + value.toLocaleString('es-MX');
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#E4E6EA',
                        maxRotation: mobile ? 0 : 50,
                        font: { size: mobile ? 10 : 12 }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

/**
 * Actualizar tabla de Gastos Reales
 */
function updateGastosRealesTable(detalleMensual) {
    const tbody = document.getElementById('tablaGastosReales');
    if (!tbody) return;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

    if (!detalleMensual || detalleMensual.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">
                    <i class="fas fa-info-circle me-2"></i>
                    No hay datos disponibles para los filtros seleccionados
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = '';

    // Ordenar de más reciente a más antiguo para la tabla
    const sortedData = [...detalleMensual].sort((a, b) => b.mes.localeCompare(a.mes));

    sortedData.forEach(item => {
        const flujoClass = item.flujo >= 0 ? 'text-success' : 'text-danger';
        const flujoIcon = item.flujo >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
        
        const row = `
            <tr>
                <td>
                    <i class="fas fa-calendar-alt me-2 text-muted"></i>
                    ${item.mes}
                </td>
                <td class="text-end text-success">
                    <i class="fas fa-arrow-up me-1"></i>
                    ${formatCurrency(item.entradas)}
                </td>
                <td class="text-end text-danger">
                    <i class="fas fa-arrow-down me-1"></i>
                    ${formatCurrency(item.salidas)}
                </td>
                <td class="text-end ${flujoClass}">
                    <i class="fas ${flujoIcon} me-1"></i>
                    <strong>${formatCurrency(item.flujo)}</strong>
                </td>
            </tr>
        `;
        
        tbody.insertAdjacentHTML('beforeend', row);
    });

    console.log(`✅ Tabla actualizada con ${sortedData.length} registros`);
}

/**
 * Exportar Gastos Reales a Excel con formato idéntico al original
 */
function exportGastosRealesExcel() {
    try {
        console.log('📤 Exportando Gastos Reales a Excel...');
        
        if (!gastosRealesData || !gastosRealesData.detalle_mensual) {
            if (typeof showAlert === 'function') {
                showAlert('warning', 'No hay datos para exportar');
            }
            return;
        }
        
        if (typeof XLSX === 'undefined') {
            console.error('❌ SheetJS no está cargado');
            if (typeof showAlert === 'function') {
                showAlert('danger', 'Error: Librería de exportación no disponible');
            }
            return;
        }
        
        // Crear workbook
        const wb = XLSX.utils.book_new();
        const ws = {};
        
        // ============================================================
        // ESTRUCTURA DE LA HOJA "GASTOS REALES"
        // ============================================================
        
        const detalle = gastosRealesData.detalle_mensual;
        
        // Fila 1: Encabezado de años (vacío hasta columna D, luego años)
        // Fila 2: Encabezados de columnas
        const row1 = ['', '', '', ''];
        const row2 = ['Concepto', 'Cantidad', 'Costo', ''];
        
        // Agregar meses dinámicamente
        let currentYear = null;
        let yearStartCol = 4;
        
        detalle.forEach((item, idx) => {
            if (item.ano !== currentYear) {
                if (currentYear !== null) {
                    // Marcar donde termina el año anterior para combinar celdas
                    mergeCells(ws, 0, yearStartCol, 0, 3 + idx);
                }
                currentYear = item.ano;
                yearStartCol = 4 + idx;
                row1.push(currentYear.toString());
            } else {
                row1.push('');
            }
            
            // Nombres de meses
            row2.push(item.mes.split(' ')[0]); // Solo el nombre del mes
        });
        
        // Combinar último año
        if (detalle.length > 0) {
            mergeCells(ws, 0, yearStartCol, 0, 3 + detalle.length);
        }
        
        // Agregar columna de Total
        row1.push('', '', 'Total');
        row2.push('', '', 'Total');
        
        // Fila 3: Vacía
        const row3 = Array(row2.length).fill('');
        
        // Fila 4: Entradas
        const row4 = ['Entradas', '', '', ''];
        detalle.forEach(item => {
            row4.push(item.entradas);
        });
        row4.push('', '', gastosRealesData.total_entradas);
        
        // Fila 5: Salidas
        const row5 = ['Salidas', '', '', ''];
        detalle.forEach(item => {
            row5.push(item.salidas);
        });
        row5.push('', '', gastosRealesData.total_salidas);
        
        // Fila 6: Flujo de Efectivo
        const row6 = ['Flujo de Efectivo', '', '', ''];
        detalle.forEach(item => {
            row6.push(item.flujo);
        });
        row6.push('', '', gastosRealesData.flujo_neto);
        
        // Fila 7: Vacía
        const row7 = Array(row2.length).fill('');
        
        // Fila 8: Total de Gastos
        const row8 = ['Total de Gastos', '', gastosRealesData.total_salidas, ''];
        
        // Construir array de datos
        const data = [row1, row2, row3, row4, row5, row6, row7, row8];
        
        // Convertir array a worksheet
        const wsData = XLSX.utils.aoa_to_sheet(data);
        
        // ============================================================
        // APLICAR FORMATOS
        // ============================================================
        
        // Formato de moneda para las celdas numéricas
        const currencyFormat = '"$"#,##0.00';
        
        // Filas de datos (4, 5, 6) - columnas E en adelante
        for (let col = 4; col < row2.length - 3; col++) {
            // Fila 4 (Entradas) - índice 3
            const cellEntradas = XLSX.utils.encode_cell({ r: 3, c: col });
            if (wsData[cellEntradas]) {
                wsData[cellEntradas].z = currencyFormat;
            }
            
            // Fila 5 (Salidas) - índice 4
            const cellSalidas = XLSX.utils.encode_cell({ r: 4, c: col });
            if (wsData[cellSalidas]) {
                wsData[cellSalidas].z = currencyFormat;
            }
            
            // Fila 6 (Flujo) - índice 5
            const cellFlujo = XLSX.utils.encode_cell({ r: 5, c: col });
            if (wsData[cellFlujo]) {
                wsData[cellFlujo].z = currencyFormat;
            }
        }
        
        // Columna Total (últimas 3 filas)
        const totalCol = row2.length - 1;
        ['C8', 'C4', 'C5', 'C6'].forEach(cell => {
            if (wsData[cell]) {
                wsData[cell].z = currencyFormat;
            }
        });
        
        // Formato para totales en columna final
        const cellTotalEntradas = XLSX.utils.encode_cell({ r: 3, c: totalCol });
        const cellTotalSalidas = XLSX.utils.encode_cell({ r: 4, c: totalCol });
        const cellTotalFlujo = XLSX.utils.encode_cell({ r: 5, c: totalCol });
        
        if (wsData[cellTotalEntradas]) wsData[cellTotalEntradas].z = currencyFormat;
        if (wsData[cellTotalSalidas]) wsData[cellTotalSalidas].z = currencyFormat;
        if (wsData[cellTotalFlujo]) wsData[cellTotalFlujo].z = currencyFormat;
        
        // ============================================================
        // CONFIGURAR ANCHOS DE COLUMNA
        // ============================================================
        
        wsData['!cols'] = [
            { wch: 33 },  // Columna A: Concepto
            { wch: 9 },   // Columna B: Cantidad
            { wch: 13 },  // Columna C: Costo
            { wch: 2 }    // Columna D: Separador
        ];
        
        // Columnas de meses (E en adelante)
        for (let i = 0; i < detalle.length + 3; i++) {
            wsData['!cols'].push({ wch: 12 });
        }
        
        // ============================================================
        // COMBINAR CELDAS
        // ============================================================
        
        // Ya se combinaron los años en row1 arriba con mergeCells()
        
        // Combinar celda "Flujo de Efectivo" (A6:D6)
        mergeCells(wsData, 5, 0, 5, 3);
        
        // Establecer rango de la hoja
        const range = XLSX.utils.decode_range(wsData['!ref']);
        range.e.c = row2.length - 1;
        range.e.r = 7;
        wsData['!ref'] = XLSX.utils.encode_range(range);
        
        // Aplicar merges al worksheet
        Object.assign(ws, wsData);
        
        // Agregar worksheet al workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Gastos Reales');
        
        // ============================================================
        // GENERAR Y DESCARGAR ARCHIVO
        // ============================================================
        
        const fecha = new Date().toISOString().split('T')[0];
        const fileName = `Gastos_Reales_${fecha}.xlsx`;
        
        XLSX.writeFile(wb, fileName);
        
        console.log('✅ Archivo Excel generado:', fileName);
        
        if (typeof showAlert === 'function') {
            showAlert('success', `Reporte exportado: ${fileName}`, 3000);
        }
        
    } catch (error) {
        console.error('❌ Error exportando:', error);
        if (typeof showAlert === 'function') {
            showAlert('danger', 'Error al exportar el reporte: ' + error.message);
        }
    }
}

// ============================================================
// 📊 WIDGET: BALANCE GENERAL
// ============================================================

let balanceGeneralChart = null;
let balanceGeneralData = null;

/**
 * Inicializar widget de Balance General
 */
async function initializeBalanceGeneralWidget() {
    try {
        console.log('💰 Inicializando widget Balance General...');

        // Cargar datos iniciales - Por defecto: todos los filtros vacíos (mostrar todo)
        const filters = {
            empresa: '',  // Todas las empresas
            ano: '',      // Todos los años
            mes: ''       // Todos los meses
        };

        await loadBalanceGeneralData(filters);
        
        console.log('✅ Widget Balance General inicializado');
        
    } catch (error) {
        console.error('❌ Error inicializando widget Balance General:', error);
        if (typeof showAlert === 'function') {
            showAlert('danger', 'Error inicializando Balance General');
        }
    }
}

/**
 * Cargar datos del Balance General
 */
async function loadBalanceGeneralData(filters = {}) {
    try {
        // Construir parámetros
        const params = {};
        if (filters.empresa) params.empresa = filters.empresa;
        if (filters.ano) params.ano = filters.ano;
        if (filters.mes) params.mes = filters.mes;

        // Llamar al endpoint v2 con datos completos de socios y cuentas
        const data = await window.apiGet('reportes/balance-general-v2', params);

        if (!data.success) {
            throw new Error(data.message || 'Error en respuesta del servidor');
        }

        // Transform backend response to expected format
        const adaptedResumen = adaptBalanceGeneral(data);

        // Actualizar resumen principal
        updateBalanceGeneralResumen(adaptedResumen);

        // Actualizar tabla de socios (if available in backend)
        if (data.data.socios) {
            updateTablaSocios(data.data.socios, adaptedResumen.inversion_total);
        }

        // Actualizar gastos escuela (if available in backend)
        if (data.data.gastos_escuela) {
            updateGastosEscuela(data.data.gastos_escuela);
        }

        // Actualizar estado de cuentas (if available in backend)
        if (data.data.cuentas_bancarias) {
            updateEstadoCuentas(data.data.cuentas_bancarias);
        }

        // Actualizar gráfico de participación (if available in backend)
        if (data.data.participacion) {
            updateChartParticipacion(data.data.participacion);
        }

        // Actualizar tabla de participación (if available in backend)
        if (data.data.participacion) {
            updateTablaParticipacion(data.data.participacion);
        }

        // Guardar datos para exportación
        balanceGeneralData = {
            resumen: adaptedResumen,
            socios: data.data.socios || [],
            gastos_escuela: data.data.gastos_escuela || [],
            cuentas_bancarias: data.data.cuentas_bancarias || [],
            participacion: data.data.participacion || []
        };
        
        console.log('✅ Balance General actualizado correctamente');
        
    } catch (error) {
        console.error('❌ Error cargando Balance General:', error);
        if (typeof showAlert === 'function') {
            showAlert('danger', 'Error cargando Balance General: ' + error.message);
        }
    }
}

/**
 * Actualizar resumen principal del Balance General
 */
function updateBalanceGeneralResumen(resumen) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };
    
    // Inversión Total
    const inversionTotalEl = document.getElementById('inversionTotal');
    if (inversionTotalEl) {
        inversionTotalEl.textContent = formatCurrency(resumen.inversion_total);
    }
    
    const totalSociosEl = document.getElementById('totalSocios');
    if (totalSociosEl) {
        totalSociosEl.textContent = `${resumen.numero_socios} socio${resumen.numero_socios !== 1 ? 's' : ''}`;
    }
    
    // Saldo Total en Cuentas
    const saldoTotalEl = document.getElementById('saldoTotalCuentas');
    if (saldoTotalEl) {
        saldoTotalEl.textContent = formatCurrency(resumen.saldo_disponible);
    }
    
    const numeroCuentasEl = document.getElementById('numeroCuentas');
    if (numeroCuentasEl) {
        numeroCuentasEl.textContent = '2 cuentas'; // Hardcoded ya que tenemos Inbursa y Mercado Pago
    }
}

/**
 * Actualizar tabla de socios
 */
function updateTablaSocios(socios, totalInversion) {
    const tbody = document.getElementById('tablaSocios');
    const totalEl = document.getElementById('totalInversionSocios');
    
    if (!tbody) return;
    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };
    
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-MX');
    };
    
    if (!socios || socios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">
                    <i class="fas fa-info-circle me-2"></i>
                    No hay datos de inversión disponibles
                </td>
            </tr>
        `;
        if (totalEl) totalEl.textContent = '$0.00';
        return;
    }
    
    tbody.innerHTML = '';
    
    socios.forEach(socio => {
        const row = `
            <tr>
                <td>
                    <i class="fas fa-user-circle me-2 text-primary"></i>
                    <strong>${socio.socio}</strong>
                </td>
                <td class="text-end text-success">
                    ${formatCurrency(socio.inversion)}
                </td>
                <td class="text-end">
                    <span class="badge bg-info">${socio.porcentaje.toFixed(2)}%</span>
                </td>
                <td class="text-end text-muted">
                    ${formatDate(socio.ultima_actualizacion)}
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
    
    // Actualizar total
    if (totalEl) {
        totalEl.textContent = formatCurrency(totalInversion);
    }
}

/**
 * Actualizar gastos escuela
 */
function updateGastosEscuela(gastosEscuela) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };
    
    const gastosEl = document.getElementById('gastosEscuela');
    if (gastosEl) {
        gastosEl.textContent = formatCurrency(gastosEscuela.monto);
    }
    
    const porcentajeEl = document.getElementById('porcentajeGastos');
    if (porcentajeEl) {
        porcentajeEl.textContent = `${gastosEscuela.porcentaje.toFixed(2)}% del total`;
    }
}

/**
 * Actualizar estado de cuentas bancarias
 */
function updateEstadoCuentas(cuentas) {
    const container = document.getElementById('cuentasBancarias');
    if (!container) return;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

    if (!cuentas || cuentas.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted">
                <i class="fas fa-info-circle me-2"></i>
                No hay cuentas registradas
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    // Iconos por tipo de cuenta
    const iconos = {
        'Mercado Pago': 'credit-card',
        'Inbursa': 'university',
        'Efectivo': 'money-bill-wave'
    };

    cuentas.forEach(cuenta => {
        const saldoClass = cuenta.saldo >= 0 ? 'text-success' : 'text-danger';
        const iconoBanco = iconos[cuenta.banco] || 'wallet';

        const card = `
            <div class="col-md-4 mb-3">
                <div class="card h-100" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h6 class="text-white mb-1">
                                    <i class="fas fa-${iconoBanco} me-2"></i>${cuenta.nombre}
                                </h6>
                                <small class="text-muted">${cuenta.tipo}</small>
                            </div>
                            <span class="badge bg-primary">${cuenta.banco}</span>
                        </div>

                        <!-- Detalle Ingresos/Gastos -->
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-1">
                                <small class="text-muted">
                                    <i class="fas fa-arrow-up text-success me-1"></i>Ingresos
                                </small>
                                <small class="text-success">${formatCurrency(cuenta.ingresos || 0)}</small>
                            </div>
                            <div class="d-flex justify-content-between">
                                <small class="text-muted">
                                    <i class="fas fa-arrow-down text-danger me-1"></i>Gastos
                                </small>
                                <small class="text-danger">${formatCurrency(cuenta.gastos || 0)}</small>
                            </div>
                        </div>

                        <hr style="border-color: rgba(255,255,255,0.1); margin: 0.5rem 0;">

                        <!-- Saldo -->
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <small class="text-muted d-block">Saldo</small>
                                <h4 class="${saldoClass} mb-0">${formatCurrency(cuenta.saldo)}</h4>
                            </div>
                            <i class="fas fa-wallet fa-2x text-muted"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', card);
    });
}

/**
 * Actualizar gráfico de participación
 */
function updateChartParticipacion(participacion) {
    const ctx = document.getElementById('chartParticipacion');
    if (!ctx) return;
    
    // Destruir gráfico anterior si existe
    if (balanceGeneralChart) {
        balanceGeneralChart.destroy();
    }
    
    if (!participacion || participacion.length === 0) {
        ctx.parentElement.innerHTML = '<p class="text-center text-muted">No hay datos de participación</p>';
        return;
    }
    
    const labels = participacion.map(p => p.socio);
    const data = participacion.map(p => p.porcentaje);
    
    // Colores para cada socio
    const colors = [
        'rgba(13, 202, 240, 0.8)',   // Cyan
        'rgba(255, 193, 7, 0.8)',    // Amarillo
        'rgba(82, 196, 26, 0.8)',    // Verde
        'rgba(255, 99, 132, 0.8)',   // Rojo
        'rgba(153, 102, 255, 0.8)'   // Morado
    ];
    
    balanceGeneralChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, participacion.length),
                borderColor: colors.slice(0, participacion.length).map(c => c.replace('0.8', '1')),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#E4E6EA',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed.toFixed(2) + '%';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Actualizar tabla de participación
 */
function updateTablaParticipacion(participacion) {
    const tbody = document.getElementById('tablaParticipacion');
    if (!tbody) return;
    
    if (!participacion || participacion.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center text-muted">
                    <i class="fas fa-info-circle me-2"></i>
                    No hay datos de participación
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    participacion.forEach(item => {
        const row = `
            <tr>
                <td>
                    <i class="fas fa-user me-2 text-primary"></i>
                    ${item.socio}
                </td>
                <td class="text-end">
                    <div class="progress" style="height: 25px;">
                        <div class="progress-bar bg-info" role="progressbar" 
                             style="width: ${item.porcentaje}%"
                             aria-valuenow="${item.porcentaje}" 
                             aria-valuemin="0" 
                             aria-valuemax="100">
                            ${item.porcentaje.toFixed(2)}%
                        </div>
                    </div>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

/**
 * Exportar Balance General a Excel con formato idéntico al original
 */
function exportBalanceGeneralExcel() {
    try {
        console.log('📤 Exportando Balance General a Excel...');
        
        if (!balanceGeneralData) {
            if (typeof showAlert === 'function') {
                showAlert('warning', 'No hay datos para exportar');
            }
            return;
        }
        
        if (typeof XLSX === 'undefined') {
            console.error('❌ SheetJS no está cargado');
            if (typeof showAlert === 'function') {
                showAlert('danger', 'Error: Librería de exportación no disponible');
            }
            return;
        }
        
        const wb = XLSX.utils.book_new();
        const data = [];
        
        // ============================================================
        // ESTRUCTURA DE LA HOJA "BALANCE GENERAL"
        // ============================================================
        
        // Fila 1: Título principal (merge)
        const row1 = ['BALANCE GENERAL SYMBIOT FINANCIAL MANAGER'];
        for (let i = 1; i < 34; i++) row1.push('');
        data.push(row1);
        
        // Fila 2-3: Vacías
        data.push(Array(34).fill(''));
        data.push(Array(34).fill(''));
        
        // Fila 4: Encabezados de secciones
        const row4 = [
            'INVERSIÓN POR SOCIO', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
            'ESTADO DE CUENTA', '', '', '',
            'PORCENTAJES DE PARTICIPACIÓN SOCIEDAD', '', '', '',
            '', '', '', '', '', '', '', '', '', ''
        ];
        data.push(row4);
        
        // ============================================================
        // SECCIÓN: INVERSIÓN POR SOCIO
        // ============================================================
        
        const socios = balanceGeneralData.socios || [];
        const formatCurrency = (val) => parseFloat(val) || 0;
        const formatPercent = (val) => (parseFloat(val) || 0) / 100;
        
        // Fila 5-7: Socios individuales
        socios.forEach((socio, idx) => {
            const row = Array(34).fill('');
            row[0] = `Inversión ${socio.socio}`;
            row[13] = formatCurrency(socio.inversion);
            row[14] = formatPercent(socio.porcentaje);
            
            // Estado de cuenta (solo para primera fila)
            if (idx === 0 && balanceGeneralData.cuentas_bancarias) {
                row[16] = 'Saldo Cuenta Inbursa:';
                row[18] = formatCurrency(balanceGeneralData.cuentas_bancarias[0]?.saldo || 0);
            } else if (idx === 1 && balanceGeneralData.cuentas_bancarias) {
                row[16] = 'Saldo Mercado Pago:';
                row[18] = formatCurrency(balanceGeneralData.cuentas_bancarias[1]?.saldo || 0);
            } else if (idx === 2) {
                row[16] = 'TOTAL';
                row[18] = formatCurrency(balanceGeneralData.resumen.saldo_disponible);
            }
            
            // Participación (columna 20-23)
            row[20] = socio.socio;
            row[23] = formatPercent(socio.porcentaje);
            
            data.push(row);
        });
        
        // Fila 8: Gastos Escuela
        const row8 = Array(34).fill('');
        row8[0] = 'Gastos Escuela';
        row8[13] = formatCurrency(balanceGeneralData.gastos_escuela?.monto || 0);
        row8[14] = formatPercent(balanceGeneralData.gastos_escuela?.porcentaje || 0);
        data.push(row8);
        
        // Fila 9: TOTAL
        const row9 = Array(34).fill('');
        row9[0] = 'TOTAL';
        row9[13] = formatCurrency(balanceGeneralData.resumen.total_general);
        row9[14] = 1; // 100%
        row9[33] = `Fecha: ${new Date().toLocaleDateString('es-MX')}`;
        data.push(row9);
        
        // Fila 10: Hoja 1 de 1
        const row10 = Array(34).fill('');
        row10[33] = 'Hoja 1 de 1';
        data.push(row10);
        
        // ============================================================
        // CONVERTIR A WORKSHEET Y APLICAR FORMATOS
        // ============================================================
        
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        // Formato de moneda
        const currencyFormat = '"$"#,##0.00';
        const percentFormat = '0.00%';
        
        // Aplicar formato a inversiones (columna N, filas 5-9)
        for (let row = 4; row <= 8; row++) {
            const cell = XLSX.utils.encode_cell({ r: row, c: 13 });
            if (ws[cell]) ws[cell].z = currencyFormat;
        }
        
        // Aplicar formato a porcentajes (columna O, filas 5-9)
        for (let row = 4; row <= 8; row++) {
            const cell = XLSX.utils.encode_cell({ r: row, c: 14 });
            if (ws[cell]) ws[cell].z = percentFormat;
        }
        
        // Aplicar formato a estado de cuenta (columna S, filas 5-7)
        for (let row = 4; row <= 6; row++) {
            const cell = XLSX.utils.encode_cell({ r: row, c: 18 });
            if (ws[cell]) ws[cell].z = currencyFormat;
        }
        
        // Aplicar formato a participación (columna X, filas 5-7)
        for (let row = 4; row <= 6; row++) {
            const cell = XLSX.utils.encode_cell({ r: row, c: 23 });
            if (ws[cell]) ws[cell].z = percentFormat;
        }
        
        // ============================================================
        // COMBINAR CELDAS
        // ============================================================
        
        ws['!merges'] = [
            // Fila 1: Título (A1:AH2)
            { s: { r: 0, c: 0 }, e: { r: 1, c: 33 } },
            
            // Fila 4: Encabezados
            { s: { r: 3, c: 0 }, e: { r: 3, c: 15 } },   // INVERSIÓN POR SOCIO
            { s: { r: 3, c: 16 }, e: { r: 3, c: 19 } },  // ESTADO DE CUENTA
            { s: { r: 3, c: 20 }, e: { r: 3, c: 23 } }   // PORCENTAJES
        ];
        
        // ============================================================
        // CONFIGURAR ANCHOS DE COLUMNA
        // ============================================================
        
        ws['!cols'] = [
            { wch: 30 },  // A: Concepto
            { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
            { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
            { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
            { wch: 15 },  // N: Monto
            { wch: 10 },  // O: %
            { wch: 5 },
            { wch: 25 },  // Q: Estado cuenta
            { wch: 5 },
            { wch: 15 },  // S: Saldo
            { wch: 5 },
            { wch: 20 },  // U: Socio
            { wch: 5 }, { wch: 5 },
            { wch: 10 },  // X: %
            { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 },
            { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 },
            { wch: 5 }, { wch: 15 }  // AH: Fecha
        ];
        
        // Agregar al workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Balance General');
        
        // ============================================================
        // GENERAR Y DESCARGAR
        // ============================================================
        
        const fecha = new Date().toISOString().split('T')[0];
        const fileName = `Balance_General_${fecha}.xlsx`;
        
        XLSX.writeFile(wb, fileName);
        
        console.log('✅ Balance General exportado:', fileName);
        
        if (typeof showAlert === 'function') {
            showAlert('success', `Balance General exportado: ${fileName}`, 3000);
        }
        
    } catch (error) {
        console.error('❌ Error exportando Balance General:', error);
        if (typeof showAlert === 'function') {
            showAlert('danger', 'Error al exportar: ' + error.message);
        }
    }
}

// ============================================================
// 📊 WIDGET: ALTAS Y BAJAS DE ALUMNOS
// ============================================================

let altasBajasChart = null;
let altasBajasData = null;

/**
 * Inicializar widget de Altas y Bajas
 */
async function initializeAltasBajasWidget(filters = {}) {
    try {
        console.log('👥 Inicializando widget Altas y Bajas...');
        await loadAltasBajasData(filters);
        console.log('✅ Widget Altas y Bajas inicializado');
    } catch (error) {
        console.error('❌ Error inicializando widget Altas y Bajas:', error);
        if (typeof showAlert === 'function') {
            showAlert('danger', 'Error inicializando reporte de Altas y Bajas');
        }
    }
}

/**
 * Cargar datos del reporte de Altas y Bajas
 */
async function loadAltasBajasData(filters = {}) {
    try {
        const params = {};
        if (filters.empresa) params.empresa = filters.empresa;
        if (filters.ano) params.ano = filters.ano;

        const data = await window.apiGet('reportes/altas-bajas', params);

        if (!data.success) {
            throw new Error(data.error || 'Error en respuesta del servidor');
        }

        // Actualizar indicadores
        updateAltasBajasIndicators(data.data.resumen);

        // Actualizar gráfico
        updateAltasBajasChart(data.data.meses);

        // Actualizar tabla
        updateAltasBajasTable(data.data.meses);

        // Guardar datos
        altasBajasData = data.data;

    } catch (error) {
        console.error('❌ Error cargando datos de Altas y Bajas:', error);
        if (typeof showAlert === 'function') {
            showAlert('danger', 'Error cargando datos de Altas y Bajas: ' + error.message);
        }

        const tbody = document.getElementById('tablaAltasBajas');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Error cargando datos: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
}

/**
 * Actualizar indicadores de Altas y Bajas
 */
function updateAltasBajasIndicators(resumen) {
    const totalAltasEl = document.getElementById('totalAltas');
    if (totalAltasEl) totalAltasEl.textContent = resumen.total_altas || 0;

    const totalBajasEl = document.getElementById('totalBajas');
    if (totalBajasEl) totalBajasEl.textContent = resumen.total_bajas || 0;

    const netoEl = document.getElementById('netoAltasBajas');
    if (netoEl) {
        const neto = resumen.neto || 0;
        netoEl.textContent = (neto > 0 ? '+' : '') + neto;
        netoEl.className = neto >= 0 ? 'text-success mb-0' : 'text-danger mb-0';
    }

    const totalAlumnosEl = document.getElementById('totalAlumnosRegistrados');
    if (totalAlumnosEl) totalAlumnosEl.textContent = resumen.total_alumnos || 0;
}

/**
 * Actualizar gráfico de Altas y Bajas (barras agrupadas)
 */
function updateAltasBajasChart(meses) {
    const ctx = document.getElementById('chartAltasBajas');
    if (!ctx) return;

    if (altasBajasChart) {
        altasBajasChart.destroy();
    }

    if (!meses || meses.length === 0) {
        return;
    }

    const labels = meses.map(d => d.mes);
    const altas = meses.map(d => d.altas);
    const bajas = meses.map(d => d.bajas);

    const mobile = isMobileViewport();

    altasBajasChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Altas',
                    data: altas,
                    backgroundColor: 'rgba(25, 135, 84, 0.7)',
                    borderColor: 'rgb(25, 135, 84)',
                    borderWidth: 1
                },
                {
                    label: 'Bajas',
                    data: bajas,
                    backgroundColor: 'rgba(220, 53, 69, 0.7)',
                    borderColor: 'rgb(220, 53, 69)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#E4E6EA',
                        font: { size: mobile ? 10 : 12 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#E4E6EA',
                        stepSize: 1,
                        font: { size: mobile ? 9 : 12 }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#E4E6EA',
                        maxRotation: mobile ? 45 : 0,
                        font: { size: mobile ? 9 : 12 }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

/**
 * Actualizar tabla de Altas y Bajas
 */
function updateAltasBajasTable(meses) {
    const tbody = document.getElementById('tablaAltasBajas');
    if (!tbody) return;

    if (!meses || meses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    <i class="fas fa-info-circle me-2"></i>
                    No hay datos disponibles para los filtros seleccionados
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = '';

    // Ordenar de más reciente a más antiguo
    const sortedData = [...meses].sort((a, b) => b.mes.localeCompare(a.mes));

    sortedData.forEach(item => {
        const netoClass = item.neto >= 0 ? 'text-success' : 'text-danger';
        const netoIcon = item.neto >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
        const netoPrefix = item.neto > 0 ? '+' : '';

        const row = `
            <tr>
                <td>
                    <i class="fas fa-calendar-alt me-2 text-muted"></i>
                    ${item.mes}
                </td>
                <td class="text-end text-success">
                    <i class="fas fa-user-plus me-1"></i>
                    ${item.altas}
                </td>
                <td class="text-end text-danger">
                    <i class="fas fa-user-minus me-1"></i>
                    ${item.bajas}
                </td>
                <td class="text-end ${netoClass}">
                    <i class="fas ${netoIcon} me-1"></i>
                    <strong>${netoPrefix}${item.neto}</strong>
                </td>
                <td class="text-end text-warning">
                    <i class="fas fa-users me-1"></i>
                    ${item.alumnos_activos}
                </td>
            </tr>
        `;

        tbody.insertAdjacentHTML('beforeend', row);
    });

    console.log(`✅ Tabla Altas/Bajas actualizada con ${sortedData.length} registros`);
}

// ============================================================
// 🔗 EXPOSICIÓN DE FUNCIONES GLOBALES
// ============================================================

// Gastos Reales
window.initializeGastosRealesWidget = initializeGastosRealesWidget;
window.loadGastosRealesData = loadGastosRealesData;
window.exportGastosRealesExcel = exportGastosRealesExcel;
window.updateGastosRealesChart = updateGastosRealesChart;
window.updateGastosRealesTable = updateGastosRealesTable;

// Balance General
window.initializeBalanceGeneralWidget = initializeBalanceGeneralWidget;
window.loadBalanceGeneralData = loadBalanceGeneralData;
window.exportBalanceGeneralExcel = exportBalanceGeneralExcel;
window.updateChartParticipacion = updateChartParticipacion;
window.updateTablaParticipacion = updateTablaParticipacion;

// Altas y Bajas
window.initializeAltasBajasWidget = initializeAltasBajasWidget;
window.loadAltasBajasData = loadAltasBajasData;

console.log('✅ Reportes Widgets Module cargado');