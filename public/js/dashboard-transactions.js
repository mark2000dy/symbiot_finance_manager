/* ====================================================
   DASHBOARD TRANSACTIONS MODULE - SYMBIOT FINANCIAL MANAGER
   Archivo: public/js/dashboard-transactions.js
   Widget de transacciones recientes y gestión
   ==================================================== */

// ============================================================
// 💰 FUNCIONES PRINCIPALES DE TRANSACCIONES
// ============================================================

/**
 * Cargar y renderizar transacciones recientes
 */
async function loadRecentTransactions(page = 1) {
    try {
        console.log(`💰 Cargando transacciones recientes - Página ${page}...`);
        
        // Mostrar estado de carga
        showTransactionsLoadingState(true);
        
        // Construir parámetros
        const params = {
            page: page,
            limit: transactionsPerPage,
            sort: 'fecha DESC' // Más recientes primero
        };
        
        // Agregar filtro de empresa si existe
        if (currentCompanyFilter) {
            params.empresa_id = currentCompanyFilter;
        }
        
        console.log('📡 Parámetros de solicitud:', params);
        
        const response = await apiGet('/gastos/api/transacciones', params);
        
        if (response.success && response.data) {
            // Actualizar cache global
            window.recentTransactionsCache = response.data;
            currentPage = page;
            
            console.log(`✅ ${response.data.length} transacciones cargadas`);
            
            // Ocultar estado de carga
            showTransactionsLoadingState(false);
            
            if (response.data.length === 0) {
                showTransactionsEmptyState('No hay transacciones registradas');
            } else {
                // Renderizar tabla y paginación
                renderTransactionsTable(response.data);
                renderTransactionsPagination(response.pagination);
            }
            
        } else {
            throw new Error(response.message || 'Error cargando transacciones');
        }
        
    } catch (error) {
        console.error('❌ Error cargando transacciones:', error);
        showTransactionsLoadingState(false);
        showTransactionsError('Error cargando transacciones recientes');
        showAlert('danger', 'Error cargando transacciones: ' + error.message);
    }
}

/**
 * Renderizar tabla de transacciones
 */
function renderTransactionsTable(transactions) {
    const container = document.getElementById('recentTransactionsContainer');
    
    if (!container || !transactions || transactions.length === 0) {
        showTransactionsEmptyState('No hay transacciones para mostrar');
        return;
    }
    
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-dark table-hover table-sm">
                <thead>
                    <tr>
                        <th><i class="fas fa-calendar me-1"></i>Fecha</th>
                        <th><i class="fas fa-tag me-1"></i>Concepto</th>
                        <th><i class="fas fa-user me-1"></i>Socio</th>
                        <th><i class="fas fa-building me-1"></i>Empresa</th>
                        <th><i class="fas fa-credit-card me-1"></i>Forma de Pago</th>
                        <th><i class="fas fa-dollar-sign me-1"></i>Total</th>
                        <th><i class="fas fa-cogs me-1"></i>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.map(transaction => renderTransactionRow(transaction)).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    console.log(`✅ Tabla de transacciones renderizada con ${transactions.length} registros`);
}

/**
 * Renderizar fila individual de transacción
 */
