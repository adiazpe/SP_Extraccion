// src/config/apiSP.js
const apiSPConfig = {
  CLIENT_ID: process.env.SENDPULSE_CLIENT_ID,
  CLIENT_SECRET: process.env.SENDPULSE_CLIENT_SECRET,
  BASE_URL: process.env.SENDPULSE_BASE_URL || 'https://api.sendpulse.com',
  SMTP_ENDPOINT: '/smtp/emails',
  TIMEOUT: 5000
};

console.log('Configuración de SendPulse cargada:', {
  BASE_URL: apiSPConfig.BASE_URL,
  // No mostramos CLIENT_SECRET por seguridad
});

module.exports = apiSPConfig;