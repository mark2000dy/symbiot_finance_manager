/**
 * recibo-generator.js v1.0.0
 * Generador de Recibos de Pago — Rockstar Skull / Academia de Música
 *
 * Requiere: jsPDF 2.5.x + jspdf-autotable 3.x (cargados vía CDN antes de este script)
 */

(function () {
    'use strict';

    // ──────────────────────────────────────────────────────────────
    // CACHÉ DE IMÁGENES (se pre-cargan una sola vez al iniciar)
    // ──────────────────────────────────────────────────────────────
    let _logoBase64  = null;
    let _firmaBase64 = null;
    let _preloaded   = false;

    /**
     * Carga una URL de imagen como base64 usando un canvas temporal.
     * Devuelve null si no existe (no lanza error).
     */
    function _loadImg(url) {
        return new Promise(function (resolve) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function () {
                try {
                    const c = document.createElement('canvas');
                    c.width  = img.naturalWidth;
                    c.height = img.naturalHeight;
                    c.getContext('2d').drawImage(img, 0, 0);
                    resolve(c.toDataURL('image/png'));
                } catch (e) {
                    resolve(null);
                }
            };
            img.onerror = function () { resolve(null); };
            // cachebust para evitar que el browser sirva una versión antigua
            img.src = url + '?_=' + Date.now();
        });
    }

    /** Pre-carga logo y firma la primera vez */
    async function _preload() {
        if (_preloaded) return;
        const base = _getBase();
        const results = await Promise.all([
            _loadImg(base + 'assets/images/RSLogo.png'),
            _loadImg(base + 'assets/images/firma_mad.png')
        ]);
        _logoBase64  = results[0];
        _firmaBase64 = results[1];
        _preloaded   = true;
        console.log('🖼️ Recibo assets:', { logo: !!_logoBase64, firma: !!_firmaBase64 });
    }

    /** Determina el base-path de la carpeta gastos/ según la URL actual */
    function _getBase() {
        const path = window.location.pathname; // e.g. /symbiot/.../gastos/dashboard.html
        const idx  = path.indexOf('/gastos/');
        return (idx !== -1) ? path.substring(0, idx + '/gastos/'.length) : './';
    }

    // ──────────────────────────────────────────────────────────────
    // UTILIDADES
    // ──────────────────────────────────────────────────────────────

    /** Formatea un monto como $1,500.00 */
    function _fmtMXN(n) {
        return '$' + parseFloat(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Formatea fecha al estilo del recibo: "03-Octubre- 2025"
     * Acepta "YYYY-MM-DD" o ISO completo.
     */
    function _fmtFecha(dateStr) {
        const meses = [
            'Enero','Febrero','Marzo','Abril','Mayo','Junio',
            'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
        ];
        if (!dateStr) return '';
        // Añadir hora fija para evitar desfase de zona horaria
        const d = new Date(dateStr.length === 10 ? dateStr + 'T12:00:00' : dateStr);
        return String(d.getDate()).padStart(2, '0') + '-' +
               meses[d.getMonth()] + '- ' + d.getFullYear();
    }

    // ──────────────────────────────────────────────────────────────
    // GENERADOR PRINCIPAL
    // ──────────────────────────────────────────────────────────────

    /**
     * Genera y descarga el PDF del recibo de pago.
     * @param {Object} tx  Objeto de transacción devuelto por la API
     */
    async function generateReciboPago(tx) {
        if (!tx) { alert('No hay transacción activa.'); return; }

        try {
            if (typeof window.jspdf === 'undefined') {
                throw new Error('jsPDF no está disponible. Recargue la página.');
            }

            await _preload();

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

            // Dimensiones de página
            const PW  = 210;          // ancho A4
            const mL  = 20;           // margen izquierdo
            const mR  = 20;           // margen derecho
            const CW  = PW - mL - mR; // ancho de contenido: 170 mm

            // ── Datos de la transacción ──────────────────────────
            const recibNo   = String(tx.id || 0).padStart(4, '0');
            const fecha     = _fmtFecha(tx.fecha);
            const cliente   = tx._alumnoNombre || tx.socio || 'Sin nombre';
            const concepto  = tx.concepto || 'Sin concepto';
            const cantidad  = parseFloat(tx.cantidad  || 1);
            const precioU   = parseFloat(tx.precio_unitario || 0);
            const total     = parseFloat(tx.total || 0);
            const subtotal  = precioU * cantidad;
            const descuento = Math.round((subtotal - total) * 100) / 100;
            const formaPago = (tx.forma_pago || '').toUpperCase();

            // ══════════════════════════════════════════════════════
            // BLOQUE 1 — TÍTULO + LOGO
            // ══════════════════════════════════════════════════════
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(26);
            doc.setTextColor(0, 0, 0);
            doc.text('Recibo de pago', mL, 28);

            if (_logoBase64) {
                // Logo Rockstar Skull — esquina superior derecha
                doc.addImage(_logoBase64, 'PNG', 148, 8, 42, 26);
            }

            // ══════════════════════════════════════════════════════
            // BLOQUE 2 — BARRA ROJA: No. + Fecha
            // ══════════════════════════════════════════════════════
            const barY = 40;
            const barH = 10;

            doc.setFillColor(220, 53, 69);           // rojo Bootstrap danger
            doc.rect(mL, barY, CW, barH, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text('No. ' + recibNo, mL + 3, barY + 7);
            doc.text('Fecha: ' + fecha, PW - mR - 3, barY + 7, { align: 'right' });

            // ══════════════════════════════════════════════════════
            // BLOQUE 3 — ENCABEZADOS "Recibe:" / "De:"
            // ══════════════════════════════════════════════════════
            const hdrY = barY + barH + 2;  // y=52

            doc.setFillColor(230, 230, 230);
            doc.rect(mL, hdrY, CW, 8, 'F');

            // Línea divisoria vertical central
            doc.setDrawColor(180, 180, 180);
            doc.setLineWidth(0.2);
            doc.line(mL + CW / 2, hdrY, mL + CW / 2, hdrY + 8);

            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text('Recibe:', mL + 3, hdrY + 5.5);
            doc.text('De:', mL + CW / 2 + 3, hdrY + 5.5);

            // ── Datos empresa (izquierda) ─────────────────────────
            const infoY = hdrY + 11;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text('Soluciones de IOT SA de CV',               mL + 3, infoY);
            doc.text('Don Juan 10. Nativitas, Benito Juárez,',   mL + 3, infoY + 6);
            doc.text('Ciudad de México, CP 03500',               mL + 3, infoY + 12);

            // ── Nombre del alumno/cliente (derecha) ───────────────
            doc.text(cliente, mL + CW / 2 + 3, infoY);

            // ══════════════════════════════════════════════════════
            // BLOQUE 4 — TABLA DE ITEMS
            // ══════════════════════════════════════════════════════
            const tableY = infoY + 20;  // deja espacio tras la dirección

            const tableBody = [
                [concepto, _fmt1(cantidad), _fmtMXN(precioU), _fmtMXN(subtotal)]
            ];
            if (descuento > 0) {
                tableBody.push(['Descuento', '1', _fmtMXN(descuento), _fmtMXN(descuento)]);
            }

            doc.autoTable({
                startY: tableY,
                head: [['Item', 'Cantidad', 'Costo unitario', 'Subtotal']],
                body: tableBody,
                margin: { left: mL, right: mR },
                styles: {
                    fontSize: 10,
                    cellPadding: 3,
                    textColor: [0, 0, 0],
                    lineColor: [200, 200, 200],
                    lineWidth: 0.3,
                    font: 'helvetica'
                },
                headStyles: {
                    fillColor: [230, 230, 230],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    halign: 'left'
                },
                columnStyles: {
                    0: { cellWidth: 90 },
                    1: { cellWidth: 20, halign: 'center' },
                    2: { cellWidth: 35, halign: 'right'  },
                    3: { cellWidth: 25, halign: 'right'  }
                },
                theme: 'plain'
            });

            const afterTableY = doc.lastAutoTable.finalY;

            // ══════════════════════════════════════════════════════
            // BLOQUE 5 — LÍNEA SEPARADORA + TOTAL
            // ══════════════════════════════════════════════════════
            const totLineY = afterTableY + 6;

            doc.setLineWidth(0.5);
            doc.setDrawColor(0, 0, 0);
            doc.line(mL, totLineY, PW - mR, totLineY);

            const totTextY = totLineY + 9;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text('TOTAL', PW - mR - 32, totTextY);
            doc.text(_fmtMXN(total), PW - mR, totTextY, { align: 'right' });

            // ══════════════════════════════════════════════════════
            // BLOQUE 6 — TIPO DE PAGO
            // ══════════════════════════════════════════════════════
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text('Tipo de Pago: ' + formaPago, mL, totTextY + 18);

            // ══════════════════════════════════════════════════════
            // BLOQUE 7 — ÁREA DE FIRMA
            // ══════════════════════════════════════════════════════
            const firmaAreaY = 230;   // posición fija, igual que el PDF original

            if (_firmaBase64) {
                // Imagen de firma — centro-derecha, sobre la línea
                doc.addImage(_firmaBase64, 'PNG', PW / 2 + 8, firmaAreaY - 30, 58, 30);
            }

            // Línea de firma (debajo de la imagen)
            doc.setLineWidth(0.4);
            doc.setDrawColor(0, 0, 0);
            doc.line(PW / 2 + 5, firmaAreaY + 2, PW - mR, firmaAreaY + 2);

            // ══════════════════════════════════════════════════════
            // BLOQUE 8 — PIE DE PÁGINA
            // ══════════════════════════════════════════════════════
            const footY = firmaAreaY + 10;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            // Lado izquierdo
            doc.text('Academia de Música', mL, footY);
            doc.text('Rockstar Skull',     mL, footY + 7);

            // Lado derecho (alineado bajo la línea de firma)
            doc.text('Marco A. Delgado',  PW / 2 + 5, footY);
            doc.text('Financial Manager', PW / 2 + 5, footY + 7);

            // ══════════════════════════════════════════════════════
            // GUARDAR
            // ══════════════════════════════════════════════════════
            const safeClient = cliente
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   // quitar acentos
                .replace(/[^a-zA-Z0-9 ]/g, '')
                .trim().replace(/\s+/g, '_')
                .substring(0, 30);
            const fileName = 'Recibo_' + recibNo + '_RockstarSkull_' + safeClient + '.pdf';
            doc.save(fileName);

            console.log('✅ Recibo generado:', fileName);

        } catch (err) {
            console.error('❌ Error generando recibo:', err);
            alert('Error al generar el recibo:\n' + err.message);
        }
    }

    /** Formatea cantidad (sin decimales si es entero) */
    function _fmt1(n) {
        return Number.isInteger(n) ? String(n) : n.toFixed(2);
    }

    // ──────────────────────────────────────────────────────────────
    // EXPORTACIÓN GLOBAL
    // ──────────────────────────────────────────────────────────────
    window.generateReciboPago = generateReciboPago;

    // Pre-carga imágenes tan pronto como el DOM esté listo,
    // para que el primer click sea instantáneo.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { _preload(); });
    } else {
        _preload();
    }

})();
