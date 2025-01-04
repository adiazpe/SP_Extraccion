require('dotenv').config();
const { getAccessToken, getEmailsFromAPI, getTotalEmails } = require('./connections/sendpulse');
const { pool } = require('./connections/database');
const DatabaseService = require('./services/queries');

const testfinal = async () => {
    const startTime = performance.now();
    let extractionId;
    let batchCount = 0;
    let insertadosExitosos = 0;
    let actualizadosExitosos = 0;
    let sinCambios = 0;
    const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000;
    let lastTokenTime = Date.now();

    try {
        let tokenData = await getAccessToken();
        const batchSize = 100;
        let currentOffset = 0;
        let totalRegistros = 0;
        const startDate = '2024-12-02 00:00:00';
        const endDate = '2024-12-11 23:59:59';

        // Obtener total esperado
        const dateParams = {
            from: startDate,
            to: endDate
        };
        const totalExpected = await getTotalEmails(tokenData, dateParams);
        console.log(`📊 Total de registros esperados: ${totalExpected}`);

        // Crear registro de extracción con total esperado
        extractionId = await DatabaseService.createExtractionRecord(startDate, endDate, totalExpected);

        // Actualizar offset inicial con total esperado
        await DatabaseService.updateControlOffset(currentOffset, totalRegistros, totalExpected);

        while (totalRegistros < totalExpected) {
            if (Date.now() - lastTokenTime > TOKEN_REFRESH_INTERVAL) {
                tokenData = await getAccessToken();
                lastTokenTime = Date.now();
            }

            batchCount++;
            const startBatchTotal = process.hrtime(); // Iniciamos medición total del batch

            const params = {
                limit: batchSize,
                offset: currentOffset,
                from: startDate,
                to: endDate
            };

            const response = await getEmailsFromAPI(tokenData, params);
            const emails = response.data;

            //Nuevo proceso por batches usando los hashes
            if (emails && emails.length > 0) {
                console.log(`\n📦 Batch #${batchCount}:`);
                console.log(`📥 Registros en este batch: ${emails.length}`);
                await pool.query('START TRANSACTION');
                try {
                    const batchResult = await DatabaseService.processEmailBatch(emails, { startDate, endDate });
            
                    // Actualizar contadores con los resultados de la función
                    insertadosExitosos += batchResult.new;
                    actualizadosExitosos += batchResult.updated;
                    totalRegistros += emails.length;
            
                    currentOffset += batchSize;

                    console.log(`✨ Nuevos: ${batchResult.new}`);
                    console.log(`🔄 Actualizados: ${batchResult.updated}`);
                    console.log(`⏸️ Sin cambios: ${emails.length - (batchResult.new + batchResult.updated)}`);

                    // Actualizar offset y progreso
                    await DatabaseService.updateControlOffset(currentOffset, totalRegistros, totalExpected);
                    
                    await pool.query('COMMIT');

                    const completionPercentage = ((totalRegistros / totalExpected) * 100).toFixed(2);
                    console.log(`📈 Progreso: ${completionPercentage}%`);
                    console.log(`📊 Total procesados: ${totalRegistros} de ${totalExpected}`);

                    const endBatchTotal = process.hrtime(startBatchTotal);
                    const batchTotalTime = (endBatchTotal[0] * 1000 + endBatchTotal[1] / 1000000).toFixed(2);
                    console.log(`⏱️ Tiempo total del batch: ${batchTotalTime}ms`);

                    // Validación de batch incompleto
                    if (emails.length < batchSize) {
                        console.log('📦 Batch incompleto detectado, finalizando proceso');
                        break;
                    }
                } catch (error) {
                    await pool.query('ROLLBACK');
                    console.error('❌ Error en el batch:', error);
                    throw error;
                }
            } else {
                console.log('❌ No hay más registros para procesar');
                break;
            }

            if (batchCount % 50 === 0) {
                console.log('\n🧹 Ejecutando limpieza de memoria');
                global.gc && global.gc();
            }
        }

        const endTime = performance.now();
        const totalSeconds = ((endTime - startTime) / 1000).toFixed(2);

        // Actualizar historial de extracción
        await DatabaseService.updateExtractionHistory(extractionId, {
            totalRegistros,
            insertadosExitosos,
            actualizadosExitosos,
            sinCambios,
            totalBatches: batchCount,
            lastOffset: currentOffset,
            executionTime: totalSeconds
        });

        // Resumen final
        console.log(`\n🎉 Proceso completado:`);
        console.log(`📊 Total registros procesados: ${totalRegistros}`);
        console.log(`📥 Total registros nuevos: ${insertadosExitosos}`);
        console.log(`🔄 Total registros actualizados: ${actualizadosExitosos}`);
        console.log(`⏸️ Total registros sin cambios: ${sinCambios}`);
        console.log(`📦 Total batches: ${batchCount}`);
        console.log(`⏱️ Tiempo total: ${totalSeconds} segundos`);
        console.log(`⚡ Promedio por batch: ${(totalSeconds/batchCount).toFixed(2)} segundos`);

    } catch (error) {
        if (extractionId) {
            await DatabaseService.updateExtractionError(extractionId, error);
        }
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
};

// Para ejecutar en segundo plano
if (require.main === module) {
    testfinal().catch(console.error);
}

module.exports = testfinal;