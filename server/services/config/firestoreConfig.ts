import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Default configuration to use as fallback if Firestore is unavailable
export const DEFAULT_CONFIG = {
  cryptobot: {
    primary_color: "#6366f1",
    font_family: "Inter",
    layout: "dark",
    button_shape: "rounded",
    homepage_title: "Welcome to CryptoBot",
    homepage_subtitle: "Your intelligent crypto advisor",
    cta_text: "Start Now",
    header_menu: ["Home", "Features", "Pricing", "Assistant"],
    visible_sections: {
      chat: true,
      features: true,
      pricing: true,
      news: true,
      portfolio: true
    }
  },
  jetai: {
    primary_color: "#3b82f6",
    font_family: "Inter",
    layout: "dark",
    button_shape: "rounded",
    homepage_title: "Welcome to JetAI",
    homepage_subtitle: "Your AI-powered travel assistant",
    cta_text: "Start Now",
    header_menu: ["Home", "Features", "Pricing", "Assistant"],
    visible_sections: {
      chat: true,
      features: true,
      pricing: true
    }
  },
  fitnessai: {
    primary_color: "#10b981",
    font_family: "Inter",
    layout: "dark",
    button_shape: "rounded",
    homepage_title: "Welcome to FitnessAI",
    homepage_subtitle: "Your AI fitness coach",
    cta_text: "Start Now",
    header_menu: ["Home", "Features", "Pricing", "Assistant"],
    visible_sections: {
      chat: true,
      features: true,
      pricing: true
    }
  },
  sportsai: {
    primary_color: "#ef4444",
    font_family: "Inter",
    layout: "dark",
    button_shape: "rounded",
    homepage_title: "Welcome to SportsAI",
    homepage_subtitle: "Your AI sports analytics assistant",
    cta_text: "Start Now",
    header_menu: ["Home", "Features", "Pricing", "Assistant"],
    visible_sections: {
      chat: true,
      features: true,
      pricing: true
    }
  }
};

// Type definitions for UI configuration
export interface VisibleSections {
  chat: boolean;
  features: boolean;
  pricing: boolean;
  news?: boolean;
  portfolio?: boolean;
  [key: string]: boolean | undefined;
}

export interface UIConfig {
  primary_color: string;
  font_family: string;
  layout: "dark" | "light";
  button_shape: "rounded" | "square" | "pill";
  homepage_title: string;
  homepage_subtitle: string;
  cta_text: string;
  header_menu: string[];
  visible_sections: VisibleSections;
  logo_url?: string;
  background_image_url?: string;
  header_image_url?: string;
}

// Initialize Firebase Admin if not already initialized
const initializeFirebase = () => {
  try {
    if (getApps().length === 0) {
      // Check if we have Google credentials as a file
      let serviceAccount;
      const credentialsPath = path.resolve('./google-credentials-global.json');
      
      if (fs.existsSync(credentialsPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Use environment variable if it exists
        serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      }
      
      if (serviceAccount) {
        initializeApp({
          credential: cert(serviceAccount)
        });
        console.log('Firebase Admin initialized successfully');
      } else {
        console.warn('No Firebase credentials found. Using default configuration.');
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    return false;
  }
};

// Get configuration for a specific agent
export const getAgentConfig = async (agentName: keyof typeof DEFAULT_CONFIG): Promise<UIConfig> => {
  // Initialize Firebase Admin
  const isFirebaseInitialized = initializeFirebase();
  
  if (!isFirebaseInitialized) {
    console.warn(`Firebase not initialized. Using default config for ${agentName}`);
    return DEFAULT_CONFIG[agentName] as UIConfig;
  }
  
  try {
    const db = getFirestore();
    const configDoc = await db.collection('config').doc(agentName).get();
    
    if (configDoc.exists) {
      const data = configDoc.data() as UIConfig;
      console.log(`Loaded configuration for ${agentName} from Firestore`);
      return data;
    } else {
      console.log(`No configuration found for ${agentName}. Creating default config.`);
      // Initialize with default configuration
      await db.collection('config').doc(agentName).set(DEFAULT_CONFIG[agentName]);
      return DEFAULT_CONFIG[agentName] as UIConfig;
    }
  } catch (error) {
    console.error(`Error fetching config for ${agentName}:`, error);
    return DEFAULT_CONFIG[agentName] as UIConfig;
  }
};

// Update configuration for a specific agent
export const updateAgentConfig = async (
  agentName: keyof typeof DEFAULT_CONFIG, 
  config: Partial<UIConfig>
): Promise<boolean> => {
  // Initialize Firebase Admin
  const isFirebaseInitialized = initializeFirebase();
  
  if (!isFirebaseInitialized) {
    console.warn(`Firebase not initialized. Cannot update config for ${agentName}`);
    return false;
  }
  
  try {
    const db = getFirestore();
    await db.collection('config').doc(agentName).set(config, { merge: true });
    console.log(`Updated configuration for ${agentName} in Firestore`);
    return true;
  } catch (error) {
    console.error(`Error updating config for ${agentName}:`, error);
    return false;
  }
};

// Get global design system configuration
export const getGlobalDesignSystem = async () => {
  // Initialize Firebase Admin
  const isFirebaseInitialized = initializeFirebase();
  
  if (!isFirebaseInitialized) {
    console.warn('Firebase not initialized. Cannot fetch global design system.');
    return null;
  }
  
  try {
    const db = getFirestore();
    const designDoc = await db.collection('design-system').doc('global').get();
    
    if (designDoc.exists) {
      return designDoc.data();
    } else {
      // Create default global design system
      const defaultDesignSystem = {
        border_radius: "16px",
        font_scale: 1.1,
        theme_variants: ["dark", "light"],
        default_language: "en"
      };
      
      await db.collection('design-system').doc('global').set(defaultDesignSystem);
      return defaultDesignSystem;
    }
  } catch (error) {
    console.error('Error fetching global design system:', error);
    return null;
  }
};