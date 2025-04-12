import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  BrainCircuit, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  ChevronRight,
  Star,
  CircleDollarSign,
  BarChart4,
  Lightbulb,
  Scale,
  Landmark,
  Target,
  CheckCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Investment {
  id: string;
  name: string;
  symbol: string;
  type: 'crypto' | 'stock' | 'etf';
  riskLevel: 'low' | 'medium' | 'high';
  returnPotential: number; // 1-100
  timeHorizon: 'short' | 'medium' | 'long';
  description: string;
  price: number;
  change24h: number;
  marketCap?: number;
  volume24h?: number;
  recommendation: 'strong buy' | 'buy' | 'hold' | 'sell' | 'strong sell';
}

interface UserPreferences {
  riskTolerance: 'low' | 'medium' | 'high';
  investmentAmount: number;
  investmentGoal: 'growth' | 'income' | 'preservation';
  timeHorizon: 'short' | 'medium' | 'long';
}

// Sample data - would come from API in real application
const sampleInvestments: Investment[] = [
  {
    id: '1',
    name: 'Bitcoin',
    symbol: 'BTC',
    type: 'crypto',
    riskLevel: 'high',
    returnPotential: 85,
    timeHorizon: 'long',
    description: 'The original cryptocurrency, a decentralized digital currency without a central authority.',
    price: 63258.42,
    change24h: 2.3,
    marketCap: 1245000000000,
    volume24h: 28500000000,
    recommendation: 'buy'
  },
  {
    id: '2',
    name: 'Ethereum',
    symbol: 'ETH',
    type: 'crypto',
    riskLevel: 'high',
    returnPotential: 80,
    timeHorizon: 'long',
    description: 'A decentralized computing platform featuring smart contract functionality.',
    price: 3121.58,
    change24h: -1.1,
    marketCap: 375000000000,
    volume24h: 15600000000,
    recommendation: 'strong buy'
  },
  {
    id: '3',
    name: 'Crypto Index Fund',
    symbol: 'CIF',
    type: 'etf',
    riskLevel: 'medium',
    returnPotential: 65,
    timeHorizon: 'medium',
    description: 'A diversified basket of top cryptocurrencies weighted by market capitalization.',
    price: 123.45,
    change24h: 0.8,
    recommendation: 'buy'
  },
  {
    id: '4',
    name: 'Stablecoin Yield',
    symbol: 'USDY',
    type: 'crypto',
    riskLevel: 'low',
    returnPotential: 35,
    timeHorizon: 'short',
    description: 'A low-risk stablecoin strategy focusing on yield generation through lending protocols.',
    price: 1.02,
    change24h: 0.1,
    recommendation: 'buy'
  },
  {
    id: '5',
    name: 'Blockchain Tech ETF',
    symbol: 'BTECH',
    type: 'etf',
    riskLevel: 'medium',
    returnPotential: 70,
    timeHorizon: 'medium',
    description: 'An ETF focused on companies developing or utilizing blockchain technology.',
    price: 45.67,
    change24h: 1.5,
    recommendation: 'buy'
  }
];

