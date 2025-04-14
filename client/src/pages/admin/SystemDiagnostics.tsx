import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertTriangle, Check, RefreshCw, XCircle, CheckCircle } from "lucide-react";
import { apiRequest } from '@/lib/queryClient';
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";

interface SystemStatus {
  agent: string;
  apiStatus: {
    vision: 'active' | 'pending' | 'failed';
    translation: 'active' | 'pending' | 'failed';
    tts: 'active' | 'pending' | 'failed';
    stt: 'active' | 'pending' | 'failed';
    naturalLanguage: 'active' | 'pending' | 'failed';
    gemini: 'active' | 'pending' | 'failed';
    vertex: 'active' | 'pending' | 'failed';
  };
  chatbot: 'functional' | 'partial' | 'unavailable';
  dashboard: 'accessible' | 'partial' | 'unavailable';
  onboarding: 'working' | 'partial' | 'unavailable';
  accessCodeSystem: 'active' | 'partial' | 'unavailable';
  paymentIntegration: 'working' | 'partial' | 'unavailable';
  missing: string[];
  improvements: string[];
  deploymentReadiness: string;
  readyForLaunch: boolean;
}

// Helper function to get badge variant based on status
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active':
    case 'functional':
    case 'accessible':
    case 'working':
      return 'success';
    case 'partial':
    case 'pending':
      return 'warning';
    case 'failed':
    case 'unavailable':
      return 'destructive';
    default:
      return 'default';
  }
};

// Helper function to get badge text based on status
const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'functional':
      return 'Functional';
    case 'accessible':
      return 'Accessible';
    case 'working':
      return 'Working';
    case 'partial':
      return 'Partial';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Failed';
    case 'unavailable':
      return 'Unavailable';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

// Helper function to get status icon
const StatusIcon = ({ status }: { status: string }) => {
  if (['active', 'functional', 'accessible', 'working'].includes(status)) {
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  } else if (['partial', 'pending'].includes(status)) {
    return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  } else {
    return <XCircle className="h-4 w-4 text-red-500" />;
  }
};

const SystemDiagnostics: React.FC = () => {
  const { toast } = useToast();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Query to get system diagnostics
  const { data: diagnostics, isLoading, isError, error } = useQuery({
    queryKey: ['/api/system/diagnostics', refreshTrigger],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/system/diagnostics');
      if (!response.ok) {
        throw new Error('Failed to fetch system diagnostics');
      }
      return response.json() as Promise<SystemStatus>;
    }
  });

  // Function to refresh diagnostics
  const refreshDiagnostics = () => {
    setRefreshTrigger(prev => prev + 1);
    toast({
      title: "Refreshing diagnostics",
      description: "Running comprehensive system diagnostics...",
    });
  };

  // Calculate deployment readiness percentage as a number
  const readinessPercentage = diagnostics 
    ? parseInt(diagnostics.deploymentReadiness.replace('%', ''))
    : 0;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xl font-medium">Running system diagnostics...</p>
          </div>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout>
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load system diagnostics'}
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={refreshDiagnostics}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Diagnostics
        </Button>
      </AdminLayout>
    );
  }

  if (!diagnostics) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">System Diagnostics</h1>
          <Button variant="outline" onClick={refreshDiagnostics} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Diagnostics
          </Button>
        </div>

        {/* Overview Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>System Health Overview</CardTitle>
            <CardDescription>
              Comprehensive diagnostic report for {diagnostics.agent}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Deployment Readiness */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Deployment Readiness</span>
                  <span className="text-sm font-medium">{diagnostics.deploymentReadiness}</span>
                </div>
                <Progress value={readinessPercentage} className="h-2" />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {diagnostics.readyForLaunch 
                    ? "System is ready for production deployment"
                    : "System requires additional configuration before deployment"}
                </div>
              </div>

              {/* Core Services Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col rounded border p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon status={diagnostics.chatbot} />
                    <span className="text-sm font-medium">Chatbot</span>
                  </div>
                  <Badge variant={getStatusVariant(diagnostics.chatbot) as any} className="self-start">
                    {getStatusText(diagnostics.chatbot)}
                  </Badge>
                </div>
                
                <div className="flex flex-col rounded border p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon status={diagnostics.dashboard} />
                    <span className="text-sm font-medium">Dashboard</span>
                  </div>
                  <Badge variant={getStatusVariant(diagnostics.dashboard) as any} className="self-start">
                    {getStatusText(diagnostics.dashboard)}
                  </Badge>
                </div>
                
                <div className="flex flex-col rounded border p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon status={diagnostics.onboarding} />
                    <span className="text-sm font-medium">Onboarding</span>
                  </div>
                  <Badge variant={getStatusVariant(diagnostics.onboarding) as any} className="self-start">
                    {getStatusText(diagnostics.onboarding)}
                  </Badge>
                </div>
                
                <div className="flex flex-col rounded border p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon status={diagnostics.accessCodeSystem} />
                    <span className="text-sm font-medium">Access Codes</span>
                  </div>
                  <Badge variant={getStatusVariant(diagnostics.accessCodeSystem) as any} className="self-start">
                    {getStatusText(diagnostics.accessCodeSystem)}
                  </Badge>
                </div>
                
                <div className="flex flex-col rounded border p-3 col-span-2 md:col-span-4">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon status={diagnostics.paymentIntegration} />
                    <span className="text-sm font-medium">Payment Integration</span>
                  </div>
                  <Badge variant={getStatusVariant(diagnostics.paymentIntegration) as any} className="self-start">
                    {getStatusText(diagnostics.paymentIntegration)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="api">
          <TabsList className="mb-4">
            <TabsTrigger value="api">API Services</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="improvements">Improvements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Status</CardTitle>
                <CardDescription>
                  Status of all integrated API services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(diagnostics.apiStatus).map(([service, status]) => (
                    <div key={service} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <StatusIcon status={status} />
                        <span className="capitalize">{service === 'tts' ? 'Text-to-Speech' : service === 'stt' ? 'Speech-to-Text' : service} API</span>
                      </div>
                      <Badge variant={getStatusVariant(status) as any}>
                        {getStatusText(status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="issues">
            <Card>
              <CardHeader>
                <CardTitle>Missing Components</CardTitle>
                <CardDescription>
                  Components that need to be implemented or fixed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {diagnostics.missing.length > 0 ? (
                  <ul className="space-y-2">
                    {diagnostics.missing.map((issue, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span>No missing components detected</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="improvements">
            <Card>
              <CardHeader>
                <CardTitle>Suggested Improvements</CardTitle>
                <CardDescription>
                  Recommendations to enhance platform functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                {diagnostics.improvements.length > 0 ? (
                  <ul className="space-y-2">
                    {diagnostics.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span>No improvement suggestions at this time</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Alert variant={diagnostics.readyForLaunch ? "default" : "warning"} className="mt-4">
          {diagnostics.readyForLaunch ? (
            <>
              <Check className="h-4 w-4" />
              <AlertTitle>Ready for Launch</AlertTitle>
              <AlertDescription>
                The system has passed all critical diagnostic checks and is ready for deployment.
              </AlertDescription>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Not Ready for Launch</AlertTitle>
              <AlertDescription>
                The system requires additional configuration before it can be deployed to production.
              </AlertDescription>
            </>
          )}
        </Alert>
      </div>
    </AdminLayout>
  );
};

export default SystemDiagnostics;