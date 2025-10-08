// ====================================================
// RUTAS API - TRANSACCIONES, GASTOS E INGRESOS
// Archivo: server/routes/api.js
// ====================================================

import express from 'express';
import { transaccionesController } from '../controllers/transacciones.js';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// Middleware de autenticación para todas las rutas API
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.status(401).json({
            success: false,
            error: 'Acceso no autorizado'
        });
    }
}

// Aplicar middleware de autenticación a todas las rutas
router.use(requireAuth);

// ==================== RUTAS DE TRANSACCIONES ====================
// GET /api/transacciones - Todas las transacciones con filtros
router.get('/transacciones', transaccionesController.getTransacciones);

// POST /api/transacciones - Crear nueva transacción
router.post('/transacciones', transaccionesController.createTransaccion);

// PUT /api/transacciones/:id - Actualizar transacción
router.put('/transacciones/:id', transaccionesController.updateTransaccion);

// DELETE /api/transacciones/:id - Eliminar transacción
router.delete('/transacciones/:id', transaccionesController.deleteTransaccion);

// GET /api/transacciones/resumen - Resumen de todas las transacciones
router.get('/transacciones/resumen', transaccionesController.getResumen);

// ==================== RUTAS ESPECÍFICAS DE GASTOS ====================
// GET /api/gastos - Solo gastos (tipo = 'G')
router.get('/gastos', transaccionesController.getGastos);

// POST /api/gastos - Crear nuevo gasto
router.post('/gastos', transaccionesController.createGasto);

// ==================== RUTAS ESPECÍFICAS DE INGRESOS ====================
// GET /api/ingresos - Solo ingresos (tipo = 'I')
router.get('/ingresos', transaccionesController.getIngresos);

// POST /api/ingresos - Crear nuevo ingreso
router.post('/ingresos', transaccionesController.createIngreso);

// ==================== RUTAS DE DATOS AUXILIARES ====================
// GET /api/empresas - Lista de empresas
router.get('/empresas', transaccionesController.getEmpresas);

// ✅ NUEVO: Historial de pagos de alumno específico
router.get('/alumnos/:alumnoNombre/historial-pagos', transaccionesController.getHistorialPagosAlumno);

