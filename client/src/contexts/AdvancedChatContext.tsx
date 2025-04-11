import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { apiRequest } from "../lib/queryClient";

interface Message {
  role: "user" | "bot";
  content: string;
  timestamp: number;
  sentiment?: "positive" | "negative" | "neutral";
  confidence?: number;
}

interface UserPreferences {
  language: string;
  voiceEnabled: boolean;
  model: string;
}

interface AdvancedChatContextType {
  messages: Message[];
  addMessage: (content: string, role: "user" | "bot", sentiment?: "positive" | "negative" | "neutral", confidence?: number) => void;
  clearMessages: () => void;
  isLoading: boolean;
  currentModel: string;
  setCurrentModel: (model: string) => void;
  userPreferences: UserPreferences;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;
  generateResponse: (prompt: string) => Promise<string>;
  processSpeechInput: (audioBlob: Blob) => Promise<string>;
  processImageInput: (imageBlob: Blob) => Promise<string>;
  processQrCode: (qrData: string) => Promise<string>;
  summarizeConversation: () => Promise<string>;
  translateMessage: (text: string, targetLanguage: string) => Promise<string>;
  sentiment: {
    analyze: (text: string) => Promise<{ sentiment: "positive" | "negative" | "neutral"; score: number; confidence: number; }>;
  };
}

const defaultPreferences: UserPreferences = {
  language: "en",
  voiceEnabled: true,
  model: "gemini-1.5-flash"
};

const AdvancedChatContext = createContext<AdvancedChatContextType | undefined>(undefined);

