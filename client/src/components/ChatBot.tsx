import { useState, useRef, useEffect } from 'react';
import { MessageCircle, ChevronDown, ChevronUp, Send, X, Mic, Image, Sparkles, Paperclip, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'wouter';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  processing?: boolean;
  images?: string[];
}

// Define the lead capture fields first - exactly as specified in the MEGAPROMPT
const leadCaptureFields = [
  { id: 'name', question: "Welcome to CryptoAI! What's your name?", type: "text" },
  { id: 'email', question: "Great to meet you, [name]! What's your email address?", type: "email" }
];

// Define the onboarding questions exactly as specified in MEGAPROMPT (10 questions)
const onboardingQuestions = [
  {
    question: "What is your current crypto experience level?",
    options: ["Beginner", "Intermediate", "Expert"],
    multiSelect: false
  },
  {
    question: "What type of investor are you?",
    options: ["Day Trader", "HODLer", "DeFi", "NFT Collector", "Long-Term Analyst"],
    multiSelect: true
  },
  {
    question: "Which coins are you most interested in?",
    options: ["BTC", "ETH", "SOL", "ADA", "MATIC", "XRP", "Other"],
    multiSelect: true
  },
  {
    question: "How much do you currently invest monthly?",
    options: ["<$100", "$100–$500", "$500–$1000", "$1000+"],
    multiSelect: false
  },
  {
    question: "What platforms do you use?",
    options: ["Binance", "Coinbase", "Kraken", "MetaMask", "Other"],
    multiSelect: true
  },
  {
    question: "What kind of insights are you seeking?",
    options: ["Market Predictions", "Portfolio Analytics", "Alerts", "Learning"],
    multiSelect: true
  },
  {
    question: "Do you want real-time alerts?",
    options: ["Yes (SMS)", "Yes (Email)", "No"],
    multiSelect: false
  },
  {
    question: "What is your risk tolerance?",
    options: ["Low", "Moderate", "High"],
    multiSelect: false
  },
  {
    question: "Are you interested in NFTs or token projects?",
    options: ["NFTs Only", "Tokens Only", "Both", "Not Interested"],
    multiSelect: false
  },
  {
    question: "What timezone do you trade in?",
    options: ["UTC-12 to UTC-8 (Pacific)", "UTC-7 to UTC-5 (Americas)", "UTC-4 to UTC-0 (Eastern Americas/Western Europe)", "UTC+1 to UTC+3 (Europe/Africa)", "UTC+4 to UTC+6 (Middle East/Central Asia)", "UTC+7 to UTC+9 (Asia)", "UTC+10 to UTC+14 (Australia/Pacific)"],
    multiSelect: false
  }
];

interface ChatBotProps {
  startOnboardingRef?: React.MutableRefObject<(() => void) | null>;
}

