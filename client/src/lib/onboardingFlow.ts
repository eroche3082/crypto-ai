/**
 * Onboarding Flow System for CryptoBot
 * Defines dynamic questions based on agent type
 */

export type QuestionType = 'text' | 'multipleChoice' | 'boolean' | 'file' | 'voice';

export interface OnboardingQuestion {
  id: string;
  label: string;
  field: string;
  type: QuestionType;
  required: boolean;
  validation?: RegExp | string;
  options?: string[]; // For multipleChoice questions
  placeholder?: string;
  description?: string;
}

/**
 * Crypto-specific onboarding questions
 */
export const cryptoOnboardingFlow: OnboardingQuestion[] = [
  { 
    id: "name", 
    label: "What's your name?", 
    field: "name", 
    type: "text", 
    required: true,
    placeholder: "Your name",
    description: "We'll use this to personalize your experience" 
  },
  { 
    id: "email", 
    label: "What's your email?", 
    field: "email", 
    type: "text", 
    required: true,
    validation: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    placeholder: "your.email@example.com",
    description: "Used for account recovery and optional notifications" 
  },
  { 
    id: "experience", 
    label: "What's your experience level with cryptocurrencies?", 
    field: "experience", 
    type: "multipleChoice", 
    required: true,
    options: ["Beginner", "Intermediate", "Advanced", "Expert"],
    description: "Helps us tailor explanations to your knowledge level" 
  },
  { 
    id: "interests", 
    label: "What aspects of crypto are you most interested in?", 
    field: "interests", 
    type: "multipleChoice", 
    required: true,
    options: ["Trading", "Investing", "DeFi", "NFTs", "Smart Contracts", "Mining", "Staking", "Technology", "News"],
    description: "Select all that apply - we'll prioritize content in these areas" 
  },
  { 
    id: "exchanges", 
    label: "Which crypto exchanges do you currently use?", 
    field: "exchanges", 
    type: "multipleChoice", 
    required: false,
    options: ["Binance", "Coinbase", "Kraken", "FTX", "Bitfinex", "Huobi", "OKX", "KuCoin", "Other"],
    description: "We'll optimize information for your preferred platforms" 
  },
  { 
    id: "goals", 
    label: "What are your primary goals with cryptocurrency?", 
    field: "goals", 
    type: "text", 
    required: true,
    placeholder: "e.g., long-term investment, daily trading, passive income",
    description: "Help us understand what you're trying to achieve" 
  },
  { 
    id: "riskTolerance", 
    label: "How would you describe your risk tolerance?", 
    field: "riskTolerance", 
    type: "multipleChoice", 
    required: false,
    options: ["Very Low", "Low", "Moderate", "High", "Very High"],
    description: "Helps us provide appropriate risk assessments" 
  },
  { 
    id: "preferredCrypto", 
    label: "Which cryptocurrencies are you most interested in?", 
    field: "preferredCrypto", 
    type: "multipleChoice", 
    required: false,
    options: ["Bitcoin (BTC)", "Ethereum (ETH)", "Solana (SOL)", "Cardano (ADA)", "Ripple (XRP)", "Polkadot (DOT)", "Avalanche (AVAX)", "Other"],
    description: "We'll prioritize updates on these assets" 
  },
  { 
    id: "investmentAmount", 
    label: "What is your typical investment amount?", 
    field: "investmentAmount", 
    type: "multipleChoice", 
    required: false,
    options: ["< $1,000", "$1,000 - $10,000", "$10,000 - $50,000", "$50,000 - $100,000", "> $100,000", "Prefer not to say"],
    description: "Optional - helps us tailor strategy suggestions" 
  },
  { 
    id: "analysisPreference", 
    label: "What type of analysis do you prefer?", 
    field: "analysisPreference", 
    type: "multipleChoice", 
    required: false,
    options: ["Technical Analysis", "Fundamental Analysis", "On-chain Metrics", "Sentiment Analysis", "News-based", "All of the above"],
    description: "We'll emphasize these analysis types in our insights" 
  },
  { 
    id: "updateFrequency", 
    label: "How often would you like to receive market updates?", 
    field: "updateFrequency", 
    type: "multipleChoice", 
    required: false,
    options: ["Real-time", "Daily", "Weekly", "Only significant movements"],
    description: "Sets your default notification preference" 
  },
  { 
    id: "preferredLanguage", 
    label: "What is your preferred language?", 
    field: "preferredLanguage", 
    type: "multipleChoice", 
    required: false,
    options: ["English", "Spanish", "French", "Portuguese", "Chinese", "Japanese", "Korean"],
    description: "We'll try to provide content in your preferred language when available" 
  }
];

/**
 * Returns the appropriate onboarding flow based on agent type
 */
export function getOnboardingQuestions(agentType: string): OnboardingQuestion[] {
  // Currently we only have crypto, but this can be expanded
  switch (agentType.toLowerCase()) {
    case 'crypto':
    default:
      return cryptoOnboardingFlow;
  }
}

/**
 * Validates a response against a question's validation rules
 */
export function validateResponse(question: OnboardingQuestion, value: any): boolean {
  if (question.required && (value === undefined || value === null || value === '')) {
    return false;
  }
  
  if (question.validation && value) {
    if (typeof question.validation === 'string') {
      // Handle string-based validation
      return true; // We would implement custom validation logic here
    } else if (question.validation instanceof RegExp) {
      // Regex validation
      return question.validation.test(value.toString());
    }
  }
  
  return true;
}