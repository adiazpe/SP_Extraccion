require('dotenv').config();
const dbConfig = require('./config/database');
const apiSPConfig = require('./config/apiSP');

//Revisar conexión con base de datos al iniciar
const { testConnection } = require('./connections/database');

// Probar conexión al iniciar la aplicación
testConnection()
    .then(() => {
        console.log('✅ Conexión a la base de datos exitosa');
        console.log('🚀 Aplicación iniciada correctamente');
        // Resto de tu código de inicialización
    })
    .catch(error => {
        console.error('❌ Error de conexión a la base de datos:', error);
        process.exit(1);
    });

const { processData } = require('./services/dataProcessor');

// Ejecutar la extracción y almacenamiento de datos
processData(0); // Llamamos con el offset inicial 0