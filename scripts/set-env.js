const { writeFileSync, mkdirSync } = require('fs');
const { dirname } = require('path');
require('dotenv').config();

const targetPath = './src/app/environments/environment.ts';
mkdirSync(dirname(targetPath), { recursive: true });

const envConfigFile = `export const environment = {
  production: ${process.env['PRODUCTION'] === 'true'},
  apiUrl: '${process.env['BACKEND_URL'] || 'http://localhost:8080/api'}',
};
`;

writeFileSync(targetPath, envConfigFile, 'utf8');
console.log(`Archivo generado en ${targetPath}`);
