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

    // Buscar México y Chile en distribución
    const mx = geo.find(g => g.pais === 'México') || {};
    const cl = geo.find(g => g.pais === 'Chile')  || {};
    _setEl('symPaisMX', (mx.activos || 0) + (mx.inactivos || 0));
    _setEl('symPaisCL', (cl.activos || 0) + (cl.inactivos || 0));

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

    container.innerHTML = geo.map(g => `
        <div class="text-center me-3">
            <span class="badge bg-info" style="font-size:0.95rem;">${g.pais}</span>
            <div class="mt-1">
                <small class="text-success me-1"><i class="fas fa-circle" style="font-size:0.6rem;"></i> ${g.activos} activos</small>
                <small class="text-danger"><i class="fas fa-circle" style="font-size:0.6rem;"></i> ${g.inactivos} inactivos</small>
            </div>
        </div>
    `).join('');
}

function _updateMovimientosMes(mov, clientes) {
    _setEl('symEncendidosMes',    mov.encendidos    || 0);
    _setEl('symDesconectadosMes', mov.desconectados || 0);
    _setEl('symNuevosPedidosMes', mov.nuevos_pedidos || 0);
    _setEl('symClientesActivos',  clientes.activos  || 0);
    _setEl('symClientesTotal',    clientes.total    || 0);
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
    const modal     = new bootstrap.Modal(document.getElementById('sensorModal'));
    const labelEl   = document.getElementById('sensorModalLabel');

    // Resetear formulario
    ['sensorId','sensorNombre','sensorTipo','sensorModelo','sensorCiudad','sensorFechaInstalacion','sensorNotas'].forEach(f => {
        const el = document.getElementById(f);
        if (el) el.value = '';
    });
    document.getElementById('sensorEstado').value = 'Fabricacion';
    document.getElementById('sensorPais').value   = '';

    // Poblar select de clientes
    await _populateClienteSelect('sensorClienteId');

    if (id) {
        // Modo edición
        if (labelEl) labelEl.textContent = 'Editar Sensor';
        try {
            const result = await window.apiGet('sensores', { empresa_id: 2 });
            const sensor = (result.data || []).find(s => s.id == id);
            if (sensor) {
                document.getElementById('sensorId').value               = sensor.id;
                document.getElementById('sensorNombre').value           = sensor.nombre        || '';
                document.getElementById('sensorTipo').value             = sensor.tipo_sensor   || '';
                document.getElementById('sensorModelo').value           = sensor.modelo        || '';
                document.getElementById('sensorEstado').value           = sensor.estado        || 'Fabricacion';
                document.getElementById('sensorPais').value             = sensor.ubicacion_pais   || '';
                document.getElementById('sensorCiudad').value           = sensor.ubicacion_ciudad || '';
                document.getElementById('sensorClienteId').value        = sensor.cliente_id    || '';
                document.getElementById('sensorFechaInstalacion').value = sensor.fecha_instalacion ? sensor.fecha_instalacion.split(' ')[0] : '';
                document.getElementById('sensorNotas').value            = sensor.notas         || '';
            }
        } catch (err) {
            console.error('Error cargando sensor:', err);
        }
    } else {
        if (labelEl) labelEl.textContent = 'Nuevo Sensor';
    }

    modal.show();
}

async function saveSensor() {
    const id     = document.getElementById('sensorId').value;
    const nombre = document.getElementById('sensorNombre').value.trim();
    if (!nombre) {
        alert('El nombre del sensor es requerido');
        return;
    }

    const payload = {
        nombre,
        empresa_id:          2,
        tipo_sensor:         document.getElementById('sensorTipo').value.trim()  || null,
        modelo:              document.getElementById('sensorModelo').value.trim() || null,
        estado:              document.getElementById('sensorEstado').value,
        ubicacion_pais:      document.getElementById('sensorPais').value          || null,
        ubicacion_ciudad:    document.getElementById('sensorCiudad').value.trim() || null,
        cliente_id:          document.getElementById('sensorClienteId').value     || null,
        fecha_instalacion:   document.getElementById('sensorFechaInstalacion').value || null,
        notas:               document.getElementById('sensorNotas').value.trim()  || null,
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
