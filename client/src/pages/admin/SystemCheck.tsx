import React from 'react';
import { SystemAuditReport } from '@/components/admin/SystemAuditReport';
import { UniversalChatbot } from '@/components/chat/UniversalChatbot';

/**
 * System Check Page
 * Admin page for auditing the entire application
 */
export function SystemCheck() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">CryptoBot Admin</h1>
          <p className="text-sm opacity-80">System Check & Audit Mode</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <SystemAuditReport />
      </main>
      
      <div className="fixed bottom-4 right-4">
        <UniversalChatbot />
      </div>
    </div>
  );
}

export default SystemCheck;