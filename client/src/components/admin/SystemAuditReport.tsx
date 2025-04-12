import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code } from "@/components/ui/code";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Download, ClipboardCheck, RefreshCw } from "lucide-react";
import { runSystemAudit } from "@/utils/systemAudit";

/**
 * System Audit Report Component
 * Displays comprehensive audit of the application
 */
export function SystemAuditReport() {
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    fetchAuditData();
  }, []);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const results = await runSystemAudit();
      setAudit(results);
    } catch (error) {
      console.error('Error fetching audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const copyToClipboard = () => {
    if (audit) {
      navigator.clipboard.writeText(JSON.stringify(audit, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadAudit = () => {
    if (audit) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(audit, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `cryptobot-audit-${new Date().toISOString()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">System Audit Report</h3>
          <p className="text-muted-foreground">Detailed report of all system components and functionality</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={copyToClipboard}
            className="flex items-center gap-2"
            disabled={loading || !audit}
          >
            {copied ? (
              <>
                <ClipboardCheck className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy JSON
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={downloadAudit}
            className="flex items-center gap-2"
            disabled={loading || !audit}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button 
            onClick={fetchAuditData} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Generating audit report...</p>
          </div>
        </div>
      ) : audit ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Audit Overview</CardTitle>
                  <CardDescription>System audit generated {formatTimestamp(audit.timestamp)}</CardDescription>
                </div>
                <Badge variant={audit.status === 'healthy' ? 'success' : 'destructive'}>
                  {audit.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">System Status</h4>
                  <p className="text-2xl font-bold">{audit.summary.operational} / {audit.summary.total}</p>
                  <p className="text-muted-foreground text-sm">Components Operational</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">API Health</h4>
                  <p className="text-2xl font-bold">{audit.summary.apis.operational} / {audit.summary.apis.total}</p>
                  <p className="text-muted-foreground text-sm">APIs Responding</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Performance</h4>
                  <p className="text-2xl font-bold">{audit.performance?.score || 'N/A'}/100</p>
                  <p className="text-muted-foreground text-sm">Performance Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="api">API Status</TabsTrigger>
              <TabsTrigger value="json">Raw JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <CardTitle>System Summary</CardTitle>
                  <CardDescription>Overview of system health and components</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Status Summary</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="border rounded p-3">
                          <p className="text-sm text-muted-foreground">Operational</p>
                          <p className="text-2xl font-bold text-green-500">{audit.summary.operational}</p>
                        </div>
                        <div className="border rounded p-3">
                          <p className="text-sm text-muted-foreground">Degraded</p>
                          <p className="text-2xl font-bold text-yellow-500">{audit.summary.degraded}</p>
                        </div>
                        <div className="border rounded p-3">
                          <p className="text-sm text-muted-foreground">Outage</p>
                          <p className="text-2xl font-bold text-red-500">{audit.summary.outage}</p>
                        </div>
                        <div className="border rounded p-3">
                          <p className="text-sm text-muted-foreground">Unknown</p>
                          <p className="text-2xl font-bold text-gray-500">{audit.summary.unknown}</p>
                        </div>
                      </div>
                    </div>

                    {audit.issues && audit.issues.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Critical Issues</h3>
                        <div className="space-y-2">
                          {audit.issues.map((issue: any, index: number) => (
                            <Alert key={index} variant={issue.severity === 'critical' ? 'destructive' : 'default'}>
                              <div className="flex flex-col">
                                <div className="font-medium">{issue.title}</div>
                                <AlertDescription className="mt-1">{issue.description}</AlertDescription>
                              </div>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="components">
              <Card>
                <CardHeader>
                  <CardTitle>Component Audit</CardTitle>
                  <CardDescription>Detailed status of all application components</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {audit.components && Object.entries(audit.components).map(([category, items]: [string, any]) => (
                      <div key={category}>
                        <h3 className="font-semibold text-lg mb-3 capitalize">{category}</h3>
                        <div className="space-y-3">
                          {Object.entries(items).map(([name, details]: [string, any]) => (
                            <div key={name} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{name}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">{details.description}</p>
                                </div>
                                <Badge 
                                  variant={
                                    details.status === 'operational' ? 'success' :
                                    details.status === 'degraded' ? 'warning' : 'destructive'
                                  }
                                >
                                  {details.status}
                                </Badge>
                              </div>
                              
                              {details.details && (
                                <div className="mt-4">
                                  <Separator className="my-2" />
                                  <div className="text-sm">
                                    <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                                      {Object.entries(details.details).map(([key, value]: [string, any]) => (
                                        <div key={key} className="flex flex-col">
                                          <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                                          <span className="text-foreground">{String(value)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {details.issues && details.issues.length > 0 && (
                                <div className="mt-4">
                                  <Separator className="my-2" />
                                  <h5 className="font-medium text-sm text-red-500 mb-2">Issues</h5>
                                  <ul className="text-sm list-disc list-inside text-muted-foreground">
                                    {details.issues.map((issue: string, i: number) => (
                                      <li key={i}>{issue}</li>
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
            </TabsContent>

            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle>API Status</CardTitle>
                  <CardDescription>Health check of all API endpoints</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {audit.apis && Object.entries(audit.apis).map(([category, endpoints]: [string, any]) => (
                      <div key={category}>
                        <h3 className="font-semibold text-lg mb-3 capitalize">{category}</h3>
                        <div className="grid gap-3">
                          {Object.entries(endpoints).map(([endpoint, details]: [string, any]) => (
                            <div key={endpoint} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{endpoint}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">{details.url || 'N/A'}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <Badge 
                                    variant={
                                      details.status === 'operational' ? 'success' :
                                      details.status === 'degraded' ? 'warning' : 'destructive'
                                    }
                                  >
                                    {details.status}
                                  </Badge>
                                  {details.latency && (
                                    <span className="text-xs text-muted-foreground">
                                      {details.latency}ms
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {details.lastChecked && (
                                <div className="mt-2 text-sm text-muted-foreground">
                                  Last checked: {formatTimestamp(details.lastChecked)}
                                </div>
                              )}
                              
                              {details.issues && details.issues.length > 0 && (
                                <div className="mt-4">
                                  <Separator className="my-2" />
                                  <h5 className="font-medium text-sm text-red-500 mb-2">Issues</h5>
                                  <ul className="text-sm list-disc list-inside text-muted-foreground">
                                    {details.issues.map((issue: string, i: number) => (
                                      <li key={i}>{issue}</li>
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
            </TabsContent>

            <TabsContent value="json">
              <Card>
                <CardHeader>
                  <CardTitle>Raw Audit Data</CardTitle>
                  <CardDescription>Complete JSON audit report</CardDescription>
                </CardHeader>
                <CardContent>
                  <Code>
                    <pre className="text-xs overflow-auto max-h-[500px] p-4">
                      {JSON.stringify(audit, null, 2)}
                    </pre>
                  </Code>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Alert>
          <AlertDescription>No audit data available. Please click Refresh to generate a new report.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default SystemAuditReport;