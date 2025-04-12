import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Brain,
  Calendar,
  Activity,
  Database,
  Cpu,
  Mic
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface TabStatus {
  name: string;
  proactiveSmartFlow: boolean;
  autoScheduling: boolean;
  crossTabSync: boolean;
  behaviorTracking: boolean;
  feedbackLoops: boolean;
  adminLogs: boolean;
  uiIndicators: boolean;
}

// Define all tabs in the application
const tabs: TabStatus[] = [
  { 
    name: 'Dashboard', 
    proactiveSmartFlow: false, 
    autoScheduling: false, 
    crossTabSync: false, 
    behaviorTracking: false, 
    feedbackLoops: false, 
    adminLogs: false, 
    uiIndicators: false 
  },
  { 
    name: 'Portfolio', 
    proactiveSmartFlow: false, 
    autoScheduling: false,  
    crossTabSync: false, 
    behaviorTracking: false, 
    feedbackLoops: false, 
    adminLogs: false, 
    uiIndicators: false 
  },
  { 
    name: 'Wallet', 
    proactiveSmartFlow: false, 
    autoScheduling: false, 
    crossTabSync: false, 
    behaviorTracking: false, 
    feedbackLoops: false, 
    adminLogs: false, 
    uiIndicators: false 
  },
  { 
    name: 'Analytics', 
    proactiveSmartFlow: false, 
    autoScheduling: false, 
    crossTabSync: false, 
    behaviorTracking: false, 
    feedbackLoops: false, 
    adminLogs: false, 
    uiIndicators: false 
  },
  { 
    name: 'Alerts', 
    proactiveSmartFlow: false, 
    autoScheduling: false, 
    crossTabSync: false, 
    behaviorTracking: false, 
    feedbackLoops: false, 
    adminLogs: false, 
    uiIndicators: false 
  },
  { 
    name: 'News', 
    proactiveSmartFlow: false, 
    autoScheduling: false, 
    crossTabSync: false, 
    behaviorTracking: false, 
    feedbackLoops: false, 
    adminLogs: false, 
    uiIndicators: false 
  },
  { 
    name: 'Locations', 
    proactiveSmartFlow: false, 
    autoScheduling: false, 
    crossTabSync: false, 
    behaviorTracking: false, 
    feedbackLoops: false, 
    adminLogs: false, 
    uiIndicators: false 
  },
  { 
    name: 'Converter', 
    proactiveSmartFlow: false, 
    autoScheduling: false, 
    crossTabSync: false, 
    behaviorTracking: false, 
    feedbackLoops: false, 
    adminLogs: false, 
    uiIndicators: false 
  },
  { 
    name: 'Settings', 
    proactiveSmartFlow: false, 
    autoScheduling: false, 
    crossTabSync: false, 
    behaviorTracking: false, 
    feedbackLoops: false, 
    adminLogs: false, 
    uiIndicators: false 
  },
  { 
    name: 'Education', 
    proactiveSmartFlow: false, 
    autoScheduling: false, 
    crossTabSync: false, 
    behaviorTracking: false, 
    feedbackLoops: false, 
    adminLogs: false, 
    uiIndicators: false 
  },
  { 
    name: 'Tax', 
    proactiveSmartFlow: false, 
    autoScheduling: false, 
    crossTabSync: false, 
    behaviorTracking: false, 
    feedbackLoops: false, 
    adminLogs: false, 
    uiIndicators: false 
  },
  { 
    name: 'Messages', 
    proactiveSmartFlow: false, 
    autoScheduling: false, 
    crossTabSync: false, 
    behaviorTracking: false, 
    feedbackLoops: false, 
    adminLogs: false, 
    uiIndicators: false 
  },
];

interface Phase4StatusCheckProps {
  className?: string;
}

