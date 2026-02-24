/* ====================================================
   MAESTROS INIT - Portal de Maestros RockstarSkull
   Archivo: gastos/js/maestros-init.js v1.0.0
   Script autocontenido para la pagina maestros.html
   ==================================================== */

// ============================================================
// MAPEO EMAIL → MAESTRO
// ============================================================

const MAESTRO_EMAIL_MAP = {
    'hvazquez@rockstarskull.com':   { id: '1', nombre: 'Hugo Vazquez' },
    'jolvera@rockstarskull.com':    { id: '2', nombre: 'Julio Olvera' },
    'dandrade@rockstarskull.com':   { id: '3', nombre: 'Demian Andrade' },
    'ihernandez@rockstarskull.com': { id: '4', nombre: 'Irwin Hernandez' },
    'nperez@rockstarskull.com':     { id: '5', nombre: 'Nahomy Perez' },
    'lblanquet@rockstarskull.com':  { id: '6', nombre: 'Luis Blanquet' },
    'mreyes@rockstarskull.com':     { id: '7', nombre: 'Manuel Reyes' },
    'hlopez@rockstarskull.com':     { id: '8', nombre: 'Harim Lopez' }
};

// ============================================================
// FUNCIONES DE ESTADO DE PAGO (copiadas de dashboard-stats.js y dashboard-students.js)
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
        console.error(`Error calculando estado para ${student.nombre}:`, error);
        return 'current';
    }
}

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

        const fechaInscripcion = parseLocalDate(student.fecha_inscripcion);
        const diaCorte = fechaInscripcion.getDate();

        let fechaCorteActual = new Date(today.getFullYear(), today.getMonth(), diaCorte);
        fechaCorteActual.setHours(0, 0, 0, 0);
        if (fechaCorteActual.getDate() !== diaCorte) {
            fechaCorteActual = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            fechaCorteActual.setHours(0, 0, 0, 0);
        }

        const fechaUltimoPago = student.fecha_ultimo_pago ? parseLocalDate(student.fecha_ultimo_pago) : null;

        const pagoEsteMes = fechaUltimoPago &&
            fechaUltimoPago.getMonth() === today.getMonth() &&
            fechaUltimoPago.getFullYear() === today.getFullYear();

        const pagoMesAnterior = fechaUltimoPago &&
            fechaUltimoPago.getMonth() === (today.getMonth() - 1 + 12) % 12 &&
            (fechaUltimoPago.getFullYear() === today.getFullYear() ||
             (today.getMonth() === 0 && fechaUltimoPago.getFullYear() === today.getFullYear() - 1));

        let nextPaymentDate;

        if (pagoEsteMes) {
            nextPaymentDate = new Date(today.getFullYear(), today.getMonth() + 1, diaCorte);
            if (nextPaymentDate.getDate() !== diaCorte) {
                nextPaymentDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
            }
        } else if (pagoMesAnterior) {
            nextPaymentDate = new Date(fechaCorteActual);
        } else if (fechaUltimoPago) {
            const mesSiguiente = new Date(fechaUltimoPago);
            mesSiguiente.setMonth(mesSiguiente.getMonth() + 1);
            nextPaymentDate = new Date(mesSiguiente.getFullYear(), mesSiguiente.getMonth(), diaCorte);
            if (nextPaymentDate.getDate() !== diaCorte) {
                nextPaymentDate = new Date(mesSiguiente.getFullYear(), mesSiguiente.getMonth() + 1, 0);
            }
        } else {
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
            return `${formattedDate} <small class="text-success">(en ${daysDiff} dias)</small>`;
        } else if (daysDiff === 0) {
            return `${formattedDate} <small class="text-warning">(HOY)</small>`;
        } else if (daysDiff > 0) {
            return `${formattedDate} <small class="text-info">(en ${daysDiff} dias)</small>`;
        } else {
            return `${formattedDate} <small class="text-danger">(hace ${Math.abs(daysDiff)} dias)</small>`;
        }
    } catch (error) {
        console.error('Error calculando proximo pago:', error);
        return '<span class="text-muted">Error</span>';
    }
}

