/* ====================================================
   DASHBOARD STUDENTS MODULE - SYMBIOT FINANCIAL MANAGER
   Archivo: public/js/dashboard-students.js
   Widget completo de gestión de alumnos con correcciones críticas
   ==================================================== */

// ============================================================
// 🎓 FUNCIONES PRINCIPALES DE GESTIÓN DE ALUMNOS
// ============================================================

/**
 * Verificar si los elementos del DOM existen para el widget de alumnos
 */
function verifyStudentsElements() {
    const requiredElements = [
        'studentsLoadingState',
        'studentsTableContainer', 
        'studentsEmptyState',
        'studentsTableBody'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.warn('⚠️ Elementos faltantes en widget de alumnos:', missingElements);
        console.warn('⚠️ Widget de gestión de alumnos no disponible en esta vista');
        return false;
    }
    
    return true;
}

/**
 * Poblar filtros de maestros e instrumentos al inicializar el widget
 */
async function initializeStudentFilters() {
    try {
        console.log('🔧 Inicializando filtros de alumnos...');
        
        // Poblar filtro de maestros
        const maestrosResponse = await fetch('/gastos/api/maestros');
        if (maestrosResponse.ok) {
            const maestrosData = await maestrosResponse.json();
            if (maestrosData.success) {
                const teacherSelect = document.getElementById('teacherFilter');
                if (teacherSelect) {
                    const teacherOptions = maestrosData.data
                        .map(maestro => `<option value="${maestro.id}">${maestro.nombre}</option>`)
                        .join('');
                    teacherSelect.innerHTML = '<option value="">👨‍🏫 Todos los Maestros</option>' + teacherOptions;
                }
            }
        }
        
        // Poblar filtro de instrumentos
        const instrumentosResponse = await fetch('/gastos/api/instrumentos');
        if (instrumentosResponse.ok) {
            const instrumentosData = await instrumentosResponse.json();
            if (instrumentosData.success) {
                const instrumentSelect = document.getElementById('instrumentFilter');
                if (instrumentSelect) {
                    const instrumentOptions = instrumentosData.data
                        .map(instrumento => `<option value="${instrumento.nombre}">${instrumento.nombre}</option>`)
                        .join('');
                    instrumentSelect.innerHTML = '<option value="">🎵 Todos</option>' + instrumentOptions;
                }
            }
        }
        
        console.log('✅ Filtros de alumnos inicializados');
        
    } catch (error) {
        console.error('❌ Error inicializando filtros:', error);
    }
}

/**
 * Función principal para cargar lista de alumnos con paginación
 * CORRECCIÓN: Manejo mejorado de estado vacío y filtros
 */
async function loadStudentsList(page = 1) {
    // CORRECCIÓN: Verificar que los elementos existan antes de proceder
    if (!verifyStudentsElements()) {
        console.log('📭 Widget de alumnos no disponible - saltando carga');
        return;
    }
    
    try {
        console.log(`🎓 Cargando alumnos - Página ${page}...`);
        console.log('🔍 Filtros actuales:', currentStudentFilters);
        
        // Mostrar loading
        showStudentsLoadingState(true);
        
        // Construir URL con parámetros
        const empresaIdParam = currentCompanyFilter || 1;
        let url = `/gastos/api/alumnos?empresa_id=${empresaIdParam}&page=${page}&limit=${studentsPerPage}`;
        
        // Agregar filtros si existen
        if (currentStudentFilters.statusFilter) {
            url += `&estatus=${currentStudentFilters.statusFilter}`;
        }
        if (currentStudentFilters.instrumentFilter) {
            url += `&clase=${currentStudentFilters.instrumentFilter}`;
        }
        if (currentStudentFilters.teacherFilter) {
            url += `&maestro_id=${currentStudentFilters.teacherFilter}`;
        }
        if (currentStudentFilters.paymentFilter) {
            url += `&pago=${currentStudentFilters.paymentFilter}`;
        }
        
        console.log('📡 URL de solicitud:', url);

        const response = await fetch(url);
        const result = await response.json();
        
        console.log('📥 Respuesta del servidor:', result);
        console.log('📊 Registros recibidos:', result.data?.length || 0);

        if (result.success && result.data) {
            // Actualizar variables globales
            studentsData = result.data;
            currentStudentsPage = page;
            totalStudentsPages = result.pagination?.total_pages || 1;
            totalStudentsRecords = result.pagination?.total_records || 0;

            // CORRECCIÓN: Definir response para evitar error línea 453
            const response = result;
            
            console.log(`✅ Página ${page} de ${totalStudentsPages} cargada`);
            
            // Ocultar loading
            showStudentsLoadingState(false);
            
            if (studentsData.length === 0) {
                // CORRECCIÓN: Manejo mejorado de estado vacío
                const hasActiveFilters = Object.values(currentStudentFilters).some(filter => filter !== '');
                const message = hasActiveFilters 
                    ? 'No se encontraron alumnos que coincidan con los filtros aplicados'
                    : 'No hay alumnos registrados';
                showStudentsEmptyState(message);
            } else {
                // Renderizar tabla y paginación
                renderStudentsTable();
                renderStudentsPagination();
                
                
                // Actualizar contadores si existen
                const filteredCountElement = document.getElementById('filteredCount');
                if (filteredCountElement) {
                    filteredCountElement.textContent = totalStudentsRecords;
                }
                
                const totalCountElement = document.getElementById('totalCount');
                if (totalCountElement) {
                    totalCountElement.textContent = totalStudentsRecords;
                }
            }
            
            // Actualizar resumen de filtros
            updateStudentsFilterSummary();
            
        } else {
            throw new Error(result.message || 'Error cargando alumnos');
        }
        
    } catch (error) {
        console.error('❌ Error cargando alumnos:', error);
        // CORRECCIÓN: Verificar que el elemento existe antes de usarlo
        const loadingElement = document.getElementById('studentsLoading');
        if (loadingElement) {
            loadingElement.style.display = 'block';
        } else {
            console.warn('⚠️ Elemento studentsLoading no encontrado');
        }
        showStudentsEmptyState('Error cargando la lista de alumnos');
        showAlert('danger', 'Error cargando alumnos: ' + error.message);
    }
}

