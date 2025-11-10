// ====================================================
// ⚠️ ARCHIVO OBSOLETO - MARCAR PARA ELIMINACIÓN ⚠️
// Este script de Node.js ya no es necesario
// Migración completada: Node.js → PHP
// ====================================================
// SCRIPT DE SINCRONIZACIÓN DE FECHAS DE ÚLTIMO PAGO
// Archivo: database/sync-payment-dates.js
// Versión mejorada con búsqueda más flexible
// ====================================================

import { executeQuery } from '../server/config/database.js';

/**
 * Sincronizar fechas de último pago para todos los alumnos
 */
async function syncPaymentDates() {
    console.log('🔄 Iniciando sincronización de fechas de último pago (MEJORADA)...\n');
    
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
        let sinPagos = 0;
        let errores = 0;
        
        // 2. Para cada alumno, buscar su último pago
        for (const alumno of alumnos) {
            try {
                console.log(`\n🔍 Procesando: ${alumno.nombre}`);
                
                // Buscar transacciones de forma MÁS FLEXIBLE
                // Busca por nombre completo Y por primeros dos nombres
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
                
                console.log(`   📦 Pagos encontrados: ${pagos.length}`);
                
                if (pagos.length > 0) {
                    const ultimoPago = pagos[0];
                    console.log(`   💰 Último pago: ${ultimoPago.fecha}`);
                    console.log(`   📝 Concepto: ${ultimoPago.concepto}`);
                    
                    const fechaActualBD = alumno.fecha_ultimo_pago ? 
                        new Date(alumno.fecha_ultimo_pago).toISOString().split('T')[0] : null;
                    const fechaNueva = new Date(ultimoPago.fecha).toISOString().split('T')[0];
                    
                    console.log(`   🗓️  Fecha actual en BD: ${fechaActualBD || 'NULL'}`);
                    console.log(`   🗓️  Fecha nueva: ${fechaNueva}`);
                    
                    // Solo actualizar si hay cambio
                    if (fechaActualBD !== fechaNueva) {
                        await executeQuery(`
                            UPDATE alumnos 
                            SET fecha_ultimo_pago = ?
                            WHERE id = ?
                        `, [ultimoPago.fecha, alumno.id]);
                        
                        console.log(`   ✅ ACTUALIZADO: ${fechaActualBD || 'NULL'} → ${fechaNueva}`);
                        actualizados++;
                    } else {
                        console.log(`   ➖ Sin cambios (fecha ya correcta)`);
                        sinCambios++;
                    }
                } else {
                    console.log(`   ⚠️  Sin pagos registrados`);
                    sinPagos++;
                }
                
            } catch (error) {
                console.error(`   ❌ Error procesando ${alumno.nombre}:`, error.message);
                errores++;
            }
        }
        
        // 3. Resumen
        console.log('\n' + '='.repeat(70));
        console.log('📊 RESUMEN DE SINCRONIZACIÓN');
        console.log('='.repeat(70));
        console.log(`✅ Actualizados: ${actualizados}`);
        console.log(`➖ Sin cambios: ${sinCambios}`);
        console.log(`⚠️  Sin pagos: ${sinPagos}`);
        console.log(`❌ Errores: ${errores}`);
        console.log(`📋 Total procesados: ${alumnos.length}`);
        console.log('='.repeat(70));
        
        return {
            success: true,
            actualizados,
            sinCambios,
            sinPagos,
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