function getPaymentStatusBadge(student) {
    const paymentStatus = getPaymentStatusHomologado(student);

    const badges = {
        'overdue': '<span class="badge bg-danger">Vencido</span>',
        'upcoming': '<span class="badge bg-warning">Proximo</span>',
        'current': '<span class="badge bg-success">Al corriente</span>',
        'inactive': '<span class="badge bg-secondary">No aplica</span>'
    };

    return badges[paymentStatus] || badges['current'];
}

// ============================================================
// GOOGLE CALENDAR THEME SYNC
// ============================================================

function updateCalendarTheme() {
    const iframe = document.getElementById('googleCalendarFrame');
    if (!iframe) return;

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const bgColor = isLight ? '%23ffffff' : '%23191C24';

    const currentSrc = iframe.src;
    const newSrc = currentSrc.replace(/bgcolor=%23[0-9a-fA-F]+/, 'bgcolor=' + bgColor);

    if (currentSrc !== newSrc) {
        iframe.src = newSrc;
    }
}

// Observar cambios de tema en <html data-theme>
const themeObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'data-theme') {
            updateCalendarTheme();
        }
    });
});
themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

// Aplicar tema inicial al calendario cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    updateCalendarTheme();
});

// ============================================================
// INICIALIZACION
// ============================================================

document.addEventListener('DOMContentLoaded', initMaestroPage);

async function initMaestroPage() {
    console.log('🎸 Inicializando portal de maestro...');

    try {
        // 1. Verificar autenticacion
        const authResult = await window.apiGet('user');

        if (!authResult.success || !authResult.user) {
            console.log('❌ No autenticado, redirigiendo a login...');
            window.location.href = 'login.html';
            return;
        }

        const user = authResult.user;
        console.log(`✅ Usuario autenticado: ${user.nombre} (${user.email})`);

        // Persistir en localStorage para consistencia
        localStorage.setItem('user_data', JSON.stringify(user));

        // 2. Identificar maestro por email
        const maestroInfo = MAESTRO_EMAIL_MAP[user.email];
        if (!maestroInfo) {
            console.error('❌ Email no corresponde a un maestro:', user.email);
            document.getElementById('studentsLoading').style.display = 'none';
            document.getElementById('studentsEmpty').style.display = 'block';
            document.getElementById('studentsEmpty').innerHTML = `
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <p class="text-warning">Tu cuenta (${user.email}) no esta asociada a un maestro.</p>
            `;
            return;
        }

        console.log(`🎓 Maestro identificado: ${maestroInfo.nombre} (ID: ${maestroInfo.id})`);

        // 3. Actualizar UI con info del maestro
        const userNameEl = document.getElementById('userName');
        if (userNameEl) userNameEl.textContent = user.nombre || maestroInfo.nombre;

        const maestroNameEl = document.getElementById('maestroName');
        if (maestroNameEl) maestroNameEl.textContent = maestroInfo.nombre;

        const currentDateEl = document.getElementById('currentDate');
        if (currentDateEl) {
            const today = new Date();
            currentDateEl.textContent = today.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // 4. Cargar alumnos del maestro (los banners 2 y 3 dependen de esta data)
        await loadMaestroStudents(maestroInfo.id);

        // Guardar el ID del maestro para el refresco automático y manual
        window._currentMaestroId = maestroInfo.id;

        // Auto-refresco cada 5 minutos para reflejar cambios de transacciones
        setInterval(async function() {
            console.log('🔄 Auto-refrescando lista de alumnos...');
            await loadMaestroStudents(window._currentMaestroId);
        }, 5 * 60 * 1000);

        // Botón de refresco manual
        var refreshBtn = document.getElementById('refreshStudentsBtn');
        var refreshIcon = document.getElementById('refreshStudentsIcon');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async function() {
                refreshIcon.classList.add('fa-spin');
                refreshBtn.disabled = true;
                await loadMaestroStudents(window._currentMaestroId);
                refreshIcon.classList.remove('fa-spin');
                refreshBtn.disabled = false;
            });
        }

        // 5. Cargar clases de hoy desde Google Calendar (independiente)
        loadClasesHoy(maestroInfo.nombre);

        // 6. Cargar espacios libres basados en horarios BD
        loadEspaciosLibres(maestroInfo.id);

    } catch (error) {
        console.error('❌ Error inicializando portal de maestro:', error);
        document.getElementById('studentsLoading').style.display = 'none';
        document.getElementById('studentsEmpty').style.display = 'block';
    }
}

