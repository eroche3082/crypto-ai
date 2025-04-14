import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon, CheckCircledIcon, CrossCircledIcon, ReloadIcon } from "@radix-ui/react-icons";
import { apiRequest } from '@/lib/queryClient';

interface ServiceTestResult {
  service: string;
  success: boolean;
  timestamp: string;
  response?: any;
  error?: string;
}

interface TestReport {
  timestamp: string;
  results: ServiceTestResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  }
}

const GoogleServiceTests: React.FC = () => {
  const [testReport, setTestReport] = useState<TestReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to run tests
  const runTests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('GET', '/api/system/google-services-test');
      const data = await response.json();
      setTestReport(data);
    } catch (err) {
      console.error('Error running Google service tests:', err);
      setError('Failed to run Google service tests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Run tests on component mount
  useEffect(() => {
    runTests();
  }, []);

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };

  // Helper function to generate a sensible service display name
  const getServiceDisplayName = (serviceName: string) => {
    switch (serviceName) {
      case 'text-to-speech':
        return 'Text-to-Speech API';
      case 'vision':
        return 'Vision API';
      case 'language':
        return 'Natural Language API';
      case 'translate':
        return 'Translation API';
      case 'speech':
        return 'Speech-to-Text API';
      default:
        return serviceName.charAt(0).toUpperCase() + serviceName.slice(1) + ' API';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Google Cloud Service Tests</span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={runTests} 
            disabled={loading}
            className="flex items-center gap-1"
          >
            {loading ? (
              <>
                <ReloadIcon className="h-4 w-4 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <ReloadIcon className="h-4 w-4" />
                <span>Run Tests</span>
              </>
            )}
          </Button>
        </CardTitle>
        <CardDescription>
          Test connectivity to Google Cloud APIs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loading && !testReport ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between space-x-4">
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-6 w-[80px]" />
              </div>
            ))}
          </div>
        ) : testReport ? (
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Last test run:</span>
                <span>{formatTimestamp(testReport.timestamp)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Success rate:</span>
                <span>{testReport.summary.successful}/{testReport.summary.total} services</span>
              </div>
            </div>
            
            <div className="divide-y">
              {testReport.results.map((result, index) => (
                <div key={index} className="py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{getServiceDisplayName(result.service)}</span>
                    {result.success ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800 flex items-center gap-1">
                        <CheckCircledIcon className="h-3.5 w-3.5" />
                        Working
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800 flex items-center gap-1">
                        <CrossCircledIcon className="h-3.5 w-3.5" />
                        Error
                      </Badge>
                    )}
                  </div>
                  
                  {result.error && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                      <span className="font-semibold">Error:</span> 
                      <span className="text-red-600 dark:text-red-400">
                        {result.error.includes('API_KEY_SERVICE_BLOCKED') 
                          ? 'API access is blocked or not enabled for this service' 
                          : result.error}
                      </span>
                    </div>
                  )}
                  
                  {result.success && result.response && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Status:</span> Connected successfully
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="text-xs text-gray-500 dark:text-gray-400 flex flex-col items-start">
        <p>
          Some services might require activation in the Google Cloud Console. 
          To enable services, visit the API Library page and enable the required APIs.
        </p>
      </CardFooter>
    </Card>
  );
};

export default GoogleServiceTests;