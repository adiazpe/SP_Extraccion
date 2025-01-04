// src/config/sendpulse.js
const axios = require('axios');
const apiSPConfig = require('../config/apiSP');

const getAccessToken = async () => {
    const startTime = process.hrtime();
    try {
        const response = await axios.post(
            `${apiSPConfig.BASE_URL}/oauth/access_token`,
            {
                grant_type: 'client_credentials',
                client_id: apiSPConfig.CLIENT_ID,
                client_secret: apiSPConfig.CLIENT_SECRET
            }
        );
        // Crear objeto con el token y metadata
        const tokenData = {
            token: response.data.access_token,
            created: new Date().toISOString()
        };

        const endTime = process.hrtime(startTime);
        const executionTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
        console.log(`⏱️ Tiempo de obtención de token: ${executionTime}ms`);

        return tokenData;
    } catch (error) {
        console.error('❌ Error obteniendo token:', error);
        throw error;
    }
};

const getEmailsFromAPI = async (tokenData, params) => {
    const startAPI = process.hrtime();
    try {
        const response = await axios.get(
            `${apiSPConfig.BASE_URL}/smtp/emails`,
            {
                headers: { 
                    'Authorization': `Bearer ${tokenData.token}`,
                    'Content-Type': 'application/json'
                },
                params: params
            }
        );

        const endAPI = process.hrtime(startAPI);
        const apiTime = (endAPI[0] * 1000 + endAPI[1] / 1000000).toFixed(2);
        console.log(`⏱️ Tiempo de respuesta API (offset ${params.offset}): ${apiTime}ms`);

        return response;
    } catch (error) {
        console.error('❌ Error en petición a API:', error);
        throw error;
    }
};

const getTotalEmails = async (tokenData, dateParams) => {
    const startTime = process.hrtime();
    try {
        const response = await axios.get(
            `${apiSPConfig.BASE_URL}/smtp/emails/total`,
            {
                headers: { 
                    'Authorization': `Bearer ${tokenData.token}`,
                    'Content-Type': 'application/json'
                },
                params: dateParams
            }
        );

        const endTime = process.hrtime(startTime);
        const executionTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
        console.log(`⏱️ Tiempo de obtención de total: ${executionTime}ms`);

        return response.data.total;
    } catch (error) {
        console.error('❌ Error obteniendo total:', error);
        throw error;
    }
};

module.exports = {
    getAccessToken,
    getEmailsFromAPI,
    getTotalEmails
};