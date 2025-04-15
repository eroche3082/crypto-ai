import { useState, useRef, useEffect } from 'react';
import { MessageCircle, ChevronDown, ChevronUp, Send, X, Mic, Image, Sparkles, Paperclip, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'wouter';
import { SpeechButton } from '@/components/SpeechButton';
import { SpeechRecordButton } from '@/components/SpeechRecordButton';

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
      model: 'vertex-flash'
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
    
    // Add sendAccessCodeEmail to window object for use in HTML string-based onClick
    (window as any).sendAccessCodeEmail = async (accessCode: string) => {
      const userProfile = JSON.parse(localStorage.getItem('cryptoUserProfile') || '{}');
      const name = userProfile.name || '';
      const email = userProfile.email || '';
      const category = userProfile.user_category || '';
      
      if (!email) {
        // Add an error message
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `
<div class="bg-red-100/90 p-4 rounded-lg">
  <div class="flex items-center gap-2 mb-3">
    <div class="h-8 w-8 rounded-full bg-white flex items-center justify-center text-red-600">
      <span class="text-lg font-semibold">!</span>
    </div>
    <h3 class="text-red-800 font-semibold">EMAIL ERROR</h3>
  </div>
  
  <p class="text-red-700 mb-4">Sorry, I couldn't find your email address. Please try again with a valid email.</p>
</div>`,
          timestamp: new Date(),
          model: 'error'
        }]);
        return;
      }
      
      try {
        // Temporarily disable the button
        const emailBtn = document.getElementById('emailCodeBtn');
        if (emailBtn) {
          emailBtn.setAttribute('disabled', 'true');
          emailBtn.textContent = 'Sending email...';
        }
        
        // Send email request to server
        const response = await fetch('/api/email/send-access-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            accessCode,
            category
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to send email');
        }
        
        // Check if we're in simulation mode
        const isSimulation = data.simulation === true;
        
        // Success message
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `
<div class="bg-green-100/90 p-4 rounded-lg">
  <div class="flex items-center gap-2 mb-3">
    <div class="h-8 w-8 rounded-full bg-white flex items-center justify-center text-green-600">
      <span class="text-lg font-semibold">✓</span>
    </div>
    <h3 class="text-green-800 font-semibold">${isSimulation ? 'SIMULATION MODE' : 'EMAIL SENT!'}</h3>
  </div>
  
  <p class="text-green-700 mb-4">${
    isSimulation 
      ? `<strong>NOTE:</strong> SendGrid API key not configured. In a real environment, an email with your access code would be sent to ${email}.`
      : `Your access code has been sent to ${email}. Please check your inbox (and spam folder) for an email from CryptoBot.`
  }</p>
  
  ${isSimulation ? `
  <div class="bg-white p-3 rounded-md mb-4 border border-green-200">
    <p class="text-xs text-green-700 font-medium mb-1">Email would contain:</p>
    <p class="text-xs text-green-600">Your access code: <span class="font-mono font-bold">${accessCode}</span></p>
    <p class="text-xs text-green-600">Instructions to access your personalized dashboard</p>
  </div>
  ` : ''}
</div>`,
          timestamp: new Date(),
          model: 'vertex-flash'
        }]);
        
      } catch (error) {
        console.error('Error sending access code email:', error);
        
        // Error message
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `
<div class="bg-red-100/90 p-4 rounded-lg">
  <div class="flex items-center gap-2 mb-3">
    <div class="h-8 w-8 rounded-full bg-white flex items-center justify-center text-red-600">
      <span class="text-lg font-semibold">!</span>
    </div>
    <h3 class="text-red-800 font-semibold">EMAIL ERROR</h3>
  </div>
  
  <p class="text-red-700 mb-4">There was a problem sending your access code email. Please try again later or contact us at <a href="mailto:contact@socialbrands.ai" class="underline hover:text-red-800">contact@socialbrands.ai</a> for assistance.</p>
</div>`,
          timestamp: new Date(),
          model: 'error'
        }]);
      } finally {
        // Re-enable the button
        const emailBtn = document.getElementById('emailCodeBtn');
        if (emailBtn) {
          emailBtn.removeAttribute('disabled');
          emailBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg><span>Email me my code</span>';
        }
      }
    };
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
        model: 'vertex-flash'
      },
      {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `
<div class="bg-primary/10 p-4 rounded-lg">
  <div class="flex items-center gap-2 mb-3">
    <div class="h-8 w-8 rounded-full bg-white flex items-center justify-center text-primary">
      <span class="text-lg font-semibold">👋</span>
    </div>
    <h3 class="text-primary font-semibold">WELCOME TO CRYPTOBOT</h3>
  </div>
  <p class="text-primary/80 mb-4 text-sm">Let's start with a few quick questions</p>
  
  <p class="font-medium text-primary">${leadCaptureFields[0].question}</p>
</div>`,
        timestamp: new Date(),
        model: 'vertex-flash'
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
          content: `
<div class="bg-primary/10 p-4 rounded-lg">
  <div class="flex items-center gap-2 mb-3">
    <div class="h-8 w-8 rounded-full bg-white flex items-center justify-center text-primary">
      <span class="text-lg font-semibold">✉️</span>
    </div>
    <h3 class="text-primary font-semibold">PERSONALIZATION QUESTIONS</h3>
  </div>
  <p class="text-primary/80 mb-4 text-sm">One more quick question before we start</p>
  
  <p class="font-medium text-primary">${personalizedQuestion}</p>
</div>`,
          timestamp: new Date(),
          model: 'vertex-flash'
        }]);
        
        setIsProcessing(false);
      } else {
        // Lead capture complete, move to main onboarding questions
        setInLeadCapture(false);
        
        // Add transition message
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `
<div class="bg-green-100/90 p-4 rounded-lg">
  <div class="flex items-center gap-2 mb-3">
    <div class="h-8 w-8 rounded-full bg-white flex items-center justify-center text-green-600">
      <span class="text-lg font-semibold">✅</span>
    </div>
    <h3 class="text-green-800 font-semibold">PROFILE CREATION STARTED</h3>
  </div>
  <p class="text-green-800/80 mb-4 text-sm">Thanks, ${updatedLeadData.name}! Now let's personalize your crypto experience with a few more questions.</p>
  <p class="text-green-700 mb-2">For the following questions, you can select multiple options where applicable.</p>
</div>`,
          timestamp: new Date(),
          model: 'vertex-flash'
        }]);
        
        // Display first question with multiple choice options
        const question = onboardingQuestions[0];
        const multiSelectText = question.multiSelect ? 'Choose all that apply:' : 'Choose one:';
        
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `
<div class="bg-primary/10 p-4 rounded-lg">
  <div class="flex items-center gap-2 mb-3">
    <div class="h-8 w-8 rounded-full bg-white flex items-center justify-center text-primary">
      <span class="text-lg font-semibold">?</span>
    </div>
    <h3 class="text-primary font-semibold">PERSONALIZATION QUESTIONS</h3>
  </div>
  <p class="text-primary/80 mb-4 text-sm">Question 1 of ${onboardingQuestions.length}</p>
  
  <p class="font-medium mb-3 text-primary">${question.question}</p>
  <p class="text-sm text-primary/70 mb-1">${multiSelectText}</p>
</div>`,
          timestamp: new Date(),
          model: 'vertex-flash'
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
        const question = onboardingQuestions[nextQuestionIndex];
        const multiSelectText = question.multiSelect ? 'Choose all that apply:' : 'Choose one:';
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `
<div class="bg-primary/10 p-4 rounded-lg">
  <div class="flex items-center gap-2 mb-3">
    <div class="h-8 w-8 rounded-full bg-white flex items-center justify-center text-primary">
      <span class="text-lg font-semibold">?</span>
    </div>
    <h3 class="text-primary font-semibold">PERSONALIZATION QUESTIONS</h3>
  </div>
  <p class="text-primary/80 mb-4 text-sm">Question ${nextQuestionIndex + 1} of ${onboardingQuestions.length}</p>
  
  <p class="font-medium mb-3 text-primary">${question.question}</p>
  <p class="text-sm text-primary/70 mb-1">${multiSelectText}</p>
</div>`,
          timestamp: new Date(),
          model: 'vertex-flash'
        }]);
        
        setIsProcessing(false);
      } else {
        // Onboarding complete
        setIsOnboarding(false);
        
        // Show loading state while analyzing responses and generating code
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Analyzing your responses and generating your personalized access code...`,
          timestamp: new Date(),
          model: 'vertex-flash'
        }]);
        
        // Generate a unique code based on user profile
        const generateUniqueCode = () => {
          // Determine user level based on their responses
          let userLevel = 'BEGINNER';
          
          // Check experience level
          if (selectedOptions[0]?.[0] === 'Expert') {
            userLevel = 'EXPERT';
          } else if (selectedOptions[0]?.[0] === 'Intermediate') {
            userLevel = 'INTER';
          }
          
          // Check investment amount to potentially upgrade level
          if (selectedOptions[3]?.[0] === '$1000+') {
            if (userLevel !== 'EXPERT') userLevel = 'VIP';
          }
          
          // Generate random alphanumeric part (4 digits)
          const randomPart = Math.floor(1000 + Math.random() * 9000);
          
          // Final code format: CRYPTO-[LEVEL]-[RANDOM]
          return `CRYPTO-${userLevel}-${randomPart}`;
        };
        
        // Generate the code
        const uniqueCode = generateUniqueCode();
        
        // Create complete profile data with the unique code
        const profileData = {
          name: leadCaptureData.name || '',
          email: leadCaptureData.email || '',
          crypto_experience_level: selectedOptions[0]?.[0] || '',
          investor_type: selectedOptions[1] || [],
          preferred_cryptocurrencies: selectedOptions[2] || [],
          monthly_investment: selectedOptions[3]?.[0] || '',
          used_platforms: selectedOptions[4] || [],
          insight_preferences: selectedOptions[5] || [],
          alert_preferences: selectedOptions[6]?.[0] || '',
          risk_tolerance: selectedOptions[7]?.[0] || '',
          nft_preferences: selectedOptions[8]?.[0] || '',
          timezone: selectedOptions[9]?.[0] || '',
          onboarding_completed: true,
          unique_code: uniqueCode,
          user_category: uniqueCode.split('-')[1],
          created_at: new Date().toISOString()
        };
        
        // Save to localStorage as fallback
        localStorage.setItem('cryptoUserProfile', JSON.stringify(profileData));
        localStorage.setItem('cryptoAccessCode', uniqueCode);
        
        // Send to backend API
        try {
          const response = await fetch('/api/onboarding/profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData),
          });
          
          if (response.ok) {
            console.log('Onboarding profile saved to database');
          } else {
            console.error('Failed to save onboarding profile to database:', await response.text());
          }
        } catch (error) {
          console.error('Error saving onboarding profile to database:', error);
        }
        
        // Show the unique code after a delay
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `
<div class="bg-indigo-100/90 p-4 rounded-lg">
  <div class="flex items-center gap-2 mb-3">
    <div class="h-8 w-8 rounded-full bg-white flex items-center justify-center text-indigo-600">
      <span class="text-lg font-semibold">🌟</span>
    </div>
    <h3 class="text-indigo-800 font-semibold">PROFILE CREATION COMPLETE</h3>
  </div>
  
  <p class="text-indigo-800 mb-4">Your personalized dashboard is ready!</p>
  
  <div class="bg-gradient-to-br from-white to-indigo-50 p-4 rounded-lg mb-4 border-2 border-indigo-400 text-center shadow-md relative overflow-hidden">
    <div class="absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 bg-indigo-100 rounded-full opacity-30"></div>
    <div class="absolute bottom-0 left-0 w-16 h-16 -ml-8 -mb-8 bg-indigo-100 rounded-full opacity-30"></div>
    
    <p class="text-xs text-indigo-600 mb-1 font-medium uppercase tracking-wider">Your Unique Access Code</p>
    <p class="text-xl font-bold text-indigo-800 tracking-wide font-mono bg-white inline-block px-4 py-1 rounded-md border border-indigo-200 mb-3">${uniqueCode}</p>
    
    <div class="relative">
      <div class="flex justify-center mt-2 mb-1 relative">
        <div class="absolute inset-0 bg-indigo-600 rounded-md opacity-5 transform rotate-3"></div>
        <div class="bg-white shadow-lg rounded-md p-2 z-10 relative">
          <img 
            src="/api/access-code/generate-qr/${uniqueCode}" 
            alt="QR Code" 
            class="w-28 h-28 transition-all duration-300 hover:scale-105" 
            onload="this.classList.add('qr-loaded')"
          />
        </div>
      </div>
      <div class="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md transform rotate-12">
        VERIFIED
      </div>
    </div>
    
    <p class="text-xs text-indigo-500 mt-3 font-medium">Scan this code to access your dashboard</p>
    <p class="text-[10px] text-indigo-400 mt-1">QR code expires in 30 days</p>
  </div>
  
  <p class="text-sm text-indigo-700 mb-2">This code gives you access to personalized features based on your profile.</p>
  <p class="text-xs text-indigo-600 mb-3">You can also use it as a referral code to invite friends.</p>
  
  <div class="bg-indigo-50 p-3 rounded-md border border-indigo-200">
    <p class="text-xs font-medium text-indigo-700 mb-2">📈 Recommended Features for You:</p>
    <ul class="text-xs text-indigo-600 space-y-1.5">
      ${(() => {
        // Define recommended features based on user's profile
        const recommendations = [];
        
        // Add recommendations based on experience level
        if (selectedOptions[0]?.[0] === 'Beginner') {
          recommendations.push('📚 Crypto 101 Education Modules');
          recommendations.push('🔍 Basic Market Analysis Tools');
        } else if (selectedOptions[0]?.[0] === 'Intermediate') {
          recommendations.push('📊 Advanced Chart Analysis');
          recommendations.push('💸 DeFi Yield Comparison');
        } else if (selectedOptions[0]?.[0] === 'Expert') {
          recommendations.push('🤖 Trading Bot Configuration');
          recommendations.push('📈 API-Driven Custom Analytics');
        }
        
        // Add recommendations based on investor type
        if (selectedOptions[1]?.includes('Day Trader')) {
          recommendations.push('⚡ Real-time Price Alerts');
        }
        if (selectedOptions[1]?.includes('HODLer')) {
          recommendations.push('🔒 Cold Storage Security Tips');
        }
        if (selectedOptions[1]?.includes('DeFi')) {
          recommendations.push('🔄 Gas Fee Optimizer');
        }
        if (selectedOptions[1]?.includes('NFT Collector')) {
          recommendations.push('🖼️ NFT Market Analysis');
        }
        
        // Cap at 5 recommendations and ensure at least 3
        const defaultRecommendations = [
          '🔔 Custom Price Alerts',
          '📱 Mobile Notification Setup',
          '📰 Curated Crypto News Feed'
        ];
        
        // Combine and limit recommendations
        let finalRecommendations = [...recommendations];
        
        // Add default recommendations if we have less than 3
        while (finalRecommendations.length < 3) {
          const defaultRec = defaultRecommendations.shift();
          if (defaultRec && !finalRecommendations.includes(defaultRec)) {
            finalRecommendations.push(defaultRec);
          }
        }
        
        // Limit to 5 recommendations
        finalRecommendations = finalRecommendations.slice(0, 5);
        
        // Return as list items
        return finalRecommendations.map(rec => `<li class="flex items-start">
          <span class="block">${rec}</span>
        </li>`).join('');
      })()}
    </ul>
  </div>
</div>`,
            timestamp: new Date(),
            model: 'vertex-flash'
          }]);
          
          // Add the "Login to Dashboard" message after a brief delay
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: (Date.now() + 2).toString(),
              role: 'assistant',
              content: `
<div class="bg-green-100/90 p-4 rounded-lg">
  <div class="flex items-center gap-2 mb-3">
    <div class="h-8 w-8 rounded-full bg-white flex items-center justify-center text-green-600">
      <span class="text-lg font-semibold">🚀</span>
    </div>
    <h3 class="text-green-800 font-semibold">READY TO EXPLORE</h3>
  </div>
  
  <p class="text-green-700 mb-4">Click the button below to access your personalized dashboard with all the features you need.</p>
  
  <button onClick="window.location.href='/dashboard'" class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 mb-3">
    <span>Login to Dashboard</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  </button>
  
  <button id="emailCodeBtn" onClick="window.sendAccessCodeEmail('${uniqueCode}')" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
    <span>Email me my code</span>
  </button>
</div>`,
              timestamp: new Date(),
              model: 'vertex-flash'
            }]);
          }, 1500);
        }, 2000);
        
        setIsProcessing(false);
        
        // Redirect to dashboard after a delay - we'll pass the code as a parameter
        setTimeout(() => {
          // Store the code in session storage for use in the dashboard
          sessionStorage.setItem('cryptoAccessCode', uniqueCode);
          // Redirect to dashboard
          setLocation('/dashboard');
        }, 6000);
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
      const response = await fetch('/api/chat/vertex', {
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
            model: data.model || 'vertex-flash'
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
  // This function now returns the question text only
  const renderOnboardingQuestion = (index: number): string => {
    const question = onboardingQuestions[index];
    const multiSelectText = question.multiSelect ? 'Choose all that apply:' : 'Choose one:';
    
    return `${question.question}\n\n${multiSelectText}`;
  };
  
  // This will indicate if a message contains options that should be rendered as buttons
  const hasOptionsForButtons = (questionIndex: number): boolean => {
    return isOnboarding && !inLeadCapture && questionIndex <= onboardingQuestions.length - 1;
  };
  
  // Handle selection of an option button
  const handleOptionSelect = (option: string) => {
    const currentQuestion = onboardingQuestions[currentQuestionIndex];
    const isMultiSelect = currentQuestion.multiSelect;
    
    // Update selected options
    const updatedOptions = {...selectedOptions};
    
    if (isMultiSelect) {
      // For multi-select, toggle the selection
      if (!updatedOptions[currentQuestionIndex]) {
        updatedOptions[currentQuestionIndex] = [option];
      } else {
        if (updatedOptions[currentQuestionIndex].includes(option)) {
          // Remove option if already selected
          updatedOptions[currentQuestionIndex] = updatedOptions[currentQuestionIndex].filter(opt => opt !== option);
        } else {
          // Add option if not selected
          updatedOptions[currentQuestionIndex] = [...updatedOptions[currentQuestionIndex], option];
        }
      }
      
      setSelectedOptions(updatedOptions);
    } else {
      // For single-select, select the option and move to next question
      updatedOptions[currentQuestionIndex] = [option];
      setSelectedOptions(updatedOptions);
      
      // Add user message showing their selection
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'user',
        content: option,
        timestamp: new Date()
      }]);
      
      // Move to next question or finish onboarding
      handleContinueAfterSelection();
    }
  };

  // Function to continue to the next question after option selection
  const handleContinueAfterSelection = () => {
    // Move to the next question or complete the onboarding
    if (currentQuestionIndex < onboardingQuestions.length - 1) {
      // Ask next question
      const nextQuestionIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextQuestionIndex);
      
      // Add next question with options as a message
      const question = onboardingQuestions[nextQuestionIndex];
      const multiSelectText = question.multiSelect ? 'Choose all that apply:' : 'Choose one:';
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `
<div class="bg-primary/10 p-4 rounded-lg">
  <div class="flex items-center gap-2 mb-3">
    <div class="h-8 w-8 rounded-full bg-white flex items-center justify-center text-primary">
      <span class="text-lg font-semibold">?</span>
    </div>
    <h3 class="text-primary font-semibold">PERSONALIZATION QUESTIONS</h3>
  </div>
  <p class="text-primary/80 mb-4 text-sm">Question ${nextQuestionIndex + 1} of ${onboardingQuestions.length}</p>
  
  <p class="font-medium mb-3 text-primary">${question.question}</p>
  <p class="text-sm text-primary/70 mb-1">${multiSelectText}</p>
</div>`,
        timestamp: new Date(),
        model: 'vertex-flash'
      }]);
    } else {
      // Onboarding complete
      setIsOnboarding(false);
      
      // Show loading state while analyzing responses and generating code
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `
<div class="bg-blue-100/90 p-4 rounded-lg">
  <div class="flex items-center gap-3 mb-3">
    <div class="h-8 w-8 rounded-full bg-white flex items-center justify-center text-blue-600">
      <span class="animate-spin text-lg">⚙️</span>
    </div>
    <h3 class="text-blue-800 font-semibold">PROCESSING PROFILE DATA</h3>
  </div>
  <p class="text-blue-700 mb-2">Analyzing your responses and generating your personalized access code...</p>
  <div class="w-full bg-white rounded-full h-2 mt-3">
    <div class="bg-blue-500 h-2 rounded-full animate-pulse" style="width: 75%"></div>
  </div>
</div>`,
        timestamp: new Date(),
        model: 'vertex-flash'
      }]);
      
      // Generate a unique code based on user profile
      const generateUniqueCode = () => {
        // Determine user level based on their responses
        let userLevel = 'BEGINNER';
        
        // Check experience level
        if (selectedOptions[0]?.[0] === 'Expert') {
          userLevel = 'EXPERT';
        } else if (selectedOptions[0]?.[0] === 'Intermediate') {
          userLevel = 'INTER';
        }
        
        // Check investment amount to potentially upgrade level
        if (selectedOptions[3]?.[0] === '$1000+') {
          if (userLevel !== 'EXPERT') userLevel = 'VIP';
        }
        
        // Generate random alphanumeric part (4 digits)
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        
        // Final code format: CRYPTO-[LEVEL]-[RANDOM]
        return `CRYPTO-${userLevel}-${randomPart}`;
      };
      
      // Generate the code
      const uniqueCode = generateUniqueCode();
      
      // Create complete profile data with the unique code
      const profileData = {
        name: leadCaptureData.name || '',
        email: leadCaptureData.email || '',
        crypto_experience_level: selectedOptions[0]?.[0] || '',
        investor_type: selectedOptions[1] || [],
        preferred_cryptocurrencies: selectedOptions[2] || [],
        monthly_investment: selectedOptions[3]?.[0] || '',
        used_platforms: selectedOptions[4] || [],
        insight_preferences: selectedOptions[5] || [],
        alert_preferences: selectedOptions[6]?.[0] || '',
        risk_tolerance: selectedOptions[7]?.[0] || '',
        nft_preferences: selectedOptions[8]?.[0] || '',
        timezone: selectedOptions[9]?.[0] || '',
        onboarding_completed: true,
        unique_code: uniqueCode,
        user_category: uniqueCode.split('-')[1],
        created_at: new Date().toISOString()
      };
      
      // Save to localStorage as fallback
      localStorage.setItem('cryptoUserProfile', JSON.stringify(profileData));
      localStorage.setItem('cryptoAccessCode', uniqueCode);
      
      // Send to backend API
      fetch('/api/onboarding/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })
      .then(response => {
        if (response.ok) {
          console.log('Onboarding profile saved to database');
        } else {
          console.error('Failed to save onboarding profile to database:', response.statusText);
        }
      })
      .catch(error => {
        console.error('Error saving onboarding profile to database:', error);
      });
      
      // Generate QR code for dashboard access
      const dashboardUrl = `${window.location.origin}/dashboard?code=${uniqueCode}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(dashboardUrl)}&size=200x200`;
      
      // Show the unique code and QR code after a delay
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `<div class="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-4">
  <div class="flex items-center gap-2 p-2 mb-3">
    <div class="h-8 w-8 rounded-full bg-white flex items-center justify-center text-indigo-600">
      <span class="text-lg font-semibold">🌟</span>
    </div>
    <h3 class="text-indigo-800 font-semibold">PROFILE CREATION COMPLETE</h3>
  </div>
  
  <p class="text-indigo-800 mb-4">Your personalized dashboard is ready!</p>
  
  <div class="bg-white p-3 rounded-md mb-4 border-2 border-indigo-400 text-center">
    <p class="text-xs text-indigo-600 mb-1">Your Unique Access Code</p>
    <p class="text-lg font-bold text-indigo-800">${uniqueCode}</p>
    <div class="flex justify-center mt-3">
      <img src="${qrCodeUrl}" alt="QR Code" class="w-24 h-24" />
    </div>
    <p class="text-xs text-indigo-500 mt-1">Scan this code to access your dashboard</p>
  </div>
  
  <p class="text-sm text-indigo-700 mb-2">This code gives you access to personalized features based on your profile.</p>
  <p class="text-xs text-indigo-600 mb-3">You can also use it as a referral code to invite friends.</p>
