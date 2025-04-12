import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Image, ChevronDown, FileText, PlusCircle, Check, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AIImageAnalysisResponse {
  insights: string[];
  patterns: {
    name: string;
    confidence: number;
    description: string;
  }[];
  recommendation: string;
  prediction: {
    direction: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    timeframe: string;
  };
}

export default function MarketVision() {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Mock analysis data - in real application this would come from API
  const mockAnalysis: AIImageAnalysisResponse = {
    insights: [
      "A double bottom pattern has formed, indicating a potential reversal from the downtrend.",
      "Trading volume has been decreasing during the downtrend, suggesting a weakening of selling pressure.",
      "The price has broken above the 50-day moving average, which could signal a change in trend direction."
    ],
    patterns: [
      {
        name: "Double Bottom",
        confidence: 85,
        description: "A bullish reversal pattern with two roughly equal lows, signaling potential upward movement."
      },
      {
        name: "Moving Average Crossover",
        confidence: 68,
        description: "The 20-day moving average crossing above the 50-day moving average signals a potential bullish trend."
      },
      {
        name: "Volume Divergence",
        confidence: 72,
        description: "Decrease in volume during price declines indicates weakening selling pressure."
      }
    ],
    recommendation: "Consider establishing a small long position with a stop loss below the recent swing low. Look for confirmation of the trend reversal with increased buying volume and price consolidation above the 50-day moving average.",
    prediction: {
      direction: "bullish",
      confidence: 72,
      timeframe: "short-term (1-2 weeks)"
    }
  };

  const handleUpload = () => {
    // Simulate upload process
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setIsAnalyzing(true);
          
          // Simulate API response time
          setTimeout(() => {
            setIsAnalyzing(false);
            setShowAnalysis(true);
          }, 1500);
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleReset = () => {
    setShowAnalysis(false);
    setActiveTab('upload');
  };

  if (showAnalysis) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>{t('marketVision.analysisResults', 'Chart Analysis Results')}</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleReset} className="px-2 py-1 h-8">
                {t('marketVision.newAnalysis', 'New Analysis')}
              </Button>
            </div>
            <CardDescription>
              {t('marketVision.aiPowered', 'AI-powered analysis of your uploaded chart')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 rounded-lg border bg-card/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{t('marketVision.prediction', 'Market Prediction')}</h3>
                <Badge variant={mockAnalysis.prediction.direction === 'bullish' ? 'default' : (mockAnalysis.prediction.direction === 'bearish' ? 'destructive' : 'outline')}>
                  {mockAnalysis.prediction.direction.toUpperCase()}
                </Badge>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">{t('marketVision.confidence', 'Confidence')}</span>
                  <span className="text-sm font-medium">{mockAnalysis.prediction.confidence}%</span>
                </div>
                <Progress value={mockAnalysis.prediction.confidence} className="h-2" />
              </div>
              
              <div className="flex justify-between text-sm mt-3">
                <span className="text-muted-foreground">{t('marketVision.timeframe', 'Timeframe')}: </span>
                <span>{mockAnalysis.prediction.timeframe}</span>
              </div>
            </div>
            
            <Tabs defaultValue="insights" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="insights">{t('marketVision.insights', 'Insights')}</TabsTrigger>
                <TabsTrigger value="patterns">{t('marketVision.patterns', 'Patterns')}</TabsTrigger>
                <TabsTrigger value="recommendation">{t('marketVision.recommendation', 'Recommendation')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="insights" className="p-4 border rounded-lg mt-4">
                <ul className="space-y-3">
                  {mockAnalysis.insights.map((insight, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <PlusCircle size={16} className="shrink-0 mt-1 text-primary" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              
              <TabsContent value="patterns" className="space-y-4 p-4 border rounded-lg mt-4">
                {mockAnalysis.patterns.map((pattern, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{pattern.name}</h4>
                      <span className="text-sm">{pattern.confidence}% {t('marketVision.confidence', 'confidence')}</span>
                    </div>
                    <Progress value={pattern.confidence} className="h-2" />
                    <p className="text-sm text-muted-foreground">{pattern.description}</p>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="recommendation" className="p-4 border rounded-lg mt-4">
                <p className="text-sm">{mockAnalysis.recommendation}</p>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                {t('marketVision.disclaimer', 'These results are based on pattern recognition and historical data analysis. They do not guarantee future market performance.')}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('marketVision.historicalAnalyses', 'Historical Analyses')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-card/50 border">
              <div className="flex items-center gap-3">
                <Image size={24} className="text-primary" />
                <div>
                  <div className="font-medium">BTC/USD Daily Chart</div>
                  <div className="text-xs text-muted-foreground">Analyzed 2 days ago</div>
                </div>
              </div>
              <Badge variant="outline">{t('marketVision.bullish', 'BULLISH')}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-card/50 border">
              <div className="flex items-center gap-3">
                <Image size={24} className="text-primary" />
                <div>
                  <div className="font-medium">ETH/USD 4H Chart</div>
                  <div className="text-xs text-muted-foreground">Analyzed 5 days ago</div>
                </div>
              </div>
              <Badge variant="destructive">{t('marketVision.bearish', 'BEARISH')}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('marketVision.title', 'Market Vision')}</CardTitle>
          <CardDescription>
            {t('marketVision.description', 'Upload financial charts or market data for AI-powered analysis and pattern recognition.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="upload">
                <Upload size={14} className="mr-2" />
                {t('marketVision.upload', 'Upload')}
              </TabsTrigger>
              <TabsTrigger value="history">
                <FileText size={14} className="mr-2" />
                {t('marketVision.history', 'History')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload">
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg bg-card/50 text-center">
                {isUploading ? (
                  <div className="w-full max-w-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">{t('marketVision.uploading', 'Uploading...')}</span>
                      <span className="text-sm">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2 mb-4" />
                  </div>
                ) : isAnalyzing ? (
                  <div className="space-y-4">
                    <div className="animate-pulse flex space-x-4">
                      <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-primary/15 rounded w-3/4 mx-auto"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-primary/10 rounded"></div>
                          <div className="h-3 bg-primary/10 rounded w-5/6"></div>
                          <div className="h-3 bg-primary/10 rounded w-4/6"></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{t('marketVision.analyzing', 'Analyzing chart patterns and market indicators...')}</p>
                  </div>
                ) : (
                  <>
                    <Upload size={40} className="text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {t('marketVision.uploadTitle', 'Upload Chart or Image')}
                    </h3>
                    <p className="text-muted-foreground max-w-md mb-4">
                      {t('marketVision.uploadDescription', 'Drag and drop market charts, technical analysis screenshots, or financial data visualizations for AI interpretation.')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 mt-2">
                      <Button onClick={handleUpload}>
                        {t('marketVision.selectFile', 'Select File')}
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            {t('marketVision.examples', 'Use Example')} <ChevronDown size={14} className="ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                          <DropdownMenuGroup>
                            <DropdownMenuItem onClick={handleUpload}>
                              <Image size={14} className="mr-2" />
                              <span>BTC/USD Daily Chart</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleUpload}>
                              <Image size={14} className="mr-2" />
                              <span>ETH/USD 4H Chart</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleUpload}>
                              <Image size={14} className="mr-2" />
                              <span>Market Heatmap</span>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">{t('marketVision.supportedFormats', 'Supported Formats')}</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">PNG</Badge>
                  <Badge variant="outline">JPG</Badge>
                  <Badge variant="outline">JPEG</Badge>
                  <Badge variant="outline">WEBP</Badge>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              {/* History tab content */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-card/50 border">
                  <div className="flex items-center gap-3">
                    <Image size={24} className="text-primary" />
                    <div>
                      <div className="font-medium">BTC/USD Daily Chart</div>
                      <div className="text-xs text-muted-foreground">Analyzed 2 days ago</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowAnalysis(true)}>
                    {t('marketVision.view', 'View')}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-card/50 border">
                  <div className="flex items-center gap-3">
                    <Image size={24} className="text-primary" />
                    <div>
                      <div className="font-medium">ETH/USD 4H Chart</div>
                      <div className="text-xs text-muted-foreground">Analyzed 5 days ago</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowAnalysis(true)}>
                    {t('marketVision.view', 'View')}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('marketVision.featuresTitle', 'Market Vision Features')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card/50">
              <h3 className="flex items-center gap-1 font-medium mb-2">
                <Check size={16} className="text-green-500" />
                {t('marketVision.patternRecognition', 'Pattern Recognition')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('marketVision.patternRecognitionDesc', 'Automatically identify technical chart patterns like head and shoulders, double tops, flags, and more.')}
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-card/50">
              <h3 className="flex items-center gap-1 font-medium mb-2">
                <Check size={16} className="text-green-500" />
                {t('marketVision.sentimentAnalysis', 'Trend Prediction')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('marketVision.sentimentAnalysisDesc', 'Get AI-powered predictions on potential market movements based on historical pattern success rates.')}
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-card/50">
              <h3 className="flex items-center gap-1 font-medium mb-2">
                <Check size={16} className="text-green-500" />
                {t('marketVision.technicalIndicators', 'Technical Indicators')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('marketVision.technicalIndicatorsDesc', 'Identify key technical indicators like MACD, RSI, moving averages, and support/resistance levels in your charts.')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}