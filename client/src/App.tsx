import { useState, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { useAuth } from "./contexts/AuthContext";
import Sidebar from "./components/Sidebar";
import MobileNavbar from "./components/MobileNavbar";
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
import ChartAnalysisPage from "./pages/ChartAnalysisPage";
import NFTExplorerPage from "./pages/NFTExplorerPage";
import SystemCheck from "./pages/admin/SystemCheck";
import SystemValidator from "./pages/admin/SystemValidator";
import SystemReport from "./pages/admin/SystemReport";
import ApiHealthDashboard from "./pages/admin/ApiHealthDashboard";
import SystemDiagnostics from "./pages/admin/SystemDiagnostics";
import AdminPanel from "./pages/AdminPanel";
import MultiPaymentPage from "./pages/MultiPaymentPage";
import NotFound from "@/pages/not-found";
// Landing and Login pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";
// Unified pages
import UnifiedPortfolio from "./pages/UnifiedPortfolio";
import UnifiedDigitalAssets from "./pages/UnifiedDigitalAssets";
// New Phase 1 pages
import SubscriptionPlans from "./pages/SubscriptionPlans";
import LivePriceTracker from "./pages/LivePriceTracker";
import NFTExplorer from "./pages/NFTExplorer";
import FloatingChatbot from "./components/FloatingChatbot";
import ServiceWorkerManager from "./components/ServiceWorkerManager";
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
            {/* PWA Service Worker Manager for update notifications */}
            <ServiceWorkerManager />
            
            <Switch>
              {/* Public route for Landing Page */}
              <Route path="/">
                <LandingPage />
              </Route>

              {/* Public route for Login Page */}
              <Route path="/login">
                <LoginPage />
              </Route>

              {/* Public route for Sign Up Page */}
              <Route path="/signup">
                <SignUpPage />
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
      <MobileNavbar />
      <div className="flex-1 flex flex-col overflow-hidden md:overflow-auto pt-14 md:pt-0">
        <Switch>
          {/* 1. DASHBOARD - Main entry point */}
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          
          {/* 2. MARKET OVERVIEW - Crypto price tracking and data */}
          <Route path="/live-price-tracker" component={LivePriceTracker} />
          
          {/* 3. PORTFOLIO HUB - All portfolio related features */}
          <Route path="/unified-portfolio" component={UnifiedPortfolio} />
          <Route path="/portfolio" component={UnifiedPortfolio} /> {/* Redirect to unified view */}
          <Route path="/portfolio-analysis" component={PortfolioAnalysis} />
          
          {/* 4. TRADING TOOLS - Chart patterns, analysis and trading utilities */}
          <Route path="/chart-analysis" component={ChartAnalysisPage} />
          <Route path="/watchlist" component={Watchlist} />
          <Route path="/converter" component={Converter} />
          
          {/* 5. NFT CENTER - All NFT related features */}
          <Route path="/nft-explorer" component={NFTExplorer} />
          <Route path="/nft-evaluator" component={NFTExplorerPage} />
          <Route path="/nft-gallery" component={NFTGalleryPage} />
          <Route path="/token-tracker" component={TokenTrackerPage} />
          <Route path="/unified-digital-assets" component={UnifiedDigitalAssets} />
          
          {/* 6. ANALYTICS & INSIGHTS - AI and data analysis */}
          <Route path="/analysis" component={Analysis} />
          <Route path="/investment-advisor" component={InvestmentAdvisorPage} />
          <Route path="/twitter-sentiment" component={TwitterSentiment} />
          <Route path="/tax-simulator" component={TaxSimulator} />
          
          {/* 7. PERSONAL - User journey, profile and favorites */}
          <Route path="/favorites" component={Favorites} />
          <Route path="/wallet-messaging" component={WalletMessaging} />
          <Route path="/subscription-plans" component={SubscriptionPlans} />
          <Route path="/gamification" component={GamificationPage} />
          <Route path="/locations" component={Locations} />
          <Route path="/dashboard/payment/:levelId" component={MultiPaymentPage} />
          
          {/* 8. ALERTS & UPDATES - Notifications and alerts */}
          <Route path="/alerts" component={Alerts} />
          
          {/* 9. LEARNING & NEWS - Educational content and news */}
          <Route path="/news" component={News} />
          <Route path="/education" component={Education} />
          
          {/* 10. SYSTEM - Admin features */}
          <Route path="/admin/system-report" component={SystemReport} />
          <Route path="/admin/system-check" component={SystemCheck} />
          <Route path="/admin/system-validator" component={SystemValidator} />
          <Route path="/admin/api-health" component={ApiHealthDashboard} />
          <Route path="/admin/system-diagnostics" component={SystemDiagnostics} />
          <Route path="/admin/panel" component={AdminPanel} />
          
          {/* FALLBACK - 404 page */}
          <Route component={NotFound} />
        </Switch>
        <Footer />
      </div>
      <FloatingChatbot />
    </div>
  );
}

export default App;
