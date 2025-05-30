const fs = require('fs');
const path = require('path');

// Ruta al archivo environment.ts (o environment.prod.ts si prefieres)
// Ajusta la ruta si tu archivo de entorno de producción es diferente
const envFilePath = path.join(__dirname, '../src/environments/environment.ts');

// Lee el contenido del archivo
let envFileContent = fs.readFileSync(envFilePath, 'utf8');

// Reemplaza los marcadores de posición con los valores de las variables de entorno
// Estas variables de entorno deben estar definidas en tu workflow de GitHub Actions
// y pobladas desde los secretos de GitHub.
envFileContent = envFileContent.replace(/__PROD_FB_API_KEY__/g, process.env.PROD_FB_API_KEY || '');
envFileContent = envFileContent.replace(/__PROD_FB_AUTH_DOMAIN__/g, process.env.PROD_FB_AUTH_DOMAIN || '');
envFileContent = envFileContent.replace(/__PROD_FB_PROJECT_ID__/g, process.env.PROD_FB_PROJECT_ID || '');
envFileContent = envFileContent.replace(/__PROD_FB_STORAGE_BUCKET__/g, process.env.PROD_FB_STORAGE_BUCKET || '');
envFileContent = envFileContent.replace(/__PROD_FB_MESSAGING_SENDER_ID__/g, process.env.PROD_FB_MESSAGING_SENDER_ID || '');
envFileContent = envFileContent.replace(/__PROD_FB_APP_ID__/g, process.env.PROD_FB_APP_ID || '');
envFileContent = envFileContent.replace(/__PROD_FB_MEASUREMENT_ID__/g, process.env.PROD_FB_MEASUREMENT_ID || '');

// Escribe el contenido modificado de nuevo en el archivo
fs.writeFileSync(envFilePath, envFileContent);

console.log(`Archivo de entorno ${envFilePath} actualizado con éxito.`);