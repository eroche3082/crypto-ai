/**
 * Environment Setup Service
 * 
 * This service handles environment variable initialization and organization,
 * making sure necessary variables are available for other services.
 */
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
config();

// Load Google API specific environment variables
config({ path: path.resolve('./.env.google') });

/**
 * Initialize API key groups from environment variables
 * 
 * This ensures backward compatibility with existing environment variables
 * while supporting the new group-based approach.
 */
export function initializeAPIKeyGroups(): void {
  // Define the API key mapping for backward compatibility
  const apiKeyMapping = {
    'VERTEX_AI_API_KEY': 'GOOGLE_GROUP1_API_KEY',
    'GOOGLE_API_KEY': 'GOOGLE_GROUP1_API_KEY',
    'GOOGLE_VERTEX_KEY_ID': 'GOOGLE_GROUP1_API_KEY',
    'GEMINI_API_KEY': 'GOOGLE_GROUP2_API_KEY',
  };
  
  // Check if group variables are already set
  if (!process.env.GOOGLE_GROUP1_API_KEY) {
    // Group 1 not set, try to find alternatives
    for (const [sourceKey, targetKey] of Object.entries(apiKeyMapping)) {
      if (process.env[sourceKey] && !process.env[targetKey]) {
        console.log(`Using ${sourceKey} as ${targetKey}`);
        process.env[targetKey] = process.env[sourceKey];
        break; // Only use the first available key
      }
    }
  }
  
  // Log the available groups
  console.log('API Key Groups Available:');
  console.log(`- GROUP1: ${process.env.GOOGLE_GROUP1_API_KEY ? 'Yes' : 'No'}`);
  console.log(`- GROUP2: ${process.env.GOOGLE_GROUP2_API_KEY ? 'Yes' : 'No'}`);
  console.log(`- GROUP3: ${process.env.GOOGLE_GROUP3_API_KEY ? 'Yes' : 'No'}`);
  console.log(`- GROUP4: ${process.env.GOOGLE_GROUP4_API_KEY ? 'Yes' : 'No'}`);
}

// Initialize the environment
initializeAPIKeyGroups();

export default {
  initializeAPIKeyGroups
};