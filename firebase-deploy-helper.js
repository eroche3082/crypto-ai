/**
 * Script de ayuda para despliegue en Firebase Hosting
 * 
 * Este script verifica la configuración de Firebase y ofrece comandos para el despliegue
 * Ejecutar con: node firebase-deploy-helper.js
 */

const fs = require('fs');
const { execSync } = require('child_process');

// Verificar archivos de configuración de Firebase
console.log('🔍 Verificando configuración de Firebase...\n');

// Verificar .firebaserc
let firebaserc;
try {
  firebaserc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
  console.log('✅ Archivo .firebaserc encontrado');
  
  // Verificar proyecto predeterminado
  if (firebaserc.projects && firebaserc.projects.default) {
    console.log(`   - Proyecto: ${firebaserc.projects.default}`);
  } else {
    console.log('❌ No se encontró un proyecto predeterminado en .firebaserc');
  }
  
  // Verificar targets
  if (firebaserc.targets && firebaserc.targets[firebaserc.projects.default] && 
      firebaserc.targets[firebaserc.projects.default].hosting) {
    const targets = firebaserc.targets[firebaserc.projects.default].hosting;
    console.log(`   - Targets de hosting configurados: ${Object.keys(targets).join(', ')}`);
  } else {
    console.log('❌ No se encontraron targets de hosting en .firebaserc');
  }
} catch (error) {
  console.log('❌ Error al leer .firebaserc:', error.message);
}

// Verificar firebase.json
let firebaseConfig;
try {
  firebaseConfig = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
  console.log('✅ Archivo firebase.json encontrado');
  
  // Verificar configuración de hosting
  if (firebaseConfig.hosting) {
    if (Array.isArray(firebaseConfig.hosting)) {
      console.log(`   - ${firebaseConfig.hosting.length} configuraciones de hosting encontradas`);
      firebaseConfig.hosting.forEach(host => {
        console.log(`     * Target: ${host.target || 'default'}, Directorio: ${host.public}`);
      });
    } else {
      console.log(`   - Configuración única de hosting, Directorio: ${firebaseConfig.hosting.public}`);
      console.log('⚠️ La configuración no parece ser para multi-sitio. Considera usar un array de configuraciones.');
    }
  } else {
    console.log('❌ No se encontró configuración de hosting en firebase.json');
  }
} catch (error) {
  console.log('❌ Error al leer firebase.json:', error.message);
}

// Verificar si Firebase CLI está instalado
console.log('\n🔍 Verificando herramientas de despliegue...');
try {
  const firebaseVersion = execSync('firebase --version').toString().trim();
  console.log(`✅ Firebase CLI instalado (versión ${firebaseVersion})`);
} catch (error) {
  console.log('❌ Firebase CLI no encontrado. Ejecuta "npm install -g firebase-tools" para instalarlo.');
}

// Verificar directorios de builds
console.log('\n🔍 Verificando directorios de builds...');
const distDir = './dist';
if (fs.existsSync(distDir)) {
  console.log(`✅ Directorio ${distDir} encontrado`);
  
  // Verificar archivos necesarios para PWA
  const requiredFiles = ['index.html', 'manifest.json', 'service-worker.js'];
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(`${distDir}/${file}`));
  
  if (missingFiles.length === 0) {
    console.log(`   - Archivos PWA necesarios encontrados`);
  } else {
    console.log(`❌ Faltan archivos necesarios: ${missingFiles.join(', ')}`);
  }
} else {
  console.log(`❌ No se encontró el directorio ${distDir}. Ejecuta primero el build.`);
}

// Mostrar comandos para despliegue
console.log('\n🚀 Comandos para despliegue:');
console.log('   1. Autenticarse en Firebase:');
console.log('      firebase login');
console.log('\n   2. Seleccionar proyecto:');
console.log(`      firebase use ${firebaserc?.projects?.default || 'your-project-id'}`);
console.log('\n   3. Construir la aplicación:');
console.log('      npm run build');
console.log('\n   4. Desplegar todos los sitios:');
console.log('      firebase deploy --only hosting');
console.log('\n   5. Desplegar un sitio específico:');
console.log('      firebase deploy --only hosting:TARGET');
console.log('      Ejemplos:');
console.log('      firebase deploy --only hosting:cryptobot');
console.log('      firebase deploy --only hosting:fitnessai');

// Sugerir comandos de limpieza y mantenimiento
console.log('\n🧹 Comandos de mantenimiento:');
console.log('   - Listar todos los sitios en su proyecto:');
console.log('     firebase hosting:sites:list');
console.log('   - Eliminar un sitio (si ya no es necesario):');
console.log('     firebase hosting:sites:delete SITEID');
console.log('   - Limpiar caché:');
console.log('     firebase hosting:clearCache');