// ==================== RUTAS DE REPORTES DASHBOARD ====================
// GET /api/dashboard - Datos para dashboard principal
// GET /api/dashboard - Datos para dashboard principal COMPLETO
router.get('/dashboard', async (req, res) => {
    try {
        const { empresa_id, periodo = '12' } = req.query;
        
        let whereClause = 'WHERE 1=1';
        let params = [];
        
        if (empresa_id) {
            whereClause += ' AND empresa_id = ?';
            params.push(empresa_id);
        }
        
        // Período en meses hacia atrás
        whereClause += ' AND fecha >= DATE_SUB(NOW(), INTERVAL ? MONTH)';
        params.push(parseInt(periodo));
        
        // Obtener resumen de transacciones
        const resumenQuery = `
            SELECT 
                COUNT(*) as total_transacciones,
                SUM(CASE WHEN tipo = 'I' THEN total ELSE 0 END) as total_ingresos,
                SUM(CASE WHEN tipo = 'G' THEN total ELSE 0 END) as total_gastos,
                COUNT(CASE WHEN tipo = 'I' THEN 1 END) as count_ingresos,
                COUNT(CASE WHEN tipo = 'G' THEN 1 END) as count_gastos
            FROM transacciones ${whereClause}
        `;
        
        const [resumen] = await executeQuery(resumenQuery, params);
        
        // Datos mensuales para gráficas
        const tendenciaQuery = `
            SELECT 
                DATE_FORMAT(fecha, '%Y-%m') as mes,
                DATE_FORMAT(fecha, '%M %Y') as mes_label,
                SUM(CASE WHEN tipo = 'I' THEN total ELSE 0 END) as ingresos,
                SUM(CASE WHEN tipo = 'G' THEN total ELSE 0 END) as gastos,
                COUNT(*) as transacciones
            FROM transacciones ${whereClause}
            GROUP BY DATE_FORMAT(fecha, '%Y-%m')
            ORDER BY DATE_FORMAT(fecha, '%Y-%m') ASC
        `;
        
        const tendenciaMensual = await executeQuery(tendenciaQuery, params);
        
        // Top categorías de gastos
        const topGastosQuery = `
            SELECT 
                concepto,
                COUNT(*) as cantidad,
                SUM(total) as total_gastado,
                AVG(total) as promedio
            FROM transacciones 
            ${whereClause} AND tipo = 'G'
            GROUP BY concepto
            ORDER BY total_gastado DESC
            LIMIT 5
        `;
        
        const topGastos = await executeQuery(topGastosQuery, params);
        
        // Calcular balance y métricas
        const totalIngresos = parseFloat(resumen.total_ingresos || 0);
        const totalGastos = parseFloat(resumen.total_gastos || 0);
        const balance = totalIngresos - totalGastos;
        const margenPorcentaje = totalIngresos > 0 ? 
            Math.round((balance / totalIngresos) * 100) : 0;
        
        res.json({
            success: true,
            data: {
                resumen: {
                    total_transacciones: parseInt(resumen.total_transacciones || 0),
                    total_ingresos: totalIngresos,
                    total_gastos: totalGastos,
                    balance: balance,
                    margen_porcentaje: margenPorcentaje,
                    count_ingresos: parseInt(resumen.count_ingresos || 0),
                    count_gastos: parseInt(resumen.count_gastos || 0)
                },
                tendencia_mensual: tendenciaMensual,
                top_gastos: topGastos,
                periodo_consultado: `Últimos ${periodo} meses`
            }
        });
        
        console.log(`✅ Dashboard consultado - Empresa: ${empresa_id || 'Todas'}, Período: ${periodo} meses`);
        
    } catch (error) {
        console.error('Error obteniendo datos de dashboard:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// GET /api/dashboard/alumnos - Estadísticas de alumnos para dashboard
router.get('/dashboard/alumnos', transaccionesController.getDashboardAlumnos);

// ============================================================
// RUTAS ESPECÍFICAS DE GASTOS
// ============================================================

/* GET /api/gastos/grafica - Datos para gráfica principal de gastos
router.get('/gastos/grafica', async (req, res) => {
    try {
        const { empresa_id, año, periodo = 12 } = req.query;
        
        let whereClause = 'WHERE tipo = "G"'; // Solo gastos
        let params = [];
        
        if (empresa_id) {
            whereClause += ' AND empresa_id = ?';
            params.push(empresa_id);
        }
        
        if (año) {
            whereClause += ' AND YEAR(fecha) = ?';
            params.push(año);
        } else {
            // Por defecto últimos 12 meses
            whereClause += ' AND fecha >= DATE_SUB(NOW(), INTERVAL ? MONTH)';
            params.push(parseInt(periodo));
        }
        
        // Datos por mes para la gráfica
        const gastosPorMes = await executeQuery(`
            SELECT 
                DATE_FORMAT(fecha, '%Y-%m') as periodo,
                DATE_FORMAT(fecha, '%M %Y') as periodo_label,
                YEAR(fecha) as año,
                MONTH(fecha) as mes,
                COUNT(*) as total_transacciones,
                SUM(total) as total_gastos,
                AVG(total) as promedio_gasto
            FROM transacciones 
            ${whereClause}
            GROUP BY DATE_FORMAT(fecha, '%Y-%m')
            ORDER BY fecha DESC
            LIMIT 12
        `, params);
        
        // Totales generales
        const totales = await executeQuery(`
            SELECT 
                COUNT(*) as total_transacciones,
                SUM(total) as total_gastos,
                AVG(total) as promedio_gasto,
                MIN(total) as gasto_minimo,
                MAX(total) as gasto_maximo
            FROM transacciones 
            ${whereClause}
        `, params);
        
        // Top 5 categorías de gastos
        const topCategorias = await executeQuery(`
            SELECT 
                socio,
                COUNT(*) as cantidad,
                SUM(total) as total_gastos,
                ROUND(AVG(total), 2) as promedio
            FROM transacciones 
            ${whereClause}
            GROUP BY socio
            ORDER BY total_gastos DESC
            LIMIT 5
        `, params);
        
        res.json({
            success: true,
            data: {
                gastos_por_mes: gastosPorMes.reverse(), // Orden cronológico
                totales: totales[0] || {},
                top_categorias: topCategorias,
                periodo_consultado: año || `Últimos ${periodo} meses`
            }
        });
        
    } catch (error) {
        console.error('Error obteniendo datos de gráfica:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error interno del servidor' 
        });
    }
});*/

// GET /api/gastos/drill-down - Drill-down por año/mes
router.get('/gastos/drill-down', async (req, res) => {
    try {
        const { empresa_id, año, mes, socio } = req.query;
        
        let whereClause = 'WHERE tipo = "G"';
        let params = [];
        
        if (empresa_id) {
            whereClause += ' AND empresa_id = ?';
            params.push(empresa_id);
        }
        
        if (año) {
            whereClause += ' AND YEAR(fecha) = ?';
            params.push(año);
            
            if (mes) {
                whereClause += ' AND MONTH(fecha) = ?';
                params.push(mes);
            }
        }
        
        if (socio) {
            whereClause += ' AND socio = ?';
            params.push(socio);
        }
        
        // Si tenemos año y mes, mostrar gastos detallados
        if (año && mes) {
            const gastosDetalle = await executeQuery(`
                SELECT 
                    id,
                    fecha,
                    concepto,
                    socio,
                    empresa_id,
                    forma_pago,
                    cantidad,
                    precio_unitario,
                    total,
                    created_at
                FROM transacciones 
                ${whereClause}
                ORDER BY fecha DESC, total DESC
            `, params);
            
            const resumenMes = await executeQuery(`
                SELECT 
                    COUNT(*) as total_transacciones,
                    SUM(total) as total_gastos,
                    AVG(total) as promedio_gasto
                FROM transacciones 
                ${whereClause}
            `, params);
            
            return res.json({
                success: true,
                data: {
                    tipo: 'detalle',
                    gastos: gastosDetalle,
                    resumen: resumenMes[0] || {},
                    periodo: `${mes}/${año}`
                }
            });
        }
        
        // Si solo tenemos año, mostrar por meses
        if (año) {
            const gastosPorMes = await executeQuery(`
                SELECT 
                    MONTH(fecha) as mes,
                    MONTHNAME(fecha) as mes_nombre,
                    COUNT(*) as total_transacciones,
                    SUM(total) as total_gastos
                FROM transacciones 
                ${whereClause}
                GROUP BY MONTH(fecha), MONTHNAME(fecha)
                ORDER BY MONTH(fecha)
            `, params);
            
            return res.json({
                success: true,
                data: {
                    tipo: 'mensual',
                    gastos_por_mes: gastosPorMes,
                    año: año
                }
            });
        }
        
        // Por defecto, mostrar por años
        const gastosPorAño = await executeQuery(`
            SELECT 
                YEAR(fecha) as año,
                COUNT(*) as total_transacciones,
                SUM(total) as total_gastos
            FROM transacciones 
            ${whereClause}
            GROUP BY YEAR(fecha)
            ORDER BY YEAR(fecha) DESC
        `, params);
        
        res.json({
            success: true,
            data: {
                tipo: 'anual',
                gastos_por_año: gastosPorAño
            }
        });
        
    } catch (error) {
        console.error('Error en drill-down:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error interno del servidor' 
        });
    }
});

// GET /api/gastos/filtros - Datos para filtros dinámicos
router.get('/gastos/filtros', async (req, res) => {
    try {
        // Obtener todas las opciones disponibles para filtros
        
        // Socios únicos
        const socios = await executeQuery(`
            SELECT DISTINCT socio 
            FROM transacciones 
            WHERE tipo = "G" AND socio IS NOT NULL AND socio != ""
            ORDER BY socio
        `);
        
        // Formas de pago únicas
        const formasPago = await executeQuery(`
            SELECT DISTINCT forma_pago 
            FROM transacciones 
            WHERE tipo = "G" AND forma_pago IS NOT NULL AND forma_pago != ""
            ORDER BY forma_pago
        `);
        
        // Años disponibles
        const años = await executeQuery(`
            SELECT DISTINCT YEAR(fecha) as año
            FROM transacciones 
            WHERE tipo = "G"
            ORDER BY YEAR(fecha) DESC
        `);
        
        // Empresas con gastos
        const empresas = await executeQuery(`
            SELECT DISTINCT e.id, e.nombre
            FROM empresas e
            INNER JOIN transacciones t ON e.id = t.empresa_id
            WHERE t.tipo = "G"
            ORDER BY e.nombre
        `);
        
        // Rangos de montos (para filtros avanzados)
        const rangosMontos = await executeQuery(`
            SELECT 
                MIN(total) as monto_minimo,
                MAX(total) as monto_maximo,
                AVG(total) as monto_promedio,
                COUNT(*) as total_gastos
            FROM transacciones 
            WHERE tipo = "G"
        `);
        
        res.json({
            success: true,
            data: {
                socios: socios.map(s => s.socio),
                formas_pago: formasPago.map(f => f.forma_pago),
                años: años.map(a => a.año),
                empresas: empresas,
                rangos_montos: rangosMontos[0] || {},
                total_opciones: {
                    socios: socios.length,
                    formas_pago: formasPago.length,
                    años: años.length,
                    empresas: empresas.length
                }
            }
        });
        
    } catch (error) {
        console.error('Error obteniendo filtros:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error interno del servidor' 
        });
    }
});

// POST /api/gastos/bulk-delete - Eliminación masiva (solo admins)
router.post('/gastos/bulk-delete', requireAuth, async (req, res) => {
    try {
        const { transaction_ids } = req.body;
        const user = req.session.user;
        
        // Verificar permisos de admin
        if (user.rol !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Acceso denegado. Solo administradores pueden eliminar masivamente.'
            });
        }
        
        if (!transaction_ids || !Array.isArray(transaction_ids) || transaction_ids.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere un array de IDs de transacciones'
            });
        }
        
        // Verificar que todas las transacciones sean gastos
        const placeholders = transaction_ids.map(() => '?').join(',');
        const transactionsToDelete = await executeQuery(`
            SELECT id, concepto, total, tipo, socio
            FROM transacciones 
            WHERE id IN (${placeholders}) AND tipo = 'G'
        `, transaction_ids);
        
        if (transactionsToDelete.length !== transaction_ids.length) {
            return res.status(400).json({
                success: false,
                error: 'Algunas transacciones no existen o no son gastos'
            });
        }
        
        // Eliminar transacciones
        const result = await executeQuery(`
            DELETE FROM transacciones 
            WHERE id IN (${placeholders}) AND tipo = 'G'
        `, transaction_ids);
        
        console.log(`🗑️ ${user.nombre} eliminó ${result.affectedRows} gastos masivamente`);
        
        res.json({
            success: true,
            message: `${result.affectedRows} gastos eliminados exitosamente`,
            data: {
                eliminados: result.affectedRows,
                transacciones: transactionsToDelete
            }
        });
        
    } catch (error) {
        console.error('Error en eliminación masiva:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error interno del servidor' 
        });
    }
});

