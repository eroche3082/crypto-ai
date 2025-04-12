import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity, 
  Award, 
  BarChart4, 
  Brain, 
  DollarSign,
  PercentIcon
} from "lucide-react";
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Types for portfolio data
interface AssetAllocation {
  type: string;
  percentage: number;
  value: number;
  color: string;
}

interface RiskMetric {
  name: string;
  value: number;
  description: string;
  status: 'low' | 'medium' | 'high';
}

interface PortfolioInsight {
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
  title: string;
  description: string;
}

interface PortfolioRecommendation {
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  timeframe: 'short' | 'medium' | 'long';
}

interface PortfolioAnalysis {
  totalValue: number;
  returns: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  allocation: AssetAllocation[];
  riskMetrics: RiskMetric[];
  insights: PortfolioInsight[];
  recommendations: PortfolioRecommendation[];
  aiSummary: string;
  lastUpdated: string;
}

// Status color mapping
const getStatusColor = (status: 'low' | 'medium' | 'high', isRisk: boolean = true): string => {
  if (isRisk) {
    return {
      low: 'bg-green-500',
      medium: 'bg-orange-500',
      high: 'bg-red-500'
    }[status];
  } else {
    return {
      low: 'bg-blue-500',
      medium: 'bg-purple-500',
      high: 'bg-green-500'
    }[status];
  }
};

const getReturnStatusClass = (value: number): string => {
  if (value > 0) return 'text-green-500';
  if (value < 0) return 'text-red-500';
  return 'text-gray-500';
};

// Mock data for demo purposes
const MOCK_PORTFOLIO_ANALYSIS: PortfolioAnalysis = {
  totalValue: 25438.92,
  returns: {
    daily: 1.2,
    weekly: -0.5,
    monthly: 4.8,
    yearly: 12.3
  },
  allocation: [
    { type: 'Bitcoin', percentage: 42, value: 10684.35, color: 'bg-orange-500' },
    { type: 'Ethereum', percentage: 28, value: 7122.90, color: 'bg-blue-500' },
    { type: 'Stablecoins', percentage: 15, value: 3815.84, color: 'bg-green-500' },
    { type: 'DeFi Tokens', percentage: 10, value: 2543.89, color: 'bg-purple-500' },
    { type: 'Other Altcoins', percentage: 5, value: 1271.94, color: 'bg-gray-500' }
  ],
  riskMetrics: [
    { 
      name: 'Volatility', 
      value: 0.72, 
      description: 'Portfolio exhibits high price fluctuations compared to the market average.',
      status: 'high' 
    },
    { 
      name: 'Concentration', 
      value: 0.68, 
      description: 'Assets are somewhat concentrated in a few cryptocurrencies.',
      status: 'medium' 
    },
    { 
      name: 'Correlation', 
      value: 0.85, 
      description: 'High correlation between assets may increase overall portfolio risk.',
      status: 'high' 
    },
    { 
      name: 'Liquidity', 
      value: 0.25, 
      description: 'Portfolio consists largely of highly liquid assets.',
      status: 'low' 
    }
  ],
  insights: [
    {
      type: 'strength',
      title: 'Strong Bitcoin Position',
      description: 'Your significant Bitcoin allocation has been beneficial during recent market conditions.'
    },
    {
      type: 'weakness',
      title: 'High Correlation Risk',
      description: 'Your portfolio assets tend to move in the same direction, increasing downside risk.'
    },
    {
      type: 'opportunity',
      title: 'DeFi Yield Potential',
      description: 'Your DeFi holdings could be deployed to generate yield through lending protocols.'
    },
    {
      type: 'threat',
      title: 'Regulatory Uncertainty',
      description: 'Potential regulatory changes could impact certain assets in your portfolio.'
    }
  ],
  recommendations: [
    {
      title: 'Diversify into Ethereum L2s',
      description: 'Consider allocating 5-10% into Ethereum layer 2 projects to reduce concentration risk.',
      impact: 'medium',
      timeframe: 'medium'
    },
    {
      title: 'Increase Stablecoin Reserve',
      description: 'Increase stablecoin position to 20-25% to provide safety and buying opportunity reserves.',
      impact: 'high',
      timeframe: 'short'
    },
    {
      title: 'Explore Liquid Staking',
      description: 'Utilize liquid staking derivatives to generate yield while maintaining liquidity.',
      impact: 'medium',
      timeframe: 'short'
    },
    {
      title: 'Consider Bitcoin ETF Allocation',
      description: 'Explore allocating a portion of Bitcoin exposure to spot ETFs for reduced security risks.',
      impact: 'medium',
      timeframe: 'long'
    }
  ],
  aiSummary: "Your portfolio shows strong performance with good exposure to blue-chip cryptocurrencies. The 12.3% yearly return is commendable, though volatility and correlation between assets present notable risks. Consider greater diversification across different blockchain ecosystems and increasing your stablecoin allocation to improve resilience against market downturns. DeFi yield strategies could optimize returns from your existing holdings. Regular rebalancing is recommended to maintain your target allocations as the market evolves.",
  lastUpdated: "2025-04-11T08:30:00Z"
};

