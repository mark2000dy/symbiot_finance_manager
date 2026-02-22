/**
 * Notifications Module - v1.0.0
 * Campanita de notificaciones para el navbar de Symbiot.
 * Depende de api-client.js (window.API_BASE_URL, window.apiFetch).
 */
(function () {
    'use strict';

    var _notifications = [];
    var _panelOpen     = false;
    var _pollTimer     = null;
    var POLL_MS        = 60000; // Refresco cada 60 s

    // ----------------------------------------------------------------
    // Utilidades
    // ----------------------------------------------------------------

    function formatDate(isoStr) {
        var d   = new Date(isoStr);
        var dd  = String(d.getDate()).padStart(2, '0');
        var mm  = String(d.getMonth() + 1).padStart(2, '0');
        var yy  = String(d.getFullYear()).slice(2);
        var hh  = String(d.getHours()).padStart(2, '0');
        var min = String(d.getMinutes()).padStart(2, '0');
        return dd + '/' + mm + '/' + yy + ' ' + hh + ':' + min;
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getTypeIcon(tipo) {
        var map = {
            alta_alumno:       'fa-user-plus text-success',
            baja_alumno:       'fa-user-minus text-danger',
            modificacion_alumno: 'fa-user-edit text-warning',
            transaccion:       'fa-receipt text-info',
            login_maestro:     'fa-sign-in-alt'
        };
        return map[tipo] || 'fa-bell text-secondary';
    }

    function getEmpresaId() {
        try {
            var u  = JSON.parse(localStorage.getItem('user_data') || '{}');
            var id = parseInt(u.empresa, 10);
            return isNaN(id) || id <= 0 ? 1 : id;
        } catch (e) {
            return 1;
        }
    }

    // ----------------------------------------------------------------
    // API
    // ----------------------------------------------------------------

    // Detectar si estamos en el portal de maestros
    var isMaestroPortal = window.location.pathname.indexOf('maestros.html') !== -1;

    function fetchNotifications() {
        if (typeof window.apiFetch !== 'function') return;
        var empresaId = getEmpresaId();
        var url = 'notificaciones?empresa_id=' + empresaId;
        if (isMaestroPortal) url += '&portal=maestro';

        window.apiFetch(url)
            .then(function (data) {
                if (data && data.success) {
                    _notifications = data.data || [];
                    updateBadge(data.unread || 0);
                    if (_panelOpen) renderList();
                }
            })
            .catch(function (e) {
                console.warn('[Notifications] fetch error:', e);
            });
    }

    function dismissNotification(id) {
        if (typeof window.apiFetch !== 'function') return;

        window.apiFetch('notificaciones/' + id + '/leida', { method: 'PUT' })
            .then(function (data) {
                if (data && data.success) {
                    _notifications.forEach(function (n) {
                        if (n.id == id) n.leida = true;
                    });
                    var unread = _notifications.filter(function (n) { return !n.leida; }).length;
                    updateBadge(unread);
                    renderList();
                }
            })
            .catch(function (e) {
                console.warn('[Notifications] dismiss error:', e);
            });
    }

    // ----------------------------------------------------------------
    // Badge
    // ----------------------------------------------------------------

    function updateBadge(count) {
        var badge = document.getElementById('notificationsBadge');
        if (!badge) return;
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : String(count);
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    // ----------------------------------------------------------------
    // Panel rendering
    // ----------------------------------------------------------------

    function renderList() {
        var container = document.getElementById('notificationsList');
        if (!container) return;

        if (!_notifications.length) {
            container.innerHTML =
                '<p style="text-align:center;color:rgba(255,255,255,0.4);padding:24px 16px;font-size:0.85rem;margin:0;">Sin notificaciones</p>';
            return;
        }

        var html = '';
        _notifications.forEach(function (n) {
            var read      = n.leida;
            var bgStyle   = read ? '' : 'background:rgba(255,255,255,0.04);';
            var opStyle   = read ? 'opacity:0.5;' : '';
            var iconClass = getTypeIcon(n.tipo);

            html += '<div class="notif-item" id="notif-' + n.id + '" style="' +
                bgStyle + opStyle +
                'border-bottom:1px solid rgba(255,255,255,0.06);padding:10px 14px;display:flex;align-items:flex-start;gap:10px;">';

            // Icono tipo
            html += '<i class="fas ' + iconClass + '" style="margin-top:3px;font-size:0.8rem;flex-shrink:0;width:14px;text-align:center;"></i>';

            // Texto
            html += '<div style="flex:1;min-width:0;">';
            html += '<div style="font-size:0.72rem;color:rgba(255,255,255,0.45);margin-bottom:2px;">' +
                escapeHtml(formatDate(n.created_at)) + '</div>';
            html += '<div style="font-size:0.82rem;color:rgba(255,255,255,0.88);line-height:1.35;">' +
                escapeHtml(n.mensaje) + '</div>';
            html += '</div>';

            // Botón X (solo no leídas)
            if (!read) {
                html += '<button onclick="window.NotificationsModule.dismiss(' + n.id + ')" ' +
                    'style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;padding:2px 4px;flex-shrink:0;line-height:1;" ' +
                    'title="Marcar como leída">' +
                    '<i class="fas fa-times" style="font-size:0.7rem;"></i></button>';
            }

            html += '</div>';
        });

        container.innerHTML = html;
    }

    // ----------------------------------------------------------------
    // Panel toggle / close
    // ----------------------------------------------------------------

    function togglePanel() {
        _panelOpen = !_panelOpen;
        var panel = document.getElementById('notificationsPanel');
        if (!panel) return;
        if (_panelOpen) {
            renderList();
            panel.style.display = 'block';
        } else {
            panel.style.display = 'none';
        }
    }

    function closePanel() {
        _panelOpen = false;
        var panel = document.getElementById('notificationsPanel');
        if (panel) panel.style.display = 'none';
    }

    // Cerrar al hacer clic fuera del panel o del botón
    document.addEventListener('click', function (e) {
        if (!_panelOpen) return;
        var bell  = document.getElementById('notificationsBellBtn');
        var panel = document.getElementById('notificationsPanel');
        if (bell && panel && !bell.contains(e.target) && !panel.contains(e.target)) {
            closePanel();
        }
    });

    // ----------------------------------------------------------------
    // Inyectar HTML: botón campanita en navbar + panel flotante
    // ----------------------------------------------------------------

    function injectBell() {
        // Insertar antes del Theme Toggle Button (primer <li> del nav derecho)
        var navRight = document.querySelector('.navbar-nav:not(.me-auto)');
        if (!navRight || document.getElementById('notificationsNavItem')) return;

        var li = document.createElement('li');
        li.id        = 'notificationsNavItem';
        li.className = 'nav-item d-flex align-items-center';
        li.style.marginRight = '4px';
        li.innerHTML =
            '<div class="position-relative">' +
                '<button type="button" id="notificationsBellBtn" ' +
                    'class="btn btn-link text-white p-1" ' +
                    'title="Notificaciones" aria-label="Notificaciones">' +
                    '<i class="fas fa-bell" style="font-size:1.05rem;"></i>' +
                    '<span id="notificationsBadge" ' +
                        'style="display:none;position:absolute;top:2px;left:60%;' +
                        'min-width:16px;height:16px;padding:0 4px;font-size:0.6rem;' +
                        'line-height:16px;text-align:center;border-radius:9999px;' +
                        'background:#dc3545;color:#fff;font-weight:700;">0</span>' +
                '</button>' +
            '</div>';

        navRight.insertBefore(li, navRight.firstElementChild);
        document.getElementById('notificationsBellBtn').addEventListener('click', togglePanel);
    }

    function injectPanel() {
        if (document.getElementById('notificationsPanel')) return;

        var panel = document.createElement('div');
        panel.id             = 'notificationsPanel';
        panel.style.cssText  =
            'display:none;position:fixed;top:62px;right:14px;width:360px;' +
            'max-height:480px;overflow-y:auto;z-index:10500;' +
            'background:rgba(20,22,30,0.98);' +
            'border:1px solid rgba(255,255,255,0.12);' +
            'border-radius:12px;' +
            'box-shadow:0 8px 32px rgba(0,0,0,0.65);' +
            'backdrop-filter:blur(18px);';

        panel.innerHTML =
            // Cabecera fija
            '<div style="position:sticky;top:0;padding:11px 16px;' +
                'border-bottom:1px solid rgba(255,255,255,0.1);' +
                'background:rgba(20,22,30,0.99);' +
                'display:flex;justify-content:space-between;align-items:center;' +
                'border-radius:12px 12px 0 0;">' +
                '<span style="font-weight:600;color:#fff;font-size:0.88rem;">' +
                    '<i class="fas fa-bell me-2" style="color:#f0b429;"></i>Notificaciones' +
                '</span>' +
                '<button onclick="window.NotificationsModule.close()" ' +
                    'style="background:none;border:none;color:rgba(255,255,255,0.45);' +
                    'cursor:pointer;padding:3px 6px;font-size:0.85rem;" title="Cerrar">' +
                    '<i class="fas fa-times"></i>' +
                '</button>' +
            '</div>' +
            // Lista
            '<div id="notificationsList" style="padding:4px 0;">' +
                '<p style="text-align:center;color:rgba(255,255,255,0.4);' +
                    'padding:24px 16px;font-size:0.85rem;margin:0;">Cargando...</p>' +
            '</div>';

        document.body.appendChild(panel);
    }

    // ----------------------------------------------------------------
    // Init
    // ----------------------------------------------------------------

    function init() {
        injectBell();
        injectPanel();
        fetchNotifications();
        _pollTimer = setInterval(fetchNotifications, POLL_MS);
    }

    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ----------------------------------------------------------------
    // API pública
    // ----------------------------------------------------------------
    window.NotificationsModule = {
        dismiss: dismissNotification,
        toggle:  togglePanel,
        close:   closePanel,
        refresh: fetchNotifications
    };

})();
