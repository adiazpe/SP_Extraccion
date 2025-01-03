// src/services/queries.js
const { pool } = require('../connections/database');

class DatabaseService {
    // Control de Offset
    async updateControlOffset(offset, totalProcessed, totalExpected = 0) {
        await pool.query(`
            UPDATE SP_control_offset 
            SET offset_value = ?, 
                total_processed = ?, 
                total_expected = ?,
                last_date_processed = NOW() 
            WHERE id = 1
        `, [offset, totalProcessed, totalExpected]);
    }

    // Historial de Extracciones
    async createExtractionRecord(startDate, endDate, totalExpected = 0) {
        const [result] = await pool.query(`
            INSERT INTO SP_extraction_history (
                start_date,
                date_range_from,
                date_range_to,
                total_expected,
                status
            ) VALUES (NOW(), ?, ?, ?, 'running')
        `, [startDate, endDate, totalExpected]);
        return result.insertId;
    }

    async updateExtractionHistory(id, stats) {
        await pool.query(`
            UPDATE SP_extraction_history 
            SET end_date = NOW(),
                total_records = ?,
                successful_inserts = ?,
                total_batches = ?,
                last_offset = ?,
                execution_time = ?,
                status = 'completed',
                execution_details = ?
            WHERE id = ?
        `, [
            stats.totalRegistros,
            stats.insertadosExitosos,
            stats.totalBatches,
            stats.lastOffset,
            stats.executionTime,
            JSON.stringify({
                nuevos: stats.insertadosExitosos,
                actualizados: stats.actualizadosExitosos,
                sinCambios: stats.sinCambios
            }),
            id
        ]);
    }

    async updateExtractionError(id, error) {
        await pool.query(`
            UPDATE SP_extraction_history 
            SET end_date = NOW(),
                status = 'error',
                error_message = ?
            WHERE id = ?
        `, [error.message, id]);
    }

    // Nueva función para obtener hashes existentes
    async getExistingEmailHashes(emailIds) {
        const [records] = await pool.query(`
            SELECT id, content_hash 
            FROM temp_day_hashes 
            WHERE id IN (?)
        `, [emailIds]);
        
        const hashMap = {};
        records.forEach(record => {
            hashMap[record.id] = record.content_hash;
        });
        return hashMap;
    }

    // Nueva función para generar hash
    generateEmailHash(email) {
        return require('crypto').createHash('md5').update(
            `${email.smtp_answer_code || ''}|${email.smtp_answer_code_explain || ''}|${email.smtp_answer_data || ''}|${email.tracking || ''}|${email.clicks || ''}|${email.opens || ''}|${email.client_info || ''}`
        ).digest('hex');
    }

    // Procesar el batch de correos
    async processEmailBatch(emails, dateRange) {
        // 1. Extraer todos los IDs del batch
        const emailIds = emails.map(e => e.id);
        
        // 2. Obtener hashes existentes
        const existingHashes = await this.getExistingEmailHashes(emailIds);
        
        // 3. Filtrar emails que necesitan ser insertados/actualizados
        const emailsToProcess = emails.filter(email => {
            const newHash = this.generateEmailHash(email);
            return !existingHashes[email.id] || existingHashes[email.id] !== newHash;
        });
    
        // 4. Si hay emails para procesar, insertarlos en SP_envios_temp
        if (emailsToProcess.length > 0) {
            const values = emailsToProcess.map(email => {
                const trackingData = email.tracking || {};
                const trackingJson = JSON.stringify(trackingData);
                const clicks = trackingData.click || 0;
                const opens = trackingData.open || 0;
                const clientInfo = JSON.stringify(trackingData.client_info || []);
                const hash = this.generateEmailHash(email);
    
                return [
                    email.id,
                    hash,
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
                ];
            });

                    // Consulta SQL para insertar o actualizar el registro si el ID ya existe
                    const queryduplicadostemp = `
                    INSERT INTO SP_envios_temp (
                        id, content_hash, send_date, sender, recipient, subject,
                        smtp_answer_code, smtp_answer_code_explain, smtp_answer_data,
                        tracking, clicks, opens, client_info
                    ) VALUES ?
                    ON DUPLICATE KEY UPDATE
                        content_hash = VALUES(content_hash),
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
                `;

            const [result] = await pool.query( queryduplicadostemp, [values]);
    
               
                const totalEmails = emails.length;
                const processedEmails = emailsToProcess.length;
                const sinCambios = totalEmails - processedEmails;

                return {
                    processed: processedEmails,
                    new: emailsToProcess.filter(e => !existingHashes[e.id]).length,
                    updated: emailsToProcess.filter(e => existingHashes[e.id]).length,
                    sinCambios: sinCambios
                };
            }

            // Y este return también debe incluir sinCambios
            return { processed: 0, new: 0, updated: 0, sinCambios: 0 };
    }

    // En DatabaseService
    async createDayHashesTable(date) {
        const dayStart = `${date} 00:00:00`;
        const dayEnd = `${date} 23:59:59`;
        
        await pool.query(`
            CREATE TEMPORARY TABLE IF NOT EXISTS temp_day_hashes (
                id varchar(50) PRIMARY KEY,
                content_hash varchar(32)
            ) ENGINE=MEMORY;
        `);

        await pool.query(`
            INSERT INTO temp_day_hashes
            SELECT id, content_hash 
            FROM SP_envios 
            WHERE send_date BETWEEN ? AND ?
        `, [dayStart, dayEnd]);
    }

    async dropDayHashesTable() {
        await pool.query('DROP TEMPORARY TABLE IF EXISTS temp_day_hashes');
    }


    // Función de optimización de la base de datos
    async optimizeDatabase() {
        console.log('🔧 Optimizando base de datos...');
        try {
            await pool.query('OPTIMIZE TABLE SP_envios');
            console.log('✅ Base de datos optimizada');
        } catch (error) {
            console.error('❌ Error optimizando base de datos:', error);
        }
    }
}

// Exporta una instancia de la clase DatabaseService
module.exports = new DatabaseService();