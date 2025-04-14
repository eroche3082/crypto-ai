import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, AlertTriangle, CheckCircle, XCircle, Server, Cpu, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Vertex AI Diagnostics Component
const VertexAIDiagnostics = () => {
  const { toast } = useToast();
  
  // Query for Vertex AI diagnostic data - using new enhanced endpoint
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['/api/vertex-ai-diagnostics'],
    staleTime: 60000, // 1 minute
  });
  
  // Handle running a comprehensive diagnostic
  const runComprehensiveDiagnostic = async () => {
    toast({
      title: "Running comprehensive diagnostics",
      description: "This may take a moment...",
      duration: 3000,
    });
    
    try {
      const response = await fetch('/api/vertex-ai-diagnostics/comprehensive');
      const result = await response.json();
      
      toast({
        title: "Comprehensive diagnostics complete",
        description: `Status: ${result.overallStatus}`,
        duration: 3000,
      });
      
      // Refetch the basic diagnostics
      refetch();
    } catch (err) {
      toast({
        title: "Error running comprehensive diagnostics",
        description: "Please try again later",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load Vertex AI diagnostics information.
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  // Status color mapping
  const getStatusColor = (status: string) => {
    if (status === 'success') return 'bg-green-500 hover:bg-green-600';
    if (status === 'warning') return 'bg-yellow-500 hover:bg-yellow-600';
    if (status === 'error') return 'bg-red-500 hover:bg-red-600';
    return 'bg-gray-500 hover:bg-gray-600';
  };
  
  // Status icon mapping
  const getStatusIcon = (status: string) => {
    if (status === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    if (status === 'error') return <XCircle className="h-5 w-5 text-red-500" />;
    return <AlertTriangle className="h-5 w-5 text-gray-500" />;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col-reverse md:flex-row gap-6">
        {/* Main diagnostic card */}
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Vertex AI Diagnostic Results</CardTitle>
              <Badge 
                className={getStatusColor(data?.status || 'unknown')}
                variant="outline"
              >
                {data?.status?.toUpperCase() || 'UNKNOWN'}
              </Badge>
            </div>
            <CardDescription>
              Diagnostics for Google Vertex AI and Gemini API connectivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="mr-3">
                    {data?.apiConnectivity ? 
                      <CheckCircle className="h-5 w-5 text-green-500" /> : 
                      <XCircle className="h-5 w-5 text-red-500" />
                    }
                  </div>
                  <div>
                    <p className="font-medium">API Connectivity</p>
                    <p className="text-sm text-gray-500">
                      {data?.apiConnectivity ? 'Connected' : 'Disconnected'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="mr-3">
                    <Database className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Quota Status</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {data?.quotaStatus || 'Unknown'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="mr-3">
                    <Cpu className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">Billing Status</p>
                    <p className="text-sm text-gray-500">
                      {data?.billingActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                
                {data?.modelUsed && (
                  <div className="flex items-center">
                    <div className="mr-3">
                      <Server className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div>
                      <p className="font-medium">Model</p>
                      <p className="text-sm text-gray-500">
                        {data.modelUsed}
                      </p>
                    </div>
                  </div>
                )}
                
                {data?.responseTime && (
                  <div className="md:col-span-2">
                    <p className="font-medium mb-1">Response Time</p>
                    <div className="space-y-2">
                      <Progress value={Math.min(100, (data.responseTime / 5000) * 100)} />
                      <p className="text-sm text-gray-500">
                        {data.responseTime}ms
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {data?.errorDetails && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error Details</AlertTitle>
                  <AlertDescription className="mt-2 text-xs whitespace-pre-wrap max-h-[150px] overflow-y-auto">
                    {data.errorDetails}
                  </AlertDescription>
                </Alert>
              )}
              
              {data?.recommendedAction && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Recommended Action</AlertTitle>
                  <AlertDescription>
                    {data.recommendedAction}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => refetch()} 
              disabled={isFetching}
              size="sm"
            >
              {isFetching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Run Basic Diagnostic
            </Button>
            
            <Button 
              onClick={runComprehensiveDiagnostic} 
              disabled={isFetching}
              size="sm"
            >
              Run Comprehensive Test
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Vertex AI Resources</CardTitle>
          <CardDescription>
            Helpful links for troubleshooting and configuring Vertex AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a 
                href="https://console.cloud.google.com/vertex-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <h3 className="font-medium">Vertex AI Console</h3>
                <p className="text-sm text-gray-500">Access the Google Cloud Vertex AI Console</p>
              </a>
              
              <a 
                href="https://console.cloud.google.com/apis/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <h3 className="font-medium">API Console</h3>
                <p className="text-sm text-gray-500">Enable and manage Google Cloud APIs</p>
              </a>
              
              <a 
                href="https://console.cloud.google.com/iam-admin/serviceaccounts"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <h3 className="font-medium">Service Accounts</h3>
                <p className="text-sm text-gray-500">Manage service accounts and keys</p>
              </a>
              
              <a 
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <h3 className="font-medium">API Credentials</h3>
                <p className="text-sm text-gray-500">Manage API keys and OAuth credentials</p>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Define status badge colors
const statusColors = {
  online: 'bg-green-500 hover:bg-green-600',
  degraded: 'bg-yellow-500 hover:bg-yellow-600',
  offline: 'bg-red-500 hover:bg-red-600',
  unknown: 'bg-gray-500 hover:bg-gray-600',
  not_configured: 'bg-slate-500 hover:bg-slate-600'
};

// Status icon component
const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'online':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'degraded':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'offline':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'not_configured':
      return <AlertTriangle className="h-5 w-5 text-slate-500" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-gray-500" />;
  }
};

// Format function for bytes
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function ApiHealthDashboard() {
  const { toast } = useToast();
  
  // Fetch API status
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['/api/system/api-status'],
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
  
  // Handle refresh
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing API status",
      description: "Fetching the latest API health information",
      duration: 2000,
    });
  };
  
  // Overall health status
  const getOverallStatus = () => {
    if (!data?.apis) return 'unknown';
    
    const statuses = Object.values(data.apis).map((api: any) => api.status);
    
    if (statuses.every(status => status === 'online')) return 'online';
    if (statuses.some(status => status === 'offline')) return 'offline';
    if (statuses.some(status => status === 'degraded')) return 'degraded';
    return 'unknown';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Loading API health status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Error loading API status</h3>
        <p className="text-gray-500 mb-4">
          There was a problem fetching the API health dashboard data.
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Health Dashboard</h1>
          <p className="text-gray-500">
            Monitor the status of all external APIs and data sources
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh} 
          disabled={isFetching}
          className="flex items-center gap-2"
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>
      
      <div className="mb-8">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>System Health Overview</CardTitle>
              <Badge 
                className={statusColors[getOverallStatus()]}
                variant="outline"
              >
                {getOverallStatus().toUpperCase()}
              </Badge>
            </div>
            <CardDescription>
              Last updated: {data?.timestamp ? new Date(data.timestamp).toLocaleString() : 'Unknown'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>API Name</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.apis && Object.entries(data.apis).map(([key, api]: [string, any]) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{key}</TableCell>
                    <TableCell>{api.provider}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusIcon status={api.status} />
                        <span className="capitalize">{api.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{api.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="cache">
        <TabsList className="mb-4">
          <TabsTrigger value="cache">Cache Statistics</TabsTrigger>
          <TabsTrigger value="vertex">Vertex AI Diagnostics</TabsTrigger>
          <TabsTrigger value="details">Technical Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cache">
          <div className="grid gap-6 md:grid-cols-2">
            {data?.cache && Object.entries(data.cache).map(([provider, stats]: [string, any]) => (
              <Card key={provider}>
                <CardHeader>
                  <CardTitle className="capitalize">{provider} Cache</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats).map(([cacheType, cacheStats]: [string, any]) => (
                      <div key={cacheType} className="border-t pt-4 first:border-0 first:pt-0">
                        <h4 className="text-sm font-medium mb-2 capitalize">{cacheType}</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Entries</p>
                            <p className="text-lg font-medium">{cacheStats.entries}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Size</p>
                            <p className="text-lg font-medium">{cacheStats.size ? formatBytes(cacheStats.size) : 'Unknown'}</p>
                          </div>
                        </div>
                        {cacheStats.keys && cacheStats.keys.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500 mb-1">Cached Keys:</p>
                            <div className="text-xs text-gray-500 max-h-20 overflow-y-auto scrollbar-thin">
                              {cacheStats.keys.map((key: string, index: number) => (
                                <Badge key={index} variant="outline" className="mr-1 mb-1">
                                  {key.length > 30 ? `${key.substring(0, 30)}...` : key}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="vertex">
          <VertexAIDiagnostics />
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Raw API Status Response</CardTitle>
              <CardDescription>
                View the complete API status data for debugging purposes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto max-h-[500px]">
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}