/**
 * CORRECCIÓN CRÍTICA: Función saveNewStudent() completa
 * PROBLEMA ORIGINAL: Función estaba cortada e incompleta
 */
async function saveNewStudent() {
    try {
        console.log('🚀 Iniciando saveNewStudent...');
        
        // Proteger contra múltiples envíos
        const submitBtn = document.querySelector('#addStudentModal .btn-success');
        if (submitBtn.disabled) {
            console.log('⚠️ Envío ya en progreso...');
            return;
        }

        // Deshabilitar botón y cambiar texto
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Registrando...';

        const form = document.getElementById('addStudentForm');

        if (!form.checkValidity()) {
            console.log('❌ Formulario no válido');
            form.reportValidity();
            return;
        }
        
        console.log('✅ Formulario válido, continuando...');
        
        // CORRECCIÓN: Recopilar datos completos del formulario
        const studentData = {
            nombre: document.getElementById('newStudentName').value.trim(),
            edad: document.getElementById('newStudentAge').value ? parseInt(document.getElementById('newStudentAge').value) : null,
            telefono: document.getElementById('newStudentPhone').value || null,
            email: document.getElementById('newStudentEmail').value || null,
            fecha_inscripcion: document.getElementById('newStudentEnrollmentDate').value || null,
            clase: document.getElementById('newStudentInstrument').value || null,
            tipo_clase: 'Individual',
            maestro_id: document.getElementById('newStudentTeacher').value || null,
            horario: document.getElementById('newStudentSchedule').value || null,
            estatus: 'Activo',
            promocion: document.getElementById('newStudentPromotion').value || null,
            precio_mensual: document.getElementById('newStudentMonthlyFee').value ? 
                parseFloat(document.getElementById('newStudentMonthlyFee').value) : null,
            forma_pago: document.getElementById('newStudentPaymentMethod').value || null,
            domiciliado: document.getElementById('newStudentDomiciled').value === 'Si',
            titular_domicilado: document.getElementById('newStudentDomiciliedName').value || null,
            empresa_id: currentCompanyFilter || 1
        };
        
        console.log('📤 Datos a enviar:', studentData);
        
        // CORRECCIÓN: Llamada completa al backend
        const response = await fetch('/gastos/api/alumnos', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(studentData)
        });

        // CORRECCIÓN: Manejo correcto de errores HTTP
        if (!response.ok) {
            let errorMessage = `Error ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                errorMessage = 'Error de comunicación con el servidor';
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        
        if (result.success) {
            showAlert('success', `Alumno "${studentData.nombre}" registrado exitosamente`);
            
            // Cerrar modal
            const addModal = bootstrap.Modal.getInstance(document.getElementById('addStudentModal'));
            if (addModal) {
                addModal.hide();
            }
            
            // Recargar lista
            await loadStudentsList(currentStudentsPage);
            
            console.log('✅ Alumno registrado correctamente');
        } else {
            throw new Error(result.message || 'Error registrando alumno');
        }
        
    } catch (error) {
        console.error('❌ Error registrando alumno:', error);
        showAlert('danger', 'Error registrando alumno: ' + error.message);
    } finally {
        // Restaurar botón siempre
        const submitBtn = document.querySelector('#addStudentModal .btn-success');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save me-1"></i>Registrar Alumno';
        }
    }
}

/**
 * CORRECCIÓN CRÍTICA: Función saveStudentChanges() con manejo mejorado
 * PROBLEMA ORIGINAL: Simulaba éxito cuando debería manejar errores reales
 */
async function saveStudentChanges() {
    console.log('💾 Guardando cambios del alumno...');
    
    try {
        const form = document.getElementById('editStudentForm');
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Obtener datos correctamente
        const studentData = {
            id: document.getElementById('editStudentId').value,
            nombre: document.getElementById('editStudentName').value.trim(),
            edad: document.getElementById('editStudentAge').value ? parseInt(document.getElementById('editStudentAge').value) : null,
            telefono: document.getElementById('editStudentPhone').value || null,
            email: document.getElementById('editStudentEmail').value || null,
            fecha_inscripcion: document.getElementById('editStudentEnrollmentDate').value || null,
            clase: document.getElementById('editStudentInstrument').value || null,
            tipo_clase: 'Individual',
            maestro_id: document.getElementById('editStudentTeacher').value || null,
            horario: document.getElementById('editStudentSchedule').value || null,
            estatus: document.getElementById('editStudentStatus').value || 'Activo',
            promocion: document.getElementById('editStudentPromotion').value || null,
            precio_mensual: document.getElementById('editStudentMonthlyFee').value ? 
                parseFloat(document.getElementById('editStudentMonthlyFee').value) : null,
            forma_pago: document.getElementById('editStudentPaymentMethod').value || null,
            domiciliado: document.getElementById('editStudentDomiciled').value === 'Si',
            nombre_domiciliado: document.getElementById('editStudentDomiciliedName').value || null
        };
        
        console.log('📤 Datos a actualizar:', studentData);
        
        // CORRECCIÓN: Manejo correcto de la respuesta asíncrona
        const response = await fetch('/gastos/api/alumnos/' + studentData.id, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(studentData)
        });

        // CORRECCIÓN: Manejo correcto de errores HTTP
        if (!response.ok) {
            let errorMessage = `Error ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                errorMessage = 'Error de comunicación con el servidor';
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        
        if (result.success) {
            showAlert('success', `Información de ${studentData.nombre} actualizada exitosamente`);
        } else {
            throw new Error(result.message || 'Error actualizando alumno');
        }

        // CORRECCIÓN: Cerrar modal correctamente
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editStudentModal'));
        if (editModal) {
            editModal.hide();
        }
        
        // CORRECCIÓN: Recargar lista
        await loadStudentsList(currentStudentsPage);
        
        console.log('✅ Alumno actualizado correctamente');
        
    } catch (error) {
        console.error('❌ Error guardando cambios:', error);
        showAlert('danger', 'Error guardando los cambios: ' + error.message);
    }
}

