/* ============================================================
   HORARIOS DISPONIBLES — RockstarSkull
   gastos/js/dashboard-horarios.js  v1.0.0
   Grilla semanal por salón con capacidad de clases grupales
   ============================================================ */

// ---- Configuración de negocio ----

var INSTR_CFG = {
    'Guitarra': { sala: 'guitarra',   cap: 5, icon: 'fa-guitar',     color: '#e74c3c' },
    'Batería':  { sala: 'bateria',    cap: 2, icon: 'fa-drum',       color: '#f39c12' },
    'Canto':    { sala: 'compartido', cap: 3, icon: 'fa-microphone', color: '#a855f7' },
    'Bajo':     { sala: 'compartido', cap: 3, icon: 'fa-guitar',     color: '#22c55e' },
    'Teclado':  { sala: 'compartido', cap: 2, icon: 'fa-music',      color: '#3b82f6' }
};

var SALA_CFG = {
    guitarra:   { label: 'Salón Guitarra',                icon: 'fa-guitar', instrumentos: ['Guitarra'] },
    bateria:    { label: 'Salón Batería',                 icon: 'fa-drum',   instrumentos: ['Batería'] },
    compartido: { label: 'Salón Compartido',              icon: 'fa-music',  instrumentos: ['Canto', 'Bajo', 'Teclado'] }
};

var HR_DIAS      = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
var HR_DIAS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
var HR_DIAS_NUM  = [1, 2, 3, 4, 5, 6];

var _DIA_NUM = {
    lun:1, lunes:1, mar:2, martes:2,
    mie:3, miercoles:3, jue:4, jueves:4,
    vie:5, viernes:5,  sab:6, sabado:6,
    dom:0, domingo:0
};

// Horario operativo de la escuela
// Lun–Vie: 15:00–20:00  |  Sáb: 11:00–16:00
var SCHOOL_SCHEDULE = {
    1: { start: 15, end: 20 }, // Lunes
    2: { start: 15, end: 20 }, // Martes
    3: { start: 15, end: 20 }, // Miércoles
    4: { start: 15, end: 20 }, // Jueves
    5: { start: 15, end: 20 }, // Viernes
    6: { start: 11, end: 16 }  // Sábado
};
// Unión de todas las horas operativas (para las filas de la grilla)
var SCHOOL_HOURS = [11, 12, 13, 14, 15, 16, 17, 18, 19];

function _isOperatingHour(dayNum, hour) {
    var sched = SCHOOL_SCHEDULE[dayNum];
    return sched ? (hour >= sched.start && hour < sched.end) : false;
}

// Inyectar estilos tema-conscientes una sola vez
(function() {
    var s = document.createElement('style');
    s.textContent =
        // Celda "Cerrado" — tema oscuro (default)
        '.hr-cerrado{text-align:center;font-size:0.7rem;border-radius:3px;padding:4px 2px;' +
        'background:#2d2d2d;color:rgba(255,255,255,0.5);}' +
        // Celda "Cerrado" — tema claro
        '[data-theme="light"] .hr-cerrado{background:#b8b8b8;color:rgba(0,0,0,0.55);}' +
        // Leyenda — tema oscuro
        '.hr-legend{font-size:0.78rem;color:rgba(255,255,255,0.82);}' +
        // Leyenda — tema claro
        '[data-theme="light"] .hr-legend{color:rgba(0,0,0,0.72);}';
    document.head.appendChild(s);
})();

var _hrLoaded = false;

// ---- API pública ----

function initHorariosTab() {
    if (_hrLoaded) return;
    _loadAndRenderHorarios();
}

function refreshHorariosTab() {
    _hrLoaded = false;
    _loadAndRenderHorarios();
}

// ---- Carga de datos ----

