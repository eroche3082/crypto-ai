import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface SpeechRecordButtonProps {
  onTranscriptionComplete?: (text: string, language?: string) => void;
  onRecordingStart?: () => void;
  onRecordingEnd?: () => void;
  compact?: boolean;
  className?: string;
  id?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

export function SpeechRecordButton({
  onTranscriptionComplete,
  onRecordingStart,
  onRecordingEnd,
  compact = false,
  className = '',
  id,
  variant = "outline"
}: SpeechRecordButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Function to start recording
  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create a new MediaRecorder instance
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm' // Most widely supported format
      });
      
      // Clear any existing chunks
      audioChunksRef.current = [];
      
      // Handle data available events
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Start recording
      mediaRecorder.start();
      
      // Save the mediaRecorder reference
      mediaRecorderRef.current = mediaRecorder;
      
      // Update state
      setIsRecording(true);
      
      // Call the callback if provided
      if (onRecordingStart) {
        onRecordingStart();
      }
      
      // Show toast notification
      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone...",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Microphone Access Error",
        description: "Please allow microphone access to use speech recognition.",
        variant: "destructive",
      });
    }
  };

  // Function to stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Stop the mediaRecorder
      mediaRecorderRef.current.stop();
      
      // Stop all tracks in the stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      // Update state
      setIsRecording(false);
      setIsProcessing(true);
      
      // Call the callback if provided
      if (onRecordingEnd) {
        onRecordingEnd();
      }
      
      // Process when data is finalized
      mediaRecorderRef.current.onstop = processAudio;
    }
  };

  // Function to process the recorded audio
  const processAudio = async () => {
    try {
      if (audioChunksRef.current.length === 0) {
        throw new Error('No audio recorded');
      }
      
      // Combine audio chunks into a single blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Convert blob to base64
      const base64Audio = await blobToBase64(audioBlob);
      
      // Send to the server
      const response = await apiRequest('POST', '/api/speech-to-text', {
        audioContent: base64Audio.split(',')[1], // Remove data URL prefix
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000, // Common sample rate
        languageCode: 'en-US',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transcribe audio');
      }
      
      const data = await response.json();
      
      // Call the callback with the transcription result
      if (onTranscriptionComplete && data.transcript) {
        onTranscriptionComplete(data.transcript, data.language);
        
        // Show success toast
        toast({
          title: "Transcription Complete",
          description: `"${data.transcript.substring(0, 40)}${data.transcript.length > 40 ? '...' : ''}"`,
        });
      } else {
        throw new Error('No transcription returned');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Speech Recognition Failed",
        description: error instanceof Error ? error.message : "Couldn't understand the audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Toggle recording state
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRecording]);

  return (
    <Button
      type="button"
      onClick={toggleRecording}
      disabled={isProcessing}
      variant={variant}
      size={compact ? "sm" : "default"}
      className={cn(
        "relative overflow-hidden transition-all",
        isRecording && "animate-pulse bg-red-500 hover:bg-red-600 text-white border-red-600",
        className
      )}
      id={id}
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {!compact && <span>Processing...</span>}
        </>
      ) : isRecording ? (
        <>
          <MicOff className="h-4 w-4 mr-2" />
          {!compact && <span>Stop</span>}
        </>
      ) : (
        <>
          <Mic className="h-4 w-4 mr-2" />
          {!compact && <span>Record</span>}
        </>
      )}
    </Button>
  );
}