/**
 * CORRECCIÓN CRÍTICA: Función filterStudents() con estado vacío mejorado
 * PROBLEMA ORIGINAL: No manejaba correctamente cuando no había coincidencias
 */
function filterStudents() {
    console.log('🔍 Aplicando filtros de alumnos...');
    
    // Obtener valores actuales de filtros
    const teacherFilter = document.getElementById('teacherFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const instrumentFilter = document.getElementById('instrumentFilter')?.value || '';
    const paymentFilter = document.getElementById('paymentFilter')?.value || '';
    
    // Actualizar filtros globales
    currentStudentFilters = {
        teacherFilter,
        statusFilter,
        instrumentFilter,
        paymentFilter
    };
    
    console.log('🔍 Filtros aplicados:', currentStudentFilters);
    
    // CORRECCIÓN: Resetear a página 1 cuando se aplican filtros
    currentStudentsPage = 1;
    
    // Recargar lista con filtros aplicados
    loadStudentsList(1);
    
    // CORRECCIÓN: Actualizar resumen de filtros
    updateStudentsFilterSummary();
}

// ============================================================
// 🎨 FUNCIONES DE RENDERIZADO Y UI
// ============================================================

/**
 * Renderizar tabla de alumnos
 */
function renderStudentsTable() {
    const tableBody = document.getElementById('studentsTableBody');
    if (!tableBody) return;
    
    if (!studentsData || studentsData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-3">No hay alumnos</td></tr>';
        return;
    }
    
    tableBody.innerHTML = studentsData.map(student => `
        <tr>
            <td>
                <strong>${student.nombre}</strong>
                ${student.telefono ? `<br><small class="text-muted">${student.telefono}</small>` : ''}
            </td>
            <td>${student.clase || 'Sin clase'}</td>
            <td>${student.maestro || 'Sin asignar'}</td>
            <td>
                <span class="badge ${student.estatus === 'Activo' ? 'bg-success' : 'bg-danger'}">
                    ${student.estatus === 'Activo' ? '✅ Activo' : '❌ Baja'}
                </span>
            </td>
            <td>${getNextPaymentDate(student)}</td>
            <td>
                <button class="btn btn-sm btn-outline-info me-1" onclick="viewStudentDetail(${student.id})" title="Ver detalle">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editStudent(${student.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

const data = result.data || [];

// AGREGAR DESPUÉS DE renderizar tabla
updateStudentsPagination();
// Poblar filtros después de cargar datos
populateFiltersFromData(result.data);



/**
 * Renderizar paginación de alumnos
 */
function renderStudentsPagination() {
    const paginationContainer = document.getElementById('studentsPaginationList');
    const paginationWrapper = document.getElementById('studentsPaginationContainer');
    
    if (!paginationContainer || !paginationWrapper) {
        console.warn('⚠️ Contenedores de paginación no encontrados');
        return;
    }

    if (totalStudentsPages <= 1) {
        paginationWrapper.style.display = 'none';
        return;
    }
    
    paginationWrapper.style.display = 'block';
    
    let paginationHTML = '';
    
    // Botón anterior
    if (currentStudentsPage > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="event.preventDefault(); loadStudentsList(${currentStudentsPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;
    }
    
    // Números de página
    const startPage = Math.max(1, currentStudentsPage - 2);
    const endPage = Math.min(totalStudentsPages, currentStudentsPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentStudentsPage ? 'active' : '';
        paginationHTML += `
            <li class="page-item ${isActive}">
                <a class="page-link" href="#" onclick="event.preventDefault(); loadStudentsList(${i})">${i}</a>
            </li>
        `;
    }
    
    // Botón siguiente
    if (currentStudentsPage < totalStudentsPages) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="event.preventDefault(); loadStudentsList(${currentStudentsPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;
    }
    
    paginationContainer.innerHTML = paginationHTML;
    
    // Actualizar información de paginación
    const showingFrom = document.getElementById('studentsShowingFrom');
    const showingTo = document.getElementById('studentsShowingTo');
    const totalRecords = document.getElementById('studentsTotalRecords');
    
    if (showingFrom && showingTo && totalRecords) {
        const startRecord = totalStudentsRecords > 0 ? ((currentStudentsPage - 1) * studentsPerPage) + 1 : 0;
        const endRecord = Math.min(currentStudentsPage * studentsPerPage, totalStudentsRecords);
        
        showingFrom.textContent = startRecord;
        showingTo.textContent = endRecord;
        totalRecords.textContent = totalStudentsRecords;
    }
}

/**
 * Mostrar/ocultar estado de carga
 */
function showStudentsLoadingState(show) {
    console.log(`📊 ${show ? 'Mostrar' : 'Ocultar'} loading de alumnos`);
    
    // Verificar que al menos un elemento clave exista
    const loadingState = document.getElementById('studentsLoadingState');
    const tableContainer = document.getElementById('studentsTableContainer');
    const emptyState = document.getElementById('studentsEmptyState');
    const paginationNav = document.getElementById('studentsPaginationContainer');
    
    // Si no existe ningún elemento del widget, salir silenciosamente
    if (!loadingState && !tableContainer && !emptyState) {
        console.warn('⚠️ Widget de alumnos no disponible en esta página');
        return;
    }
    
    if (loadingState) {
        loadingState.style.display = show ? 'block' : 'none';
    }
    if (tableContainer) {
        tableContainer.style.display = show ? 'none' : 'block';
    }
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    if (paginationNav) {
        paginationNav.style.display = show ? 'none' : 'block';
    }
}

/**
 * CORRECCIÓN: Mostrar estado vacío con mensaje específico
 */
function showStudentsEmptyState(message = 'No se encontraron alumnos') {
    console.log('📭 Mostrando estado vacío:', message);
    
    // CORRECCIÓN: Verificar que los elementos existan antes de usarlos
    const emptyState = document.getElementById('studentsEmptyState');
    const tableContainer = document.getElementById('studentsTableContainer');
    const loadingState = document.getElementById('studentsLoadingState');
    const paginationNav = document.getElementById('studentsPaginationContainer') || document.getElementById('studentsPaginationContainer')
    
    if (emptyState) {
        emptyState.style.display = 'block';
    }
    if (tableContainer) {
        tableContainer.style.display = 'none';
    }
    if (loadingState) {
        loadingState.style.display = 'none';
    }
    if (paginationNav) {
        paginationNav.style.display = 'none';
    }

    // CORRECCIÓN: Mostrar mensaje específico para filtro vencidos
    const emptyMessage = emptyState ? emptyState.querySelector('p') : null;
    if (emptyMessage && currentStudentFilters.paymentFilter === 'overdue') {
        emptyMessage.textContent = '✅ No hay alumnos con pagos vencidos (+5 días)';
        emptyMessage.className = 'mt-2 mb-0 text-success';
    } else if (emptyMessage) {
        emptyMessage.textContent = message;
        emptyMessage.className = 'mt-2 mb-0 text-muted';
    }
}

/**
 * Actualizar resumen de filtros aplicados
 */
function updateStudentsFilterSummary() {
    const activeFilters = Object.entries(currentStudentFilters)
        .filter(([key, value]) => value !== '')
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    
    let summary = 'Mostrando todos los alumnos';
    if (activeFilters) {
        const filterDescriptions = Object.entries(currentStudentFilters)
            .filter(([key, value]) => value !== '')
            .map(([key, value]) => {
                switch(key) {
                    case 'teacherFilter': return `Maestro: ${getTeacherName(value)}`;
                    case 'statusFilter': return `Estatus: ${value}`;
                    case 'instrumentFilter': return `Instrumento: ${value}`;
                    case 'paymentFilter': 
                        const paymentLabels = {
                            'current': 'Al Corriente',
                            'upcoming': 'Próximos a Vencer',
                            'overdue': 'Vencidos',
                            'inactive': 'Inactivos'
                        };
                        return `Pagos: ${paymentLabels[value] || value}`;
                    default: return `${key}: ${value}`;
                }
            })
            .join(' | ');
        summary = `Filtros: ${filterDescriptions}`;
    }
    const filterSummaryElement = document.getElementById('filterSummary');
    if (filterSummaryElement) {
        filterSummaryElement.textContent = summary;
    }
}

// ============================================================
// 🔧 FUNCIONES DE SOPORTE Y UTILIDADES
// ============================================================

/**
 * Obtener nombre del maestro por ID
 */
function getTeacherName(teacherId) {
    const teachers = {
        '1': 'Hugo Vazquez',
        '2': 'Julio Olvera', 
        '3': 'Demian Andrade',
        '4': 'Irwin Hernandez',
        '5': 'Nahomy Perez',
        '6': 'Luis Blanquet',
        '7': 'Manuel Reyes',
        '8': 'Harim Lopez'
    };
    return teachers[teacherId] || 'Sin asignar';
}

function updateStudentsPagination() {
    const container = document.getElementById('studentsPagination');
    if (!container) return;
    
    // Calcular valores correctos
    const totalPages = Math.max(1, Math.ceil(totalStudentsRecords / studentsPerPage));
    const currentPageNum = currentStudentsPage;
    
    // Calcular registros mostrados
    const startRecord = totalStudentsRecords > 0 ? ((currentPageNum - 1) * studentsPerPage) + 1 : 0;
    const endRecord = Math.min(currentPageNum * studentsPerPage, totalStudentsRecords);
    
    // Actualizar contadores en la interfaz
    const filteredCountElement = document.getElementById('filteredCount');
    const totalCountElement = document.getElementById('totalCount');
    const filterSummaryElement = document.getElementById('filterSummary');
    
    if (filteredCountElement) {
        filteredCountElement.textContent = totalStudentsRecords;
    }
    if (totalCountElement) {
        totalCountElement.textContent = totalStudentsRecords;
    }
    if (filterSummaryElement) {
        const activeFilters = Object.values(currentStudentFilters).filter(f => f !== '').length;
        if (activeFilters > 0) {
            filterSummaryElement.textContent = `Filtros aplicados (${activeFilters} activos)`;
        } else {
            filterSummaryElement.textContent = 'Mostrando todos los alumnos';
        }
    }
    
    // Actualizar información de paginación
    const paginationInfo = container.querySelector('.pagination-info') || container;
    if (paginationInfo) {
        paginationInfo.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted">
                    Mostrando ${startRecord}-${endRecord} de ${totalStudentsRecords} alumnos
                </span>
                <nav>
                    <ul class="pagination pagination-sm mb-0">
                        <li class="page-item ${currentPageNum === 1 ? 'disabled' : ''}">
                            <a class="page-link" href="#" onclick="loadStudentsList(${currentPageNum - 1}); return false;">
                                <i class="fas fa-chevron-left"></i>
                            </a>
                        </li>
                        <li class="page-item active">
                            <span class="page-link">${currentPageNum}</span>
                        </li>
                        <li class="page-item ${currentPageNum === totalPages ? 'disabled' : ''}">
                            <a class="page-link" href="#" onclick="loadStudentsList(${currentPageNum + 1}); return false;">
                                <i class="fas fa-chevron-right"></i>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        `;
    }
    
    console.log(`✅ Paginación actualizada: Página ${currentPageNum} de ${totalPages} (${totalStudentsRecords} total)`);
}

/**
 * Calcular información de pagos del alumno
 */
function calculateStudentPaymentInfo(student) {
    if (student.estatus === 'Baja') {
        return {
            nextPaymentDate: 'N/A',
            alertBadge: '<span class="badge bg-secondary">Inactivo</span>'
        };
    }
    
    // Calcular próxima fecha de pago basada en fecha de inscripción
    const nextPaymentDate = getNextPaymentDate(student);
    const today = new Date();
    
    if (!nextPaymentDate) {
        return {
            nextPaymentDate: 'Sin definir',
            alertBadge: '<span class="badge bg-warning">Sin fecha</span>'
        };
    }
    
    const daysDiff = daysBetweenDates(today, nextPaymentDate);
    
    let alertBadge = '';
    if (daysDiff < -5) {
        // Más de 5 días vencido
        alertBadge = `<span class="badge bg-danger">🚨 Vencido ${Math.abs(daysDiff)} días</span>`;
    } else if (daysDiff < 0) {
        // Vencido pero menos de 5 días
        alertBadge = `<span class="badge bg-warning">⚠️ Vencido ${Math.abs(daysDiff)} días</span>`;
    } else if (daysDiff <= 3) {
        // Próximo a vencer
        alertBadge = `<span class="badge bg-warning">⏰ Vence en ${daysDiff} días</span>`;
    } else {
        // Al corriente
        alertBadge = '<span class="badge bg-success">✅ Al corriente</span>';
    }
    
    return {
        nextPaymentDate: formatDate(nextPaymentDate),
        alertBadge
    };
}

/**
 * Calcular próxima fecha de pago
 */
function getNextPaymentDate(student) {
    if (!student.fecha_inscripcion) return null;
    
    const enrollmentDate = new Date(student.fecha_inscripcion);
    const today = new Date();
    
    // Calcular cuántos meses han pasado desde la inscripción
    const monthsDiff = (today.getFullYear() - enrollmentDate.getFullYear()) * 12 + 
                      (today.getMonth() - enrollmentDate.getMonth());
    
    // La próxima fecha de pago es el día de inscripción del siguiente mes
    const nextPaymentDate = new Date(enrollmentDate);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + monthsDiff + 1);
    
    // Si ya pasó este mes, agregar otro mes
    if (nextPaymentDate <= today) {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    }
    
    return nextPaymentDate;
}