async function _loadAndRenderHorarios() {
    var loading   = document.getElementById('horariosLoading');
    var container = document.getElementById('horariosContainer');

    if (loading) {
        loading.style.display = 'block';
        loading.innerHTML =
            '<i class="fas fa-spinner fa-spin fa-2x text-primary"></i>' +
            '<p class="mt-2 text-muted">Cargando horarios...</p>';
    }
    if (container) container.style.display = 'none';

    try {
        var result = await window.apiGet('alumnos', {
            empresa_id: 1, estatus: 'Activo', unificar: '0', limit: 1000
        });
        if (!result.success || !result.data) throw new Error('Sin datos');

        var students = result.data;
        var slots    = _buildSlotsMatrix(students);
        var html     = _buildFullHTML(slots, students);

        if (container) { container.innerHTML = html; container.style.display = 'block'; }
        if (loading)   loading.style.display = 'none';
        _hrLoaded = true;

    } catch (err) {
        console.error('Error horarios:', err);
        if (loading) loading.innerHTML =
            '<i class="fas fa-exclamation-triangle text-danger fa-2x"></i>' +
            '<p class="mt-2 text-danger">Error cargando datos.</p>' +
            '<button class="btn btn-sm btn-outline-primary mt-1" onclick="refreshHorariosTab()">' +
            '<i class="fas fa-redo me-1"></i>Reintentar</button>';
    }
}

// ---- Parseo de horario ----

function _normDay(str) {
    return str.toLowerCase()
        .replace(/á/g,'a').replace(/é/g,'e')
        .replace(/í/g,'i').replace(/ó/g,'o').replace(/ú/g,'u');
}

function _parseSlots(horarioStr) {
    if (!horarioStr) return [];
    var out = [];
    // Formato: "HH:MM a HH:MM DíaSemana" — múltiples separados por "y" u otros chars
    var re = /(\d{1,2}):(\d{2})\s+a\s+(\d{1,2}):(\d{2})\s+([A-Za-záéíóúÁÉÍÓÚ]+)/g;
    var m;
    while ((m = re.exec(horarioStr)) !== null) {
        var startH = parseInt(m[1]);
        var endH   = parseInt(m[3]);
        var nd     = _normDay(m[5]);
        var dn     = _DIA_NUM[nd] !== undefined ? _DIA_NUM[nd] : _DIA_NUM[nd.slice(0, 3)];
        if (dn === undefined) continue;
        for (var h = startH; h < endH; h++) out.push({ day: dn, hour: h });
    }
    return out;
}

// ---- Construcción de matriz de slots ----

function _buildSlotsMatrix(students) {
    // slots[day][hour][instrumento] = { count, cap, students[], maestros[], hasIndividual, indivStudents[] }
    // hasIndividual=true → la clase individual bloquea el salón entero para ese slot
    var slots = {};

    students.forEach(function(s) {
        var cfg = INSTR_CFG[s.clase];
        if (!cfg) return;
        var isIndividual = s.tipo_clase === 'Individual';

        _parseSlots(s.horario).forEach(function(slot) {
            if (!slots[slot.day])              slots[slot.day]              = {};
            if (!slots[slot.day][slot.hour])   slots[slot.day][slot.hour]   = {};
            if (!slots[slot.day][slot.hour][s.clase]) {
                slots[slot.day][slot.hour][s.clase] = {
                    count: 0, cap: cfg.cap, students: [], maestros: [],
                    hasIndividual: false, indivStudents: []
                };
            }
            var e = slots[slot.day][slot.hour][s.clase];
            if (isIndividual) {
                e.hasIndividual = true;
                if (e.indivStudents.indexOf(s.nombre) === -1) e.indivStudents.push(s.nombre);
            } else {
                e.count++;
                if (e.students.indexOf(s.nombre) === -1) e.students.push(s.nombre);
            }
            if (s.maestro && e.maestros.indexOf(s.maestro) === -1) e.maestros.push(s.maestro);
        });
    });

    return slots;
}

// ---- HTML: contenedor completo ----

