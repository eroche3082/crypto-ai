import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { TranslatableText } from '../language/TranslatableText';
import { Bot, User, Mail, Star, HelpCircle, CheckCircle } from 'lucide-react';

interface ChatbotOnboardingProps {
  language?: string;
  onComplete: (userData: UserProfile) => void;
  onSkip: () => void;
}

export interface UserProfile {
  name: string;
  email: string;
  experience: string;
  interests: string[];
  exchanges: string[];
  goals: string;
  preferredCrypto: string[];
}

// We're creating a simple step-based onboarding flow
export default function ChatbotOnboarding({ 
  language = 'en', 
  onComplete,
  onSkip
}: ChatbotOnboardingProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    experience: 'beginner', // beginner, intermediate, expert
    interests: [],
    exchanges: [],
    goals: '',
    preferredCrypto: []
  });
  
  const { toast } = useToast();
  const totalSteps = 7;
  
  // Handle input changes
  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle array-based inputs (checkboxes, etc.)
  const handleArrayInput = (field: 'interests' | 'exchanges' | 'preferredCrypto', value: string, checked: boolean) => {
    if (checked) {
      setProfile(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [field]: prev[field].filter(item => item !== value)
      }));
    }
  };
  
  // Move to next step if validation passes
  const nextStep = () => {
    // Basic validation for each step
    if (step === 1 && !profile.name.trim()) {
      toast({
        title: <TranslatableText text="Name Required" spanish="Nombre Requerido" language={language} />,
        description: <TranslatableText 
          text="Please enter your name to continue."
          spanish="Por favor ingresa tu nombre para continuar."
          language={language}
        />,
        variant: "destructive"
      });
      return;
    }
    
    if (step === 2 && !profile.email.trim()) {
      toast({
        title: <TranslatableText text="Email Required" spanish="Correo Requerido" language={language} />,
        description: <TranslatableText 
          text="Please enter your email to continue."
          spanish="Por favor ingresa tu correo para continuar."
          language={language}
        />,
        variant: "destructive"
      });
      return;
    }
    
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    } else {
      // Complete onboarding and pass data to parent
      onComplete(profile);
    }
  };
  
  // Go back to previous step
  const prevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };
  
  // Interest options for crypto platform
  const interestOptions = [
    { value: 'trading', label: { en: 'Trading', es: 'Trading' } },
    { value: 'investment', label: { en: 'Long-term Investment', es: 'Inversión a largo plazo' } },
    { value: 'defi', label: { en: 'DeFi', es: 'DeFi' } },
    { value: 'nft', label: { en: 'NFTs', es: 'NFTs' } },
    { value: 'staking', label: { en: 'Staking', es: 'Staking' } },
    { value: 'mining', label: { en: 'Mining', es: 'Minería' } },
    { value: 'news', label: { en: 'Crypto News', es: 'Noticias de Cripto' } },
    { value: 'education', label: { en: 'Learning', es: 'Aprendizaje' } }
  ];
  
  // Exchange options
  const exchangeOptions = [
    { value: 'binance', label: 'Binance' },
    { value: 'coinbase', label: 'Coinbase' },
    { value: 'kraken', label: 'Kraken' },
    { value: 'kucoin', label: 'KuCoin' },
    { value: 'ftx', label: 'FTX' },
    { value: 'gemini', label: 'Gemini' },
    { value: 'bitstamp', label: 'Bitstamp' },
    { value: 'bitfinex', label: 'Bitfinex' },
    { value: 'other', label: { en: 'Other', es: 'Otro' } }
  ];
  
  // Popular crypto options
  const cryptoOptions = [
    { value: 'BTC', label: 'Bitcoin (BTC)' },
    { value: 'ETH', label: 'Ethereum (ETH)' },
    { value: 'USDT', label: 'Tether (USDT)' },
    { value: 'BNB', label: 'Binance Coin (BNB)' },
    { value: 'ADA', label: 'Cardano (ADA)' },
    { value: 'SOL', label: 'Solana (SOL)' },
    { value: 'XRP', label: 'XRP (XRP)' },
    { value: 'DOT', label: 'Polkadot (DOT)' },
    { value: 'DOGE', label: 'Dogecoin (DOGE)' },
    { value: 'AVAX', label: 'Avalanche (AVAX)' }
  ];
  
  // Experience level options
  const experienceOptions = [
    { value: 'beginner', label: { en: 'Beginner', es: 'Principiante' } },
    { value: 'intermediate', label: { en: 'Intermediate', es: 'Intermedio' } },
    { value: 'expert', label: { en: 'Expert', es: 'Experto' } }
  ];
  
  // Render the appropriate step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">
                <TranslatableText 
                  text="What's your name?"
                  spanish="¿Cuál es tu nombre?" 
                  language={language}
                />
              </h3>
            </div>
            <Input
              placeholder={language === 'en' ? "Enter your name" : "Ingresa tu nombre"}
              value={profile.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Mail className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">
                <TranslatableText 
                  text={`Nice to meet you, ${profile.name}! What's your email?`}
                  spanish={`¡Encantado de conocerte, ${profile.name}! ¿Cuál es tu correo electrónico?`}
                  language={language}
                />
              </h3>
            </div>
            <Input
              type="email"
              placeholder={language === 'en' ? "Enter your email" : "Ingresa tu correo electrónico"}
              value={profile.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Star className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">
                <TranslatableText 
                  text="What's your experience level with cryptocurrency?"
                  spanish="¿Cuál es tu nivel de experiencia con criptomonedas?"
                  language={language}
                />
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {experienceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleInputChange('experience', option.value)}
                  className={`p-3 rounded-md border transition-colors ${
                    profile.experience === option.value 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-card hover:bg-accent'
                  }`}
                >
                  <TranslatableText 
                    text={option.label.en}
                    spanish={option.label.es}
                    language={language}
                  />
                </button>
              ))}
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">
                <TranslatableText 
                  text="What are you interested in?"
                  spanish="¿En qué estás interesado?"
                  language={language}
                />
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {interestOptions.map((interest) => (
                <label
                  key={interest.value}
                  className="flex items-center space-x-2 p-2 rounded-md border hover:bg-accent cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={profile.interests.includes(interest.value)}
                    onChange={(e) => handleArrayInput('interests', interest.value, e.target.checked)}
                  />
                  <span>
                    <TranslatableText 
                      text={interest.label.en}
                      spanish={interest.label.es}
                      language={language}
                    />
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">
                <TranslatableText 
                  text="Which exchanges do you use?"
                  spanish="¿Qué exchanges utilizas?"
                  language={language}
                />
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {exchangeOptions.map((exchange) => (
                <label
                  key={exchange.value}
                  className="flex items-center space-x-2 p-2 rounded-md border hover:bg-accent cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={profile.exchanges.includes(exchange.value)}
                    onChange={(e) => handleArrayInput('exchanges', exchange.value, e.target.checked)}
                  />
                  <span>
                    {typeof exchange.label === 'string' 
                      ? exchange.label 
                      : <TranslatableText 
                          text={exchange.label.en}
                          spanish={exchange.label.es}
                          language={language}
                        />
                    }
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
        
      case 6:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Star className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">
                <TranslatableText 
                  text="Which cryptocurrencies are you most interested in?"
                  spanish="¿Qué criptomonedas te interesan más?"
                  language={language}
                />
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {cryptoOptions.map((crypto) => (
                <label
                  key={crypto.value}
                  className="flex items-center space-x-2 p-2 rounded-md border hover:bg-accent cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={profile.preferredCrypto.includes(crypto.value)}
                    onChange={(e) => handleArrayInput('preferredCrypto', crypto.value, e.target.checked)}
                  />
                  <span>{crypto.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
        
      case 7:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">
                <TranslatableText 
                  text="What are your main crypto goals?"
                  spanish="¿Cuáles son tus objetivos principales con las criptomonedas?"
                  language={language}
                />
              </h3>
            </div>
            <Textarea
              placeholder={
                language === 'en' 
                  ? "Describe your goals (e.g., 'Build passive income through staking', 'Diversify investment portfolio')" 
                  : "Describe tus objetivos (p.ej., 'Generar ingresos pasivos a través de staking', 'Diversificar cartera de inversión')"
              }
              value={profile.goals}
              onChange={(e) => handleInputChange('goals', e.target.value)}
              className="w-full min-h-[120px]"
              autoFocus
            />
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="p-4 bg-background rounded-lg border max-w-md mx-auto">
      <div className="mb-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-xl font-bold mb-2">
          <TranslatableText 
            text="Welcome to CryptoBot!"
            spanish="¡Bienvenido a CryptoBot!"
            language={language}
          />
        </h2>
        <p className="text-muted-foreground">
          <TranslatableText 
            text="Let's personalize your experience with a few questions."
            spanish="Personalicemos tu experiencia con algunas preguntas."
            language={language}
          />
        </p>
      </div>
      
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300" 
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="mt-2 text-sm text-muted-foreground text-center">
          <TranslatableText 
            text={`Step ${step} of ${totalSteps}`}
            spanish={`Paso ${step} de ${totalSteps}`}
            language={language}
          />
        </div>
      </div>
      
      {/* Current step content */}
      <div className="mb-6">
        {renderStep()}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <div>
          {step > 1 && (
            <Button variant="outline" onClick={prevStep}>
              <TranslatableText text="Back" spanish="Atrás" language={language} />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onSkip}>
            <TranslatableText text="Skip for now" spanish="Omitir por ahora" language={language} />
          </Button>
          
          <Button onClick={nextStep}>
            {step < totalSteps ? (
              <TranslatableText text="Next" spanish="Siguiente" language={language} />
            ) : (
              <TranslatableText text="Complete" spanish="Completar" language={language} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}