export const Phase4StatusCheck: React.FC<Phase4StatusCheckProps> = ({
  className = '',
}) => {
  const [tabStatus, setTabStatus] = useState<TabStatus[]>(tabs);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();
  
  // Load status on component mount
  useEffect(() => {
    loadStatus();
  }, []);
  
  // Load saved status data
  const loadStatus = async () => {
    setLoading(true);
    
    try {
      // Try to load from localStorage
      const savedStatus = localStorage.getItem('phase4_status');
      
      if (savedStatus) {
        try {
          const parsedStatus = JSON.parse(savedStatus);
          setTabStatus(parsedStatus);
          setLastUpdated(new Date());
        } catch (error) {
          console.error('Error parsing saved status:', error);
        }
      } else {
        // Set demo values for the Dashboard tab to show progress
        // This would be replaced with actual implementation status in a real app
        const updatedStatus = [...tabStatus];
        
        // Dashboard has some features implemented
        const dashboardTab = updatedStatus.find(tab => tab.name === 'Dashboard');
        if (dashboardTab) {
          dashboardTab.proactiveSmartFlow = true;
          dashboardTab.behaviorTracking = true;
          dashboardTab.uiIndicators = true;
        }
        
        // Portfolio has some features implemented
        const portfolioTab = updatedStatus.find(tab => tab.name === 'Portfolio');
        if (portfolioTab) {
          portfolioTab.proactiveSmartFlow = true;
          portfolioTab.autoScheduling = true;
          portfolioTab.behaviorTracking = true;
        }
        
        // Wallet has some features implemented
        const walletTab = updatedStatus.find(tab => tab.name === 'Wallet');
        if (walletTab) {
          walletTab.crossTabSync = true;
          walletTab.behaviorTracking = true;
        }
        
        setTabStatus(updatedStatus);
        setLastUpdated(new Date());
        
        // Save to localStorage
        localStorage.setItem('phase4_status', JSON.stringify(updatedStatus));
      }
    } catch (error) {
      console.error('Error loading status:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Phase 4 status data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Update a tab's status
  const updateTabStatus = (tabName: string, field: keyof Omit<TabStatus, 'name'>, value: boolean) => {
    const updatedStatus = tabStatus.map(tab => {
      if (tab.name === tabName) {
        return { ...tab, [field]: value };
      }
      return tab;
    });
    
    setTabStatus(updatedStatus);
    
    // Save to localStorage
    localStorage.setItem('phase4_status', JSON.stringify(updatedStatus));
    
    // Update last updated time
    setLastUpdated(new Date());
    
    toast({
      title: 'Status Updated',
      description: `${tabName} - ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} set to ${value ? 'complete' : 'incomplete'}`,
    });
  };
  
  // Calculate completion percentage
  const calculateCompletion = () => {
    // Count total features and completed features
    let totalFeatures = 0;
    let completedFeatures = 0;
    
    tabStatus.forEach(tab => {
      // Count each feature
      totalFeatures += 7; // 7 features per tab
      
      // Count completed features
      if (tab.proactiveSmartFlow) completedFeatures++;
      if (tab.autoScheduling) completedFeatures++;
      if (tab.crossTabSync) completedFeatures++;
      if (tab.behaviorTracking) completedFeatures++;
      if (tab.feedbackLoops) completedFeatures++;
      if (tab.adminLogs) completedFeatures++;
      if (tab.uiIndicators) completedFeatures++;
    });
    
    // Calculate percentage
    return (completedFeatures / totalFeatures) * 100;
  };
  
  // Calculate completion by feature
  const calculateFeatureCompletion = () => {
    const features = {
      proactiveSmartFlow: 0,
      autoScheduling: 0,
      crossTabSync: 0,
      behaviorTracking: 0,
      feedbackLoops: 0,
      adminLogs: 0,
      uiIndicators: 0
    };
    
    tabStatus.forEach(tab => {
      if (tab.proactiveSmartFlow) features.proactiveSmartFlow++;
      if (tab.autoScheduling) features.autoScheduling++;
      if (tab.crossTabSync) features.crossTabSync++;
      if (tab.behaviorTracking) features.behaviorTracking++;
      if (tab.feedbackLoops) features.feedbackLoops++;
      if (tab.adminLogs) features.adminLogs++;
      if (tab.uiIndicators) features.uiIndicators++;
    });
    
    // Convert to percentages
    const totalTabs = tabStatus.length;
    return {
      proactiveSmartFlow: (features.proactiveSmartFlow / totalTabs) * 100,
      autoScheduling: (features.autoScheduling / totalTabs) * 100,
      crossTabSync: (features.crossTabSync / totalTabs) * 100,
      behaviorTracking: (features.behaviorTracking / totalTabs) * 100,
      feedbackLoops: (features.feedbackLoops / totalTabs) * 100,
      adminLogs: (features.adminLogs / totalTabs) * 100,
      uiIndicators: (features.uiIndicators / totalTabs) * 100
    };
  };
  
  // Get completion percentage
  const completionPercentage = calculateCompletion();
  const featureCompletion = calculateFeatureCompletion();
  
  // Get completion status text
  const getCompletionStatus = (percentage: number) => {
    if (percentage === 0) return 'Not Started';
    if (percentage < 25) return 'Just Started';
    if (percentage < 50) return 'In Progress';
    if (percentage < 75) return 'Good Progress';
    if (percentage < 100) return 'Almost Done';
    return 'Complete';
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Phase 4 Status</h2>
          <p className="text-muted-foreground">
            Automation & Self-Optimization Implementation Status
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={loadStatus}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
          
          {lastUpdated && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Last updated: {lastUpdated.toLocaleString()}
            </span>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Overall Completion</CardTitle>
          <CardDescription>
            Phase 4 implementation progress across all tabs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {getCompletionStatus(completionPercentage)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(completionPercentage)}%
                </span>
              </div>
              <Progress 
                value={completionPercentage} 
                className="h-2" 
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Smart Flow Logic</span>
                <Progress 
                  value={featureCompletion.proactiveSmartFlow} 
                  className="h-1 flex-1" 
                />
                <span className="text-xs text-muted-foreground">
                  {Math.round(featureCompletion.proactiveSmartFlow)}%
                </span>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Auto-scheduling</span>
                <Progress 
                  value={featureCompletion.autoScheduling} 
                  className="h-1 flex-1" 
                />
                <span className="text-xs text-muted-foreground">
                  {Math.round(featureCompletion.autoScheduling)}%
                </span>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                <Database className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Cross-Tab Sync</span>
                <Progress 
                  value={featureCompletion.crossTabSync} 
                  className="h-1 flex-1" 
                />
                <span className="text-xs text-muted-foreground">
                  {Math.round(featureCompletion.crossTabSync)}%
                </span>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Behavior Tracking</span>
                <Progress 
                  value={featureCompletion.behaviorTracking} 
                  className="h-1 flex-1" 
                />
                <span className="text-xs text-muted-foreground">
                  {Math.round(featureCompletion.behaviorTracking)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Tab-by-Tab Implementation Status</CardTitle>
          <CardDescription>
            Phase 4 feature implementation status for each tab
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tab</TableHead>
                <TableHead>Smart Flow</TableHead>
                <TableHead>Auto-scheduling</TableHead>
                <TableHead>Cross-Tab Sync</TableHead>
                <TableHead>Behavior Tracking</TableHead>
                <TableHead>Feedback Loops</TableHead>
                <TableHead>Admin Logs</TableHead>
                <TableHead>UI Indicators</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tabStatus.map((tab, index) => {
                // Calculate completion for this tab
                const completedFeatures = [
                  tab.proactiveSmartFlow,
                  tab.autoScheduling,
                  tab.crossTabSync,
                  tab.behaviorTracking,
                  tab.feedbackLoops,
                  tab.adminLogs,
                  tab.uiIndicators
                ].filter(Boolean).length;
                
                const tabPercentage = (completedFeatures / 7) * 100;
                
                // Determine status
                let status;
                if (tabPercentage === 0) {
                  status = <Badge variant="outline" className="text-muted-foreground">Not Started</Badge>;
                } else if (tabPercentage < 50) {
                  status = <Badge variant="outline" className="text-yellow-500">In Progress</Badge>;
                } else if (tabPercentage < 100) {
                  status = <Badge variant="outline" className="text-blue-500">Partial</Badge>;
                } else {
                  status = <Badge variant="outline" className="text-green-500">Complete</Badge>;
                }
                
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{tab.name}</TableCell>
                    <TableCell>
                      {tab.proactiveSmartFlow ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {tab.autoScheduling ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {tab.crossTabSync ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {tab.behaviorTracking ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {tab.feedbackLoops ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {tab.adminLogs ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {tab.uiIndicators ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {status}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Phase 4 Components</CardTitle>
            <CardDescription>
              Core system components for Phase 4
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">AI Recommendation Engine</span>
                </div>
                <Badge variant="outline" className="text-green-500">Deployed</Badge>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Firebase Sync Layer</span>
                </div>
                <Badge variant="outline" className="text-green-500">Deployed</Badge>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Behavior Analytics</span>
                </div>
                <Badge variant="outline" className="text-green-500">Deployed</Badge>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Action Scheduler</span>
                </div>
                <Badge variant="outline" className="text-green-500">Deployed</Badge>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Cross-Tab Awareness</span>
                </div>
                <Badge variant="outline" className="text-green-500">Deployed</Badge>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Voice Controls</span>
                </div>
                <Badge variant="outline" className="text-amber-500">Optional</Badge>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Implementation Roadmap</CardTitle>
            <CardDescription>
              Phase 4 implementation sequence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 relative border-l border-muted pl-6 ml-2">
              <li className="relative -ml-8">
                <div className="absolute left-0 -translate-x-1/2 bg-primary/10 border border-primary/40 p-0.5 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium">Phase 4.1: Core Infrastructure</h4>
                  <p className="text-xs text-muted-foreground">
                    Firebase integration, behavior tracking, recommendation engine
                  </p>
                </div>
              </li>
              <li className="relative -ml-8">
                <div className="absolute left-0 -translate-x-1/2 bg-primary/10 border border-primary/40 p-0.5 rounded-full">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium">Phase 4.2: Smart Flows</h4>
                  <p className="text-xs text-muted-foreground">
                    Proactive suggestions, contextual triggers per tab
                  </p>
                </div>
              </li>
              <li className="relative -ml-8">
                <div className="absolute left-0 -translate-x-1/2 bg-muted p-0.5 rounded-full">
                  <Clock className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium">Phase 4.3: Auto-Actions</h4>
                  <p className="text-xs text-muted-foreground">
                    Scheduled tasks, automated portfolio adjustments
                  </p>
                </div>
              </li>
              <li className="relative -ml-8">
                <div className="absolute left-0 -translate-x-1/2 bg-muted p-0.5 rounded-full">
                  <Clock className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium">Phase 4.4: Feedback Systems</h4>
                  <p className="text-xs text-muted-foreground">
                    Recommendation learning, action success tracking
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Phase4StatusCheck;