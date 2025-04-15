/**
 * Route Verification Script for Firebase Hosting Deployment
 * 
 * Este script puede ejecutarse después del despliegue para verificar
 * que todas las rutas críticas están funcionando correctamente.
 * 
 * Uso: node route-verification.js [siteName]
 * Ejemplo: node route-verification.js cryptobot
 */

const fetch = require('node-fetch');

// Configuración de sitios
const sites = {
  cryptobot: 'https://cryptobot.web.app',
  fitnessai: 'https://fitnessai.web.app',
  jetai: 'https://jetai.web.app',
  sportsai: 'https://sportsai.web.app'
};

// Rutas a verificar
const routes = [
  '/',
  '/login',
  '/signup',
  '/dashboard',
  '/admin',
  '/superadmin',
  '/pricing',
  '/features',
  '/api'
];

// Función principal de verificación
async function verifyRoutes(siteName) {
  const baseUrl = sites[siteName];
  
  if (!baseUrl) {
    console.error(`Error: Sitio "${siteName}" no encontrado. Opciones disponibles: ${Object.keys(sites).join(', ')}`);
    process.exit(1);
  }
  
  console.log(`\nVerificando rutas para: ${siteName} (${baseUrl})\n`);
  console.log('-'.repeat(50));
  
  let successCount = 0;
  
  for (const route of routes) {
    const url = `${baseUrl}${route}`;
    try {
      const response = await fetch(url);
      const success = response.status === 200;
      
      console.log(`${success ? '✅' : '❌'} ${route.padEnd(15)} - ${response.status} ${response.statusText}`);
      
      if (success) successCount++;
    } catch (error) {
      console.log(`❌ ${route.padEnd(15)} - Error: ${error.message}`);
    }
  }
  
  console.log('-'.repeat(50));
  console.log(`Resultado: ${successCount}/${routes.length} rutas funcionando correctamente`);
  
  // Verificar estado de PWA
  try {
    const manifestResponse = await fetch(`${baseUrl}/manifest.json`);
    const swResponse = await fetch(`${baseUrl}/service-worker.js`);
    
    console.log(`\nEstado PWA:`);
    console.log(`Manifest: ${manifestResponse.status === 200 ? '✅ Disponible' : '❌ No disponible'}`);
    console.log(`Service Worker: ${swResponse.status === 200 ? '✅ Disponible' : '❌ No disponible'}`);
  } catch (error) {
    console.log(`\nError verificando recursos PWA: ${error.message}`);
  }
}

// Ejecutar verificación
const targetSite = process.argv[2] || 'cryptobot';
verifyRoutes(targetSite);