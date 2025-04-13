import { useState, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { useAuth } from "./contexts/AuthContext";
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
import SystemValidator from "./pages/admin/SystemValidator";
import AdminPanel from "./pages/AdminPanel";
import MultiPaymentPage from "./pages/MultiPaymentPage";
import NotFound from "@/pages/not-found";
// Landing and Login pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
// Unified pages
import UnifiedPortfolio from "./pages/UnifiedPortfolio";
import UnifiedDigitalAssets from "./pages/UnifiedDigitalAssets";
import FloatingChatbot from "./components/FloatingChatbot";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageProvider } from "./contexts/LanguageContext";
import { GeminiProvider } from "./contexts/GeminiContext";
import { CryptoProvider } from "./contexts/CryptoContext";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Simple loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <LanguageProvider>
      <GeminiProvider>
        <CryptoProvider>
          <AuthProvider>
            <Switch>
              {/* Public route for Landing Page */}
              <Route path="/">
                <LandingPage />
              </Route>

              {/* Public route for Login Page */}
              <Route path="/login">
                <LoginPage />
              </Route>
              
              {/* Admin Dashboard Route */}
              <Route path="/admin/dashboard">
                <DashboardPage />
              </Route>

              {/* All other routes get the dashboard layout */}
              <Route path="/:rest*">
                <AppLayout />
              </Route>
            </Switch>
          </AuthProvider>
        </CryptoProvider>
      </GeminiProvider>
    </LanguageProvider>
  );
}

// Separate component for the app layout with sidebar
function AppLayout() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // Check authentication using our context
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, setLocation]);

  return (
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
          <Route path="/admin/system-validator" component={SystemValidator} />
          <Route path="/admin/panel" component={AdminPanel} />
          <Route path="/dashboard/payment/:levelId" component={MultiPaymentPage} />
          <Route component={NotFound} />
        </Switch>
        <Footer />
      </div>
      <FloatingChatbot />
    </div>
  );
}

export default App;
