/* ====================================================
   PAGOS INIT - Corte de Pagos a Maestros RockstarSkull
   Archivo: gastos/js/pagos-init.js v1.0.0
   Script autocontenido para la pagina pagos.html
   ==================================================== */

// ============================================================
// CONSTANTES DE NEGOCIO
// ============================================================

const TARIFA_INDIVIDUAL = 700;
const TARIFA_GRUPAL = 400;
const TARIFA_MUESTRA = 80;
const BONO_IRWIN_ID = 4; // maestro_id de Irwin Hernandez
const BONO_IRWIN_MONTO = 600;
const PRECIO_DOBLE_CLASE = 2550; // Precio que indica doble clase del mismo instrumento

// ============================================================
// FUNCIONES DE ESTADO DE PAGO (misma logica de maestros-init.js)
// ============================================================

function parseLocalDate(dateStr) {
    if (!dateStr) return null;
    const parts = String(dateStr).split('-');
    if (parts.length !== 3) return new Date(dateStr);
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
}

function getPaymentStatusHomologado(student) {
    try {
        if (student.estatus === 'Baja') return 'inactive';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const fechaInscripcion = parseLocalDate(student.fecha_inscripcion);
        const diaCorte = fechaInscripcion.getDate();

        let fechaCorteActual = new Date(today.getFullYear(), today.getMonth(), diaCorte);
        fechaCorteActual.setHours(0, 0, 0, 0);

        if (fechaCorteActual.getDate() !== diaCorte) {
            fechaCorteActual = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            fechaCorteActual.setHours(0, 0, 0, 0);
        }

        const inicioPeriodoPago = new Date(fechaCorteActual);
        inicioPeriodoPago.setDate(inicioPeriodoPago.getDate() - 3);

        const finPeriodoGracia = new Date(fechaCorteActual);
        finPeriodoGracia.setDate(finPeriodoGracia.getDate() + 5);

        const enPeriodoPago = today >= inicioPeriodoPago && today <= finPeriodoGracia;

        const fechaUltimoPago = parseLocalDate(student.fecha_ultimo_pago);

        const pagoEsteMes = fechaUltimoPago &&
            fechaUltimoPago.getMonth() === today.getMonth() &&
            fechaUltimoPago.getFullYear() === today.getFullYear();

        const pagoMesAnterior = fechaUltimoPago &&
            fechaUltimoPago.getMonth() === (today.getMonth() - 1 + 12) % 12 &&
            (fechaUltimoPago.getFullYear() === today.getFullYear() ||
             (today.getMonth() === 0 && fechaUltimoPago.getFullYear() === today.getFullYear() - 1));

        if (pagoEsteMes) return 'current';
        if (!pagoMesAnterior) return 'overdue';
        if (pagoMesAnterior && enPeriodoPago) return 'upcoming';
        if (pagoMesAnterior && today > finPeriodoGracia) return 'overdue';
        if (pagoMesAnterior && today < inicioPeriodoPago) return 'current';

        return 'current';

    } catch (error) {
        console.error('Error calculando estado para ' + student.nombre + ':', error);
        return 'current';
    }
}

// ============================================================
// DETECCION DE DOBLE CLASE (mismo instrumento, 2 horarios)
// ============================================================

/**
 * Devuelve cuántos slots de clase por semana representa una inscripción.
 *
 * Criterio 1 (precio): precio_mensual == $2,550 → 2 slots (ej: Diego Grajeda 2×$1,275).
 * Criterio 2 (horario): cuenta días únicos en el campo horario.
 *   "17:00 a 18:00 Lun y 16:00 a 17:00 Mar" → 2 días → multiplier 2 → maestro cobra ×2
 *   "Lun, Mie y Vie 17:00"                  → 3 días → multiplier 3 → maestro cobra ×3
 * Las filas de multi-instrumento (Joshua) tienen 1 día c/u → multiplier 1 por fila, sin falso positivo.
 *
 * Retorna el número de sesiones semanales (mínimo 1).
 */
