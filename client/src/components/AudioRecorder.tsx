import { useState, useRef, useEffect } from "react";
import { Mic, Square, Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioRecorderProps {
  onAudioCaptured: (audioBlob: Blob) => void;
  onCancel: () => void;
}

const AudioRecorder = ({ onAudioCaptured, onCancel }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [audioUrl]);
  
  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        
        // Stop all tracks of the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start duration timer
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Error accessing your microphone. Please check permissions and try again.");
    }
  };
  
  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  // Format seconds to mm:ss
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Send the recorded audio
  const sendAudio = () => {
    if (audioBlob) {
      onAudioCaptured(audioBlob);
    }
  };
  
  // Reset the recorder
  const resetRecorder = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingDuration(0);
  };
  
  return (
    <div className="p-4 flex flex-col items-center">
      <h3 className="text-lg font-medium mb-4">Audio Recorder</h3>
      
      <div className="w-full relative overflow-hidden rounded-lg bg-secondary/50 mb-4 flex flex-col items-center justify-center" style={{ height: "200px" }}>
        {isRecording ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mb-4 animate-pulse">
              <Mic className="h-8 w-8 text-white" />
            </div>
            <p className="text-lg font-medium">{formatTime(recordingDuration)}</p>
            <p className="text-sm text-muted-foreground mt-1">Recording...</p>
          </div>
        ) : audioUrl ? (
          <div className="flex flex-col items-center">
            <audio src={audioUrl} controls className="mb-4" />
            <p className="text-sm text-muted-foreground">{formatTime(recordingDuration)} recorded</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Mic className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Press start to begin recording</p>
          </div>
        )}
      </div>
      
      <div className="flex space-x-4">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        
        {isRecording ? (
          <Button 
            variant="destructive" 
            onClick={stopRecording}
          >
            <Square className="h-4 w-4 mr-2" />
            Stop Recording
          </Button>
        ) : (
          <>
            {audioBlob ? (
              <>
                <Button variant="outline" onClick={resetRecorder}>
                  <Mic className="h-4 w-4 mr-2" />
                  Record Again
                </Button>
                
                <Button onClick={sendAudio}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Audio
                </Button>
              </>
            ) : (
              <Button onClick={startRecording}>
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;