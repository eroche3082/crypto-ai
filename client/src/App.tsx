import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Alerts from "./pages/Alerts";
import Converter from "./pages/Converter";
import Education from "./pages/Education";
import News from "./pages/News";
import NotFound from "@/pages/not-found";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Handle WebSocket connection errors
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    // Set up error handling for socket connections 
    const handleSocketError = (event: Event) => {
      console.error("WebSocket error:", event);
      setError(new Error("WebSocket connection failed. Please refresh the page."));
    };
    
    // Add error handlers to window to catch unhandled errors
    const handleGlobalError = (event: ErrorEvent) => {
      console.error("Global error:", event);
      // Only set error if it seems to be a connection-related issue
      if (event.message.includes("WebSocket") || event.message.includes("socket") || 
          event.message.includes("connection") || event.message.includes("network")) {
        setError(new Error(event.message));
      }
    };

    window.addEventListener('error', handleGlobalError);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);
  
  // Create a custom error reset function
  const resetError = () => {
    setError(null);
    window.location.reload();
  };
  
  // Show loading screen
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h1 className="text-xl font-semibold">Loading CryptoPulse...</h1>
        </div>
      </div>
    );
  }
  
  // Show error screen if there's an error
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 max-w-md text-center p-6 bg-card rounded-lg shadow-md">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h1 className="text-xl font-semibold">Connection Error</h1>
          <p className="text-muted-foreground mb-4">
            There was a problem connecting to the server. This may be due to network issues or server configuration.
          </p>
          <p className="text-sm bg-secondary/50 p-3 rounded mb-4 text-left max-w-full overflow-auto">
            {error.message}
          </p>
          <Button onClick={resetError}>Refresh Application</Button>
        </div>
      </div>
    );
  }
  
  // Main application
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/portfolio" component={Portfolio} />
            <Route path="/alerts" component={Alerts} />
            <Route path="/converter" component={Converter} />
            <Route path="/education" component={Education} />
            <Route path="/news" component={News} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
