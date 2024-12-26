require('dotenv').config();
const { getAccessToken } = require('./connections/sendpulse');

console.log('🔍 Probando conexión con SendPulse...');

getAccessToken()
    .then(token => {
        console.log('✅ Conexión exitosa!');
        console.log('Token obtenido:', token.substring(0, 20) + '...');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error de conexión');
        process.exit(1);
    })