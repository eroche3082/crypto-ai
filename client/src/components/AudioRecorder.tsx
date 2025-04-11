import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, X, Square, Send, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AudioRecorderProps {
  onAudioCaptured: (audioBlob: Blob) => void;
  onCancel: () => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioCaptured, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Start recording
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Create audio blob from chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      let seconds = 0;
      timerRef.current = window.setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
        
        // Auto-stop after 30 seconds
        if (seconds >= 30) {
          stopRecording();
          toast({
            title: "Recording stopped",
            description: "Maximum recording length reached (30 seconds)",
          });
        }
      }, 1000);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Please check permissions and try again.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Reset recording
  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingTime(0);
    setError(null);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle sending the audio
  const handleSend = () => {
    if (audioUrl) {
      fetch(audioUrl)
        .then(response => response.blob())
        .then(blob => {
          onAudioCaptured(blob);
        })
        .catch(err => {
          console.error('Error sending audio:', err);
          toast({
            title: "Error",
            description: "Could not process audio. Please try again.",
            variant: "destructive",
          });
        });
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Mic className="w-5 h-5 mr-2" />
          <h2 className="text-lg font-semibold">Voice Input</h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {error ? (
          <div className="text-center p-4">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => setError(null)}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-8">
              <div 
                className={`w-24 h-24 rounded-full flex items-center justify-center
                  ${isRecording 
                    ? 'bg-red-500 animate-pulse' 
                    : audioUrl 
                      ? 'bg-green-500' 
                      : 'bg-primary'
                  }`}
              >
                <Mic className="w-12 h-12 text-white" />
              </div>
            </div>
            
            {/* Recording time or audio player */}
            {isRecording ? (
              <div className="text-2xl font-bold mb-8 text-red-500">
                {formatTime(recordingTime)}
              </div>
            ) : audioUrl ? (
              <div className="mb-8 w-full max-w-md">
                <audio 
                  ref={audioRef}
                  src={audioUrl} 
                  controls 
                  className="w-full"
                />
              </div>
            ) : (
              <p className="text-lg mb-8 text-center max-w-md">
                Tap the microphone button below to start recording your voice message.
              </p>
            )}
            
            {/* Instructions */}
            <p className="text-sm text-muted-foreground text-center max-w-md mb-8">
              {isRecording 
                ? "Recording in progress. Tap stop when you're finished." 
                : audioUrl 
                  ? "Listen to your recording and send it, or record again." 
                  : "Your voice will be transcribed to text and sent to CryptoBot."}
            </p>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4 py-4">
        {isRecording ? (
          <Button 
            size="lg"
            variant="destructive"
            onClick={stopRecording}
          >
            <Square className="w-5 h-5 mr-2" />
            Stop Recording
          </Button>
        ) : audioUrl ? (
          <>
            <Button 
              variant="outline" 
              onClick={resetRecording}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Record Again
            </Button>
            <Button 
              onClick={handleSend}
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              onClick={startRecording}
            >
              <Mic className="w-5 h-5 mr-2" />
              Start Recording
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;