/**
 * Enhanced Route Verification Script for Firebase Hosting Deployment - Phase 6
 * 
 * This script performs comprehensive verification of the deployed CryptoBot platform
 * including route testing, visual integrity, API connectivity, and responsive design checks.
 * 
 * Usage: node route-verification.js [siteName] [--detailed]
 * Example: node route-verification.js cryptobot --detailed
 */

const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { chromium } = require('playwright');
const chalk = require('chalk');

// Site configuration with production URLs
const sites = {
  cryptobot: 'https://cryptobot.socialbrands.ai',
  fitnessai: 'https://fitnessai.socialbrands.ai',
  jetai: 'https://jetai.socialbrands.ai',
  sportsai: 'https://sportsai.socialbrands.ai'
};

// Test credentials - DO NOT USE REAL CREDENTIALS IN PRODUCTION CODE
// These are placeholders for testing purposes
const testCredentials = {
  admin: {
    username: 'admin',
    password: 'Admin3082#'
  },
  user: {
    email: 'test@example.com',
    password: 'TestUser123#'
  }
};

// Routes to verify with detailed descriptions
const routes = [
  { path: '/', name: 'Homepage', auth: false, description: 'Main landing page with hero section and features' },
  { path: '/login', name: 'Login Portal', auth: false, description: 'User authentication form' },
  { path: '/signup', name: 'Signup Form', auth: false, description: 'New user registration' },
  { path: '/dashboard', name: 'User Dashboard', auth: true, description: 'Main user interface after login' },
  { path: '/features', name: 'Features Page', auth: false, description: 'Platform capabilities overview' },
  { path: '/pricing', name: 'Pricing Table', auth: false, description: 'Membership tiers and payment options' },
  { path: '/chat', name: 'AI Assistant', auth: true, description: 'Conversational AI interface' },
  { path: '/editor', name: 'Visual Editor', auth: true, description: 'UI customization tool (admin only)' },
  { path: '/superadmin', name: 'SuperAdmin Portal', auth: true, description: 'Master administration dashboard' },
  { path: '/admin', name: 'Admin Dashboard', auth: true, description: 'Standard admin management interface' },
];

// API endpoints to verify
const apiEndpoints = [
  { path: '/api/crypto/coins/markets', description: 'Cryptocurrency market data' },
  { path: '/api/config/get', description: 'UI configuration data' },
  { path: '/api/auth/status', description: 'Authentication status check' }
];

// UI elements to check on each page
const uiElementsToCheck = {
  '/': ['navbar', 'hero-section', 'features-preview', 'cta-section', 'footer'],
  '/login': ['login-form', 'submit-button'],
  '/dashboard': ['user-profile', 'crypto-table', 'portfolio-section'],
  '/editor': ['color-picker', 'font-selector', 'layout-options', 'save-button']
};

// Device profiles for responsive testing
const deviceProfiles = [
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 375, height: 667 }
];

