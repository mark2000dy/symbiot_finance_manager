/* ====================================================
   DASHBOARD STUDENTS MODULE - SYMBIOT FINANCIAL MANAGER
   Archivo: public/js/dashboard-students.js
   Widget completo de gestión de alumnos con correcciones críticas
   Version: 3.1.6 - Adapter Functions for Backend Data
   ==================================================== */

// ============================================================
// 🔄 DATA ADAPTERS - Transform backend responses to expected format
// ============================================================

/**
 * Adapter for historial-pagos endpoint
 * Transforms backend array response to expected object format
 * @param {Object} backendResponse - {success: true, data: [...], total_pagos: N}
 * @returns {Object} - {pagosPorMes: {}, totalPagado: 0, totalTransacciones: 0}
 */
function adaptHistorialPagos(backendResponse) {
    if (!backendResponse.success || !backendResponse.data) {
        return {
            pagosPorMes: {},
            totalPagado: 0,
            totalTransacciones: 0
        };
    }

    const pagos = backendResponse.data;
    const pagosPorMes = {};
    let totalPagado = 0;

    // Group payments by month (YYYY-MM format)
    pagos.forEach(pago => {
        if (pago.fecha && pago.total) {
            // Extract YYYY-MM from fecha (parseo local para evitar desfase UTC)
            const partesFecha = String(pago.fecha).split('T')[0].split('-');
            const mesKey = `${partesFecha[0]}-${partesFecha[1]}`;

            // Sum totals by month
            if (!pagosPorMes[mesKey]) {
                pagosPorMes[mesKey] = 0;
            }
            pagosPorMes[mesKey] += parseFloat(pago.total);
            totalPagado += parseFloat(pago.total);
        }
    });

    return {
        pagosPorMes: pagosPorMes,
        totalPagado: totalPagado,
        totalTransacciones: pagos.length
    };
}

// ============================================================
// 🎓 FUNCIONES PRINCIPALES DE GESTIÓN DE ALUMNOS
// ============================================================

/**
 * Aplicar permisos dinámicamente al widget de alumnos
 * Se llama después de cargar alumnos para habilitar/deshabilitar botones según permisos
 */
function applyStudentsWidgetPermissions() {
    try {
        // Obtener permisos del usuario actual
        const hasCreatePermission = typeof hasPermission === 'function' && hasPermission('create_student');
        const hasEditPermission = typeof hasPermission === 'function' && hasPermission('edit_student');
        
        console.log(`🎓 Aplicando permisos widget alumnos: crear=${hasCreatePermission}, editar=${hasEditPermission}`);
        
        // Botón de nuevo alumno
        const newStudentButton = document.querySelector('button[onclick="showAddStudentModal()"]');
        if (newStudentButton) {
            if (hasCreatePermission) {
                newStudentButton.style.display = 'inline-block';
                newStudentButton.disabled = false;
                newStudentButton.title = 'Registrar un nuevo alumno';
                console.log('✅ Botón "Nuevo Alumno" habilitado');
            } else {
                newStudentButton.style.display = 'none';
                newStudentButton.disabled = true;
                console.log('⛔ Botón "Nuevo Alumno" deshabilitado');
            }
        }
        
        // Botones de edición en tabla
        const editStudentButtons = document.querySelectorAll('button[onclick*="editStudent"]');
        editStudentButtons.forEach(button => {
            button.disabled = !hasEditPermission;
            button.title = hasEditPermission ? 'Editar alumno' : 'Sin permisos para editar';
        });
        
        if (editStudentButtons.length > 0) {
            console.log(`✅ Permisos de edición aplicados a ${editStudentButtons.length} botones`);
        }
        
    } catch (error) {
        console.warn('⚠️ Error aplicando permisos del widget de alumnos:', error);
    }
}

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

// Función del dashboard original para formatear fechas correctamente
function getFormattedNextPaymentDate(student) {
    try {
        if (student.estatus === 'Baja') {
            return '<span class="text-muted">No aplica</span>';
        }

        if (!student.fecha_inscripcion) {
            return '<span class="text-muted">Sin fecha</span>';
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Usar parseLocalDate para evitar desfase UTC → timezone local
        const pld = typeof window.parseLocalDate === 'function' ? window.parseLocalDate : (d) => new Date(d);
        const fechaInscripcion = pld(student.fecha_inscripcion);
        const diaCorte = fechaInscripcion.getDate();

        // Fecha de corte del mes ACTUAL (día de inscripción)
        let fechaCorteActual = new Date(today.getFullYear(), today.getMonth(), diaCorte);
        fechaCorteActual.setHours(0, 0, 0, 0);
        if (fechaCorteActual.getDate() !== diaCorte) {
            fechaCorteActual = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            fechaCorteActual.setHours(0, 0, 0, 0);
        }

        // Periodo de pago: -3 días a +5 días desde fecha de corte
        const finPeriodoGracia = new Date(fechaCorteActual);
        finPeriodoGracia.setDate(finPeriodoGracia.getDate() + 5);

        // Verificar pagos (misma lógica que getPaymentStatusHomologado)
        const fechaUltimoPago = student.fecha_ultimo_pago ? pld(student.fecha_ultimo_pago) : null;

        const pagoEsteMes = fechaUltimoPago &&
            fechaUltimoPago.getMonth() === today.getMonth() &&
            fechaUltimoPago.getFullYear() === today.getFullYear();

        const pagoMesAnterior = fechaUltimoPago &&
            fechaUltimoPago.getMonth() === (today.getMonth() - 1 + 12) % 12 &&
            (fechaUltimoPago.getFullYear() === today.getFullYear() ||
             (today.getMonth() === 0 && fechaUltimoPago.getFullYear() === today.getFullYear() - 1));

        // Determinar próxima fecha de pago según estado
        let nextPaymentDate;

        if (pagoEsteMes) {
            // Pagó este mes → próximo pago es el mes siguiente
            nextPaymentDate = new Date(today.getFullYear(), today.getMonth() + 1, diaCorte);
            if (nextPaymentDate.getDate() !== diaCorte) {
                nextPaymentDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
            }
        } else if (pagoMesAnterior) {
            // Pagó mes anterior → próximo pago es este mes
            nextPaymentDate = new Date(fechaCorteActual);
        } else if (fechaUltimoPago) {
            // No pagó mes anterior → vencido, mostrar cuando debió pagar
            const mesSiguiente = new Date(fechaUltimoPago);
            mesSiguiente.setMonth(mesSiguiente.getMonth() + 1);
            nextPaymentDate = new Date(mesSiguiente.getFullYear(), mesSiguiente.getMonth(), diaCorte);
            if (nextPaymentDate.getDate() !== diaCorte) {
                nextPaymentDate = new Date(mesSiguiente.getFullYear(), mesSiguiente.getMonth() + 1, 0);
            }
        } else {
            // Sin pagos → primer pago era inscripción + 1 mes
            nextPaymentDate = new Date(fechaInscripcion);
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        }

        nextPaymentDate.setHours(0, 0, 0, 0);

        if (isNaN(nextPaymentDate.getTime())) {
            return '<span class="text-muted">Sin fecha</span>';
        }

        const daysDiff = Math.round((nextPaymentDate - today) / (1000 * 60 * 60 * 24));

        const formattedDate = nextPaymentDate.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: '2-digit'
        });

        if (pagoEsteMes) {
            return `${formattedDate} <small class="text-success">(en ${daysDiff} días)</small>`;
        } else if (daysDiff === 0) {
            return `${formattedDate} <small class="text-warning">(HOY)</small>`;
        } else if (daysDiff > 0) {
            return `${formattedDate} <small class="text-info">(en ${daysDiff} días)</small>`;
        } else {
            return `${formattedDate} <small class="text-danger">(hace ${Math.abs(daysDiff)} días)</small>`;
        }
    } catch (error) {
        console.error('Error calculando próximo pago:', error);
        return '<span class="text-muted">Error</span>';
    }
}

// ✅ HOMOLOGADO: Función para generar badge usando función de estado homologada
function getPaymentStatusBadge(student) {
    // Usar la función homologada para obtener el estado
    const paymentStatus = getPaymentStatus(student);
    
    // Generar badge basado en el estado homologado
    const badges = {
        'overdue': '<span class="badge bg-danger">Vencido</span>',
        'upcoming': '<span class="badge bg-warning">Próximo</span>',
        'current': '<span class="badge bg-success">Al corriente</span>',
        'inactive': '<span class="badge bg-secondary">No aplica</span>'
    };
    
    return badges[paymentStatus] || badges['current'];
}

/**
 * Obtener estado de pago de un alumno - HOMOLOGADO
 */
