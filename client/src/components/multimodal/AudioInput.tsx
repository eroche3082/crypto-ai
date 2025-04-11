import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Upload, Volume2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface AudioInputProps {
  onTranscription: (text: string) => void;
  language?: string;
}

export default function AudioInput({ onTranscription, language = 'en' }: AudioInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [volume, setVolume] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  const { toast } = useToast();
  
  const MAX_RECORDING_TIME = 60; // Maximum recording time in seconds

  // Setup audio context for visualization
  const setupAudioContext = (stream: MediaStream) => {
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;
    
    // Create analyser
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    
    // Create data array
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    dataArrayRef.current = dataArray;
    
    // Connect source
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    sourceRef.current = source;
    
    // Start visualization
    visualize();
  };

  // Visualize audio
  const visualize = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    // Calculate volume level
    const sum = dataArrayRef.current.reduce((a, b) => a + b, 0);
    const avg = sum / dataArrayRef.current.length || 0;
    const normalizedVolume = Math.min(100, Math.max(0, avg / 2.55)); // Convert 0-255 to 0-100
    
    setVolume(normalizedVolume);
    
    // Continue animation
    animationFrameRef.current = requestAnimationFrame(visualize);
  };

  // Clean up audio context
  const cleanupAudioContext = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    dataArrayRef.current = null;
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Reset recording state
      audioChunksRef.current = [];
      setRecordingTime(0);
      
      // Setup visualization
      setupAudioContext(stream);
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Setup event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAudioData(audioBlob);
        setAudioUrl(audioUrl);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Cleanup
        cleanupAudioContext();
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Setup recording time counter
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          
          // Auto-stop if reached max time
          if (newTime >= MAX_RECORDING_TIME) {
            stopRecording();
          }
          
          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: language === 'es' ? 'Error de grabación' : 'Recording Error',
        description: language === 'es'
          ? 'No se pudo acceder al micrófono. Por favor, intenta cargar un archivo de audio en su lugar.'
          : 'Could not access microphone. Please try uploading an audio file instead.',
        variant: 'destructive',
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    
    // Clear interval
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioData(file);
      setAudioUrl(url);
    }
  };

  // Send audio for transcription
  const transcribeAudio = async () => {
    if (!audioData) return;
    
    setLoading(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('audio', audioData);
      formData.append('language', language);
      
      // Send to API
      const response = await fetch('/api/speech/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.transcription) {
        onTranscription(data.transcription);
        
        // Reset state
        setAudioData(null);
        setAudioUrl(null);
      } else {
        throw new Error('No transcription returned');
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast({
        title: language === 'es' ? 'Error de transcripción' : 'Transcription Error',
        description: language === 'es'
          ? 'No se pudo transcribir el audio. Por favor, intenta de nuevo.'
          : 'Could not transcribe audio. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      
      cleanupAudioContext();
    };
  }, [audioUrl]);

  // Render recording UI
  if (isRecording) {
    return (
      <div className="recording-container p-4 border rounded-md">
        <div className="text-center mb-4">
          <Volume2 className={`h-10 w-10 mx-auto ${volume > 0 ? 'text-primary' : 'opacity-50'}`} />
          <div className="mt-2">
            <Progress value={volume} className="h-2" />
          </div>
          <p className="mt-2 text-sm font-medium">
            {language === 'es' ? 'Grabando...' : 'Recording...'}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatTime(recordingTime)} / {formatTime(MAX_RECORDING_TIME)}
          </p>
        </div>
        
        <div className="flex justify-center">
          <Button 
            variant="destructive"
            size="sm"
            onClick={stopRecording}
            className="flex items-center gap-2"
          >
            <Square className="h-4 w-4" />
            {language === 'es' ? 'Detener' : 'Stop'}
          </Button>
        </div>
      </div>
    );
  }

  // Render audio preview
  if (audioUrl) {
    return (
      <div className="audio-preview-container p-4 border rounded-md">
        <div className="mb-4">
          <audio 
            src={audioUrl} 
            controls 
            className="w-full"
          />
        </div>
        
        <div className="flex justify-between gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => {
              setAudioData(null);
              setAudioUrl(null);
            }}
          >
            <X className="h-4 w-4 mr-1" />
            {language === 'es' ? 'Cancelar' : 'Cancel'}
          </Button>
          
          <Button 
            size="sm"
            onClick={transcribeAudio}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {language === 'es' ? 'Transcribiendo...' : 'Transcribing...'}
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                {language === 'es' ? 'Transcribir' : 'Transcribe'}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Render initial UI
  return (
    <div className="audio-input-container">
      <div className="grid grid-cols-2 gap-3">
        <Card 
          className="p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50"
          onClick={startRecording}
        >
          <Mic className="h-8 w-8 mb-2 opacity-70" />
          <p className="text-sm font-medium">
            {language === 'es' ? 'Grabar audio' : 'Record Audio'}
          </p>
        </Card>
        
        <Card 
          className="p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 mb-2 opacity-70" />
          <p className="text-sm font-medium">
            {language === 'es' ? 'Cargar audio' : 'Upload Audio'}
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="audio/*"
            onChange={handleFileChange}
          />
        </Card>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2 text-center">
        {language === 'es' 
          ? 'Graba o carga un archivo de audio para transcribirlo'
          : 'Record or upload an audio file to transcribe'}
      </p>
    </div>
  );
}