function getClassMultiplier(student) {
    // Criterio 1: precio exacto $2,550
    var precio = parseFloat(student.precio_mensual) || 0;
    if (precio === PRECIO_DOBLE_CLASE) return 2;

    // Criterio 2: contar días distintos en el horario
    var horario = (student.horario || '').trim();
    if (horario) {
        var dias = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
        var encontrados = dias.filter(function(d) { return horario.indexOf(d) !== -1; });
        if (encontrados.length >= 2) return encontrados.length;
    }

    return 1;
}

/**
 * Alias semántico para la tabla informativa (2+ Clases/Horarios).
 * Reutiliza getClassMultiplier para mantener consistencia con el corte de pagos.
 */
function hasMultipleSessionsPerWeek(student) {
    return getClassMultiplier(student) >= 2;
}

// ============================================================
// INICIALIZACION
// ============================================================

document.addEventListener('DOMContentLoaded', initPagosPage);

async function initPagosPage() {
    console.log('💰 Inicializando pagina de corte de pagos...');

    try {
        // 1. Verificar autenticacion
        const authResult = await window.apiGet('user');

        if (!authResult.success || !authResult.user) {
            console.log('❌ No autenticado, redirigiendo a login...');
            window.location.href = 'login.html';
            return;
        }

        const user = authResult.user;
        console.log('✅ Usuario autenticado: ' + user.nombre);

        localStorage.setItem('user_data', JSON.stringify(user));

        // 2. Actualizar UI
        const userNameEl = document.getElementById('userName');
        if (userNameEl) userNameEl.textContent = user.nombre;

        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay) userNameDisplay.textContent = user.nombre;

        const currentDateEl = document.getElementById('currentDate');
        if (currentDateEl) {
            currentDateEl.textContent = new Date().toLocaleDateString('es-ES', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        }

        // 3. Cargar datos
        await loadPagosData();

    } catch (error) {
        console.error('❌ Error inicializando pagos:', error);
        document.getElementById('pageLoading').innerHTML =
            '<i class="fas fa-exclamation-triangle fa-3x text-danger"></i>' +
            '<p class="mt-3 text-danger">Error cargando datos. Intenta recargar la pagina.</p>';
    }
}

// ============================================================
// CARGA DE DATOS
// ============================================================

async function loadPagosData() {
    console.log('📚 Cargando alumnos activos...');

    // Cargar todos los alumnos activos SIN unificar (para ver cada inscripcion individual)
    const result = await window.apiGet('alumnos', {
        empresa_id: 1,
        estatus: 'Activo',
        unificar: '0',
        limit: 1000
    });

    document.getElementById('pageLoading').style.display = 'none';

    if (!result.success || !result.data || result.data.length === 0) {
        document.getElementById('pageContent').style.display = 'block';
        console.log('⚠️ No se encontraron alumnos activos');
        return;
    }

    const allStudents = result.data;
    console.log('✅ ' + allStudents.length + ' inscripciones cargadas');

    // Calcular estado de pago y multiplicador para cada alumno
    allStudents.forEach(function(s) {
        s._paymentStatus = getPaymentStatusHomologado(s);
        s._classMultiplier = getClassMultiplier(s);
    });

    // Mostrar contenido
    document.getElementById('pageContent').style.display = 'block';

    // Renderizar widgets
    renderTeacherStats(allStudents);
    renderMultiClassStudents(allStudents);
    renderOverdueByTeacher(allStudents);
    renderCorteTable(allStudents);
}

// ============================================================
// WIDGET 1: ALUMNOS POR MAESTRO (stat cards)
// ============================================================

// Iconos y colores por maestro
var TEACHER_ICONS = {
    'Hugo Vazquez':      { icon: 'fa-guitar',     color: 'text-danger' },
    'Irwin Hernandez':   { icon: 'fa-guitar',     color: 'text-warning' },
    'Luis Blanquet':     { icon: 'fa-guitar',     color: 'text-info' },
    'Julio Olvera':      { icon: 'fa-drum',       color: 'text-success' },
    'Demian Andrade':    { icon: 'fa-drum',       color: 'text-primary' },
    'Nahomy Perez':      { icon: 'fa-microphone', color: 'text-danger' },
    'Manuel Reyes':      { icon: 'fa-music',      color: 'text-warning' },
    'Harim Lopez':       { icon: 'fa-music',      color: 'text-info' }
};

