import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Pie } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, TrendingUp, XCircle, PieChart, BarChart3, BarChart, Brain, Sparkles, Shield } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { PieChart as RechartsSimplePieChart, Pie as RechartsPie, Cell, ResponsiveContainer, Tooltip, Legend, XAxis, YAxis, CartesianGrid, Bar, BarChart as RechartsBarChart } from 'recharts';

interface RiskMetric {
  name: string;
  value: number;
  description: string;
  status: 'low' | 'medium' | 'high';
}

interface Allocation {
  type: string;
  percentage: number;
  value: number;
  color: string;
}

interface Insight {
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
  title: string;
  description: string;
}

interface Recommendation {
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
  allocation: Allocation[];
  riskMetrics: RiskMetric[];
  insights: Insight[];
  recommendations: Recommendation[];
  aiSummary: string;
  lastUpdated: string;
}

const PortfolioAnalyzer = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  
  // Handle window resize events for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const { data, isLoading, error } = useQuery<{status: string, data: PortfolioAnalysis}>({
    queryKey: ['/api/portfolio/analysis'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return <PortfolioAnalysisLoading />;
  }

  if (error) {
    toast({
      title: t('error.title', "Error"),
      description: t('portfolioAnalysis.error', "Failed to load portfolio analysis."),
      variant: "destructive",
    });
    return <PortfolioAnalysisError />;
  }

  const analysis = data?.data;

  if (!analysis) {
    return <PortfolioAnalysisError />;
  }

  const lastUpdated = new Date(analysis.lastUpdated).toLocaleString();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle>{t('portfolioAnalysis.totalValue', 'Total Portfolio Value')}</CardTitle>
            <CardDescription>{t('portfolioAnalysis.lastUpdated', 'Last updated')}: {lastUpdated}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${analysis.totalValue.toLocaleString()}</div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <ReturnMetric
                label={t('portfolioAnalysis.daily', 'Daily')}
                value={analysis.returns.daily}
                positive={analysis.returns.daily > 0}
              />
              <ReturnMetric
                label={t('portfolioAnalysis.weekly', 'Weekly')}
                value={analysis.returns.weekly}
                positive={analysis.returns.weekly > 0}
              />
              <ReturnMetric
                label={t('portfolioAnalysis.monthly', 'Monthly')}
                value={analysis.returns.monthly}
                positive={analysis.returns.monthly > 0}
              />
              <ReturnMetric
                label={t('portfolioAnalysis.yearly', 'Yearly')}
                value={analysis.returns.yearly}
                positive={analysis.returns.yearly > 0}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Summary */}
      <Card className="relative overflow-hidden">
        <CardHeader className={isMobile ? "pb-2 px-3 pt-3" : "pb-3"}>
          <div className={`flex ${isMobile ? 'flex-col items-start gap-2' : 'items-center justify-between'}`}>
            <CardTitle className="flex items-center gap-2">
              <Brain size={isMobile ? 16 : 18} /> 
              {t('portfolioAnalysis.aiSummary', 'AI Portfolio Analysis')}
            </CardTitle>
            <Badge variant="outline" className={`${isMobile ? 'px-2 py-0.5 text-xs' : 'px-3 py-1'} bg-primary/10`}>
              <Sparkles size={isMobile ? 12 : 14} className="mr-1" />
              {t('portfolioAnalysis.powered', 'Powered by Gemini')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className={isMobile ? "p-3" : ""}>
          <div className={`${isMobile ? 'p-3 text-sm' : 'p-4'} rounded-lg bg-card/50 border mb-4`}>
            {analysis.aiSummary}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Portfolio Allocation */}
        <Card>
          <CardHeader className={isMobile ? "pb-2 px-3 pt-3" : "pb-3"}>
            <CardTitle className="flex items-center gap-2">
              <PieChart size={isMobile ? 14 : 16} /> 
              {t('portfolioAnalysis.allocation', 'Portfolio Allocation')}
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? "px-3 pb-3" : ""}>
            <div className="h-[240px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsSimplePieChart>
                  <RechartsPie
                    data={analysis.allocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 40 : 60}
                    outerRadius={isMobile ? 60 : 80}
                    paddingAngle={2}
                    dataKey="percentage"
                  >
                    {analysis.allocation.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        // Remove bg- prefix for Recharts colors
                        fill={entry.color.replace('bg-', '')}
                      />
                    ))}
                  </RechartsPie>
                  <Tooltip 
                    formatter={(value: number, name: string, props: any) => [`${value}%`, props.payload.type]} 
                    labelFormatter={() => ''} 
                    wrapperStyle={{ 
                      fontSize: isMobile ? '10px' : '12px',
                      padding: isMobile ? '4px' : '8px',
                      lineHeight: isMobile ? '1.2' : '1.5'
                    }}
                  />
                  <Legend 
                    layout={isMobile ? "vertical" : "horizontal"}
                    verticalAlign={isMobile ? "bottom" : "middle"}
                    align={isMobile ? "center" : "right"}
                    wrapperStyle={{ 
                      fontSize: isMobile ? '10px' : '12px', 
                      marginTop: isMobile ? '10px' : '0',
                      width: '100%'
                    }}
                  />
                </RechartsSimplePieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-2">
              {analysis.allocation.map((asset, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${asset.color}`}></div>
                    <span>{asset.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">${asset.value.toLocaleString()}</span>
                    <Badge variant="outline" className="px-1.5 py-0.5">
                      {asset.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Analysis */}
        <Card>
          <CardHeader className={isMobile ? "pb-2 px-3 pt-3" : "pb-3"}>
            <CardTitle className="flex items-center gap-2">
              <Shield size={isMobile ? 14 : 16} />
              {t('portfolioAnalysis.riskAnalysis', 'Risk Analysis')}
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? "px-3 pb-3" : ""}>
            <div className="space-y-6">
              {analysis.riskMetrics.map((metric, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between mb-1">
                    <div className={`${isMobile ? 'text-sm' : ''} font-medium`}>{metric.name}</div>
                    <Badge 
                      variant={metric.status === 'low' ? 'outline' : (metric.status === 'medium' ? 'secondary' : 'destructive')}
                      className={`${isMobile ? 'px-1 py-0 text-xs' : 'px-1.5 py-0.5'}`}
                    >
                      {metric.status}
                    </Badge>
                  </div>
                  <Progress value={metric.value * 100} className="h-2" />
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1`}>
                    {metric.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader className={isMobile ? "pb-2 px-3 pt-3" : "pb-3"}>
          <CardTitle>{t('portfolioAnalysis.insights', 'Portfolio Insights')}</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "p-3" : ""}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.insights.map((insight, i) => (
              <Card key={i} className="border border-border bg-card/60">
                <CardContent className={isMobile ? "p-3" : "pt-6"}>
                  <div className="flex items-start gap-2">
                    <div className={isMobile ? "mt-0.5" : "mt-1"}>
                      {insight.type === 'strength' && 
                        <CheckCircle size={isMobile ? 16 : 18} className="text-green-500" />}
                      {insight.type === 'weakness' && 
                        <AlertTriangle size={isMobile ? 16 : 18} className="text-amber-500" />}
                      {insight.type === 'opportunity' && 
                        <TrendingUp size={isMobile ? 16 : 18} className="text-blue-500" />}
                      {insight.type === 'threat' && 
                        <XCircle size={isMobile ? 16 : 18} className="text-red-500" />}
                    </div>
                    <div className="space-y-1">
                      <div className={`${isMobile ? 'text-sm' : ''} font-medium`}>{insight.title}</div>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader className={isMobile ? "pb-2 px-3 pt-3" : "pb-3"}>
          <CardTitle>{t('portfolioAnalysis.recommendations', 'Recommendations')}</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "p-3" : ""}>
          <div className="space-y-4">
            {analysis.recommendations.map((rec, i) => (
              <div key={i} className={`flex items-start gap-${isMobile ? '2' : '3'} ${isMobile ? 'p-2' : 'p-3'} rounded-lg border border-border`}>
                <div className={isMobile ? "mt-0.5" : "mt-1"}>
                  {rec.impact === 'high' ? (
                    <Badge variant="destructive" className={`${isMobile ? 'px-1 text-xs' : 'px-1.5'}`}>!</Badge>
                  ) : rec.impact === 'medium' ? (
                    <Badge variant="secondary" className={`${isMobile ? 'px-1 text-xs' : 'px-1.5'}`}>+</Badge>
                  ) : (
                    <Badge variant="outline" className={`${isMobile ? 'px-1 text-xs' : 'px-1.5'}`}>•</Badge>
                  )}
                </div>
                <div className="space-y-1 flex-1">
                  <div className={`${isMobile ? 'text-sm' : ''} font-medium`}>{rec.title}</div>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>{rec.description}</p>
                  <div className={`flex ${isMobile ? 'flex-wrap' : ''} items-center gap-2 ${isMobile ? 'mt-1.5' : 'mt-2'}`}>
                    <Badge variant="outline" className={`${isMobile ? 'px-1 py-0 text-[10px]' : 'px-1.5 py-0.5'}`}>
                      {rec.impact} impact
                    </Badge>
                    <Badge variant="outline" className={`${isMobile ? 'px-1 py-0 text-[10px]' : 'px-1.5 py-0.5'}`}>
                      {rec.timeframe} term
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper component for return metrics
const ReturnMetric = ({ label, value, positive }) => {
  return (
    <div className="flex flex-col items-center p-3 rounded-lg bg-card/50 border">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-lg font-semibold ${positive ? 'text-green-500' : 'text-red-500'}`}>
        {positive ? '+' : ''}{value}%
      </span>
    </div>
  );
};

// Loading state
const PortfolioAnalysisLoading = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[150px] w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
      <Skeleton className="h-[300px] w-full" />
    </div>
  );
};

// Error state
const PortfolioAnalysisError = () => {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center justify-center p-10 border rounded-lg">
      <div className="text-center">
        <XCircle size={40} className="text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-2">
          {t('portfolioAnalysis.errorTitle', 'Portfolio Analysis Unavailable')}
        </h3>
        <p className="text-muted-foreground">
          {t('portfolioAnalysis.errorMsg', 'Unable to load your portfolio analysis at this time. Please try again later.')}
        </p>
      </div>
    </div>
  );
};

export default PortfolioAnalyzer;