// ============================================================
// CARGA DE ALUMNOS
// ============================================================

async function loadMaestroStudents(maestroId) {
    console.log(`📚 Cargando alumnos del maestro ID: ${maestroId}...`);

    try {
        const result = await window.apiGet('alumnos', {
            empresa_id: 1,
            maestro_id: maestroId,
            estatus: 'Activo',
            unificar: '0',
            limit: 1000
        });

        document.getElementById('studentsLoading').style.display = 'none';

        if (!result.success || !result.data || result.data.length === 0) {
            document.getElementById('studentsEmpty').style.display = 'block';
            document.getElementById('totalStudentsBadge').textContent = '0';
            return;
        }

        const students = result.data;
        console.log(`✅ ${students.length} alumnos cargados`);

        // Guardar instrumentos del maestro para loadEspaciosLibres
        _maestroClases = students.reduce(function(acc, s) {
            if (INSTR_CFG_ESP[s.clase] && acc.indexOf(s.clase) === -1) acc.push(s.clase);
            return acc;
        }, []);

        document.getElementById('totalStudentsBadge').textContent = students.length;
        document.getElementById('studentsTableContainer').style.display = 'block';

        renderMaestroStudentsTable(students);
        renderAlumnosStatus(students);

    } catch (error) {
        console.error('❌ Error cargando alumnos:', error);
        document.getElementById('studentsLoading').style.display = 'none';
        document.getElementById('studentsEmpty').style.display = 'block';
    }
}

// ============================================================
// RENDERIZADO DE TABLA
// ============================================================

function renderMaestroStudentsTable(students) {
    const tableBody = document.getElementById('studentsTableBody');
    if (!tableBody) return;

    // Ordenar: vencidos primero, luego proximos, luego al corriente
    const statusOrder = { 'overdue': 0, 'upcoming': 1, 'current': 2, 'inactive': 3 };
    students.sort((a, b) => {
        const sa = statusOrder[getPaymentStatusHomologado(a)] ?? 2;
        const sb = statusOrder[getPaymentStatusHomologado(b)] ?? 2;
        if (sa !== sb) return sa - sb;
        return (a.nombre || '').localeCompare(b.nombre || '');
    });

    tableBody.innerHTML = students.map(student => {
        const tipoClase = student.tipo_clase || 'Individual';
        const tipoClaseBadge = tipoClase === 'Grupal'
            ? '<span class="badge bg-primary">Grupal</span>'
            : '<span class="badge bg-info">Individual</span>';

        return `
        <tr>
            <td>
                <strong>${student.nombre || 'Sin nombre'}</strong>
                ${student.telefono ? `<br><small class="text-muted">${student.telefono}</small>` : ''}
            </td>
            <td>${student.clase || 'Sin clase'}</td>
            <td>${student.horario || '<span class="text-muted">Sin horario</span>'}</td>
            <td>${tipoClaseBadge}</td>
            <td>${getFormattedNextPaymentDate(student)}</td>
            <td>${getPaymentStatusBadge(student)}</td>
        </tr>
    `}).join('');
}

// ============================================================
// BANNER 1: MIS CLASES HOY (Google Calendar)
// ============================================================

