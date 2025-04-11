import { createContext, useContext, useState, ReactNode } from "react";
import { useLanguage } from "./LanguageContext";

interface Message {
  role: "user" | "bot";
  content: string;
}

interface GeminiContextType {
  model: string;
  setModel: (model: string) => void;
  generateResponse: (text: string, messageHistory: Message[]) => Promise<string>;
  isLoading: boolean;
}

const GeminiContext = createContext<GeminiContextType>({
  model: "gemini-1.5-pro",
  setModel: () => {},
  generateResponse: async () => "",
  isLoading: false,
});

export const useGemini = () => useContext(GeminiContext);

interface GeminiProviderProps {
  children: ReactNode;
}

export const GeminiProvider = ({ children }: GeminiProviderProps) => {
  const [model, setModel] = useState("gemini-1.5-pro");
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  
  const generateResponse = async (text: string, messageHistory: Message[]): Promise<string> => {
    setIsLoading(true);
    
    try {
      // Prepare conversation history
      const history = messageHistory
        .slice(0, -1) // Exclude the latest user message as we'll add it separately
        .map(msg => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        }));
      
      // API key from environment variables
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("Gemini API key not found. Please set VITE_GEMINI_API_KEY environment variable.");
      }
      
      // Prepare the system prompt based on the selected language
      const systemPrompt = `You are CryptoBot, a helpful assistant specializing in cryptocurrencies, blockchain technology, and financial markets. 
      Respond in ${language === "es" ? "Spanish" : language === "pt" ? "Portuguese" : language === "fr" ? "French" : "English"}.
      Keep your responses concise, informative, and focused on crypto-related topics.`;
      
      // Create the Gemini request payload
      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: systemPrompt }]
          },
          ...history,
          {
            role: "user",
            parts: [{ text }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };
      
      // Make the API request to Gemini
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Error calling Gemini API");
      }
      
      const data = await response.json();
      
      // Extract the response text
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";
      
      return generatedText;
    } catch (error) {
      console.error("Error generating response:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <GeminiContext.Provider value={{ model, setModel, generateResponse, isLoading }}>
      {children}
    </GeminiContext.Provider>
  );
};
