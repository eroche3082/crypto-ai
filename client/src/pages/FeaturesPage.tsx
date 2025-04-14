import React from 'react';
import { Helmet } from 'react-helmet';
import { 
  BarChart3, 
  Bell, 
  Brain, 
  Calendar, 
  CreditCard, 
  LineChart, 
  MessageCircle, 
  PieChart, 
  RadioTower, 
  RotateCw, 
  Scan, 
  Shield, 
  Smartphone, 
  Star, 
  TrendingUp, 
  Wallet, 
  Zap, 
  ArrowUpDown, 
  Bitcoin,
  Languages,
  AreaChart,
  Box,
  Boxes,
  Activity,
  FileLock,
  RefreshCcw,
  Network,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';

// Define the interface for feature data
interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isPremium?: boolean;
  isNew?: boolean;
  category: 'analytics' | 'tracking' | 'security' | 'automation' | 'social' | 'tools';
}

// Create feature data
const features: Feature[] = [
  {
    id: 'portfolio-analyzer',
    title: 'Portfolio Analyzer',
    description: 'Advanced analytics for your crypto portfolio with real-time performance metrics and AI-driven insights.',
    icon: <BarChart3 className="h-6 w-6" />,
    category: 'analytics'
  },
  {
    id: 'token-performance',
    title: 'Token Performance Tracker',
    description: 'Track individual token performance with detailed metrics and comparison to market benchmarks.',
    icon: <TrendingUp className="h-6 w-6" />,
    category: 'tracking'
  },
  {
    id: 'realtime-alerts',
    title: 'Real-time Alerts',
    description: 'Get instant notifications for price movements, whale transactions, and market shifts.',
    icon: <Bell className="h-6 w-6" />,
    category: 'tracking'
  },
  {
    id: 'sentiment-ai',
    title: 'Fear & Greed Sentiment AI',
    description: 'AI-powered analysis of market sentiment using social media, news, and on-chain data.',
    icon: <Brain className="h-6 w-6" />,
    category: 'analytics',
    isPremium: true
  },
  {
    id: 'wallet-scanner',
    title: 'Wallet Risk Scanner',
    description: 'Scan wallet addresses for potential security risks, suspicious tokens, and contract interactions.',
    icon: <Scan className="h-6 w-6" />,
    category: 'security'
  },
  {
    id: 'tokenomics',
    title: 'Tokenomics Visualizer',
    description: 'Interactive visualization of token distribution, vesting schedules, and economics.',
    icon: <PieChart className="h-6 w-6" />,
    category: 'analytics'
  },
  {
    id: 'web3-wallet',
    title: 'Web3 Wallet Integration',
    description: 'Connect your Web3 wallets for seamless portfolio tracking and transaction analysis.',
    icon: <Wallet className="h-6 w-6" />,
    category: 'tools'
  },
  {
    id: 'dca-engine',
    title: 'Smart DCA Engine',
    description: 'Automated dollar-cost averaging with AI optimization for timing and asset allocation.',
    icon: <Calendar className="h-6 w-6" />,
    category: 'automation',
    isPremium: true
  },
  {
    id: 'tax-estimator',
    title: 'Tax Estimator',
    description: 'Calculate potential tax obligations from your crypto trading activity across multiple jurisdictions.',
    icon: <CreditCard className="h-6 w-6" />,
    category: 'tools'
  },
  {
    id: 'telegram-bot',
    title: 'Telegram Alerts Bot',
    description: 'Receive personalized alerts and portfolio updates directly to your Telegram account.',
    icon: <MessageCircle className="h-6 w-6" />,
    category: 'social'
  },
  {
    id: 'news-summarizer',
    title: 'Market News Summarizer',
    description: 'AI-powered summaries of the latest market news and their potential impact on your holdings.',
    icon: <RadioTower className="h-6 w-6" />,
    category: 'tools'
  },
  {
    id: 'defi-yield',
    title: 'DeFi Yield Optimizer',
    description: 'Find the best yields for your assets across DeFi protocols with risk assessment.',
    icon: <Zap className="h-6 w-6" />,
    category: 'automation',
    isPremium: true
  },
  {
    id: 'nft-tracker',
    title: 'NFT Wallet Tracker',
    description: 'Track your NFT portfolio value, floor prices, and market trends with real-time analytics.',
    icon: <Star className="h-6 w-6" />,
    category: 'tracking',
    isNew: true
  },
  {
    id: 'gas-predictor',
    title: 'Gas Fee Predictor',
    description: 'Intelligent prediction of gas fees to optimize transaction timing and costs.',
    icon: <RotateCw className="h-6 w-6" />,
    category: 'tools'
  },
  {
    id: 'network-health',
    title: 'Blockchain Network Health',
    description: 'Monitor the health and performance of blockchain networks with real-time metrics.',
    icon: <Network className="h-6 w-6" />,
    category: 'analytics'
  },
  {
    id: 'arbitrage-finder',
    title: 'Exchange Arbitrage Finder',
    description: 'Identify price differences across exchanges for potential arbitrage opportunities.',
    icon: <ArrowUpDown className="h-6 w-6" />,
    category: 'automation'
  },
  {
    id: 'profit-loss',
    title: 'Profit-Loss Timeline',
    description: 'Visualize your crypto journey with an interactive profit and loss timeline.',
    icon: <LineChart className="h-6 w-6" />,
    category: 'analytics'
  },
  {
    id: 'trading-bot',
    title: 'Trading Bot Configurator',
    description: 'Configure and deploy automated trading strategies based on technical indicators and AI.',
    icon: <RefreshCcw className="h-6 w-6" />,
    category: 'automation',
    isPremium: true
  },
  {
    id: 'multi-ai',
    title: 'Multilingual AI Assistant',
    description: 'Get crypto insights and assistance in multiple languages, powered by advanced AI models.',
    icon: <Languages className="h-6 w-6" />,
    category: 'social',
    isNew: true
  },
  {
    id: 'token-research',
    title: 'Token Research Chat',
    description: 'Chat with AI to get deep research insights on any token or blockchain project.',
    icon: <MessageCircle className="h-6 w-6" />,
    category: 'tools'
  },
  {
    id: 'nft-collection-analysis',
    title: 'NFT Collection Analyzer',
    description: 'Comprehensive analysis and valuation of NFT collections with AI-driven predictions.',
    icon: <Boxes className="h-6 w-6" />,
    category: 'analytics',
    isNew: true
  },
  {
    id: 'chart-pattern-recognition',
    title: 'Chart Pattern Recognition',
    description: 'Advanced AI pattern recognition for technical analysis and trend prediction.',
    icon: <AreaChart className="h-6 w-6" />,
    category: 'analytics',
    isNew: true
  },
  {
    id: 'multi-factor-auth',
    title: 'Multi-Factor Authentication',
    description: 'Enhanced security with multiple authentication methods including biometrics and hardware keys.',
    icon: <Shield className="h-6 w-6" />,
    category: 'security'
  },
  {
    id: 'push-notifications',
    title: 'Cross-Device Notifications',
    description: 'Seamless alert delivery across web, mobile, and desktop applications.',
    icon: <Smartphone className="h-6 w-6" />,
    category: 'social'
  }
];