export const AdvancedChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState("gemini-1.5-flash");
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(
    () => {
      // Load preferences from localStorage if available
      const savedPrefs = localStorage.getItem('chatbot_preferences');
      return savedPrefs ? JSON.parse(savedPrefs) : defaultPreferences;
    }
  );
  const { toast } = useToast();
  const { i18n } = useTranslation();

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('chatbot_preferences', JSON.stringify(userPreferences));
    
    // Also update i18n language
    if (i18n.language !== userPreferences.language) {
      i18n.changeLanguage(userPreferences.language);
    }
  }, [userPreferences, i18n]);

  const addMessage = (
    content: string, 
    role: "user" | "bot", 
    sentiment?: "positive" | "negative" | "neutral",
    confidence?: number
  ) => {
    const newMessage: Message = {
      content,
      role,
      timestamp: Date.now(),
      sentiment,
      confidence
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // If we have user authentication, we could also send to server to store in chat history
    if (role === "user") {
      // Store chat in history if user is logged in
      // This would be implemented in a production version
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const updateUserPreferences = (prefs: Partial<UserPreferences>) => {
    setUserPreferences(prev => ({ ...prev, ...prefs }));
  };

  // Generate AI response
  const generateResponse = async (prompt: string): Promise<string> => {
    setIsLoading(true);
    
    try {
      // In a production app, this would call Vertex AI (gemini-1.5-flash) or OpenAI's GPT-4o
      // For this demo, we'll use a simulated endpoint
      const response = await apiRequest("POST", "/api/generate-ai-response", {
        prompt,
        model: currentModel,
        language: userPreferences.language
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setIsLoading(false);
      return data.response;
    } catch (error) {
      setIsLoading(false);
      console.error("Error generating AI response:", error);
      throw error;
    }
  };

  // Process speech input (audio to text) using real transcription API
  const processSpeechInput = async (audioBlob: Blob): Promise<string> => {
    try {
      // Create form data with the audio file
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', userPreferences.language);
      
      // Send to server for transcription
      const response = await fetch('/api/speech/transcribe', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Speech transcription failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.transcription || "I couldn't transcribe this audio. Please try speaking more clearly.";
    } catch (error) {
      console.error("Error processing speech:", error);
      return "Sorry, I encountered an error while transcribing your audio. Please try again.";
    }
  };

  // Process image input
  const processImageInput = async (imageBlob: Blob): Promise<string> => {
    try {
      // Create form data with the image
      const formData = new FormData();
      formData.append('image', imageBlob);
      
      // Send to server for analysis
      const response = await fetch('/api/vision/analyze', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Image analysis failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.analysis || "I couldn't analyze this image. Please try another one.";
    } catch (error) {
      console.error("Error analyzing image:", error);
      return "Sorry, I encountered an error while analyzing the image. Please try again.";
    }
  };

  // Process QR code data
  const processQrCode = async (qrData: string): Promise<string> => {
    try {
      // In a real app, we'd validate and process the QR code data
      // For example, check if it's a crypto address, URL, etc.
      
      if (qrData.startsWith("http")) {
        return `I detected a URL: ${qrData}\n\nThis appears to be a web link. Would you like me to analyze it further?`;
      } else if (qrData.match(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/)) {
        return `I detected what looks like a Bitcoin address: ${qrData}\n\nBe careful with cryptocurrency addresses and always verify them through multiple sources.`;
      } else if (qrData.match(/^0x[a-fA-F0-9]{40}$/)) {
        return `I detected what looks like an Ethereum address: ${qrData}\n\nBe careful with cryptocurrency addresses and always verify them through multiple sources.`;
      } else {
        // Generate a response about the QR code
        return `I detected QR code data: ${qrData}\n\nThis doesn't appear to be a common crypto format. What would you like to know about this data?`;
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
      return "Sorry, I encountered an error processing the QR code. Please try again.";
    }
  };

  // Summarize conversation
  const summarizeConversation = async (): Promise<string> => {
    if (messages.length < 2) {
      return "The conversation is too short to summarize.";
    }
    
    try {
      // In a real app, we'd send the conversation to an AI endpoint for summarization
      // For this demo, we'll create a simple summary
      const userMessages = messages.filter(m => m.role === "user").map(m => m.content);
      const uniqueTopics = new Set<string>();
      
      // Extract potential topics (crude approximation)
      userMessages.forEach(msg => {
        const words = msg.toLowerCase().split(/\s+/);
        words.filter(w => w.length > 5).forEach(w => uniqueTopics.add(w));
      });
      
      const topics = Array.from(uniqueTopics).slice(0, 3).join(", ");
      
      return `This conversation includes ${messages.length} messages and covers topics related to ${topics || "cryptocurrency"}. The conversation started at ${new Date(messages[0].timestamp).toLocaleString()} and the most recent message was at ${new Date(messages[messages.length - 1].timestamp).toLocaleString()}.`;
    } catch (error) {
      console.error("Error summarizing conversation:", error);
      return "Sorry, I couldn't generate a summary at this time.";
    }
  };

  // Translate message
  const translateMessage = async (text: string, targetLanguage: string): Promise<string> => {
    try {
      // In a real app, we'd use a translation API
      // For this demo, return a simulated translation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
      
      if (targetLanguage === "es") {
        return `[Translated to Spanish]: ${text}\n\nNota: Esta es una traducción simulada. En una aplicación real, utilizaríamos un servicio de traducción.`;
      } else if (targetLanguage === "fr") {
        return `[Traduit en français]: ${text}\n\nNote: Il s'agit d'une traduction simulée. Dans une application réelle, nous utiliserions un service de traduction.`;
      } else {
        return `[Translated to ${targetLanguage}]: ${text}\n\nNote: This is a simulated translation. In a real app, we would use a translation service.`;
      }
    } catch (error) {
      console.error("Error translating message:", error);
      return "Sorry, I couldn't translate the message.";
    }
  };

  // Sentiment analysis
  const analyzeSentiment = async (text: string) => {
    try {
      const response = await fetch('/api/sentiment/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error(`Sentiment analysis failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        sentiment: data.sentiment as "positive" | "negative" | "neutral",
        score: data.score,
        confidence: data.confidence
      };
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      // Return neutral sentiment as fallback
      return {
        sentiment: "neutral" as "positive" | "negative" | "neutral",
        score: 0,
        confidence: 0.5
      };
    }
  };

  const value = {
    messages,
    addMessage,
    clearMessages,
    isLoading,
    currentModel,
    setCurrentModel,
    userPreferences,
    updateUserPreferences,
    generateResponse,
    processSpeechInput,
    processImageInput,
    processQrCode,
    summarizeConversation,
    translateMessage,
    sentiment: {
      analyze: analyzeSentiment
    }
  };

  return (
    <AdvancedChatContext.Provider value={value}>
      {children}
    </AdvancedChatContext.Provider>
  );
};

export const useAdvancedChat = (): AdvancedChatContextType => {
  const context = useContext(AdvancedChatContext);
  if (context === undefined) {
    throw new Error('useAdvancedChat must be used within an AdvancedChatProvider');
  }
  return context;
};