import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { LanguageProvider } from "./contexts/LanguageContext";
import { GeminiProvider } from "./contexts/GeminiContext";
import { CryptoProvider } from "./contexts/CryptoContext";
import { Toaster } from "@/components/ui/toaster";
import "./lib/i18n";

// Simple error boundary component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, info) {
    console.error("Error caught by error boundary:", error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-background text-foreground">
          <div className="p-6 max-w-md rounded-lg bg-card shadow-md">
            <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              The application encountered an error. You can try refreshing the page.
            </p>
            <button 
              className="bg-primary text-white px-4 py-2 rounded"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Required import for React class component
import React from "react";

// Create a wrapped app with all providers
const WrappedApp = () => (
  <ErrorBoundary>
    <LanguageProvider>
      <GeminiProvider>
        <CryptoProvider>
          <App />
          <Toaster />
        </CryptoProvider>
      </GeminiProvider>
    </LanguageProvider>
  </ErrorBoundary>
);

// Render with a slight delay to avoid initialization issues
setTimeout(() => {
  createRoot(document.getElementById("root")!).render(<WrappedApp />);
}, 0);
