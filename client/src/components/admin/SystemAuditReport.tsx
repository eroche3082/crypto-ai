import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  performSystemAudit, 
  TabAuditResult, 
  ChatbotAuditResult 
} from '@/utils/systemAudit';
import { Clipboard, CheckCircle, AlertCircle, AlertTriangle, Plus, Download } from 'lucide-react';

/**
 * System Audit Report Component
 * Displays comprehensive audit of the application
 */
export function SystemAuditReport() {
  const [auditResult, setAuditResult] = useState(() => performSystemAudit());
  const [copied, setCopied] = useState(false);
  
  // Get badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OK':
      case '✅':
        return <Badge className="bg-green-500">OK</Badge>;
      case 'Partial':
      case '⚠️':
        return <Badge className="bg-yellow-500">Partial</Badge>;
      case 'Broken':
      case '❌':
        return <Badge className="bg-red-500">Broken</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };
  
  // Copy audit results to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(auditResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Export audit results as JSON file
  const exportAudit = () => {
    const dataStr = JSON.stringify(auditResult, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'system-audit-report.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  // Refresh audit
  const refreshAudit = () => {
    setAuditResult(performSystemAudit());
  };
  
  // Render tab audit table
  const renderTabsTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tab</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Issues</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">APIs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Suggestions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {auditResult.main_menu_report.main_menu_tabs.map((tab, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{tab.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getStatusBadge(tab.status)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                  {tab.issues.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {tab.issues.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-green-500">No issues found</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                  <ul className="list-disc list-inside">
                    {tab.apis.map((api, i) => (
                      <li key={i}>{api}</li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                  <ul className="list-disc list-inside">
                    {tab.suggestions.map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render chatbot audit
  const renderChatbotAudit = () => {
    const chatbot = auditResult.chatbot_report;
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Core Functionality</CardTitle>
            <CardDescription>Status of essential chatbot features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Visible on all pages</span>
                <span>{chatbot.visible_on_all_pages}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Fullscreen mode</span>
                <span>{chatbot.fullscreen_mode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Floating icon</span>
                <span>{chatbot.floating_icon}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Voice input</span>
                <span>{chatbot.voice_input}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Voice output</span>
                <span>{chatbot.voice_output}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Image input</span>
                <span>{chatbot.image_input}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>QR generator</span>
                <span>{chatbot.qr_generator}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Advanced Features</CardTitle>
            <CardDescription>Intelligence and integration status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Contextual answers</span>
                <span>{chatbot.contextual_answers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Platform knowledge</span>
                <span>{chatbot.platform_knowledge}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>User guidance</span>
                <span>{chatbot.user_guidance}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Firebase integration</span>
                <span>{chatbot.firebase_integration}</span>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Language Support</h4>
                <div className="flex flex-wrap gap-2">
                  {chatbot.language_support.map((lang, i) => (
                    <Badge key={i} variant="outline">{lang}</Badge>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Connected Services</h4>
                <div className="flex flex-wrap gap-2">
                  {chatbot.data_connected.map((service, i) => (
                    <Badge key={i} variant="secondary">{service}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Issues & Suggestions</CardTitle>
            <CardDescription>Known problems and enhancement ideas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                  Broken Features
                </h4>
                <ul className="list-disc list-inside space-y-2">
                  {chatbot.broken_features.length > 0 ? (
                    chatbot.broken_features.map((feature, i) => (
                      <li key={i} className="text-yellow-600 dark:text-yellow-400">{feature}</li>
                    ))
                  ) : (
                    <li className="text-green-500">No broken features reported</li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Plus className="h-4 w-4 mr-2 text-blue-500" />
                  Improvement Suggestions
                </h4>
                <ul className="list-disc list-inside space-y-2">
                  {chatbot.suggestions.map((suggestion, i) => (
                    <li key={i} className="text-blue-600 dark:text-blue-400">{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">System Audit Report</h1>
          <p className="text-gray-500 dark:text-gray-400">Comprehensive analysis of CryptoBot platform status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshAudit}>
            <AlertCircle className="h-4 w-4 mr-2" />
            Refresh Audit
          </Button>
          <Button variant="outline" onClick={copyToClipboard}>
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Clipboard className="h-4 w-4 mr-2" />
                Copy JSON
              </>
            )}
          </Button>
          <Button variant="outline" onClick={exportAudit}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="main-menu" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="main-menu">Main Menu</TabsTrigger>
          <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
        </TabsList>
        <TabsContent value="main-menu" className="mt-6">
          {renderTabsTable()}
        </TabsContent>
        <TabsContent value="chatbot" className="mt-6">
          {renderChatbotAudit()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SystemAuditReport;