// ============================================================
// 🎛️ FUNCIONES DE MODALES Y FORMULARIOS
// ============================================================

/**
 * Mostrar modal de nuevo alumno
 */
function showAddStudentModal() {
    console.log('➕ Mostrando modal de nuevo alumno...');
    
    try {
        // Verificar que el modal existe
        let modalElement = document.getElementById('addStudentModal');
        if (!modalElement) {
            console.error('❌ Modal addStudentModal no encontrado en DOM');
            showAlert('error', 'Modal no disponible');
            return;
        }
        
        // Si el modal está vacío, crear contenido dinámicamente
        if (!modalElement.querySelector('.modal-dialog')) {
            modalElement.innerHTML = createAddStudentModalHTML();
        }
        
        // Limpiar formulario
        const form = modalElement.querySelector('#addStudentForm');
        if (form) form.reset();
        
        // Establecer valores por defecto
        const today = new Date().toISOString().split('T')[0];
        const enrollmentField = modalElement.querySelector('#newStudentEnrollmentDate');
        if (enrollmentField) enrollmentField.value = today;
        
        const feeField = modalElement.querySelector('#newStudentMonthlyFee');
        if (feeField) feeField.value = '1200';
        
        // Mostrar modal usando Bootstrap
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
    } catch (error) {
        console.error('❌ Error mostrando modal de nuevo alumno:', error);
        showAlert('error', 'Error al abrir modal');
    }
}

