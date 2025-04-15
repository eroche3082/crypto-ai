import { 
  LineChart, 
  Wallet, 
  Bell, 
  TrendingUp, 
  BarChart3, 
  Cpu, 
  Image, 
  MessageSquare,
  Fingerprint,
  Locate,
  Trophy
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FeaturesPage = () => {
  const features = [
    {
      title: "Real-Time Market Data",
      description: "Access comprehensive real-time data on cryptocurrencies with advanced filtering and sorting options.",
      icon: <LineChart className="h-10 w-10 text-primary" />
    },
    {
      title: "AI-Powered Analytics",
      description: "Get personalized insights and predictions powered by our advanced machine learning algorithms.",
      icon: <Cpu className="h-10 w-10 text-primary" />
    },
    {
      title: "Portfolio Tracking",
      description: "Easily manage and track your diverse crypto portfolio with performance metrics and visualization.",
      icon: <Wallet className="h-10 w-10 text-primary" />
    },
    {
      title: "Smart Alerts",
      description: "Set custom price and market condition alerts to never miss important trading opportunities.",
      icon: <Bell className="h-10 w-10 text-primary" />
    },
    {
      title: "NFT Gallery & Analysis",
      description: "Explore, track and analyze NFT collections with predictive valuation insights.",
      icon: <Image className="h-10 w-10 text-primary" />
    },
    {
      title: "Technical Analysis",
      description: "Advanced charting tools with pattern recognition and indicator overlay capabilities.",
      icon: <BarChart3 className="h-10 w-10 text-primary" />
    },
    {
      title: "Social Sentiment",
      description: "Track social media sentiment about cryptocurrencies to gauge market perception.",
      icon: <TrendingUp className="h-10 w-10 text-primary" />
    },
    {
      title: "Secure Wallet Messaging",
      description: "Communicate securely with other crypto enthusiasts via our wallet-to-wallet messaging system.",
      icon: <MessageSquare className="h-10 w-10 text-primary" />
    },
    {
      title: "Biometric Security",
      description: "Enterprise-grade security with optional biometric authentication for your account.",
      icon: <Fingerprint className="h-10 w-10 text-primary" />
    },
    {
      title: "Crypto ATM Locator",
      description: "Find nearby crypto ATMs with detailed information and directions.",
      icon: <Locate className="h-10 w-10 text-primary" />
    },
    {
      title: "Educational Content",
      description: "Extensive learning resources from beginner to advanced levels to enhance your crypto knowledge.",
      icon: <Trophy className="h-10 w-10 text-primary" />
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight">Complete Cryptocurrency Platform</h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          CryptoPulse combines powerful analytics, AI insights, and comprehensive tools to transform your crypto investment experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card key={index} className="border border-primary/20 hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              {feature.icon}
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base mt-2">{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-20 text-center">
        <h2 className="text-3xl font-bold">Ready to elevate your crypto experience?</h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Join thousands of investors who are using CryptoPulse to make smarter cryptocurrency decisions.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-lg px-8">Get Started Free</Button>
          <Button size="lg" variant="outline" className="text-lg px-8">View Pricing</Button>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;