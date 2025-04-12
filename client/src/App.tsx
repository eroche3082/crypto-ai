import { useState, useEffect } from "react";
import { Switch, Route, useLocation, useRouter } from "wouter";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Alerts from "./pages/Alerts";
import Converter from "./pages/Converter";
import Education from "./pages/Education";
import News from "./pages/News";
import Favorites from "./pages/Favorites";
import Locations from "./pages/Locations";
import Analysis from "./pages/Analysis";
import Watchlist from "./pages/Watchlist";
import InvestmentAdvisorPage from "./pages/InvestmentAdvisorPage";
import TwitterSentiment from "./pages/TwitterSentiment";
import TaxSimulator from "./pages/TaxSimulator";
import WalletMessaging from "./pages/WalletMessaging";
import PortfolioAnalysis from "./pages/PortfolioAnalysis";
import NFTGalleryPage from "./pages/nft/NFTGalleryPage";
import TokenTrackerPage from "./pages/nft/TokenTrackerPage";
import GamificationPage from "./pages/GamificationPage";
import SystemCheck from "./pages/admin/SystemCheck";
import AdminPanel from "./pages/admin/AdminPanel";
import NotFound from "@/pages/not-found";
// Landing and Login pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
// Unified pages
import UnifiedPortfolio from "./pages/UnifiedPortfolio";
import UnifiedDigitalAssets from "./pages/UnifiedDigitalAssets";
import FloatingChatbot from "./components/FloatingChatbot";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageProvider } from "./contexts/LanguageContext";
import { GeminiProvider } from "./contexts/GeminiContext";
import { CryptoProvider } from "./contexts/CryptoContext";
import { AuthProvider } from "./lib/auth";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // Authentication state (simplified for now)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [location] = useLocation();
  const router = useRouter();
  
  // Handle WebSocket connection errors
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    // Set up error handling for socket connections but don't crash app
    const handleSocketError = (event: Event) => {
      console.error("WebSocket error:", event);
      // Log but don't necessarily set as app-breaking error
      console.warn("WebSocket connection issue. The app will continue to function with reduced live update capability.");
    };
    
    // Add error handlers to window to catch unhandled errors
    const handleGlobalError = (event: ErrorEvent) => {
      console.error("Global error:", event);
      
      // Only set error if it seems to be a critical connection-related issue
      // but not WebSocket errors which shouldn't crash the app
      if ((event.message.includes("connection") || event.message.includes("network")) && 
          !event.message.includes("WebSocket") && 
          !event.message.includes("socket") && 
          !event.message.includes("ws error")) {
        setError(new Error(event.message));
      }
      
      // For WebSocket errors, just log and continue
      if (event.message.includes("WebSocket") || 
          event.message.includes("socket") || 
          event.message.includes("ws error")) {
        console.warn("WebSocket error handled gracefully:", event.message);
        // Prevent default error handling to avoid crashes
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleGlobalError);
    
    // Instead of patching WebSocket directly, which causes TypeScript errors,
    // we'll just add a global error listener for WebSocket errors
    window.addEventListener('error', (e) => {
      // Use a more targeted approach to only catch WebSocket errors
      if (e.message && (
          e.message.includes('WebSocket') || 
          e.message.includes('ws error') || 
          e.message.includes('socket'))) {
        console.warn('Intercepted WebSocket error:', e.message);
        
        // Prevent the error from crashing the application
        e.preventDefault();
        e.stopPropagation();
        
        // Return true to indicate we've handled the error
        return true;
      }
    }, true); // Use capture phase to get errors before other handlers
    
    // Create a reference to the error handler for cleanup
    const webSocketErrorHandler = (e: ErrorEvent) => {
      if (e.message && (
          e.message.includes('WebSocket') || 
          e.message.includes('ws error') || 
          e.message.includes('socket'))) {
        console.warn('Intercepted WebSocket error:', e.message);
        e.preventDefault();
        e.stopPropagation();
        return true;
      }
    };
    
    // Add the handler
    window.addEventListener('error', webSocketErrorHandler, true);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('error', handleGlobalError);
      // Remove the WebSocket error handler
      window.removeEventListener('error', webSocketErrorHandler, true);
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
          <div className="flex flex-col gap-2 w-full">
            <Button onClick={resetError}>Refresh Application</Button>
            <Button variant="outline" asChild>
              <a href="/static">Use Static Version</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is on a public route
  const isPublicRoute = location === "/" || location === "/login";

  // Effect to check if user is authenticated
  useEffect(() => {
    // For now, just check localStorage (will be replaced with proper auth)
    const isLoggedIn = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(isLoggedIn);
    
    // Redirect logic
    if (!isLoggedIn && !isPublicRoute) {
      router("/login");
    }
  }, [location, isPublicRoute, router]);

  // Login function to be passed to Login component
  const handleLogin = () => {
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
    router("/dashboard");
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
    router("/");
  };

  // Main application
  return (
    <LanguageProvider>
      <GeminiProvider>
        <CryptoProvider>
          <AuthProvider>
            <Switch>
              {/* Public routes */}
              <Route path="/">
                <LandingPage />
              </Route>
              <Route path="/login">
                <LoginPage onLogin={handleLogin} />
              </Route>

              {/* Protected routes */}
              <Route path="*">
                {isAuthenticated ? (
                  <div className="flex h-screen overflow-hidden bg-background text-foreground">
                    <Sidebar />
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <Switch>
                        <Route path="/dashboard" component={Dashboard} />
                        {/* Legacy routes - to be replaced with unified versions */}
                        <Route path="/portfolio" component={Portfolio} />
                        <Route path="/portfolio-analysis" component={PortfolioAnalysis} />
                        <Route path="/nft-gallery" component={NFTGalleryPage} />
                        <Route path="/token-tracker" component={TokenTrackerPage} />
                        
                        {/* Unified routes */}
                        <Route path="/unified-portfolio" component={UnifiedPortfolio} />
                        <Route path="/unified-digital-assets" component={UnifiedDigitalAssets} />
                        
                        {/* Other routes */}
                        <Route path="/favorites" component={Favorites} />
                        <Route path="/alerts" component={Alerts} />
                        <Route path="/converter" component={Converter} />
                        <Route path="/education" component={Education} />
                        <Route path="/news" component={News} />
                        <Route path="/locations" component={Locations} />
                        <Route path="/analysis" component={Analysis} />
                        <Route path="/watchlist" component={Watchlist} />
                        <Route path="/investment-advisor" component={InvestmentAdvisorPage} />
                        <Route path="/twitter-sentiment" component={TwitterSentiment} />
                        <Route path="/tax-simulator" component={TaxSimulator} />
                        <Route path="/wallet-messaging" component={WalletMessaging} />
                        <Route path="/gamification" component={GamificationPage} />
                        <Route path="/admin/system-check" component={SystemCheck} />
                        <Route path="/admin/panel" component={AdminPanel} />
                        <Route component={NotFound} />
                      </Switch>
                      <Footer />
                    </div>
                    <FloatingChatbot />
                  </div>
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )}
              </Route>
            </Switch>
          </AuthProvider>
        </CryptoProvider>
      </GeminiProvider>
    </LanguageProvider>
  );
}

export default App;
