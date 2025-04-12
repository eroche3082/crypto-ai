import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Server,
  Database,
  Cpu,
  Network,
  Shield,
  HardDrive
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Audit system types
interface SystemComponent {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning';
  type: 'api' | 'database' | 'service' | 'security' | 'storage';
  lastChecked: string;
  responseTime?: number;
  message?: string;
}

export const SystemAuditReport = () => {
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState<SystemComponent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    runSystemAudit();
  }, []);

  const runSystemAudit = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call the backend API
      // For now, we'll simulate the audit results
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const auditResults: SystemComponent[] = [
        {
          id: 'crypto-api',
          name: 'CoinGecko API',
          status: 'online',
          type: 'api',
          lastChecked: new Date().toISOString(),
          responseTime: 156,
          message: 'All endpoints functioning correctly'
        },
        {
          id: 'moralis-api',
          name: 'Moralis API',
          status: 'online',
          type: 'api',
          lastChecked: new Date().toISOString(),
          responseTime: 203,
          message: 'All endpoints functioning correctly'
        },
        {
          id: 'twitter-api',
          name: 'Twitter API',
          status: 'warning',
          type: 'api',
          lastChecked: new Date().toISOString(),
          responseTime: 523,
          message: 'High latency detected on sentiment analysis endpoint'
        },
        {
          id: 'neon-db',
          name: 'Neon Database',
          status: 'online',
          type: 'database',
          lastChecked: new Date().toISOString(),
          responseTime: 45,
          message: 'Connection pool stable'
        },
        {
          id: 'firebase-auth',
          name: 'Firebase Auth',
          status: 'online',
          type: 'security',
          lastChecked: new Date().toISOString(),
          responseTime: 88,
          message: 'Authentication services operating normally'
        },
        {
          id: 'firebase-storage',
          name: 'Firebase Storage',
          status: 'online',
          type: 'storage',
          lastChecked: new Date().toISOString(),
          responseTime: 112,
          message: 'Storage bucket accessible'
        },
        {
          id: 'gemini-api',
          name: 'Google Gemini AI',
          status: 'online',
          type: 'service',
          lastChecked: new Date().toISOString(),
          responseTime: 320,
          message: 'AI services responding'
        },
        {
          id: 'claude-api',
          name: 'Anthropic Claude',
          status: 'online',
          type: 'service',
          lastChecked: new Date().toISOString(),
          responseTime: 420,
          message: 'AI services responding'
        },
        {
          id: 'openai-api',
          name: 'OpenAI API',
          status: 'online',
          type: 'service',
          lastChecked: new Date().toISOString(),
          responseTime: 380,
          message: 'AI services responding'
        },
        {
          id: 'stripe-api',
          name: 'Stripe API',
          status: 'warning',
          type: 'service',
          lastChecked: new Date().toISOString(),
          responseTime: 267,
          message: 'Test mode only, production key not configured'
        },
        {
          id: 'news-api',
          name: 'News API',
          status: 'warning',
          type: 'api',
          lastChecked: new Date().toISOString(),
          responseTime: 187,
          message: 'Rate limiting detected, 85% of quota used'
        },
        {
          id: 'server-ssl',
          name: 'SSL Certificate',
          status: 'offline',
          type: 'security',
          lastChecked: new Date().toISOString(),
          message: 'Not configured for production'
        }
      ];
      
      setComponents(auditResults);
    } catch (error) {
      console.error('Error running system audit:', error);
      toast({
        title: 'Error',
        description: 'Failed to run system audit',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get component icon based on type
  const getComponentIcon = (type: SystemComponent['type']) => {
    switch (type) {
      case 'api':
        return <Network className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'service':
        return <Cpu className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'storage':
        return <HardDrive className="h-4 w-4" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  // Get status badge component
  const getStatusBadge = (status: SystemComponent['status']) => {
    switch (status) {
      case 'online':
        return (
          <Badge className="bg-green-500 hover:bg-green-600" variant="default">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Online
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600" variant="default">
            <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Warning
          </Badge>
        );
      case 'offline':
        return (
          <Badge className="bg-red-500 hover:bg-red-600" variant="default">
            <XCircle className="h-3.5 w-3.5 mr-1" /> Offline
          </Badge>
        );
      default:
        return null;
    }
  };

  // Count component statuses
  const countComponentStatus = () => {
    return {
      online: components.filter(c => c.status === 'online').length,
      warning: components.filter(c => c.status === 'warning').length,
      offline: components.filter(c => c.status === 'offline').length,
      total: components.length
    };
  };

  const { online, warning, offline, total } = countComponentStatus();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Verification</h2>
          <p className="text-muted-foreground">
            Verify system components and connection status
          </p>
        </div>
        
        <Button 
          onClick={runSystemAudit}
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
          Verify System
        </Button>
      </div>
      
      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <RefreshCw className="h-12 w-12 text-primary animate-spin mb-4" />
              <h3 className="text-xl font-semibold">Running System Verification</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                Checking all system components and connections...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Online Components</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{online}</div>
                <p className="text-sm text-muted-foreground">of {total} components</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Warning Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{warning}</div>
                <p className="text-sm text-muted-foreground">of {total} components</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Offline Components</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{offline}</div>
                <p className="text-sm text-muted-foreground">of {total} components</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>System Components</CardTitle>
              <CardDescription>
                Last verified: {new Date().toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Response Time</TableHead>
                    <TableHead className="hidden lg:table-cell">Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {components.map((component) => (
                    <TableRow key={component.id} className={
                      component.status === 'offline' ? 'bg-red-50/30' : 
                      component.status === 'warning' ? 'bg-yellow-50/30' : 
                      ''
                    }>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getComponentIcon(component.type)}
                          <span>{component.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{component.type}</TableCell>
                      <TableCell>{getStatusBadge(component.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {component.responseTime ? `${component.responseTime}ms` : 'N/A'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {component.message}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SystemAuditReport;