async function loadClasesHoy(maestroNombre) {
    const loading = document.getElementById('clasesHoyLoading');
    const content = document.getElementById('clasesHoyContent');

    try {
        const result = await window.apiGet('maestros/clases-hoy', { maestro_nombre: maestroNombre });
        loading.style.display = 'none';
        content.style.display = 'block';

        const clases = (result.success && result.data) ? result.data : [];

        if (clases.length === 0) {
            content.innerHTML = `
                <div class="text-muted py-1" style="font-size:0.88em;">
                    <i class="fas fa-moon me-1"></i>Sin clases programadas para hoy.
                </div>`;
            return;
        }

        content.innerHTML = clases.map(c => `
            <div class="d-flex align-items-start py-1 border-bottom border-secondary">
                <span class="text-warning fw-bold me-2" style="min-width:95px;font-size:0.85em;">
                    ${c.hora_inicio} – ${c.hora_fin}
                </span>
                <div style="font-size:0.88em;">
                    <span class="text-info fw-bold">${c.instrumento}</span>
                    ${c.alumnos ? `<span class="text-white ms-1">· ${c.alumnos}</span>` : ''}
                </div>
            </div>
        `).join('');

    } catch (e) {
        loading.style.display = 'none';
        content.style.display = 'block';
        content.innerHTML = `<small class="text-muted"><i class="fas fa-exclamation-circle me-1"></i>Calendario no disponible.</small>`;
    }
}

// ============================================================
// BANNER 2: ESTADO DE ALUMNOS (calculado de la data ya cargada)
// ============================================================

function renderAlumnosStatus(students) {
    const loading = document.getElementById('alumnosStatusLoading');
    const content = document.getElementById('alumnosStatusContent');
    if (!loading || !content) return;

    loading.style.display = 'none';
    content.style.display = 'block';

    if (!students || students.length === 0) {
        content.innerHTML = `<small class="text-muted">Sin alumnos activos.</small>`;
        return;
    }

    let corriente = 0, proximo = 0, vencido = 0;
    students.forEach(s => {
        const st = getPaymentStatusHomologado(s);
        if (st === 'current')  corriente++;
        else if (st === 'upcoming') proximo++;
        else if (st === 'overdue')  vencido++;
    });

    content.innerHTML = `
        <div class="d-flex flex-wrap gap-3 py-1" style="font-size:0.9em;">
            <span>
                <i class="fas fa-circle text-success me-1" style="font-size:0.7em;"></i>
                <strong class="text-success">${corriente}</strong>
                <span class="text-muted ms-1">Al corriente</span>
            </span>
            <span>
                <i class="fas fa-circle text-warning me-1" style="font-size:0.7em;"></i>
                <strong class="text-warning">${proximo}</strong>
                <span class="text-muted ms-1">Próximo pago</span>
            </span>
            <span>
                <i class="fas fa-circle text-danger me-1" style="font-size:0.7em;"></i>
                <strong class="text-danger">${vencido}</strong>
                <span class="text-muted ms-1">Vencidos</span>
            </span>
        </div>`;
}

// ============================================================
// BANNER 3: ESPACIOS LIBRES HOY
// Replica la lógica de dashboard-horarios.js (mismas constantes)
// ============================================================

// Capacidades hardcodeadas idénticas a dashboard-horarios.js
var INSTR_CFG_ESP = {
    'Guitarra': { cap: 5 },
    'Batería':  { cap: 2 },
    'Canto':    { cap: 3 },
    'Bajo':     { cap: 3 },
    'Teclado':  { cap: 2 }
};

// Horario operativo: Lun-Vie 15-20, Sáb 11-16
var SCHOOL_SCHED_ESP = {
    1: { start: 15, end: 20 },
    2: { start: 15, end: 20 },
    3: { start: 15, end: 20 },
    4: { start: 15, end: 20 },
    5: { start: 15, end: 20 },
    6: { start: 11, end: 16 }
};

var _DIA_NUM_ESP = {
    lun:1, lunes:1, mar:2, martes:2,
    mie:3, miercoles:3, jue:4, jueves:4,
    vie:5, viernes:5, sab:6, sabado:6,
    dom:0, domingo:0
};

function _normDayEsp(str) {
    return str.toLowerCase()
        .replace(/á/g,'a').replace(/é/g,'e')
        .replace(/í/g,'i').replace(/ó/g,'o').replace(/ú/g,'u');
}

