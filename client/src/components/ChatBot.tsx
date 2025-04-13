import { useState, useRef, useEffect } from 'react';
import { MessageCircle, ChevronDown, ChevronUp, Send, X, Mic, Image, Sparkles, Paperclip, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  processing?: boolean;
  images?: string[];
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi there! I\'m CryptoBot, your AI assistant for all things cryptocurrency. How can I help you today?',
      timestamp: new Date(),
      model: 'gemini-pro'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedTab, setSelectedTab] = useState('chat');
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    // Placeholder for assistant message while processing
    const tempId = Date.now().toString() + '-temp';
    setMessages(prev => [...prev, {
      id: tempId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      processing: true
    }]);

    try {
      // Send to backend API
      const response = await fetch('/api/chat/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          history: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();

      // Replace temporary message with actual response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.response,
            timestamp: new Date(),
            model: 'gemini-pro'
          } : msg
        )
      );
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Update the temporary message to show error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
            timestamp: new Date(),
            model: 'error'
          } : msg
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const specialistFeatures = [
    { name: 'Portfolio Advisor', icon: '📊' },
    { name: 'Market Sentiment', icon: '🧠' },
    { name: 'Price Alerts', icon: '🔔' },
    { name: 'Chart Analysis', icon: '📈' },
    { name: 'Trading Strategy', icon: '⚙️' },
    { name: 'News Summary', icon: '📰' },
    { name: 'Tax Calculator', icon: '💵' },
    { name: 'Educational Content', icon: '📚' },
    { name: 'Wallet Security', icon: '🔒' },
    { name: 'Asset Converter', icon: '💱' },
    { name: 'Diversification Guide', icon: '🧩' },
    { name: 'Token Analysis', icon: '🔍' },
    { name: 'DeFi Yields', icon: '💸' },
    { name: 'NFT Evaluation', icon: '🖼️' },
    { name: 'Regulatory Updates', icon: '📋' },
    { name: 'Risk Assessment', icon: '🛡️' },
    { name: 'Trading Bot Config', icon: '🤖' },
    { name: 'Gas Optimizer', icon: '⛽' },
    { name: 'Voice Analysis', icon: '🎤' },
    { name: 'Learning Path', icon: '🧭' },
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg z-50 bg-indigo-600 hover:bg-indigo-700 p-0"
        >
          <MessageCircle size={24} />
        </Button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md flex flex-col shadow-xl rounded-xl border border-border bg-background">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary mr-3">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="font-medium text-sm">CryptoBot Assistant</h3>
                <p className="text-xs text-muted-foreground">AI-powered crypto insights</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X size={16} />
              </Button>
            </div>
          </div>

          {isExpanded && (
            <>
              {/* Tabs */}
              <Tabs defaultValue="chat" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="w-full px-4 py-2 justify-start border-b border-border rounded-none gap-2">
                  <TabsTrigger value="chat" className="rounded-md text-xs h-7 px-2">Chat</TabsTrigger>
                  <TabsTrigger value="specialists" className="rounded-md text-xs h-7 px-2">Specialists</TabsTrigger>
                  <TabsTrigger value="settings" className="rounded-md text-xs h-7 px-2">Settings</TabsTrigger>
                </TabsList>
                
                {/* Chat Tab */}
                <TabsContent value="chat" className="flex flex-col h-[30rem] pt-0 pb-0 px-0 m-0">
                  {/* Messages Section */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          {/* Avatar */}
                          {message.role === 'assistant' ? (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/20 text-primary">AI</AvatarFallback>
                            </Avatar>
                          ) : (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-secondary text-secondary-foreground">U</AvatarFallback>
                            </Avatar>
                          )}
                          
                          {/* Message Content */}
                          <div>
                            <div className={`relative px-3 py-2 rounded-lg ${
                              message.role === 'assistant' 
                                ? 'bg-muted text-foreground' 
                                : 'bg-primary text-primary-foreground'
                              }`}
                            >
                              {message.processing ? (
                                <div className="flex items-center gap-2 h-6">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span className="text-xs">Thinking...</span>
                                </div>
                              ) : (
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              )}
                            </div>
                            <div className={`flex mt-1 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <time className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</time>
                              {message.model && (
                                <Badge variant="outline" className="ml-2 h-4 px-1 text-[10px]">
                                  {message.model}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Input Section */}
                  <div className="p-3 border-t border-border">
                    <div className="flex items-end gap-2">
                      <div className="flex-1 relative">
                        <Textarea 
                          placeholder="Ask me anything about crypto..."
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="min-h-[60px] py-3 resize-none pr-24"
                          rows={1}
                        />
                        <div className="absolute bottom-2 right-2 flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                            <Paperclip size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                            <Image size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                            <Mic size={14} />
                          </Button>
                        </div>
                      </div>
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={!inputMessage.trim() || isProcessing}
                        size="icon"
                        className="h-10 w-10 rounded-full bg-primary"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send size={16} />
                        )}
                      </Button>
                    </div>
                    <div className="flex justify-center mt-3">
                      <p className="text-[10px] text-muted-foreground">
                        Powered by Google Gemini, OpenAI & Anthropic APIs
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Specialists Tab */}
                <TabsContent value="specialists" className="h-[30rem] overflow-y-auto pt-0 px-0 m-0">
                  <div className="p-4">
                    <h3 className="text-sm font-medium mb-3">AI Specialists</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Access 20 specialized AI assistants with expertise in specific crypto areas.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {specialistFeatures.map((feature, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="h-auto justify-start py-2 text-left"
                          onClick={() => {
                            setSelectedTab('chat');
                            setInputMessage(`Use the ${feature.name} specialist to help me with `);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="text-lg">{feature.icon}</div>
                            <div className="text-xs font-medium">{feature.name}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                {/* Settings Tab */}
                <TabsContent value="settings" className="h-[30rem] overflow-y-auto pt-0 px-0 m-0">
                  <div className="p-4">
                    <h3 className="text-sm font-medium mb-3">AI Assistant Settings</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Customize your AI assistant experience.
                    </p>
                    
                    <div className="space-y-4">
                      <Card className="p-3">
                        <h4 className="text-xs font-medium mb-2">Model Preferences</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs">Default AI Model</label>
                            <select className="text-xs border border-input bg-background rounded-md h-8 px-2">
                              <option>Gemini Pro</option>
                              <option>Claude</option>
                              <option>GPT-4o</option>
                            </select>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-3">
                        <h4 className="text-xs font-medium mb-2">Personalization</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs">Experience Level</label>
                            <select className="text-xs border border-input bg-background rounded-md h-8 px-2">
                              <option>Beginner</option>
                              <option>Intermediate</option>
                              <option>Advanced</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-xs">Answer Length</label>
                            <select className="text-xs border border-input bg-background rounded-md h-8 px-2">
                              <option>Concise</option>
                              <option>Balanced</option>
                              <option>Detailed</option>
                            </select>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-3">
                        <h4 className="text-xs font-medium mb-2">Privacy & Data</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs">Store Conversation History</label>
                            <div className="h-4 w-8 bg-primary rounded-full relative">
                              <div className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white"></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-xs">Improve AI with my queries</label>
                            <div className="h-4 w-8 bg-primary rounded-full relative">
                              <div className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white"></div>
                            </div>
                          </div>
                        </div>
                      </Card>
                      
                      <Button variant="outline" className="w-full" size="sm">
                        Clear Conversation History
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      )}
    </>
  );
}