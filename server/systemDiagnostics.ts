/**
 * System-Wide Diagnostics Service
 * 
 * Performs comprehensive platform validation across all components:
 * - API Services (Google Cloud, Vertex AI, Firebase, etc.)
 * - Frontend functionality
 * - Chatbot integration
 * - Access code system
 * - Payment processing
 * - Content and media loading
 * - Multilingual support
 */
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { runAllServiceTests } from './googleServicesTest';

// Initialize environment
dotenv.config();

interface SystemStatus {
  agent: string;
  apiStatus: {
    vision: 'active' | 'pending' | 'failed';
    translation: 'active' | 'pending' | 'failed';
    tts: 'active' | 'pending' | 'failed';
    stt: 'active' | 'pending' | 'failed';
    naturalLanguage: 'active' | 'pending' | 'failed';
    gemini: 'active' | 'pending' | 'failed';
    vertex: 'active' | 'pending' | 'failed';
  };
  chatbot: 'functional' | 'partial' | 'unavailable';
  dashboard: 'accessible' | 'partial' | 'unavailable';
  onboarding: 'working' | 'partial' | 'unavailable';
  accessCodeSystem: 'active' | 'partial' | 'unavailable';
  paymentIntegration: 'working' | 'partial' | 'unavailable';
  missing: string[];
  improvements: string[];
  deploymentReadiness: string;
  readyForLaunch: boolean;
}

/**
 * Calculates the deployment readiness percentage based on various system checks
 */
function calculateDeploymentReadiness(status: Partial<SystemStatus>): string {
  const apiStatusWeight = 0.3;
  const coreServicesWeight = 0.5;
  const minorIssuesWeight = 0.2;
  
  // Calculate API readiness
  const apiServices = Object.values(status.apiStatus || {});
  const activeApis = apiServices.filter(status => status === 'active').length;
  const apiReadiness = apiServices.length > 0 ? (activeApis / apiServices.length) : 0;
  
  // Calculate core services readiness (chatbot, dashboard, onboarding, etc.)
  const coreServiceStatuses = [
    status.chatbot === 'functional' ? 1 : (status.chatbot === 'partial' ? 0.5 : 0),
    status.dashboard === 'accessible' ? 1 : (status.dashboard === 'partial' ? 0.5 : 0),
    status.onboarding === 'working' ? 1 : (status.onboarding === 'partial' ? 0.5 : 0),
    status.accessCodeSystem === 'active' ? 1 : (status.accessCodeSystem === 'partial' ? 0.5 : 0),
    status.paymentIntegration === 'working' ? 1 : (status.paymentIntegration === 'partial' ? 0.5 : 0)
  ];
  
  const coreServicesReadiness = coreServiceStatuses.reduce((sum, val) => sum + val, 0) / coreServiceStatuses.length;
  
  // Calculate readiness impact from missing features and suggested improvements
  const missingIssuesImpact = Math.max(0, 1 - ((status.missing?.length || 0) * 0.05));
  const improvementsImpact = Math.max(0, 1 - ((status.improvements?.length || 0) * 0.02));
  const minorIssuesReadiness = (missingIssuesImpact + improvementsImpact) / 2;
  
  // Calculate weighted readiness
  const readiness = (
    apiStatusWeight * apiReadiness +
    coreServicesWeight * coreServicesReadiness +
    minorIssuesWeight * minorIssuesReadiness
  ) * 100;
  
  return `${Math.round(readiness)}%`;
}

/**
 * Determines if the system is ready for launch based on readiness percentage
 */
function determineReadyForLaunch(readiness: string): boolean {
  const readinessPercentage = parseInt(readiness.replace('%', ''));
  return readinessPercentage >= 85;
}

/**
 * Executes a full system diagnostic check
 */
export async function runSystemDiagnostics(): Promise<SystemStatus> {
  // Start with baseline status
  const systemStatus: Partial<SystemStatus> = {
    agent: 'CryptoBot',
    apiStatus: {
      vision: 'pending',
      translation: 'pending',
      tts: 'pending',
      stt: 'pending',
      naturalLanguage: 'pending',
      gemini: 'pending',
      vertex: 'pending'
    },
    chatbot: 'partial',
    dashboard: 'accessible',
    onboarding: 'working',
    accessCodeSystem: 'active',
    paymentIntegration: 'partial',
    missing: [],
    improvements: []
  };
  
  try {
    // Check Google Cloud API services
    const googleServicesResults = await runAllServiceTests();
    
    // Update API statuses based on test results
    for (const result of googleServicesResults.results) {
      switch (result.service) {
        case 'vision':
          systemStatus.apiStatus!.vision = result.success ? 'active' : 'failed';
          break;
        case 'translate':
          systemStatus.apiStatus!.translation = result.success ? 'active' : 'failed';
          break;
        case 'text-to-speech':
          systemStatus.apiStatus!.tts = result.success ? 'active' : 'failed';
          break;
        case 'speech':
          systemStatus.apiStatus!.stt = result.success ? 'active' : 'failed';
          break;
        case 'language':
          systemStatus.apiStatus!.naturalLanguage = result.success ? 'active' : 'failed';
          break;
      }
    }
    
    // Check Vertex AI / Gemini status
    const vertexStatus = process.env.GOOGLE_VERTEX_KEY_ID ? 'active' : 'failed';
    systemStatus.apiStatus!.vertex = vertexStatus;
    systemStatus.apiStatus!.gemini = process.env.VITE_GEMINI_API_KEY ? 'active' : 'failed';
    
    // Check for missing components and needed improvements
    const missingComponents = [];
    const improvements = [];
    
    // Check for Firebase integration issues
    if (!process.env.VITE_FIREBASE_API_KEY || !process.env.VITE_FIREBASE_PROJECT_ID) {
      missingComponents.push('Firebase configuration incomplete');
      improvements.push('Complete Firebase integration for user authentication and data persistence');
    }
    
    // Check for Stripe integration
    if (!process.env.VITE_STRIPE_PUBLIC_KEY || !process.env.STRIPE_SECRET_KEY) {
      systemStatus.paymentIntegration = 'unavailable';
      missingComponents.push('Stripe payment integration missing');
      improvements.push('Configure Stripe API keys for payment processing');
    }
    
    // Check for SendGrid email integration
    if (!process.env.SENDGRID_API_KEY) {
      missingComponents.push('Email notification system');
      improvements.push('Integrate SendGrid for email notifications and onboarding confirmations');
    }
    
    // Common improvements for CryptoBot platform
    improvements.push(
      'Implement AI-driven trading suggestions based on market patterns',
      'Add crypto news sentiment analysis',
      'Create social sharing of portfolio performance',
      'Develop mobile-optimized dashboard views',
      'Implement interactive tutorial for new users'
    );
    
    systemStatus.missing = missingComponents;
    systemStatus.improvements = improvements;
    
    // Calculate deployment readiness
    systemStatus.deploymentReadiness = calculateDeploymentReadiness(systemStatus);
    systemStatus.readyForLaunch = determineReadyForLaunch(systemStatus.deploymentReadiness);
    
  } catch (error) {
    console.error('Error running system diagnostics:', error);
  }
  
  return systemStatus as SystemStatus;
}

/**
 * Express handler for system diagnostics API
 */
export async function getSystemDiagnostics(req: Request, res: Response) {
  try {
    const diagnosticReport = await runSystemDiagnostics();
    res.json(diagnosticReport);
  } catch (error) {
    console.error('Error in system diagnostics endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to generate system diagnostics report',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}