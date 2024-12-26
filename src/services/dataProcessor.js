const { getAccessToken, getEmailsFromAPI } = require('../connections/sendpulse');
const { pool } = require('../connections/database');

// Función de utilidad para crear delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para validar la estructura del email
const validateEmail = (email) => {
    const requiredFields = ['id', 'send_date', 'sender', 'recipient', 'subject'];
    return requiredFields.every(field => email[field] !== undefined);
};

const processData = async (startOffset = 0) => {
    // Crear conexión para transacciones
    const connection = await pool.getConnection();
    
    try {
        let currentOffset = startOffset;
        const BATCH_SIZE = 100;
        const RATE_LIMIT_DELAY = 100;

        console.log(`🚀 Iniciando procesamiento desde offset: ${currentOffset}`);

        // Iniciar transacción para el registro de control
        await connection.beginTransaction();
        
        // Crear o actualizar registro de control
        await connection.query(`
            INSERT INTO sp_control_offset (offset_value, total_processed, last_date_processed)
            VALUES (?, 0, NOW())
            ON DUPLICATE KEY UPDATE last_date_processed = NOW()
        `, [currentOffset]);

        await connection.commit();

        let token = await getAccessToken();
        let lastTokenTime = Date.now();
        let totalProcessed = 0;

        while (true) {
            // Renovar token si es necesario
            if (Date.now() - lastTokenTime > 55 * 60 * 1000) {
                console.log('🔄 Renovando token de acceso...');
                token = await getAccessToken();
                lastTokenTime = Date.now();
            }

            const params = {
                limit: BATCH_SIZE,
                offset: currentOffset,
                from: '2024-09-13 00:01:00',
                to: '2024-09-23 23:00:00'
            };

            console.log(`📥 Obteniendo lote: offset=${currentOffset}, limit=${BATCH_SIZE}`);
            const response = await getEmailsFromAPI(token, params);
            const emails = response.data;

            if (!emails || emails.length === 0) {
                console.log('✅ Procesamiento completado - No hay más datos');
                break;
            }

            console.log(`📧 Procesando lote de ${emails.length} emails`);

            // Iniciar transacción para el lote
            await connection.beginTransaction();

            try {
                // Guardar emails en la base de datos
                for (const email of emails) {
                    if (!validateEmail(email)) {
                        console.warn(`⚠️ Email con ID ${email.id} tiene campos faltantes, saltando...`);
                        continue;
                    }

                    await connection.query(`
                        INSERT INTO sp_envios (
                            id, send_date, sender, recipient, subject, 
                            smtp_answer_code, smtp_answer_code_explain,
                            smtp_answer_data, tracking
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                            send_date = VALUES(send_date),
                            smtp_answer_code = VALUES(smtp_answer_code),
                            smtp_answer_code_explain = VALUES(smtp_answer_code_explain),
                            smtp_answer_data = VALUES(smtp_answer_data),
                            tracking = VALUES(tracking)
                    `, [
                        email.id,
                        email.send_date,
                        email.sender,
                        email.recipient,
                        email.subject,
                        email.smtp_answer_code || null,
                        email.smtp_answer_code_explain || null,
                        email.smtp_answer_data || null,
                        email.tracking || null
                    ]);
                }

                // Actualizar control de offset
                totalProcessed += emails.length;
                await connection.query(`
                    UPDATE sp_control_offset 
                    SET offset_value = ?,
                        total_processed = ?,
                        last_date_processed = NOW()
                `, [currentOffset + emails.length, totalProcessed]);

                await connection.commit();
                console.log(`✅ Lote procesado exitosamente. Total procesados: ${totalProcessed}`);

            } catch (error) {
                await connection.rollback();
                throw error;
            }

            currentOffset += emails.length;
            await delay(RATE_LIMIT_DELAY);
        }

    } catch (error) {
        console.error('❌ Error en processData:', error);
        // Intentar guardar el estado actual en caso de error
        try {
            await connection.query(`
                UPDATE sp_control_offset 
                SET offset_value = ?,
                    last_date_processed = NOW()
            `, [currentOffset]);
        } catch (saveError) {
            console.error('Error guardando offset en error:', saveError);
        }
        throw error;
    } finally {
        connection.release();
    }
};

const getLastOffset = async () => {
    try {
        const [rows] = await pool.query('SELECT offset_value FROM sp_control_offset ORDER BY id DESC LIMIT 1');
        const lastOffset = rows.length > 0 ? rows[0].offset_value : 0;
        console.log(`📊 Último offset recuperado: ${lastOffset}`);
        return lastOffset;
    } catch (error) {
        console.error('Error obteniendo último offset:', error);
        throw error;
    }
};

module.exports = {
    processData,
    getLastOffset
};