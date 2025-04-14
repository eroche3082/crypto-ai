/**
 * Google Cloud API Key Manager Service
 * 
 * This service dynamically manages and assigns Google Cloud API keys based on
 * the services needed by different parts of the application. It supports fallback
 * mechanisms and service initialization tracking.
 */
import { config } from 'dotenv';

// Load environment variables
config();

// Define types for API services and group tracking
export type GoogleServiceType = 
  | 'vertex-ai'
  | 'gemini'
  | 'vision'
  | 'language'
  | 'translate'
  | 'speech'
  | 'text-to-speech'
  | 'maps'
  | 'places'
  | 'youtube'
  | 'firebase'
  | 'firestore'
  | 'storage'
  | 'secret-manager';

// API key group interface
interface ApiKeyGroup {
  id: string;
  key: string | null;
  services: GoogleServiceType[];
  isAvailable: boolean;
}

// State for tracking service initialization
interface ServiceInitializationState {
  service: GoogleServiceType;
  groupId: string;
  isInitialized: boolean;
  timestamp: string;
  error?: string;
}

// Initialize the key groups from environment variables
const apiKeyGroups: ApiKeyGroup[] = [
  {
    id: 'GROUP1',
    key: process.env.GOOGLE_GROUP1_API_KEY || null,
    services: [
      'vertex-ai', 
      'gemini', 
      'vision', 
      'language', 
      'translate', 
      'speech', 
      'text-to-speech', 
      'maps', 
      'places', 
      'firebase', 
      'storage'
    ],
    isAvailable: !!process.env.GOOGLE_GROUP1_API_KEY
  },
  {
    id: 'GROUP2',
    key: process.env.GOOGLE_GROUP2_API_KEY || null,
    services: ['vertex-ai', 'gemini', 'vision', 'youtube', 'translate', 'language'],
    isAvailable: !!process.env.GOOGLE_GROUP2_API_KEY
  },
  {
    id: 'GROUP3',
    key: process.env.GOOGLE_GROUP3_API_KEY || null,
    services: ['firebase', 'maps', 'places', 'youtube', 'storage', 'translate'],
    isAvailable: !!process.env.GOOGLE_GROUP3_API_KEY
  },
  {
    id: 'GROUP4',
    key: process.env.GOOGLE_GROUP4_API_KEY || null,
    services: ['firebase', 'firestore', 'storage', 'secret-manager'],
    isAvailable: !!process.env.GOOGLE_GROUP4_API_KEY
  },
  {
    id: 'GROUP5',
    key: process.env.GOOGLE_API_KEY || null,
    services: [
      'vertex-ai', 
      'gemini', 
      'vision', 
      'language', 
      'translate', 
      'speech', 
      'text-to-speech',
      'maps',
      'places',
      'youtube',
      'firebase',
      'firestore',
      'storage',
      'secret-manager'
    ],
    isAvailable: !!process.env.GOOGLE_API_KEY && process.env.API_GROUP === 'GROUP5'
  }
];

// Store initialization state
const serviceInitializations: ServiceInitializationState[] = [];

/**
 * Selects the most appropriate API key group for a given service
 */
export function selectApiKeyGroupForService(service: GoogleServiceType): ApiKeyGroup | null {
  // Check if service is already initialized
  const existingInit = serviceInitializations.find(
    init => init.service === service && init.isInitialized
  );
  
  if (existingInit) {
    // Return the group that's already successfully being used for this service
    const group = apiKeyGroups.find(g => g.id === existingInit.groupId);
    if (group && group.isAvailable) {
      return group;
    }
  }
  
  // Find primary groups that support this service
  const candidateGroups = apiKeyGroups
    .filter(group => group.isAvailable && group.services.includes(service))
    .sort((a, b) => {
      // Prioritize GROUP5 for all services if available
      if (a.id === 'GROUP5') return -1;
      if (b.id === 'GROUP5') return 1;
      
      // Prioritize GROUP1 for AI services
      if (['vertex-ai', 'gemini', 'vision', 'language'].includes(service)) {
        if (a.id === 'GROUP1') return -1;
        if (b.id === 'GROUP1') return 1;
      }
      
      // Default priority: GROUP2 > GROUP3 > GROUP4 > GROUP1
      const defaultOrder = { 'GROUP2': 1, 'GROUP3': 2, 'GROUP4': 3, 'GROUP1': 4 };
      return defaultOrder[a.id as keyof typeof defaultOrder] - defaultOrder[b.id as keyof typeof defaultOrder];
    });
  
  // Return the best candidate if found
  if (candidateGroups.length > 0) {
    return candidateGroups[0];
  }
  
  // If no group was found with this service, try fallback order
  const fallbackOrder = ['GROUP5', 'GROUP2', 'GROUP3', 'GROUP4', 'GROUP1'];
  for (const groupId of fallbackOrder) {
    const group = apiKeyGroups.find(g => g.id === groupId && g.isAvailable);
    if (group) {
      console.warn(`No optimal API key group found for ${service}, falling back to ${groupId}`);
      return group;
    }
  }
  
  // No viable group found
  console.error(`No API key group available for service: ${service}`);
  return null;
}

/**
 * Gets the API key for a specific service
 */
export function getApiKeyForService(service: GoogleServiceType): string | null {
  const group = selectApiKeyGroupForService(service);
  
  if (!group || !group.key) {
    console.error(`No API key available for service: ${service}`);
    return null;
  }
  
  return group.key;
}

/**
 * Tracks the initialization of a service with a specific API key group
 */
export function trackServiceInitialization(
  service: GoogleServiceType, 
  groupId: string, 
  success: boolean,
  error?: string
): void {
  const timestamp = new Date().toISOString();
  
  // Update existing entry if found
  const existingIndex = serviceInitializations.findIndex(
    init => init.service === service
  );
  
  if (existingIndex >= 0) {
    serviceInitializations[existingIndex] = {
      service,
      groupId,
      isInitialized: success,
      timestamp,
      error
    };
  } else {
    // Add new entry
    serviceInitializations.push({
      service,
      groupId,
      isInitialized: success,
      timestamp,
      error
    });
  }
  
  // Log the result
  if (success) {
    console.log(`[CryptoBot] using ${groupId} for ${service} → ✅ Success`);
  } else {
    console.error(`[CryptoBot] using ${groupId} for ${service} → ❌ Error: ${error}`);
  }
}

/**
 * Provides a report of service initializations
 */
export function getServiceInitializationReport(): ServiceInitializationState[] {
  return [...serviceInitializations];
}

/**
 * Gets a summary of initialized services and their API key groups
 */
export function getServiceInitializationSummary(): Record<string, any> {
  const successfulInits = serviceInitializations.filter(init => init.isInitialized);
  const failedInits = serviceInitializations.filter(init => !init.isInitialized);
  
  // Group by API key group
  const byGroup: Record<string, string[]> = {};
  
  for (const init of successfulInits) {
    if (!byGroup[init.groupId]) {
      byGroup[init.groupId] = [];
    }
    byGroup[init.groupId].push(init.service);
  }
  
  return {
    timestamp: new Date().toISOString(),
    totalServicesInitialized: successfulInits.length,
    totalServicesFailed: failedInits.length,
    servicesByGroup: byGroup,
    failedServices: failedInits.map(f => ({
      service: f.service,
      attemptedGroup: f.groupId,
      error: f.error
    }))
  };
}

// Export as singleton
export default {
  getApiKeyForService,
  selectApiKeyGroupForService,
  trackServiceInitialization,
  getServiceInitializationReport,
  getServiceInitializationSummary
};