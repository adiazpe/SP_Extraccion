require('dotenv').config();
const { execSync } = require('child_process');

// Configura las credenciales de git usando el token del .env
execSync(`git config --global credential.helper store && echo "https://adiazpe:${process.env.GITHUB_TOKEN}@github.com" > ~/.git-credentials`);
