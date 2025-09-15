/* ====================================================
   DASHBOARD STUDENTS MODULE - SYMBIOT FINANCIAL MANAGER
   Archivo: public/js/dashboard-students.js
   Widget completo de gestión de alumnos con correcciones críticas
   ==================================================== */

// ============================================================
// 🎓 FUNCIONES PRINCIPALES DE GESTIÓN DE ALUMNOS
// ============================================================

/**
 * Función principal para cargar lista de alumnos con paginación
 * CORRECCIÓN: Manejo mejorado de estado vacío y filtros
 */
async function loadStudentsList(page = 1) {
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
            console.log(`🔍 Aplicando filtro de pago: ${currentStudentFilters.paymentFilter}`);
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
                
                // Actualizar contadores
                document.getElementById('filteredCount').textContent = totalStudentsRecords;
                document.getElementById('totalCount').textContent = totalStudentsRecords;
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
    
    if (!studentsData || studentsData.length === 0) {
        tableBody.innerHTML = '';
        return;
    }
    
    tableBody.innerHTML = studentsData.map(student => {
        const age = student.edad || 'N/A';
        const teacherName = getTeacherName(student.maestro_id) || 'Sin asignar';
        const classIcon = getClassIcon(student.clase);
        const classColor = getClassColor(student.clase);
        const enrollmentDate = student.fecha_inscripcion ? formatDate(student.fecha_inscripcion) : 'Sin fecha';
        const monthlyFee = student.precio_mensual ? formatCurrency(student.precio_mensual) : 'Sin definir';
        
        // Calcular próximo pago y estado
        const paymentInfo = calculateStudentPaymentInfo(student);
        
        // Estado del alumno
        const statusBadge = student.estatus === 'Activo' 
            ? '<span class="badge bg-success">✅ Activo</span>'
            : '<span class="badge bg-danger">❌ Baja</span>';
            
        return `
            <tr>
                <td>
                    <strong>${student.nombre}</strong>
                    ${student.telefono ? `<br><small class="text-muted">${student.telefono}</small>` : ''}
                </td>
                <td>${age}</td>
                <td>
                    <small>${teacherName}</small>
                </td>
                <td>
                    <span class="badge bg-${classColor}">
                        <i class="${classIcon} me-1"></i>${student.clase || 'Sin clase'}
                    </span>
                </td>
                <td>
                    <small>${enrollmentDate}</small>
                </td>
                <td>
                    <strong>${monthlyFee}</strong>
                </td>
                <td>
                    <small>${paymentInfo.nextPaymentDate}</small>
                </td>
                <td>
                    ${paymentInfo.alertBadge}
                </td>
                <td>
                    ${statusBadge}
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editStudent(${student.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Renderizar paginación de alumnos
 */
function renderStudentsPagination() {
    const paginationContainer = document.getElementById('studentsPagination');
    const paginationNav = document.getElementById('studentsPaginationNav');
    
    if (totalStudentsPages <= 1) {
        paginationNav.style.display = 'none';
        return;
    }
    
    paginationNav.style.display = 'block';
    
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
}

/**
 * Mostrar/ocultar estado de carga
 */
function showStudentsLoadingState(show) {
    console.log(`📊 ${show ? 'Mostrar' : 'Ocultar'} loading de alumnos`);
    
    document.getElementById('studentsLoadingState').style.display = show ? 'block' : 'none';
    document.getElementById('studentsTableContainer').style.display = show ? 'none' : 'block';
    document.getElementById('studentsEmptyState').style.display = 'none';
    document.getElementById('studentsPaginationNav').style.display = show ? 'none' : 'block';
}

/**
 * CORRECCIÓN: Mostrar estado vacío con mensaje específico
 */
function showStudentsEmptyState(message = 'No se encontraron alumnos') {
    console.log('📭 Mostrando estado vacío:', message);
    
    document.getElementById('studentsEmptyState').style.display = 'block';
    document.getElementById('studentsTableContainer').style.display = 'none';
    document.getElementById('studentsLoadingState').style.display = 'none';
    document.getElementById('studentsPaginationNav').style.display = 'none';

    // CORRECCIÓN: Mostrar mensaje específico para filtro vencidos
    const emptyMessage = document.querySelector('#studentsEmptyState p');
    if (emptyMessage && currentStudentFilters.paymentFilter === 'overdue') {
        emptyMessage.textContent = '✅ No hay alumnos con pagos vencidos (+5 días)';
        emptyMessage.className = 'mt-2 mb-0 text-success'; // Verde = buena noticia
    } else if (emptyMessage) {
        emptyMessage.textContent = message;
        emptyMessage.className = 'mt-2 mb-0 text-muted'; // Gris normal
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
    document.getElementById('filterSummary').textContent = summary;
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
    // Limpiar formulario
    document.getElementById('addStudentForm').reset();
    
    // Establecer valores por defecto
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('newStudentEnrollmentDate').value = today;
    document.getElementById('newStudentMonthlyFee').value = '1200';
    document.getElementById('newStudentPaymentMethod').value = 'Efectivo';
    document.getElementById('newStudentDomiciled').value = 'No';
    document.getElementById('newStudentDomiciliedName').disabled = true;
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('addStudentModal'));
    modal.show();
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
async function editStudent(studentId) {
    try {
        console.log(`📝 Editando alumno ID: ${studentId}`);
        
        // Buscar alumno en datos actuales
        const student = studentsData.find(s => s.id == studentId);
        
        if (!student) {
            showAlert('warning', 'Alumno no encontrado');
            return;
        }
        
        // Llenar formulario de edición
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
        document.getElementById('editStudentDomiciliedName').value = student.nombre_domiciliado || '';
        
        // Configurar campo domiciliado
        toggleDomiciliadoName();
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('editStudentModal'));
        modal.show();
        
    } catch (error) {
        console.error('❌ Error cargando datos del alumno:', error);
        showAlert('danger', 'Error cargando datos del alumno');
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
        await loadTeachersForSelects();
        
        console.log('✅ Módulo de alumnos inicializado');
        
    } catch (error) {
        console.error('❌ Error inicializando módulo de alumnos:', error);
    }
}

/**
 * Cargar maestros para los select de formularios
 */
async function loadTeachersForSelects() {
    try {
        // Solo cargar si hay selects de maestros en el DOM
        const newTeacherSelect = document.getElementById('newStudentTeacher');
        const editTeacherSelect = document.getElementById('editStudentTeacher');
        
        if (newTeacherSelect || editTeacherSelect) {
            // Por ahora usar maestros predefinidos
            // En el futuro se puede cargar desde API
            const teachers = [
                { id: 1, name: 'Hugo Vazquez', specialty: 'Guitarra' },
                { id: 2, name: 'Julio Olvera', specialty: 'Batería' },
                { id: 3, name: 'Demian Andrade', specialty: 'Batería' },
                { id: 4, name: 'Irwin Hernandez', specialty: 'Guitarra' },
                { id: 5, name: 'Nahomy Perez', specialty: 'Canto' },
                { id: 6, name: 'Luis Blanquet', specialty: 'Bajo' },
                { id: 7, name: 'Manuel Reyes', specialty: 'Teclado' },
                { id: 8, name: 'Harim Lopez', specialty: 'Teclado' }
            ];
            
            const optionsHTML = teachers.map(teacher => 
                `<option value="${teacher.id}">${teacher.name} - ${teacher.specialty}</option>`
            ).join('');
            
            if (newTeacherSelect) {
                newTeacherSelect.innerHTML = '<option value="">Selecciona maestro</option>' + optionsHTML;
            }
            if (editTeacherSelect) {
                editTeacherSelect.innerHTML = '<option value="">Selecciona maestro</option>' + optionsHTML;
            }
            
            console.log('✅ Maestros cargados en selects');
        }
    } catch (error) {
        console.error('❌ Error cargando maestros:', error);
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

console.log('✅ Dashboard Students Module cargado - Todas las funciones disponibles');