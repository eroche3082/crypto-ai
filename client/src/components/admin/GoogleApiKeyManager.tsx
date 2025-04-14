import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LucideAlertTriangle, LucideCheck, LucideDatabase, LucideKey, LucideRefreshCcw, LucideServer, LucideX } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ServiceInitialization {
  service: string;
  groupId: string;
  isInitialized: boolean;
  timestamp: string;
  error?: string;
}

interface InitializationSummary {
  timestamp: string;
  totalServicesInitialized: number;
  totalServicesFailed: number;
  servicesByGroup: Record<string, string[]>;
  failedServices: Array<{
    service: string;
    attemptedGroup: string;
    error?: string;
  }>;
}

interface ApiKeyManagerReport {
  timestamp: string;
  initializationSummary: InitializationSummary;
  detailedReport: ServiceInitialization[];
}

export default function GoogleApiKeyManager() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('summary');
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    isRefetching
  } = useQuery<ApiKeyManagerReport>({
    queryKey: ['/api/google-api-key-manager/diagnostics'],
    refetchOnWindowFocus: false,
  });
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading API Key Manager diagnostics",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing API Key Manager diagnostics",
      description: "Getting the latest initialization information...",
    });
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Google API Key Manager</CardTitle>
          <CardDescription>Loading API key assignment and initialization data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }
  
  const getServiceColor = (service: string): string => {
    const serviceColors: Record<string, string> = {
      'vertex-ai': 'bg-blue-100 text-blue-800',
      'gemini': 'bg-purple-100 text-purple-800',
      'vision': 'bg-green-100 text-green-800',
      'translate': 'bg-yellow-100 text-yellow-800',
      'language': 'bg-indigo-100 text-indigo-800',
      'speech': 'bg-pink-100 text-pink-800',
      'firebase': 'bg-orange-100 text-orange-800',
      'storage': 'bg-cyan-100 text-cyan-800',
      'maps': 'bg-emerald-100 text-emerald-800',
      'youtube': 'bg-red-100 text-red-800',
    };
    
    return serviceColors[service] || 'bg-gray-100 text-gray-800';
  };
  
  const getGroupColor = (group: string): string => {
    const groupColors: Record<string, string> = {
      'GROUP1': 'bg-blue-100 text-blue-800 border-blue-200',
      'GROUP2': 'bg-green-100 text-green-800 border-green-200',
      'GROUP3': 'bg-amber-100 text-amber-800 border-amber-200',
      'GROUP4': 'bg-purple-100 text-purple-800 border-purple-200',
      'SERVICE_ACCOUNT': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'DIRECT_ENV': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    
    return groupColors[group] || 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
  if (!data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Google API Key Manager</CardTitle>
          <CardDescription>No API key assignment data available.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <LucideAlertTriangle className="h-4 w-4" />
            <AlertTitle>No Data Available</AlertTitle>
            <AlertDescription>
              Could not retrieve API key assignment information. The API Key Manager service might not be initialized.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRefresh} variant="outline" disabled={isRefetching}>
            <LucideRefreshCcw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  const summary = data.initializationSummary;
  const lastUpdated = new Date(data.timestamp).toLocaleString();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <LucideKey className="mr-2 h-5 w-5" /> 
              Google API Key Manager
            </CardTitle>
            <CardDescription>
              Service initialization and API key assignments
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefetching}
          >
            <LucideRefreshCcw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="groups">Group Assignments</TabsTrigger>
            <TabsTrigger value="services">Service Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Services Initialized</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalServicesInitialized}</div>
                  <p className="text-xs text-muted-foreground">Successfully initialized services</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Initialization Failures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalServicesFailed}</div>
                  <p className="text-xs text-muted-foreground">Services that failed to initialize</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active API Groups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Object.keys(summary.servicesByGroup).length}</div>
                  <p className="text-xs text-muted-foreground">Groups with assigned services</p>
                </CardContent>
              </Card>
            </div>
            
            {summary.totalServicesFailed > 0 && (
              <Alert variant="destructive" className="mb-4">
                <LucideAlertTriangle className="h-4 w-4" />
                <AlertTitle>Initialization Failures Detected</AlertTitle>
                <AlertDescription>
                  {summary.totalServicesFailed} service(s) failed to initialize. Check the detailed service report for more information.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </div>
          </TabsContent>
          
          <TabsContent value="groups">
            <div className="space-y-4">
              {Object.entries(summary.servicesByGroup).map(([groupId, services]) => (
                <Card key={groupId} className={`border-l-4 ${getGroupColor(groupId)}`}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <LucideDatabase className="mr-2 h-4 w-4" />
                      API Key Group: {groupId}
                    </CardTitle>
                    <CardDescription>
                      {services.length} service(s) using this API key group
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {services.map(service => (
                        <Badge key={service} variant="outline" className={getServiceColor(service)}>
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {Object.keys(summary.servicesByGroup).length === 0 && (
                <Alert>
                  <LucideAlertTriangle className="h-4 w-4" />
                  <AlertTitle>No API Key Groups Active</AlertTitle>
                  <AlertDescription>
                    No services have been successfully initialized with any API key group.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="services">
            <div className="space-y-4">
              {data.detailedReport.map((service, index) => (
                <Card key={index} className={`border-l-4 ${service.isInitialized ? 'border-green-500' : 'border-red-500'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex justify-between items-center">
                      <span className="flex items-center">
                        <LucideServer className="mr-2 h-4 w-4" />
                        {service.service}
                      </span>
                      {service.isInitialized ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          <LucideCheck className="mr-1 h-3 w-3" /> Initialized
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                          <LucideX className="mr-1 h-3 w-3" /> Failed
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Group: <span className={`px-2 py-0.5 rounded ${getGroupColor(service.groupId)}`}>{service.groupId}</span>
                      <span className="ml-4 text-xs">
                        {new Date(service.timestamp).toLocaleString()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  {!service.isInitialized && service.error && (
                    <CardContent>
                      <Alert variant="destructive">
                        <AlertTitle>Initialization Error</AlertTitle>
                        <AlertDescription className="text-sm font-mono">
                          {service.error}
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  )}
                </Card>
              ))}
              
              {data.detailedReport.length === 0 && (
                <Alert>
                  <LucideAlertTriangle className="h-4 w-4" />
                  <AlertTitle>No Service Initialization Data</AlertTitle>
                  <AlertDescription>
                    No services have attempted initialization yet.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}