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

    // Manejo de Emails
    async insertOrUpdateEmail(email, dateRange) {
        const trackingData = email.tracking || {};
        const trackingJson = JSON.stringify(trackingData);
        const clicks = trackingData.click || 0;
        const opens = trackingData.open || 0;
        const clientInfo = JSON.stringify(trackingData.client_info || []);

        const [result] = await pool.query(`
            INSERT INTO SP_envios (
                id, send_date, sender, recipient, subject,
                smtp_answer_code, smtp_answer_code_explain, smtp_answer_data,
                tracking, clicks, opens, client_info, created_at, updated_at
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
            dateRange.startDate,
            dateRange.endDate
        ]);

        return result;
    }
}

module.exports = new DatabaseService();