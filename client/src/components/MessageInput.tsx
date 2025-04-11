import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Mic, Send } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

const MessageInput = ({ onSendMessage, disabled = false }: MessageInputProps) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };
  
  const activateVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsRecording(true);
      
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = document.documentElement.lang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsRecording(false);
      };
      
      recognition.onerror = () => {
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognition.start();
    } else {
      alert(t("messageInput.speechRecognitionNotSupported", "Speech recognition is not supported in your browser"));
    }
  };
  
  return (
    <div className="p-2">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t("messageInput.placeholder", "Ask about crypto, trends, prices, etc.")}
          className="w-full bg-background border border-input rounded-full py-3 pl-4 pr-24 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          disabled={disabled}
        />
        
        <div className="absolute right-2 flex items-center space-x-1">
          <button
            className={`text-muted-foreground p-1.5 rounded-full hover:bg-accent hover:text-accent-foreground ${isRecording ? 'text-primary animate-pulse' : ''}`}
            onClick={activateVoiceInput}
            disabled={disabled}
            title={t("messageInput.voice", "Voice input")}
          >
            <Mic size={18} />
          </button>
          
          <button
            className="bg-primary text-primary-foreground rounded-full p-1.5 disabled:opacity-50"
            onClick={handleSend}
            disabled={!inputValue.trim() || disabled}
            title={t("messageInput.send", "Send message")}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