// Main Portfolio Analyzer Component
const PortfolioAnalyzer: React.FC = () => {
  const { toast } = useToast();
  const [analysisType, setAnalysisType] = useState<'basic' | 'advanced'>('basic');
  
  // We would normally fetch real data from the API here
  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ['/api/portfolio/analysis'],
    queryFn: async () => {
      // In a real implementation, we would call the API
      // const response = await apiRequest('GET', '/api/portfolio/analysis');
      // return response.json();
      
      // For demo, use mock data with a delay to simulate loading
      return new Promise<PortfolioAnalysis>((resolve) => {
        setTimeout(() => resolve(MOCK_PORTFOLIO_ANALYSIS), 1000);
      });
    }
  });
  
  const generateAIAnalysis = async () => {
    toast({
      title: "AI Analysis Started",
      description: "Generating in-depth portfolio insights...",
    });
    
    // In a real implementation, this would trigger a more complex analysis
    setTimeout(() => {
      setAnalysisType('advanced');
      toast({
        title: "AI Analysis Complete",
        description: "Your personalized portfolio insights are ready.",
      });
    }, 2000);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }
  
  if (error || !analysis) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Error Loading Portfolio Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Unable to load your portfolio analysis. Please try again later.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Intelligence</h2>
          <p className="text-muted-foreground">
            AI-powered insights and recommendations for your crypto portfolio
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={analysisType === 'advanced' ? 'default' : 'outline'}
            className="flex items-center gap-2"
            onClick={generateAIAnalysis}
          >
            <Brain className="h-4 w-4" />
            <span>Run AI Analysis</span>
          </Button>
          <Badge variant="outline" className="gap-1 px-2">
            <span>Last updated:</span>
            <span className="font-normal">{formatDate(analysis.lastUpdated)}</span>
          </Badge>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-primary" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${analysis.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BarChart4 className="mr-2 h-4 w-4 text-primary" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-muted-foreground">Daily</div>
                <div className={`text-sm font-medium ${getReturnStatusClass(analysis.returns.daily)}`}>
                  {analysis.returns.daily > 0 ? '+' : ''}{analysis.returns.daily}%
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Weekly</div>
                <div className={`text-sm font-medium ${getReturnStatusClass(analysis.returns.weekly)}`}>
                  {analysis.returns.weekly > 0 ? '+' : ''}{analysis.returns.weekly}%
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Monthly</div>
                <div className={`text-sm font-medium ${getReturnStatusClass(analysis.returns.monthly)}`}>
                  {analysis.returns.monthly > 0 ? '+' : ''}{analysis.returns.monthly}%
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Yearly</div>
                <div className={`text-sm font-medium ${getReturnStatusClass(analysis.returns.yearly)}`}>
                  {analysis.returns.yearly > 0 ? '+' : ''}{analysis.returns.yearly}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Activity className="mr-2 h-4 w-4 text-primary" />
              Risk Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.riskMetrics.slice(0, 2).map((metric) => (
                <div key={metric.name} className="flex justify-between items-center">
                  <div className="text-sm">{metric.name}</div>
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Analysis Tabs */}
      <Tabs defaultValue="allocation" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="allocation">
            <PieChart className="h-4 w-4 mr-2" />
            Allocation
          </TabsTrigger>
          <TabsTrigger value="risk">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger value="insights">
            <TrendingUp className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Award className="h-4 w-4 mr-2" />
            Recommendations
          </TabsTrigger>
        </TabsList>
        
        {/* Allocation Tab */}
        <TabsContent value="allocation">
          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
              <CardDescription>
                Breakdown of your portfolio by cryptocurrency type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.allocation.map((asset) => (
                  <div key={asset.type} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{asset.type}</div>
                      <div className="text-sm text-muted-foreground">
                        ${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="ml-2">({asset.percentage}%)</span>
                      </div>
                    </div>
                    <Progress value={asset.percentage} className={asset.color} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Risk Analysis Tab */}
        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle>Risk Metrics</CardTitle>
              <CardDescription>
                Detailed analysis of your portfolio risk factors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.riskMetrics.map((metric) => (
                  <div key={metric.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{metric.name}</div>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status.toUpperCase()}
                      </Badge>
                    </div>
                    <Progress value={metric.value * 100} className={getStatusColor(metric.status)} />
                    <p className="text-sm text-muted-foreground">{metric.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Insights Tab */}
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Insights</CardTitle>
              <CardDescription>
                SWOT analysis of your current portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.insights.map((insight, index) => {
                  const isStrength = insight.type === 'strength';
                  const isWeakness = insight.type === 'weakness';
                  const isOpportunity = insight.type === 'opportunity';
                  const isThreat = insight.type === 'threat';
                  
                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {isStrength && <Award className="h-5 w-5 text-green-500" />}
                        {isWeakness && <TrendingDown className="h-5 w-5 text-red-500" />}
                        {isOpportunity && <TrendingUp className="h-5 w-5 text-blue-500" />}
                        {isThreat && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                        
                        <h3 className="font-medium">
                          {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}: {insight.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Recommendations Tab */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>
                Personalized suggestions to optimize your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{recommendation.title}</h3>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(recommendation.impact, false)}>
                          {recommendation.impact} impact
                        </Badge>
                        <Badge variant="outline">
                          {recommendation.timeframe} term
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* AI Summary Section */}
      <Card className={analysisType === 'advanced' ? 'border-primary' : 'border-muted'}>
        <CardHeader className="flex flex-row items-center gap-2">
          <Brain className={`h-5 w-5 ${analysisType === 'advanced' ? 'text-primary' : 'text-muted-foreground'}`} />
          <div>
            <CardTitle>AI Summary</CardTitle>
            <CardDescription>
              {analysisType === 'advanced' 
                ? 'Advanced AI analysis of your portfolio' 
                : 'Basic portfolio summary'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-lg ${analysisType === 'advanced' ? 'bg-primary/10 border border-primary/20' : 'bg-muted'}`}>
            <p className="italic">{analysis.aiSummary}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-xs text-muted-foreground">
            Analysis powered by CryptoBot AI
          </div>
          {analysisType !== 'advanced' && (
            <Button size="sm" variant="outline" onClick={generateAIAnalysis} className="gap-2">
              <Brain className="h-4 w-4" />
              <span>Run Advanced Analysis</span>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default PortfolioAnalyzer;