function _buildFullHTML(slots, students) {
    // Rango horario fijo según horario escolar
    // Lun–Vie 15:00–20:00 | Sáb 11:00–16:00  → unión de horas visibles
    var hours = SCHOOL_HOURS;

    return _buildSummaryRow(slots, students) +
           _buildLegend() +
           Object.entries(SALA_CFG).map(function(e) {
               return _buildRoomSection(e[0], e[1], slots, hours);
           }).join('');
}

// ---- HTML: fila de resumen por instrumento ----

function _buildSummaryRow(slots, students) {
    var SHARED_INSTR = ['Canto', 'Bajo', 'Teclado'];

    // ── 1. Alumnos inscritos por instrumento (peso proporcional para salón compartido)
    var enrolled = {};
    Object.keys(INSTR_CFG).forEach(function(inst) { enrolled[inst] = 0; });
    students.forEach(function(s) {
        if (enrolled[s.clase] !== undefined) enrolled[s.clase]++;
    });

    // ── 2. Horas operativas totales del salón compartido (unión Lun-Vie + Sáb)
    var totalSharedHours = HR_DIAS_NUM.reduce(function(sum, day) {
        var sched = SCHOOL_SCHEDULE[day];
        return sum + (sched ? sched.end - sched.start : 0);
    }, 0);

    // ── 3. Horas del salón compartido ya ocupadas (cualquiera de los 3 instrumentos)
    var sharedOccupied = 0;
    HR_DIAS_NUM.forEach(function(day) {
        if (!slots[day]) return;
        Object.keys(slots[day]).forEach(function(hour) {
            if (!_isOperatingHour(day, parseInt(hour))) return;
            if (SHARED_INSTR.some(function(i) { return slots[day][hour][i]; })) sharedOccupied++;
        });
    });
    var freeSharedHours = totalSharedHours - sharedOccupied;

    // ── 4. Pesos proporcionales por inscripción (fallback equitativo si todos=0)
    var totalSharedEnrolled = SHARED_INSTR.reduce(function(s, i) { return s + enrolled[i]; }, 0);
    var weights = {};
    SHARED_INSTR.forEach(function(inst) {
        weights[inst] = totalSharedEnrolled > 0
            ? enrolled[inst] / totalSharedEnrolled
            : 1 / SHARED_INSTR.length;
    });

    // ── 4b. Horas libres por salón exclusivo (Guitarra, Batería)
    var instrFreeHours = {};
    Object.entries(INSTR_CFG).forEach(function(e) {
        var inst = e[0];
        if (SHARED_INSTR.indexOf(inst) !== -1) return;
        var occupied = 0;
        HR_DIAS_NUM.forEach(function(day) {
            if (!slots[day]) return;
            Object.keys(slots[day]).forEach(function(hour) {
                if (!_isOperatingHour(day, parseInt(hour))) return;
                if (slots[day][hour][inst]) occupied++;
            });
        });
        instrFreeHours[inst] = totalSharedHours - occupied;
    });

    // ── 5. Calcular "libres" compuesto por instrumento
    //   Guitarra/Batería : spots en grupos + (horas libres × capacidad)
    //   Canto/Bajo/Teclado : spots en grupos + horas salón proporcionales
    var instrLibres  = {}; // total "libres" a mostrar en badge
    var instrUsed    = {}; // suma de conteos por slot
    var instrCap     = {}; // cap de grupos agendados
    var instrProp    = {}; // slots libres adicionales = freeH × cap
    var instrFreeH   = {}; // horas libres del salón asignadas a cada instrumento

    var instrGrupos = {}; // número de slots (day,hour) agendados con alumnos

    Object.entries(INSTR_CFG).forEach(function(e) {
        var inst = e[0], cfg = e[1];
        var usedTotal = 0, capTotal = 0, numSlots = 0;
        HR_DIAS_NUM.forEach(function(day) {
            if (!slots[day]) return;
            Object.keys(slots[day]).forEach(function(hour) {
                var info = slots[day][hour][inst];
                if (info) {
                    usedTotal += info.count;
                    capTotal  += info.cap;
                    if (info.count > 0) numSlots++;
                }
            });
        });
        instrUsed[inst]   = usedTotal;
        instrCap[inst]    = capTotal;
        instrGrupos[inst] = numSlots;
        var groupLibres   = capTotal - usedTotal;

        var freeH   = SHARED_INSTR.indexOf(inst) !== -1
                      ? Math.round(freeSharedHours * weights[inst])
                      : (instrFreeHours[inst] || 0);
        var freeCap = freeH * cfg.cap;
        instrProp[inst]   = freeCap;
        instrFreeH[inst]  = freeH;
        instrLibres[inst] = groupLibres + freeCap;
    });

    // ── 6. Grand total (suma de todos los libres compuestos)
    var grandLibres = Object.values(instrLibres).reduce(function(s, v) { return s + v; }, 0);
    var grandTotalEnrolled = Object.values(enrolled).reduce(function(s, v) { return s + v; }, 0);
    var grandTotalGrupos   = Object.values(instrGrupos).reduce(function(s, v) { return s + v; }, 0);
    var grandBc = grandLibres === 0 ? 'danger' : grandLibres <= 5 ? 'warning' : 'success';

    // ── 7. Render card Total Escuela
    var html = '<div class="row g-2 mb-4">' +
        '<div class="col">' +
        '<div class="rounded p-2 text-center h-100" ' +
        'style="background:rgba(255,255,255,0.09);border:1px solid rgba(255,255,255,0.25);">' +
        '<i class="fas fa-school mb-1" style="color:#94a3b8;font-size:1.4rem;display:block;"></i>' +
        '<div class="fw-bold" style="font-size:0.82rem;color:#fff;">Total Escuela</div>' +
        '<div class="mt-1"><span class="badge bg-' + grandBc + '">' +
        grandLibres + ' libre' + (grandLibres !== 1 ? 's' : '') + '</span></div>' +
        '<div style="font-size:0.67rem;color:rgba(255,255,255,0.55);margin-top:4px;">' +
        grandTotalEnrolled + ' alumnos &bull; ' + grandTotalGrupos + ' grupos/sem</div>' +
        '</div></div>';

    // ── 8. Render cards por instrumento
    Object.entries(INSTR_CFG).forEach(function(e) {
        var inst = e[0], cfg = e[1];
        var libres  = instrLibres[inst];
        var prop    = instrProp[inst];
        var grupos  = instrGrupos[inst];
        var alumnos = enrolled[inst];
        var bc      = libres === 0 ? 'danger' : libres <= 2 ? 'warning' : 'success';

        // Subtext: alumnos reales + grupos agendados por semana
        var subtext = alumnos + ' alumno' + (alumnos !== 1 ? 's' : '') +
                      ' &bull; ' + grupos + ' grupo' + (grupos !== 1 ? 's' : '') + '/sem';
        if (prop > 0) {
            subtext += '<br><span style="color:#86efac;">' +
                       '~' + prop + ' slots libres (' + instrFreeH[inst] + ' h &times; ' +
                       cfg.cap + ' cap)</span>';
        }

        html +=
            '<div class="col">' +
            '<div class="rounded p-2 text-center h-100" ' +
            'style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);">' +
            '<i class="fas ' + cfg.icon + ' mb-1" style="color:' + cfg.color + ';font-size:1.4rem;display:block;"></i>' +
            '<div class="fw-semibold" style="font-size:0.82rem;color:#fff;">' + inst + '</div>' +
            '<div class="mt-1"><span class="badge bg-' + bc + '">' +
            libres + ' libre' + (libres !== 1 ? 's' : '') + '</span></div>' +
            '<div style="font-size:0.67rem;color:rgba(255,255,255,0.55);margin-top:4px;">' +
            subtext + '</div>' +
            '</div></div>';
    });

    return html + '</div>';
}

