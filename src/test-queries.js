// src/test-queries.js
require('dotenv').config();
const { pool } = require('./connections/database');

const testQueries = async () => {
    try {
        // 1. Verificar cuántos registros hay en total
        const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM SP_envios');
        console.log('\n📊 Total de registros en la base:', totalResult[0].total);

        // 2. Ver los últimos 5 registros insertados
        console.log('\n📧 Últimos 5 emails guardados:');
        const [emails] = await pool.query(`
            SELECT id, send_date, sender, recipient, subject 
            FROM SP_envios 
            ORDER BY send_date DESC 
            LIMIT 5
        `);

        // Mostrar cada email de forma legible
        emails.forEach(email => {
            console.log('-------------------------');
            console.log(`ID: ${email.id}`);
            console.log(`Fecha: ${email.send_date}`);
            console.log(`De: ${email.sender}`);
            console.log(`Para: ${email.recipient}`);
            console.log(`Asunto: ${email.subject}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
};

// Ejecutar las consultas
testQueries();