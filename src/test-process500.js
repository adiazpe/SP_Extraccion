// src/test-process500.js
require('dotenv').config();
const { getAccessToken, getEmailsFromAPI } = require('./connections/sendpulse');
const { pool } = require('./connections/database');

const testProcess500 = async () => {
    try {
        console.log('🚀 Iniciando prueba...');
        
        const token = await getAccessToken();
        const batchSize = 100;
        const totalBatches = 100;
        let totalProcesados = 0;
        let totalErrores = 0;

        for (let i = 0; i < totalBatches; i++) {
            const params = {
                limit: batchSize,
                offset: i * batchSize,
                from: '2024-09-13 00:01:00',
                to: '2024-09-23 23:00:00'
            };

            console.log(`\n📦 Procesando lote ${i + 1}/${totalBatches} (offset: ${params.offset})`);
            
            const response = await getEmailsFromAPI(token, params);
            const emails = response.data;
            
            let batchProcesados = 0;
            let batchErrores = 0;

            for (const email of emails) {
                try {
                    // Procesamos el tracking
                    const trackingData = email.tracking || {};
                    const trackingJson = JSON.stringify(trackingData);
                    const clicks = trackingData.click || 0;
                    const opens = trackingData.open || 0;
                    const clientInfo = JSON.stringify(trackingData.client_info || []);

                    await pool.query(`
                        INSERT INTO SP_envios (
                            id, send_date, sender, recipient, subject, 
                            smtp_answer_code, smtp_answer_code_explain,
                            smtp_answer_data, tracking, clicks, opens, 
                            client_info
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                            send_date = VALUES(send_date),
                            sender = VALUES(sender),
                            recipient = VALUES(recipient),
                            subject = VALUES(subject),
                            smtp_answer_code = VALUES(smtp_answer_code),
                            smtp_answer_code_explain = VALUES(smtp_answer_code_explain),
                            smtp_answer_data = VALUES(smtp_answer_data),
                            tracking = VALUES(tracking),
                            clicks = VALUES(clicks),
                            opens = VALUES(opens),
                            client_info = VALUES(client_info)
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
                        clientInfo
                    ]);
                    batchProcesados++;
                } catch (error) {
                    batchErrores++;
                    console.error(`❌ Error procesando email ${email.id}:`, error.message);
                }
            }

            totalProcesados += batchProcesados;
            totalErrores += batchErrores;
            console.log(`✅ Lote ${i + 1} completado: ${batchProcesados} procesados, ${batchErrores} errores`);
        }

        console.log(`\n🎉 Proceso total completado:`);
        console.log(`📊 Total procesados: ${totalProcesados}`);
        console.log(`❌ Total errores: ${totalErrores}`);

    } catch (error) {
        console.error('❌ Error general en la prueba:', error);
    } finally {
        await pool.end();
    }
};

testProcess500();