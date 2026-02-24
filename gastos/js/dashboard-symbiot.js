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

// ============================================================
// MODAL DETALLE — SENSOR (vista de solo lectura)
// ============================================================

async function viewSensorDetail(id) {
    const modalEl = document.getElementById('sensorDetailModal');
    if (!modalEl) return;

    // Inyectar spinner mientras carga
    modalEl.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content bg-dark text-white">
                <div class="modal-header">
                    <h5 class="modal-title" id="sensorDetailModalLabel">
                        <i class="fas fa-microchip me-2"></i>Información del Sensor
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
        const result = await window.apiGet('sensores', { empresa_id: 2 });
        const s = (result.data || []).find(x => x.id == id);
        if (!s) throw new Error('Sensor no encontrado');

        const estadoBadge = _sensorEstadoBadge(s.estado);
        const ultimoContacto = s.fecha_ultimo_contacto
            ? new Date(s.fecha_ultimo_contacto).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
            : 'Sin registros';
        const fechaInstalacion = s.fecha_instalacion
            ? new Date(s.fecha_instalacion + 'T00:00:00').toLocaleDateString('es-MX', { dateStyle: 'medium' })
            : 'No instalado';

        modalEl.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content bg-dark text-white">
                    <div class="modal-header">
                        <h5 class="modal-title" id="sensorDetailModalLabel">
                            <i class="fas fa-microchip me-2"></i>Información del Sensor
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar" title="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <!-- Columna izquierda: datos del sensor -->
                            <div class="col-md-6">
                                <h6 class="text-info mb-3"><i class="fas fa-microchip me-2"></i>Datos del Sensor</h6>
                                <table class="table table-dark table-sm">
                                    <tr><td class="text-muted" style="width:45%">Nombre</td><td><strong>${s.nombre}</strong></td></tr>
                                    <tr><td class="text-muted">Tipo</td><td>${s.tipo_sensor || '—'}</td></tr>
                                    <tr><td class="text-muted">Modelo</td><td>${s.modelo || '—'}</td></tr>
                                    <tr><td class="text-muted">Estado</td><td>${estadoBadge}</td></tr>
                                    <tr><td class="text-muted">País</td><td>${s.ubicacion_pais || '—'}</td></tr>
                                    <tr><td class="text-muted">Ciudad</td><td>${s.ubicacion_ciudad || '—'}</td></tr>
                                </table>
                            </div>
                            <!-- Columna derecha: fechas y cliente -->
                            <div class="col-md-6">
                                <h6 class="text-info mb-3"><i class="fas fa-calendar-alt me-2"></i>Historial y Asignación</h6>
                                <table class="table table-dark table-sm">
                                    <tr><td class="text-muted" style="width:50%">Instalación</td><td>${fechaInstalacion}</td></tr>
                                    <tr><td class="text-muted">Último contacto</td><td>${ultimoContacto}</td></tr>
                                    <tr><td class="text-muted">Cliente</td><td>${s.cliente_nombre ? `<strong>${s.cliente_nombre}</strong>` : '<span class="text-muted">Sin asignar</span>'}</td></tr>
                                    <tr><td class="text-muted">Empresa cliente</td><td>${s.cliente_empresa || '—'}</td></tr>
                                </table>
                                ${s.notas ? `
                                <h6 class="text-info mt-3 mb-2"><i class="fas fa-sticky-note me-2"></i>Notas</h6>
                                <p class="text-muted small border border-secondary rounded p-2">${s.notas}</p>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
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