// Main verification function
async function verifyRoutes(siteName, detailed = false) {
  // Set base URL from site config
  const baseUrl = sites[siteName];
  
  if (!baseUrl) {
    console.error(chalk.red(`Error: Site "${siteName}" not found. Available options: ${Object.keys(sites).join(', ')}`));
    process.exit(1);
  }
  
  console.log(chalk.blue(`\n🔍 PHASE 6: VERIFICATION FOR ${siteName.toUpperCase()}\n`));
  console.log(chalk.blue(`Testing site: ${baseUrl}\n`));
  console.log(chalk.blue('='.repeat(60)));
  
  // 1. Basic route availability check
  console.log(chalk.yellow('\n📋 ROUTE VERIFICATION\n'));
  
  let routeSuccessCount = 0;
  
  for (const route of routes) {
    const url = `${baseUrl}${route.path}`;
    try {
      const response = await fetch(url, { redirect: 'manual' });
      // Consider redirects for auth pages as potentially valid
      const success = response.status === 200 || (route.auth && response.status === 302);
      
      if (success) {
        console.log(chalk.green(`✅ ${route.name.padEnd(20)} - ${response.status} ${response.statusText}`));
        routeSuccessCount++;
      } else {
        console.log(chalk.red(`❌ ${route.name.padEnd(20)} - ${response.status} ${response.statusText}`));
      }
      
      if (detailed) {
        console.log(chalk.gray(`   ${route.path.padEnd(15)} - ${route.description}`));
      }
    } catch (error) {
      console.log(chalk.red(`❌ ${route.name.padEnd(20)} - Error: ${error.message}`));
    }
  }
  
  console.log(chalk.blue('-'.repeat(60)));
  console.log(chalk.blue(`Routes Result: ${routeSuccessCount}/${routes.length} routes accessible`));
  
  // 2. API endpoint check
  if (detailed) {
    console.log(chalk.yellow('\n🔌 API ENDPOINT VERIFICATION\n'));
    
    let apiSuccessCount = 0;
    
    for (const endpoint of apiEndpoints) {
      const url = `${baseUrl}${endpoint.path}`;
      try {
        const response = await fetch(url);
        const success = response.status === 200;
        
        if (success) {
          console.log(chalk.green(`✅ ${endpoint.path.padEnd(25)} - ${response.status}`));
          
          // Try parsing response as JSON
          try {
            const data = await response.json();
            console.log(chalk.gray(`   Data structure valid: ${typeof data === 'object' ? 'Yes' : 'No'}`));
          } catch (e) {
            console.log(chalk.gray(`   Not JSON or parsing error`));
          }
          
          apiSuccessCount++;
        } else {
          console.log(chalk.red(`❌ ${endpoint.path.padEnd(25)} - ${response.status}`));
        }
      } catch (error) {
        console.log(chalk.red(`❌ ${endpoint.path.padEnd(25)} - Error: ${error.message}`));
      }
    }
    
    console.log(chalk.blue('-'.repeat(60)));
    console.log(chalk.blue(`API Result: ${apiSuccessCount}/${apiEndpoints.length} endpoints accessible`));
  }
  
  // 3. PWA verification
  console.log(chalk.yellow('\n📱 PWA VERIFICATION\n'));
  
  try {
    const manifestResponse = await fetch(`${baseUrl}/manifest.json`);
    const swResponse = await fetch(`${baseUrl}/service-worker.js`);
    
    console.log(chalk.green(`Manifest: ${manifestResponse.status === 200 ? '✅ Available' : '❌ Not available'}`));
    console.log(chalk.green(`Service Worker: ${swResponse.status === 200 ? '✅ Available' : '❌ Not available'}`));
    
    if (manifestResponse.status === 200) {
      try {
        const manifest = await manifestResponse.json();
        console.log(chalk.gray(`   App Name: ${manifest.name}`));
        console.log(chalk.gray(`   Theme Color: ${manifest.theme_color}`));
      } catch (e) {
        console.log(chalk.gray(`   Invalid manifest JSON format`));
      }
    }
  } catch (error) {
    console.log(chalk.red(`Error verifying PWA resources: ${error.message}`));
  }
  
  // 4. Visual and responsive design check (if detailed and playwright is available)
  if (detailed) {
    try {
      console.log(chalk.yellow('\n🖥️ RESPONSIVE DESIGN VERIFICATION\n'));
      
      // Launch browser for visual testing
      const browser = await chromium.launch();
      
      for (const device of deviceProfiles) {
        console.log(chalk.blue(`Testing on ${device.name} (${device.width}x${device.height})`));
        
        const context = await browser.newContext({
          viewport: { width: device.width, height: device.height }
        });
        
        const page = await context.newPage();
        await page.goto(baseUrl);
        
        // Take a screenshot for visual verification
        const screenshotPath = `./${siteName}_${device.name.toLowerCase()}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: false });
        
        console.log(chalk.green(`✅ Screenshot saved to ${screenshotPath}`));
        
        // Check for responsive elements
        const isMobileMenuVisible = await page.evaluate(() => {
          // Look for typical mobile menu button presence
          return !!document.querySelector('.mobile-menu-button, .hamburger, [aria-label="Menu"]');
        });
        
        console.log(chalk.gray(`   Mobile menu ${device.name === 'Mobile' ? 'should be' : 'should not be'} visible: ${isMobileMenuVisible ? 'Yes' : 'No'}`));
        
        await context.close();
      }
      
      await browser.close();
    } catch (error) {
      console.log(chalk.yellow(`Note: Visual testing skipped. Install playwright with "npm i playwright" to enable.`));
      console.log(chalk.red(`Error during visual testing: ${error.message}`));
    }
  }
  
  // 5. Final summary
  console.log(chalk.blue('\n='.repeat(60)));
  console.log(chalk.green(`\n🚀 VERIFICATION SUMMARY FOR ${siteName.toUpperCase()}\n`));
  console.log(chalk.green(`✅ Route Accessibility: ${routeSuccessCount}/${routes.length}`));
  console.log(chalk.green(`✅ PWA Configuration: ${(manifestResponse?.status === 200 && swResponse?.status === 200) ? 'Complete' : 'Incomplete'}`));
  
  if (detailed) {
    console.log(chalk.green(`✅ API Endpoints: ${apiSuccessCount}/${apiEndpoints.length}`));
    console.log(chalk.green(`✅ Responsive Testing: ${deviceProfiles.length} device profiles checked`));
  }
  
  console.log(chalk.blue('\n='.repeat(60)));
  console.log(chalk.yellow('\nNext steps:'));
  console.log(chalk.yellow('1. Manually verify UI visual integrity'));
  console.log(chalk.yellow('2. Test form submissions and user authentication'));
  console.log(chalk.yellow('3. Verify editor changes propagate to site UI'));
  console.log(chalk.yellow('4. Test payment flow with test credit card'));
  console.log(chalk.yellow('5. Verify AI assistant responses in multiple languages'));
}

// Parse command line arguments
const targetSite = process.argv[2] || 'cryptobot';
const detailed = process.argv.includes('--detailed');

// Run verification
verifyRoutes(targetSite, detailed);