function renderTransactionRow(transaction) {
    const formattedDate = transaction.fecha ? formatDate(transaction.fecha) : 'Sin fecha';
    const formattedTotal = formatCurrency(transaction.total || 0);
    const transactionType = transaction.tipo === 'I' ? 'Ingreso' : 'Gasto';
    const amountClass = transaction.tipo === 'I' ? 'text-success' : 'text-danger';
    const amountIcon = transaction.tipo === 'I' ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
    
    // Obtener nombre de empresa
    const empresaName = getCompanyName(transaction.empresa_id);
    
    // Truncar concepto si es muy largo
    const conceptoTruncado = transaction.concepto && transaction.concepto.length > 30 
        ? transaction.concepto.substring(0, 30) + '...'
        : transaction.concepto || 'Sin concepto';
    
    return `
        <tr>
            <td>
                <small>${formattedDate}</small>
            </td>
            <td>
                <div title="${transaction.concepto || 'Sin concepto'}">
                    <strong>${conceptoTruncado}</strong>
                    <br><small class="text-muted">${transactionType}</small>
                </div>
            </td>
            <td>
                <small>${transaction.socio || 'Sin especificar'}</small>
            </td>
            <td>
                <small>${empresaName}</small>
            </td>
            <td>
                <span class="badge bg-secondary">${transaction.forma_pago || 'N/A'}</span>
            </td>
            <td>
                <strong class="${amountClass}">
                    <i class="${amountIcon} me-1"></i>${formattedTotal}
                </strong>
            </td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-primary" onclick="editTransaction(${transaction.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="viewTransactionDetails(${transaction.id})" title="Ver Detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${isUserAdmin() ? `
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteTransaction(${transaction.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `;
}

/**
 * Renderizar paginación de transacciones
 */
function renderTransactionsPagination(pagination) {
    const paginationContainer = document.getElementById('transactionsPagination');
    const paginationNav = document.getElementById('transactionsPaginationNav');
    
    if (!pagination || pagination.total_pages <= 1) {
        paginationNav.style.display = 'none';
        return;
    }
    
    paginationNav.style.display = 'block';
    
    let paginationHTML = '';
    
    // Botón anterior
    if (pagination.current_page > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="event.preventDefault(); loadRecentTransactions(${pagination.current_page - 1})">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;
    }
    
    // Números de página
    const startPage = Math.max(1, pagination.current_page - 2);
    const endPage = Math.min(pagination.total_pages, pagination.current_page + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === pagination.current_page ? 'active' : '';
        paginationHTML += `
            <li class="page-item ${isActive}">
                <a class="page-link" href="#" onclick="event.preventDefault(); loadRecentTransactions(${i})">${i}</a>
            </li>
        `;
    }
    
    // Botón siguiente
    if (pagination.current_page < pagination.total_pages) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="event.preventDefault(); loadRecentTransactions(${pagination.current_page + 1})">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;
    }
    
    paginationContainer.innerHTML = paginationHTML;
}

// ============================================================
// 🎨 FUNCIONES DE ESTADOS DE UI
// ============================================================

/**
 * Mostrar/ocultar estado de carga de transacciones
 */
function showTransactionsLoadingState(show) {
    const container = document.getElementById('recentTransactionsContainer');
    
    if (show) {
        container.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin fa-2x mb-3"></i>
                <p>Cargando transacciones...</p>
            </div>
        `;
    }
    
    const paginationNav = document.getElementById('transactionsPaginationNav');
    if (paginationNav) {
        paginationNav.style.display = show ? 'none' : 'block';
    }
}

/**
 * Mostrar estado vacío de transacciones
 */
function showTransactionsEmptyState(message = 'No hay transacciones') {
    const container = document.getElementById('recentTransactionsContainer');
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-receipt fa-3x mb-3"></i>
            <h5>Sin Transacciones</h5>
            <p class="text-muted">${message}</p>
            <button class="btn btn-primary btn-sm" onclick="showAddTransactionModal()">
                <i class="fas fa-plus me-1"></i>Nueva Transacción
            </button>
        </div>
    `;
    
    const paginationNav = document.getElementById('transactionsPaginationNav');
    if (paginationNav) {
        paginationNav.style.display = 'none';
    }
}

/**
 * Mostrar estado de error de transacciones
 */
function showTransactionsError(message = 'Error cargando datos') {
    const container = document.getElementById('recentTransactionsContainer');
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle fa-3x mb-3 text-warning"></i>
            <h5>Error de Carga</h5>
            <p class="text-muted">${message}</p>
            <button class="btn btn-outline-primary btn-sm" onclick="loadRecentTransactions(currentPage)">
                <i class="fas fa-sync-alt me-1"></i>Reintentar
            </button>
        </div>
    `;
    
    const paginationNav = document.getElementById('transactionsPaginationNav');
    if (paginationNav) {
        paginationNav.style.display = 'none';
    }
}

// ============================================================
// 🔧 FUNCIONES DE GESTIÓN DE TRANSACCIONES
// ============================================================

/**
 * Editar transacción existente
 */
async function editTransaction(transactionId) {
    try {
        console.log(`📝 Editando transacción ID: ${transactionId}`);
        
        // Buscar transacción en cache
        const transaction = window.recentTransactionsCache.find(t => t.id == transactionId);
        
        if (!transaction) {
            // Si no está en cache, cargar desde API
            const response = await apiGet(`/gastos/api/transacciones/${transactionId}`);
            if (!response.success) {
                throw new Error('Transacción no encontrada');
            }
            transaction = response.data;
        }
        
        // Establecer modo de edición
        window.editingTransactionId = transactionId;
        
        // Llenar formulario con datos de la transacción
        document.getElementById('transactionDate').value = transaction.fecha || '';
        document.getElementById('transactionConcept').value = transaction.concepto || '';
        document.getElementById('transactionSocio').value = transaction.socio || '';
        document.getElementById('transactionCompany').value = transaction.empresa_id || '';
        document.getElementById('transactionPaymentMethod').value = transaction.forma_pago || '';
        document.getElementById('transactionQuantity').value = transaction.cantidad || 1;
        document.getElementById('transactionPrice').value = transaction.precio_unitario || 0;
        
        // Calcular y mostrar total
        const total = (transaction.cantidad || 1) * (transaction.precio_unitario || 0);
        document.getElementById('transactionTotal').value = formatCurrency(total);
        
        // Cambiar título y botón del modal
        const modalTitle = document.querySelector('#addTransactionModal .modal-title');
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-edit me-2"></i>Editar Transacción';
        }
        
        const saveBtn = document.querySelector('#addTransactionModal .modal-footer .btn-primary');
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fas fa-save me-1"></i>Actualizar Transacción';
        }
        
        // Mostrar modal
        if (addTransactionModalInstance) {
            addTransactionModalInstance.show();
        }
        
        console.log('✅ Modal de edición abierto para transacción:', transaction.concepto);
        
    } catch (error) {
        console.error('❌ Error editando transacción:', error);
        showAlert('danger', 'Error cargando datos de la transacción');
    }
}