// ---- HTML: leyenda ----

function _buildLegend() {
    var dot = function(color) {
        return '<span style="display:inline-block;width:11px;height:11px;border-radius:2px;background:' + color + ';vertical-align:middle;margin-right:3px;"></span>';
    };
    return '<div class="hr-legend d-flex flex-wrap gap-3 mb-3 align-items-center">' +
        '<span class="text-muted">Leyenda:</span>' +
        '<span>' + dot('#198754') + 'Libre</span>' +
        '<span>' + dot('#0dcaf0') + 'Con lugar</span>' +
        '<span>' + dot('#ffc107') + 'Casi lleno (≥70%)</span>' +
        '<span>' + dot('#dc3545') + 'Lleno</span>' +
        '<span>' + dot('#6c757d') + 'Sin clase</span>' +
        '</div>';
}

// ---- HTML: sección de salón ----

function _buildRoomSection(salaKey, sala, slots, hours) {
    var isShared   = sala.instrumentos.length > 1;
    var titleExtra = isShared
        ? ' <small class="fw-normal text-muted ms-1" style="font-size:0.78rem;">(Canto · Bajo · Teclado)</small>'
        : '';

    var headerBtns =
        '<button class="btn btn-outline-secondary btn-sm ms-auto" ' +
        'style="font-size:0.65rem;padding:2px 8px;" onclick="refreshHorariosTab()" ' +
        'title="Actualizar"><i class="fas fa-sync-alt"></i></button>';

    var html =
        '<div class="mb-4">' +
        '<div class="d-flex align-items-center mb-2">' +
        '<h6 class="text-white mb-0">' +
        '<i class="fas ' + sala.icon + ' me-2" style="color:#60a5fa;"></i>' + sala.label + titleExtra +
        '</h6>' + headerBtns +
        '</div>' +
        '<div class="table-responsive">' +
        '<table class="table table-dark table-bordered table-sm mb-0" style="width:100%;table-layout:fixed;min-width:560px;">' +
        '<colgroup>' +
        '<col style="width:90px;">' +
        HR_DIAS.map(function() { return '<col>'; }).join('') +
        '</colgroup>' +
        '<thead>' +
        '<tr>' +
        '<th style="font-size:0.78rem;">Horario</th>';

    HR_DIAS.forEach(function(d, i) {
        // Highlight "today" column
        var todayDayNum = new Date().getDay(); // 0=Dom,1=Lun,...
        var isToday = HR_DIAS_NUM[i] === todayDayNum;
        html += '<th class="text-center' + (isToday ? ' table-active' : '') + '" style="font-size:0.78rem;">' +
                d + (isToday ? ' <span class="badge bg-primary" style="font-size:0.55rem;">hoy</span>' : '') +
                '</th>';
    });

    html += '</tr></thead><tbody>';

    hours.forEach(function(hour) {
        html += '<tr><td class="text-muted text-nowrap align-middle" style="font-size:0.78rem;">' +
                _pad(hour) + ':00 – ' + _pad(hour + 1) + ':00</td>';

        HR_DIAS_NUM.forEach(function(day) {
            html += '<td style="padding:4px 5px;vertical-align:middle;">' +
                    _buildCell(salaKey, sala, day, hour, slots) +
                    '</td>';
        });
        html += '</tr>';
    });

    html += '</tbody></table></div></div>';
    return html;
}