function getPaymentStatus(student) {
    // Usar la función homologada del módulo stats
    if (typeof window.getPaymentStatusHomologado === 'function') {
        return window.getPaymentStatusHomologado(student);
    }
    
    // Fallback si no está disponible
    try {
        if (student.estatus === 'Baja') return 'inactive';

        const today = new Date();
        const pld2 = typeof window.parseLocalDate === 'function' ? window.parseLocalDate : (d) => new Date(d);
        const fechaInscripcion = pld2(student.fecha_inscripcion);
        const diaCorte = fechaInscripcion.getDate();

        let fechaCorte = new Date(today.getFullYear(), today.getMonth(), diaCorte);
        if (fechaCorte.getDate() !== diaCorte) {
            fechaCorte = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        }

        const diasHastaCorte = Math.floor((fechaCorte.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        const fechaUltimoPago = student.fecha_ultimo_pago ? pld2(student.fecha_ultimo_pago) : null;
        const pagoEsteMes = fechaUltimoPago && 
            fechaUltimoPago.getMonth() === today.getMonth() && 
            fechaUltimoPago.getFullYear() === today.getFullYear();

        if (diasHastaCorte >= 0 && diasHastaCorte <= 3 && !pagoEsteMes) {
            return 'upcoming';
        }
        
        if (diasHastaCorte < -5 && !pagoEsteMes) {
            return 'overdue';  
        }
        
        return 'current';
        
    } catch (error) {
        console.error(`Error calculando estado para ${student.nombre}:`, error);
        return 'current';
    }
}

/**
 * Función principal para cargar lista de alumnos con paginación
 * CORRECCIÓN: Filtrado de pagos en frontend
 */
async function loadStudentsList(page = 1) {
    if (!verifyStudentsElements()) {
        console.log('📭 Widget de alumnos no disponible - saltando carga');
        return;
    }
    
    try {
        console.log(`🎓 Cargando alumnos - Página ${page}...`);
        console.log('🔍 Filtros actuales:', currentStudentFilters);

        showStudentsLoadingState(true);

        // v3.1.3: Construir params object para apiGet en lugar de URL con query string
        const empresaIdParam = currentCompanyFilter || 1;
        const params = {
            empresa_id: empresaIdParam,
            limit: 1000 // Cargar todos
        };

        // Agregar solo filtros que el backend soporta
        if (currentStudentFilters.statusFilter) {
            params.estatus = currentStudentFilters.statusFilter;
        }
        if (currentStudentFilters.instrumentFilter) {
            params.clase = currentStudentFilters.instrumentFilter;
        }
        if (currentStudentFilters.teacherFilter) {
            params.maestro_id = currentStudentFilters.teacherFilter;
        }

        console.log('📡 Parámetros de solicitud:', params);

        // v3.1.3: Usar API Client en lugar de fetch directo
        const result = await window.apiGet('alumnos', params);

        console.log('📥 Respuesta del servidor:', result);

        if (result.success && result.data) {
            let allStudents = result.data;
            
            // FILTRAR POR TIPO DE CLASE EN FRONTEND
            if (currentStudentFilters.tipoClaseFilter) {
                allStudents = allStudents.filter(student => student.tipo_clase === currentStudentFilters.tipoClaseFilter);
            }

            // FILTRAR POR ESTADO DE PAGO EN FRONTEND
            if (currentStudentFilters.paymentFilter) {
                console.log(`🔍 Aplicando filtro de pagos: ${currentStudentFilters.paymentFilter}`);
                allStudents = allStudents.filter(student => {
                    const status = getPaymentStatus(student);
                    return status === currentStudentFilters.paymentFilter;
                });
                console.log(`✅ Filtrados: ${allStudents.length} alumnos con estado "${currentStudentFilters.paymentFilter}"`);
            }

            // PAGINACIÓN EN FRONTEND
            totalStudentsRecords = allStudents.length;
            totalStudentsPages = Math.ceil(totalStudentsRecords / studentsPerPage);
            currentStudentsPage = Math.min(page, totalStudentsPages || 1);
            
            const startIndex = (currentStudentsPage - 1) * studentsPerPage;
            const endIndex = startIndex + studentsPerPage;
            studentsData = allStudents.slice(startIndex, endIndex);
            
            console.log(`✅ Página ${currentStudentsPage} de ${totalStudentsPages} (${totalStudentsRecords} total)`);
            
            showStudentsLoadingState(false);
            
            if (totalStudentsRecords === 0) {
                const hasActiveFilters = Object.values(currentStudentFilters).some(filter => filter !== '');
                const message = hasActiveFilters 
                    ? 'No se encontraron alumnos que coincidan con los filtros aplicados'
                    : 'No hay alumnos registrados';
                showStudentsEmptyState(message);
            } else {
                renderStudentsTable();
                renderStudentsPagination();
                
                const filteredCountElement = document.getElementById('filteredCount');
                if (filteredCountElement) {
                    filteredCountElement.textContent = totalStudentsRecords;
                }
                
                const totalCountElement = document.getElementById('totalCount');
                if (totalCountElement) {
                    totalCountElement.textContent = totalStudentsRecords;
                }
            }
            
            updateStudentsFilterSummary();
            
            // ✅ NUEVO: Aplicar permisos dinámicamente después de cargar alumnos
            applyStudentsWidgetPermissions();
            
        } else {
            throw new Error(result.message || 'Error cargando alumnos');
        }
        
    } catch (error) {
        console.error('❌ Error cargando alumnos:', error);
        showStudentsLoadingState(false);
        showStudentsEmptyState('Error cargando la lista de alumnos');
        showAlert('danger', 'Error cargando alumnos: ' + error.message);
    }
}

/**
 * Guardar nuevo alumno
 */
async function saveNewStudent() {
    if (typeof hasPermission === 'function' && !hasPermission('create_student')) {
        showAlert('danger', 'No tienes permisos para crear alumnos');
        return;
    }
    try {
        console.log('🚀 Iniciando saveNewStudent...');
        
        // Proteger contra múltiples envíos
        const submitBtn = document.querySelector('#addStudentModal .btn-success');
        if (submitBtn && submitBtn.disabled) {
            console.log('⚠️ Envío ya en progreso...');
            return;
        }

        // Deshabilitar botón
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Registrando...';
        }

        const form = document.getElementById('addStudentForm');
        if (!form.checkValidity()) {
            console.log('❌ Formulario no válido');
            form.reportValidity();
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-save me-1"></i>Registrar Alumno';
            }
            return;
        }
        
        console.log('✅ Formulario válido, recopilando datos...');
        
        // Recopilar datos completos
        const studentData = {
            nombre: document.getElementById('newStudentName')?.value.trim() || '',
            edad: parseInt(document.getElementById('newStudentAge')?.value) || null,
            telefono: document.getElementById('newStudentPhone')?.value || null,
            email: document.getElementById('newStudentEmail')?.value || null,
            fecha_inscripcion: document.getElementById('newStudentEnrollmentDate')?.value || null,
            clase: document.getElementById('newStudentInstrument')?.value || null,
            tipo_clase: document.getElementById('newStudentClassType')?.value || 'Individual',
            maestro_id: document.getElementById('newStudentTeacher')?.value || null,
            horario: document.getElementById('newStudentSchedule')?.value || null,
            estatus: 'Activo',
            promocion: document.getElementById('newStudentPromotion')?.value || null,
            precio_mensual: parseFloat(document.getElementById('newStudentMonthlyFee')?.value) || null,
            forma_pago: document.getElementById('newStudentPaymentMethod')?.value || null,
            domiciliado: document.getElementById('newStudentDomiciled')?.value === 'Si',
            titular_domicilado: document.getElementById('newStudentDomiciliedName')?.value || null,
            empresa_id: currentCompanyFilter || 1
        };

        console.log('📤 Enviando datos:', studentData);

        // Enviar al backend
        const result = await window.apiPost('alumnos', studentData);

        if (result.success) {
            console.log('✅ Alumno creado exitosamente');
            showAlert('success', `Alumno "${studentData.nombre}" registrado exitosamente`);
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addStudentModal'));
            if (modal) modal.hide();
            
            // Limpiar formulario
            form.reset();
            
            // Recargar lista
            await loadStudentsList(1);
        } else {
            throw new Error(result.message || 'Error al crear alumno');
        }

    } catch (error) {
        console.error('❌ Error creando alumno:', error);
        showAlert('danger', `Error: ${error.message}`);
    } finally {
        // Restaurar botón
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

        // Detectar modo doble: si existe el campo hidden editStudentDoubleMode
        const doubleModeField = document.getElementById('editStudentDoubleMode');
        const numClases = doubleModeField ? parseInt(doubleModeField.value) : 0;

        if (numClases > 1) {
            // ========== GUARDADO MULTIPLE (alumno doble) ==========
            await saveDoubleStudentChanges(numClases);
        } else {
            // ========== GUARDADO SIMPLE (alumno con una clase) ==========
            await saveSingleStudentChanges();
        }

        // Cerrar modal
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editStudentModal'));
        if (editModal) {
            editModal.hide();
        }

        // Recargar lista
        await loadStudentsList(currentStudentsPage);

        console.log('✅ Alumno actualizado correctamente');

    } catch (error) {
        console.error('❌ Error guardando cambios:', error);
        showAlert('danger', 'Error guardando los cambios: ' + error.message);
    }
}

/**
 * Guardar alumno simple (una clase)
 */