/**
 * Ver detalles completos de transacción
 */
async function viewTransactionDetails(transactionId) {
    try {
        console.log(`👁️ Viendo detalles de transacción ID: ${transactionId}`);
        
        // Buscar transacción en cache
        let transaction = window.recentTransactionsCache.find(t => t.id == transactionId);
        
        if (!transaction) {
            // Si no está en cache, cargar desde API
            const response = await apiGet(`/gastos/api/transacciones/${transactionId}`);
            if (!response.success) {
                throw new Error('Transacción no encontrada');
            }
            transaction = response.data;
        }
        
        // Crear modal de detalles dinámicamente
        const detailsModal = createTransactionDetailsModal(transaction);
        
        // Agregar modal al DOM temporalmente
        document.body.appendChild(detailsModal);
        
        // Mostrar modal
        const modalInstance = new bootstrap.Modal(detailsModal);
        modalInstance.show();
        
        // Remover modal del DOM cuando se cierre
        detailsModal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(detailsModal);
        });
        
        console.log('✅ Modal de detalles mostrado');
        
    } catch (error) {
        console.error('❌ Error mostrando detalles:', error);
        showAlert('danger', 'Error cargando detalles de la transacción');
    }
}

/**
 * Crear modal de detalles de transacción
 */
function createTransactionDetailsModal(transaction) {
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal fade';
    modalDiv.tabIndex = -1;
    
    const formattedDate = transaction.fecha ? formatDate(transaction.fecha) : 'Sin fecha';
    const formattedTotal = formatCurrency(transaction.total || 0);
    const transactionType = transaction.tipo === 'I' ? 'Ingreso' : 'Gasto';
    const typeClass = transaction.tipo === 'I' ? 'success' : 'danger';
    const empresaName = getCompanyName(transaction.empresa_id);
    
    modalDiv.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-receipt me-2"></i>
                        Detalles de Transacción
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6><i class="fas fa-info-circle me-2"></i>Información General</h6>
                            <table class="table table-dark table-sm">
                                <tr>
                                    <td><strong>ID:</strong></td>
                                    <td>#${transaction.id}</td>
                                </tr>
                                <tr>
                                    <td><strong>Fecha:</strong></td>
                                    <td>${formattedDate}</td>
                                </tr>
                                <tr>
                                    <td><strong>Tipo:</strong></td>
                                    <td><span class="badge bg-${typeClass}">${transactionType}</span></td>
                                </tr>
                                <tr>
                                    <td><strong>Empresa:</strong></td>
                                    <td>${empresaName}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6><i class="fas fa-dollar-sign me-2"></i>Información Financiera</h6>
                            <table class="table table-dark table-sm">
                                <tr>
                                    <td><strong>Cantidad:</strong></td>
                                    <td>${transaction.cantidad || 1}</td>
                                </tr>
                                <tr>
                                    <td><strong>Precio Unitario:</strong></td>
                                    <td>${formatCurrency(transaction.precio_unitario || 0)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Total:</strong></td>
                                    <td><strong class="text-${typeClass}">${formattedTotal}</strong></td>
                                </tr>
                                <tr>
                                    <td><strong>Forma de Pago:</strong></td>
                                    <td><span class="badge bg-secondary">${transaction.forma_pago || 'N/A'}</span></td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <hr>
                    <h6><i class="fas fa-file-alt me-2"></i>Descripción</h6>
                    <div class="alert alert-dark">
                        <strong>Concepto:</strong> ${transaction.concepto || 'Sin descripción'}
                    </div>
                    <div class="alert alert-dark">
                        <strong>Socio/Responsable:</strong> ${transaction.socio || 'Sin especificar'}
                    </div>
                    ${transaction.created_at ? `
                        <hr>
                        <small class="text-muted">
                            <i class="fas fa-clock me-1"></i>
                            Registrado el ${formatDate(transaction.created_at)}
                        </small>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-primary" onclick="editTransaction(${transaction.id}); this.closest('.modal').querySelector('[data-bs-dismiss]').click();">
                        <i class="fas fa-edit me-1"></i>Editar
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times me-1"></i>Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return modalDiv;
}

/**
 * Eliminar transacción (solo administradores)
 */
async function deleteTransactionFromList(transactionId) {
    try {
        // Buscar transacción para obtener información
        const transaction = window.recentTransactionsCache.find(t => t.id == transactionId);
        
        if (!transaction) {
            showAlert('warning', 'Transacción no encontrada');
            return;
        }
        
        // Confirmación
        const confirmMessage = `¿Eliminar la transacción "${transaction.concepto}"?\n\n` +
                              `Total: ${formatCurrency(transaction.total)}\n` +
                              `Fecha: ${formatDate(transaction.fecha)}\n\n` +
                              `Esta acción no se puede deshacer.`;
        
        if (!confirm(confirmMessage)) {
            console.log('🚫 Eliminación cancelada por el usuario');
            return;
        }
        
        console.log(`🗑️ Eliminando transacción: ${transaction.concepto} (ID: ${transactionId})`);
        
        // Llamar API para eliminar
        await deleteTransaction(transactionId);
        
        showAlert('success', `Transacción "${transaction.concepto}" eliminada exitosamente`);
        
        // Recargar lista y estadísticas
        await loadRecentTransactions(currentPage);
        await loadDashboardStats(currentCompanyFilter);
        
        console.log(`✅ Transacción eliminada: ${transaction.concepto}`);
        
    } catch (error) {
        console.error('❌ Error eliminando transacción:', error);
        showAlert('danger', `Error eliminando transacción: ${error.message}`);
    }
}

// ============================================================
// 🔧 FUNCIONES DE UTILIDAD
// ============================================================

/**
 * Obtener nombre de empresa por ID
 */
function getCompanyName(empresaId) {
    const companies = {
        '1': 'Rockstar Skull',
        '2': 'Symbiot Technologies'
    };
    return companies[empresaId] || 'Empresa Desconocida';
}

/**
 * Configurar listeners para cálculo automático
 */
function setupCalculationListeners() {
    const quantityInput = document.getElementById('transactionQuantity');
    const priceInput = document.getElementById('transactionPrice');
    
    if (quantityInput && priceInput) {
        function updateTotal() {
            const quantity = parseFloat(quantityInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;
            const total = quantity * price;
            
            const totalInput = document.getElementById('transactionTotal');
            if (totalInput) {
                totalInput.value = formatCurrency(total);
            }
        }
        
        quantityInput.addEventListener('input', updateTotal);
        priceInput.addEventListener('input', updateTotal);
        
        console.log('✅ Listeners de cálculo configurados');
    }
}

/**
 * Exportar transacciones a CSV
 */
function exportTransactionsToCSV() {
    try {
        console.log('📊 Exportando transacciones a CSV...');
        
        if (!window.recentTransactionsCache || window.recentTransactionsCache.length === 0) {
            showAlert('warning', 'No hay transacciones para exportar');
            return;
        }
        
        // Crear contenido CSV
        const headers = ['Fecha', 'Concepto', 'Socio', 'Empresa', 'Forma de Pago', 'Cantidad', 'Precio Unitario', 'Total', 'Tipo'];
        const csvContent = [
            headers.join(','),
            ...window.recentTransactionsCache.map(transaction => [
                transaction.fecha || '',
                `"${(transaction.concepto || '').replace(/"/g, '""')}"`,
                `"${(transaction.socio || '').replace(/"/g, '""')}"`,
                `"${getCompanyName(transaction.empresa_id)}"`,
                transaction.forma_pago || '',
                transaction.cantidad || 0,
                transaction.precio_unitario || 0,
                transaction.total || 0,
                transaction.tipo === 'I' ? 'Ingreso' : 'Gasto'
            ].join(','))
        ].join('\n');
        
        // Descargar archivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `transacciones_${new Date().toISOString().split('T')[0]}.csv`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showAlert('success', 'Transacciones exportadas exitosamente');
        
    } catch (error) {
        console.error('❌ Error exportando transacciones:', error);
        showAlert('danger', 'Error exportando transacciones');
    }
}

