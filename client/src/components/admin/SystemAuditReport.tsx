import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Server,
  Database,
  Zap,
  Box,
  Activity,
  Clock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

/**
 * System audit report component
 * Displays real-time system status for services and components
 */
export function SystemAuditReport() {
  const [activeTab, setActiveTab] = useState('status');
  
  // Fetch system status data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/system/status'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Convert bytes to MB for memory usage
  const formatMemory = (bytes: number) => {
    return Math.round(bytes / (1024 * 1024));
  };

  // Helper to get appropriate icon for status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get badge for status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Operational
          </Badge>
        );
      case 'degraded':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Degraded
          </Badge>
        );
      case 'down':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Down
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Unknown
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Verification</h2>
          <p className="text-muted-foreground">
            Monitor system status and verify API connections
          </p>
        </div>
        
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh Status
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to fetch system status. Please try again later.
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="py-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Fetching system status...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* System overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.status === 'healthy' ? (
                    <span className="text-green-500">Healthy</span>
                  ) : (
                    <span className="text-yellow-500">Degraded</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {formatDate(data?.timestamp)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Environment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {data?.environment || 'Development'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Application environment
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Uptime
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor((data?.metrics?.uptime || 0) / 60 / 60)} hours
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Server uptime
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Box className="h-4 w-4 text-primary" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.metrics?.memory ? 
                    formatMemory(data.metrics.memory.heapUsed) : 0} MB
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data?.metrics?.memory ? 
                    `of ${formatMemory(data.metrics.memory.heapTotal)} MB allocated` : ''}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="status">Service Status</TabsTrigger>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="status">
              <Card>
                <CardHeader>
                  <CardTitle>API Services</CardTitle>
                  <CardDescription>
                    Status of connected external services and APIs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.services && Object.entries(data.services).map(([name, serviceData]: any) => (
                      <div key={name} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(serviceData.status)}
                          <div>
                            <div className="font-medium capitalize">{name}</div>
                            <div className="text-xs text-muted-foreground">
                              Last checked: {formatDate(serviceData.lastChecked)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(serviceData.status)}
                          {serviceData.issues && serviceData.issues.length > 0 && (
                            <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
                              {serviceData.issues.length} {serviceData.issues.length === 1 ? 'issue' : 'issues'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="components">
              <Card>
                <CardHeader>
                  <CardTitle>System Components</CardTitle>
                  <CardDescription>
                    Internal application components status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.components?.core && Object.entries(data.components.core).map(([name, componentData]: any) => (
                      <div key={name} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(componentData.status)}
                          <div className="font-medium capitalize">{name}</div>
                        </div>
                        <div>{getStatusBadge(componentData.status)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="metrics">
              <Card>
                <CardHeader>
                  <CardTitle>System Metrics</CardTitle>
                  <CardDescription>
                    Performance metrics and resource utilization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data?.metrics ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Memory Utilization</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium">Heap Used</div>
                            <div className="text-xl">{formatMemory(data.metrics.memory.heapUsed)} MB</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Heap Total</div>
                            <div className="text-xl">{formatMemory(data.metrics.memory.heapTotal)} MB</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">RSS</div>
                            <div className="text-xl">{formatMemory(data.metrics.memory.rss)} MB</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">External</div>
                            <div className="text-xl">{formatMemory(data.metrics.memory.external)} MB</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">CPU Usage</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium">User CPU Time</div>
                            <div className="text-xl">{data.metrics.cpuUsage.user} µs</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">System CPU Time</div>
                            <div className="text-xl">{data.metrics.cpuUsage.system} µs</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Uptime</h3>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <div className="text-sm font-medium">Total Uptime</div>
                            <div className="text-xl">
                              {Math.floor(data.metrics.uptime / 60 / 60)} hours, {' '}
                              {Math.floor(data.metrics.uptime / 60) % 60} minutes, {' '}
                              {Math.floor(data.metrics.uptime) % 60} seconds
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      No metrics data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

export default SystemAuditReport;