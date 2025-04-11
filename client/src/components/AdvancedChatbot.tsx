import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Send, Mic, Camera, QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdvancedChat } from "@/contexts/AdvancedChatContext";

import AudioRecorder from "./AudioRecorder";
import CameraCapture from "./CameraCapture";
import QrScanner from "./QrScanner";
import ArViewer from "./ArViewer";

// Typing indicator component
const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-1">
      <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: "0ms" }}></div>
      <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: "150ms" }}></div>
      <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: "300ms" }}></div>
    </div>
  );
};

// Main component - Simplified for FloatingChatbot integration
export default function AdvancedChatbot() {
  const { 
    messages, 
    addMessage, 
    isLoading, 
    generateResponse,
    processSpeechInput,
    processImageInput,
    processQrCode,
    sentiment
  } = useAdvancedChat();
  
  const [inputValue, setInputValue] = useState("");
  const [activeToolType, setActiveToolType] = useState<'audio' | 'camera' | 'qr' | 'ar' | null>(null);
  const [selectedCryptoSymbol, setSelectedCryptoSymbol] = useState("BTC");
  
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Listen for custom events from the parent (sidebar)
  useEffect(() => {
    const handleAudioEvent = () => handleOpenAudioRecorder();
    const handleCameraEvent = () => handleOpenCamera();
    const handleQrEvent = () => handleOpenQrScanner();
    const handleArEvent = () => handleOpenArViewer();
    
    // Register event listeners
    document.addEventListener('chatbot:audio', handleAudioEvent);
    document.addEventListener('chatbot:camera', handleCameraEvent);
    document.addEventListener('chatbot:qr', handleQrEvent);
    document.addEventListener('chatbot:ar', handleArEvent);
    
    // Cleanup function
    return () => {
      document.removeEventListener('chatbot:audio', handleAudioEvent);
      document.removeEventListener('chatbot:camera', handleCameraEvent);
      document.removeEventListener('chatbot:qr', handleQrEvent);
      document.removeEventListener('chatbot:ar', handleArEvent);
    };
  }, []);
  
  // Handle sending a new message
  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim()) return;
    
    // Clear the input
    setInputValue("");
    
    // Analyze sentiment
    const sentimentResult = await sentiment.analyze(text);
    
    // Add user message to chat
    addMessage(text, "user", sentimentResult.sentiment, sentimentResult.confidence);
    
    try {
      // Generate AI response
      const response = await generateResponse(text);
      
      // Add bot message to chat
      addMessage(response, "bot");
    } catch (error) {
      console.error("Error generating response:", error);
      
      toast({
        title: "AI Error",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive",
      });
      
      addMessage(
        "Sorry, I encountered an error processing your request. Please try again.", 
        "bot",
        "negative",
        0.9
      );
    }
    
    // Focus the input again
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle key press in input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Tool handlers
  const handleOpenAudioRecorder = () => {
    setActiveToolType('audio');
    // Notify parent component about tool change
    const event = new CustomEvent('chatbot:toolchange', { 
      detail: { tool: 'audio' } 
    });
    document.dispatchEvent(event);
  };
  
  const handleOpenCamera = () => {
    setActiveToolType('camera');
    // Notify parent component about tool change
    const event = new CustomEvent('chatbot:toolchange', { 
      detail: { tool: 'camera' } 
    });
    document.dispatchEvent(event);
  };
  
  const handleOpenQrScanner = () => {
    setActiveToolType('qr');
    // Notify parent component about tool change
    const event = new CustomEvent('chatbot:toolchange', { 
      detail: { tool: 'qr' } 
    });
    document.dispatchEvent(event);
  };
  
  const handleOpenArViewer = () => {
    setActiveToolType('ar');
    // Notify parent component about tool change
    const event = new CustomEvent('chatbot:toolchange', { 
      detail: { tool: 'ar' } 
    });
    document.dispatchEvent(event);
  };
  
  const handleCancelTool = () => {
    setActiveToolType(null);
    // Notify parent component about tool change
    const event = new CustomEvent('chatbot:toolchange', { 
      detail: { tool: null } 
    });
    document.dispatchEvent(event);
  };
  
  const handleAudioCaptured = async (audioBlob: Blob) => {
    try {
      // Process the audio
      const transcribedText = await processSpeechInput(audioBlob);
      
      if (!transcribedText) {
        toast({
          title: "Transcription Error",
          description: "Could not transcribe your audio. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Set the transcribed text to the input
      setInputValue(transcribedText);
      
      // Close the audio recorder
      setActiveToolType(null);
      
      // Auto-send if the text is significant
      if (transcribedText.length > 5) {
        handleSendMessage(transcribedText);
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      toast({
        title: "Audio Processing Error",
        description: "An error occurred while processing your audio.",
        variant: "destructive",
      });
      setActiveToolType(null);
    }
  };
  
  const handleImageCaptured = async (imageBlob: Blob, imageUrl: string) => {
    try {
      // Close camera
      setActiveToolType(null);
      
      // Add user message with image preview
      addMessage(
        `📷 [Image captured for analysis]\n\n<img src="${imageUrl}" alt="Image analysis" style="max-width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px;" />`,
        "user"
      );
      
      // Process the image
      const analysisResult = await processImageInput(imageBlob);
      
      // Add bot response
      addMessage(analysisResult, "bot");
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Image Processing Error",
        description: "An error occurred while analyzing your image.",
        variant: "destructive",
      });
    }
  };
  
  const handleQrCodeScanned = async (qrData: string) => {
    try {
      // Close QR scanner
      setActiveToolType(null);
      
      // Add user message with QR data
      addMessage(`🔍 QR Code scanned: ${qrData}`, "user");
      
      // Process the QR code
      const analysisResult = await processQrCode(qrData);
      
      // Add bot response
      addMessage(analysisResult, "bot");
    } catch (error) {
      console.error("Error processing QR code:", error);
      toast({
        title: "QR Code Processing Error",
        description: "An error occurred while analyzing the QR code.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Active tool overlay */}
      {activeToolType === 'audio' && (
        <div className="absolute inset-0 z-50 bg-background flex flex-col">
          <AudioRecorder onAudioCaptured={handleAudioCaptured} onCancel={handleCancelTool} />
        </div>
      )}
      
      {activeToolType === 'camera' && (
        <div className="absolute inset-0 z-50 bg-background flex flex-col">
          <CameraCapture onImageCaptured={handleImageCaptured} onCancel={handleCancelTool} />
        </div>
      )}
      
      {activeToolType === 'qr' && (
        <div className="absolute inset-0 z-50 bg-background flex flex-col">
          <QrScanner onQrCodeScanned={handleQrCodeScanned} onCancel={handleCancelTool} />
        </div>
      )}
      
      {activeToolType === 'ar' && (
        <div className="absolute inset-0 z-50 bg-background flex flex-col">
          <ArViewer cryptoSymbol={selectedCryptoSymbol} onCancel={handleCancelTool} />
        </div>
      )}
      
      {/* Simple Chat Interface */}
      {!activeToolType && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <ScrollArea 
            ref={chatRef}
            className="flex-1 p-4"
          >
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-3 rounded-lg ${
                    message.role === "user" 
                      ? "bg-primary text-primary-foreground ml-4" 
                      : "bg-card border"
                  }`}>
                    {message.role === "bot" && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                            <path d="M12 2a2 2 0 0 1 2 2v7a2 2 0 1 1-4 0V4a2 2 0 0 1 2-2z" fill="currentColor"/>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2"/>
                            <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </div>
                        <span className="text-xs">CryptoBot</span>
                      </div>
                    )}
                    <div 
                      className="text-sm whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    />
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-card max-w-[85%] p-3 rounded-lg border">
                    <TypingIndicator />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Quick suggestion buttons */}
          <div className="px-4 py-2 flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-8 rounded-full"
              onClick={() => handleSendMessage("What's trending today?")}
            >
              <svg className="mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
              What's trending today?
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-8 rounded-full"
              onClick={() => handleSendMessage("BTC price prediction?")}
            >
              <svg className="mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"></path></svg>
              BTC price prediction?
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-8 rounded-full"
              onClick={() => handleSendMessage("Explain DeFi")}
            >
              <svg className="mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
              Explain DeFi
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-8 rounded-full"
              onClick={() => handleSendMessage("Best altcoins to watch")}
            >
              <svg className="mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              Best altcoins to watch
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-8 rounded-full"
              onClick={() => handleSendMessage("Market sentiment")}
            >
              <svg className="mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
              Market sentiment
            </Button>
          </div>
          
          {/* Input area */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={handleOpenAudioRecorder}
                  disabled={isLoading}
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={handleOpenCamera}
                  disabled={isLoading}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={handleOpenQrScanner}
                  disabled={isLoading}
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
              
              <Input
                ref={inputRef}
                type="text"
                placeholder="Ask about crypto trends, prices, etc."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1"
              />
              <Button
                disabled={!inputValue.trim() || isLoading}
                onClick={() => handleSendMessage()}
                size="icon"
                className="shrink-0 h-10 w-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}