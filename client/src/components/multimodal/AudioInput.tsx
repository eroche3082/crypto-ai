import React, { useState, useRef } from 'react';
import { Mic, Square, Upload, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';

interface AudioInputProps {
  onTranscription: (text: string) => void;
  className?: string;
}

export default function AudioInput({ onTranscription, className = '' }: AudioInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentVolume, setCurrentVolume] = useState<number[]>([80]);
  const [isListening, setIsListening] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  
  const { toast } = useToast();

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        // Create audio blob and URL
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop recording timer
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        
        // Stop all tracks in the stream
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start(10); // Collect data every 10ms
      setIsRecording(true);
      setIsPaused(false);
      
      // Start recording timer
      let seconds = 0;
      recordingTimerRef.current = window.setInterval(() => {
        seconds++;
        setRecordingDuration(seconds);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Microphone Error',
        description: 'Could not access your microphone. Please check permissions.',
        variant: 'destructive'
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      // Pause the timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  // Resume recording
  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Resume the timer
      let seconds = recordingDuration;
      recordingTimerRef.current = window.setInterval(() => {
        seconds++;
        setRecordingDuration(seconds);
      }, 1000);
    }
  };

  // Toggle audio playback
  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isListening) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsListening(!isListening);
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    setCurrentVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value[0] / 100;
    }
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle audio upload from device
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if file is audio
    if (!file.type.startsWith('audio/')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload an audio file.',
        variant: 'destructive'
      });
      return;
    }
    
    // Create URL for the uploaded file
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  // Send audio for transcription
  const sendForTranscription = async () => {
    if (!audioUrl) {
      toast({
        title: 'No Audio',
        description: 'Please record or upload audio first.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Get the audio blob
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      
      // Send to API
      const apiResponse = await fetch('/api/speech/transcribe', {
        method: 'POST',
        body: formData
      });
      
      if (!apiResponse.ok) {
        throw new Error(`API error: ${apiResponse.status}`);
      }
      
      const data = await apiResponse.json();
      
      if (data.transcription) {
        onTranscription(data.transcription);
        
        // Reset recording state
        setAudioUrl(null);
        setRecordingDuration(0);
      } else {
        throw new Error('No transcription received');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: 'Transcription Failed',
        description: `Error: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`audio-input-container p-4 ${className}`}>
      {isRecording ? (
        <div className="recording-controls">
          <div className="flex justify-center items-center mb-4">
            <div className="recording-indicator mr-2">
              <div className={`w-3 h-3 rounded-full bg-red-500 ${isPaused ? '' : 'animate-pulse'}`}></div>
            </div>
            <span className="text-sm font-medium">
              {isPaused ? 'Paused' : 'Recording'} | {formatTime(recordingDuration)}
            </span>
          </div>
          
          <div className="flex space-x-2 justify-center">
            {isPaused ? (
              <Button 
                onClick={resumeRecording}
                variant="outline"
                size="sm"
              >
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
            ) : (
              <Button 
                onClick={pauseRecording}
                variant="outline"
                size="sm"
              >
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            )}
            
            <Button 
              onClick={stopRecording}
              variant="destructive"
              size="sm"
            >
              <Square className="h-4 w-4 mr-1" />
              Stop
            </Button>
          </div>
        </div>
      ) : (
        <div className="record-controls">
          {audioUrl ? (
            <div className="playback-controls flex flex-col space-y-4">
              <div className="audio-player flex items-center space-x-4">
                <Button 
                  onClick={togglePlayback}
                  variant="outline"
                  size="icon"
                >
                  {isListening ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <div className="flex-1">
                  <Slider
                    value={currentVolume}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
              
              <audio ref={audioRef} src={audioUrl} onEnded={() => setIsListening(false)} className="hidden" />
              
              <div className="flex justify-between">
                <Button 
                  onClick={() => {
                    setAudioUrl(null);
                    setRecordingDuration(0);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Discard
                </Button>
                
                <Button 
                  onClick={sendForTranscription}
                  disabled={isProcessing}
                  size="sm"
                >
                  {isProcessing ? 'Transcribing...' : 'Transcribe Audio'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="initial-controls grid grid-cols-2 gap-2">
              <Button 
                onClick={startRecording}
                variant="default"
                className="w-full"
              >
                <Mic className="h-4 w-4 mr-2" />
                Record Audio
              </Button>
              
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => document.getElementById('audioFileInput')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Audio
                </Button>
                <input 
                  id="audioFileInput" 
                  type="file" 
                  accept="audio/*" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}