export default function ChatBot({ startOnboardingRef }: ChatBotProps = {}) {
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
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [onboardingAnswers, setOnboardingAnswers] = useState<string[]>([]);
  const [, setLocation] = useLocation();

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);
  
  // Expose the startOnboarding function to the parent component
  useEffect(() => {
    if (startOnboardingRef) {
      startOnboardingRef.current = startOnboarding;
    }
  }, [startOnboardingRef]);
  
  // State for onboarding data
  const [leadCaptureData, setLeadCaptureData] = useState<{[key: string]: string}>({});
  const [inLeadCapture, setInLeadCapture] = useState(false);
  const [leadQuestionIndex, setLeadQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<{[key: number]: string[]}>({});

  // Function to start the onboarding process
  const startOnboarding = () => {
    setIsOnboarding(true);
    setInLeadCapture(true);
    setIsOpen(true);
    setIsExpanded(true);
    setSelectedTab('chat');
    setLeadQuestionIndex(0);
    setCurrentQuestionIndex(0);
    setOnboardingAnswers([]);
    setLeadCaptureData({});
    setSelectedOptions({});
    
    // Start with welcome message and first lead capture question
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Hi there! Welcome to CryptoBot. I'm your AI Assistant. Let's personalize your experience.",
        timestamp: new Date(),
        model: 'gemini-pro'
      },
      {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: leadCaptureFields[0].question,
        timestamp: new Date(),
        model: 'gemini-pro'
      }
    ]);
  };

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

    // Check if we're in the lead capture phase
    if (isOnboarding && inLeadCapture) {
      // Save lead capture data
      const updatedLeadData = {...leadCaptureData};
      updatedLeadData[leadCaptureFields[leadQuestionIndex].id] = userMessage.content;
      setLeadCaptureData(updatedLeadData);
      
      // Move to next lead capture question or start main onboarding
      if (leadQuestionIndex < leadCaptureFields.length - 1) {
        const nextLeadIndex = leadQuestionIndex + 1;
        setLeadQuestionIndex(nextLeadIndex);
        
        // Personalize the email question with the user's name
        let personalizedQuestion = leadCaptureFields[nextLeadIndex].question;
        if (leadCaptureFields[nextLeadIndex].id === 'email' && updatedLeadData.name) {
          personalizedQuestion = personalizedQuestion.replace('[name]', updatedLeadData.name);
        }
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: personalizedQuestion,
          timestamp: new Date(),
          model: 'gemini-pro'
        }]);
        
        setIsProcessing(false);
      } else {
        // Lead capture complete, move to main onboarding questions
        setInLeadCapture(false);
        
        // Add transition message
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Thanks, ${updatedLeadData.name}! Now let's personalize your crypto experience with a few more questions. For the following questions, you can select multiple options where applicable.`,
          timestamp: new Date(),
          model: 'gemini-pro'
        }]);
        
        // Display first question with multiple choice options
        const questionContent = renderOnboardingQuestion(0);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: questionContent,
          timestamp: new Date(),
          model: 'gemini-pro'
        }]);
        
        setIsProcessing(false);
      }
      return;
    }
    
    // Check if we're in the main onboarding questions phase
    if (isOnboarding && !inLeadCapture) {
      // In the actual implementation, this should handle the selection from buttons
      // For now, we'll just save the text input as the answer
      
      // Save the answer 
      const updatedOptions = {...selectedOptions};
      updatedOptions[currentQuestionIndex] = [userMessage.content];
      setSelectedOptions(updatedOptions);
      
      // Move to the next question or complete the onboarding
      if (currentQuestionIndex < onboardingQuestions.length - 1) {
        // Ask next question
        const nextQuestionIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextQuestionIndex);
        
        // Add next question with options as a message
        const questionContent = renderOnboardingQuestion(nextQuestionIndex);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: questionContent,
          timestamp: new Date(),
          model: 'gemini-pro'
        }]);
        
        setIsProcessing(false);
      } else {
        // Onboarding complete
        setIsOnboarding(false);
        
        // Add completion message exactly as specified in MEGAPROMPT
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Your personalized CryptoAI profile is ready.`,
          timestamp: new Date(),
          model: 'gemini-pro'
        }]);
        
        // Add login button as a separate message
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Login to Dashboard',
            timestamp: new Date(),
            model: 'gemini-pro'
          }]);
        }, 1000);
        
        // Save complete profile data to localStorage (in a real app, send to backend/Firebase)
        const profileData = {
          leadCapture: leadCaptureData,
          preferences: selectedOptions,
          onboardingComplete: true,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('cryptoUserProfile', JSON.stringify(profileData));
        
        // Here we would also store the lead info in the database for the admin panel
        
        setIsProcessing(false);
        
        // Redirect to dashboard after a delay
        setTimeout(() => {
          // Use the original dashboard route
          setLocation('/dashboard');
        }, 4000);
      }
      return;
    }

    // If not in onboarding, proceed with normal chat
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
      const errorMessage = error.response?.data?.error || 'Sorry, I encountered an error. Please try again.';
      const errorDetails = error.response?.data?.details || '';
      const displayError = errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage;
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? {
            id: Date.now().toString(),
            role: 'assistant',
            content: displayError,
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
  
  // Function to render onboarding question with options
  const renderOnboardingQuestion = (index: number): string => {
    const question = onboardingQuestions[index];
    const multiSelectText = question.multiSelect ? 'Choose all that apply:' : 'Choose one:';
    
    // Format the options as a numbered list
    const optionsText = question.options.map((option, i) => 
      `${i+1}. ${option}`
    ).join('\n');
    
    return `${question.question}\n\n${multiSelectText}\n${optionsText}`;
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
          data-chat-toggle="true"
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