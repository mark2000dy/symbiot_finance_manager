/**
 * dashboard-symbiot.js — v1.0.0
 * Widgets de Symbiot Technologies (IoT sensores y clientes)
 * Paralelo a los widgets de RockstarSkull
 */

'use strict';

// ============================================================
// CARGA PRINCIPAL DE DATOS
// ============================================================

async function loadSymbiotDataReal() {
    try {
        console.log('🌐 Cargando datos de Symbiot Technologies...');
        const result = await window.apiGet('dashboard/sensores', { empresa_id: 2 });

        if (!result.success) {
            console.error('❌ Error en dashboard/sensores:', result.message);
            return;
        }

        const d = result.data;

        // — Indicadores del selector de empresa —
        _updateSymbiotSelectorIndicators(d);

        // — Card 1: Sensores Instalados —
        _updateSensoresCard(d.stats || {});

        // — Distribución geográfica —
        _updateGeoDistribution(d.distribucion_geo || []);

        // — Card Movimientos del Mes —
        _updateMovimientosMes(d.movimientos_mes || {}, d.clientes || {});

        // — Card Clientes: cards estilo Maestros —
        _updateClientesOverview(d.clientes_lista || []);

        // — Modelos de sensor —
        _updateModelosSensor(d.tipos_sensor || []);

        // — Alertas de suscripción —
        _updateAlertasSuscripcion(d.alertas_suscripcion || []);

        console.log('✅ Datos Symbiot cargados');
    } catch (err) {
        console.error('❌ loadSymbiotDataReal error:', err);
    }
}

function _updateSymbiotSelectorIndicators(d) {
    const stats = d.stats || {};
    const geo   = d.distribucion_geo || [];

    _setEl('symSensoresActivos', stats.activos  || 0);
    _setEl('symFueraLinea',      stats.inactivos || 0);
    _setEl('symFabricacion',     stats.fabricacion || 0);

    // Buscar México y Chile — mostrar solo activos (consistente con geo cards y H2 principal)
    const mx = geo.find(g => g.pais === 'México' || g.pais === 'Mexico') || {};
    const cl = geo.find(g => g.pais === 'Chile')  || {};
    _setEl('symPaisMX', mx.activos || 0);
    _setEl('symPaisCL', cl.activos || 0);

    const mov = d.movimientos_mes || {};
    _setEl('symEncendidos',   mov.encendidos   || 0);
}

function _updateSensoresCard(stats) {
    _setEl('symTotalSensores',   stats.total_sensores || 0);
    _setEl('symActivosCard',     stats.activos        || 0);
    _setEl('symInactivosCard',   stats.inactivos      || 0);
    _setEl('symFabricacionCard', stats.fabricacion    || 0);
}

function _updateGeoDistribution(geo) {
    const container = document.getElementById('symGeoDistribution');
    if (!container) return;

    if (!geo.length) {
        container.innerHTML = '<span class="text-muted">Sin datos geográficos</span>';
        return;
    }

    const FLAG = { 'México': '🇲🇽', 'Mexico': '🇲🇽', 'Chile': '🇨🇱', 'Argentina': '🇦🇷', 'Colombia': '🇨🇴', 'Estados Unidos': '🇺🇸', 'USA': '🇺🇸' };
    const COLOR = { 'México': 'danger', 'Mexico': 'danger', 'Chile': 'info', 'Argentina': 'warning', 'Colombia': 'success', 'Estados Unidos': 'primary', 'USA': 'primary' };
    const totalGlobal = geo.reduce((s, g) => s + (g.activos || 0) + (g.inactivos || 0), 0);

    container.innerHTML = geo.map(g => {
        const total  = (g.activos || 0) + (g.inactivos || 0);
        const pct    = totalGlobal > 0 ? Math.round((total / totalGlobal) * 100) : 0;
        const flag   = FLAG[g.pais]  || '🌐';
        const color  = COLOR[g.pais] || 'secondary';
        return `
            <div class="class-item d-flex justify-content-between align-items-center mb-3 p-3 rounded"
                style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s ease;"
                onmouseover="this.style.background='rgba(255,255,255,0.08)'; this.style.borderColor='rgba(255,255,255,0.2)';"
                onmouseout="this.style.background='rgba(255,255,255,0.03)'; this.style.borderColor='rgba(255,255,255,0.1)';">
                <div class="d-flex align-items-center">
                    <span class="badge bg-${color} me-3 fs-6" style="padding: 8px 10px;">${flag}</span>
                    <div>
                        <strong style="color: #E4E6EA; font-size: 1.1em;">${g.pais}</strong>
                        <div><small style="color: #C8CCD0; font-weight: 500;">(${total} sensores)</small></div>
                    </div>
                </div>
                <div class="text-end">
                    <div style="color: #E4E6EA; font-weight: 600; font-size: 1.05em; margin-bottom: 2px;">${total}</div>
                    <small style="color: #C8CCD0; font-weight: 500;">${g.activos || 0} activos, ${g.inactivos || 0} inactivos | ${pct}%</small>
                </div>
            </div>`;
    }).join('');
}

function _updateMovimientosMes(mov, clientes) {
    _setEl('symEncendidosMes',    mov.encendidos    || 0);
    _setEl('symDesconectadosMes', mov.desconectados || 0);
    _setEl('symNuevosPedidosMes', mov.nuevos_pedidos || 0);
    _setEl('symClientesActivos',  clientes.activos  || 0);
    _setEl('symClientesTotal',    clientes.total    || 0);
}

// ============================================================
// CLIENTES OVERVIEW — formato idéntico a Maestros RockstarSkull
// ============================================================

