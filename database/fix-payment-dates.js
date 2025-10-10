// ====================================================
// FIX PAYMENT DATES - EJECUTAR MANUALMENTE
// Archivo: database/fix-payment-dates.js
// ====================================================

import { executeQuery } from '../server/config/database.js';

console.log('🚀 Iniciando script de corrección de fechas...\n');

async function fixPaymentDates() {
    console.log('🔄 Sincronizando fechas de último pago...\n');
    
    try {
        // Obtener todos los alumnos activos
        const alumnos = await executeQuery(`
            SELECT id, nombre, fecha_ultimo_pago
            FROM alumnos 
            WHERE empresa_id = 1 AND estatus = 'Activo'
            ORDER BY nombre
        `);
        
        console.log(`📊 Total alumnos activos: ${alumnos.length}\n`);
        
        let actualizados = 0;
        let sinCambios = 0;
        let sinPagos = 0;
        
        for (const alumno of alumnos) {
            console.log(`🔍 ${alumno.nombre}`);
            
            // Buscar último pago (búsqueda flexible)
            const primerosNombres = alumno.nombre.split(' ').slice(0, 2).join(' ');
            
            const pagos = await executeQuery(`
                SELECT fecha, concepto
                FROM transacciones
                WHERE tipo = 'I'
                    AND empresa_id = 1
                    AND (
                        concepto LIKE ?
                        OR concepto LIKE ?
                    )
                ORDER BY fecha DESC
                LIMIT 1
            `, [`%${alumno.nombre}%`, `%${primerosNombres}%`]);
            
            if (pagos.length > 0) {
                const ultimoPago = pagos[0];
                const fechaActual = alumno.fecha_ultimo_pago ? 
                    new Date(alumno.fecha_ultimo_pago).toISOString().split('T')[0] : null;
                const fechaNueva = new Date(ultimoPago.fecha).toISOString().split('T')[0];
                
                console.log(`   💰 Último pago encontrado: ${fechaNueva}`);
                console.log(`   📝 Concepto: ${ultimoPago.concepto.substring(0, 50)}...`);
                
                if (fechaActual !== fechaNueva) {
                    await executeQuery(`
                        UPDATE alumnos 
                        SET fecha_ultimo_pago = ?
                        WHERE id = ?
                    `, [ultimoPago.fecha, alumno.id]);
                    
                    console.log(`   ✅ ACTUALIZADO: ${fechaActual || 'NULL'} → ${fechaNueva}\n`);
                    actualizados++;
                } else {
                    console.log(`   ➖ Sin cambios\n`);
                    sinCambios++;
                }
            } else {
                console.log(`   ⚠️  Sin pagos registrados\n`);
                sinPagos++;
            }
        }
        
        console.log('='.repeat(60));
        console.log('📊 RESUMEN FINAL:');
        console.log('='.repeat(60));
        console.log(`✅ Actualizados: ${actualizados}`);
        console.log(`➖ Sin cambios: ${sinCambios}`);
        console.log(`⚠️  Sin pagos: ${sinPagos}`);
        console.log(`📋 Total: ${alumnos.length}`);
        console.log('='.repeat(60));
        
        // Cerrar conexión
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ ERROR:', error);
        process.exit(1);
    }
}

// EJECUTAR INMEDIATAMENTE
fixPaymentDates();