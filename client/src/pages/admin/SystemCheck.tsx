import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { updateSystemDiagnosticReport, getSystemDiagnosticReport } from '@/utils/systemAudit';

/**
 * SystemCheck Page
 * Runs a diagnostic check and redirects to the admin panel diagnostic tab
 */
export function SystemCheck() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const runDiagnostic = async () => {
      try {
        // Get the current diagnostic report
        const report = getSystemDiagnosticReport();
        
        // Save the report (in a real implementation, this would save to Firebase)
        await updateSystemDiagnosticReport(report);
        
        // Redirect to admin panel with diagnostic tab active
        navigate('/admin?tab=diagnostic');
      } catch (error) {
        console.error('Error running diagnostic:', error);
        // Still redirect to admin panel even if there's an error
        navigate('/admin?tab=diagnostic');
      }
    };
    
    // Run the diagnostic check
    runDiagnostic();
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-pulse text-center">
        <h2 className="text-2xl font-bold mb-4">Running System Diagnostic</h2>
        <p className="text-muted-foreground">
          Analyzing system components and phases...
        </p>
        <div className="mt-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  );
}

export default SystemCheck;