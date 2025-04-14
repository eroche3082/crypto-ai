import { processSecret } from '../secrets';

interface VisionAnnotation {
  fullTextAnnotation?: {
    text: string;
  };
  labelAnnotations?: Array<{
    description: string;
    score: number;
  }>;
  safeSearchAnnotation?: {
    adult: string;
    violence: string;
  };
}

/**
 * Clase para interactuar con la API de Google Vision para análisis de imágenes
 */
export class GoogleVision {
  private apiKey: string;
  
  constructor() {
    try {
      this.apiKey = processSecret('GOOGLE_API_KEY', process.env.GOOGLE_API_KEY || '');
    } catch (error) {
      console.warn('Google Vision API key not configured properly:', error);
      this.apiKey = '';
    }
  }
  
  /**
   * Analiza una imagen usando Google Vision API
   * @param imageBase64 La imagen a analizar en formato base64
   * @returns Los resultados del análisis de la imagen
   */
  async analyzeImage(imageBase64: string): Promise<VisionAnnotation> {
    try {
      // Si no tenemos una clave API configurada, devolvemos un objeto vacío
      if (!this.apiKey) {
        console.warn('No Google Vision API key available');
        return {};
      }
      
      // URL del API endpoint de Google Vision
      const apiEndpoint = `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`;
      
      // Datos para la solicitud
      const requestData = {
        requests: [
          {
            image: {
              content: imageBase64
            },
            features: [
              { type: 'TEXT_DETECTION' },
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'SAFE_SEARCH_DETECTION' }
            ]
          }
        ]
      };
      
      // Realizar la solicitud a Google Vision
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Google Vision API error: ${JSON.stringify(errorData)}`);
      }
      
      const result = await response.json();
      
      // Extraer las anotaciones relevantes
      if (result && result.responses && result.responses.length > 0) {
        return {
          fullTextAnnotation: result.responses[0].fullTextAnnotation,
          labelAnnotations: result.responses[0].labelAnnotations,
          safeSearchAnnotation: result.responses[0].safeSearchAnnotation
        };
      }
      
      return {};
    } catch (error) {
      console.error('Error analyzing image with Google Vision:', error);
      return {};
    }
  }
}