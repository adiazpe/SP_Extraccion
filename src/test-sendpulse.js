require('dotenv').config();
const axios = require('axios');

const testSendPulseConnection = async () => {
    try {
        console.log('🔍 Obteniendo token de SendPulse...');
        
        // 1. Obtener token
        const authResponse = await axios.post(
            'https://api.sendpulse.com/oauth/access_token',
            {
                grant_type: 'client_credentials',
                client_id: process.env.SENDPULSE_CLIENT_ID,
                client_secret: process.env.SENDPULSE_CLIENT_SECRET
            }
        );

        const token = authResponse.data.access_token;
        console.log('✅ Token obtenido correctamente');

        // 2. Probar obtener lista de emails
        console.log('🔍 Probando obtener emails...');
        const emailsResponse = await axios.get(
            'https://api.sendpulse.com/smtp/emails',
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    limit: 1  // Solo pedimos 1 para probar
                }
            }
        );

        console.log('✅ Conexión exitosa!');
        console.log('Ejemplo de respuesta:', JSON.stringify(emailsResponse.data, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
};

// Ejecutar la prueba
testSendPulseConnection();