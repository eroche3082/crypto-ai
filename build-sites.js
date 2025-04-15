/**
 * Script para construir todas las versiones de aplicaciones para despliegue multisitio en Firebase
 * Este script genera builds separados para cada sitio (CryptoBot, FitnessAI, JetAI, SportsAI)
 * 
 * Ejecutar con: node build-sites.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuración de sitios
const sites = [
  {
    target: 'cryptobot',
    title: 'CryptoBot - Advanced Cryptocurrency AI Platform',
    theme: '#3861fb',
    description: 'Advanced cryptocurrency platform with AI-driven insights and portfolio tracking',
    primaryColor: '#3861fb',
    secondaryColor: '#121212'
  },
  {
    target: 'fitnessai',
    title: 'FitnessAI - Your AI-Powered Fitness Coach',
    theme: '#27ae60',
    description: 'Personalized AI fitness coaching and health tracking platform',
    primaryColor: '#27ae60',
    secondaryColor: '#121212'
  },
  {
    target: 'jetai',
    title: 'JetAI - Private Aviation Intelligence Platform',
    theme: '#2c3e50',
    description: 'AI-driven private aviation management and insights platform',
    primaryColor: '#2c3e50', 
    secondaryColor: '#121212'
  },
  {
    target: 'sportsai',
    title: 'SportsAI - AI-Powered Sports Analytics',
    theme: '#e74c3c',
    description: 'Advanced sports analytics and predictions powered by AI',
    primaryColor: '#e74c3c',
    secondaryColor: '#121212'
  }
];

// Crear carpeta base para builds
const buildBaseDir = path.join(__dirname, 'builds');
if (!fs.existsSync(buildBaseDir)) {
  fs.mkdirSync(buildBaseDir);
}

console.log('🔨 Iniciando proceso de construcción para todos los sitios...\n');

// Construir cada sitio
sites.forEach(site => {
  console.log(`\n📦 Construyendo sitio: ${site.target}`);
  
  // Crear carpeta específica para este sitio
  const siteDir = path.join(buildBaseDir, site.target);
  if (!fs.existsSync(siteDir)) {
    fs.mkdirSync(siteDir);
  }
  
  try {
    // 1. Modificar el archivo de tema para este sitio
    const themeFile = path.join(__dirname, 'theme.json');
    const themeConfig = {
      primary: site.primaryColor,
      variant: "vibrant",
      appearance: "dark",
      radius: 0.5
    };
    fs.writeFileSync(themeFile, JSON.stringify(themeConfig, null, 2));
    console.log(`  ✅ Tema configurado: ${site.primaryColor}`);
    
    // 2. Modificar el manifest.json para este sitio
    const manifestSrc = path.join(__dirname, 'client', 'public', 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestSrc, 'utf8'));
    
    manifest.name = site.title;
    manifest.short_name = site.target;
    manifest.description = site.description;
    manifest.theme_color = site.theme;
    
    fs.writeFileSync(manifestSrc, JSON.stringify(manifest, null, 2));
    console.log(`  ✅ Manifest actualizado para: ${site.target}`);
    
    // 3. Construir el proyecto (simularemos esto creando un index.html básico)
    // En un entorno real, ejecutaríamos: execSync('npm run build', { stdio: 'inherit' });
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir);
    }
    
    // Crear un index.html básico para simulación
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="${site.theme}">
  <link rel="manifest" href="/manifest.json">
  <title>${site.title}</title>
  <style>
    body { 
      font-family: system-ui, sans-serif; 
      background-color: ${site.secondaryColor}; 
      color: white;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }
    .header {
      background-color: ${site.primaryColor};
      width: 100%;
      padding: 20px;
      margin-bottom: 40px;
    }
    .content {
      max-width: 800px;
      padding: 0 20px;
    }
    h1 { margin-top: 0; }
    .button {
      background-color: ${site.primaryColor};
      border: none;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 20px;
      text-decoration: none;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${site.title}</h1>
  </div>
  <div class="content">
    <h2>Welcome to ${site.target}</h2>
    <p>${site.description}</p>
    <a href="/dashboard" class="button">Acceder a la Plataforma</a>
  </div>
  
  <script>
    // Registro del Service Worker para funcionalidad PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(reg => console.log('Service Worker registrado'))
          .catch(err => console.error('Error registrando Service Worker:', err));
      });
    }
  </script>
</body>
</html>`;
    
    fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);
    
    // Crear una copia del service-worker.js en dist
    const swSrc = path.join(__dirname, 'client', 'public', 'service-worker.js');
    const swDst = path.join(distDir, 'service-worker.js');
    fs.copyFileSync(swSrc, swDst);
    
    // Crear una copia del manifest.json en dist
    const manifestDst = path.join(distDir, 'manifest.json');
    fs.copyFileSync(manifestSrc, manifestDst);
    
    console.log(`  ✅ Build simulado completado para: ${site.target}`);
    
    // 4. Copiar los archivos de dist a la carpeta específica del sitio
    console.log(`  🔄 Copiando archivos de build a: ${siteDir}`);
    
    // En un entorno real, usaríamos fs-extra para copiar directorios
    // Aquí solo copiaremos los archivos específicos que creamos
    fs.copyFileSync(path.join(distDir, 'index.html'), path.join(siteDir, 'index.html'));
    fs.copyFileSync(path.join(distDir, 'service-worker.js'), path.join(siteDir, 'service-worker.js'));
    fs.copyFileSync(path.join(distDir, 'manifest.json'), path.join(siteDir, 'manifest.json'));
    
    console.log(`  ✅ Archivos copiados exitosamente`);
    
  } catch (error) {
    console.error(`  ❌ Error construyendo ${site.target}:`, error);
  }
});

console.log('\n✅ Proceso completado. Los builds están disponibles en la carpeta "builds".');
console.log('  Para desplegar, ejecute: firebase deploy --only hosting');
console.log('  Para desplegar un sitio específico, ejecute: firebase deploy --only hosting:TARGET');