/**
 * Filtrar transacciones por texto
 */
function filterTransactions(searchText) {
    if (!searchText || searchText.trim() === '') {
        // Si no hay filtro, recargar todas las transacciones
        loadRecentTransactions(1);
        return;
    }
    
    const filteredTransactions = window.recentTransactionsCache.filter(transaction => {
        const searchLower = searchText.toLowerCase();
        return (
            (transaction.concepto && transaction.concepto.toLowerCase().includes(searchLower)) ||
            (transaction.socio && transaction.socio.toLowerCase().includes(searchLower)) ||
            (transaction.forma_pago && transaction.forma_pago.toLowerCase().includes(searchLower))
        );
    });
    
    console.log(`🔍 Filtro aplicado: "${searchText}" - ${filteredTransactions.length} resultados`);
    
    if (filteredTransactions.length === 0) {
        showTransactionsEmptyState(`No se encontraron transacciones que coincidan con "${searchText}"`);
    } else {
        renderTransactionsTable(filteredTransactions);
        // Ocultar paginación cuando se filtran resultados
        const paginationNav = document.getElementById('transactionsPaginationNav');
        if (paginationNav) {
            paginationNav.style.display = 'none';
        }
    }
}

// ============================================================
// 🔗 EXPOSICIÓN DE FUNCIONES GLOBALES
// ============================================================

// Funciones principales
window.loadRecentTransactions = loadRecentTransactions;
window.editTransaction = editTransaction;
window.viewTransactionDetails = viewTransactionDetails;
window.deleteTransactionFromList = deleteTransactionFromList;

// Funciones de UI
window.showTransactionsLoadingState = showTransactionsLoadingState;
window.showTransactionsEmptyState = showTransactionsEmptyState;
window.showTransactionsError = showTransactionsError;

// Funciones de utilidad
window.setupCalculationListeners = setupCalculationListeners;
window.exportTransactionsToCSV = exportTransactionsToCSV;
window.filterTransactions = filterTransactions;
window.getCompanyName = getCompanyName;

console.log('✅ Dashboard Transactions Module cargado - Funciones de transacciones disponibles');