import { Request, Response } from 'express';
import { TranslationServiceClient } from '@google-cloud/translate';
import { v4 as uuidv4 } from 'uuid';

// Initialize the Translation client
let translationClient: TranslationServiceClient | null = null;

try {
  translationClient = new TranslationServiceClient({
    keyFilename: process.env.GOOGLE_TRANSLATION_KEY_PATH || './google-credentials-global.json',
  });
  console.log('Google Translation client initialized');
} catch (error) {
  console.error('Error initializing Google Translation client:', error);
}

// Define supported languages
const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'pt': 'Portuguese',
  'de': 'German',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ru': 'Russian',
  'ar': 'Arabic'
};

/**
 * Detect language from text
 */
export async function detectLanguage(req: Request, res: Response) {
  try {
    if (!translationClient) {
      return res.status(500).json({
        error: 'Translation API client not initialized',
        message: 'Google Translation API is not available'
      });
    }

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: 'No text provided',
        message: 'Please provide text for language detection'
      });
    }

    const projectId = process.env.GOOGLE_PROJECT_ID || "erudite-creek-431302-q3";
    const location = 'global';

    // Construct request
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      content: text,
      mimeType: 'text/plain', // mime types: text/plain, text/html
    };

    // Detect language
    const [response] = await translationClient.detectLanguage(request);

    const detections = response.languages || [];
    const detectedLanguages = detections.map(lang => ({
      languageCode: lang.languageCode,
      confidence: lang.confidence,
      name: SUPPORTED_LANGUAGES[lang.languageCode as keyof typeof SUPPORTED_LANGUAGES] || lang.languageCode
    }));

    // Return detected languages
    res.json({
      detectedLanguages,
      text: text.substring(0, 100) + (text.length > 100 ? '...' : '')
    });
  } catch (error) {
    console.error('Error detecting language:', error);
    res.status(500).json({
      error: 'Error detecting language',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Translate text between languages
 */
export async function translateText(req: Request, res: Response) {
  try {
    if (!translationClient) {
      return res.status(500).json({
        error: 'Translation API client not initialized',
        message: 'Google Translation API is not available'
      });
    }

    const { text, targetLanguage, sourceLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Please provide text and targetLanguage'
      });
    }

    const projectId = process.env.GOOGLE_PROJECT_ID || "erudite-creek-431302-q3";
    const location = 'global';

    // Construct request
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: [text],
      mimeType: 'text/plain',
      sourceLanguageCode: sourceLanguage || '',
      targetLanguageCode: targetLanguage,
    };

    // Run request
    const [response] = await translationClient.translateText(request);

    const translations = response.translations || [];
    const translatedText = translations.length > 0 ? translations[0].translatedText : '';
    const detectedLanguage = translations.length > 0 ? translations[0].detectedLanguageCode : '';

    // Return translation
    res.json({
      originalText: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      translatedText,
      sourceLanguage: sourceLanguage || detectedLanguage,
      targetLanguage,
      sourceLanguageName: SUPPORTED_LANGUAGES[sourceLanguage as keyof typeof SUPPORTED_LANGUAGES] || 
                          SUPPORTED_LANGUAGES[detectedLanguage as keyof typeof SUPPORTED_LANGUAGES] || 
                          sourceLanguage || detectedLanguage,
      targetLanguageName: SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES] || targetLanguage
    });
  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({
      error: 'Error translating text',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Get supported languages
 */
export async function getSupportedLanguages(req: Request, res: Response) {
  try {
    res.json({
      supportedLanguages: SUPPORTED_LANGUAGES
    });
  } catch (error) {
    console.error('Error getting supported languages:', error);
    res.status(500).json({
      error: 'Error getting supported languages',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Auto-detect browser language and return appropriate UI translations
 */
export async function getUiTranslations(req: Request, res: Response) {
  try {
    const { language = 'en' } = req.query;
    
    // Implement your UI translations logic here
    // For now, we'll return a sample translation for demonstration
    const translations = {
      en: {
        dashboard: 'Dashboard',
        portfolio: 'Portfolio',
        alerts: 'Alerts',
        settings: 'Settings',
        news: 'News',
        chat: 'Chat',
        login: 'Login',
        logout: 'Logout',
        // Add more translations as needed
      },
      es: {
        dashboard: 'Panel',
        portfolio: 'Portafolio',
        alerts: 'Alertas',
        settings: 'Configuración',
        news: 'Noticias',
        chat: 'Chat',
        login: 'Iniciar Sesión',
        logout: 'Cerrar Sesión',
        // Add more translations as needed
      },
      fr: {
        dashboard: 'Tableau de Bord',
        portfolio: 'Portefeuille',
        alerts: 'Alertes',
        settings: 'Paramètres',
        news: 'Actualités',
        chat: 'Discussion',
        login: 'Connexion',
        logout: 'Déconnexion',
        // Add more translations as needed
      },
      // Add more languages as needed
    };
    
    // Return translations for the requested language, or English as fallback
    res.json({
      language: language,
      translations: translations[language as keyof typeof translations] || translations.en
    });
  } catch (error) {
    console.error('Error getting UI translations:', error);
    res.status(500).json({
      error: 'Error getting UI translations',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}