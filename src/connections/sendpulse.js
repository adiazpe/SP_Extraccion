// src/config/sendpulse.js
const axios = require('axios');
const apiSPConfig = require('../config/apiSP');

const getAccessToken = async () => {
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
        return tokenData;
    } catch (error) {
        console.error('❌ Error obteniendo token:', error);
        throw error;
    }
};

const getEmailsFromAPIOld = async (tokenData, params) => {
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
        return response;
    } catch (error) {
        console.error('❌ Error en petición a API:', error);
        throw error;
    }
};

async function getEmailsFromAPI(tokenData, params, maxRetries = 5, retryDelay = 10000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await axios.get(
                `${apiSPConfig.BASE_URL}/smtp/emails`,
                {
                    headers: { 
                        'Authorization': `Bearer ${tokenData.token}`,
                        'Content-Type': 'application/json'
                    },
                    params: params
                }
            );
        } catch (error) {
            if (attempt === maxRetries) throw error;
            
            console.log(`Intento ${attempt} falló, reintentando en ${retryDelay/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
};

const getTotalEmails = async (tokenData, dateParams) => {
    try {
        const response = await axios.get(
            `${apiSPConfig.BASE_URL}/smtp/emails/total`,
            {
                headers: { 
                    'Authorization': `Bearer ${tokenData.token}`,
                    'Content-Type': 'application/json'
                },
                params: dateParams
            }  // solo una llave aquí
        );
        return response.data.total;
    } catch (error) {
        console.error('❌ Error obteniendo total:', error);
        throw error;
    }
};

module.exports = {
    getAccessToken,
    getEmailsFromAPI,
    getEmailsFromAPIOld,
    getTotalEmails
};