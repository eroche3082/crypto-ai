import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Message interface with sentiment detection
interface Message {
  role: "user" | "bot";
  content: string;
  sentiment?: "positive" | "negative" | "neutral";
  confidence?: number;
  timestamp: string;
}

// Interface for user preferences
interface UserPreferences {
  avatar: string;
  language: string;
  voiceEnabled: boolean;
  name?: string;
  userId?: string;
}

// Context type definition
interface AdvancedChatContextType {
  messages: Message[];
  addMessage: (content: string, role: "user" | "bot", sentiment?: "positive" | "negative" | "neutral", confidence?: number) => void;
  clearMessages: () => void;
  isLoading: boolean;
  currentModel: string;
  setCurrentModel: (model: string) => void;
  userPreferences: UserPreferences;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;
  generateResponse: (text: string) => Promise<string>;
  processSpeechInput: (audioBlob: Blob) => Promise<string>;
  processImageInput: (imageBlob: Blob) => Promise<string>;
  processQrCode: (qrData: string) => Promise<string>;
  summarizeConversation: () => Promise<string>;
  isSpeaking: boolean;
  translateMessage: (message: string, targetLanguage: string) => Promise<string>;
  sentiment: {
    analyze: (text: string) => Promise<{ sentiment: "positive" | "negative" | "neutral", confidence: number }>;
  };
}

// Create the context
export const AdvancedChatContext = createContext<AdvancedChatContextType | null>(null);

// Custom hook to use the context
export const useAdvancedChat = () => {
  const context = useContext(AdvancedChatContext);
  if (context === null) {
    throw new Error("useAdvancedChat must be used within an AdvancedChatProvider");
  }
  return context;
};

// Provider component
interface AdvancedChatProviderProps {
  children: ReactNode;
}

// Supported models
const MODELS = {
  GEMINI: "gemini-1.5-flash",
  GEMINI_PRO: "gemini-1.5-pro",
  GPT4O: "gpt-4o"
};

