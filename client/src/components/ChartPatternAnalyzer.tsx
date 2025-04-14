import { useState, useRef } from "react";
import { Upload, AlertCircle, ChevronDown, Scan, CheckCircle2, XCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Define the result structure to match the server response
interface ChartPatternResult {
  pattern: string;
  confidence: number;
  predictedMove: string;
  moveDirection: 'bullish' | 'bearish' | 'neutral';
  timeframe: string;
  entryZone: string;
  stopLoss: string;
  targetZone: string;
  patternInfo: {
    description: string;
    type: string;
    reliability: number;
    timeToTarget: string;
  };
}

export default function ChartPatternAnalyzer() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ChartPatternResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPatternInfoOpen, setIsPatternInfoOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Trigger file input click when button is clicked
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.includes('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Reset states
    setError(null);
    setAnalysisResult(null);
    setIsLoading(true);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 95) {
          clearInterval(progressInterval);
          return 95; // Hold at 95% until processing completes
        }
        return newProgress;
      });
    }, 150);
    
    try {
      // Convert file to base64
      const base64Image = await fileToBase64(file);
      const base64Content = base64Image.split(',')[1]; // Extract base64 content without data URL prefix
      
      // Send to server for analysis
      const response = await fetch('/api/chart-pattern-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Content }),
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to analyze chart');
      }
      
      const result = await response.json();
      setAnalysisResult(result);
      setUploadProgress(100);
      
      // Success notification
      toast({
        title: "Analysis Complete",
        description: `Identified ${result.pattern} pattern with ${Math.round(result.confidence * 100)}% confidence`,
        variant: "default",
      });
    } catch (err) {
      clearInterval(progressInterval);
      setError((err as Error).message || 'Failed to analyze chart');
      setUploadProgress(0);
      
      toast({
        title: "Analysis Failed",
        description: (err as Error).message || 'An error occurred during chart analysis',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>Chart Upload</CardTitle>
            <CardDescription>
              Upload a cryptocurrency chart image to analyze patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            
            {!imagePreview ? (
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={handleUploadClick}
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium mb-1">Click to upload a chart image</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-[16/9] rounded-lg overflow-hidden border">
                  <img 
                    src={imagePreview} 
                    alt="Chart preview" 
                    className="object-cover w-full h-full"
                  />
                </div>
                
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Analyzing chart...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-1.5" />
                  </div>
                ) : (
                  <Button 
                    onClick={handleUploadClick} 
                    variant="outline" 
                    className="w-full"
                  >
                    Upload a different image
                  </Button>
                )}
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive flex items-start gap-2">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Results Area */}
        <Card>
          <CardHeader>
            <CardTitle>Pattern Analysis</CardTitle>
            <CardDescription>
              AI-powered technical pattern recognition results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ) : analysisResult ? (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{analysisResult.pattern}</h3>
                    <div 
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium",
                        analysisResult.moveDirection === 'bullish' ? "bg-green-500/10 text-green-600" :
                        analysisResult.moveDirection === 'bearish' ? "bg-red-500/10 text-red-600" :
                        "bg-yellow-500/10 text-yellow-600"
                      )}
                    >
                      {analysisResult.moveDirection.charAt(0).toUpperCase() + analysisResult.moveDirection.slice(1)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full",
                          analysisResult.confidence >= 0.7 ? "bg-green-500" :
                          analysisResult.confidence >= 0.4 ? "bg-yellow-500" : 
                          "bg-red-500"
                        )}
                        style={{ width: `${analysisResult.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{Math.round(analysisResult.confidence * 100)}%</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1">{analysisResult.predictedMove}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-1">Entry Zone</p>
                    <p className="text-sm font-medium">{analysisResult.entryZone}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-1">Target Zone</p>
                    <p className="text-sm font-medium">{analysisResult.targetZone}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-1">Stop Loss</p>
                    <p className="text-sm font-medium">{analysisResult.stopLoss}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-1">Timeframe</p>
                    <p className="text-sm font-medium">{analysisResult.timeframe}</p>
                  </div>
                </div>
                
                <div>
                  <button
                    onClick={() => setIsPatternInfoOpen(!isPatternInfoOpen)}
                    className="flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm font-medium transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <Scan className="h-4 w-4 text-primary" />
                      <span>Pattern Information</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        isPatternInfoOpen && "rotate-180"
                      )}
                    />
                  </button>
                  
                  {isPatternInfoOpen && (
                    <div className="mt-3 rounded-lg border p-4 text-sm">
                      <div className="mb-3">
                        <p className="font-medium mb-1">Description</p>
                        <p className="text-muted-foreground">{analysisResult.patternInfo.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="font-medium mb-1">Pattern Type</p>
                          <p className="text-muted-foreground">{analysisResult.patternInfo.type}</p>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Reliability</p>
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full",
                                  analysisResult.patternInfo.reliability >= 70 ? "bg-green-500" :
                                  analysisResult.patternInfo.reliability >= 40 ? "bg-yellow-500" : 
                                  "bg-red-500"
                                )}
                                style={{ width: `${analysisResult.patternInfo.reliability}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{analysisResult.patternInfo.reliability}%</span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <p className="font-medium mb-1">Time to Target</p>
                          <p className="text-muted-foreground">{analysisResult.patternInfo.timeToTarget}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <div className="bg-muted/50 p-3 rounded-full mb-3">
                  <Scan className="h-6 w-6" />
                </div>
                <p>Upload a chart to start analysis</p>
                <p className="text-xs mt-1">Supported patterns include trend lines, support/resistance, and common chart formations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Trading Checklist */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Trading Checklist</CardTitle>
            <CardDescription>
              Key considerations before taking a trade based on this pattern
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className={cn(
                  "h-5 w-5 mt-0.5",
                  analysisResult.confidence >= 0.7 ? "text-green-500" : "text-muted-foreground"
                )} />
                <div>
                  <p className="font-medium">Pattern Confidence</p>
                  <p className="text-sm text-muted-foreground">
                    {analysisResult.confidence >= 0.7 
                      ? "High confidence pattern identification" 
                      : "Consider waiting for a stronger pattern confirmation"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle2 className={cn(
                  "h-5 w-5 mt-0.5",
                  analysisResult.patternInfo.reliability >= 70 ? "text-green-500" : "text-muted-foreground"
                )} />
                <div>
                  <p className="font-medium">Historical Reliability</p>
                  <p className="text-sm text-muted-foreground">
                    {analysisResult.patternInfo.reliability >= 70 
                      ? "This pattern has high historical reliability" 
                      : "Consider additional confirmation signals"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Risk Management</p>
                  <p className="text-sm text-muted-foreground">
                    Always set a stop loss and consider your risk-reward ratio
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Market Context</p>
                  <p className="text-sm text-muted-foreground">
                    Consider broader market trends and sentiment before trading
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-3 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-600">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  This is an AI-assisted analysis tool. Always combine with your own research.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}