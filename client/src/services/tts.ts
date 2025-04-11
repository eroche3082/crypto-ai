/**
 * Text-to-Speech service using Google Cloud TTS and ElevenLabs
 */

// Types for TTS service responses
export interface TTSResult {
  audioContent: string;  // Base64 encoded audio
  provider: 'google' | 'elevenlabs';
  duration?: number;     // Duration in milliseconds
  format: string;        // Audio format (e.g., 'mp3', 'wav')
}

// Options for TTS conversion
export interface TTSOptions {
  text: string;
  language?: string;  // Language code (e.g., 'en-US', 'es-ES')
  voice?: string;     // Voice name/ID
  gender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
  provider?: 'google' | 'elevenlabs';
  speed?: number;     // Playback speed (0.25 to 4.0)
  pitch?: number;     // Voice pitch (-20.0 to 20.0)
}

// Default TTS options
const defaultOptions: Partial<TTSOptions> = {
  language: 'en-US',
  gender: 'NEUTRAL',
  provider: 'google',
  speed: 1.0,
  pitch: 0,
};

/**
 * Convert text to speech using Google TTS API
 */
export async function textToSpeech(options: TTSOptions): Promise<TTSResult> {
  // Use default options for missing values
  const opts = { ...defaultOptions, ...options };

  // Determine provider
  if (opts.provider === 'elevenlabs' && opts.text.length < 1000) {
    return elevenLabsTTS(opts);
  } else {
    return googleTTS(opts);
  }
}

/**
 * Convert text to speech using Google Cloud TTS
 */
async function googleTTS(options: TTSOptions): Promise<TTSResult> {
  try {
    const response = await fetch('/api/tts/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: options.text,
        languageCode: options.language,
        name: options.voice || getVoiceForLanguage(options.language || 'en-US', options.gender || 'NEUTRAL'),
        gender: options.gender,
        speakingRate: options.speed,
        pitch: options.pitch,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google TTS API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return {
      audioContent: data.audioContent,
      provider: 'google',
      format: 'mp3',
    };
  } catch (error) {
    console.error('Google TTS error:', error);
    throw error;
  }
}

/**
 * Convert text to speech using ElevenLabs API (for premium voices)
 */
async function elevenLabsTTS(options: TTSOptions): Promise<TTSResult> {
  try {
    const response = await fetch('/api/tts/elevenlabs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: options.text,
        voiceId: options.voice || 'pNInz6obpgDQGcFmaJgB', // Default ElevenLabs voice ID
        modelId: 'eleven_monolingual_v1',
        stability: 0.5,
        similarityBoost: 0.75,
        speed: options.speed || 1.0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return {
      audioContent: data.audioContent,
      provider: 'elevenlabs',
      format: 'mp3',
    };
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    throw error;
  }
}

/**
 * Play audio from TTS result
 */
export function playTTSAudio(ttsResult: TTSResult): HTMLAudioElement {
  // Create audio element
  const audio = new Audio(`data:audio/mp3;base64,${ttsResult.audioContent}`);
  
  // Set playback speed if specified
  if (ttsResult.duration) {
    audio.playbackRate = 1.0;
  }
  
  // Play audio
  audio.play().catch(err => {
    console.error('Error playing TTS audio:', err);
  });
  
  return audio;
}

/**
 * Stop playing TTS audio
 */
export function stopTTSAudio(audio: HTMLAudioElement): void {
  if (audio && !audio.paused) {
    audio.pause();
    audio.currentTime = 0;
  }
}

/**
 * Get appropriate voice for language and gender
 */
function getVoiceForLanguage(languageCode: string, gender: 'MALE' | 'FEMALE' | 'NEUTRAL'): string {
  const voices: Record<string, Record<string, string>> = {
    'en-US': {
      MALE: 'en-US-Neural2-D',
      FEMALE: 'en-US-Neural2-F',
      NEUTRAL: 'en-US-Neural2-A',
    },
    'es-ES': {
      MALE: 'es-ES-Neural2-B',
      FEMALE: 'es-ES-Neural2-A',
      NEUTRAL: 'es-ES-Neural2-A',
    },
    'fr-FR': {
      MALE: 'fr-FR-Neural2-B',
      FEMALE: 'fr-FR-Neural2-A',
      NEUTRAL: 'fr-FR-Neural2-A',
    },
    'de-DE': {
      MALE: 'de-DE-Neural2-B',
      FEMALE: 'de-DE-Neural2-A',
      NEUTRAL: 'de-DE-Neural2-A',
    },
    'it-IT': {
      MALE: 'it-IT-Neural2-C',
      FEMALE: 'it-IT-Neural2-A',
      NEUTRAL: 'it-IT-Neural2-A',
    },
    'ja-JP': {
      MALE: 'ja-JP-Neural2-C',
      FEMALE: 'ja-JP-Neural2-B',
      NEUTRAL: 'ja-JP-Neural2-A',
    },
    'ko-KR': {
      MALE: 'ko-KR-Neural2-C',
      FEMALE: 'ko-KR-Neural2-A',
      NEUTRAL: 'ko-KR-Neural2-A',
    },
    'pt-BR': {
      MALE: 'pt-BR-Neural2-B',
      FEMALE: 'pt-BR-Neural2-A',
      NEUTRAL: 'pt-BR-Neural2-A',
    },
    'zh': {
      MALE: 'cmn-CN-Neural2-B',
      FEMALE: 'cmn-CN-Neural2-A',
      NEUTRAL: 'cmn-CN-Neural2-A',
    },
  };

  // Default to English if the language is not supported
  const langVoices = voices[languageCode] || voices['en-US'];
  return langVoices[gender] || langVoices.NEUTRAL;
}