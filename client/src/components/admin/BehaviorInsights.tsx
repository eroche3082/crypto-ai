import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  PieChart,
  LineChart,
  Calendar,
  Clock,
  MousePointer,
  Keyboard,
  ArrowRight,
  Info,
  Download,
  RefreshCw
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { BehaviorEvent } from '@/utils/phase4Automation';

interface BehaviorInsightsProps {
  className?: string;
}

export const BehaviorInsights: React.FC<BehaviorInsightsProps> = ({
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState(false);
  const [behaviorEvents, setBehaviorEvents] = useState<BehaviorEvent[]>([]);
  const { toast } = useToast();
  
  // Load behavior events
  useEffect(() => {
    loadBehaviorEvents();
  }, []);
  
  const loadBehaviorEvents = async () => {
    setLoading(true);
    
    try {
      // Load from localStorage
      const storedEvents = localStorage.getItem('user_behavior_events');
      
      if (storedEvents) {
        try {
          const events = JSON.parse(storedEvents);
          setBehaviorEvents(events);
        } catch (error) {
          console.error('Error parsing behavior events:', error);
          setBehaviorEvents([]);
        }
      } else {
        setBehaviorEvents([]);
      }
    } catch (error) {
      console.error('Error loading behavior events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load behavior data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Export behavior data as JSON
  const handleExport = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(behaviorEvents, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `behavior-events-${new Date().toISOString()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast({
        title: 'Export Complete',
        description: 'Behavior data exported as JSON',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not export behavior data',
        variant: 'destructive',
      });
    }
  };
  
  // Calculate behavior metrics
  const getBehaviorMetrics = () => {
    const eventCount = behaviorEvents.length;
    
    // Event types
    const clickEvents = behaviorEvents.filter(event => event.action === 'click').length;
    const inputEvents = behaviorEvents.filter(event => event.action === 'input').length;
    const navigationEvents = behaviorEvents.filter(event => event.action === 'navigation').length;
    
    // Tab activity
    const tabCounts = behaviorEvents.reduce((counts, event) => {
      const tab = event.tab || 'unknown';
      counts[tab] = (counts[tab] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    // Most active tabs (sorted)
    const mostActiveTabs = Object.entries(tabCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    // Time patterns
    const timeDistribution = behaviorEvents.reduce((counts, event) => {
      const hour = new Date(event.timestamp).getHours();
      const period = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      counts[period] = (counts[period] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    return {
      eventCount,
      clickEvents,
      inputEvents,
      navigationEvents,
      mostActiveTabs,
      timeDistribution,
    };
  };
  
  // Get relevant metrics
  const metrics = getBehaviorMetrics();
  
  // Calculate relative percentages
  const getPercentage = (count: number) => {
    if (metrics.eventCount === 0) return 0;
    return Math.round((count / metrics.eventCount) * 100);
  };
  
  // Get navigation flow data
  const getNavigationFlow = () => {
    const navigationEvents = behaviorEvents.filter(event => event.action === 'navigation');
    
    // Create a flow map of from -> to
    const flowMap: Record<string, Record<string, number>> = {};
    
    for (let i = 1; i < navigationEvents.length; i++) {
      const prevEvent = navigationEvents[i - 1];
      const currentEvent = navigationEvents[i];
      
      const from = prevEvent.tab || 'unknown';
      const to = currentEvent.tab || 'unknown';
      
      if (!flowMap[from]) {
        flowMap[from] = {};
      }
      
      flowMap[from][to] = (flowMap[from][to] || 0) + 1;
    }
    
    // Convert to array of flows
    const flows = Object.entries(flowMap).flatMap(([from, targets]) => {
      return Object.entries(targets).map(([to, count]) => ({
        from,
        to,
        count,
      }));
    });
    
    // Sort by count (descending)
    return flows.sort((a, b) => b.count - a.count).slice(0, 10);
  };
  
  // Get engagement data over time
  const getEngagementOverTime = () => {
    // Group events by date
    const dateGroups = behaviorEvents.reduce((groups, event) => {
      const date = new Date(event.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
      return groups;
    }, {} as Record<string, BehaviorEvent[]>);
    
    // Convert to array of date and count
    return Object.entries(dateGroups)
      .map(([date, events]) => ({
        date,
        count: events.length,
        clicks: events.filter(event => event.action === 'click').length,
        inputs: events.filter(event => event.action === 'input').length,
        navigations: events.filter(event => event.action === 'navigation').length,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Behavior Insights</h2>
          <p className="text-muted-foreground">
            User behavior analytics and engagement patterns
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button 
            onClick={loadBehaviorEvents}
            variant="default"
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
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.eventCount}</div>
            <p className="text-xs text-muted-foreground">Tracked interactions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Click Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.clickEvents}</div>
            <p className="text-xs text-muted-foreground">{getPercentage(metrics.clickEvents)}% of all events</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Input Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.inputEvents}</div>
            <p className="text-xs text-muted-foreground">{getPercentage(metrics.inputEvents)}% of all events</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Navigation Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.navigationEvents}</div>
            <p className="text-xs text-muted-foreground">{getPercentage(metrics.navigationEvents)}% of all events</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="navigation">Navigation Flows</TabsTrigger>
          <TabsTrigger value="details">Event Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Engagement Over Time</CardTitle>
                <CardDescription>User activity patterns by date</CardDescription>
              </CardHeader>
              <CardContent>
                {getEngagementOverTime().length > 0 ? (
                  <div className="h-80 w-full">
                    {/* In a real implementation, this would be a chart component */}
                    <div className="h-full w-full flex items-center justify-center bg-muted/40 rounded-md">
                      <LineChart className="h-16 w-16 text-muted-foreground/50" />
                      <span className="ml-2 text-muted-foreground">Chart visualization would be here</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-80 w-full flex flex-col items-center justify-center bg-muted/40 rounded-md">
                    <Info className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">Not enough data to show engagement over time</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Most Active Tabs</CardTitle>
                <CardDescription>Tabs with highest engagement</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.mostActiveTabs.length > 0 ? (
                  <div className="space-y-4">
                    {metrics.mostActiveTabs.map(([tab, count], index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-green-500' : 
                            index === 1 ? 'bg-blue-500' : 
                            index === 2 ? 'bg-purple-500' : 
                            'bg-gray-500'
                          } mr-2`} />
                          <span className="text-sm">{tab}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({getPercentage(count)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-40 w-full flex flex-col items-center justify-center">
                    <Info className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No tab activity data</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Time Distribution</CardTitle>
                <CardDescription>Activity by time of day</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(metrics.timeDistribution).length > 0 ? (
                  <div className="h-60 w-full">
                    {/* In a real implementation, this would be a chart component */}
                    <div className="h-full w-full flex items-center justify-center bg-muted/40 rounded-md">
                      <PieChart className="h-12 w-12 text-muted-foreground/50" />
                      <span className="ml-2 text-muted-foreground">Chart visualization would be here</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-60 w-full flex flex-col items-center justify-center">
                    <Clock className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No time distribution data</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Event Types</CardTitle>
                <CardDescription>Breakdown of user interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60 w-full">
                  {/* In a real implementation, this would be a chart component */}
                  <div className="h-full w-full flex items-center justify-center bg-muted/40 rounded-md">
                    <BarChart className="h-12 w-12 text-muted-foreground/50" />
                    <span className="ml-2 text-muted-foreground">Chart visualization would be here</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="navigation">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Navigation Flow Analysis</CardTitle>
              <CardDescription>
                Common paths users take through the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getNavigationFlow().length > 0 ? (
                <div className="space-y-4">
                  {getNavigationFlow().map((flow, index) => (
                    <div key={index} className="flex items-center p-2 rounded-md bg-muted/50">
                      <div className="text-sm font-medium">{flow.from}</div>
                      <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
                      <div className="text-sm font-medium">{flow.to}</div>
                      <div className="flex-1 text-right">
                        <span className="text-sm text-muted-foreground">{flow.count} times</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-60 w-full flex flex-col items-center justify-center">
                  <Info className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Not enough navigation data to analyze flows</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Events</CardTitle>
              <CardDescription>
                Last 50 recorded user interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {behaviorEvents.length > 0 ? (
                <div className="space-y-1 max-h-[600px] overflow-y-auto">
                  {behaviorEvents.slice(-50).reverse().map((event, index) => (
                    <div key={index} className="flex items-start p-2 text-sm rounded-md hover:bg-muted/50">
                      <div className="w-5 mr-2 flex-shrink-0">
                        {event.action === 'click' ? (
                          <MousePointer className="h-4 w-4 text-blue-500" />
                        ) : event.action === 'input' ? (
                          <Keyboard className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowRight className="h-4 w-4 text-purple-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {event.action.charAt(0).toUpperCase() + event.action.slice(1)} on {event.tab}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {event.target || 'Unknown target'}
                        </div>
                      </div>
                      <div className="text-xs text-right text-muted-foreground whitespace-nowrap">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-60 w-full flex flex-col items-center justify-center">
                  <Info className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No behavior events recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BehaviorInsights;