async function saveSingleStudentChanges() {
    const studentData = {
        id: document.getElementById('editStudentId').value,
        nombre: document.getElementById('editStudentName').value.trim(),
        edad: document.getElementById('editStudentAge').value ? parseInt(document.getElementById('editStudentAge').value) : null,
        telefono: document.getElementById('editStudentPhone').value || null,
        email: document.getElementById('editStudentEmail').value || null,
        fecha_inscripcion: document.getElementById('editStudentEnrollmentDate').value || null,
        clase: document.getElementById('editStudentInstrument').value || null,
        tipo_clase: document.getElementById('editStudentClassType')?.value || 'Individual',
        maestro_id: document.getElementById('editStudentTeacher').value || null,
        horario: document.getElementById('editStudentSchedule').value || null,
        estatus: document.getElementById('editStudentStatus').value || 'Activo',
        promocion: document.getElementById('editStudentPromotion').value || null,
        precio_mensual: document.getElementById('editStudentMonthlyFee').value ?
            parseFloat(document.getElementById('editStudentMonthlyFee').value) : null,
        forma_pago: document.getElementById('editStudentPaymentMethod').value || null,
        domiciliado: document.getElementById('editStudentDomiciled').value === 'Si',
        titular_domicilado: document.getElementById('editStudentDomiciliedName').value || null
    };

    console.log('📤 Datos a actualizar (simple):', studentData);

    const result = await window.apiPut('alumnos/' + studentData.id, studentData);

    if (result.success) {
        showAlert('success', `Informacion de ${studentData.nombre} actualizada exitosamente`);
    } else {
        throw new Error(result.message || 'Error actualizando alumno');
    }
}

/**
 * Guardar alumno doble (multiples clases) - envia un PUT por cada registro individual
 */
async function saveDoubleStudentChanges(numClases) {
    // Datos personales compartidos
    const sharedData = {
        nombre: document.getElementById('editStudentName').value.trim(),
        edad: document.getElementById('editStudentAge').value ? parseInt(document.getElementById('editStudentAge').value) : null,
        telefono: document.getElementById('editStudentPhone').value || null,
        email: document.getElementById('editStudentEmail').value || null,
        fecha_inscripcion: document.getElementById('editStudentEnrollmentDate').value || null,
        estatus: document.getElementById('editStudentStatus').value || 'Activo',
        promocion: document.getElementById('editStudentPromotion').value || null,
        forma_pago: document.getElementById('editStudentPaymentMethod').value || null,
        domiciliado: document.getElementById('editStudentDomiciled').value === 'Si',
        titular_domicilado: document.getElementById('editStudentDomiciliedName').value || null
    };

    const errors = [];
    let nombreAlumno = sharedData.nombre;

    for (let idx = 0; idx < numClases; idx++) {
        const classId = document.getElementById(`editStudentClassId_${idx}`)?.value;
        if (!classId) {
            console.warn(`⚠️ No se encontro ID para clase ${idx}`);
            continue;
        }

        const classData = {
            ...sharedData,
            clase: document.getElementById(`editStudentInstrument_${idx}`)?.value || null,
            tipo_clase: document.getElementById(`editStudentClassType_${idx}`)?.value || 'Individual',
            maestro_id: document.getElementById(`editStudentTeacher_${idx}`)?.value || null,
            horario: document.getElementById(`editStudentSchedule_${idx}`)?.value || null,
            precio_mensual: document.getElementById(`editStudentMonthlyFee_${idx}`)?.value ?
                parseFloat(document.getElementById(`editStudentMonthlyFee_${idx}`).value) : null
        };

        console.log(`📤 Actualizando clase ${idx + 1} (ID: ${classId}):`, classData);

        const result = await window.apiPut('alumnos/' + classId, classData);

        if (!result.success) {
            errors.push(`Clase ${idx + 1}: ${result.message || 'Error desconocido'}`);
        }
    }

    if (errors.length > 0) {
        throw new Error('Errores al actualizar: ' + errors.join('; '));
    }

    showAlert('success', `Informacion de ${nombreAlumno} (${numClases} clases) actualizada exitosamente`);
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
    const tipoClaseFilter = document.getElementById('tipoClaseFilter')?.value || '';
    const paymentFilter = document.getElementById('paymentFilter')?.value || '';

    // Actualizar filtros globales
    currentStudentFilters = {
        teacherFilter,
        statusFilter,
        instrumentFilter,
        tipoClaseFilter,
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
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-3">No hay alumnos</td></tr>';
        return;
    }
    
    tableBody.innerHTML = studentsData.map(student => {
        // Indicador de múltiples clases
        const numClases = parseInt(student.num_clases) || 1;
        const claseBadge = numClases > 1
            ? `<span class="badge bg-info ms-1" title="${numClases} clases">${numClases}</span>`
            : '';

        return `
        <tr>
            <td>
                <strong>${student.nombre}</strong>
                ${student.telefono ? `<br><small class="text-muted">${student.telefono}</small>` : ''}
            </td>
            <td>${student.clase || 'Sin clase'}${claseBadge}</td>
            <td>${student.maestro || 'Sin asignar'}</td>
            <td>
                <span class="badge ${student.estatus === 'Activo' ? 'bg-success' : 'bg-danger'}">
                    ${student.estatus === 'Activo' ? '✅ Activo' : '❌ Baja'}
                </span>
            </td>
            <td>${getFormattedNextPaymentDate(student)}</td>
            <td>${getPaymentStatusBadge(student)}</td>
            <td>
                <button class="btn btn-sm btn-outline-info me-1" onclick="viewStudentDetail(${student.id})" title="Ver detalle">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editStudent(${student.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `}).join('');
}

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
    const paginationNav = document.getElementById('studentsPaginationContainer');
    
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
                    case 'tipoClaseFilter': return `Tipo de Clase: ${value}`;
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
    
    // Parseo local para evitar desfase UTC
    const eParts = String(student.fecha_inscripcion).split('T')[0].split('-');
    const enrollmentDate = new Date(parseInt(eParts[0]), parseInt(eParts[1]) - 1, parseInt(eParts[2]));
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
 * Crear HTML del modal de nuevo alumno
 */
