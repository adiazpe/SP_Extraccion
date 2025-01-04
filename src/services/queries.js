// src/services/queries.js
const { pool } = require('../connections/database');
const crypto = require('crypto');

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

    // Obtener hashes existentes
    async getExistingEmailHashes(emailIds) {
        const [records] = await pool.query(`
            SELECT id, content_hash 
            FROM SP_envios 
            WHERE id IN (?)
        `, [emailIds]);
        
        const hashMap = {};
        records.forEach(record => {
            hashMap[record.id] = record.content_hash;
        });
        return hashMap;
    }

    // Generar hash
    generateEmailHash(email) {
        return crypto.createHash('md5').update(
            `${email.smtp_answer_code || ''}|${email.smtp_answer_code_explain || ''}|${email.smtp_answer_data || ''}|${JSON.stringify(email.tracking) || ''}|${(email.tracking?.click) || ''}|${(email.tracking?.open) || ''}|${JSON.stringify(email.tracking?.client_info) || ''}`
        ).digest('hex');
    }

    // Procesar batch de emails
    async processEmailBatch(emails, dateRange) {
        const startTotal = process.hrtime();

        const emailIds = emails.map(e => e.id);
        
        // Medición de lectura SP_envios y comparación
        const startCompare = process.hrtime();
        const existingHashes = await this.getExistingEmailHashes(emailIds);
        
        // Separar los emails y generar hashes una sola vez
        const nuevos = [];
        const actualizados = [];
        const sinCambios = [];
        const generatedHashes = new Map();

        emails.forEach(email => {
            const newHash = this.generateEmailHash(email);
            generatedHashes.set(email.id, newHash);

            if (!existingHashes[email.id]) {
                nuevos.push(email);
            } else if (existingHashes[email.id] !== newHash) {
                actualizados.push(email);
            } else {
                sinCambios.push(email);
            }
        });

        const compareElapsed = process.hrtime(startCompare);
        const compareTime = compareElapsed[0] * 1000 + compareElapsed[1] / 1000000;

        // Combinar los que necesitan procesarse
        const emailsToProcess = [...nuevos, ...actualizados];

        if (emailsToProcess.length === 0) {
            const totalElapsed = process.hrtime(startTotal);
            const totalTime = totalElapsed[0] * 1000 + totalElapsed[1] / 1000000;
            
            console.log(`⏱️ Desglose de tiempos:`);
            console.log(`  └── Comparación SP_envios: ${compareTime.toFixed(2)}ms`);
            console.log(`  └── Total: ${totalTime.toFixed(2)}ms`);
            
            return { 
                processed: 0, 
                new: 0, 
                updated: 0,
                sinCambios: emails.length 
            };
        }

        const values = emailsToProcess.map(email => {
            const trackingData = email.tracking || {};
            const trackingJson = JSON.stringify(trackingData);
            const clicks = trackingData.click || 0;
            const opens = trackingData.open || 0;
            const clientInfo = JSON.stringify(trackingData.client_info || []);
            const hash = generatedHashes.get(email.id);

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

        // Medición de escritura en temp
        const startWrite = process.hrtime();
        
        await pool.query(`
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
        `, [values]);

        const writeElapsed = process.hrtime(startWrite);
        const writeTime = writeElapsed[0] * 1000 + writeElapsed[1] / 1000000;

        const totalElapsed = process.hrtime(startTotal);
        const totalTime = totalElapsed[0] * 1000 + totalElapsed[1] / 1000000;
        
        const overhead = totalTime - (compareTime + writeTime);

        console.log(`⏱️ Desglose de tiempos:`);
        console.log(`  ├── Comparación SP_envios: ${compareTime.toFixed(2)}ms`);
        console.log(`  ├── Escritura temporal: ${writeTime.toFixed(2)}ms`);
        console.log(`  ├── Overhead: ${overhead.toFixed(2)}ms`);
        console.log(`  └── Total: ${totalTime.toFixed(2)}ms`);

        return {
            processed: emailsToProcess.length,
            new: nuevos.length,
            updated: actualizados.length,
            sinCambios: sinCambios.length
        };
    }

    // Optimizar base de datos
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

module.exports = new DatabaseService();