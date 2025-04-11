import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";

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
      alert(t("messageInput.speechRecognitionNotSupported"));
    }
  };
  
  return (
    <div className="border-t border-gray-800 p-4">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t("messageInput.placeholder")}
          className="w-full bg-secondary border border-gray-700 rounded-full py-3 px-4 pr-24 text-sm focus:outline-none focus:border-primary"
          disabled={disabled}
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
          <button
            className={`mr-2 text-gray-400 ${isRecording ? 'text-primary animate-pulse' : ''}`}
            onClick={activateVoiceInput}
            disabled={disabled}
            title={t("messageInput.voice")}
          >
            <span className="material-icons">mic</span>
          </button>
          
          <button
            className="bg-primary rounded-full w-8 h-8 flex items-center justify-center text-white disabled:opacity-50"
            onClick={handleSend}
            disabled={!inputValue.trim() || disabled}
            title={t("messageInput.send")}
          >
            <span className="material-icons text-sm">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