function renderTeacherStats(students) {
    var teacherMap = {};

    students.forEach(function(s) {
        var key = s.maestro || 'Sin maestro';
        if (!teacherMap[key]) {
            teacherMap[key] = { nombre: key, count: 0 };
        }
        teacherMap[key].count++;
    });

    var teachers = Object.values(teacherMap).sort(function(a, b) {
        return b.count - a.count;
    });

    var defaultColors = ['text-info', 'text-success', 'text-warning', 'text-danger', 'text-primary'];

    var html = teachers.map(function(t, i) {
        var config = TEACHER_ICONS[t.nombre];
        var color = config ? config.color : defaultColors[i % defaultColors.length];
        var icon = config ? config.icon : 'fa-user';
        return '<div class="col-sm-6 col-xl-3 mb-3">' +
            '<div class="card stat-card h-100">' +
                '<div class="card-body d-flex align-items-center">' +
                    '<i class="fas ' + icon + ' stat-icon ' + color + ' me-3" style="font-size: 1.8rem;"></i>' +
                    '<div>' +
                        '<h6 class="card-title mb-1">' + t.nombre + '</h6>' +
                        '<h4 class="' + color + ' mb-0">' + t.count + ' <small class="text-muted" style="font-size: 0.5em;">alumnos</small></h4>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');

    document.getElementById('teacherStatsRow').innerHTML = html;
}

// ============================================================
// WIDGET 2: ALUMNOS EN MULTIPLES CLASES
// ============================================================

function renderMultiClassStudents(students) {
    // Agrupar por nombre de alumno
    var studentMap = {};

    students.forEach(function(s) {
        var nombre = s.nombre;
        if (!studentMap[nombre]) {
            studentMap[nombre] = { nombre: nombre, clases: [], horarios: [], maestros: [], isDouble: false, precio: 0 };
        }
        if (s.clase && studentMap[nombre].clases.indexOf(s.clase) === -1) {
            studentMap[nombre].clases.push(s.clase);
        }
        if (s.horario && studentMap[nombre].horarios.indexOf(s.horario) === -1) {
            studentMap[nombre].horarios.push(s.horario);
        }
        var maestroName = s.maestro || 'Sin maestro';
        if (studentMap[nombre].maestros.indexOf(maestroName) === -1) {
            studentMap[nombre].maestros.push(maestroName);
        }
        // Detectar doble clase: por precio $2,550 O por horario multi-día (ej: Cano Soto)
        if (s._classMultiplier >= 2 || hasMultipleSessionsPerWeek(s)) {
            studentMap[nombre].isDouble = true;
            studentMap[nombre].precio = parseFloat(s.precio_mensual) || 0;
        }
    });

    // Filtrar: 2+ clases, 2+ horarios, o doble clase (precio $2,550 / horario 2h+)
    var multiClass = Object.values(studentMap).filter(function(s) {
        return s.clases.length >= 2 || s.horarios.length >= 2 || s.isDouble;
    }).sort(function(a, b) {
        return b.clases.length - a.clases.length;
    });

    document.getElementById('multiClassCount').textContent = multiClass.length;

    if (multiClass.length === 0) {
        document.getElementById('multiClassEmpty').style.display = 'block';
        document.getElementById('multiClassTable').style.display = 'none';
        return;
    }

    document.getElementById('multiClassEmpty').style.display = 'none';
    document.getElementById('multiClassTable').style.display = 'block';

    var html = multiClass.map(function(s) {
        var dobleTag = s.isDouble ? ' <span class="badge bg-warning">Doble clase $' + s.precio.toLocaleString('es-MX') + '</span>' : '';
        return '<tr>' +
            '<td><strong>' + s.nombre + '</strong>' + dobleTag + '</td>' +
            '<td>' + s.clases.map(function(c) { return '<span class="badge bg-primary me-1">' + c + '</span>'; }).join('') + '</td>' +
            '<td>' + s.horarios.map(function(h) { return '<span class="badge bg-secondary me-1">' + h + '</span>'; }).join('') + '</td>' +
            '<td>' + s.maestros.join(', ') + '</td>' +
        '</tr>';
    }).join('');

    document.getElementById('multiClassBody').innerHTML = html;
}

// ============================================================
// WIDGET 3: ALUMNOS PENDIENTES DE PAGO POR MAESTRO
// ============================================================

function renderOverdueByTeacher(students) {
    var overdue = students.filter(function(s) {
        return s._paymentStatus === 'overdue';
    });

    document.getElementById('overdueCount').textContent = overdue.length;

    if (overdue.length === 0) {
        document.getElementById('overdueEmpty').style.display = 'block';
        document.getElementById('overdueContent').style.display = 'none';
        return;
    }

    document.getElementById('overdueEmpty').style.display = 'none';
    document.getElementById('overdueContent').style.display = 'block';

    // Agrupar por maestro
    var byTeacher = {};
    overdue.forEach(function(s) {
        var maestro = s.maestro || 'Sin maestro';
        if (!byTeacher[maestro]) byTeacher[maestro] = [];
        byTeacher[maestro].push(s);
    });

    // Ordenar maestros por cantidad de vencidos (mayor primero)
    var sorted = Object.entries(byTeacher).sort(function(a, b) {
        return b[1].length - a[1].length;
    });

    var html = sorted.map(function(entry, idx) {
        var maestro = entry[0];
        var alumnos = entry[1];
        var collapseId = 'overdueCollapse' + idx;

        var rows = alumnos.map(function(s) {
            return '<tr>' +
                '<td>' + (s.nombre || 'Sin nombre') + '</td>' +
                '<td>' + (s.clase || '-') + '</td>' +
                '<td><span class="badge bg-' + (s.tipo_clase === 'Grupal' ? 'primary' : 'info') + '">' + (s.tipo_clase || 'Individual') + '</span></td>' +
                '<td>' + (s.horario || '-') + '</td>' +
                '<td>' + (s.fecha_ultimo_pago || '<span class="text-muted">Sin registro</span>') + '</td>' +
            '</tr>';
        }).join('');

        return '<div class="mb-3">' +
            '<div class="d-flex align-items-center mb-2" style="cursor:pointer;" data-bs-toggle="collapse" data-bs-target="#' + collapseId + '">' +
                '<i class="fas fa-chevron-right me-2 text-muted collapse-icon" id="icon' + collapseId + '"></i>' +
                '<strong class="text-white">' + maestro + '</strong>' +
                '<span class="badge bg-danger ms-2">' + alumnos.length + ' vencido' + (alumnos.length > 1 ? 's' : '') + '</span>' +
            '</div>' +
            '<div class="collapse" id="' + collapseId + '">' +
                '<div class="table-responsive">' +
                    '<table class="table table-dark table-hover table-sm mb-0">' +
                        '<thead><tr>' +
                            '<th>Alumno</th><th>Clase</th><th>Tipo</th><th>Horario</th><th>Ultimo Pago</th>' +
                        '</tr></thead>' +
                        '<tbody>' + rows + '</tbody>' +
                    '</table>' +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');

    document.getElementById('overdueContent').innerHTML = html;

    // Rotar icono al expandir/colapsar
    sorted.forEach(function(entry, idx) {
        var collapseId = 'overdueCollapse' + idx;
        var el = document.getElementById(collapseId);
        if (el) {
            el.addEventListener('shown.bs.collapse', function() {
                var icon = document.getElementById('icon' + collapseId);
                if (icon) icon.style.transform = 'rotate(90deg)';
            });
            el.addEventListener('hidden.bs.collapse', function() {
                var icon = document.getElementById('icon' + collapseId);
                if (icon) icon.style.transform = 'rotate(0deg)';
            });
        }
    });
}

// ============================================================
// WIDGET 4: TABLA DE CORTE DE PAGOS
// ============================================================

function renderCorteTable(students) {
    // Filtrar solo alumnos elegibles para corte: current o upcoming
    var eligible = students.filter(function(s) {
        return s._paymentStatus === 'current' || s._paymentStatus === 'upcoming';
    });

    console.log('📊 Alumnos elegibles para corte: ' + eligible.length + ' de ' + students.length);

    // Agrupar por maestro
    var maestroMap = {};

    eligible.forEach(function(s) {
        var maestroName = s.maestro || 'Sin maestro';
        var maestroId = parseInt(s.maestro_id) || 0;

        if (!maestroMap[maestroName]) {
            maestroMap[maestroName] = {
                nombre: maestroName,
                maestro_id: maestroId,
                grupales: 0,
                individuales: 0,
                muestra: 0
            };
        }

        var tipo = (s.tipo_clase || 'Individual').trim();
        var mult = s._classMultiplier || 1; // 2 si es doble clase

        if (tipo === 'Grupal') {
            maestroMap[maestroName].grupales += mult;
        } else if (tipo === 'Clase de muestra') {
            maestroMap[maestroName].muestra += mult;
        } else {
            maestroMap[maestroName].individuales += mult;
        }
    });

    // Ordenar por nombre
    var maestros = Object.values(maestroMap).sort(function(a, b) {
        return a.nombre.localeCompare(b.nombre);
    });

    // Calcular totales
    var totGrupales = 0, totIndividuales = 0, totMuestra = 0;
    var totSubGrupales = 0, totSubIndividuales = 0, totSubMuestra = 0;
    var totBonos = 0, totGeneral = 0;

    var html = maestros.map(function(m) {
        var subGrupales = m.grupales * TARIFA_GRUPAL;
        var subIndividuales = m.individuales * TARIFA_INDIVIDUAL;
        var subMuestra = m.muestra * TARIFA_MUESTRA;
        var bono = (m.maestro_id === BONO_IRWIN_ID) ? BONO_IRWIN_MONTO : 0;
        var total = subGrupales + subIndividuales + subMuestra + bono;

        totGrupales += m.grupales;
        totIndividuales += m.individuales;
        totMuestra += m.muestra;
        totSubGrupales += subGrupales;
        totSubIndividuales += subIndividuales;
        totSubMuestra += subMuestra;
        totBonos += bono;
        totGeneral += total;

        var bonoText = bono > 0
            ? '<span class="text-warning">$' + bono.toLocaleString('es-MX') + '</span>'
            : '-';

        return '<tr>' +
            '<td><strong>' + m.nombre + '</strong></td>' +
            '<td class="text-center">' + m.grupales + '</td>' +
            '<td class="text-center">$' + subGrupales.toLocaleString('es-MX') + '</td>' +
            '<td class="text-center">' + m.individuales + '</td>' +
            '<td class="text-center">$' + subIndividuales.toLocaleString('es-MX') + '</td>' +
            '<td class="text-center">' + m.muestra + '</td>' +
            '<td class="text-center">$' + subMuestra.toLocaleString('es-MX') + '</td>' +
            '<td class="text-center">' + bonoText + '</td>' +
            '<td class="text-center fw-bold text-success">$' + total.toLocaleString('es-MX') + '</td>' +
        '</tr>';
    }).join('');

    document.getElementById('corteTableBody').innerHTML = html;

    // Actualizar totales del footer
    document.getElementById('totalGrupales').textContent = totGrupales;
    document.getElementById('totalSubGrupales').textContent = '$' + totSubGrupales.toLocaleString('es-MX');
    document.getElementById('totalIndividuales').textContent = totIndividuales;
    document.getElementById('totalSubIndividuales').textContent = '$' + totSubIndividuales.toLocaleString('es-MX');
    document.getElementById('totalMuestra').textContent = totMuestra;
    document.getElementById('totalSubMuestra').textContent = '$' + totSubMuestra.toLocaleString('es-MX');
    document.getElementById('totalBonos').textContent = '$' + totBonos.toLocaleString('es-MX');
    document.getElementById('totalGeneral').textContent = '$' + totGeneral.toLocaleString('es-MX');
}

// ============================================================
// LOGOUT
// ============================================================

function showUserProfile() {
    alert('Mi Perfil - En construccion. Disponible proximamente.');
}

async function logout() {
    try {
        var confirmLogout = confirm('¿Estas seguro de que quieres cerrar sesion?');
        if (!confirmLogout) return;

        await window.apiPost('logout');

        localStorage.removeItem('user_data');
        localStorage.removeItem('dashboardPreferences');
        try { sessionStorage.clear(); } catch (e) { /* ignore */ }

        window.location.href = window.buildPageUrl ? window.buildPageUrl('login.html') : 'login.html';

    } catch (error) {
        console.error('❌ Error cerrando sesion:', error);
        window.location.href = 'login.html';
    }
}
