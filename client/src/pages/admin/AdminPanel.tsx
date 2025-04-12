import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SystemAuditReport } from "@/components/admin/SystemAuditReport";
import { PhaseChecklist } from "@/components/admin/PhaseChecklist";
import { SystemDiagnosticReport } from "@/components/admin/SystemDiagnosticReport";
import TabStatusTracker from "@/components/admin/TabStatusTracker";
import { 
  CheckCircle2, 
  ClipboardList, 
  Settings, 
  Users,
  Database,
  MessageSquare,
  LineChart,
  Server,
  FileText,
  Activity,
  Download,
  Save,
  LayoutGrid
} from "lucide-react";

/**
 * AdminPanel Page
 * Comprehensive admin dashboard with phase checklist and system verification
 */
export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('phases');
  const phaseChecklistRef = React.useRef<any>(null);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="bg-background p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground mt-1">
              Monitor, manage and verify project development
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </Button>
            <Button variant="ghost" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" /> System Status
              </CardTitle>
              <CardDescription>Core system health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">Healthy</div>
              <p className="text-sm text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" /> Database
              </CardTitle>
              <CardDescription>Data storage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">Connected</div>
              <p className="text-sm text-muted-foreground">Data services active</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-500" /> AI Services
              </CardTitle>
              <CardDescription>ML services status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">3/3</div>
              <p className="text-sm text-muted-foreground">All AI providers online</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Server className="h-5 w-5 text-orange-500" /> API Gateway
              </CardTitle>
              <CardDescription>External services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">5/6</div>
              <p className="text-sm text-muted-foreground">Most APIs responding</p>
            </CardContent>
          </Card>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6 w-full bg-card/60 border border-border/30">
          <TabsTrigger value="phases" className="flex items-center gap-2 data-[state=active]:bg-background">
            <ClipboardList className="h-4 w-4" />
            Phase Checklist
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2 data-[state=active]:bg-background">
            <Server className="h-4 w-4" />
            System Verification
          </TabsTrigger>
          <TabsTrigger value="diagnostic" className="flex items-center gap-2 data-[state=active]:bg-background">
            <FileText className="h-4 w-4" />
            System Diagnostic
          </TabsTrigger>
          <TabsTrigger value="tabstatus" className="flex items-center gap-2 data-[state=active]:bg-background">
            <LayoutGrid className="h-4 w-4" />
            Tab Status
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-background">
            <LineChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="phases">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Development Phases</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => phaseChecklistRef.current?.exportJson()}
              >
                <Download className="h-4 w-4" />
                Export JSON
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => phaseChecklistRef.current?.exportPdf()}
              >
                <FileText className="h-4 w-4" />
                Export PDF
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="flex items-center gap-1 bg-primary hover:bg-primary/90"
                onClick={() => phaseChecklistRef.current?.saveChanges()}
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
          <PhaseChecklist ref={phaseChecklistRef} />
        </TabsContent>

        <TabsContent value="system">
          <SystemAuditReport />
        </TabsContent>
        
        <TabsContent value="diagnostic">
          <SystemDiagnosticReport />
        </TabsContent>
        
        <TabsContent value="tabstatus">
          <TabStatusTracker />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Project Analytics</CardTitle>
              <CardDescription>
                Insights and metrics about the development progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <LineChart className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground max-w-md">
                  Detailed development analytics will be available here in a future update.
                  This will include component usage, API performance, and user engagement metrics.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

export default AdminPanel;