// ---- HTML: celda individual ----

function _buildCell(salaKey, sala, day, hour, slots) {
    // Fuera del horario operativo de la escuela → celda bloqueada
    if (!_isOperatingHour(day, hour)) {
        return '<div class="hr-cerrado">Cerrado</div>';
    }

    // Clase Individual → bloquea el salón completo para ese slot
    var indivInst = null;
    sala.instrumentos.forEach(function(inst) {
        var info = slots[day] && slots[day][hour] && slots[day][hour][inst];
        if (info && info.hasIndividual && !indivInst) indivInst = inst;
    });
    if (indivInst) {
        var iInfo    = slots[day][hour][indivInst];
        var iMaestro = iInfo.maestros.length > 0 ? iInfo.maestros[0].split(' ')[0] : '';
        var iAlumno  = iInfo.indivStudents.length > 0 ? iInfo.indivStudents[0] : '';
        var tip      = 'Individual · ' + indivInst +
                       (iMaestro ? ' · ' + iMaestro : '') +
                       (iAlumno  ? '\nAlumno: ' + iAlumno : '');
        return '<div title="' + tip + '" style="background:rgba(168,85,247,0.15);border:1px solid #a855f7;' +
               'border-radius:4px;padding:3px 5px;text-align:center;">' +
               '<div style="font-size:0.6rem;color:#c084fc;font-weight:600;line-height:1.4;">' +
               '<i class="fas fa-lock me-1"></i>Clase Individual</div>' +
               '<div style="font-size:0.6rem;color:#e9d5ff;line-height:1.3;">' + indivInst + '</div>' +
               (iMaestro ? '<div style="font-size:0.6rem;color:#94a3b8;">' + iMaestro + '</div>' : '') +
               '</div>';
    }

    var content = '';
    var hasAny  = false;

    sala.instrumentos.forEach(function(inst) {
        var info = slots[day] && slots[day][hour] && slots[day][hour][inst];
        if (!info) return;
        hasAny = true;

        var pct       = info.count / info.cap;
        var barColor  = pct >= 1 ? '#dc3545' : pct >= 0.7 ? '#ffc107' : '#0dcaf0';
        var textColor = (pct >= 0.7 && pct < 1) ? '#1a1a1a' : '#fff';
        var barW      = Math.min(100, Math.round(pct * 100));
        var cfg       = INSTR_CFG[inst];
        var maestro   = info.maestros.length > 0 ? info.maestros[0].split(' ')[0] : '';

        // Tooltip con lista de alumnos
        var tip = inst + ': ' + info.count + '/' + info.cap +
                  (maestro ? ' · ' + maestro : '') +
                  '&#10;Alumnos: ' + info.students.slice(0, 8).join(', ') +
                  (info.students.length > 8 ? '…' : '');

        content += '<div style="margin-bottom:2px;" title="' + tip + '">';

        // Etiqueta de instrumento (solo en salón compartido)
        if (sala.instrumentos.length > 1) {
            content += '<small style="font-size:0.6rem;color:' + cfg.color +
                       ';line-height:1.2;display:block;font-weight:600;">' + inst + '</small>';
        }

        // Barra de capacidad
        content +=
            '<div style="background:#2d2d2d;border-radius:3px;overflow:hidden;height:19px;position:relative;">' +
            '<div style="width:' + barW + '%;height:100%;background:' + barColor + ';transition:width .3s;"></div>' +
            '<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
                   'font-size:0.7rem;font-weight:600;color:' + textColor + ';gap:3px;">' +
            info.count + '/' + info.cap +
            (maestro ? '<span style="opacity:.8;font-weight:400;">· ' + maestro + '</span>' : '') +
            '</span>' +
            '</div>';

        // Spots disponibles
        var libre = info.cap - info.count;
        if (libre > 0) {
            content += '<small style="font-size:0.6rem;color:#6ee7b7;line-height:1.2;display:block;">' +
                       libre + ' lugar' + (libre !== 1 ? 'es' : '') + ' libre' + (libre !== 1 ? 's' : '') +
                       '</small>';
        }

        content += '</div>';
    });

    // Conflicto en salón compartido: detectar y sugerir alternativas
    if (salaKey === 'compartido' && hasAny) {
        var conflicting = sala.instrumentos.filter(function(inst) {
            return slots[day] && slots[day][hour] && slots[day][hour][inst];
        });
        if (conflicting.length >= 2) {
            content += _buildConflictSuggestion(conflicting, day, hour, slots);
        }
    }

    if (!hasAny) {
        if (salaKey === 'compartido') {
            // Mostrar "libre" por cada instrumento del salón compartido
            content = sala.instrumentos.map(function(inst) {
                var cfg = INSTR_CFG[inst];
                return '<div style="display:flex;align-items:center;gap:4px;margin-bottom:1px;">' +
                       '<span style="width:6px;height:6px;border-radius:50%;background:' + cfg.color +
                       ';display:inline-block;"></span>' +
                       '<small style="font-size:0.6rem;color:#6b7280;">' + inst +
                       ' <span style="color:#6ee7b7;">libre</span></small>' +
                       '</div>';
            }).join('');
        } else {
            content = '<div class="text-center" style="color:#198754;font-size:0.75rem;">' +
                      '<i class="fas fa-check-circle me-1"></i>Libre</div>';
        }
    }

    return content;
}