</div>`,
          timestamp: new Date(),
          model: 'vertex-flash'
        }]);
        
        // Add the "Login to Dashboard" message after a brief delay
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: 'Login to Dashboard',
            timestamp: new Date(),
            model: 'vertex-flash'
          }]);
        }, 1500);
        
        // Save the QR code URL to the database for the profile
        fetch(`/api/access-code/generate-qr/${uniqueCode}`)
          .then(response => {
            if (!response.ok) {
              console.error('Failed to generate QR code in the database');
            }
          })
          .catch(error => {
            console.error('Error generating QR code:', error);
          });
          
      }, 2000);
      
      // Redirect to dashboard after a delay - we'll pass the code as a parameter
      setTimeout(() => {
        // Store the code in session storage for use in the dashboard
        sessionStorage.setItem('cryptoAccessCode', uniqueCode);
        // Redirect to dashboard
        setLocation('/dashboard');
      }, 6000);
    }
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
                                <>
                                  <p 
                                    className="text-sm whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{__html: message.content}}
                                  ></p>
                                  
                                  {/* Add option buttons for onboarding questions */}
                                  {isOnboarding && !inLeadCapture && message === messages[messages.length - 1] && message.role === 'assistant' && currentQuestionIndex < onboardingQuestions.length && (
                                    <div className="mt-4 bg-primary/10 p-4 rounded-lg -mx-2">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-primary">
                                          <span className="text-lg font-semibold">?</span>
                                        </div>
                                        <h3 className="text-primary font-semibold">PERSONALIZATION QUESTIONS</h3>
                                      </div>
                                      <p className="text-primary/80 mb-4 text-sm">Let's customize your crypto experience</p>
                                      
                                      <p className="font-medium mb-3 text-primary">{onboardingQuestions[currentQuestionIndex].question}</p>
                                      
                                      <div className="grid gap-2">
                                        {onboardingQuestions[currentQuestionIndex].options.map((option, idx) => {
                                          const isSelected = selectedOptions[currentQuestionIndex]?.includes(option);
                                          return (
                                            <button
                                              key={idx}
                                              onClick={() => handleOptionSelect(option)}
                                              className={`text-sm text-left px-4 py-3 rounded-lg border transition-all ${
                                                isSelected 
                                                  ? 'bg-primary/20 border-primary text-primary-foreground' 
                                                  : 'bg-white border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-primary/90'
                                              }`}
                                            >
                                              {option}
                                            </button>
                                          );
                                        })}
                                        
                                        {/* Show continue button for multi-select options */}
                                        {onboardingQuestions[currentQuestionIndex].multiSelect && selectedOptions[currentQuestionIndex]?.length > 0 && (
                                          <button
                                            onClick={handleContinueAfterSelection}
                                            className="mt-2 flex items-center justify-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
                                          >
                                            Continue <ArrowRight size={14} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Add 'Login to Dashboard' button for the final message */}
                                  {message.content === 'Login to Dashboard' && (
                                    <Button 
                                      className="mt-2 gap-2"
                                      onClick={() => setLocation('/dashboard')}
                                    >
                                      Login to Dashboard <ArrowRight size={16} />
                                    </Button>
                                  )}
                                </>
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
                          <SpeechRecordButton 
                            compact
                            variant="ghost" 
                            className="h-7 w-7 rounded-full"
                            onTranscriptionComplete={(text) => {
                              // When speech is transcribed, add it to the input
                              setInputMessage(prev => {
                                // If there's already text, add a space before adding the new transcription
                                const space = prev.trim() ? ' ' : '';
                                return prev + space + text;
                              });
                            }}
                            onRecordingStart={() => {
                              // Optional feedback when recording starts
                            }}
                            onRecordingEnd={() => {
                              // Optional feedback when recording ends
                            }}
                          />
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
                        Powered by Google Vertex Flash, OpenAI & Anthropic APIs
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
                              <option>Vertex Flash</option>
                              <option>Gemini Flash</option>
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