import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useGemini } from "../contexts/GeminiContext";
import QuickPrompts from "./QuickPrompts";
import MessageInput from "./MessageInput";

interface Message {
  role: "user" | "bot";
  content: string;
}

const ChatContainer = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const { generateResponse, isLoading } = useGemini();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Add initial welcome message
    if (messages.length === 0) {
      setMessages([
        { 
          role: "bot", 
          content: t("chatContainer.welcomeMessage") 
        }
      ]);
    }
  }, [t]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    // Add user message to the chat
    const newMessages = [
      ...messages, 
      { role: "user", content: text }
    ];
    setMessages(newMessages);
    
    try {
      // Get response from Gemini AI
      const response = await generateResponse(text, newMessages);
      
      // Add bot response to the chat
      setMessages(prevMessages => [
        ...prevMessages, 
        { role: "bot", content: response }
      ]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prevMessages => [
        ...prevMessages, 
        { 
          role: "bot", 
          content: t("chatContainer.errorMessage") 
        }
      ]);
    }
  };
  
  const handleQuickPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden pt-4 px-4">
      <div 
        ref={chatContainerRef}
        className="chat-container overflow-y-auto flex flex-col flex-1 scrollbar-hide"
      >
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            {message.content.split("\n").map((line, i) => (
              <p key={i} className={i > 0 ? "mt-2" : ""}>
                {line}
              </p>
            ))}
          </div>
        ))}
        
        {isLoading && (
          <div className="message bot">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        )}
      </div>
      
      <QuickPrompts onSelectPrompt={handleQuickPrompt} />
      
      <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatContainer;
