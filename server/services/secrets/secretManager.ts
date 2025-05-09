import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// Initialize the Secret Manager client - This is now unused.
let secretManagerClient: SecretManagerServiceClient | null = null;

try {
  secretManagerClient = new SecretManagerServiceClient({
    keyFilename: process.env.GOOGLE_SECRET_MANAGER_KEY_PATH || './google-credentials-global.json',
  });
  console.log('Google Secret Manager client initialized');
} catch (error) {
  console.error('Error initializing Secret Manager client:', error);
}

/**
 * Access a secret from Secret Manager
 * @param secretName The name of the secret
 * @returns The secret payload as a string
 */
export async function getSecret(secretName: string): Promise<string> {
  const secret = process.env[secretName];
  if (!secret) {
    console.warn(`Secret ${secretName} not found in environment`);
    return '';
  }
  return secret;
}

/**
 * Retrieve multiple secrets as a key-value object
 * @param secretNames Array of secret names to retrieve
 * @returns Object mapping secret names to their values
 */
export async function getSecrets(secretNames: string[]): Promise<Record<string, string>> {
  const secrets: Record<string, string> = {};

  // Get each secret in parallel
  const secretPromises = secretNames.map(async (name) => {
    try {
      const value = await getSecret(name);
      secrets[name] = value;
    } catch (error) {
      console.error(`Error retrieving secret ${name}:`, error);
      secrets[name] = ''; // Set empty string for failed secrets
    }
  });

  await Promise.all(secretPromises);
  return secrets;
}

/**
 * Initialize application secrets from Secret Manager
 * Retrieves essential API keys and stores them in environment variables
 */
export async function initializeAppSecrets(): Promise<boolean> {
  try {
    // Critical API keys needed for core functionality
    const criticalSecrets = [
      'GEMINI_API_KEY',
      'GOOGLE_PROJECT_ID',
      'COINGECKO_API_KEY'
    ];

    // Optional API keys for extended functionality
    const optionalSecrets = [
      'OPENAI_API_KEY',
      'GOOGLE_MAPS_API_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_PUBLISHABLE_KEY',
      'TWITTER_API_KEY',
      'TWITTER_API_SECRET',
      'ELEVENLABS_API_KEY'
    ];

    console.log('Initializing application secrets from environment variables...');

    // Verify critical secrets first
    const missingCritical = criticalSecrets.filter(name => !process.env[name]);
    if (missingCritical.length > 0) {
      console.error('Missing critical secrets:', missingCritical);
      return false;
    }

    // Load all secrets
    const allSecrets = [...criticalSecrets, ...optionalSecrets];
    const secrets: Record<string, string> = {};
    
    for (const name of allSecrets) {
      const value = process.env[name] || '';
      secrets[name] = value;

      // For client-side variables, also set the VITE_ prefixed version
      if (['STRIPE_PUBLISHABLE_KEY', 'GEMINI_API_KEY', 'GOOGLE_MAPS_API_KEY', 'COINGECKO_API_KEY'].includes(name)) {
        process.env[`VITE_${name}`] = value;
      }
    }

    const loadedCount = Object.values(secrets).filter(Boolean).length;
    console.log(`Successfully loaded ${loadedCount}/${allSecrets.length} secrets`);
    console.log('Critical secrets verified and loaded successfully');
    return true;
  } catch (error) {
    console.error('Error initializing app secrets:', error);
    return false;
  }
}

/**
 * Rotates a secret in Secret Manager if it needs to be updated - This function is now unused
 * This is a complex operation that requires specific permissions
 * @param secretName Name of the secret to rotate
 * @param newValue New value for the secret
 */
export async function rotateSecret(secretName: string, newValue: string): Promise<boolean> {
  if (!secretManagerClient) {
    console.error('Secret Manager client not initialized');
    throw new Error('Secret Manager is not available');
  }

  try {
    const projectId = process.env.GOOGLE_PROJECT_ID || "erudite-creek-431302-q3";
    const parent = `projects/${projectId}`;

    // Check if secret exists
    const secretPath = `${parent}/secrets/${secretName}`;

    try {
      // Try to get the secret to see if it exists
      await secretManagerClient.getSecret({ name: secretPath });
    } catch (error) {
      // Secret doesn't exist, create it
      console.log(`Secret ${secretName} doesn't exist, creating it...`);
      await secretManagerClient.createSecret({
        parent,
        secretId: secretName,
        secret: {
          replication: {
            automatic: {}
          }
        }
      });
    }

    // Add new secret version
    const [version] = await secretManagerClient.addSecretVersion({
      parent: secretPath,
      payload: {
        data: Buffer.from(newValue)
      }
    });

    console.log(`Successfully rotated secret ${secretName} to version ${version.name}`);
    return true;
  } catch (error) {
    console.error(`Error rotating secret ${secretName}:`, error);
    throw error;
  }
}