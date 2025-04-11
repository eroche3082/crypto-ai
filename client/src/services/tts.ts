/**
 * Text-to-Speech Service
 * Provides functionality to convert text to speech using different providers
 */

export interface TTSResult {
  audioContent: string;  // Base64 encoded audio
  provider: 'google' | 'elevenlabs';
  duration?: number;     // Duration in milliseconds
  format: string;        // Audio format (e.g., 'mp3', 'wav')
}

export interface TTSOptions {
  text: string;
  language?: string;     // Language code (e.g., 'en-US', 'es-ES')
  voice?: string;        // Voice name/ID
  gender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
  provider?: 'google' | 'elevenlabs';
  speed?: number;        // Playback speed (0.25 to 4.0)
  pitch?: number;        // Voice pitch (-20.0 to 20.0)
}

/**
 * Convert text to speech using available TTS providers
 */
export async function textToSpeech(options: TTSOptions): Promise<TTSResult> {
  const { provider = 'google' } = options;
  
  try {
    if (provider === 'google') {
      return await googleTTS(options);
    } else if (provider === 'elevenlabs') {
      return await elevenLabsTTS(options);
    } else {
      throw new Error(`Unknown TTS provider: ${provider}`);
    }
  } catch (error) {
    console.error('TTS error:', error);
    throw error;
  }
}

/**
 * Convert text to speech using Google Cloud TTS
 */
async function googleTTS(options: TTSOptions): Promise<TTSResult> {
  const {
    text,
    language = 'en-US',
    voice,
    gender = 'NEUTRAL',
    speed = 1.0,
    pitch = 0
  } = options;

  // Dynamically select voice based on language if not provided
  const voiceName = voice || getVoiceForLanguage(language, gender);

  try {
    const response = await fetch('/api/tts/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        languageCode: language,
        name: voiceName,
        gender,
        speakingRate: speed,
        pitch,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Google TTS API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Google TTS error:', error);
    throw new Error(`Failed to generate speech with Google TTS: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Convert text to speech using ElevenLabs API
 */
async function elevenLabsTTS(options: TTSOptions): Promise<TTSResult> {
  const {
    text,
    voice = 'pNInz6obpgDQGcFmaJgB', // Default voice ID
    speed = 1.0,
  } = options;

  try {
    const response = await fetch('/api/tts/elevenlabs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voiceId: voice,
        speed,
        stability: 0.5,
        similarityBoost: 0.75,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `ElevenLabs API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    throw new Error(`Failed to generate speech with ElevenLabs: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Play audio from TTS result
 */
export function playTTSAudio(ttsResult: TTSResult): HTMLAudioElement {
  const { audioContent, format } = ttsResult;
  
  // Create audio element
  const audio = new Audio(`data:audio/${format};base64,${audioContent}`);
  
  // Play audio
  audio.play().catch(error => {
    console.error('Error playing audio:', error);
    throw error;
  });
  
  return audio;
}

/**
 * Stop playing TTS audio
 */
export function stopTTSAudio(audio: HTMLAudioElement): void {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

/**
 * Get appropriate voice for language and gender
 */
function getVoiceForLanguage(languageCode: string, gender: 'MALE' | 'FEMALE' | 'NEUTRAL'): string {
  // Default voice mapping by language and gender
  const voiceMap: Record<string, Record<string, string>> = {
    'en-US': {
      'MALE': 'en-US-Neural2-D',
      'FEMALE': 'en-US-Neural2-F',
      'NEUTRAL': 'en-US-Neural2-A'
    },
    'es-ES': {
      'MALE': 'es-ES-Neural2-B',
      'FEMALE': 'es-ES-Neural2-A',
      'NEUTRAL': 'es-ES-Neural2-C'
    },
    'fr-FR': {
      'MALE': 'fr-FR-Neural2-B',
      'FEMALE': 'fr-FR-Neural2-A',
      'NEUTRAL': 'fr-FR-Neural2-C'
    },
    'pt-BR': {
      'MALE': 'pt-BR-Neural2-B',
      'FEMALE': 'pt-BR-Neural2-A',
      'NEUTRAL': 'pt-BR-Neural2-C'
    }
  };

  // If we have a mapping for this language and gender, use it
  if (voiceMap[languageCode]?.[gender]) {
    return voiceMap[languageCode][gender];
  }

  // Fallback to English neutral voice
  return 'en-US-Neural2-A';
}