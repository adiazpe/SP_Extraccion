// src/test-process.js
require('dotenv').config();
const { getAccessToken, getEmailsFromAPI } = require('./connections/sendpulse');
const { pool } = require('./connections/database');

const testProcess = async () => {
    try {
        console.log('🚀 Iniciando prueba...');
        
        const token = await getAccessToken();
        const params = {
            limit: 100,
            offset: 0,
            from: '2024-09-13 00:01:00',
            to: '2024-09-23 23:00:00'
        };

        const response = await getEmailsFromAPI(token, params);
        const emails = response.data;
        
        console.log('Muestra del primer email:', emails[0]);
        
        let insertados = 0;
        let errores = 0;

        for (const email of emails) {
            try {
                // Procesamos el objeto tracking
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
                insertados++;
                console.log(`✅ Email ${email.id} procesado correctamente`);
            } catch (error) {
                errores++;
                console.error(`❌ Error insertando email ${email.id}:`, error.message);
            }
        }

        console.log(`✅ Proceso completado: ${insertados} insertados, ${errores} errores`);

    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    } finally {
        await pool.end();
    }
};

testProcess();