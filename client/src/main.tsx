// Required imports for React and core functionality
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/i18n";

// Component and context imports
import { LanguageProvider } from "./contexts/LanguageContext";
import { GeminiProvider } from "./contexts/GeminiContext";
import { CryptoProvider } from "./contexts/CryptoContext";
import { Toaster } from "@/components/ui/toaster";

// Query client for data fetching
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// WebSocket for real-time communications
import { initializeWebSocket } from "./lib/websocket";

// Interface for our error boundary state
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Interface for our error boundary props
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

// Simple error boundary component
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error("Error caught by error boundary:", error, info);
  }
  
  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-background text-foreground">
          <div className="p-6 max-w-md rounded-lg bg-card shadow-md">
            <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              The application encountered an error. You can try refreshing the page.
            </p>
            <div className="flex flex-col gap-2">
              <button 
                className="bg-primary text-white px-4 py-2 rounded"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
              <a 
                href="/static" 
                className="text-center border border-border px-4 py-2 rounded text-muted-foreground hover:bg-secondary"
              >
                Use Static Version
              </a>
            </div>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error || event.message);
  
  // Only log WebSocket errors to avoid console spam
  if (event.message.includes('WebSocket') || 
      event.message.includes('socket') || 
      event.message.includes('ws error')) {
    console.warn('WebSocket connection issue detected. The app will continue to function with reduced live update capability.');
    
    // Prevent the error from crashing the application
    event.preventDefault();
  }
  
  // Add custom handling for network errors
  if (event.message.includes('network') || 
      event.message.includes('connection') || 
      event.message.includes('Failed to fetch')) {
    console.warn('Network error detected. Some features may not be available.');
    event.preventDefault();
  }
});

// Network error handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Create a wrapped app with all providers
// Remove nested providers to prevent circular dependencies
const WrappedApp = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </ErrorBoundary>
);

// Start the application in a safer way
const startApp = () => {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error('Root element not found');
      return;
    }
    
    // Render app when DOM is fully loaded
    createRoot(rootElement).render(<WrappedApp />);
    
    // Initialize WebSocket connection after React has mounted
    setTimeout(() => {
      try {
        initializeWebSocket();
      } catch (wsError) {
        console.error('Failed to initialize WebSocket:', wsError);
        // Don't let WebSocket issues prevent the app from running
      }
    }, 1000);
  } catch (err) {
    console.error('Failed to start application:', err);
    // Show a basic error message if React fails to mount
    document.body.innerHTML = `
      <div style="display: flex; height: 100vh; align-items: center; justify-content: center; flex-direction: column; font-family: sans-serif;">
        <h2>Unable to load application</h2>
        <p>Please refresh the page to try again.</p>
        <button style="margin-top: 20px; padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer;"
                onclick="window.location.reload()">
          Refresh Page
        </button>
        <a href="/static" style="margin-top: 10px; text-decoration: underline; color: #4f46e5;">
          Use Static Version
        </a>
      </div>
    `;
  }
};

// Start the app with a slight delay to avoid racing conditions
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(startApp, 10));
} else {
  setTimeout(startApp, 10);
}
