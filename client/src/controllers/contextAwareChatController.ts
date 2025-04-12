/**
 * Context-Aware Chat Controller
 * 
 * Client-side controller for handling context-aware chat interactions
 * with the AI. This controller manages message history, context,
 * and UI state for the chat interface.
 */

import { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { sendContextAwareMessage, ChatRequestConfig } from '@/services/contextAwareChatService';
import { addMessageToContext, getRecentMessages } from '@/utils/chatContextManager';

// Chat message type
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp: string;
  provider?: string;
  isLoading?: boolean;
}

// Custom hook for managing chat state
export function useContextAwareChat() {
  // Chat messages state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Input value state
  const [inputValue, setInputValue] = useState('');
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  // Error state
  const [error, setError] = useState<string | null>(null);
  // AI Provider being used
  const [currentProvider, setCurrentProvider] = useState<string>('auto');
  
  // Load messages from context
  useEffect(() => {
    const contextMessages = getRecentMessages();
    
    if (contextMessages.length > 0) {
      // Convert context messages to chat messages
      const chatMessages: ChatMessage[] = contextMessages.map(msg => ({
        id: Date.now() + Math.random().toString(),
        role: msg.role as 'user' | 'assistant' | 'system' | 'error',
        content: msg.content,
        timestamp: msg.timestamp,
      }));
      
      setMessages(chatMessages);
    }
  }, []);
  
  // Chat mutation for API calls
  const chatMutation = useMutation({
    mutationFn: async ({ message, config }: { message: string, config?: ChatRequestConfig }) => {
      return sendContextAwareMessage(message, config);
    },
    onMutate: (variables) => {
      // Optimistically add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: variables.message,
        timestamp: new Date().toISOString(),
      };
      
      // Add loading message for assistant
      const loadingMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isLoading: true,
      };
      
      setMessages(prev => [...prev, userMessage, loadingMessage]);
      setIsLoading(true);
      setError(null);
      
      // Add to context
      addMessageToContext('user', variables.message);
      
      return { userMessage, loadingMessage };
    },
    onSuccess: (data, variables, context) => {
      // Update loading message with response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === context?.loadingMessage.id
            ? {
                ...msg,
                content: data.text,
                provider: data.provider,
                isLoading: false,
              }
            : msg
        )
      );
      
      // Set current provider
      setCurrentProvider(data.provider);
      
      // Add to context
      addMessageToContext('assistant', data.text);
      setIsLoading(false);
    },
    onError: (error, variables, context) => {
      console.error('Error in chat mutation:', error);
      
      // Update loading message with error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === context?.loadingMessage.id
            ? {
                ...msg,
                role: 'error',
                content: 'Sorry, there was an error processing your request. Please try again.',
                isLoading: false,
              }
            : msg
        )
      );
      
      setError(error.message);
      setIsLoading(false);
    },
  });
  
  // Send message handler
  const sendMessage = useCallback((message: string, config?: ChatRequestConfig) => {
    if (!message.trim()) return;
    
    chatMutation.mutate({ message, config });
    setInputValue('');
  }, [chatMutation]);
  
  // Clear chat handler
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);
  
  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    error,
    currentProvider,
    sendMessage,
    clearChat,
  };
}

export type { ChatRequestConfig };