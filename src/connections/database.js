const mysql = require('mysql2/promise'); // Usando mysql2 con promesas
const dbConfig = require('../config/database');

// Creando pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para verificar la conexión
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection successful');
        connection.release();
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    }
};

module.exports = {
    pool,
    testConnection
};