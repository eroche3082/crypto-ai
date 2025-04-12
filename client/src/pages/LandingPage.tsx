import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, CheckCircle, BarChart4, BrainCircuit, Bell, LineChart, Lock, RefreshCw, TrendingUp, Wallet, MessageCircle, AreaChart, ShieldAlert, Layers, PieChart, FileText, BarChart3, CloudLightning, ListChecks, Sparkles } from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      title: "Portfolio Advisor",
      description: "Automatic portfolio analysis with optimization suggestions based on current market trends",
      icon: <BarChart4 className="h-8 w-8 text-primary" />
    },
    {
      title: "Market Sentiment Analyzer",
      description: "Real-time interpretation of market sentiment from news sources and social media",
      icon: <BrainCircuit className="h-8 w-8 text-primary" />
    },
    {
      title: "Price Alert Creator",
      description: "Set up personalized price alerts through the chat with simple commands",
      icon: <Bell className="h-8 w-8 text-primary" />
    },
    {
      title: "Chart Pattern Recognition",
      description: "Analysis of technical patterns in charts shared by the user with predictive insights",
      icon: <LineChart className="h-8 w-8 text-primary" />
    },
    {
      title: "Trading Strategy Simulator",
      description: "Suggests and simulates strategies with hypothetical results and risk assessment",
      icon: <RefreshCw className="h-8 w-8 text-primary" />
    },
    {
      title: "Crypto News Summarizer",
      description: "Summary of relevant industry news personalized based on your favorite assets",
      icon: <FileText className="h-8 w-8 text-primary" />
    },
    {
      title: "Tax Implications Calculator",
      description: "Evaluation of tax implications for potential transactions based on your jurisdiction",
      icon: <BarChart3 className="h-8 w-8 text-primary" />
    },
    {
      title: "Educational Content Recommender",
      description: "Educational recommendations based on your questions and knowledge level",
      icon: <ListChecks className="h-8 w-8 text-primary" />
    },
    {
      title: "Wallet Security Advisor",
      description: "Security recommendations for wallets, detecting and alerting about potential risks",
      icon: <Lock className="h-8 w-8 text-primary" />
    },
    {
      title: "Multi-Asset Converter",
      description: "Instant conversion between multiple cryptocurrencies and fiat currencies with simple commands",
      icon: <RefreshCw className="h-8 w-8 text-primary" />
    },
    {
      title: "Investment Diversification Guide",
      description: "Concentration analysis and diversification suggestions based on asset correlations",
      icon: <PieChart className="h-8 w-8 text-primary" />
    },
    {
      title: "Token Metrics Analyzer",
      description: "Detailed analysis of metrics, utility, demand, and supply for any cryptocurrency",
      icon: <BarChart4 className="h-8 w-8 text-primary" />
    },
    {
      title: "DeFi Yield Optimizer",
      description: "Identifies and compares yield opportunities in DeFi with risk analysis",
      icon: <TrendingUp className="h-8 w-8 text-primary" />
    },
    {
      title: "NFT Collection Evaluator",
      description: "Evaluation of NFT collections by volume, liquidity, and value projections",
      icon: <Layers className="h-8 w-8 text-primary" />
    },
    {
      title: "Regulatory Updates Tracker",
      description: "Information on regulatory changes that could affect your investments",
      icon: <FileText className="h-8 w-8 text-primary" />
    },
    {
      title: "Portfolio Risk Assessment",
      description: "Stress tests on your portfolio with customized hypothetical scenarios",
      icon: <ShieldAlert className="h-8 w-8 text-primary" />
    },
    {
      title: "Trading Bot Configuration",
      description: "Configuration and parameter adjustment for automated strategies through chat",
      icon: <Sparkles className="h-8 w-8 text-primary" />
    },
    {
      title: "Multi-Chain Gas Optimizer",
      description: "Recommendations on optimal times for transactions based on current fees",
      icon: <CloudLightning className="h-8 w-8 text-primary" />
    },
    {
      title: "Voice Note Market Analysis",
      description: "Send voice notes with questions about the market and receive detailed analysis",
      icon: <MessageCircle className="h-8 w-8 text-primary" />
    },
    {
      title: "Personalized Learning Path",
      description: "Create and adapt a personalized learning path based on your goals and knowledge",
      icon: <AreaChart className="h-8 w-8 text-primary" />
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 text-primary rounded-full w-10 h-10 flex items-center justify-center">
              <MessageCircle size={20} />
            </div>
            <span className="font-bold text-xl">CryptoBot</span>
          </div>
          
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-primary/10 to-primary/5">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjUiPjxwYXRoIGQ9Ik0zNiAxOGMxLjIyOCAwIDIuNDQuMDQgMy42LjEyIDEuMTU0LjA3NSAyLjI5OC4xODYgMy40Mi4zMzIgMS4xMi4xNDUgMi4yMjYuMzI0IDMuMzE0LjUzOCAxLjA5LjIxIDIuMTYuNDUgMy4yMDQuNzJsLTEuNTU2IDQuNTU1Yy0uOTg0LS4zNDUtMi0uNjU3LTMuMDQ4LS45MzQtMS4wNDQtLjI4LTIuMTEyLS41Mi0zLjIwNC0uNzI2LTEuMDkzLS4yMDMtMi4yLS4zNjUtMy4zMjQtLjQ4NS0xLjEyNS0uMTItMi4yNi0uMTgtMy40MDgtLjE4LTEuMTQ2IDAtMi4yOC4wNi0zLjQwNC4xOC0xLjEyNi4xMi0yLjIzLjI4Mi0zLjMxOC40ODUtMS4wODguMjA3LTIuMTUzLjQ0Ny0zLjE5Ny43MjYtMS4wNDYuMjc3LTIuMDU4LjU5LTMuMDM2LjkzNEwxMC40IDE4Ljk5Yy41LS4xMzMgMS4wMTMtLjI2IDEuNTQtLjM4LjUyNy0uMTIgMS4wNi0uMjMzIDEuNi0uMzQuNTMzLS4xMDcgMS4wNzYtLjIwNCAxLjYyOC0uMjkuNTUzLS4wODcgMS4xMS0uMTY3IDEuNjc2LS4yNC41NjQtLjA3MyAxLjEzMi0uMTM3IDEuNzA0LS4xOS41Ny0uMDU0IDEuMTQ2LS4xIDEuNzI0LS4xNC41OC0uMDQgMS4xNjMtLjA3IDEuNzUyLS4wOS41ODgtLjAyIDEuMTgtLjAzIDEuNzc2LS4wM3oiLz48cGF0aCBkPSJNNiAzNnYtNy42NDRsLTQgMi40ODh2LTEyTDI0IDE1LjJ2LTEuNzc4Yy0xLjA5My4wNjQtMi4xNzQuMTYyLTMuMjQzLjI5NS0xLjA2NS4xMzMtMi4xMTIuMjktMy4xMzcuNDc1LTEuMDI2LjE4NC0yLjAzMi4zOTUtMy4wMi42MzMtLjk5LjIzNy0xLjk1OC41LTIuOTA0Ljc5TC0uMDQgMTQuMDdDLjQ0OCAxMy4xNzQgMS4wMTIgMTIuMyAxLjY1IDExLjQ1Yy42NC0uODUgMS4zNS0xLjY3NCAyLjEzNi0yLjQ3LjY4NC0uNjk0IDEuNDEtMS4zNTYgMi4xOC0xLjk4Ni43Ny0uNjMgMS41ODMtMS4yMjYgMi40NC0xLjc4NS44Ni0uNTYgMS43Ni0xLjA4IDIuNy0xLjU2czEuOTI0LS45MDggMi45NS0xLjI4YzEuMDI2LS4zNzMgMi4wOS0uNyAzLjE5LTEgMS4xLS4yNzIgMi4yMy0uNTA1IDMuMzktLjY5NiAxLjE2LS4xOTIgMi4zNS0uMzQ0IDMuNTYtLjQ1NmwxLjQ5LTQuMDMyQzI0LjUuMzQyIDIzLjMxLjIgMjIuMTI0LjA5NyAyMC45MzYtLjAwNyAxOS43MjMtLjA2IDE4LjQ5My0uMDZjLTEuMjMgMC0yLjQ0Mi4wNTUtMy42MzQuMTY1LTEuMTkuMTEtMi4zNjIuMjY3LTMuNTEzLjQ3Mi0xLjE1LjIwNS0yLjI3OC40NTQtMy4zODMuNzQ2LTEuMTA1LjI5Mi0yLjE4NC42Mi0zLjIzMyAxLjA0LS45NzcuMzgtMS45MjIuNzktMi44MyAxLjIzNC0uOTEzLjQ0LTEuODA1LjkyLTIuNjcgMS40My0uODY4LjUxLTEuNzA3IDEuMDQzLTIuNTIgMS42MXYyLjc0TC0uMDYgNi43MnYxMkw2IDE1LjY4NFYzNnptNDYuODU1LTI0LjM1NGwuMDY1LS4wMkM1NC42MTUgMTEuMDk1IDU2LjMgMTAuNjEgNTggMTAuMTVWOC41OTZjLS4yLjA0LS40MDMuMDgtLjYwNy4xMTgtLjIwNS4wNC0uNDEuMDgtLjYxNS4xMTctLjIwNi4wMzctLjQxLjA3NS0uNjE2LjExMy0uMjA1LjA0LS40MS4wNzUtLjYxNS4xMTNDNDQuODMyIDExLjcxNCAzNSAxNi40MyAzNSAyNHYxMS42ODRsNCAxLjFWMjRjMC0zLjQ4MiA1LjU5Mi03LjA4IDE1LjM4Ni05Ljc3OGwtLjA1Ny4wMjItMS40NzQuNTl2LjAxeiIvPjxwYXRoIGQ9Ik00OS44NCAyNy45MjVDNTEuMDcgMjguODcgNTIuNDggMjkuNjkzIDU0IDMwLjM5djEuMDFjLTEuOTItLjgyLTMuNzMtMS44Mi01LjM5LTNsMS4yMy0uNDc1ek0xMCAyOS4wNXYtLjQ3NWMwLS4wMjIuMDAzLS4wNDMuMDA5LS4wNjMuMDA1LS4wMi4wMTMtLjA0LjAyNC0uMDU1LjAxLS4wMTYuMDIzLS4wMy4wMzgtLjA0LjAxNC0uMDEuMDMtLjAxNi4wNDgtLjAxOGw1LjUyLTEuNDRjLjAyLS4wMDUuMDQtLjAwNS4wNi0uMDAyLjAyLjAwNC4wMzkuMDEyLjA1NC4wMjQuMDE2LjAxLjAzLjAyNC4wNC4wNC4wMS4wMTUuMDE1LjAzMi4wMTcuMDVWMjh2LjY4NmwtNS44MDkgMS41MlYyOS4wNXptMzMuODMtMTMuMzljLjEzOC4zMzQuMjY4LjY3Mi4zOTIgMS4wMTUuMTIzLjM0My4yNCAxLjE5LjM0OCAxLjU0OC4yNS44My40OTIgMS42OCuNzE4IDIuNTQ4LjE1My41OTYuMjkgMS4xOTcuNDAyIDEuOC4xMTIuNjAzLjIwOSAxLjIxLjI4OCAxLjgxOC4wNzkuNjEuMTQzIDEuMjIuMTg5IDEuODI4LjA0Ni42MS4wNzcgMS4yMTIuMDkzIDEuODA4LjAxNS41OTYuMDE1IDEuMTgzIDAgMS43NTgtLjAxNi41NzYtLjA0NyAxLjE0LS4wOTUgMS42OS0uMDQ3LjU1LS4xMSAxLjA4OC0uMTg4IDEuNjEtLjA4LjUyMy0uMTczIDEuMDMtLjI4NyAxLjUyLS4xMTQuNDktLjI0Ni45NjQtLjM5NiAxLjQyMi0uMTUuNDU4LS4zMTcuOS0uNDk4IDEuMzMtLjE4LjQyNy0uMzc3LjgzNy0uNTg2IDEuMjMyLS4yMS4zOTUtLjQzNy43Ny0uNjc4IDEuMTQtLjI0LjM2Ny0uNDk1LjcyLS43NiAxLjA1NS0uMjY3LjMzNi0uNTQ0LjY1NS0uODMuOTZMMzguOTYgNDIuNjM3em0tMzIuNTYtNy43OWwtLjAxMy0uMDA0QzkuNjQgNi44NzQgOC4wODcgNi4xMjQgNi41IDUuNDU1VjcuMTFsLjI0OC4xMy4yNTYuMTM1LjI2LjEzOGMxMi40MzMgNi42NSAxNy43MzYgMTIuNDMgMTYuMjQgMTguNWwtMi42NjQtLjczNGMuNjc3LTIuNDUzLTEuNTg4LTYuNDktOC41Ny0xMS4yNXpNNTAgNi42N3YtLjQ0NGwtMS43Mi42OUw2IDIwLjU3MnYyLjQ1Mmw0Mi0xNi44djEuMjA1bC0yIC43NDdWNi42N3ptLTE1IDM3LjY1OGwuMDIuMDAzLjMwOC4wNy4zLjA2OC4yOTguMDY2Yy0uMDI2LS4wMDUtLjA1NS0uMDEtLjA4NC0uMDE2LS4wNy0uMDE0LS4xNC0uMDI4LS4yMTMtLjA0My0uMTQzLS4wMy0uMjg4LS4wNi0uNDMzLS4wOTJsLS43MTUtLjE1NCAyLjY4OC43My0uMDItLjAwNGMzLjM5LjczIDYuODY3IDEuMzY3IDEwLjM3NyAxLjkwNS40MzguMDc1Ljg1LjE3MiAxLjI1LjI5NWwtLjAyOC0uMDA2LS41ODguMTMyLS41OC4xMy0uNTc3LjEzLS41NzYuMTMtLjU3LjEyNy0uNTY4LjEyNy0uNTYyLjEyNy0uNTYuMTI1LS41NS4xMjMtLjU0Ni4xMjItLjU0Mi4xMi0uNTM0LjEyLS41My4xMi0uNTI2LjExNi0uNTE4LjExNi0uNTEuMTE0LS40OTguMTEyLS40OS4xMS0uNDc4LjEwOC0uNDcuMTA1LS40Ni4xMDMtLjQ1Mi4xLS40NC4xLS40My4wOTYtLjQyLjA5NS0uNDEuMDktLjQuMDl6Ii8+PHBhdGggZD0iTTUuOTc2IDQuN0M1LjY1IDQuNTMgNS4zMiA0LjM2IDQuOTg4IDQuMmMtLjMzNS0uMTYtLjY3NC0uMzEtMS4wMTYtLjQ1LS4zNDItLjE0LS42ODgtLjI3LTEuMDM1LS4zOS0uMzQ4LS4xMi0uNy0uMjMtMS4wNS0uMzNsLTEuNSAzLjkxYTExLjQzIDExLjQzIDAgMDExLjI1NC4zNWMuNDE4LjEzNS44Mi4yODUgMS4yMDYuNDUuMzg2LjE2Ni43Ni4zNDMgMS4xMTguNTMzLjM2LjE5LjcuMzkgMS4wMy41OTguMzMuMjEuNjQzLjQzLjkzOC42Ni4yOTYuMjI4LjU3NC40NjguODM0LjcxOC4yNi4yNS41LjUxLjcyLjc4Mi4yMjMuMjcuNDI4LjU1LjYxNS44MzguMTg2LjI4OC4zNTUuNTg0LjUwNi44OS4xNS4zMDUuMjguNjE4LjM5My45MzRsNC4zNDgtMS42MmMtLjE4Ny0uMzk0LS4zOS0uNzgzLS42MDYtMS4xNjctLjIxOC0uMzgyLS40NS0uNzUzLS42OTQtMS4xMS0uMjQ1LS4zNTgtLjUwMy0uNzAyLS43NzItMS4wMzUtLjI3LS4zMy0uNTU1LS42NS0uODUzLS45NTVsMi4wNTUtLjY5YzEuNDg0IDIuMjUzIDIuNTcyIDQuNjczIDMuMjQ1IDcuMjJsLTMuNTY3IDEuODYyYy0uNjM3LTIuNzU0LTEuNzg3LTUuMzEtMy40My03LjYyM3oiLz48L2c+PC9nPjwvc3ZnPg==')]"></div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Artificial Intelligence for Your Crypto Investments
            </h1>
            <p className="text-xl mb-8 text-muted-foreground">
              A comprehensive AI-powered platform to analyze, manage, and optimize your cryptocurrency investments.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/login">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Explore
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Powered by Artificial Intelligence</h2>
            <p className="text-muted-foreground">
              CryptoBot combines advanced data analysis, machine learning, and artificial intelligence to provide you with cutting-edge investment tools.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg mb-8 text-muted-foreground">
              CryptoBot was created with the goal of democratizing access to high-quality financial analysis for cryptocurrency investors. We combine advanced artificial intelligence with real-time market data to deliver insights and personalized recommendations that were previously only available to institutional investors.
            </p>
            <div className="flex justify-center">
              <Link href="/login">
                <Button size="lg" className="gap-2">
                  Chat with Assistant <MessageCircle size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Optimize Your Investments?</h2>
          <p className="text-lg mb-8 text-muted-foreground max-w-2xl mx-auto">
            Join thousands of investors who are already harnessing the power of artificial intelligence to improve their strategies.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Get Started Now <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="gap-2">
                Explore Platform <ChevronRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center">
                <MessageCircle size={16} />
              </div>
              <span className="font-bold">CryptoBot</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <span>© 2025 CryptoBot AI. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}