import axios from 'axios';

/**
 * Servicio para interactuar con los avatares de video AI
 * Utiliza las APIs de OpenAI, Heygen y ElevenLabs para generar avatares de video con respuestas de IA
 */
export class AvatarService {
  private apiKeyChatGpt: string;
  private chatGptModel: string;
  private maxTokens: number;
  private apiKeyHeygen: string;
  private apiKeyHeygenStream: string;
  private videoUrlAvatar: string;
  private apiKeyElevenLabs: string;
  private elevenLabsModel: string;
  private audioUrlAvatar: string;

  constructor() {
    // Inicializar con valores desde variables de entorno
    this.apiKeyChatGpt = process.env.OPENAI_API_KEY || '';
    this.chatGptModel = 'gpt-4o'; // El modelo más reciente de OpenAI
    this.maxTokens = 1000;
    this.apiKeyHeygen = process.env.HEYGEN_API_KEY || '';
    this.apiKeyHeygenStream = process.env.HEYGEN_STREAM_API_KEY || '';
    this.videoUrlAvatar = 'https://api.heygen.com/';
    this.apiKeyElevenLabs = process.env.ELEVENLABS_API_KEY || '';
    this.elevenLabsModel = 'eleven_turbo_v2_5';
    this.audioUrlAvatar = 'https://api.elevenlabs.io/';
  }

  /**
   * Obtiene una respuesta de ChatGPT para una pregunta dada
   * @param prompt La pregunta o instrucción para ChatGPT
   * @returns La respuesta de texto generada
   */
  async getChatGptResponse(prompt: string): Promise<string> {
    try {
      if (!this.apiKeyChatGpt) {
        throw new Error('OpenAI API key not configured');
      }

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.chatGptModel,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful financial and cryptocurrency expert assistant.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.maxTokens
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKeyChatGpt}`
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error getting ChatGPT response:', error);
      throw new Error('Failed to get AI response');
    }
  }

  /**
   * Genera un audio con ElevenLabs a partir de un texto
   * @param text El texto a convertir en audio
   * @param voiceId El ID de la voz a utilizar
   * @returns URL al archivo de audio generado
   */
  async generateAudio(text: string, voiceId: string): Promise<string> {
    try {
      if (!this.apiKeyElevenLabs) {
        throw new Error('ElevenLabs API key not configured');
      }

      const response = await axios.post(
        `${this.audioUrlAvatar}v1/text-to-speech/${voiceId}`,
        {
          text,
          model_id: this.elevenLabsModel,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKeyElevenLabs
          },
          responseType: 'arraybuffer'
        }
      );

      // En un entorno real, guardaríamos este archivo y devolveríamos la URL
      // Para simplificar, devolveríamos un base64 o similar
      return 'audio-url-placeholder';
    } catch (error) {
      console.error('Error generating audio with ElevenLabs:', error);
      throw new Error('Failed to generate audio');
    }
  }

  /**
   * Genera un video con Heygen utilizando un avatar y audio
   * @param avatarId El ID del avatar a utilizar
   * @param audioUrl La URL del audio a sincronizar con el avatar
   * @returns URL al video generado
   */
  async generateVideo(avatarId: string, audioUrl: string): Promise<string> {
    try {
      if (!this.apiKeyHeygen) {
        throw new Error('Heygen API key not configured');
      }

      const response = await axios.post(
        `${this.videoUrlAvatar}v1/video.generate`,
        {
          avatar: {
            avatar_id: avatarId
          },
          audio: {
            audio_url: audioUrl
          },
          config: {
            ratio: "16:9",
            resolution: "720p"
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': this.apiKeyHeygen
          }
        }
      );

      // La respuesta de Heygen incluiría información sobre el video generado
      return response.data.data.video_url || 'video-url-placeholder';
    } catch (error) {
      console.error('Error generating video with Heygen:', error);
      throw new Error('Failed to generate avatar video');
    }
  }

  /**
   * Proceso completo para generar un video de avatar que responde a una pregunta
   * @param prompt La pregunta del usuario
   * @param avatarId El ID del avatar a utilizar
   * @param voiceId El ID de la voz a utilizar
   * @returns URL al video generado
   */
  async generateAvatarResponse(prompt: string, avatarId: string, voiceId: string): Promise<string> {
    try {
      // 1. Obtener respuesta de ChatGPT
      const aiResponse = await this.getChatGptResponse(prompt);
      
      // 2. Generar audio con ElevenLabs
      const audioUrl = await this.generateAudio(aiResponse, voiceId);
      
      // 3. Generar video con Heygen
      const videoUrl = await this.generateVideo(avatarId, audioUrl);
      
      return videoUrl;
    } catch (error) {
      console.error('Error generating avatar response:', error);
      throw new Error('Failed to generate full avatar response');
    }
  }

  /**
   * Obtiene la lista de avatares disponibles
   * Esto normalmente se haría con una llamada a la API de Heygen
   * @returns Lista de avatares disponibles
   */
  async getAvailableAvatars(): Promise<any[]> {
    try {
      if (!this.apiKeyHeygen) {
        // Si no hay API key, devolvemos una lista de ejemplo
        return [
          { id: 'avatar1', name: 'John - Financial Advisor', thumbnail: '/avatars/thumbnails/john.jpg' },
          { id: 'avatar2', name: 'Lisa - Crypto Expert', thumbnail: '/avatars/thumbnails/lisa.jpg' },
          { id: 'avatar3', name: 'Michael - Technical Analyst', thumbnail: '/avatars/thumbnails/michael.jpg' }
        ];
      }

      // Hacer una llamada real a la API de Heygen para obtener avatares
      const response = await axios.get(
        `${this.videoUrlAvatar}v1/avatar.list`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': this.apiKeyHeygen
          }
        }
      );

      return response.data.data.avatars || [];
    } catch (error) {
      console.error('Error getting available avatars:', error);
      // Devolvemos avatares de respaldo en caso de error
      return [
        { id: 'avatar1', name: 'John - Financial Advisor', thumbnail: '/avatars/thumbnails/john.jpg' },
        { id: 'avatar2', name: 'Lisa - Crypto Expert', thumbnail: '/avatars/thumbnails/lisa.jpg' }
      ];
    }
  }

  /**
   * Verifica si todas las APIs necesarias están configuradas
   * @returns Objeto con el estado de configuración de cada API
   */
  checkApisConfiguration(): { [key: string]: boolean } {
    return {
      openai: !!this.apiKeyChatGpt,
      heygen: !!this.apiKeyHeygen,
      elevenlabs: !!this.apiKeyElevenLabs
    };
  }
}

// Exportar una instancia del servicio
export const avatarService = new AvatarService();