// POST /api/transacciones - Crear nueva transacción
router.post('/transacciones', requireAuth, async (req, res) => {
    try {
        const {
            fecha,
            concepto,
            socio,
            empresa_id,
            forma_pago,
            cantidad,
            precio_unitario,
            tipo = 'G' // Por defecto gasto
        } = req.body;
        
        const user = req.session.user;
        
        // Validaciones básicas
        if (!fecha || !concepto || !socio || !empresa_id || !forma_pago || !cantidad || !precio_unitario) {
            return res.status(400).json({
                success: false,
                error: 'Todos los campos son requeridos'
            });
        }
        
        // Insertar transacción
        const result = await executeQuery(`
            INSERT INTO transacciones (
                fecha, concepto, socio, empresa_id, forma_pago,
                cantidad, precio_unitario, tipo, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [fecha, concepto, socio, empresa_id, forma_pago, cantidad, precio_unitario, tipo, user.id]);
        
        console.log(`✅ ${user.nombre} creó nueva transacción: ${concepto} - $${cantidad * precio_unitario}`);
        
        res.json({
            success: true,
            message: 'Transacción creada exitosamente',
            data: {
                id: result.insertId,
                total: cantidad * precio_unitario
            }
        });
        
    } catch (error) {
        console.error('Error creando transacción:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// PUT /api/transacciones/:id - Actualizar transacción
router.put('/transacciones/:id', requireAuth, async (req, res) => {
    try {
        const transactionId = req.params.id;
        const {
            fecha,
            concepto,
            socio,
            empresa_id,
            forma_pago,
            cantidad,
            precio_unitario,
            tipo
        } = req.body;
        
        const user = req.session.user;
        
        // Verificar que la transacción existe
        const existingTransaction = await executeQuery(
            'SELECT * FROM transacciones WHERE id = ?',
            [transactionId]
        );
        
        if (existingTransaction.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Transacción no encontrada'
            });
        }
        
        // Actualizar transacción
        await executeQuery(`
            UPDATE transacciones SET
                fecha = ?, concepto = ?, socio = ?, empresa_id = ?,
                forma_pago = ?, cantidad = ?, precio_unitario = ?, tipo = ?
            WHERE id = ?
        `, [fecha, concepto, socio, empresa_id, forma_pago, cantidad, precio_unitario, tipo, transactionId]);
        
        console.log(`✅ ${user.nombre} actualizó transacción ${transactionId}: ${concepto}`);
        
        res.json({
            success: true,
            message: 'Transacción actualizada exitosamente',
            data: {
                id: transactionId,
                total: cantidad * precio_unitario
            }
        });
        
    } catch (error) {
        console.error('Error actualizando transacción:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// DELETE /api/transacciones/:id - Eliminar transacción
router.delete('/transacciones/:id', requireAuth, async (req, res) => {
    try {
        const transactionId = req.params.id;
        const user = req.session.user;
        
        // Verificar permisos (solo admins pueden eliminar)
        if (user.rol !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Solo administradores pueden eliminar transacciones'
            });
        }
        
        // Verificar que la transacción existe
        const transaction = await executeQuery(
            'SELECT concepto, total FROM transacciones WHERE id = ?',
            [transactionId]
        );
        
        if (transaction.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Transacción no encontrada'
            });
        }
        
        // Eliminar transacción
        await executeQuery('DELETE FROM transacciones WHERE id = ?', [transactionId]);
        
        console.log(`🗑️ ${user.nombre} eliminó transacción ${transactionId}: ${transaction[0].concepto}`);
        
        res.json({
            success: true,
            message: 'Transacción eliminada exitosamente',
            data: {
                id: transactionId,
                concepto: transaction[0].concepto
            }
        });
        
    } catch (error) {
        console.error('Error eliminando transacción:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/balance - Balance general por empresa y período
router.get('/balance', async (req, res) => {
    try {
        const { empresa_id, fechaInicio, fechaFin } = req.query;
        
        let whereClause = 'WHERE 1=1';
        let params = [];
        
        if (empresa_id) {
            whereClause += ' AND empresa_id = ?';
            params.push(empresa_id);
        }
        
        if (fechaInicio) {
            whereClause += ' AND fecha >= ?';
            params.push(fechaInicio);
        }
        
        if (fechaFin) {
            whereClause += ' AND fecha <= ?';
            params.push(fechaFin);
        }
        
        // Total ingresos
        const totalIngresos = await executeQuery(`
            SELECT COALESCE(SUM(total), 0) as total
            FROM transacciones ${whereClause} AND tipo = 'I'
        `, params);
        
        // Total gastos
        const totalGastos = await executeQuery(`
            SELECT COALESCE(SUM(total), 0) as total
            FROM transacciones ${whereClause} AND tipo = 'G'
        `, params);
        
        const ingresos = totalIngresos[0]?.total || 0;
        const gastos = totalGastos[0]?.total || 0;
        const balance = ingresos - gastos;
        
        res.json({
            success: true,
            data: {
                total_ingresos: parseFloat(ingresos),
                total_gastos: parseFloat(gastos),
                balance: parseFloat(balance),
                margen_porcentaje: ingresos > 0 ? ((balance / ingresos) * 100).toFixed(2) : 0
            }
        });
        
    } catch (error) {
        console.error('Error al generar balance:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// ==================== RUTAS DE ALERTAS DE PAGOS (ROCKSTARSKULL) ====================

// GET /api/alertas-pagos - Obtener alertas de pagos próximos y vencidos HOMOLOGADO
router.get('/dashboard/alertas-pagos', async (req, res) => {
    try {
        console.log('📅 Calculando alertas HOMOLOGADAS...');
        
        // Obtener alumnos activos
        const alumnos = await executeQuery(`
            SELECT 
                id,
                nombre,
                clase,
                precio_mensual,
                fecha_inscripcion,
                fecha_ultimo_pago,
                estatus
            FROM alumnos 
            WHERE empresa_id = 1 
                AND estatus = 'Activo' 
                AND nombre NOT LIKE '[ELIMINADO]%'
            ORDER BY nombre
        `);

        console.log(`📊 Procesando ${alumnos.length} alumnos activos`);
        
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const alertas = {
            proximos_vencer: [],
            vencidos: []
        };

        // Procesar cada alumno con lógica homologada
        for (const alumno of alumnos) {
            const fechaInscripcion = new Date(alumno.fecha_inscripcion);
            const diaCorte = fechaInscripcion.getDate();
            
            // Calcular fecha de corte del mes ACTUAL
            let fechaCorteActual = new Date(hoy.getFullYear(), hoy.getMonth(), diaCorte);
            fechaCorteActual.setHours(0, 0, 0, 0);
            
            // Si el día no existe en el mes (ej: 31 en febrero), usar último día del mes
            if (fechaCorteActual.getDate() !== diaCorte) {
                fechaCorteActual = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
                fechaCorteActual.setHours(0, 0, 0, 0);
            }
            
            // Calcular inicio y fin del periodo de pago
            const inicioPeriodoPago = new Date(fechaCorteActual);
            inicioPeriodoPago.setDate(inicioPeriodoPago.getDate() - 3); // 3 días antes
            
            const finPeriodoGracia = new Date(fechaCorteActual);
            finPeriodoGracia.setDate(finPeriodoGracia.getDate() + 5); // 5 días después
            
            const enPeriodoPago = hoy >= inicioPeriodoPago && hoy <= finPeriodoGracia;
            
            // Verificar pagos usando fecha_ultimo_pago de la tabla alumnos
            const fechaUltimoPago = alumno.fecha_ultimo_pago ? new Date(alumno.fecha_ultimo_pago) : null;
            
            const pagoEsteMes = fechaUltimoPago && 
                fechaUltimoPago.getMonth() === hoy.getMonth() &&
                fechaUltimoPago.getFullYear() === hoy.getFullYear();
            
            const pagoMesAnterior = fechaUltimoPago &&
                fechaUltimoPago.getMonth() === (hoy.getMonth() - 1 + 12) % 12 &&
                (fechaUltimoPago.getFullYear() === hoy.getFullYear() ||
                 (hoy.getMonth() === 0 && fechaUltimoPago.getFullYear() === hoy.getFullYear() - 1));

            // Si pagó este mes, no aparece en alertas
            if (pagoEsteMes) {
                continue;
            }

            // Calcular próxima fecha de pago para mostrar
            let proximaFechaCorte = fechaCorteActual;
            if (hoy > fechaCorteActual) {
                proximaFechaCorte = new Date(hoy.getFullYear(), hoy.getMonth() + 1, diaCorte);
                if (proximaFechaCorte.getDate() !== diaCorte) {
                    proximaFechaCorte = new Date(hoy.getFullYear(), hoy.getMonth() + 2, 0);
                }
            }

            // ✅ REGLA 1: VENCIDO - NO pagó mes anterior (sin importar periodo actual)
            if (!pagoMesAnterior) {
                // Calcular días vencidos desde el fin del periodo de gracia del MES ANTERIOR
                const fechaCorteAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, diaCorte);
                const finGraciaAnterior = new Date(fechaCorteAnterior);
                finGraciaAnterior.setDate(finGraciaAnterior.getDate() + 5);
                
                const diasVencido = Math.max(0, Math.floor((hoy.getTime() - finGraciaAnterior.getTime()) / (1000 * 60 * 60 * 24)));
                
                alertas.vencidos.push({
                    ...alumno,
                    dias_vencido: diasVencido,
                    fecha_proximo_pago: proximaFechaCorte.toISOString().split('T')[0]
                });
            }
            // ✅ REGLA 2: PRÓXIMO A VENCER - Pagó mes anterior Y en periodo de pago actual
            else if (pagoMesAnterior && enPeriodoPago) {
                const diasRestantes = Math.max(0, Math.floor((finPeriodoGracia.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)));
                
                alertas.proximos_vencer.push({
                    ...alumno,
                    dias_restantes: diasRestantes,
                    fecha_proximo_pago: proximaFechaCorte.toISOString().split('T')[0]
                });
            }
            // ✅ REGLA 3: VENCIDO - Pagó mes anterior pero ya pasó periodo de gracia del mes actual
            else if (pagoMesAnterior && hoy > finPeriodoGracia) {
                const diasVencido = Math.floor((hoy.getTime() - finPeriodoGracia.getTime()) / (1000 * 60 * 60 * 24));
                
                alertas.vencidos.push({
                    ...alumno,
                    dias_vencido: diasVencido,
                    fecha_proximo_pago: proximaFechaCorte.toISOString().split('T')[0]
                });
            }
        }
        
        console.log(`✅ Alertas calculadas: ${alertas.proximos_vencer.length} próximos, ${alertas.vencidos.length} vencidos`);
        
        res.json({
            success: true,
            data: {
                proximos_vencer: alertas.proximos_vencer,
                vencidos: alertas.vencidos,
                total_alertas: alertas.proximos_vencer.length + alertas.vencidos.length,
                fecha_calculo: hoy.toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ ERROR en alertas-pagos:', error);
        console.error('📍 Stack trace:', error.stack);
        
        res.status(500).json({
            success: false,
            error: 'Error procesando alertas',
            details: error.message
        });
    }
});

// POST /api/alertas-pagos/marcar-notificado/:alumno_id - Marcar alerta como notificada
router.post('/alertas-pagos/marcar-notificado/:alumno_id', async (req, res) => {
    try {
        const alumnoId = req.params.alumno_id;
        
        // Aquí registrarías en base de datos que se notificó al alumno
        // Por ahora solo simulamos
        
        res.json({
            success: true,
            message: `Alerta marcada como notificada para alumno ${alumnoId}`,
            data: {
                alumno_id: alumnoId,
                fecha_notificacion: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Error marcando alerta:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// PUT /api/alumnos/:id/estatus - Cambiar estatus de alumno (Activo/Baja)
router.put('/alumnos/:id/estatus', async (req, res) => {
    try {
        const { id } = req.params;
        const { estatus } = req.body;
        
        if (!['Activo', 'Baja'].includes(estatus)) {
            return res.status(400).json({
                success: false,
                message: 'Estatus inválido. Debe ser "Activo" o "Baja"'
            });
        }
        
        await executeQuery(
            'UPDATE alumnos SET estatus = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [estatus, id]
        );
        
        res.json({
            success: true,
            message: `Alumno ${estatus === 'Activo' ? 'activado' : 'dado de baja'} exitosamente`
        });
        
    } catch (error) {
        console.error('Error cambiando estatus alumno:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// ==================== RUTAS DASHBOARD ====================
router.get('/dashboard', transaccionesController.getResumen);
router.get('/dashboard/alumnos', transaccionesController.getDashboardAlumnos);
router.get('/alumnos', transaccionesController.getAlumnos);

// ✅ NUEVO: CRUD completo de alumnos
router.post('/alumnos', transaccionesController.createAlumno);
router.put('/alumnos/:id', transaccionesController.updateAlumno);
// 🗑️ NUEVO: Eliminar alumno (solo administradores)
router.delete('/alumnos/:id', transaccionesController.deleteAlumno);

// AGREGAR estos endpoints:
router.get('/maestros', async (req, res) => {
    try {
        const maestros = await executeQuery(`
            SELECT DISTINCT id, nombre 
            FROM maestros 
            WHERE activo = 1 
            ORDER BY nombre
        `);
        res.json({ success: true, data: maestros });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/instrumentos', async (req, res) => {
    try {
        const instrumentos = await executeQuery(`
            SELECT DISTINCT clase as nombre 
            FROM alumnos 
            WHERE clase IS NOT NULL 
            ORDER BY clase
        `);
        res.json({ success: true, data: instrumentos });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================
// 📊 ENDPOINTS PARA REPORTES
// ============================================================

/**
 * GET /api/transacciones/rango-fechas
 * Obtener rango de fechas (primera y última transacción)
 */
router.get('/transacciones/rango-fechas', async (req, res) => {
    try {
        const query = `
            SELECT 
                MIN(fecha) as fecha_minima,
                MAX(fecha) as fecha_maxima
            FROM transacciones
            WHERE fecha IS NOT NULL
        `;
        
        const results = await executeQuery(query);
        
        res.json({
            success: true,
            data: results[0] || { fecha_minima: null, fecha_maxima: null }
        });
        
    } catch (error) {
        console.error('Error obteniendo rango de fechas:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo rango de fechas'
        });
    }
});

/**
 * GET /api/transacciones/count
 * Obtener total de transacciones
 */
router.get('/transacciones/count', async (req, res) => {
    try {
        const query = `SELECT COUNT(*) as total FROM transacciones`;
        
        const results = await executeQuery(query);
        
        res.json({
            success: true,
            data: {
                total: results[0].total
            }
        });
        
    } catch (error) {
        console.error('Error obteniendo total de transacciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo total de transacciones'
        });
    }
});

// ============================================================
// 📊 ENDPOINT: REPORTE GASTOS REALES
// ============================================================

/**
 * GET /api/reportes/gastos-reales
 * Obtener reporte detallado de gastos reales (flujo de efectivo mensual)
 */
router.get('/reportes/gastos-reales', async (req, res) => {
    try {
        const { empresa_id, ano, mes, tipo } = req.query;
        
        console.log('📊 Generando reporte Gastos Reales...', { empresa_id, ano, mes, tipo });
        
        // Construir WHERE clause
        let whereClause = 'WHERE 1=1';
        let params = [];
        
        if (empresa_id) {
            whereClause += ' AND empresa_id = ?';
            params.push(empresa_id);
        }
        
        if (ano) {
            whereClause += ' AND YEAR(fecha) = ?';
            params.push(ano);
        }
        
        if (mes) {
            whereClause += ' AND MONTH(fecha) = ?';
            params.push(mes);
        }
        
        if (tipo) {
            whereClause += ' AND tipo = ?';
            params.push(tipo);
        }
        
        // Query principal: Obtener flujo mensual
        const queryDetalleMensual = `
            SELECT 
                DATE_FORMAT(fecha, '%Y-%m') as periodo,
                DATE_FORMAT(fecha, '%M %Y') as mes_nombre,
                YEAR(fecha) as ano,
                MONTH(fecha) as mes_num,
                SUM(CASE WHEN tipo = 'I' THEN total ELSE 0 END) as entradas,
                SUM(CASE WHEN tipo = 'G' THEN total ELSE 0 END) as salidas,
                SUM(CASE WHEN tipo = 'I' THEN total ELSE 0 END) - 
                SUM(CASE WHEN tipo = 'G' THEN total ELSE 0 END) as flujo
            FROM transacciones
            ${whereClause}
            GROUP BY DATE_FORMAT(fecha, '%Y-%m'), YEAR(fecha), MONTH(fecha)
            ORDER BY YEAR(fecha), MONTH(fecha)
        `;
        
        const detalleMensual = await executeQuery(queryDetalleMensual, params);
        
        // Query de totales
        const queryTotales = `
            SELECT 
                SUM(CASE WHEN tipo = 'I' THEN total ELSE 0 END) as total_entradas,
                SUM(CASE WHEN tipo = 'G' THEN total ELSE 0 END) as total_salidas,
                SUM(CASE WHEN tipo = 'I' THEN total ELSE 0 END) - 
                SUM(CASE WHEN tipo = 'G' THEN total ELSE 0 END) as flujo_neto,
                COUNT(*) as total_transacciones
            FROM transacciones
            ${whereClause}
        `;
        
        const totales = await executeQuery(queryTotales, params);
        
        // Formatear nombres de meses en español
        const mesesES = {
            'January': 'Enero',
            'February': 'Febrero',
            'March': 'Marzo',
            'April': 'Abril',
            'May': 'Mayo',
            'June': 'Junio',
            'July': 'Julio',
            'August': 'Agosto',
            'September': 'Septiembre',
            'October': 'Octubre',
            'November': 'Noviembre',
            'December': 'Diciembre'
        };
        
        // Formatear detalle mensual
        const detalleMensualFormateado = detalleMensual.map(item => {
            // Convertir nombre del mes a español
            const mesNombreEN = item.mes_nombre.split(' ')[0];
            const mesNombreES = mesesES[mesNombreEN] || mesNombreEN;
            const ano = item.mes_nombre.split(' ')[1];
            
            return {
                periodo: item.periodo,
                mes: `${mesNombreES} ${ano}`,
                ano: item.ano,
                mes_num: item.mes_num,
                entradas: parseFloat(item.entradas) || 0,
                salidas: parseFloat(item.salidas) || 0,
                flujo: parseFloat(item.flujo) || 0
            };
        });
        
        // Preparar respuesta
        const response = {
            success: true,
            data: {
                total_entradas: parseFloat(totales[0]?.total_entradas) || 0,
                total_salidas: parseFloat(totales[0]?.total_salidas) || 0,
                flujo_neto: parseFloat(totales[0]?.flujo_neto) || 0,
                total_transacciones: parseInt(totales[0]?.total_transacciones) || 0,
                detalle_mensual: detalleMensualFormateado,
                filtros_aplicados: {
                    empresa_id: empresa_id || 'Todas',
                    ano: ano || 'Todos',
                    mes: mes || 'Todos',
                    tipo: tipo || 'Todos'
                }
            }
        };
        
        console.log(`✅ Reporte generado: ${detalleMensualFormateado.length} meses, ${response.data.total_transacciones} transacciones`);
        
        res.json(response);
        
    } catch (error) {
        console.error('❌ Error generando reporte Gastos Reales:', error);
        res.status(500).json({
            success: false,
            message: 'Error generando reporte de Gastos Reales',
            error: error.message
        });
    }
});

/**
 * GET /api/reportes/balance-general
 * Obtener balance general con inversión por socio, estado de cuentas y participación
 */
router.get('/reportes/balance-general', async (req, res) => {
    try {
        const { empresa_id, ano, mes } = req.query;
        
        console.log('📊 Generando Balance General...', { empresa_id, ano, mes });
        
        // Construir WHERE clause base para transacciones
        let whereClause = 'WHERE 1=1';
        let params = [];
        
        if (empresa_id) {
            whereClause += ' AND empresa_id = ?';
            params.push(empresa_id);
        }
        
        if (ano) {
            whereClause += ' AND YEAR(fecha) = ?';
            params.push(ano);
        }
        
        if (mes) {
            whereClause += ' AND MONTH(fecha) = ?';
            params.push(mes);
        }
        
        // 1. Obtener inversión total por socio
        const querySocios = `
            SELECT 
                socio,
                SUM(CASE WHEN tipo = 'I' THEN total ELSE 0 END) as inversion,
                MAX(fecha) as ultima_actualizacion
            FROM transacciones
            ${whereClause}
            GROUP BY socio
            HAVING SUM(CASE WHEN tipo = 'I' THEN total ELSE 0 END) > 0
            ORDER BY inversion DESC
        `;
        
        const socios = await executeQuery(querySocios, params);
        
        // Calcular total de inversión de socios
        const totalInversionSocios = socios.reduce((sum, socio) => 
            sum + parseFloat(socio.inversion || 0), 0);
        
        // Calcular porcentajes de participación
        const sociosConPorcentaje = socios.map(socio => ({
            socio: socio.socio,
            inversion: parseFloat(socio.inversion) || 0,
            porcentaje: totalInversionSocios > 0 
                ? ((parseFloat(socio.inversion) / totalInversionSocios) * 100) 
                : 0,
            ultima_actualizacion: socio.ultima_actualizacion
        }));
        
        // 2. Obtener gastos totales de la escuela
        const queryGastosEscuela = `
            SELECT 
                SUM(total) as gastos_totales,
                COUNT(*) as num_transacciones
            FROM transacciones
            ${whereClause} AND tipo = 'G'
        `;
        
        const gastosEscuela = await executeQuery(queryGastosEscuela, params);
        const gastosEscuelaMonto = parseFloat(gastosEscuela[0]?.gastos_totales) || 0;
        
        // 3. Total general (inversión socios + gastos escuela)
        const totalGeneral = totalInversionSocios + gastosEscuelaMonto;
        
        // Porcentaje de gastos
        const porcentajeGastos = totalGeneral > 0 
            ? ((gastosEscuelaMonto / totalGeneral) * 100) 
            : 0;
        
        // 4. Estado de cuentas (simulado - en producción vendría de tabla de cuentas bancarias)
        // Por ahora, calcularemos el saldo como: Total Ingresos - Total Gastos
        const queryEstadoCuenta = `
            SELECT 
                SUM(CASE WHEN tipo = 'I' THEN total ELSE 0 END) as total_ingresos,
                SUM(CASE WHEN tipo = 'G' THEN total ELSE 0 END) as total_gastos
            FROM transacciones
            ${whereClause}
        `;
        
        const estadoCuenta = await executeQuery(queryEstadoCuenta, params);
        const totalIngresos = parseFloat(estadoCuenta[0]?.total_ingresos) || 0;
        const totalGastos = parseFloat(estadoCuenta[0]?.total_gastos) || 0;
        const saldoDisponible = totalIngresos - totalGastos;
        
        // Simular distribución de saldos en cuentas (70% Inbursa, 30% Mercado Pago)
        const cuentasBancarias = [
            {
                nombre: 'Cuenta Inbursa',
                banco: 'Inbursa',
                tipo: 'Cuenta Corriente',
                saldo: saldoDisponible * 0.70,
                ultima_actualizacion: new Date().toISOString()
            },
            {
                nombre: 'Mercado Pago',
                banco: 'Mercado Pago',
                tipo: 'Cuenta Digital',
                saldo: saldoDisponible * 0.30,
                ultima_actualizacion: new Date().toISOString()
            }
        ];
        
        // 5. Preparar respuesta
        const response = {
            success: true,
            data: {
                resumen: {
                    inversion_total: totalInversionSocios,
                    gastos_escuela: gastosEscuelaMonto,
                    total_general: totalGeneral,
                    saldo_disponible: saldoDisponible,
                    numero_socios: socios.length
                },
                socios: sociosConPorcentaje,
                gastos_escuela: {
                    monto: gastosEscuelaMonto,
                    porcentaje: porcentajeGastos,
                    num_transacciones: parseInt(gastosEscuela[0]?.num_transacciones) || 0
                },
                cuentas_bancarias: cuentasBancarias,
                participacion: sociosConPorcentaje.map(s => ({
                    socio: s.socio,
                    porcentaje: s.porcentaje
                })),
                filtros_aplicados: {
                    empresa_id: empresa_id || 'Todas',
                    ano: ano || 'Todos',
                    mes: mes || 'Todos'
                },
                fecha_generacion: new Date().toISOString()
            }
        };
        
        console.log(`✅ Balance General generado: ${socios.length} socios, ${cuentasBancarias.length} cuentas`);
        
        res.json(response);
        
    } catch (error) {
        console.error('❌ Error generando Balance General:', error);
        res.status(500).json({
            success: false,
            message: 'Error generando Balance General',
            error: error.message
        });
    }
});

export default router;