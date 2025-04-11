import { useState, useRef } from "react";
import { Mic, Square, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioRecorderProps {
  onAudioCaptured: (audioBlob: Blob) => void;
  onCancel: () => void;
}

const AudioRecorder = ({ onAudioCaptured, onCancel }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        onAudioCaptured(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
      }, 1000);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Error accessing your microphone. Please check permissions and try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <h3 className="text-lg font-medium mb-4">Audio Recording</h3>
      
      <div className="flex flex-col items-center justify-center w-full h-40 bg-secondary rounded-lg mb-4">
        {isRecording ? (
          <>
            <div className="animate-pulse mb-2">
              <Mic className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-xl font-medium">{formatTime(recordingTime)}</div>
            <div className="text-sm text-muted-foreground mt-1">Recording...</div>
          </>
        ) : (
          <div className="text-muted-foreground">
            <Mic className="h-12 w-12 mb-2 mx-auto" />
            <p>Press start to begin recording</p>
          </div>
        )}
      </div>
      
      <div className="flex space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        
        {isRecording ? (
          <Button variant="destructive" onClick={stopRecording}>
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
        ) : (
          <Button onClick={startRecording}>
            <Mic className="h-4 w-4 mr-2" />
            Start Recording
          </Button>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;