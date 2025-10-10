// ====================================================
// SCRIPT DE SINCRONIZACIÓN DE FECHAS DE ÚLTIMO PAGO
// Archivo: database/sync-payment-dates.js
// Actualiza fecha_ultimo_pago basado en transacciones existentes
// ====================================================

import { executeQuery } from '../server/config/database.js';

/**
 * Sincronizar fechas de último pago para todos los alumnos
 */
async function syncPaymentDates() {
    console.log('🔄 Iniciando sincronización de fechas de último pago...\n');
    
    try {
        // 1. Obtener todos los alumnos activos
        const alumnos = await executeQuery(`
            SELECT id, nombre, fecha_ultimo_pago, empresa_id
            FROM alumnos 
            WHERE empresa_id = 1 AND estatus = 'Activo'
            ORDER BY nombre
        `);
        
        console.log(`📊 Encontrados ${alumnos.length} alumnos activos\n`);
        
        let actualizados = 0;
        let sinCambios = 0;
        let errores = 0;
        
        // 2. Para cada alumno, buscar su último pago
        for (const alumno of alumnos) {
            try {
                // Buscar transacciones que mencionen el nombre del alumno
                // Formato: "Mensualidad clase de [INSTRUMENTO] [I/G] [Nombre Alumno]"
                const pagos = await executeQuery(`
                    SELECT fecha, concepto
                    FROM transacciones
                    WHERE tipo = 'I'
                        AND empresa_id = 1
                        AND concepto LIKE ?
                    ORDER BY fecha DESC
                    LIMIT 1
                `, [`%${alumno.nombre}%`]);
                
                if (pagos.length > 0) {
                    const ultimoPago = pagos[0];
                    const fechaActualBD = alumno.fecha_ultimo_pago ? 
                        new Date(alumno.fecha_ultimo_pago).toISOString().split('T')[0] : null;
                    const fechaNueva = new Date(ultimoPago.fecha).toISOString().split('T')[0];
                    
                    // Solo actualizar si hay cambio
                    if (fechaActualBD !== fechaNueva) {
                        await executeQuery(`
                            UPDATE alumnos 
                            SET fecha_ultimo_pago = ?
                            WHERE id = ?
                        `, [ultimoPago.fecha, alumno.id]);
                        
                        console.log(`✅ ${alumno.nombre}`);
                        console.log(`   Anterior: ${fechaActualBD || 'NULL'}`);
                        console.log(`   Nueva: ${fechaNueva}\n`);
                        actualizados++;
                    } else {
                        sinCambios++;
                    }
                } else {
                    console.log(`⚠️  ${alumno.nombre} - Sin pagos registrados\n`);
                }
                
            } catch (error) {
                console.error(`❌ Error procesando ${alumno.nombre}:`, error.message);
                errores++;
            }
        }
        
        // 3. Resumen
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN DE SINCRONIZACIÓN');
        console.log('='.repeat(60));
        console.log(`✅ Actualizados: ${actualizados}`);
        console.log(`➖ Sin cambios: ${sinCambios}`);
        console.log(`❌ Errores: ${errores}`);
        console.log(`📋 Total procesados: ${alumnos.length}`);
        console.log('='.repeat(60));
        
        return {
            success: true,
            actualizados,
            sinCambios,
            errores,
            total: alumnos.length
        };
        
    } catch (error) {
        console.error('❌ Error fatal en sincronización:', error);
        throw error;
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    syncPaymentDates()
        .then((result) => {
            console.log('\n✅ Sincronización completada exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Error:', error);
            process.exit(1);
        });
}

export { syncPaymentDates };