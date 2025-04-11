import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { VolumeIcon, Square } from 'lucide-react';
import { textToSpeech, TTSOptions, TTSResult, playTTSAudio, stopTTSAudio } from '@/services/tts';
import { useToast } from '@/hooks/use-toast';

interface SpeechButtonProps {
  text: string;
  language?: string;
  provider?: 'google' | 'elevenlabs';
  compact?: boolean;
  className?: string;
}

export function SpeechButton({ 
  text, 
  language = 'en-US', 
  provider = 'google',
  compact = false,
  className = ''
}: SpeechButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const handlePlay = async () => {
    try {
      if (isPlaying && audioRef.current) {
        stopTTSAudio(audioRef.current);
        audioRef.current = null;
        setIsPlaying(false);
        return;
      }

      if (!text.trim()) {
        toast({
          title: "No text to speak",
          description: "Please provide some text to synthesize speech.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      // Strip HTML tags and convert to plain text for speech
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = text;
      const plainText = tempDiv.textContent || tempDiv.innerText || text;
      
      // Configure options based on detected language
      const options: TTSOptions = {
        text: plainText.slice(0, provider === 'elevenlabs' ? 2000 : 5000), // Limit text length
        language,
        provider,
      };

      // Call text-to-speech service
      const result = await textToSpeech(options);
      
      // Play audio
      const audio = playTTSAudio(result);
      audioRef.current = audio;
      setIsPlaying(true);

      // Handle audio end
      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };

      // Handle audio errors
      audio.onerror = (e) => {
        console.error('Error playing audio:', e);
        setIsPlaying(false);
        audioRef.current = null;
        toast({
          title: "Playback Error",
          description: "There was a problem playing the audio.",
          variant: "destructive",
        });
      };
    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast({
        title: "Speech Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate speech. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePlay}
        disabled={isLoading}
        className={`p-2 h-8 w-8 rounded-full ${className}`}
        title={isPlaying ? "Stop speech" : "Play text as speech"}
      >
        {isPlaying ? (
          <Square className="h-4 w-4" />
        ) : (
          <VolumeIcon className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePlay}
      disabled={isLoading}
      className={`gap-2 ${className}`}
    >
      {isPlaying ? (
        <>
          <Square className="h-4 w-4" />
          <span>Stop</span>
        </>
      ) : (
        <>
          <VolumeIcon className="h-4 w-4" />
          <span>Listen</span>
        </>
      )}
    </Button>
  );
}