function createAddStudentModalHTML() {
    return `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-user-plus me-2"></i>Nuevo Alumno
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                    <form id="addStudentForm">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="newStudentName" class="form-label">
                                    <i class="fas fa-user me-1"></i>Nombre Completo *
                                </label>
                                <input type="text" class="form-control" id="newStudentName" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="newStudentAge" class="form-label">
                                    <i class="fas fa-birthday-cake me-1"></i>Edad *
                                </label>
                                <input type="number" class="form-control" id="newStudentAge" min="1" max="100" required>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="newStudentPhone" class="form-label">
                                    <i class="fas fa-phone me-1"></i>Teléfono
                                </label>
                                <input type="tel" class="form-control" id="newStudentPhone">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="newStudentEmail" class="form-label">
                                    <i class="fas fa-envelope me-1"></i>Email
                                </label>
                                <input type="email" class="form-control" id="newStudentEmail">
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="newStudentEnrollmentDate" class="form-label">
                                    <i class="fas fa-calendar me-1"></i>Fecha de Inscripción *
                                </label>
                                <input type="date" class="form-control" id="newStudentEnrollmentDate" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="newStudentInstrument" class="form-label">
                                    <i class="fas fa-music me-1"></i>Instrumento *
                                </label>
                                <select class="form-select" id="newStudentInstrument" required>
                                    <option value="">Selecciona instrumento</option>
                                    <option value="Guitarra">🎸 Guitarra</option>
                                    <option value="Teclado">🎹 Teclado</option>
                                    <option value="Batería">🥁 Batería</option>
                                    <option value="Bajo">🎸 Bajo</option>
                                    <option value="Canto">🎤 Canto</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="newStudentTeacher" class="form-label">
                                    <i class="fas fa-chalkboard-teacher me-1"></i>Maestro
                                </label>
                                <select class="form-select" id="newStudentTeacher">
                                    <option value="">Sin asignar</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="newStudentSchedule" class="form-label">
                                    <i class="fas fa-clock me-1"></i>Horario
                                </label>
                                <input type="text" class="form-control" id="newStudentSchedule">
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="newStudentPromotion" class="form-label">
                                    <i class="fas fa-tag me-1"></i>Promoción
                                </label>
                                <input type="text" class="form-control" id="newStudentPromotion">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="newStudentMonthlyFee" class="form-label">
                                    <i class="fas fa-dollar-sign me-1"></i>Mensualidad *
                                </label>
                                <input type="number" class="form-control" id="newStudentMonthlyFee" step="0.01" required>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="newStudentPaymentMethod" class="form-label">
                                    <i class="fas fa-credit-card me-1"></i>Forma de Pago
                                </label>
                                <select class="form-select" id="newStudentPaymentMethod">
                                    <option value="">Seleccionar...</option>
                                    <option value="Transferencia">🏦 Transferencia</option>
                                    <option value="Efectivo">💵 Efectivo</option>
                                    <option value="TPV">📱 TPV</option>
                                    <option value="TPV Domiciliado">📱 TPV Domiciliado</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="newStudentDomiciled" class="form-label">
                                    <i class="fas fa-home me-1"></i>Domiciliado
                                </label>
                                <select class="form-select" id="newStudentDomiciled" onchange="toggleNewStudentDomiciliadoName()">
                                    <option value="No">No</option>
                                    <option value="Si">Sí</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-12 mb-3">
                                <label for="newStudentDomiciliedName" class="form-label">
                                    <i class="fas fa-user me-1"></i>Titular Domiciliado
                                </label>
                                <input type="text" class="form-control" id="newStudentDomiciliedName" disabled>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times me-1"></i>Cancelar
                    </button>
                    <button type="button" class="btn btn-success" onclick="saveNewStudent()">
                        <i class="fas fa-save me-1"></i>Registrar Alumno
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Mostrar modal de nuevo alumno
 */
function showAddStudentModal() {
    console.log('➕ Mostrando modal de nuevo alumno...');
    
    try {
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
        
        // ✅ POBLAR SELECT DE MAESTROS
        const teacherSelect = document.getElementById('newStudentTeacher');
        if (teacherSelect) {
            teacherSelect.innerHTML = `
                <option value="">Sin asignar</option>
                <option value="1">Hugo Vazquez</option>
                <option value="2">Julio Olvera</option>
                <option value="3">Demian Andrade</option>
                <option value="4">Irwin Hernandez</option>
                <option value="5">Nahomy Perez</option>
                <option value="6">Luis Blanquet</option>
                <option value="7">Manuel Reyes</option>
                <option value="8">Harim Lopez</option>
            `;
        }
        
        // ✅ AGREGAR SELECT DE TIPO DE CLASE SI NO EXISTE
        let classTypeSelect = document.getElementById('newStudentClassType');
        if (!classTypeSelect) {
            const teacherField = document.getElementById('newStudentTeacher');
            if (teacherField && teacherField.parentElement) {
                const classTypeDiv = document.createElement('div');
                classTypeDiv.className = 'col-md-6 mb-3';
                classTypeDiv.innerHTML = `
                    <label for="newStudentClassType" class="form-label">
                        <i class="fas fa-users me-1"></i>Tipo de Clase *
                    </label>
                    <select class="form-select" id="newStudentClassType" required>
                        <option value="Individual">👤 Individual</option>
                        <option value="Grupal">👥 Grupal</option>
                    </select>
                `;
                teacherField.parentElement.parentElement.appendChild(classTypeDiv);
            }
        }
        
        // Establecer valores por defecto
        const today = new Date().toISOString().split('T')[0];
        const enrollmentField = modalElement.querySelector('#newStudentEnrollmentDate');
        if (enrollmentField) enrollmentField.value = today;
        
        const feeField = modalElement.querySelector('#newStudentMonthlyFee');
        if (feeField) feeField.value = '1200';
        
        // Mostrar modal
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
 * Crear HTML del modal de editar alumno
 */
function createEditStudentModalHTML() {
    return `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-user-edit me-2"></i>
                        Editar Información del Alumno
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                    <form id="editStudentForm">
                        <input type="hidden" id="editStudentId">
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="editStudentName" class="form-label">
                                    <i class="fas fa-user me-1"></i>Nombre Completo *
                                </label>
                                <input type="text" class="form-control" id="editStudentName" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="editStudentAge" class="form-label">
                                    <i class="fas fa-birthday-cake me-1"></i>Edad *
                                </label>
                                <input type="number" class="form-control" id="editStudentAge" min="1" max="100" required>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="editStudentPhone" class="form-label">
                                    <i class="fas fa-phone me-1"></i>Teléfono
                                </label>
                                <input type="tel" class="form-control" id="editStudentPhone">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="editStudentEmail" class="form-label">
                                    <i class="fas fa-envelope me-1"></i>Email
                                </label>
                                <input type="email" class="form-control" id="editStudentEmail">
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="editStudentEnrollmentDate" class="form-label">
                                    <i class="fas fa-calendar me-1"></i>Fecha de Inscripción *
                                </label>
                                <input type="date" class="form-control" id="editStudentEnrollmentDate" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="editStudentInstrument" class="form-label">
                                    <i class="fas fa-music me-1"></i>Instrumento *
                                </label>
                                <select class="form-select" id="editStudentInstrument" required>
                                    <option value="">Selecciona instrumento</option>
                                    <option value="Guitarra">🎸 Guitarra</option>
                                    <option value="Teclado">🎹 Teclado</option>
                                    <option value="Batería">🥁 Batería</option>
                                    <option value="Bajo">🎸 Bajo</option>
                                    <option value="Canto">🎤 Canto</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="editStudentTeacher" class="form-label">
                                    <i class="fas fa-chalkboard-teacher me-1"></i>Maestro
                                </label>
                                <select class="form-select" id="editStudentTeacher">
                                    <option value="">Sin asignar</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="editStudentSchedule" class="form-label">
                                    <i class="fas fa-clock me-1"></i>Horario
                                </label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="editStudentSchedule">
                                    <button class="btn btn-outline-info" type="button" onclick="syncStudentSchedule()" title="Sincronizar con Google Calendar">
                                        <i class="fas fa-sync-alt"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label for="editStudentClassType" class="form-label">
                                    <i class="fas fa-users me-1"></i>Tipo de Clase *
                                </label>
                                <select class="form-select" id="editStudentClassType" required>
                                    <option value="Individual">👤 Individual</option>
                                    <option value="Grupal">👥 Grupal</option>
                                </select>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label for="editStudentStatus" class="form-label">
                                    <i class="fas fa-toggle-on me-1"></i>Estatus *
                                </label>
                                <select class="form-select" id="editStudentStatus" required>
                                    <option value="Activo">✅ Activo</option>
                                    <option value="Baja">❌ Baja</option>
                                </select>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label for="editStudentPromotion" class="form-label">
                                    <i class="fas fa-tag me-1"></i>Promoción
                                </label>
                                <input type="text" class="form-control" id="editStudentPromotion">
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="editStudentMonthlyFee" class="form-label">
                                    <i class="fas fa-dollar-sign me-1"></i>Mensualidad *
                                </label>
                                <input type="number" class="form-control" id="editStudentMonthlyFee" step="0.01" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="editStudentPaymentMethod" class="form-label">
                                    <i class="fas fa-credit-card me-1"></i>Forma de Pago
                                </label>
                                <select class="form-select" id="editStudentPaymentMethod">
                                    <option value="">Seleccionar...</option>
                                    <option value="Transferencia">🏦 Transferencia</option>
                                    <option value="Efectivo">💵 Efectivo</option>
                                    <option value="TPV">📱 TPV</option>
                                    <option value="TPV Domiciliado">📱 TPV Domiciliado</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="editStudentDomiciled" class="form-label">
                                    <i class="fas fa-home me-1"></i>Domiciliado
                                </label>
                                <select class="form-select" id="editStudentDomiciled" onchange="toggleDomiciliadoName()">
                                    <option value="No">No</option>
                                    <option value="Si">Sí</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="editStudentDomiciliedName" class="form-label">
                                    <i class="fas fa-user me-1"></i>Titular
                                </label>
                                <input type="text" class="form-control" id="editStudentDomiciliedName" disabled>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" onclick="deleteStudent()">
                        <i class="fas fa-trash me-1"></i>Eliminar
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times me-1"></i>Cancelar
                    </button>
                    <button type="button" class="btn btn-primary" onclick="saveStudentChanges()">
                        <i class="fas fa-save me-1"></i>Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Crear HTML del modal de editar alumno DOBLE (multiples clases)
 * Muestra datos personales compartidos arriba y secciones separadas por clase abajo
 */
function createEditDoubleStudentModalHTML(records) {
    // Generar secciones por cada clase
    const classSections = records.map((record, idx) => {
        const maestroOptions = [
            { id: '', name: 'Sin asignar' },
            { id: '1', name: 'Hugo Vazquez' },
            { id: '2', name: 'Julio Olvera' },
            { id: '3', name: 'Demian Andrade' },
            { id: '4', name: 'Irwin Hernandez' },
            { id: '5', name: 'Nahomy Perez' },
            { id: '6', name: 'Luis Blanquet' },
            { id: '7', name: 'Manuel Reyes' },
            { id: '8', name: 'Harim Lopez' }
        ];
        const maestroId = getMaestroIdByName(record.maestro);
        const maestroSelectOptions = maestroOptions.map(m =>
            `<option value="${m.id}" ${m.id === maestroId ? 'selected' : ''}>${m.name}</option>`
        ).join('');

        return `
            <input type="hidden" id="editStudentClassId_${idx}" value="${record.id}">
            <div class="class-section mb-3 p-3" style="border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; background: rgba(255,255,255,0.03);">
                <h6 class="mb-3" style="color: #0dcaf0;">
                    <i class="fas fa-music me-1"></i>Clase ${idx + 1}: ${record.clase || 'Sin clase'}
                </h6>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <label class="form-label"><i class="fas fa-music me-1"></i>Instrumento *</label>
                        <select class="form-select" id="editStudentInstrument_${idx}" required>
                            <option value="">Selecciona instrumento</option>
                            <option value="Guitarra" ${record.clase === 'Guitarra' ? 'selected' : ''}>🎸 Guitarra</option>
                            <option value="Teclado" ${record.clase === 'Teclado' ? 'selected' : ''}>🎹 Teclado</option>
                            <option value="Batería" ${record.clase === 'Batería' ? 'selected' : ''}>🥁 Batería</option>
                            <option value="Bajo" ${record.clase === 'Bajo' ? 'selected' : ''}>🎸 Bajo</option>
                            <option value="Canto" ${record.clase === 'Canto' ? 'selected' : ''}>🎤 Canto</option>
                        </select>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label class="form-label"><i class="fas fa-users me-1"></i>Tipo de Clase *</label>
                        <select class="form-select" id="editStudentClassType_${idx}" required>
                            <option value="Individual" ${record.tipo_clase === 'Individual' ? 'selected' : ''}>👤 Individual</option>
                            <option value="Grupal" ${record.tipo_clase === 'Grupal' ? 'selected' : ''}>👥 Grupal</option>
                        </select>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label class="form-label"><i class="fas fa-chalkboard-teacher me-1"></i>Maestro</label>
                        <select class="form-select" id="editStudentTeacher_${idx}">
                            ${maestroSelectOptions}
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label"><i class="fas fa-clock me-1"></i>Horario</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="editStudentSchedule_${idx}" value="${record.horario || ''}">
                            <button class="btn btn-outline-info" type="button" onclick="syncStudentSchedule(${idx})" title="Sincronizar con Google Calendar">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label"><i class="fas fa-dollar-sign me-1"></i>Mensualidad *</label>
                        <input type="number" class="form-control" id="editStudentMonthlyFee_${idx}" step="0.01" value="${record.precio_mensual || ''}" required>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-user-edit me-2"></i>
                        Editar Alumno <span class="badge bg-info ms-2">${records.length} clases</span>
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                    <form id="editStudentForm">
                        <input type="hidden" id="editStudentId" value="${records[0].id}">
                        <input type="hidden" id="editStudentDoubleMode" value="${records.length}">

                        <h6 class="mb-3" style="color: #ffc107;">
                            <i class="fas fa-id-card me-1"></i>Datos Personales
                        </h6>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="editStudentName" class="form-label">
                                    <i class="fas fa-user me-1"></i>Nombre Completo *
                                </label>
                                <input type="text" class="form-control" id="editStudentName" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="editStudentAge" class="form-label">
                                    <i class="fas fa-birthday-cake me-1"></i>Edad *
                                </label>
                                <input type="number" class="form-control" id="editStudentAge" min="1" max="100" required>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="editStudentPhone" class="form-label">
                                    <i class="fas fa-phone me-1"></i>Telefono
                                </label>
                                <input type="tel" class="form-control" id="editStudentPhone">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="editStudentEmail" class="form-label">
                                    <i class="fas fa-envelope me-1"></i>Email
                                </label>
                                <input type="email" class="form-control" id="editStudentEmail">
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="editStudentEnrollmentDate" class="form-label">
                                    <i class="fas fa-calendar me-1"></i>Fecha de Inscripcion *
                                </label>
                                <input type="date" class="form-control" id="editStudentEnrollmentDate" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="editStudentStatus" class="form-label">
                                    <i class="fas fa-toggle-on me-1"></i>Estatus *
                                </label>
                                <select class="form-select" id="editStudentStatus" required>
                                    <option value="Activo">✅ Activo</option>
                                    <option value="Baja">❌ Baja</option>
                                </select>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label for="editStudentPromotion" class="form-label">
                                    <i class="fas fa-tag me-1"></i>Promocion
                                </label>
                                <input type="text" class="form-control" id="editStudentPromotion">
                            </div>
                            <div class="col-md-4 mb-3">
                                <label for="editStudentPaymentMethod" class="form-label">
                                    <i class="fas fa-credit-card me-1"></i>Forma de Pago
                                </label>
                                <select class="form-select" id="editStudentPaymentMethod">
                                    <option value="">Seleccionar...</option>
                                    <option value="Transferencia">🏦 Transferencia</option>
                                    <option value="Efectivo">💵 Efectivo</option>
                                    <option value="TPV">📱 TPV</option>
                                    <option value="TPV Domiciliado">📱 TPV Domiciliado</option>
                                </select>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label for="editStudentDomiciled" class="form-label">
                                    <i class="fas fa-home me-1"></i>Domiciliado
                                </label>
                                <select class="form-select" id="editStudentDomiciled" onchange="toggleDomiciliadoName()">
                                    <option value="No">No</option>
                                    <option value="Si">Si</option>
                                </select>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="editStudentDomiciliedName" class="form-label">
                                    <i class="fas fa-user me-1"></i>Titular
                                </label>
                                <input type="text" class="form-control" id="editStudentDomiciliedName" disabled>
                            </div>
                        </div>

                        <hr style="border-color: rgba(255,255,255,0.15);">

                        <h6 class="mb-3" style="color: #0dcaf0;">
                            <i class="fas fa-layer-group me-1"></i>Clases Inscritas
                        </h6>
                        ${classSections}
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" onclick="deleteStudent()">
                        <i class="fas fa-trash me-1"></i>Eliminar
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times me-1"></i>Cancelar
                    </button>
                    <button type="button" class="btn btn-primary" onclick="saveStudentChanges()">
                        <i class="fas fa-save me-1"></i>Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Convertir nombre de maestro a ID
 */
function getMaestroIdByName(nombreMaestro) {
    const maestros = {
        'Hugo Vazquez': '1',
        'Julio Olvera': '2',
        'Demian Andrade': '3',
        'Irwin Hernandez': '4',
        'Nahomy Perez': '5',
        'Luis Blanquet': '6',
        'Manuel Reyes': '7',
        'Harim Lopez': '8'
    };
    return maestros[nombreMaestro] || '';
}

/**
 * Editar alumno - cargar datos en modal
 * Soporta alumnos simples y dobles (multiples clases)
 */
async function editStudent(id) {
    console.log('✏️ Editando alumno:', id);

    const modalElement = document.getElementById('editStudentModal');
    if (!modalElement) {
        console.error('❌ Modal editStudentModal no encontrado');
        return;
    }

    try {
        const student = studentsData.find(s => s.id === id);
        if (!student) {
            showAlert('warning', 'Alumno no encontrado en los datos actuales');
            return;
        }

        const numClases = parseInt(student.num_clases) || 1;

        // ========== ALUMNO DOBLE: cargar registros individuales ==========
        if (numClases > 1 && student.all_ids) {
            console.log(`📚 Alumno doble detectado: ${student.nombre} (${numClases} clases, IDs: ${student.all_ids})`);

            // Fetch registros individuales (sin unificar)
            const empresaId = currentCompanyFilter || 1;
            const result = await window.apiGet('alumnos', { empresa_id: empresaId, unificar: '0', limit: 1000 });

            if (!result.success || !result.data) {
                showAlert('danger', 'Error cargando registros individuales del alumno');
                return;
            }

            // Filtrar por IDs conocidos (all_ids) para evitar fallos por acentos u ortografía
            const knownIds = String(student.all_ids).split(',').map(id => parseInt(id.trim(), 10));
            const individualRecords = result.data.filter(s => knownIds.includes(parseInt(s.id, 10)));
            console.log(`📋 Registros individuales encontrados: ${individualRecords.length}`, individualRecords);

            if (individualRecords.length < 2) {
                console.warn('⚠️ No se encontraron multiples registros, usando modal simple');
                // Fallback a modal simple
                editStudentSimple(modalElement, student);
                return;
            }

            // Generar modal doble con los registros individuales
            modalElement.innerHTML = createEditDoubleStudentModalHTML(individualRecords);

            // Poblar datos personales compartidos (del primer registro)
            const first = individualRecords[0];
            const setFieldValue = (fieldId, value) => {
                const field = document.getElementById(fieldId);
                if (field) field.value = (value !== null && value !== undefined) ? value : '';
            };

            setFieldValue('editStudentName', first.nombre);
            setFieldValue('editStudentAge', first.edad);
            setFieldValue('editStudentPhone', first.telefono);
            setFieldValue('editStudentEmail', first.email);

            let fechaInscripcion = '';
            if (first.fecha_inscripcion) {
                try {
                    const parts = String(first.fecha_inscripcion).split('T')[0].split('-');
                    if (parts.length === 3) fechaInscripcion = `${parts[0]}-${parts[1]}-${parts[2]}`;
                } catch (e) { /* ignore */ }
            }
            setFieldValue('editStudentEnrollmentDate', fechaInscripcion);
            setFieldValue('editStudentStatus', first.estatus || 'Activo');
            setFieldValue('editStudentPromotion', first.promocion);
            setFieldValue('editStudentPaymentMethod', first.forma_pago);
            setFieldValue('editStudentDomiciled', first.domiciliado ? 'Si' : 'No');
            setFieldValue('editStudentDomiciliedName', first.titular_domicilado);

            toggleDomiciliadoName();

            const modal = new bootstrap.Modal(modalElement);
            modal.show();
            return;
        }

        // ========== ALUMNO SIMPLE: flujo original ==========
        editStudentSimple(modalElement, student);

    } catch (error) {
        console.error('❌ Error editando alumno:', error);
        showAlert('error', 'Error al abrir modal de edicion');
    }
}

/**
 * Cargar modal simple (alumno con una sola clase)
 */
function editStudentSimple(modalElement, student) {
    // Crear contenido del modal si esta vacio o reemplazar
    const modalHTML = createEditStudentModalHTML();
    modalElement.innerHTML = modalHTML;

    // Poblar select de maestros
    const teacherSelect = document.getElementById('editStudentTeacher');
    if (teacherSelect) {
        teacherSelect.innerHTML = `
            <option value="">Sin asignar</option>
            <option value="1">Hugo Vazquez</option>
            <option value="2">Julio Olvera</option>
            <option value="3">Demian Andrade</option>
            <option value="4">Irwin Hernandez</option>
            <option value="5">Nahomy Perez</option>
            <option value="6">Luis Blanquet</option>
            <option value="7">Manuel Reyes</option>
            <option value="8">Harim Lopez</option>
        `;
    }

    const setFieldValue = (fieldId, value) => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = (value !== null && value !== undefined) ? value : '';
        } else {
            console.warn(`⚠️ Campo ${fieldId} no encontrado`);
        }
    };

    setFieldValue('editStudentId', student.id);
    setFieldValue('editStudentName', student.nombre);
    setFieldValue('editStudentAge', student.edad);
    setFieldValue('editStudentPhone', student.telefono);
    setFieldValue('editStudentEmail', student.email);

    let fechaInscripcion = '';
    if (student.fecha_inscripcion) {
        try {
            const parts = String(student.fecha_inscripcion).split('T')[0].split('-');
            if (parts.length === 3) {
                fechaInscripcion = `${parts[0]}-${parts[1]}-${parts[2]}`;
            }
        } catch (e) {
            console.warn('Error parseando fecha de inscripcion:', e);
        }
    }
    setFieldValue('editStudentEnrollmentDate', fechaInscripcion);
    setFieldValue('editStudentInstrument', student.clase);
    const maestroId = getMaestroIdByName(student.maestro || student.maestro_id);
    setFieldValue('editStudentTeacher', maestroId);
    // Limpiar prefijo de clase del horario
    let horarioLimpio = student.horario || '';
    if (student.clase && horarioLimpio.startsWith(student.clase + ': ')) {
        horarioLimpio = horarioLimpio.substring(student.clase.length + 2);
    }
    setFieldValue('editStudentSchedule', horarioLimpio);
    setFieldValue('editStudentClassType', student.tipo_clase || 'Individual');
    setFieldValue('editStudentStatus', student.estatus || 'Activo');
    setFieldValue('editStudentPromotion', student.promocion);
    setFieldValue('editStudentMonthlyFee', student.precio_mensual);
    setFieldValue('editStudentPaymentMethod', student.forma_pago);
    setFieldValue('editStudentDomiciled', student.domiciliado ? 'Si' : 'No');
    setFieldValue('editStudentDomiciliedName', student.titular_domicilado);

    toggleDomiciliadoName();

    // ============================================================
    // LÓGICA DE REACTIVACIÓN: Limpiar horario si pasa de Baja a Activo
    // ============================================================
    const statusSelect = document.getElementById('editStudentStatus');
    if (statusSelect) {
        // Guardar estado inicial
        statusSelect.setAttribute('data-initial', student.estatus || 'Activo');
        
        statusSelect.onchange = function() {
            const initialStatus = this.getAttribute('data-initial');
            // Si estaba en Baja y se cambia a Activo -> Limpiar horario para obligar a reasignar
            if (initialStatus === 'Baja' && this.value === 'Activo') {
                const scheduleInput = document.getElementById('editStudentSchedule');
                if (scheduleInput) scheduleInput.value = '';
            }
        };
    }

    const modal = new bootstrap.Modal(modalElement);
    modal.show();
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
                                    <tr><td><strong>Clase(s):</strong></td><td>${student.clase || 'No especificado'}${student.num_clases > 1 ? ` <span class="badge bg-info">${student.num_clases}</span>` : ''}</td></tr>
                                    <tr><td><strong>Maestro(s):</strong></td><td>${student.maestro || 'Sin asignar'}</td></tr>
                                    <tr><td><strong>Horario(s):</strong></td><td>${student.horario || 'Sin definir'}</td></tr>
                                    <tr><td><strong>Fecha de Inscripción:</strong></td><td>${student.fecha_inscripcion ? formatDate(student.fecha_inscripcion) : 'No registrada'}</td></tr>
                                    <tr><td><strong>Tipo de Clase:</strong></td><td>${student.tipo_clase || 'No especificado'}</td></tr>
                                </table>
                            </div>
                        </div>
                         <!-- ⭐⭐⭐ AGREGAR AQUÍ ⭐⭐⭐ -->
                        <hr style="border-color: rgba(255,255,255,0.1); margin: 20px 0;">
                        <div id="studentPaymentHistory" class="mt-3">
                            <h6 class="text-white">
                                <i class="fas fa-chart-line me-2"></i>Historial de Pagos
                            </h6>
                            <div class="text-center py-3">
                                <i class="fas fa-spinner fa-spin"></i> Cargando historial...
                            </div>
                        </div>
                        <!-- FIN -->
                        <hr>
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="text-white"><i class="fas fa-dollar-sign me-2"></i>Información de Pagos</h6>
                                <table class="table table-dark table-sm">
                                    <tr><td><strong>Mensualidad:</strong></td><td>${formatCurrency(parseFloat(student.precio_mensual) || 0)}</td></tr>
                                    <tr><td><strong>Forma de Pago:</strong></td><td>${student.forma_pago || 'No especificada'}</td></tr>
                                    <tr><td><strong>Último Pago:</strong></td><td>${student.fecha_ultimo_pago ? formatDate(student.fecha_ultimo_pago) : 'Sin registro'}</td></tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <!-- ESPACIO PARA GRÁFICA FUTURA -->
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

        // Cargar historial de pagos
        setTimeout(() => {
            showPaymentHistory(student.id, student.nombre);
        }, 300);
        
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
    const domicilied = document.getElementById('editStudentDomiciled');
    const nameField = document.getElementById('editStudentDomiciliedName');
    
    // ✅ VALIDAR QUE LOS CAMPOS EXISTAN
    if (!domicilied || !nameField) {
        console.warn('⚠️ Campos de domiciliado no encontrados en modal de edición');
        return;
    }
    
    if (domicilied.value === 'Si') {
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

        const result = await window.apiFetch(`alumnos/${studentId}`, {
            method: 'DELETE'
        });

        if (result.success) {
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editStudentModal'));
            if (editModal) editModal.hide();

            showAlert('success', `Alumno "${studentName}" eliminado exitosamente`);
            await loadStudentsList(currentStudentsPage);

            console.log(`✅ Alumno eliminado: ${studentName}`);
        } else {
            throw new Error(result.error || result.message || 'Error eliminando alumno');
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
        
        // Poblar filtros con datos hardcodeados como en el original
        const teacherSelect = document.getElementById('teacherFilter');
        if (teacherSelect) {
            teacherSelect.innerHTML = `
                <option value="">👨‍🏫 Todos los Maestros</option>
                <option value="Hugo Vazquez">🎸 Hugo Vazquez</option>
                <option value="Julio Olvera">🥁 Julio Olvera</option>
                <option value="Demian Andrade">🥁 Demian Andrade</option>
                <option value="Irwin Hernandez">🎸 Irwin Hernandez</option>
                <option value="Nahomy Perez">🎤 Nahomy Perez</option>
                <option value="Luis Blanquet">🎸 Luis Blanquet</option>
                <option value="Manuel Reyes">🎹 Manuel Reyes</option>
                <option value="Harim Lopez">🎹 Harim Lopez</option>
            `;
        }
        
        const instrumentSelect = document.getElementById('instrumentFilter');
        if (instrumentSelect) {
            instrumentSelect.innerHTML = `
                <option value="">🎵 Todos</option>
                <option value="Guitarra">🎸 Guitarra</option>
                <option value="Teclado">🎹 Teclado</option>
                <option value="Batería">🥁 Batería</option>
                <option value="Bajo">🎸 Bajo</option>
                <option value="Canto">🎤 Canto</option>
            `;
        }
        
        console.log('✅ Módulo de alumnos inicializado');
    } catch (error) {
        console.error('❌ Error inicializando módulo de alumnos:', error);
    }
}

// ============================================================
// 🔗 FUNCIONES FALTANTES LLAMADAS DESDE HTML
// ============================================================

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
                total_alumnos: parseInt(clase.activos) || 0,
                percentage: parseInt(clase.total_alumnos) > 0 ?
                    Math.round((parseInt(clase.activos) / parseInt(clase.total_alumnos)) * 100) : 0
            }));
            totalStudents = distributionData.reduce((sum, clase) => sum + (parseInt(clase.activos) || 0), 0);
            break;
        case 'inactive':
            filteredClasses = distributionData.map(clase => ({
                ...clase,
                total_alumnos: parseInt(clase.inactivos || clase.bajas) || 0,
                percentage: parseInt(clase.total_alumnos) > 0 ?
                    Math.round((parseInt(clase.inactivos || clase.bajas || 0) / parseInt(clase.total_alumnos)) * 100) : 0
            }));
            totalStudents = distributionData.reduce((sum, clase) => sum + (parseInt(clase.inactivos || clase.bajas) || 0), 0);
            break;
        default: // 'all'
            filteredClasses = distributionData.map(clase => ({
                ...clase,
                percentage: parseInt(clase.total_alumnos) > 0 ?
                    Math.round((parseInt(clase.activos) / parseInt(clase.total_alumnos)) * 100) : 0
            }));
            totalStudents = distributionData.reduce((sum, clase) => sum + (parseInt(clase.total_alumnos) || 0), 0);
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
        tipoClaseFilter: '',
        paymentFilter: ''
    };
    
    // Actualizar selects en UI
    const statusSelect = document.getElementById('statusFilter');
    if (statusSelect) {
        statusSelect.value = currentStudentFilters.statusFilter;
    }
    const tipoClaseSelect = document.getElementById('tipoClaseFilter');
    if (tipoClaseSelect) {
        tipoClaseSelect.value = '';
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
 * Obtener icono para cada clase
 */
function getClassIcon(className) {
    const icons = {
        'Guitarra': 'fas fa-guitar',
        'Teclado': 'fas fa-keyboard',
        'Batería': 'fas fa-drum',
        'Bajo': 'fas fa-guitar',
        'Canto': 'fas fa-microphone',
        'Piano': 'fas fa-piano'
    };
    return icons[className] || 'fas fa-music';
}

/**
 * Actualizar distribución de clases - HOMOLOGADO CON REFERENCIA
 */
function updateClassDistributionOriginal(classes) {
    const container = document.getElementById('classDistribution');
    
    if (!container) {
        console.warn('⚠️ Contenedor classDistribution no encontrado');
        return;
    }
    
    if (!classes || classes.length === 0) {
        const fallbackData = window.classDistributionData || window.storedClassDistribution || classDistributionData;
        
        if (fallbackData && fallbackData.length > 0) {
            classes = fallbackData;
            console.log('✅ Usando datos almacenados para distribución inicial');
        } else {
            container.innerHTML = `
                <div class="text-center text-muted py-3">
                    <i class="fas fa-music fa-2x mb-2"></i>
                    <p class="mb-0">Cargando distribución de clases...</p>
                </div>
            `;
            return;
        }
    }
    
    const totalStudents = classes.reduce((sum, clase) => sum + (parseInt(clase.total_alumnos) || 0), 0);
    
    // Función helper para obtener color del badge
    const getClassColor = (clase) => {
        const colors = {
            'Guitarra': 'danger',
            'Teclado': 'success', 
            'Piano': 'success',
            'Batería': 'warning', 
            'Bajo': 'info', 
            'Canto': 'secondary'
        };
        return colors[clase] || 'primary';
    };
    
    // Función helper para obtener emoji
    const getClassEmoji = (clase) => {
        const emojis = {
            'Guitarra': '🎸', 
            'Teclado': '🎹',
            'Piano': '🎹',
            'Batería': '🥁', 
            'Bajo': '🎸', 
            'Canto': '🎤'
        };
        return emojis[clase] || '🎵';
    };
    
    const clasesHTML = classes.map(clase => {
        const count = clase.total_alumnos || 0;
        const percentage = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
        const color = getClassColor(clase.clase);
        const emoji = getClassEmoji(clase.clase);
        
        if (count === 0) return ''; // No mostrar clases sin alumnos
        
        // Determinar información secundaria según filtro activo
        let secondaryInfo = '';
        if (clase.activos === 0 && clase.inactivos > 0) {
            // Solo bajas
            secondaryInfo = `${clase.inactivos} bajas | ${percentage}%`;
        } else if (clase.inactivos === 0 && clase.activos > 0) {
            // Solo activos
            secondaryInfo = `${clase.activos} activos | ${percentage}%`;
        } else {
            // Vista completa
            secondaryInfo = `${clase.activos || 0} activos, ${clase.inactivos || clase.bajas || 0} bajas | ${percentage}%`;
        }
        
        return `
            <div class="class-item d-flex justify-content-between align-items-center mb-3 p-3 rounded" 
                style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s ease; cursor: pointer;"
                onmouseover="this.style.background='rgba(255,255,255,0.08)'; this.style.borderColor='rgba(255,255,255,0.2)';"
                onmouseout="this.style.background='rgba(255,255,255,0.03)'; this.style.borderColor='rgba(255,255,255,0.1)';">
                <div class="class-info d-flex align-items-center">
                    <span class="badge bg-${color} me-3 fs-6" style="padding: 8px 10px;">${emoji}</span>
                    <div>
                        <strong style="color: #E4E6EA; font-size: 1.1em;">${clase.clase}</strong>
                        <div>
                            <small style="color: #C8CCD0; font-weight: 500;">(${count} total inscritos)</small>
                        </div>
                    </div>
                </div>
                <div class="class-stats text-end">
                    <div style="color: #E4E6EA; font-weight: 600; font-size: 1.05em; margin-bottom: 2px;">
                        ${count}
                    </div>
                    <small style="color: #C8CCD0; font-weight: 500;">
                        ${secondaryInfo}
                    </small>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = clasesHTML || '<div class="text-center text-muted">Sin datos para mostrar</div>';
    
    console.log('✅ Distribución de clases actualizada (homologada con referencia)');
}

/**
 * Renderizar tabla de transacciones
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
    
    tableBody.innerHTML = transactions.map(transaction => {
        // 🔥 PARSEAR VALORES CORRECTAMENTE
        const total = parseFloat(transaction.total) || 
                     (parseFloat(transaction.cantidad) * parseFloat(transaction.precio_unitario)) || 0;
        
        // Debug: Ver valores originales
        if (total === 0) {
            console.warn('⚠️ Total en 0:', {
                id: transaction.id,
                concepto: transaction.concepto,
                total_original: transaction.total,
                cantidad: transaction.cantidad,
                precio_unitario: transaction.precio_unitario
            });
        }
        
        return `
            <tr>
                <td>${formatDate(transaction.fecha)}</td>
                <td>${transaction.concepto}</td>
                <td>${transaction.socio}</td>
                <td>${transaction.nombre_empresa || 'N/A'}</td>
                <td>
                    <span class="badge ${transaction.tipo === 'I' ? 'bg-success' : 'bg-danger'}">
                        <i class="fas ${transaction.tipo === 'I' ? 'fa-arrow-up' : 'fa-arrow-down'} me-1"></i>
                        ${transaction.tipo === 'I' ? 'Ingreso' : 'Gasto'}
                    </span>
                </td>
                <td class="${transaction.tipo === 'I' ? 'text-success' : 'text-danger'}">
                    <strong>${formatCurrency(total)}</strong>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editTransaction(${transaction.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteTransactionFromList(${transaction.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Cargar historial de pagos (función del original)
 */
async function loadPaymentHistory(studentId, studentName) {
    try {
        console.log(`📊 Cargando historial de pagos para alumno ${studentId}`);
        
        document.getElementById('chartLoadingState').style.display = 'block';
        
        // Obtener datos reales del backend
        const data = await window.apiFetch(`alumnos/${encodeURIComponent(studentName)}/historial-pagos?meses=12`, {
            method: 'GET'
        });
        
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

/**
 * Mostrar historial de pagos real en el modal de detalle
 * v3.4.0: Muestra transacciones individuales con link a modal de detalle
 */
async function showPaymentHistory(studentId, studentName) {
    try {
        console.log(`📊 Cargando historial COMPLETO de pagos para: ${studentName}`);

        const historyContainer = document.getElementById('studentPaymentHistory');
        if (!historyContainer) {
            console.warn('⚠️ Contenedor de historial no encontrado');
            return;
        }

        // Mostrar estado de carga
        historyContainer.innerHTML = `
            <h6 class="text-white">
                <i class="fas fa-chart-line me-2"></i>Historial Completo de Pagos
            </h6>
            <div class="text-center py-3">
                <i class="fas fa-spinner fa-spin"></i> Cargando historial completo...
            </div>
        `;

        // ✅ CRÍTICO: Sin parámetro meses para obtener TODO
        const data = await window.apiFetch(`alumnos/${encodeURIComponent(studentName)}/historial-pagos`, {
            method: 'GET'
        });

        console.log('📥 Datos recibidos del backend:', data);

        if (data.success && data.data) {
            const pagos = Array.isArray(data.data) ? data.data : [];

            // Calcular totales
            let totalPagado = 0;
            pagos.forEach(pago => {
                totalPagado += parseFloat(pago.total) || 0;
            });

            let html = `
                <h6 class="text-white">
                    <i class="fas fa-chart-line me-2"></i>Historial Completo de Pagos
                </h6>
            `;

            console.log('💰 Total pagado:', totalPagado, 'Transacciones:', pagos.length);

            if (pagos.length > 0) {
                html += '<div class="table-responsive" style="max-height: 300px; overflow-y: auto;">';
                html += '<table class="table table-dark table-sm table-striped table-hover">';
                html += '<thead class="sticky-top" style="background: #191C24;"><tr><th>Fecha</th><th>Concepto</th><th class="text-end">Monto</th><th></th></tr></thead>';
                html += '<tbody>';

                // Ordenar del más reciente al más antiguo
                pagos.sort((a, b) => {
                    const fechaA = new Date(a.fecha);
                    const fechaB = new Date(b.fecha);
                    return fechaB - fechaA;
                });

                pagos.forEach(pago => {
                    // Formatear fecha (parseo local para evitar desfase UTC)
                    const partesFecha = String(pago.fecha).split('T')[0].split('-');
                    const fechaObj = new Date(parseInt(partesFecha[0]), parseInt(partesFecha[1]) - 1, parseInt(partesFecha[2]));
                    const fechaFormateada = fechaObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

                    const montoNum = parseFloat(pago.total) || 0;
                    const conceptoCorto = (pago.concepto || 'Sin concepto').length > 25
                        ? (pago.concepto || 'Sin concepto').substring(0, 25) + '...'
                        : (pago.concepto || 'Sin concepto');

                    html += `
                        <tr>
                            <td class="text-nowrap">${fechaFormateada}</td>
                            <td title="${pago.concepto || 'Sin concepto'}">${conceptoCorto}</td>
                            <td class="text-end text-success text-nowrap">
                                <strong>${formatCurrency(montoNum)}</strong>
                            </td>
                            <td class="text-center">
                                <a href="javascript:void(0)" onclick="viewPaymentTransactionDetail(${pago.id})"
                                   class="text-info" title="Ver detalle de transacción">
                                    <i class="fas fa-eye"></i>
                                </a>
                            </td>
                        </tr>
                    `;
                });

                html += '</tbody></table></div>';

                // Resumen total
                html += `
                    <div class="alert alert-success mt-3 mb-0">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <i class="fas fa-check-circle me-2"></i>
                                <strong>Total Pagado:</strong> ${formatCurrency(totalPagado)}
                            </div>
                            <div class="text-end">
                                <small class="text-muted">${pagos.length} transacciones</small>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        No se encontraron pagos registrados para este alumno
                    </div>
                `;
            }

            historyContainer.innerHTML = html;

        } else {
            throw new Error(data.message || 'Error al obtener historial');
        }

    } catch (error) {
        console.error('❌ Error cargando historial:', error);
        const historyContainer = document.getElementById('studentPaymentHistory');
        if (historyContainer) {
            historyContainer.innerHTML = `
                <h6 class="text-white">
                    <i class="fas fa-chart-line me-2"></i>Historial de Pagos
                </h6>
                <div class="alert alert-danger">
                    <i class="fas fa-times-circle me-2"></i>
                    Error al cargar el historial: ${error.message}
                </div>
            `;
        }
    }
}

/**
 * Ver detalle de una transacción de pago desde el historial
 * Carga la transacción desde la API y muestra modal de solo lectura
 */
async function viewPaymentTransactionDetail(transactionId) {
    try {
        console.log(`👁️ Viendo detalle de transacción de pago ID: ${transactionId}`);

        // Cargar transacción desde API
        const response = await window.apiGet(`transacciones/${transactionId}`);

        if (!response.success || !response.data) {
            throw new Error('Transacción no encontrada');
        }

        const transaction = response.data;

        // Crear modal de solo lectura
        const modalDiv = document.createElement('div');
        modalDiv.className = 'modal fade';
        modalDiv.tabIndex = -1;
        modalDiv.id = 'paymentTransactionDetailModal';

        const formattedDate = transaction.fecha ? formatDate(transaction.fecha) : 'Sin fecha';
        const formattedTotal = formatCurrency(parseFloat(transaction.total) || 0);
        const transactionType = transaction.tipo === 'I' ? 'Ingreso' : 'Gasto';
        const typeClass = transaction.tipo === 'I' ? 'success' : 'danger';
        const empresaName = transaction.empresa_id == 1 ? 'Rockstar Skull' : 'Symbiot Technologies';

        modalDiv.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-receipt me-2"></i>
                            Detalle de Transacción
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
                                    <tr>
                                        <td><strong>Socio/Cliente:</strong></td>
                                        <td>${transaction.socio || 'No especificado'}</td>
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
                                        <td>${formatCurrency(parseFloat(transaction.precio_unitario) || 0)}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Total:</strong></td>
                                        <td class="text-${typeClass}"><strong>${formattedTotal}</strong></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Forma de Pago:</strong></td>
                                        <td>${transaction.forma_pago || 'No especificada'}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-12">
                                <h6><i class="fas fa-file-alt me-2"></i>Concepto</h6>
                                <div class="p-3 bg-dark rounded">
                                    ${transaction.concepto || 'Sin concepto especificado'}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Agregar modal al DOM
        document.body.appendChild(modalDiv);

        // Mostrar modal
        const modalInstance = new bootstrap.Modal(modalDiv);
        modalInstance.show();

        // Remover modal del DOM cuando se cierre
        modalDiv.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modalDiv);
        });

        console.log('✅ Modal de detalle de pago mostrado');

    } catch (error) {
        console.error('❌ Error mostrando detalle de transacción:', error);
        showAlert('danger', 'Error cargando detalle de la transacción');
    }
}

/**
 * Sincronizar horario con Google Calendar
 * @param {number|null} index - Índice para alumnos con múltiples clases (null para simple)
 */
async function syncStudentSchedule(index = null) {
    let studentId, inputId;
    
    if (index !== null) {
        studentId = document.getElementById(`editStudentClassId_${index}`).value;
        inputId = `editStudentSchedule_${index}`;
    } else {
        studentId = document.getElementById('editStudentId').value;
        inputId = 'editStudentSchedule';
    }
    
    const input = document.getElementById(inputId);
    const btn = input.nextElementSibling; // El botón está justo después del input
    const originalIcon = btn.innerHTML;
    
    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        const response = await window.apiGet(`alumnos/${studentId}/horario-calendar`);
        
        if (response.success && response.data) {
            if (response.data.horario && !response.data.horario.startsWith('Error:')) {
                input.value = response.data.horario;
                showAlert('success', 'Horario sincronizado con Google Calendar');
            } else {
                showAlert('warning', response.data.horario || 'No se encontraron eventos coincidentes en el calendario');
            }
        } else {
            throw new Error(response.message || 'Error al sincronizar');
        }
        
    } catch (error) {
        console.error('Error syncing schedule:', error);
        showAlert('danger', 'No se pudo sincronizar: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalIcon;
    }
}

// ============================================================
// 🔗 EXPOSICIÓN DE FUNCIONES GLOBALES
// ============================================================

// Funciones principales de gestión de alumnos
window.applyStudentsWidgetPermissions = applyStudentsWidgetPermissions;
window.loadStudentsList = loadStudentsList;
window.saveNewStudent = saveNewStudent;
window.saveStudentChanges = saveStudentChanges;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.viewStudentDetail = viewStudentDetail;
window.initializeStudentsModule = initializeStudentsModule;

// Funciones de modales y formularios
window.showAddStudentModal = showAddStudentModal;
window.toggleNewStudentDomiciliadoName = toggleNewStudentDomiciliadoName;
window.toggleDomiciliadoName = toggleDomiciliadoName;

// Funciones de filtros y búsqueda
window.filterStudents = filterStudents;
window.filterStudentsByStatus = filterStudentsByStatus;

// Funciones de acciones adicionales
window.refreshStudentsList = refreshStudentsList;
window.exportStudentsList = exportStudentsList;

// Funciones de visualización y reportes
window.loadPaymentHistory = loadPaymentHistory;
window.showPaymentHistory = showPaymentHistory;
window.viewPaymentTransactionDetail = viewPaymentTransactionDetail;
window.renderTransactionsTable = renderTransactionsTable;
window.syncStudentSchedule = syncStudentSchedule;

// Exponer funciones globalmente
window.createEditStudentModalHTML = createEditStudentModalHTML;
window.createAddStudentModalHTML = createAddStudentModalHTML;

// ✅ AÑADIR esta línea en la sección de exposición de funciones
window.getPaymentStatus = getPaymentStatus;

// Funciones del widget de alumnos (homologadas con original)
window.updateStatusIndicators = updateStatusIndicators;
window.updateClassDistributionOriginal = updateClassDistributionOriginal;
window.setClassDistributionDataOriginal = function(data) {
    window.classDistributionData = data || [];
    classDistributionData = window.classDistributionData;
    console.log('💾 classDistributionData sincronizada:', classDistributionData.length, 'clases');
};

console.log('✅ Dashboard Students Module cargado - Todas las funciones disponibles');