function _updateClientesOverview(clientes) {
    const container = document.getElementById('symClientesOverview');
    if (!container) return;

    if (!clientes || !clientes.length) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-exclamation-triangle text-warning fa-2x mb-2"></i>
                <div class="text-white fw-bold">Sin clientes registrados</div>
                <button class="btn btn-sm btn-outline-info mt-2" onclick="if(typeof refreshSymbiotData==='function') refreshSymbiotData();">
                    <i class="fas fa-sync-alt me-1"></i>Recargar
                </button>
            </div>`;
        return;
    }

    const fmt = (v) => typeof window.formatCurrency === 'function'
        ? window.formatCurrency(v)
        : '$' + parseFloat(v || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });

    const SUBS_ICON = { 'Anual': 'fa-calendar-check', 'Mensual': 'fa-calendar' };
    const FLAG = { 'México': '🇲🇽', 'Mexico': '🇲🇽', 'Chile': '🇨🇱', 'Argentina': '🇦🇷',
                   'Colombia': '🇨🇴', 'Estados Unidos': '🇺🇸', 'USA': '🇺🇸' };

    container.innerHTML = `
        <div class="teachers-grid">
            ${clientes.map(c => {
                const precio     = parseFloat(c.precio_suscripcion) || 0;
                const isActivo   = c.estatus === 'Activo';
                const border     = isActivo ? '#28a745' : '#6c757d';
                const subsIcon   = SUBS_ICON[c.tipo_suscripcion] || 'fa-calendar';
                const periodoLbl = c.tipo_suscripcion === 'Anual' ? 'Año' : 'Mes';
                const flag       = FLAG[c.pais] || '🌐';
                const estatusBadge = isActivo
                    ? '<span class="badge bg-success">Activo</span>'
                    : '<span class="badge bg-secondary">Baja</span>';

                return `
                    <div class="teacher-card mb-3 p-3"
                         style="background: rgba(255,255,255,0.1); border-radius: 8px; border-left: 4px solid ${border};">
                        <!-- Header del cliente -->
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div class="flex-grow-1">
                                <h6 class="text-white mb-1 fw-bold">
                                    <i class="fas fa-handshake me-2 text-info"></i>${c.nombre}
                                </h6>
                                <small class="text-info fw-bold">${c.empresa || flag + ' ' + (c.pais || '—')}</small>
                            </div>
                        </div>

                        <!-- Resumen inline: país | suscripción | estatus -->
                        <div class="mb-3" style="font-size: 0.85em;">
                            <span style="font-size:1em;">${flag}</span>
                            <strong class="text-white ms-1">${c.pais || '—'}</strong>
                            <span class="text-muted mx-1">|</span>
                            <i class="fas ${subsIcon} me-1 text-warning"></i>
                            <strong class="text-white">${c.tipo_suscripcion || '—'}</strong>
                            <span class="text-muted mx-1">|</span>
                            ${estatusBadge}
                        </div>

                        <!-- Banner de ingreso por suscripción -->
                        <div class="row g-2">
                            <div class="col-7">
                                <div class="text-center p-2"
                                     style="background: rgba(40,167,69,0.3); border-radius: 6px; border: 1px solid rgba(40,167,69,0.5);">
                                    <div class="text-white fw-bold" style="font-size: 0.95em;">${fmt(precio)}</div>
                                    <small class="text-white fw-bold">Ingreso / ${periodoLbl}</small>
                                </div>
                            </div>
                            <div class="col-5">
                                <div class="text-center p-2"
                                     style="background: rgba(23,162,184,0.2); border-radius: 6px; border: 1px solid rgba(23,162,184,0.4);">
                                    <div class="text-white fw-bold" style="font-size: 0.85em;">${c.fecha_vencimiento || '—'}</div>
                                    <small class="text-white fw-bold">Vence</small>
                                </div>
                            </div>
                        </div>
                    </div>`;
            }).join('')}
        </div>`;
}

// ============================================================
// MODELOS DE SENSOR — formato class-item (Distribución Geográfica)
// ============================================================

function _updateModelosSensor(tipos) {
    const container = document.getElementById('symModelosSensor');
    if (!container) return;

    if (!tipos || !tipos.length) {
        container.innerHTML = '<small class="text-muted">Sin datos de modelos</small>';
        return;
    }

    const totalGlobal = tipos.reduce((s, t) => s + (parseInt(t.total) || 0), 0);

    const TIPO_ICON = {
        'Temperatura': 'fa-thermometer-half',
        'Humedad':     'fa-tint',
        'Presión':     'fa-compress-alt',
        'Gas':         'fa-smog',
        'Movimiento':  'fa-running',
        'Luz':         'fa-sun',
        'GPS':         'fa-map-marker-alt',
    };

    container.innerHTML = tipos.map(t => {
        const total = parseInt(t.total) || 0;
        const activos = parseInt(t.activos) || 0;
        const pct = totalGlobal > 0 ? Math.round((total / totalGlobal) * 100) : 0;
        const icon = TIPO_ICON[t.tipo] || 'fa-microchip';

        return `
            <div class="class-item d-flex justify-content-between align-items-center mb-2 p-3 rounded"
                 style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s ease;"
                 onmouseover="this.style.background='rgba(255,255,255,0.08)'; this.style.borderColor='rgba(255,255,255,0.2)';"
                 onmouseout="this.style.background='rgba(255,255,255,0.03)'; this.style.borderColor='rgba(255,255,255,0.1)';">
                <div class="d-flex align-items-center">
                    <span class="badge bg-primary me-3 fs-6" style="padding: 8px 10px;">
                        <i class="fas ${icon}"></i>
                    </span>
                    <div>
                        <strong style="color: #E4E6EA; font-size: 1.05em;">${t.tipo}</strong>
                        <div><small style="color: #C8CCD0; font-weight: 500;">(${total} sensores)</small></div>
                    </div>
                </div>
                <div class="text-end">
                    <div style="color: #E4E6EA; font-weight: 600; font-size: 1.05em; margin-bottom: 2px;">${total}</div>
                    <small style="color: #C8CCD0; font-weight: 500;">${activos} activos | ${pct}%</small>
                </div>
            </div>`;
    }).join('');
}

function _updateAlertasSuscripcion(alertas) {
    const badge = document.getElementById('symAlertasCount');
    const empty = document.getElementById('symAlertasEmpty');
    const table = document.getElementById('symAlertasTable');
    const tbody = document.getElementById('symAlertasBody');

    if (badge) badge.textContent = alertas.length;

    if (!alertas.length) {
        if (empty) empty.style.display = 'block';
        if (table) table.style.display = 'none';
        return;
    }

    if (empty) empty.style.display = 'none';
    if (table) table.style.display = 'block';

    if (tbody) {
        tbody.innerHTML = alertas.map(c => {
            const dias = parseInt(c.dias_restantes, 10);
            const cls  = dias < 0 ? 'text-danger' : (dias <= 3 ? 'text-warning' : 'text-success');
            const icon = dias < 0 ? 'fa-times-circle' : (dias <= 3 ? 'fa-exclamation-circle' : 'fa-clock');
            return `
                <tr>
                    <td>${c.nombre}</td>
                    <td>${c.empresa || '—'}</td>
                    <td>${c.pais || '—'}</td>
                    <td><span class="badge bg-secondary">${c.tipo_suscripcion}</span></td>
                    <td>${c.fecha_vencimiento}</td>
                    <td class="text-center ${cls}">
                        <i class="fas ${icon} me-1"></i>${dias < 0 ? 'Vencido' : dias + ' días'}
                    </td>
                </tr>`;
        }).join('');
    }
}

// ============================================================
// LISTA DE SENSORES
// ============================================================

async function loadSensoresList() {
    try {
        const estado     = document.getElementById('symFilterEstado')?.value    || '';
        const pais       = document.getElementById('symFilterPais')?.value      || '';
        const cliente_id = document.getElementById('symFilterCliente')?.value   || '';

        const params = { empresa_id: 2 };
        if (estado)     params.estado     = estado;
        if (pais)       params.pais       = pais;
        if (cliente_id) params.cliente_id = cliente_id;

        const result = await window.apiGet('sensores', params);
        const tbody  = document.getElementById('symSensoresBody');
        if (!tbody) return;

        if (!result.success || !result.data.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">No hay sensores que mostrar</td></tr>';
            return;
        }

        tbody.innerHTML = result.data.map(s => {
            const estadoBadge = _sensorEstadoBadge(s.estado);
            const ultimoContacto = s.fecha_ultimo_contacto
                ? new Date(s.fecha_ultimo_contacto).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
                : '—';
            return `
                <tr>
                    <td><strong>${s.nombre}</strong></td>
                    <td>${s.tipo_sensor || '—'}</td>
                    <td>${s.ubicacion_pais || '—'}${s.ubicacion_ciudad ? ' / ' + s.ubicacion_ciudad : ''}</td>
                    <td>${s.cliente_nombre || '<span class="text-muted">Sin asignar</span>'}</td>
                    <td class="text-center">${estadoBadge}</td>
                    <td>${ultimoContacto}</td>
                    <td class="text-center">
                        <button type="button" class="btn btn-sm btn-outline-secondary me-1" title="Ver detalle" onclick="viewSensorDetail(${s.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-info me-1" title="Editar" onclick="openSensorModal(${s.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger" title="Eliminar" onclick="deleteSensor(${s.id}, '${s.nombre.replace(/'/g, "\\'")}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
        }).join('');
    } catch (err) {
        console.error('❌ loadSensoresList error:', err);
    }
}

