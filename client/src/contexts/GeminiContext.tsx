import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface Message {
  role: "user" | "bot";
  content: string;
}

interface GeminiContextType {
  model: string;
  setModel: (model: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  generateResponse: (text: string, messageHistory: Message[]) => Promise<string>;
  isLoading: boolean;
}

export const GeminiContext = createContext<GeminiContextType | null>(null);

export const useGemini = () => {
  const context = useContext(GeminiContext);
  if (context === null) {
    throw new Error("useGemini must be used within a GeminiProvider");
  }
  return context;
};

interface GeminiProviderProps {
  children: ReactNode;
}

export const GeminiProvider = ({ children }: GeminiProviderProps) => {
  const [model, setModel] = useState("gemini-1.5-flash-latest");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  
  // Get language from localStorage instead of context to avoid circular dependency
  useEffect(() => {
    const savedLanguage = localStorage.getItem("cryptopulse-language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);
  
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
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH"
          }
        ]
      };
      
      // Make the API request to Gemini
      console.log(`Making API request to Gemini (model: ${model})`);
      
      // The API URL format has changed, make sure we're using the correct endpoint
      const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
      console.log(`API URL: ${apiUrl.replace(apiKey, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      // Debug response status
      console.log(`Gemini API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error response:", errorText);
        let errorMessage = "Error calling Gemini API";
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorMessage;
        } catch (e) {
          console.error("Failed to parse error response as JSON", e);
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Gemini API response data structure:", Object.keys(data));
      
      // Extract the response text with better error handling
      if (!data.candidates || data.candidates.length === 0) {
        console.error("No candidates in response", data);
        return "Sorry, I couldn't generate a response. Please try again.";
      }
      
      const generatedText = data.candidates[0]?.content?.parts?.[0]?.text || "No response generated";
      if (generatedText === "No response generated") {
        console.error("Response structure unexpected", data.candidates[0]);
      }
      
      return generatedText;
      
    } catch (error) {
      console.error("Error generating response:", error);
      return "I'm having trouble connecting to my AI services right now. Please try again later.";
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle language change
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("cryptopulse-language", lang);
    document.documentElement.lang = lang;
  };

  return (
    <GeminiContext.Provider value={{ 
      model, 
      setModel, 
      language, 
      setLanguage: handleLanguageChange, 
      generateResponse, 
      isLoading 
    }}>
      {children}
    </GeminiContext.Provider>
  );
};