export default function InvestmentAdvisor() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('recommendations');
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    riskTolerance: 'medium',
    investmentAmount: 5000,
    investmentGoal: 'growth',
    timeHorizon: 'medium'
  });

  // Get selected investment details
  const selectedInvestment = selectedInvestmentId 
    ? sampleInvestments.find(inv => inv.id === selectedInvestmentId) 
    : null;

  // Filtered investments based on user preferences  
  const filteredInvestments = sampleInvestments.filter(inv => {
    if (preferences.riskTolerance === 'low' && inv.riskLevel === 'high') return false;
    if (preferences.riskTolerance === 'high' && inv.riskLevel === 'low') return false;
    if (preferences.timeHorizon === 'short' && inv.timeHorizon === 'long') return false;
    return true;
  });

  const handlePreferenceUpdate = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Preferences Updated",
        description: "Your investment recommendations have been updated based on your preferences.",
      });
    }, 1200);
  };

  const renderRiskBadge = (risk: 'low' | 'medium' | 'high') => {
    switch(risk) {
      case 'low':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600">Low Risk</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">Medium Risk</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600">High Risk</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full md:w-[600px] grid-cols-3">
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Sparkles size={16} />
            {t('investmentAdvisor.recommendations', 'Recommendations')}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Target size={16} />
            {t('investmentAdvisor.preferences', 'Preferences')}
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2">
            <BookOpen size={16} />
            {t('investmentAdvisor.education', 'Education')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          {selectedInvestment ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {selectedInvestment.name} ({selectedInvestment.symbol})
                    </CardTitle>
                    <CardDescription>
                      {selectedInvestment.type === 'crypto' ? 'Cryptocurrency' : 
                       selectedInvestment.type === 'etf' ? 'Exchange Traded Fund' : 'Stock'}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-2xl font-bold">${selectedInvestment.price.toLocaleString()}</span>
                    <span className={selectedInvestment.change24h >= 0 ? "text-green-500" : "text-red-500"}>
                      {selectedInvestment.change24h >= 0 ? '+' : ''}{selectedInvestment.change24h}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Level</span>
                    {renderRiskBadge(selectedInvestment.riskLevel)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Return Potential</span>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedInvestment.returnPotential} className="w-24 h-2" />
                      <span>{selectedInvestment.returnPotential}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Horizon</span>
                    <span className="capitalize">{selectedInvestment.timeHorizon} term</span>
                  </div>
                  {selectedInvestment.marketCap && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Market Cap</span>
                      <span>${(selectedInvestment.marketCap / 1000000000).toFixed(2)}B</span>
                    </div>
                  )}
                  {selectedInvestment.volume24h && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">24h Volume</span>
                      <span>${(selectedInvestment.volume24h / 1000000000).toFixed(2)}B</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recommendation</span>
                    <Badge className="capitalize" variant={
                      selectedInvestment.recommendation.includes('buy') ? 'default' : 
                      selectedInvestment.recommendation.includes('sell') ? 'destructive' : 'outline'
                    }>
                      {selectedInvestment.recommendation}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground text-sm">{selectedInvestment.description}</p>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-3">AI Investment Analysis</h3>
                  <div className="p-4 rounded-lg bg-primary/5 border">
                    <div className="flex items-start gap-2">
                      <BrainCircuit className="shrink-0 text-primary mt-1" size={18} />
                      <div>
                        <p className="text-sm mb-2">
                          {selectedInvestment.symbol} aligns with your {preferences.riskTolerance} risk tolerance and {preferences.timeHorizon}-term horizon. 
                          With a potential return of {selectedInvestment.returnPotential}%, it's suitable for your {preferences.investmentGoal} goal.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Consider allocating {selectedInvestment.riskLevel === 'high' ? '10-15%' : 
                            selectedInvestment.riskLevel === 'medium' ? '15-25%' : '25-35%'} of your portfolio to this asset.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col xs:flex-row gap-3">
                  <Button className="flex-1" onClick={() => setSelectedInvestmentId(null)}>
                    Back to Recommendations
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Add to Watchlist
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles size={18} className="text-primary" />
                    {t('investmentAdvisor.personalizedRecommendations', 'Personalized Investment Recommendations')}
                  </CardTitle>
                  <CardDescription>
                    {t('investmentAdvisor.recommendationsDesc', 'AI-powered investment recommendations based on your preferences and market conditions')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredInvestments.map((investment) => (
                        <div 
                          key={investment.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border bg-card/50 cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => setSelectedInvestmentId(investment.id)}
                        >
                          <div className="flex items-center gap-3 mb-2 sm:mb-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              investment.change24h >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                            }`}>
                              {investment.change24h >= 0 ? (
                                <TrendingUp size={18} className="text-green-500" />
                              ) : (
                                <TrendingDown size={18} className="text-red-500" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{investment.name}</div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">{investment.symbol}</span>
                                {renderRiskBadge(investment.riskLevel)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 ml-13 sm:ml-0">
                            <div className="text-right">
                              <div className="font-medium">${investment.price.toLocaleString()}</div>
                              <div className={investment.change24h >= 0 ? "text-green-500" : "text-red-500"}>
                                {investment.change24h >= 0 ? '+' : ''}{investment.change24h}%
                              </div>
                            </div>
                            <Button size="sm" variant="ghost" className="px-2">
                              <ArrowRight size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4 p-4 rounded-lg bg-primary/5 border">
                    <h3 className="font-medium flex items-center gap-2 mb-2">
                      <BrainCircuit size={16} className="text-primary" />
                      AI Investment Strategy
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Based on your {preferences.riskTolerance} risk tolerance and {preferences.timeHorizon}-term investment horizon,
                      we recommend a diversified portfolio focused on {preferences.investmentGoal}.
                    </p>
                    <div className="text-sm">
                      Consider the following allocation:
                      {preferences.riskTolerance === 'high' ? (
                        <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground">
                          <li>70% high-growth cryptocurrencies</li>
                          <li>20% medium-risk blockchain ETFs</li>
                          <li>10% stablecoins for security</li>
                        </ul>
                      ) : preferences.riskTolerance === 'medium' ? (
                        <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground">
                          <li>40% established cryptocurrencies</li>
                          <li>40% blockchain and tech ETFs</li>
                          <li>20% stablecoins and yield products</li>
                        </ul>
                      ) : (
                        <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground">
                          <li>20% blue-chip cryptocurrencies</li>
                          <li>30% conservative blockchain ETFs</li>
                          <li>50% stablecoins and yield-generating products</li>
                        </ul>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t('investmentAdvisor.marketInsights', 'Market Insights')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg border">
                      <div className="flex gap-3 items-start">
                        <Lightbulb size={18} className="text-primary shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium leading-tight mb-1">Bitcoin Dominance Rising</h4>
                          <p className="text-sm text-muted-foreground">
                            Bitcoin's market dominance has increased to 52%, suggesting a more conservative market sentiment.
                            Consider increasing allocation to established assets.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-lg border">
                      <div className="flex gap-3 items-start">
                        <Scale size={18} className="text-primary shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium leading-tight mb-1">Regulatory Clarity Improving</h4>
                          <p className="text-sm text-muted-foreground">
                            Recent regulatory developments provide more certainty for institutional investors, which may drive increased adoption
                            and capital inflows to the sector.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-lg border">
                      <div className="flex gap-3 items-start">
                        <Landmark size={18} className="text-primary shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium leading-tight mb-1">DeFi Yields Stabilizing</h4>
                          <p className="text-sm text-muted-foreground">
                            Decentralized finance yields have stabilized around 4-6% for lower-risk strategies,
                            making them competitive with traditional fixed-income investments.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('investmentAdvisor.investmentPreferences', 'Investment Preferences')}</CardTitle>
              <CardDescription>
                {t('investmentAdvisor.preferencesDesc', 'Customize your profile to receive tailored investment recommendations')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                handlePreferenceUpdate();
              }}>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="risk-tolerance">
                      {t('investmentAdvisor.riskTolerance', 'Risk Tolerance')}
                    </Label>
                    <Select 
                      defaultValue={preferences.riskTolerance}
                      onValueChange={(value) => setPreferences({...preferences, riskTolerance: value as any})}
                    >
                      <SelectTrigger id="risk-tolerance" className="w-full mt-1.5">
                        <SelectValue placeholder="Select your risk tolerance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t('investmentAdvisor.lowRisk', 'Low Risk')}</SelectItem>
                        <SelectItem value="medium">{t('investmentAdvisor.mediumRisk', 'Medium Risk')}</SelectItem>
                        <SelectItem value="high">{t('investmentAdvisor.highRisk', 'High Risk')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {preferences.riskTolerance === 'low'
                        ? t('investmentAdvisor.lowRiskDesc', 'Focus on capital preservation with lower returns')
                        : preferences.riskTolerance === 'medium'
                        ? t('investmentAdvisor.mediumRiskDesc', 'Balance between growth and stability')
                        : t('investmentAdvisor.highRiskDesc', 'Prioritize high growth potential with higher volatility')
                      }
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="investment-amount">
                      {t('investmentAdvisor.investmentAmount', 'Investment Amount')}
                    </Label>
                    <div className="mt-1.5 relative">
                      <span className="absolute left-3 top-2.5">$</span>
                      <Input
                        id="investment-amount"
                        type="number"
                        className="pl-7"
                        value={preferences.investmentAmount}
                        onChange={(e) => setPreferences({...preferences, investmentAmount: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="investment-goal">
                      {t('investmentAdvisor.investmentGoal', 'Investment Goal')}
                    </Label>
                    <Select 
                      defaultValue={preferences.investmentGoal}
                      onValueChange={(value) => setPreferences({...preferences, investmentGoal: value as any})}
                    >
                      <SelectTrigger id="investment-goal" className="w-full mt-1.5">
                        <SelectValue placeholder="Select your primary goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="growth">{t('investmentAdvisor.growth', 'Growth')}</SelectItem>
                        <SelectItem value="income">{t('investmentAdvisor.income', 'Income')}</SelectItem>
                        <SelectItem value="preservation">{t('investmentAdvisor.preservation', 'Preservation')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {preferences.investmentGoal === 'growth'
                        ? t('investmentAdvisor.growthDesc', 'Maximize long-term capital appreciation')
                        : preferences.investmentGoal === 'income'
                        ? t('investmentAdvisor.incomeDesc', 'Generate regular income from investments')
                        : t('investmentAdvisor.preservationDesc', 'Protect principal while keeping pace with inflation')
                      }
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="time-horizon">
                      {t('investmentAdvisor.timeHorizon', 'Time Horizon')}
                    </Label>
                    <Select 
                      defaultValue={preferences.timeHorizon}
                      onValueChange={(value) => setPreferences({...preferences, timeHorizon: value as any})}
                    >
                      <SelectTrigger id="time-horizon" className="w-full mt-1.5">
                        <SelectValue placeholder="Select your time horizon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">{t('investmentAdvisor.shortTerm', 'Short Term (< 1 year)')}</SelectItem>
                        <SelectItem value="medium">{t('investmentAdvisor.mediumTerm', 'Medium Term (1-5 years)')}</SelectItem>
                        <SelectItem value="long">{t('investmentAdvisor.longTerm', 'Long Term (> 5 years)')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-1">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>{t('investmentAdvisor.updating', 'Updating...')}</span>
                    </div>
                  ) : (
                    t('investmentAdvisor.updatePreferences', 'Update Preferences')
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('investmentAdvisor.investmentStrategy', 'Investment Strategy')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-medium">Allocation Based on Your Preferences</h3>
                  
                  <div className="space-y-4 mt-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>High Risk Assets</span>
                        <span>
                          {preferences.riskTolerance === 'high' ? '70%' : 
                           preferences.riskTolerance === 'medium' ? '40%' : '20%'}
                        </span>
                      </div>
                      <Progress 
                        value={preferences.riskTolerance === 'high' ? 70 : 
                               preferences.riskTolerance === 'medium' ? 40 : 20} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Medium Risk Assets</span>
                        <span>
                          {preferences.riskTolerance === 'high' ? '20%' : 
                           preferences.riskTolerance === 'medium' ? '40%' : '30%'}
                        </span>
                      </div>
                      <Progress 
                        value={preferences.riskTolerance === 'high' ? 20 : 
                               preferences.riskTolerance === 'medium' ? 40 : 30} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Low Risk Assets</span>
                        <span>
                          {preferences.riskTolerance === 'high' ? '10%' : 
                           preferences.riskTolerance === 'medium' ? '20%' : '50%'}
                        </span>
                      </div>
                      <Progress 
                        value={preferences.riskTolerance === 'high' ? 10 : 
                               preferences.riskTolerance === 'medium' ? 20 : 50} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-primary/5 border">
                  <h3 className="font-medium flex items-center gap-2 mb-2">
                    <Target size={16} className="text-primary" />
                    Strategy Summary
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {preferences.riskTolerance === 'high' 
                      ? 'Your high risk tolerance suggests an aggressive growth strategy. Focus on emerging cryptocurrencies with high potential returns, while maintaining a small allocation to stable assets for security.' 
                      : preferences.riskTolerance === 'medium'
                      ? 'Your balanced approach suggests a growth strategy with significant downside protection. Equal allocation between established cryptocurrencies and more stable blockchain investments is recommended.'
                      : 'Your conservative approach prioritizes capital preservation. Focus primarily on stablecoins and established cryptocurrencies while still maintaining exposure to the sector for long-term growth.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('investmentAdvisor.educationalResources', 'Educational Resources')}</CardTitle>
              <CardDescription>
                {t('investmentAdvisor.educationDesc', 'Learn about cryptocurrency investment strategies and concepts')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Crypto Investment Fundamentals</h3>
                    <Badge variant="outline">Beginner</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Learn the basics of cryptocurrency investing, including key concepts, risk management, and portfolio construction.
                  </p>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    Start Learning <ChevronRight size={14} />
                  </Button>
                </div>
                
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Technical Analysis Mastery</h3>
                    <Badge variant="outline">Intermediate</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Understand how to read charts, identify patterns, and use technical indicators to make better trading decisions.
                  </p>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    Start Learning <ChevronRight size={14} />
                  </Button>
                </div>
                
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Advanced DeFi Strategies</h3>
                    <Badge variant="outline">Advanced</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Explore yield farming, liquidity provision, and other advanced DeFi strategies to maximize returns.
                  </p>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    Start Learning <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('investmentAdvisor.glossary', 'Investment Glossary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="font-medium mb-1 flex items-center gap-2">
                    <CircleDollarSign size={16} className="text-primary" />
                    Market Capitalization
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The total value of a cryptocurrency, calculated by multiplying the current price by the circulating supply.
                  </p>
                </div>
                
                <div className="border-b pb-3">
                  <h3 className="font-medium mb-1 flex items-center gap-2">
                    <BarChart4 size={16} className="text-primary" />
                    Volatility
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A measure of how much the price of an asset fluctuates over time. Higher volatility generally indicates higher risk.
                  </p>
                </div>
                
                <div className="border-b pb-3">
                  <h3 className="font-medium mb-1 flex items-center gap-2">
                    <Star size={16} className="text-primary" />
                    Stablecoin
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A type of cryptocurrency designed to maintain a stable value, typically pegged to a fiat currency like the US dollar.
                  </p>
                </div>
                
                <div className="border-b pb-3">
                  <h3 className="font-medium mb-1 flex items-center gap-2">
                    <Target size={16} className="text-primary" />
                    Dollar-Cost Averaging (DCA)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    An investment strategy where you invest a fixed amount at regular intervals, regardless of price, to reduce the impact of volatility.
                  </p>
                </div>
                
                <div className="pb-3">
                  <h3 className="font-medium mb-1 flex items-center gap-2">
                    <CheckCircle size={16} className="text-primary" />
                    Diversification
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Spreading investments across different assets to reduce risk and potential impact of poor performance from any single investment.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <Button variant="link" className="text-sm">
                  View Full Glossary
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="text-xs text-muted-foreground text-center">
        {t('investmentAdvisor.disclaimer', 'The information provided is for educational purposes only and does not constitute investment advice. Cryptocurrency investments are subject to high market risk.')}
      </div>
    </div>
  );
}