function _parseSlotsEsp(horarioStr) {
    if (!horarioStr) return [];
    var out = [];
    var re = /(\d{1,2}):(\d{2})\s+a\s+(\d{1,2}):(\d{2})\s+([A-Za-záéíóúÁÉÍÓÚ]+)/g;
    var m;
    while ((m = re.exec(horarioStr)) !== null) {
        var startH = parseInt(m[1]);
        var endH   = parseInt(m[3]);
        var nd     = _normDayEsp(m[5]);
        var dn     = _DIA_NUM_ESP[nd] !== undefined ? _DIA_NUM_ESP[nd] : _DIA_NUM_ESP[nd.slice(0,3)];
        if (dn === undefined) continue;
        for (var h = startH; h < endH; h++) out.push({ day: dn, hour: h });
    }
    return out;
}

// Instrumento(s) del maestro actual — se llena en loadMaestroStudents
var _maestroClases = [];

async function loadEspaciosLibres(maestroId) {
    var loading = document.getElementById('espaciosLoading');
    var content = document.getElementById('espaciosContent');

    try {
        // Cargar TODOS los alumnos activos (igual que dashboard-horarios)
        var result = await window.apiGet('alumnos', {
            empresa_id: 1,
            estatus: 'Activo',
            unificar: '0',
            limit: 1000
        });

        loading.style.display = 'none';
        content.style.display = 'block';

        var allStudents = (result.success && result.data) ? result.data : [];

        // Determinar instrumentos del maestro
        var instrToShow = _maestroClases.length > 0
            ? _maestroClases
            : allStudents
                .filter(function(s) { return String(s.maestro_id) === String(maestroId) && INSTR_CFG_ESP[s.clase]; })
                .reduce(function(acc, s) {
                    if (acc.indexOf(s.clase) === -1) acc.push(s.clase);
                    return acc;
                }, []);

        if (instrToShow.length === 0) {
            content.innerHTML = '<div class="text-muted py-1" style="font-size:0.88em;">' +
                '<i class="fas fa-info-circle me-1"></i>No se encontraron instrumentos asignados.</div>';
            return;
        }

        // Día de hoy (JS: 0=Dom, 1=Lun, ..., 6=Sáb)
        var todayNum = new Date().getDay();
        var sched = SCHOOL_SCHED_ESP[todayNum];

        if (!sched) {
            content.innerHTML = '<div class="text-muted py-1" style="font-size:0.88em;">' +
                '<i class="fas fa-moon me-1"></i>La escuela no opera hoy (domingo).</div>';
            return;
        }

        // Construir matriz de ocupación para HOY
        // slots[hour][instrumento] = { count, cap }
        var slots = {};
        allStudents.forEach(function(s) {
            if (!INSTR_CFG_ESP[s.clase]) return;
            _parseSlotsEsp(s.horario).forEach(function(slot) {
                if (slot.day !== todayNum) return;
                if (!slots[slot.hour]) slots[slot.hour] = {};
                if (!slots[slot.hour][s.clase]) {
                    slots[slot.hour][s.clase] = { count: 0, cap: INSTR_CFG_ESP[s.clase].cap };
                }
                slots[slot.hour][s.clase].count++;
            });
        });

        // Generar lista de slots para hoy para los instrumentos del maestro
        var horaSlots = [];
        for (var h = sched.start; h < sched.end; h++) {
            instrToShow.forEach(function(inst) {
                var info = (slots[h] && slots[h][inst]) || { count: 0, cap: INSTR_CFG_ESP[inst].cap };
                var disponibles = Math.max(0, info.cap - info.count);
                horaSlots.push({
                    hora:       h,
                    horaStr:    (h < 10 ? '0' : '') + h + ':00',
                    horaFinStr: (h + 1 < 10 ? '0' : '') + (h + 1) + ':00',
                    clase:      inst,
                    inscritos:  info.count,
                    capacidad:  info.cap,
                    disponibles: disponibles
                });
            });
        }

        if (horaSlots.length === 0) {
            content.innerHTML = '<div class="text-muted py-1" style="font-size:0.88em;">' +
                '<i class="fas fa-check-circle me-1"></i>Sin horarios operativos para hoy.</div>';
            return;
        }

        var hayDisponibles = horaSlots.some(function(s) { return s.disponibles > 0; });

        content.innerHTML = horaSlots.map(function(s) {
            var pct      = s.capacidad > 0 ? Math.round((s.inscritos / s.capacidad) * 100) : 100;
            var barClass = s.disponibles === 0 ? 'bg-danger' : s.disponibles === 1 ? 'bg-warning' : 'bg-success';
            return '<div class="py-1 border-bottom border-secondary">' +
                '<div class="d-flex justify-content-between align-items-center mb-1">' +
                '<div style="font-size:0.85em;">' +
                '<span class="text-warning fw-bold">' + s.horaStr + ' – ' + s.horaFinStr + '</span>' +
                '<span class="text-info ms-2">' + s.clase + '</span>' +
                '</div>' +
                '<div style="font-size:0.82em;">' +
                (s.disponibles > 0
                    ? '<span class="text-success fw-bold">' + s.disponibles + ' libre' + (s.disponibles > 1 ? 's' : '') + '</span>'
                    : '<span class="text-danger fw-bold">Lleno</span>') +
                '<span class="text-muted ms-1">(' + s.inscritos + '/' + s.capacidad + ')</span>' +
                '</div>' +
                '</div>' +
                '<div class="progress" style="height:4px;">' +
                '<div class="progress-bar ' + barClass + '" style="width:' + pct + '%;"></div>' +
                '</div>' +
                '</div>';
        }).join('') + (hayDisponibles
            ? '<div class="mt-2" style="font-size:0.8em;">' +
              '<i class="fas fa-lightbulb text-warning me-1"></i>' +
              '<span class="text-warning">Hay espacios disponibles para vender hoy.</span>' +
              '</div>'
            : '');

    } catch (e) {
        console.error('Error espacios libres:', e);
        loading.style.display = 'none';
        content.style.display = 'block';
        content.innerHTML = '<small class="text-muted"><i class="fas fa-exclamation-circle me-1"></i>No se pudo calcular.</small>';
    }
}

