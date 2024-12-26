# Proyecto SP Extracción de Datos

Este proyecto tiene como objetivo la **extracción de datos desde la API de SendPulse** y la posterior manipulación y almacenamiento de los mismos en una base de datos MySQL. Los datos se pueden consultar y exportar a formatos como **CSV** y **XLS** según lo seleccione el usuario.

## Estructura de Archivos

La estructura de directorios y archivos es la siguiente:

SP_Extraccion/
├── src/                      # Código fuente
│   ├── index.js              # Archivo principal
│   ├── api/                  # Funciones para interactuar con la API de SendPulse
│   ├── services/             # Funciones para procesar los datos
├── .env                      # Variables de entorno
├── package.json              # Configuración de dependencias
└── README.md                 # Este archivo
└── LICENCE                   # Licencia de uso


### Descripción de los Archivos:

1. **`src/index.js`**: Este es el **archivo principal** que se ejecuta cuando inicias la aplicación. En este archivo se realiza la **extracción de datos** de la API de SendPulse, el procesamiento y la posible exportación de los datos a formatos como **CSV** o **XLS**.

2. **`src/api/sendpulse.js`**: Este archivo contiene las funciones **específicas para interactuar con la API de SendPulse**. Aquí se definen las llamadas API necesarias para recuperar los datos, como el uso de claves de autenticación y la estructuración de las solicitudes HTTP.

3. **`src/services/dataProcessor.js`**: Este archivo maneja la **lógica de procesamiento de los datos** una vez que son extraídos. Aquí puedes realizar transformaciones, validaciones o cualquier tipo de procesamiento antes de almacenarlos en la base de datos o exportarlos a otro formato.

4. **`src/config/api.config.js`**: Este archivo contiene las **configuraciones relacionadas con la API** de SendPulse, como las claves de acceso (API keys). Este archivo se usa para mantener las configuraciones sensibles fuera del código principal.

5. **`.env`**: Este archivo contiene las **variables de entorno** para manejar las configuraciones sensibles de forma segura, como las claves de la API de SendPulse, y otras configuraciones relacionadas con tu proyecto. **No debe subirse al control de versiones** para proteger las claves.

6. **`package.json`**: El archivo de configuración de **npm** que contiene las dependencias necesarias (como `axios` para hacer solicitudes HTTP, `dotenv` para gestionar variables de entorno, `mysql2` para interactuar con la base de datos), y los **scripts** que permiten iniciar la aplicación.

7. **`LICENSE`**: Este archivo contiene la **licencia propietaria** que protege tu código y lo limita a ser utilizado solo por los clientes con los que has firmado acuerdos comerciales.

8. **`README.md`**: El archivo de documentación que explica el propósito de la aplicación, su estructura de archivos y cómo se utiliza.


## Instalación

Para instalar y ejecutar el proyecto en tu máquina local o servidor, sigue estos pasos:

1. Navega a la carpeta del proyecto.

2. Instala las dependencias con:

3. Copiar código
**npm install**

4. Configura las variables de entorno creando un archivo .env en la raíz del proyecto y agrega tus claves de la API de SendPulse de la siguiente forma:

**makefile**
Copiar código
SENDPULSE_API_KEY=tu_api_key_aqui
SENDPULSE_API_SECRET=tu_api_secret_aqui
Ejecuta el proyecto (cuando sea necesario) con:

sql
Copiar código
npm start
Estructura del Proyecto
bash
Copiar código
SP_Extraccion/
├── src/                  # Código fuente
│   ├── index.js          # Archivo principal para la extracción de datos
│   ├── api/              # Carpeta para manejar las conexiones y funciones API
│   ├── services/         # Lógica adicional, como el manejo de datos extraídos
├── .env                  # Variables de entorno
├── package.json          # Configuración de dependencias y scripts del proyecto
└── README.md             # Descripción del proyecto y cómo usarlo
Licencia
Este proyecto está bajo la licencia propietaria de Nucleo SP Mexico SA de CV - Super Partner Agency, y solo puede ser usado por clientes con contrato firmado.

