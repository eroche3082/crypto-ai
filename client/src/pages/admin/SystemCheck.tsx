import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SystemAuditReport } from "@/components/admin/SystemAuditReport";
import { CheckCircle, AlertCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { checkSystemStatus } from "@/utils/systemAudit";

/**
 * System Check Page
 * Admin page for auditing the entire application
 */
export function SystemCheck() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runSystemCheck();
  }, []);

  const runSystemCheck = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Perform a full system check
      const systemStatus = await checkSystemStatus();
      setResults(systemStatus);
    } catch (err) {
      console.error('Error during system check:', err);
      setError('Failed to complete system check. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'outage':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-50';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50';
      case 'outage':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Check</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive audit and verification of all CryptoBot systems
          </p>
        </div>
        <Button 
          onClick={runSystemCheck} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="components">Component Status</TabsTrigger>
          <TabsTrigger value="audit">Full Audit Report</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Running system check...</p>
              </div>
            </div>
          ) : results ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">API Services</CardTitle>
                  <CardDescription>External and internal APIs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.apis && Object.entries(results.apis).map(([name, status]: [string, any]) => (
                      <div key={name} className="flex justify-between items-center">
                        <span className="font-medium">{name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                          {status.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Frontend Components</CardTitle>
                  <CardDescription>UI modules and components</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.components && Object.entries(results.components).map(([name, status]: [string, any]) => (
                      <div key={name} className="flex justify-between items-center">
                        <span className="font-medium">{name}</span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(status.status)}
                          <span className="text-xs font-medium">{status.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">AI Models</CardTitle>
                  <CardDescription>AI service availability</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.ai && Object.entries(results.ai).map(([name, status]: [string, any]) => (
                      <div key={name} className="flex justify-between items-center">
                        <span className="font-medium">{name}</span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(status.status)}
                          <span className="text-xs font-medium">{status.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="components">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Checking components...</p>
              </div>
            </div>
          ) : results ? (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Component Status</CardTitle>
                  <CardDescription>Status of all application components</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {results.features && Object.entries(results.features).map(([category, items]: [string, any]) => (
                      <div key={category}>
                        <h3 className="font-semibold text-lg mb-3 capitalize">{category}</h3>
                        <div className="space-y-2">
                          {Object.entries(items).map(([name, details]: [string, any]) => (
                            <div key={name} className="bg-card p-3 rounded-lg border">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-medium">{name}</h4>
                                  <p className="text-sm text-muted-foreground">{details.description}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(details.status)}`}>
                                  {details.status}
                                </div>
                              </div>
                              {details.issues && details.issues.length > 0 && (
                                <div className="mt-2 border-t pt-2 text-sm">
                                  <p className="font-semibold text-red-500">Issues:</p>
                                  <ul className="list-disc list-inside">
                                    {details.issues.map((issue: string, i: number) => (
                                      <li key={i} className="text-muted-foreground">{issue}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="audit">
          <SystemAuditReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SystemCheck;