// ============================================================
// LOGOUT
// ============================================================

async function logout() {
    try {
        const confirmLogout = confirm('¿Estas seguro de que quieres cerrar sesion?');
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

/*
-- SQL para crear cuentas de maestros en la tabla usuarios.
-- Ejecutar en la base de datos gastos_app_db.
-- La contrasena por defecto es 'Rockstar2025!' (bcrypt hash).
-- IMPORTANTE: Cambiar la contrasena despues del primer login.

INSERT INTO usuarios (nombre, apellidos, email, password_hash, rol, empresa, activo) VALUES
('Hugo', 'Vazquez', 'hvazquez@rockstarskull.com', '$2y$10$placeholder_hash_change_me', 'maestro', 'RockstarSkull', TRUE),
('Julio', 'Olvera', 'jolvera@rockstarskull.com', '$2y$10$placeholder_hash_change_me', 'maestro', 'RockstarSkull', TRUE),
('Demian', 'Andrade', 'dandrade@rockstarskull.com', '$2y$10$placeholder_hash_change_me', 'maestro', 'RockstarSkull', TRUE),
('Irwin', 'Hernandez', 'ihernandez@rockstarskull.com', '$2y$10$placeholder_hash_change_me', 'maestro', 'RockstarSkull', TRUE),
('Nahomy', 'Perez', 'nperez@rockstarskull.com', '$2y$10$placeholder_hash_change_me', 'maestro', 'RockstarSkull', TRUE),
('Luis', 'Blanquet', 'lblanquet@rockstarskull.com', '$2y$10$placeholder_hash_change_me', 'maestro', 'RockstarSkull', TRUE),
('Manuel', 'Reyes', 'mreyes@rockstarskull.com', '$2y$10$placeholder_hash_change_me', 'maestro', 'RockstarSkull', TRUE),
('Harim', 'Lopez', 'hlopez@rockstarskull.com', '$2y$10$placeholder_hash_change_me', 'maestro', 'RockstarSkull', TRUE)
ON DUPLICATE KEY UPDATE activo = TRUE;

-- Para generar un hash bcrypt valido para 'Rockstar2025!' ejecutar en PHP:
-- echo password_hash('Rockstar2025!', PASSWORD_BCRYPT);
*/
