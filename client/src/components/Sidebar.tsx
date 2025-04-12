import { useLocation, Link } from "wouter";
import { useState } from "react";
import { useTranslation } from "react-i18next";
// Import useLanguage hook
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { 
  LayoutDashboard, 
  Star, 
  BarChart3, 
  Newspaper, 
  Bell, 
  ArrowLeftRight, 
  BrainCircuit, 
  GraduationCap, 
  MapPin, 
  Globe,
  MessageSquare,
  ShieldAlert,
  Briefcase,
  Sparkles,
  MessageCircle,
  Calculator,
  Wallet,
  LockKeyhole,
  Brain,
  Image,
  Coins,
  Trophy,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [showLanguageSwitcher, setShowLanguageSwitcher] = useState(false);

  const navItems = [
    { path: "/", icon: <LayoutDashboard size={20} />, label: t("dashboard.title", "Dashboard") },
    { path: "/favorites", icon: <Star size={20} />, label: t("favorites.title", "Favorites") },
    
    // Unified Portfolio section with tag
    { 
      path: "/unified-portfolio", 
      icon: <BarChart3 size={20} />, 
      label: t("portfolio.title", "Portfolio"),
      tag: "New"
    },
    
    // Unified Digital Assets section with tag
    {
      path: "/unified-digital-assets",
      icon: <Image size={20} />,
      label: t("digitalAssets.title", "Digital Assets"),
      tag: "New"
    },
    
    // Legacy portfolio sections
    // { path: "/portfolio", icon: <BarChart3 size={20} />, label: t("portfolio.title", "Portfolio") },
    // { path: "/portfolio-analysis", icon: <Brain size={20} />, label: t("portfolioAnalysis.title", "Portfolio AI") },
    // { path: "/nft-gallery", icon: <Image size={20} />, label: t("nftGallery.title", "NFT Gallery") },
    // { path: "/token-tracker", icon: <Coins size={20} />, label: t("tokenTracker.title", "Token Tracker") },
    
    { path: "/watchlist", icon: <ShieldAlert size={20} />, label: t("watchlist.title", "Risk Watchlist") },
    { path: "/wallet-messaging", icon: <LockKeyhole size={20} />, label: t("walletMessaging.title", "Wallet Messaging") },
    { path: "/investment-advisor", icon: <Sparkles size={20} />, label: t("investmentAdvisor.title", "Investment Advisor") },
    { path: "/twitter-sentiment", icon: <MessageCircle size={20} />, label: t("twitterSentiment.title", "Twitter Analysis") },
    { path: "/tax-simulator", icon: <Calculator size={20} />, label: t("taxSimulator.title", "Tax Simulator") },
    { path: "/gamification", icon: <Trophy size={20} />, label: t("gamification.title", "Gamification") },
    { path: "/news", icon: <Newspaper size={20} />, label: t("news.title", "News") },
    { path: "/alerts", icon: <Bell size={20} />, label: t("alerts.title", "Alerts") },
    { path: "/converter", icon: <ArrowLeftRight size={20} />, label: t("converter.title", "Converter") },
    { path: "/analysis", icon: <BrainCircuit size={20} />, label: t("analysis.title", "AI Analysis") },
    { path: "/education", icon: <GraduationCap size={20} />, label: t("education.title", "Education") },
    { path: "/locations", icon: <MapPin size={20} />, label: t("locations.title", "Locations") },
    { path: "/admin/system-check", icon: <CheckCircle2 size={20} />, label: t("admin.systemCheck", "System Check") },
  ];

  const toggleLanguageSwitcher = () => {
    setShowLanguageSwitcher(!showLanguageSwitcher);
  };

  return (
    <div className="flex flex-col bg-card/50 w-[180px] border-r border-border h-full">
      <Link href="/">
        <div className="p-4 border-b border-border flex items-center gap-2 hover:bg-accent/20 transition-colors">
          <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center">
            <MessageSquare size={16} />
          </div>
          <span className="font-bold">CryptoBot</span>
        </div>
      </Link>
      
      <div className="flex-1 flex flex-col py-4 overflow-y-auto">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <div
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors",
                location === item.path 
                  ? "bg-accent/40 text-primary border-l-2 border-primary" 
                  : "text-muted-foreground hover:bg-accent/20 hover:text-foreground"
              )}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
              {item.tag && (
                <span className="ml-auto text-xs bg-green-500/20 text-green-500 rounded-full px-1.5 py-0.5">
                  {item.tag}
                </span>
              )}
            </div>
          </Link>
        ))}

        {/* Language settings */}
        <div 
          className="flex items-center gap-3 px-4 py-2.5 mt-auto cursor-pointer text-muted-foreground hover:bg-accent/20 hover:text-foreground transition-colors"
          onClick={toggleLanguageSwitcher}
        >
          <Globe size={20} />
          <span className="text-sm">{t("language.settings", "Language Settings")}</span>
          <span className="ml-auto text-xs bg-primary/20 text-primary rounded-full px-1.5 py-0.5">
            {language.toUpperCase()}
          </span>
        </div>
      </div>

      {showLanguageSwitcher && (
        <div className="absolute left-[180px] bottom-16 z-50">
          <LanguageSwitcher onClose={() => setShowLanguageSwitcher(false)} />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
