import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

interface UseGeminiAIParams {
  model?: string;
}

export const useGeminiAI = (params?: UseGeminiAIParams) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { language } = useLanguage();
  
  const model = params?.model || "gemini-1.5-pro";
  
  const generateResponse = async (prompt: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("Gemini API key not found");
      }
      
      // Add language instruction to the prompt
      const languageMap: Record<string, string> = {
        es: "Spanish",
        en: "English",
        pt: "Portuguese",
        fr: "French",
      };
      
      const languagePrompt = `Respond in ${languageMap[language] || "Spanish"}. You are CryptoBot, a helpful assistant specializing in cryptocurrency.`;
      const fullPrompt = `${languagePrompt}\n\n${prompt}`;
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: fullPrompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.9,
              topK: 32,
              topP: 1,
              maxOutputTokens: 2048,
            },
          }),
        }
      );
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "Error generating response");
      }
      
      return data.candidates[0].content.parts[0].text;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    generateResponse,
    isLoading,
    error,
  };
};