function _sensorEstadoBadge(estado) {
    const map = {
        'Activo':      '<span class="badge bg-success">Activo</span>',
        'Inactivo':    '<span class="badge bg-danger">Fuera de línea</span>',
        'Fabricacion': '<span class="badge bg-warning text-dark">Fabricación</span>',
    };
    return map[estado] || `<span class="badge bg-secondary">${estado}</span>`;
}

// ============================================================
// LISTA DE CLIENTES
// ============================================================

async function loadClientesList() {
    try {
        const estatus = document.getElementById('symFilterClienteEstatus')?.value || '';
        const params  = { empresa_id: 2 };
        if (estatus) params.estatus = estatus;

        const result = await window.apiGet('clientes-symbiot', params);
        const tbody  = document.getElementById('symClientesBody');
        if (!tbody) return;

        if (!result.success || !result.data.length) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">No hay clientes que mostrar</td></tr>';
            return;
        }

        tbody.innerHTML = result.data.map(c => {
            const estatusBadge  = c.estatus === 'Activo'
                ? '<span class="badge bg-success">Activo</span>'
                : '<span class="badge bg-secondary">Baja</span>';
            const suscBadge = c.tipo_suscripcion === 'Anual'
                ? '<span class="badge bg-info">Anual</span>'
                : '<span class="badge bg-primary">Mensual</span>';
            const precio = c.precio_suscripcion
                ? '$' + parseFloat(c.precio_suscripcion).toLocaleString('es-MX')
                : '—';
            return `
                <tr>
                    <td><strong>${c.nombre}</strong></td>
                    <td>${c.empresa || '—'}</td>
                    <td>${c.pais || '—'}</td>
                    <td class="text-center">${suscBadge}</td>
                    <td class="text-center">${precio}</td>
                    <td>${c.fecha_vencimiento || '—'}</td>
                    <td class="text-center">${estatusBadge}</td>
                    <td class="text-center">
                        <button type="button" class="btn btn-sm btn-outline-secondary me-1" title="Ver detalle" onclick="viewClienteDetail(${c.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-info me-1" title="Editar" onclick="openClienteModal(${c.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger" title="Eliminar" onclick="deleteClienteSymbiot(${c.id}, '${c.nombre.replace(/'/g, "\\'")}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
        }).join('');
    } catch (err) {
        console.error('❌ loadClientesList error:', err);
    }
}

// ============================================================
// MODAL SENSOR — CRUD
// ============================================================

async function openSensorModal(id) {
    const modal   = new bootstrap.Modal(document.getElementById('sensorModal'));
    const labelEl = document.getElementById('sensorModalLabel');

    // Resetear todos los campos
    ['sensorId','sensorNombre','sensorModelo','sensorCiudad','sensorFechaInstalacion','sensorNotas',
     'sensorDeviceId','sensorDeviceCode','sensorToken','sensorApiUrl',
     'sensorVersion','sensorLicencia','sensorFrecuencia','sensorIntervalo'].forEach(f => {
        const el = document.getElementById(f);
        if (el) el.value = '';
    });
    document.getElementById('sensorTipo').value          = '';
    document.getElementById('sensorConexion').value      = 'WiFi';
    document.getElementById('sensorEstado').value        = 'Fabricacion';
    document.getElementById('sensorPais').value          = '';
    document.getElementById('sensorModoOperacion').value = '';

    await _populateClienteSelect('sensorClienteId');

    if (id) {
        if (labelEl) labelEl.textContent = 'Editar Sensor';
        try {
            const result = await window.apiGet('sensores', { empresa_id: 2 });
            const s = (result.data || []).find(x => x.id == id);
            if (s) {
                document.getElementById('sensorId').value               = s.id;
                document.getElementById('sensorNombre').value           = s.nombre               || '';
                document.getElementById('sensorTipo').value             = s.tipo_sensor          || '';
                document.getElementById('sensorConexion').value         = s.conexion             || 'WiFi';
                document.getElementById('sensorModelo').value           = s.modelo               || '';
                document.getElementById('sensorEstado').value           = s.estado               || 'Fabricacion';
                document.getElementById('sensorPais').value             = s.ubicacion_pais       || '';
                document.getElementById('sensorCiudad').value           = s.ubicacion_ciudad     || '';
                document.getElementById('sensorClienteId').value        = s.cliente_id           || '';
                document.getElementById('sensorFechaInstalacion').value = s.fecha_instalacion    ? s.fecha_instalacion.split(' ')[0] : '';
                document.getElementById('sensorNotas').value            = s.notas               || '';
                document.getElementById('sensorDeviceId').value         = s.device_id           || '';
                document.getElementById('sensorDeviceCode').value       = s.device_code         || '';
                document.getElementById('sensorToken').value            = s.token               || '';
                document.getElementById('sensorApiUrl').value           = s.api_url             || '';
                document.getElementById('sensorVersion').value          = s.version             || '';
                document.getElementById('sensorLicencia').value         = s.licencia            ?? '';
                document.getElementById('sensorModoOperacion').value    = s.modo_operacion      || '';
                document.getElementById('sensorFrecuencia').value       = s.frecuencia          ?? '';
                document.getElementById('sensorIntervalo').value        = s.intervalo_min       ?? '';
            }
        } catch (err) {
            console.error('Error cargando sensor:', err);
        }
    } else {
        if (labelEl) labelEl.textContent = 'Nuevo Sensor';
    }

    modal.show();
}

async function generarCredencialesSensor() {
    const btn = document.querySelector('#sensorModal button[onclick="generarCredencialesSensor()"]');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Generando…'; }
    try {
        const data = await apiGet('sensores/generar-credenciales');
        if (data.success) {
            document.getElementById('sensorDeviceId').value = data.device_id;
            document.getElementById('sensorToken').value    = data.token;
        } else {
            alert('No se pudieron generar credenciales: ' + (data.message || 'Error desconocido'));
        }
    } catch (err) {
        console.error('Error generando credenciales:', err);
        alert('Error de conexión al generar credenciales');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-dice me-1"></i>Generar ID y Token'; }
    }
}

async function saveSensor() {
    const id     = document.getElementById('sensorId').value;
    const nombre = document.getElementById('sensorNombre').value.trim();
    if (!nombre) {
        alert('El nombre del sensor es requerido');
        return;
    }

    const lic  = document.getElementById('sensorLicencia').value;
    const frec = document.getElementById('sensorFrecuencia').value;
    const intv = document.getElementById('sensorIntervalo').value;

    const payload = {
        nombre,
        empresa_id:        2,
        tipo_sensor:       document.getElementById('sensorTipo').value             || null,
        conexion:          document.getElementById('sensorConexion').value         || 'WiFi',
        modelo:            document.getElementById('sensorModelo').value.trim()    || null,
        estado:            document.getElementById('sensorEstado').value,
        ubicacion_pais:    document.getElementById('sensorPais').value             || null,
        ubicacion_ciudad:  document.getElementById('sensorCiudad').value.trim()    || null,
        cliente_id:        document.getElementById('sensorClienteId').value        || null,
        fecha_instalacion: document.getElementById('sensorFechaInstalacion').value || null,
        notas:             document.getElementById('sensorNotas').value.trim()     || null,
        device_id:         document.getElementById('sensorDeviceId').value.trim()  || null,
        device_code:       document.getElementById('sensorDeviceCode').value.trim()|| null,
        token:             document.getElementById('sensorToken').value.trim()     || null,
        api_url:           document.getElementById('sensorApiUrl').value.trim()    || null,
        version:           document.getElementById('sensorVersion').value.trim()   || null,
        licencia:          lic  !== '' ? parseInt(lic,  10) : null,
        modo_operacion:    document.getElementById('sensorModoOperacion').value    || null,
        frecuencia:        frec !== '' ? parseInt(frec, 10) : null,
        intervalo_min:     intv !== '' ? parseInt(intv, 10) : null,
    };

    try {
        let result;
        if (id) {
            result = await window.apiPut(`sensores/${id}`, payload);
        } else {
            result = await window.apiPost('sensores', payload);
        }

        if (result.success) {
            bootstrap.Modal.getInstance(document.getElementById('sensorModal')).hide();
            await refreshSymbiotData();
        } else {
            alert('Error guardando sensor: ' + (result.message || 'Error desconocido'));
        }
    } catch (err) {
        console.error('Error guardando sensor:', err);
        alert('Error de conexión');
    }
}

async function deleteSensor(id, nombre) {
    if (!confirm(`¿Eliminar sensor "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
        const result = await window.apiDelete(`sensores/${id}`);
        if (result.success) {
            await refreshSymbiotData();
        } else {
            alert('Error eliminando sensor: ' + (result.message || 'Error desconocido'));
        }
    } catch (err) {
        console.error('Error eliminando sensor:', err);
    }
}

// ============================================================
// MODAL CLIENTE — CRUD
// ============================================================

async function openClienteModal(id) {
    const modal   = new bootstrap.Modal(document.getElementById('clienteSymbiotModal'));
    const labelEl = document.getElementById('clienteSymbiotModalLabel');

    // Resetear
    ['clienteSymbiotId','clienteNombre','clienteEmpresa','clienteEmail','clienteTelefono',
     'clientePrecio','clienteFechaInicio','clienteFechaVencimiento','clienteNotas'].forEach(f => {
        const el = document.getElementById(f);
        if (el) el.value = '';
    });
    document.getElementById('clientePais').value            = '';
    document.getElementById('clienteTipoSuscripcion').value = 'Mensual';
    document.getElementById('clienteEstatus').value         = 'Activo';

    if (id) {
        if (labelEl) labelEl.textContent = 'Editar Cliente';
        try {
            const result  = await window.apiGet('clientes-symbiot', { empresa_id: 2 });
            const cliente = (result.data || []).find(c => c.id == id);
            if (cliente) {
                document.getElementById('clienteSymbiotId').value         = cliente.id;
                document.getElementById('clienteNombre').value            = cliente.nombre             || '';
                document.getElementById('clienteEmpresa').value           = cliente.empresa            || '';
                document.getElementById('clientePais').value              = cliente.pais               || '';
                document.getElementById('clienteEmail').value             = cliente.email              || '';
                document.getElementById('clienteTelefono').value          = cliente.telefono           || '';
                document.getElementById('clienteTipoSuscripcion').value   = cliente.tipo_suscripcion   || 'Mensual';
                document.getElementById('clientePrecio').value            = cliente.precio_suscripcion || '';
                document.getElementById('clienteEstatus').value           = cliente.estatus            || 'Activo';
                document.getElementById('clienteFechaInicio').value       = cliente.fecha_inicio       ? cliente.fecha_inicio.split(' ')[0]      : '';
                document.getElementById('clienteFechaVencimiento').value  = cliente.fecha_vencimiento  ? cliente.fecha_vencimiento.split(' ')[0] : '';
                document.getElementById('clienteNotas').value             = cliente.notas              || '';
            }
        } catch (err) {
            console.error('Error cargando cliente:', err);
        }
    } else {
        if (labelEl) labelEl.textContent = 'Nuevo Cliente';
    }

    modal.show();
}

async function saveClienteSymbiot() {
    const id     = document.getElementById('clienteSymbiotId').value;
    const nombre = document.getElementById('clienteNombre').value.trim();
    if (!nombre) {
        alert('El nombre del cliente es requerido');
        return;
    }

    const payload = {
        nombre,
        empresa_id:        2,
        empresa:           document.getElementById('clienteEmpresa').value.trim()          || null,
        pais:              document.getElementById('clientePais').value                    || null,
        email:             document.getElementById('clienteEmail').value.trim()            || null,
        telefono:          document.getElementById('clienteTelefono').value.trim()         || null,
        tipo_suscripcion:  document.getElementById('clienteTipoSuscripcion').value,
        precio_suscripcion: parseFloat(document.getElementById('clientePrecio').value) || 0,
        estatus:           document.getElementById('clienteEstatus').value,
        fecha_inicio:      document.getElementById('clienteFechaInicio').value             || null,
        fecha_vencimiento: document.getElementById('clienteFechaVencimiento').value        || null,
        notas:             document.getElementById('clienteNotas').value.trim()            || null,
    };

    try {
        let result;
        if (id) {
            result = await window.apiPut(`clientes-symbiot/${id}`, payload);
        } else {
            result = await window.apiPost('clientes-symbiot', payload);
        }

        if (result.success) {
            bootstrap.Modal.getInstance(document.getElementById('clienteSymbiotModal')).hide();
            await refreshSymbiotData();
        } else {
            alert('Error guardando cliente: ' + (result.message || 'Error desconocido'));
        }
    } catch (err) {
        console.error('Error guardando cliente:', err);
        alert('Error de conexión');
    }
}

async function deleteClienteSymbiot(id, nombre) {
    if (!confirm(`¿Eliminar cliente "${nombre}"? Sus sensores quedarán sin cliente asignado.`)) return;
    try {
        const result = await window.apiDelete(`clientes-symbiot/${id}`);
        if (result.success) {
            await refreshSymbiotData();
        } else {
            alert('Error eliminando cliente: ' + (result.message || 'Error desconocido'));
        }
    } catch (err) {
        console.error('Error eliminando cliente:', err);
    }
}

// ============================================================
// UTILIDADES
// ============================================================

function _setEl(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

async function _populateClienteSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    try {
        const result = await window.apiGet('clientes-symbiot', { empresa_id: 2, estatus: 'Activo' });
        const clientes = result.success ? (result.data || []) : [];
        const current = select.value;
        select.innerHTML = '<option value="">— Sin cliente —</option>'
            + clientes.map(c => `<option value="${c.id}">${c.nombre}${c.empresa ? ' (' + c.empresa + ')' : ''}</option>`).join('');
        if (current) select.value = current;
    } catch (err) {
        console.warn('No se pudo cargar lista de clientes:', err);
    }
}

async function refreshSymbiotData() {
    await loadSymbiotDataReal();
    await loadSensoresList();
    await loadClientesList();

    // Actualizar select de clientes en el filtro de sensores
    await _populateClienteSelect('symFilterCliente');
}

// Auto-poll: recarga la lista de sensores cada 60 s para reflejar
// cambios de estado (Activo → Inactivo por timeout de heartbeat)
(function startSensorStatePolling() {
    setInterval(loadSensoresList, 60 * 1000);
})();

// ============================================================
// MODAL DETALLE — SENSOR (vista de solo lectura)
// ============================================================

async function viewSensorDetail(id) {
    const modalEl = document.getElementById('sensorDetailModal');
    if (!modalEl) return;

    const SPINNER_HTML = `
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content bg-dark text-white">
                <div class="modal-header">
                    <h5 class="modal-title"><i class="fas fa-microchip me-2"></i>Información del Sensor</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar" title="Cerrar"></button>
                </div>
                <div class="modal-body text-center py-5">
                    <i class="fas fa-spinner fa-spin fa-2x text-info"></i>
                    <p class="mt-3 text-muted">Cargando información...</p>
                </div>
            </div>
        </div>`;
    modalEl.innerHTML = SPINNER_HTML;
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    try {
        const result = await window.apiGet('sensores', { empresa_id: 2 });
        const s = (result.data || []).find(x => x.id == id);
        if (!s) throw new Error('Sensor no encontrado');

        const estadoBadge      = _sensorEstadoBadge(s.estado);
        const ultimaConexion   = s.fecha_ultimo_contacto
            ? new Date(s.fecha_ultimo_contacto).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'medium' })
            : '—';
        const ultimaActualizacion = s.updated_at
            ? new Date(s.updated_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'medium' })
            : '—';
        const fechaCreacion    = s.created_at
            ? new Date(s.created_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'medium' })
            : '—';
        const fechaInstalacion = s.fecha_instalacion
            ? new Date(s.fecha_instalacion + 'T00:00:00').toLocaleDateString('es-MX', { dateStyle: 'medium' })
            : '—';

        // — Sección "Datos del Sensor": solo para Acelerómetro y Temperatura —
        const tienesDatos = ['Acelerómetro Inalámbrico','Temperatura Digital ESP01'].includes(s.tipo_sensor);
        const esAcelerometro = s.tipo_sensor === 'Acelerómetro Inalámbrico';
        const tieneTemperatura = s.temperatura !== null && s.temperatura !== undefined;

        const datosSensorHtml = tienesDatos ? `
            <hr class="border-secondary my-3">
            <h6 class="text-info mb-3"><i class="fas fa-chart-bar me-2"></i>Datos del Sensor</h6>
            <div class="row g-2">
                ${esAcelerometro ? `
                <div class="col-md-4 mb-2">
                    <div class="card border-danger h-100">
                        <div class="card-header bg-danger text-white py-2">
                            <h6 class="mb-0"><i class="fas fa-arrow-right me-1"></i>Eje X</h6>
                        </div>
                        <div class="card-body py-2">
                            <h4 class="text-danger mb-0">${s.eje_x !== null && s.factor_x !== null ? (s.eje_x * s.factor_x).toFixed(6) : s.eje_x ?? '—'} <small class="fs-6">g</small></h4>
                            <small class="text-muted">Raw: <span class="font-monospace">${s.eje_x ?? '—'}</span></small>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-2">
                    <div class="card border-success h-100">
                        <div class="card-header bg-success text-white py-2">
                            <h6 class="mb-0"><i class="fas fa-arrow-up me-1"></i>Eje Y</h6>
                        </div>
                        <div class="card-body py-2">
                            <h4 class="text-success mb-0">${s.eje_y !== null && s.factor_y !== null ? (s.eje_y * s.factor_y).toFixed(6) : s.eje_y ?? '—'} <small class="fs-6">g</small></h4>
                            <small class="text-muted">Raw: <span class="font-monospace">${s.eje_y ?? '—'}</span></small>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-2">
                    <div class="card border-info h-100">
                        <div class="card-header bg-info text-white py-2">
                            <h6 class="mb-0"><i class="fas fa-arrows-alt-v me-1"></i>Eje Z</h6>
                        </div>
                        <div class="card-body py-2">
                            <h4 class="text-info mb-0">${s.eje_z !== null && s.factor_z !== null ? (s.eje_z * s.factor_z).toFixed(6) : s.eje_z ?? '—'} <small class="fs-6">g</small></h4>
                            <small class="text-muted">Raw: <span class="font-monospace">${s.eje_z ?? '—'}</span></small>
                        </div>
                    </div>
                </div>` : ''}
                ${tieneTemperatura ? `
                <div class="col-md-4">
                    <div class="card bg-secondary bg-opacity-25 border-secondary text-center p-2">
                        <div class="small text-muted mb-1">Temperatura</div>
                        <div class="fs-5 text-warning fw-bold">${s.temperatura}°C</div>
                    </div>
                </div>` : ''}
                ${s.bateria_mv !== null ? `
                <div class="col-md-4">
                    <div class="card bg-secondary bg-opacity-25 border-secondary text-center p-2">
                        <div class="small text-muted mb-1">Batería (mV)</div>
                        <div class="fs-5 text-success fw-bold">${s.bateria_mv}</div>
                    </div>
                </div>` : ''}
                ${s.alimentacion_mv !== null ? `
                <div class="col-md-4">
                    <div class="card bg-secondary bg-opacity-25 border-secondary text-center p-2">
                        <div class="small text-muted mb-1">Alimentación (mV)</div>
                        <div class="fs-5 text-info fw-bold">${s.alimentacion_mv}</div>
                    </div>
                </div>` : ''}
            </div>` : '';

        modalEl.innerHTML = `
            <div class="modal-dialog modal-xl modal-dialog-scrollable">
                <div class="modal-content bg-dark text-white">
                    <div class="modal-header">
                        <h5 class="modal-title" id="sensorDetailModalLabel">
                            <i class="fas fa-microchip me-2"></i>Información del Sensor
                            <small class="text-muted ms-2 fs-6">${s.device_code || s.nombre}</small>
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar" title="Cerrar"></button>
                    </div>
                    <div class="modal-body" style="overflow-x:hidden">

                        <!-- SECCIÓN 1: Información General -->
                        <h6 class="text-info mb-3"><i class="fas fa-info-circle me-2"></i>Información General</h6>
                        <div class="row gy-2 gx-0 mb-3">
                            <div class="col-md-6">
                                <table class="table table-dark table-sm mb-0" style="table-layout:fixed;width:100%">
                                    <tr><td class="text-muted" style="width:38%;overflow:hidden;white-space:nowrap">Dispositivo</td><td class="font-monospace small" style="word-break:break-all;overflow-wrap:anywhere">${s.device_code || '—'}</td></tr>
                                    <tr><td class="text-muted" style="overflow:hidden;white-space:nowrap">ID</td><td class="font-monospace small" style="word-break:break-all;overflow-wrap:anywhere">${s.device_id || '—'}</td></tr>
                                    <tr><td class="text-muted" style="overflow:hidden;white-space:nowrap">Token</td><td class="font-monospace small" style="word-break:break-all;overflow-wrap:anywhere">${s.token || '—'}</td></tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <table class="table table-dark table-sm mb-0" style="table-layout:fixed;width:100%">
                                    <tr><td class="text-muted" style="width:40%;overflow:hidden;white-space:nowrap">Tipo</td><td style="word-break:break-all;overflow-wrap:anywhere">${s.tipo_sensor || '—'}</td></tr>
                                    <tr><td class="text-muted" style="overflow:hidden;white-space:nowrap">Estado</td><td>${estadoBadge}</td></tr>
                                    <tr><td class="text-muted" style="overflow:hidden;white-space:nowrap">Ubicación</td><td style="word-break:break-all;overflow-wrap:anywhere">${s.ubicacion_pais || '—'}${s.ubicacion_ciudad ? ' / ' + s.ubicacion_ciudad : ''}</td></tr>
                                    <tr><td class="text-muted" style="overflow:hidden;white-space:nowrap">Cliente</td><td style="word-break:break-all;overflow-wrap:anywhere">${s.cliente_nombre ? '<strong>' + s.cliente_nombre + '</strong>' : '<span class="text-muted">Sin asignar</span>'}</td></tr>
                                </table>
                            </div>
                            <div class="col-md-4"><div class="text-muted small">Fecha Creación</div><div class="small">${fechaCreacion}</div></div>
                            <div class="col-md-4"><div class="text-muted small">Última Actualización</div><div class="small">${ultimaActualizacion}</div></div>
                            <div class="col-md-4"><div class="text-muted small">Última Conexión</div><div class="small">${ultimaConexion}</div></div>
                        </div>

                        <hr class="border-secondary my-3">

                        <!-- SECCIÓN 2: Información del Dispositivo -->
                        <h6 class="text-info mb-3"><i class="fas fa-cog me-2"></i>Información del Dispositivo</h6>
                        <div class="row gy-2 gx-0 mb-1">
                            <div class="col-md-6">
                                <table class="table table-dark table-sm mb-0" style="table-layout:fixed;width:100%">
                                    <tr><td class="text-muted" style="width:44%;overflow:hidden;white-space:nowrap">Versión</td><td style="word-break:break-all;overflow-wrap:anywhere">${s.version || '—'}</td></tr>
                                    <tr><td class="text-muted" style="overflow:hidden;white-space:nowrap">Licencia</td><td style="word-break:break-all;overflow-wrap:anywhere">${s.licencia !== null ? s.licencia : '—'}</td></tr>
                                    <tr><td class="text-muted" style="overflow:hidden;white-space:nowrap">Modo Operación</td><td style="word-break:break-all;overflow-wrap:anywhere">${s.modo_operacion || '—'}</td></tr>
                                    <tr><td class="text-muted" style="overflow:hidden;white-space:nowrap">Conexión</td><td style="word-break:break-all;overflow-wrap:anywhere">${s.conexion || '—'}</td></tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <table class="table table-dark table-sm mb-0" style="table-layout:fixed;width:100%">
                                    <tr><td class="text-muted" style="width:44%;overflow:hidden;white-space:nowrap">URL de API</td><td class="small font-monospace" style="word-break:break-all;overflow-wrap:anywhere">${s.api_url || '—'}</td></tr>
                                    <tr><td class="text-muted" style="overflow:hidden;white-space:nowrap">Frecuencia (Hz)</td><td style="word-break:break-all;overflow-wrap:anywhere">${s.frecuencia !== null ? s.frecuencia : '—'}</td></tr>
                                    <tr><td class="text-muted" style="overflow:hidden;white-space:nowrap">Intervalo (min)</td><td style="word-break:break-all;overflow-wrap:anywhere">${s.intervalo_min !== null ? s.intervalo_min : '—'}</td></tr>
                                    <tr><td class="text-muted" style="overflow:hidden;white-space:nowrap">Instalación</td><td style="word-break:break-all;overflow-wrap:anywhere">${fechaInstalacion}</td></tr>
                                </table>
                            </div>
                        </div>

                        ${datosSensorHtml}

                        ${s.notas ? `<hr class="border-secondary my-3">
                        <h6 class="text-info mb-2"><i class="fas fa-sticky-note me-2"></i>Notas</h6>
                        <p class="text-muted small border border-secondary rounded p-2 mb-0">${s.notas}</p>` : ''}

                    </div>
                    <div class="modal-footer">
                        <a href="sensordetails.html?id=${s.id}" class="btn btn-outline-info me-auto">
                            <i class="fas fa-arrow-up-right-from-square me-1"></i>Ver todos los detalles
                        </a>
                        <button type="button" class="btn btn-primary" onclick="openSensorModal(${s.id}); bootstrap.Modal.getInstance(document.getElementById('sensorDetailModal')).hide();">
                            <i class="fas fa-edit me-1"></i>Editar
                        </button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i>Cerrar
                        </button>
                    </div>
                </div>
            </div>`;
    } catch (err) {
        console.error('Error en viewSensorDetail:', err);
        modalEl.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content bg-dark text-white">
                    <div class="modal-header">
                        <h5 class="modal-title">Error</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar" title="Cerrar"></button>
                    </div>
                    <div class="modal-body text-danger">No se pudo cargar la información del sensor.</div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>`;
    }
}

// ============================================================
// MODAL DETALLE — CLIENTE (vista de solo lectura)
// ============================================================

async function viewClienteDetail(id) {
    const modalEl = document.getElementById('clienteSymbiotDetailModal');
    if (!modalEl) return;

    modalEl.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content bg-dark text-white">
                <div class="modal-header">
                    <h5 class="modal-title" id="clienteSymbiotDetailModalLabel">
                        <i class="fas fa-handshake me-2"></i>Información del Cliente
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar" title="Cerrar"></button>
                </div>
                <div class="modal-body text-center py-5">
                    <i class="fas fa-spinner fa-spin fa-2x text-info"></i>
                    <p class="mt-3 text-muted">Cargando información...</p>
                </div>
            </div>
        </div>`;

    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    try {
        // Cargar cliente y sus sensores en paralelo
        const [clientesResult, sensoresResult] = await Promise.all([
            window.apiGet('clientes-symbiot', { empresa_id: 2 }),
            window.apiGet('sensores', { empresa_id: 2, cliente_id: id }),
        ]);

        const c = (clientesResult.data || []).find(x => x.id == id);
        if (!c) throw new Error('Cliente no encontrado');

        const sensores = sensoresResult.data || [];

        const estatusBadge = c.estatus === 'Activo'
            ? '<span class="badge bg-success">Activo</span>'
            : '<span class="badge bg-secondary">Baja</span>';
        const suscBadge = c.tipo_suscripcion === 'Anual'
            ? '<span class="badge bg-info">Anual</span>'
            : '<span class="badge bg-primary">Mensual</span>';

        const diasRestantes = c.fecha_vencimiento
            ? Math.ceil((new Date(c.fecha_vencimiento) - new Date()) / 86400000)
            : null;
        let diasHtml = '—';
        if (diasRestantes !== null) {
            const cls  = diasRestantes < 0 ? 'text-danger' : (diasRestantes <= 7 ? 'text-warning' : 'text-success');
            const txt  = diasRestantes < 0 ? `Vencido hace ${Math.abs(diasRestantes)} días` : `${diasRestantes} días restantes`;
            diasHtml = `<span class="${cls}">${txt}</span>`;
        }

        const sensoresHtml = sensores.length
            ? `<div class="table-responsive">
                <table class="table table-dark table-sm mb-0">
                    <thead><tr><th>Sensor</th><th>Tipo</th><th>Ubicación</th><th class="text-center">Estado</th></tr></thead>
                    <tbody>
                        ${sensores.map(s => `
                        <tr>
                            <td><strong>${s.nombre}</strong></td>
                            <td>${s.tipo_sensor || '—'}</td>
                            <td>${s.ubicacion_pais || '—'}${s.ubicacion_ciudad ? ' / ' + s.ubicacion_ciudad : ''}</td>
                            <td class="text-center">${_sensorEstadoBadge(s.estado)}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
               </div>`
            : '<p class="text-muted mb-0">Este cliente no tiene sensores asignados.</p>';

        modalEl.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content bg-dark text-white">
                    <div class="modal-header">
                        <h5 class="modal-title" id="clienteSymbiotDetailModalLabel">
                            <i class="fas fa-handshake me-2"></i>Información del Cliente
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar" title="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <!-- Columna izquierda: datos del cliente -->
                            <div class="col-md-6">
                                <h6 class="text-info mb-3"><i class="fas fa-user me-2"></i>Datos del Cliente</h6>
                                <table class="table table-dark table-sm">
                                    <tr><td class="text-muted" style="width:45%">Nombre</td><td><strong>${c.nombre}</strong></td></tr>
                                    <tr><td class="text-muted">Empresa</td><td>${c.empresa || '—'}</td></tr>
                                    <tr><td class="text-muted">País</td><td>${c.pais || '—'}</td></tr>
                                    <tr><td class="text-muted">Email</td><td>${c.email || '—'}</td></tr>
                                    <tr><td class="text-muted">Teléfono</td><td>${c.telefono || '—'}</td></tr>
                                    <tr><td class="text-muted">Estatus</td><td>${estatusBadge}</td></tr>
                                </table>
                            </div>
                            <!-- Columna derecha: suscripción -->
                            <div class="col-md-6">
                                <h6 class="text-info mb-3"><i class="fas fa-file-invoice-dollar me-2"></i>Suscripción</h6>
                                <table class="table table-dark table-sm">
                                    <tr><td class="text-muted" style="width:50%">Tipo</td><td>${suscBadge}</td></tr>
                                    <tr><td class="text-muted">Precio</td><td><strong>$${parseFloat(c.precio_suscripcion || 0).toLocaleString('es-MX')}</strong></td></tr>
                                    <tr><td class="text-muted">Inicio</td><td>${c.fecha_inicio || '—'}</td></tr>
                                    <tr><td class="text-muted">Vencimiento</td><td>${c.fecha_vencimiento || '—'}</td></tr>
                                    <tr><td class="text-muted">Vigencia</td><td>${diasHtml}</td></tr>
                                </table>
                                ${c.notas ? `
                                <h6 class="text-info mt-3 mb-2"><i class="fas fa-sticky-note me-2"></i>Notas</h6>
                                <p class="text-muted small border border-secondary rounded p-2">${c.notas}</p>` : ''}
                            </div>
                        </div>
                        <!-- Sensores del cliente -->
                        <hr class="border-secondary my-3">
                        <h6 class="text-info mb-3">
                            <i class="fas fa-microchip me-2"></i>Sensores Asignados
                            <span class="badge bg-secondary ms-2">${sensores.length}</span>
                        </h6>
                        ${sensoresHtml}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="openClienteModal(${c.id}); bootstrap.Modal.getInstance(document.getElementById('clienteSymbiotDetailModal')).hide();">
                            <i class="fas fa-edit me-1"></i>Editar
                        </button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i>Cerrar
                        </button>
                    </div>
                </div>
            </div>`;
    } catch (err) {
        console.error('Error en viewClienteDetail:', err);
        modalEl.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content bg-dark text-white">
                    <div class="modal-header">
                        <h5 class="modal-title">Error</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar" title="Cerrar"></button>
                    </div>
                    <div class="modal-body text-danger">No se pudo cargar la información del cliente.</div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>`;
    }
}