// Provider implementation
export const AdvancedChatProvider = ({ children }: AdvancedChatProviderProps) => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentModel, setCurrentModel] = useState<string>(MODELS.GEMINI);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    avatar: "default",
    language: "en",
    voiceEnabled: false,
  });
  
  const { toast } = useToast();
  
  // Load preferences from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem("cryptopulse-chat-preferences");
    const savedMessages = localStorage.getItem("cryptopulse-chat-history");
    
    if (savedPrefs) {
      try {
        const parsedPrefs = JSON.parse(savedPrefs);
        setUserPreferences(parsedPrefs);
      } catch (error) {
        console.error("Failed to parse saved preferences:", error);
      }
    }
    
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Failed to parse saved messages:", error);
      }
    }
  }, []);
  
  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem("cryptopulse-chat-preferences", JSON.stringify(userPreferences));
  }, [userPreferences]);
  
  // Save recent messages when they change (limited to last 50)
  useEffect(() => {
    localStorage.setItem(
      "cryptopulse-chat-history", 
      JSON.stringify(messages.slice(-50))
    );
  }, [messages]);

  // Add a message to the conversation
  const addMessage = (
    content: string, 
    role: "user" | "bot", 
    sentiment?: "positive" | "negative" | "neutral", 
    confidence?: number
  ) => {
    const newMessage: Message = {
      role,
      content,
      sentiment,
      confidence,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Also save to database if user is logged in
    const userId = localStorage.getItem("cryptopulse-user-id");
    if (userId) {
      saveMessageToDatabase(userId, newMessage);
    }
  };

  // Clear all messages
  const clearMessages = () => {
    setMessages([]);
  };

  // Update user preferences
  const updateUserPreferences = (prefs: Partial<UserPreferences>) => {
    setUserPreferences(prev => ({ ...prev, ...prefs }));
  };

  // Save message to database
  const saveMessageToDatabase = async (userId: string, message: Message) => {
    try {
      await fetch("/api/chat/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          message: {
            role: message.role,
            content: message.content,
            timestamp: message.timestamp,
            sentiment: message.sentiment,
            confidence: message.confidence,
          },
        }),
      });
    } catch (error) {
      console.error("Failed to save message to database:", error);
    }
  };

  // Generate response with Vertex AI (Gemini)
  const generateGeminiResponse = async (
    text: string, 
    messageHistory: Message[]
  ): Promise<string> => {
    try {
      // Prepare conversation history
      const history = messageHistory
        .slice(-10) // Only use last 10 messages for context
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
      Respond in ${userPreferences.language === "es" ? "Spanish" : userPreferences.language === "pt" ? "Portuguese" : userPreferences.language === "fr" ? "French" : "English"}.
      Keep your responses concise, informative, and focused on crypto-related topics.
      Use markdown formatting to make important points stand out.
      
      Respond in a natural, conversational tone and be emotionally intelligent.
      NEVER respond with more than one question at a time.
      ALWAYS be direct and answer user's previous question before asking a new one.`;
      
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
      console.log(`Making API request to Gemini (model: ${currentModel})`);
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${currentModel}:generateContent?key=${apiKey}`;
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
      console.error("Error generating Gemini response:", error);
      throw error;
    }
  };

  // Generate response with OpenAI (GPT-4o)
  const generateOpenAIResponse = async (
    text: string, 
    messageHistory: Message[]
  ): Promise<string> => {
    try {
      // Prepare the API request
      const systemPrompt = `You are CryptoBot, a helpful assistant specializing in cryptocurrencies, blockchain technology, and financial markets. 
      Respond in ${userPreferences.language === "es" ? "Spanish" : userPreferences.language === "pt" ? "Portuguese" : userPreferences.language === "fr" ? "French" : "English"}.
      Keep your responses concise, informative, and focused on crypto-related topics.
      Use markdown formatting to make important points stand out.
      
      Respond in a natural, conversational tone and be emotionally intelligent.
      NEVER respond with more than one question at a time.
      ALWAYS be direct and answer user's previous question before asking a new one.`;
      
      // Create message history in OpenAI format
      const openAiMessages = [
        { role: "system", content: systemPrompt },
        ...messageHistory.slice(-10).map(msg => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content
        })),
        { role: "user", content: text }
      ];
      
      // Get OpenAI API key
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error("OpenAI API key not found. Please set VITE_OPENAI_API_KEY environment variable.");
      }
      
      // Make the API request
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: openAiMessages,
          temperature: 0.7,
          max_tokens: 1024
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API error response:", errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
      
    } catch (error) {
      console.error("Error generating OpenAI response:", error);
      throw error;
    }
  };

  // Main generate response function with fallback
  const generateResponse = async (text: string): Promise<string> => {
    setIsLoading(true);
    
    try {
      // First try Gemini
      if (currentModel.includes("gemini")) {
        try {
          const response = await generateGeminiResponse(text, messages);
          return response;
        } catch (error) {
          console.error("Gemini API failed, falling back to OpenAI:", error);
          
          // If we have OpenAI key, try it as fallback
          if (import.meta.env.VITE_OPENAI_API_KEY) {
            toast({
              title: "Fallback to OpenAI",
              description: "Gemini API failed, using OpenAI as fallback",
              variant: "default",
            });
            const response = await generateOpenAIResponse(text, messages);
            return response;
          } else {
            throw error; // Re-throw if no fallback available
          }
        }
      } else {
        // If OpenAI is selected as primary
        return await generateOpenAIResponse(text, messages);
      }
    } catch (error) {
      console.error("All AI services failed:", error);
      return "I'm having trouble connecting to AI services. Please try again later.";
    } finally {
      setIsLoading(false);
    }
  };

  // Process speech input
  const processSpeechInput = async (audioBlob: Blob): Promise<string> => {
    setIsLoading(true);
    
    try {
      // Create form data with audio file
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");
      formData.append("language", userPreferences.language || "en");
      
      // Send to backend for processing
      const response = await fetch("/api/speech/transcribe", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Speech recognition failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.text || "";
    } catch (error) {
      console.error("Error processing speech input:", error);
      toast({
        title: "Speech Recognition Failed",
        description: "Could not process your voice input. Please try again or type your message.",
        variant: "destructive",
      });
      return "";
    } finally {
      setIsLoading(false);
    }
  };

  // Process image input
  const processImageInput = async (imageBlob: Blob): Promise<string> => {
    setIsLoading(true);
    
    try {
      // Create form data with image file
      const formData = new FormData();
      formData.append("image", imageBlob, "image.jpg");
      
      // Send to backend for processing with Vision API
      const response = await fetch("/api/vision/analyze", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Image analysis failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Format response based on image analysis
      let description = "Here's what I see in your image:";
      
      if (data.text) {
        description += `\n\n**Text detected:** "${data.text}"`;
      }
      
      if (data.logos && data.logos.length > 0) {
        description += "\n\n**Logos detected:** " + data.logos.map((l: any) => l.description).join(", ");
      }
      
      if (data.labels && data.labels.length > 0) {
        description += "\n\n**Content labels:** " + data.labels.map((l: any) => l.description).join(", ");
      }
      
      if (data.landmarks && data.landmarks.length > 0) {
        description += "\n\n**Landmarks recognized:** " + data.landmarks.map((l: any) => l.description).join(", ");
      }
      
      if (data.faces) {
        description += `\n\n**Faces detected:** ${data.faces.count} face(s)`;
      }
      
      // Check for crypto-related content
      const cryptoTerms = ['bitcoin', 'ethereum', 'crypto', 'blockchain', 'wallet', 'nft'];
      const hasCryptoContent = cryptoTerms.some(term => 
        data.text?.toLowerCase().includes(term) || 
        data.labels?.some((l: any) => l.description.toLowerCase().includes(term))
      );
      
      if (hasCryptoContent) {
        description += "\n\n**Crypto relevance:** This image appears to be related to cryptocurrency. Would you like me to analyze any specific aspect of it?";
      }
      
      return description;
    } catch (error) {
      console.error("Error processing image input:", error);
      toast({
        title: "Image Analysis Failed",
        description: "Could not analyze your image. Please try again or use text input.",
        variant: "destructive",
      });
      return "I couldn't analyze the image properly. Please try again with a clearer image.";
    } finally {
      setIsLoading(false);
    }
  };

  // Process QR code
  const processQrCode = async (qrData: string): Promise<string> => {
    setIsLoading(true);
    
    try {
      // Analyze QR code content
      let response = "I've scanned a QR code with the following content:";
      
      // Check if it's a URL
      if (qrData.startsWith("http://") || qrData.startsWith("https://")) {
        response += `\n\n**URL detected**: [${qrData}](${qrData})`;
        
        // Check for common crypto-related URLs
        const cryptoDomains = [
          "blockchain.com", "coinbase.com", "binance.com", "metamask.io",
          "etherscan.io", "bscscan.com", "opensea.io", "uniswap.org"
        ];
        
        const isCryptoUrl = cryptoDomains.some(domain => qrData.includes(domain));
        
        if (isCryptoUrl) {
          response += "\n\nThis appears to be a cryptocurrency-related website. Be careful when connecting your wallet or entering sensitive information.";
        } else {
          response += "\n\nWould you like me to tell you more about this link?";
        }
      } 
      // Check if it's a crypto address
      else if (/^0x[a-fA-F0-9]{40}$/.test(qrData)) {
        response += `\n\n**Ethereum Address Detected**: \`${qrData}\``;
        response += "\n\nThis appears to be an Ethereum address. Would you like me to look up information about this address?";
      }
      else if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(qrData)) {
        response += `\n\n**Bitcoin Address Detected**: \`${qrData}\``;
        response += "\n\nThis appears to be a Bitcoin address. Would you like me to look up information about this address?";
      }
      // For other content
      else {
        response += `\n\n\`\`\`\n${qrData}\n\`\`\``;
        response += "\n\nWould you like me to help you understand what this information means?";
      }
      
      return response;
    } catch (error) {
      console.error("Error processing QR code:", error);
      return "I've scanned the QR code, but I'm having trouble processing its content. Can you tell me what you were expecting to find?";
    } finally {
      setIsLoading(false);
    }
  };

  // Summarize conversation
  const summarizeConversation = async (): Promise<string> => {
    setIsLoading(true);
    
    try {
      // If no messages, return early
      if (messages.length === 0) {
        return "There is no conversation to summarize yet.";
      }
      
      // Format the conversation for the AI to summarize
      const conversationText = messages
        .map(msg => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
        .join("\n\n");
      
      // Create a summary prompt
      const summaryPrompt = `Please provide a concise summary of the following conversation between a user and an AI assistant about cryptocurrency:

${conversationText}

Key points to include in the summary:
1. Main topics discussed
2. Any questions asked and answers provided
3. Any actions or next steps mentioned`;

      // Use either Gemini or OpenAI based on current model
      if (currentModel.includes("gemini")) {
        try {
          const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
          
          if (!apiKey) {
            throw new Error("Gemini API key not found");
          }
          
          const payload = {
            contents: [
              {
                role: "user",
                parts: [{ text: summaryPrompt }]
              }
            ],
            generationConfig: {
              temperature: 0.3,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 1024,
            }
          };
          
          const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${currentModel}:generateContent?key=${apiKey}`;
          
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          
          if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
          }
          
          const data = await response.json();
          return data.candidates[0]?.content?.parts?.[0]?.text || "Could not generate a summary.";
        } catch (error) {
          console.error("Error using Gemini for summary:", error);
          
          // Fall back to OpenAI if available
          if (import.meta.env.VITE_OPENAI_API_KEY) {
            console.log("Falling back to OpenAI for summary");
            // OpenAI fallback logic follows...
          } else {
            throw error;
          }
        }
      }
      
      // OpenAI path (either direct or fallback)
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error("OpenAI API key not found");
      }
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are a helpful assistant that provides concise, accurate summaries." },
            { role: "user", content: summaryPrompt }
          ],
          temperature: 0.3,
          max_tokens: 512
        })
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0]?.message?.content || "Could not generate a summary.";
      
    } catch (error) {
      console.error("Error summarizing conversation:", error);
      return "I encountered an issue while trying to summarize our conversation. Let's continue our discussion instead.";
    } finally {
      setIsLoading(false);
    }
  };

  // Translate message
  const translateMessage = async (message: string, targetLanguage: string): Promise<string> => {
    setIsLoading(true);
    
    try {
      // Prepare the prompt for translation
      const translationPrompt = `Translate the following text to ${
        targetLanguage === "es" ? "Spanish" : 
        targetLanguage === "fr" ? "French" : 
        targetLanguage === "pt" ? "Portuguese" : 
        "English"
      }:\n\n${message}`;
      
      // Use current AI model to translate
      const translated = await generateResponse(translationPrompt);
      
      // Clean up the response (remove any prefixes like "Translation: ")
      return translated
        .replace(/^Translation:\s*/i, "")
        .replace(/^Translated text:\s*/i, "")
        .replace(/^Here's the translation:\s*/i, "")
        .trim();
      
    } catch (error) {
      console.error("Error translating message:", error);
      return message; // Return original message if translation fails
    } finally {
      setIsLoading(false);
    }
  };

  // Sentiment analysis
  const analyzeSentiment = async (text: string): Promise<{ sentiment: "positive" | "negative" | "neutral", confidence: number }> => {
    try {
      // For shorter texts, use a simpler method
      if (text.length < 20) {
        const positiveWords = ["good", "great", "excellent", "amazing", "love", "happy", "thank", "thanks", "appreciate", "helpful", "bull", "bullish", "up", "profit", "gain"];
        const negativeWords = ["bad", "terrible", "awful", "hate", "sad", "angry", "useless", "unhelpful", "wrong", "bear", "bearish", "down", "loss", "crash"];
        
        const lowerText = text.toLowerCase();
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        positiveWords.forEach(word => {
          if (lowerText.includes(word)) positiveCount++;
        });
        
        negativeWords.forEach(word => {
          if (lowerText.includes(word)) negativeCount++;
        });
        
        if (positiveCount > negativeCount) {
          const confidence = Math.min(1, positiveCount * 0.2);
          return { sentiment: "positive", confidence };
        } else if (negativeCount > positiveCount) {
          const confidence = Math.min(1, negativeCount * 0.2);
          return { sentiment: "negative", confidence };
        } else {
          return { sentiment: "neutral", confidence: 0.5 };
        }
      }
      
      // For longer texts, send to the server for more sophisticated analysis
      const response = await fetch("/api/sentiment/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
      return {
        sentiment: data.sentiment,
        confidence: data.confidence || 0.5,
      };
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      // Default to neutral if analysis fails
      return { sentiment: "neutral", confidence: 0.5 };
    }
  };

  // Context value
  const contextValue: AdvancedChatContextType = {
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
    isSpeaking,
    translateMessage,
    sentiment: {
      analyze: analyzeSentiment,
    },
  };

  return (
    <AdvancedChatContext.Provider value={contextValue}>
      {children}
    </AdvancedChatContext.Provider>
  );
};