// ---- Sugerencia de reubicación ante conflicto en salón compartido ----
//
// Revisa si el Salón Guitarra o Salón Batería están libres en ese slot y
// propone mover uno de los instrumentos en conflicto a ese salón.
// Cualquier instrumento puede darse en cualquier salón de forma temporal.

function _buildConflictSuggestion(conflicting, day, hour, slots) {
    var guitaraFree  = !(slots[day] && slots[day][hour] && slots[day][hour]['Guitarra']);
    var bateriaFree  = !(slots[day] && slots[day][hour] && slots[day][hour]['Batería']);

    // Asignar instrumentos en conflicto a salones alternativos disponibles
    var moves     = []; // { inst, destino }
    var pending   = conflicting.slice(); // copia mutable

    if (guitaraFree && pending.length > 0) {
        moves.push({ inst: pending.shift(), destino: 'Guitarra' });
    }
    if (bateriaFree && pending.length > 0) {
        moves.push({ inst: pending.shift(), destino: 'Batería' });
    }
    // `pending` son los que se quedan en el compartido (si hay 3+ instrumentos)

    var html =
        '<div style="margin-top:4px;padding:4px 5px;' +
        'background:rgba(239,68,68,0.12);border-radius:4px;border-left:2px solid #ef4444;">' +
        '<div style="font-size:0.6rem;color:#f87171;font-weight:600;line-height:1.4;">' +
        '<i class="fas fa-exclamation-triangle me-1"></i>' +
        'Conflicto · ' + conflicting.join(' + ') +
        '</div>';

    if (moves.length > 0) {
        html += '<div style="font-size:0.6rem;color:#fbbf24;margin-top:2px;font-weight:600;">' +
                '<i class="fas fa-lightbulb me-1"></i>Sugerencia:</div>';

        moves.forEach(function(m) {
            html += '<div style="font-size:0.6rem;color:#86efac;line-height:1.5;">' +
                    '→ <strong>' + m.inst + '</strong> al Salón ' + m.destino + '</div>';
        });

        if (pending.length > 0) {
            html += '<div style="font-size:0.6rem;color:#94a3b8;line-height:1.4;">' +
                    pending.join(' + ') + ' permanece en Salón Múltiple</div>';
        }
    } else {
        html += '<div style="font-size:0.6rem;color:#9ca3af;margin-top:2px;">' +
                '<i class="fas fa-ban me-1"></i>Sin salones alternativos disponibles en este horario</div>';
    }

    html += '</div>';
    return html;
}

function _pad(n) { return n < 10 ? '0' + n : '' + n; }

// ---- Activación automática al mostrar la pestaña ----

document.addEventListener('DOMContentLoaded', function() {
    var tabBtn = document.querySelector('[data-bs-target="#tab-horarios"]');
    if (tabBtn) {
        tabBtn.addEventListener('shown.bs.tab', function() {
            initHorariosTab();
        });
    }
});
