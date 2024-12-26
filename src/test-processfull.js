// src/test-processfull.js
require('dotenv').config();
const { getAccessToken, getEmailsFromAPI } = require('./connections/sendpulse');
const { pool } = require('./connections/database');

const testProcessfull = async () => {
    try {
        console.log('🚀 Iniciando proceso de extracción...');
        
        const token = await getAccessToken();
        const batchSize = 100;
        let currentOffset = 0;
        let totalRegistros = 0;
        let continuar = true;

        while (continuar) {
            const params = {
                limit: batchSize,
                offset: currentOffset,
                from: '2024-09-20 00:00:00',
                to: '2024-09-23 23:59:59'
            };

            console.log(`\n📦 Procesando batch #${(currentOffset/batchSize) + 1}`);
            
            const response = await getEmailsFromAPI(token, params);
            const emails = response.data;
            
            if (!emails || emails.length < batchSize) {
                continuar = false;
                console.log('🏁 Último batch encontrado');
            }

            totalRegistros += emails.length;
            currentOffset += batchSize;

            console.log(`✅ Registros en este batch: ${emails.length}`);
            console.log(`📊 Total acumulado: ${totalRegistros}`);
        }

        console.log(`\n🎉 Proceso completado:`);
        console.log(`📊 Total de registros encontrados: ${totalRegistros}`);
        console.log(`📦 Total de batches procesados: ${currentOffset/batchSize}`);

    } catch (error) {
        console.error('❌ Error:', error);
    }
};

testProcessfull();