/**
 * Toggle para campo domiciliado en nuevo alumno
 */
function toggleNewStudentDomiciliadoName() {
    const domicilied = document.getElementById('newStudentDomiciled').value;
    const nameField = document.getElementById('newStudentDomiciliedName');
    
    if (domicilied === 'Si') {
        nameField.disabled = false;
        nameField.required = true;
        nameField.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    } else {
        nameField.disabled = true;
        nameField.required = false;
        nameField.value = '';
        nameField.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    }
}

/**
 * Editar alumno - cargar datos en modal
 */
async function editStudent(id) {
    console.log('✏️ Editando alumno:', id);
    // VERIFICAR que el modal exista
    const modalElement = document.getElementById('editStudentModal');
    if (!modalElement) {
        console.error('❌ Modal editStudentModal no encontrado');
        return;
    }
    try {
        // Obtener datos del alumno desde la tabla actual
        const student = studentsData.find(s => s.id === id);
        if (!student) {
            showAlert('warning', 'Alumno no encontrado en los datos actuales');
            return;
        }
        
        // Prellenar formulario de edición (IDs del HTML original)
        document.getElementById('editStudentId').value = student.id;
        document.getElementById('editStudentName').value = student.nombre || '';
        document.getElementById('editStudentAge').value = student.edad || '';
        document.getElementById('editStudentPhone').value = student.telefono || '';
        document.getElementById('editStudentEmail').value = student.email || '';
        document.getElementById('editStudentEnrollmentDate').value = student.fecha_inscripcion || '';
        document.getElementById('editStudentInstrument').value = student.clase || '';
        document.getElementById('editStudentTeacher').value = student.maestro_id || '';
        document.getElementById('editStudentSchedule').value = student.horario || '';
        document.getElementById('editStudentStatus').value = student.estatus || 'Activo';
        document.getElementById('editStudentPromotion').value = student.promocion || '';
        document.getElementById('editStudentMonthlyFee').value = student.precio_mensual || '';
        document.getElementById('editStudentPaymentMethod').value = student.forma_pago || '';
        document.getElementById('editStudentDomiciled').value = student.domiciliado ? 'Si' : 'No';
        document.getElementById('editStudentDomiciliedName').value = student.titular_domicilado || '';
        
        // Configurar campo domiciliado
        toggleDomiciliadoName();
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('editStudentModal'));
        modal.show();
        
    } catch (error) {
        console.error('❌ Error editando alumno:', error);
        showAlert('error', 'Error al abrir modal de edición');
    }
}

