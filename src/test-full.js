require('dotenv').config();
const { getAccessToken, getEmailsFromAPI } = require('./connections/sendpulse');
const { pool } = require('./connections/database');

const optimizeDatabase = async () => {
    console.log('🔧 Optimizando base de datos...');
    try {
        await pool.query('OPTIMIZE TABLE SP_envios');
        console.log('✅ Base de datos optimizada');
    } catch (error) {
        console.error('❌ Error optimizando base de datos:', error);
    }
};

const testfull = async () => {
    const startTime = performance.now();
    let batchCount = 0;
    let insertadosExitosos = 0;
    let actualizadosExitosos = 0;
    let sinCambios = 0;
    const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000;
    let lastTokenTime = Date.now();
    
    try {
        console.log('🚀 Iniciando proceso de extracción...');
        await optimizeDatabase();
        
        let token = await getAccessToken();
        const batchSize = 100;
        let currentOffset = 0;
        let totalRegistros = 0;
        let continuar = true;

        const startDate = '2024-09-13 07:14:00';
        const endDate = '2024-09-14 23:59:59';

        while (continuar) {
            if (Date.now() - lastTokenTime > TOKEN_REFRESH_INTERVAL) {
                token = await getAccessToken();
                lastTokenTime = Date.now();
                console.log('🔄 Token renovado');
            }

            const batchStartTime = performance.now();
            batchCount++;
            let insertadosBatch = 0;
            let actualizadosBatch = 0;
            let sinCambiosBatch = 0;
            
            const params = {
                limit: batchSize,
                offset: currentOffset,
                from: startDate,
                to: endDate
            };

            console.log(`\n📦 Procesando batch #${batchCount}`);
            
            const response = await getEmailsFromAPI(token, params);
            const emails = response.data;
            
            if (!emails || emails.length < batchSize) {
                continuar = false;
                console.log('🏁 Último batch encontrado');
            }

            if (emails && emails.length > 0) {
                await pool.query('START TRANSACTION');

                try {
                    for (const email of emails) {
                        const trackingData = email.tracking || {};
                        const trackingJson = JSON.stringify(trackingData);
                        const clicks = trackingData.click || 0;
                        const opens = trackingData.open || 0;
                        const clientInfo = JSON.stringify(trackingData.client_info || []);

                        const [result] = await pool.query(`
                            INSERT INTO SP_envios (
                                id, send_date, sender, recipient, subject, 
                                smtp_answer_code, smtp_answer_code_explain,
                                smtp_answer_data, tracking, clicks, opens, 
                                client_info, created_at, updated_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                            ON DUPLICATE KEY UPDATE
                                sender = VALUES(sender),
                                recipient = VALUES(recipient),
                                subject = VALUES(subject),
                                smtp_answer_code = VALUES(smtp_answer_code),
                                smtp_answer_code_explain = VALUES(smtp_answer_code_explain),
                                smtp_answer_data = VALUES(smtp_answer_data),
                                tracking = VALUES(tracking),
                                clicks = VALUES(clicks),
                                opens = VALUES(opens),
                                client_info = VALUES(client_info),
                                updated_at = CASE
                                    WHEN send_date BETWEEN ? AND ?
                                    THEN NOW()
                                    ELSE updated_at
                                END
                        `, [
                            email.id,
                            email.send_date,
                            email.sender,
                            email.recipient,
                            email.subject,
                            email.smtp_answer_code || null,
                            email.smtp_answer_code_explain || null,
                            email.smtp_answer_data || null,
                            trackingJson,
                            clicks,
                            opens,
                            clientInfo,
                            startDate,
                            endDate
                        ]);

                        if (result?.affectedRows > 0) {
                            if (result.affectedRows === 1) {
                                // Nuevo registro
                                insertadosBatch++;
                                insertadosExitosos++;
                            } else if (result.affectedRows === 2) {
                                if (result.changedRows === 1) {
                                    // Registro actualizado
                                    actualizadosBatch++;
                                    actualizadosExitosos++;
                                } else {
                                    // Registro sin cambios
                                    sinCambiosBatch++;
                                    sinCambios++;
                                }
                            }
                        }
                    }

                    await pool.query('COMMIT');
                } catch (error) {
                    await pool.query('ROLLBACK');
                    throw error;
                }
            }

            totalRegistros += emails.length;
            currentOffset += batchSize;

            const batchEndTime = performance.now();
            const batchTime = ((batchEndTime - batchStartTime) / 1000).toFixed(2);
            
            if (batchCount % 5 === 0) {
                console.log(`✅ Batch #${batchCount}:`);
                console.log(`- Registros procesados: ${emails.length}`);
                console.log(`- Nuevos en este batch: ${insertadosBatch}`);
                console.log(`- Actualizados en este batch: ${actualizadosBatch}`);
                console.log(`- Sin cambios en este batch: ${sinCambiosBatch}`);
                console.log(`- Tiempo: ${batchTime} segundos`);
                console.log(`- Total acumulado: ${totalRegistros}`);
                console.log(`- Total nuevos: ${insertadosExitosos}`);
                console.log(`- Total actualizados: ${actualizadosExitosos}`);
                console.log(`- Total sin cambios: ${sinCambios}`);
            }

            if (batchCount % 50 === 0) {
                global.gc && global.gc();
            }
        }

        const endTime = performance.now();
        const totalSeconds = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log(`\n🎉 Proceso completado:`);
        console.log(`📊 Total registros procesados: ${totalRegistros}`);
        console.log(`📥 Total registros nuevos: ${insertadosExitosos}`);
        console.log(`🔄 Total registros actualizados: ${actualizadosExitosos}`);
        console.log(`⏸️ Total registros sin cambios: ${sinCambios}`);
        console.log(`📦 Total batches: ${batchCount}`);
        console.log(`⏱️ Tiempo total: ${totalSeconds} segundos`);
        console.log(`⚡ Promedio por batch: ${(totalSeconds/batchCount).toFixed(2)} segundos`);

        // Cerrar conexión
    await pool.end();
    
    // Finalmente terminar el proceso
    process.exit(0);

} catch (error) {

    // Calcular tiempo hasta el error
    const endTime = performance.now();
    const totalSeconds = ((endTime - startTime) / 1000).toFixed(2);

    
    // Logs de error
    console.error('❌ Error:', error);
    console.log(`⏱️ Tiempo hasta el error: ${totalSeconds} segundos`);
    
    // Cerrar conexión
    await pool.end();
    
    // Terminar con error
    process.exit(1);
}
};

testfull();