// Component to display categories with features
function FeatureCategory({ title, features }: { title: string; features: Feature[] }) {
  return (
    <div className="mb-12">
      <h2 className="mb-6 text-2xl font-bold">{title}</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.id} className="overflow-hidden border-border/40 transition-all hover:border-primary/40 hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <div>
                  {feature.isPremium && (
                    <Badge className="bg-amber-500 hover:bg-amber-600">Premium</Badge>
                  )}
                  {feature.isNew && (
                    <Badge className="ml-2 bg-emerald-500 hover:bg-emerald-600">New</Badge>
                  )}
                </div>
              </div>
              <CardTitle className="mt-2 text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">{feature.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                Learn More
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  // Group features by category
  const analytics = features.filter(f => f.category === 'analytics');
  const tracking = features.filter(f => f.category === 'tracking');
  const security = features.filter(f => f.category === 'security');
  const automation = features.filter(f => f.category === 'automation');
  const social = features.filter(f => f.category === 'social');
  const tools = features.filter(f => f.category === 'tools');

  return (
    <>
      <Helmet>
        <title>CryptoBot | Features</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold">CryptoBot Features</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Discover the complete set of tools and capabilities to optimize your crypto experience
          </p>
          
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link href="/signup">
                Get Started <ArrowUpDown className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-center gap-3 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">
              The CryptoBot platform includes {features.length} powerful features. Premium features require a subscription plan.
            </p>
          </div>
        </div>
        
        <div className="mt-12">
          <FeatureCategory title="Analytics & Insights" features={analytics} />
          <FeatureCategory title="Tracking & Monitoring" features={tracking} />
          <FeatureCategory title="Security & Protection" features={security} />
          <FeatureCategory title="Automation & Optimization" features={automation} />
          <FeatureCategory title="Social & Communication" features={social} />
          <FeatureCategory title="Tools & Utilities" features={tools} />
        </div>
        
        <div className="mt-16 rounded-xl bg-primary/5 p-8 text-center">
          <h2 className="text-2xl font-bold">Ready to Elevate Your Crypto Experience?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of users who are already using CryptoBot to optimize their cryptocurrency journey.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/signup">
              Create Your Account
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}