// AGREGAR DESPUÉS DE editStudent:
function viewStudentDetail(studentId) {
    console.log('👁️ Mostrando detalle del alumno:', studentId);
    
    try {
        const student = studentsData.find(s => s.id == studentId);
        if (!student) {
            showAlert('error', 'Alumno no encontrado');
            return;
        }
        
        // Obtener modal existente
        let modalElement = document.getElementById('studentDetailModal');
        if (!modalElement) {
            console.error('❌ Modal studentDetailModal no encontrado');
            return;
        }
        
        // Crear contenido dinámico del modal
        modalElement.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content" style="background: rgba(25, 28, 36, 0.95); border: 1px solid rgba(255, 255, 255, 0.1);">
                    <div class="modal-header">
                        <h5 class="modal-title text-white">
                            <i class="fas fa-user me-2"></i>Información del Alumno
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="text-white"><i class="fas fa-user me-2"></i>Información Personal</h6>
                                <table class="table table-dark table-sm">
                                    <tr><td><strong>Nombre:</strong></td><td>${student.nombre}</td></tr>
                                    <tr><td><strong>Edad:</strong></td><td>${student.edad || 'No especificada'}</td></tr>
                                    <tr><td><strong>Teléfono:</strong></td><td>${student.telefono || 'No registrado'}</td></tr>
                                    <tr><td><strong>Email:</strong></td><td>${student.email || 'No registrado'}</td></tr>
                                    <tr><td><strong>Estatus:</strong></td><td>
                                        <span class="badge ${student.estatus === 'Activo' ? 'bg-success' : 'bg-danger'}">
                                            ${student.estatus}
                                        </span>
                                    </td></tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6 class="text-white"><i class="fas fa-music me-2"></i>Información Académica</h6>
                                <table class="table table-dark table-sm">
                                    <tr><td><strong>Instrumento:</strong></td><td>${student.clase || 'No especificado'}</td></tr>
                                    <tr><td><strong>Maestro:</strong></td><td>${getTeacherName(student.maestro_id) || 'Sin asignar'}</td></tr>
                                    <tr><td><strong>Horario:</strong></td><td>${student.horario || 'Sin definir'}</td></tr>
                                    <tr><td><strong>Fecha de Inscripción:</strong></td><td>${student.fecha_inscripcion ? formatDate(student.fecha_inscripcion) : 'No registrada'}</td></tr>
                                </table>
                            </div>
                        </div>
                        <hr>
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="text-white"><i class="fas fa-dollar-sign me-2"></i>Información de Pagos</h6>
                                <table class="table table-dark table-sm">
                                    <tr><td><strong>Mensualidad:</strong></td><td>${student.precio_mensual ? formatCurrency(student.precio_mensual) : 'No definida'}</td></tr>
                                    <tr><td><strong>Forma de Pago:</strong></td><td>${student.forma_pago || 'No especificada'}</td></tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6 class="text-white"><i class="fas fa-chart-line me-2"></i>Historial de Pagos</h6>
                                <div id="chartLoadingState" class="text-center py-3" style="display: none;">
                                    <i class="fas fa-spinner fa-spin"></i> Cargando historial...
                                </div>
                                <div class="text-muted">
                                    <small>Historial de pagos disponible próximamente</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="editStudent(${student.id}); bootstrap.Modal.getInstance(document.getElementById('studentDetailModal')).hide();">
                            <i class="fas fa-edit me-1"></i>Editar
                        </button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i>Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Mostrar modal
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
    } catch (error) {
        console.error('❌ Error mostrando detalle:', error);
        showAlert('error', 'Error al mostrar detalle del alumno');
    }
}

/**
 * Toggle para campo domiciliado en edición
 */
function toggleDomiciliadoName() {
    const domicilied = document.getElementById('editStudentDomiciled').value;
    const nameField = document.getElementById('editStudentDomiciliedName');
    
    if (domicilied === 'Si') {
        nameField.disabled = false;
        nameField.required = true;
        nameField.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    } else {
        nameField.disabled = true;
        nameField.required = false;
        nameField.value = '';
        nameField.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    }
}

// ============================================================
// 🔄 FUNCIONES DE ACCIONES ADICIONALES
// ============================================================

/**
 * Actualizar lista de alumnos
 */
function refreshStudentsList() {
    console.log('🔄 Actualizando lista de alumnos...');
    loadStudentsList(currentStudentsPage);
}

/**
 * Exportar lista de alumnos
 */
function exportStudentsList() {
    console.log('📥 Exportando lista de alumnos...');
    showAlert('info', 'Función de exportación en desarrollo');
}

/**
 * Eliminar alumno (solo administradores)
 */
async function deleteStudent() {
    try {
        const studentId = document.getElementById('editStudentId').value;
        const studentName = document.getElementById('editStudentName').value;
        
        if (!studentId) {
            showAlert('warning', 'No hay alumno seleccionado para eliminar');
            return;
        }
        
        // Confirmación doble para eliminación
        const confirmMessage = `¿ELIMINAR PERMANENTEMENTE al alumno "${studentName}"?\n\n` +
                            `⚠️ ESTA ACCIÓN NO SE PUEDE DESHACER ⚠️\n\n` +
                            `Escriba "ELIMINAR" para confirmar:`;
        
        const userConfirmation = prompt(confirmMessage);
        
        if (userConfirmation !== 'ELIMINAR') {
            console.log('🚫 Eliminación cancelada por el usuario');
            showAlert('info', 'Eliminación cancelada');
            return;
        }
        
        console.log(`🗑️ Eliminando alumno: ${studentName} (ID: ${studentId})`);
        
        const response = await fetch(`/gastos/api/alumnos/${studentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editStudentModal'));
            editModal.hide();
            
            showAlert('success', `Alumno "${studentName}" eliminado exitosamente`);
            await loadStudentsList(currentStudentsPage);
            
            console.log(`✅ Alumno eliminado: ${studentName}`);
        } else if (response.status === 403) {
            showAlert('warning', 'Solo administradores pueden eliminar alumnos');
        } else if (response.status === 404) {
            showAlert('warning', 'Alumno no encontrado');
        } else {
            throw new Error(result.message || 'Error eliminando alumno');
        }
        
    } catch (error) {
        console.error('❌ Error eliminando alumno:', error);
        showAlert('danger', `Error eliminando alumno: ${error.message}`);
    }
}

// ============================================================
// 🚀 INICIALIZACIÓN DEL MÓDULO
// ============================================================

/**
 * Inicializar módulo de gestión de alumnos
 */
async function initializeStudentsModule() {
    try {
        console.log('🎓 Inicializando módulo de gestión de alumnos...');
        
        // Cargar maestros para los selects
        await initializeStudentFilters();
        
        console.log('✅ Módulo de alumnos inicializado');
        
    } catch (error) {
        console.error('❌ Error inicializando módulo de alumnos:', error);
    }
}

// ============================================================
// 🔗 FUNCIONES FALTANTES LLAMADAS DESDE HTML
// ============================================================

/**
 * Actualizar lista de alumnos (botón Actualizar)
 */
function refreshStudentsList() {
    console.log('🔄 Actualizando lista de alumnos...');
    loadStudentsList(1);
}

/**
 * Exportar lista de alumnos
 */
function exportStudentsList() {
    console.log('📤 Exportando lista de alumnos...');
    showAlert('info', 'Función de exportación en desarrollo');
}

/**
 * Filtrar estudiantes (llamada desde selects)
 */
function filterStudents() {
    console.log('🔍 Aplicando filtros de alumnos...');
    
    // Obtener valores de filtros
    const teacherFilter = document.getElementById('teacherFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const instrumentFilter = document.getElementById('instrumentFilter')?.value || '';
    const paymentFilter = document.getElementById('paymentFilter')?.value || '';
    
    // Actualizar filtros globales
    currentStudentFilters = {
        teacherFilter,
        statusFilter,
        instrumentFilter,
        paymentFilter
    };
    
    // Recargar lista con filtros
    loadStudentsList(1);
}

/**
 * Filtrar alumnos por estatus (HOMOLOGADA CON ORIGINAL)
 */
function filterStudentsByStatus(status) {
    console.log(`📊 Filtro de estudiantes: ${status}`);
    
    // Verificar si el widget está disponible
    if (!verifyStudentsElements()) {
        console.warn('⚠️ Widget de alumnos no disponible - saltando filtro');
        return;
    }
    
    // Usar datos de distribución almacenados (priorizar classDistributionData)
    const distributionData = window.classDistributionData?.length > 0 ? window.classDistributionData : window.storedClassDistribution;
    
    if (!distributionData || distributionData.length === 0) {
        console.warn('⚠️ No hay datos de distribución disponibles');
        showAlert('warning', 'No hay datos de clases para mostrar');
        return;
    }
    
    let filteredClasses = [];
    let totalStudents = 0;
    
    switch(status) {
        case 'active':
            filteredClasses = distributionData.map(clase => ({
                ...clase,
                total_alumnos: clase.activos,
                percentage: clase.total_alumnos > 0 ? 
                    Math.round((clase.activos / clase.total_alumnos) * 100) : 0
            }));
            totalStudents = distributionData.reduce((sum, clase) => sum + (clase.activos || 0), 0);
            break;
        case 'inactive':
            filteredClasses = distributionData.map(clase => ({
                ...clase,
                total_alumnos: clase.inactivos || clase.bajas || 0,
                percentage: clase.total_alumnos > 0 ? 
                    Math.round(((clase.inactivos || clase.bajas || 0) / clase.total_alumnos) * 100) : 0
            }));
            totalStudents = distributionData.reduce((sum, clase) => sum + (clase.inactivos || clase.bajas || 0), 0);
            break;
        default: // 'all'
            filteredClasses = distributionData.map(clase => ({
                ...clase,
                percentage: clase.total_alumnos > 0 ? 
                    Math.round((clase.activos / clase.total_alumnos) * 100) : 0
            }));
            totalStudents = distributionData.reduce((sum, clase) => sum + (clase.total_alumnos || 0), 0);
            break;
    }
    
    // Actualizar indicadores visuales
    updateStatusIndicators(status);
    
    // Actualizar distribución de clases con datos filtrados
    updateClassDistributionOriginal(filteredClasses);
    
    // Limpiar filtros previos y aplicar filtro de estatus
    currentStudentFilters = {
        teacherFilter: '',
        statusFilter: status === 'active' ? 'Activo' : status === 'inactive' ? 'Baja' : '',
        instrumentFilter: '',
        paymentFilter: ''
    };
    
    // Actualizar selects en UI
    const statusSelect = document.getElementById('statusFilter');
    if (statusSelect) {
        statusSelect.value = currentStudentFilters.statusFilter;
    }
    
    // Cargar lista de alumnos filtrada
    loadStudentsList(1);
    
    // Mostrar mensaje informativo mejorado
    const statusLabels = {
        'active': 'Alumnos Activos',
        'inactive': 'Alumnos con Baja', 
        'all': 'Todos los Alumnos'
    };

    const statusLabel = statusLabels[status] || 'Alumnos';
    showAlert('success', `📊 Mostrando: ${statusLabel} (${totalStudents} estudiantes en ${filteredClasses.length} clases)`);
    
    console.log(`✅ Filtro aplicado: ${status} - ${totalStudents} estudiantes en ${filteredClasses.length} clases`);
}

/**
 * Actualizar indicadores visuales del widget (FUNCIÓN FALTANTE DEL ORIGINAL)
 */
function updateStatusIndicators(selectedStatus) {
    // Remover clases activas previas
    document.querySelectorAll('.student-stat').forEach(stat => {
        stat.classList.remove('active-filter');
        stat.style.background = '';
        stat.style.borderRadius = '';
        stat.style.transform = '';
    });
    
    // Remover estilo del badge también
    const totalBadge = document.getElementById('totalStudents');
    if (totalBadge) {
        totalBadge.style.background = '';
        totalBadge.style.transform = '';
    }
    
    // Aplicar estilo al indicador seleccionado
    const statusMap = {
        'active': 'activeStudents',
        'inactive': 'inactiveStudents',
        'all': 'totalStudents'
    };
    
    if (statusMap[selectedStatus]) {
        const targetElement = document.getElementById(statusMap[selectedStatus]);
        if (targetElement) {
            const parentStat = targetElement.closest('.student-stat') || targetElement.closest('.badge');
            if (parentStat) {
                parentStat.style.background = 'rgba(13, 110, 253, 0.2)';
                parentStat.style.borderRadius = '8px';
                parentStat.style.transform = 'scale(1.05)';
                parentStat.classList.add('active-filter');
            }
        }
    }
    
    console.log(`✅ Indicadores actualizados para: ${selectedStatus}`);
}

/**
 * Actualizar distribución de clases (HOMOLOGADA CON ORIGINAL)
 */
function updateClassDistributionOriginal(classes) {
    const container = document.getElementById('classDistribution'); // ID CORRECTO del original
    
    if (!container) {
        console.warn('⚠️ Contenedor classDistribution no encontrado');
        return;
    }
    
    if (!classes || classes.length === 0) {
        // INTENTAR usar datos almacenados antes de mostrar mensaje vacío
        const fallbackData = window.classDistributionData || window.storedClassDistribution || classDistributionData;
        
        if (fallbackData && fallbackData.length > 0) {
            classes = fallbackData;
            console.log('✅ Usando datos almacenados para distribución inicial');
        } else {
            // Solo mostrar mensaje vacío si realmente no hay datos
            container.innerHTML = `
                <div class="text-center text-muted py-3">
                    <i class="fas fa-music fa-2x mb-2"></i>
                    <p class="mb-0">Cargando distribución de clases...</p>
                </div>
            `;
            return;
        }
    }
    
    const totalStudents = classes.reduce((sum, clase) => sum + (clase.total_alumnos || 0), 0);
    
    const clasesHTML = classes.map(clase => {
        const count = clase.total_alumnos || 0;
        const percentage = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
        
        if (count === 0) return ''; // No mostrar clases sin alumnos
        
        return `
            <div class="class-item d-flex justify-content-between align-items-center p-2 mb-2" 
                 style="background: rgba(255,255,255,0.05); border-radius: 6px;">
                <div>
                    <i class="${getClassIcon(clase.clase)} me-2 text-primary"></i>
                    <strong class="text-white">${clase.clase}</strong>
                </div>
                <div class="text-end">
                    <span class="badge bg-primary">${count}</span>
                    <br><small class="text-muted">${percentage}%</small>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = clasesHTML || '<div class="text-center text-muted">Sin datos para mostrar</div>';
    
    console.log('✅ Distribución de clases actualizada (homologada)');
}

/**
 * Renderizar tabla de alumnos (función faltante)
 */
function renderTransactionsTable(transactions) {
    console.log('📊 Renderizando tabla de transacciones:', transactions.length);
    
    const tableBody = document.getElementById('transactionsBody');
    if (!tableBody) {
        console.error('❌ Elemento transactionsBody no encontrado');
        return;
    }
    
    if (!transactions || transactions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No hay transacciones</td></tr>';
        return;
    }
    
    tableBody.innerHTML = transactions.map(transaction => `
        <tr>
            <td>${formatDate(transaction.fecha)}</td>
            <td>${transaction.concepto}</td>
            <td>${transaction.socio}</td>
            <td>${transaction.nombre_empresa || 'N/A'}</td>
            <td><span class="badge ${transaction.tipo === 'I' ? 'bg-success' : 'bg-danger'}">
                ${transaction.tipo === 'I' ? 'Ingreso' : 'Gasto'}
            </span></td>
            <td class="${transaction.tipo === 'I' ? 'text-success' : 'text-danger'}">
                ${formatCurrency(transaction.total)}
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editTransaction(${transaction.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Cargar historial de pagos (función del original)
 */
async function loadPaymentHistory(studentId, studentName) {
    try {
        console.log(`📊 Cargando historial de pagos para alumno ${studentId}`);
        
        document.getElementById('chartLoadingState').style.display = 'block';
        
        // Obtener datos reales del backend
        const response = await fetch(`/gastos/api/alumnos/${encodeURIComponent(studentName)}/historial-pagos?meses=12`);
        const data = await response.json();
        
        document.getElementById('chartLoadingState').style.display = 'none';
        
        if (data.success && data.data) {
            // Crear gráfico con Chart.js (si está disponible)
            if (typeof Chart !== 'undefined') {
                // Implementar gráfico real
                console.log('📈 Datos de historial:', data.data);
            }
        }
        
    } catch (error) {
        console.error('❌ Error cargando historial:', error);
        document.getElementById('chartLoadingState').style.display = 'none';
    }
}

// ============================================================
// 🔗 EXPOSICIÓN DE FUNCIONES GLOBALES
// ============================================================

// Hacer funciones disponibles globalmente
window.loadStudentsList = loadStudentsList;
window.saveNewStudent = saveNewStudent;
window.saveStudentChanges = saveStudentChanges;
window.filterStudents = filterStudents;
window.showAddStudentModal = showAddStudentModal;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.refreshStudentsList = refreshStudentsList;
window.exportStudentsList = exportStudentsList;
window.toggleNewStudentDomiciliadoName = toggleNewStudentDomiciliadoName;
window.toggleDomiciliadoName = toggleDomiciliadoName;
window.initializeStudentsModule = initializeStudentsModule;
window.refreshStudentsList = refreshStudentsList;
window.exportStudentsList = exportStudentsList;
window.showAddStudentModal = showAddStudentModal;
window.filterStudents = filterStudents;
window.filterStudentsByStatus = filterStudentsByStatus;
window.renderTransactionsTable = renderTransactionsTable;

// Funciones específicas del widget de alumnos (HOMOLOGADAS CON ORIGINAL)
window.updateStatusIndicators = updateStatusIndicators;
window.updateClassDistributionOriginal = updateClassDistributionOriginal;
window.setClassDistributionDataOriginal = function(data) {
    window.classDistributionData = data || [];
    classDistributionData = window.classDistributionData;
    console.log('💾 classDistributionData sincronizada:', classDistributionData.length, 'clases');
};

window.viewStudentDetail = viewStudentDetail;
window.loadPaymentHistory = loadPaymentHistory;

console.log('✅ Dashboard Students Module cargado - Todas las funciones disponibles');