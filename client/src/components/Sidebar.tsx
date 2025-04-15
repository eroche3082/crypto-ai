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
  CheckCircle2,
  Scan
} from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [showLanguageSwitcher, setShowLanguageSwitcher] = useState(false);

  // Reorganized navigation structure according to MEGAPROMPT specifications
  // Maximum 10 main categories with nested items to be implemented in dropdown menus later
  const navItems = [
    // 1. Dashboard - Main entry point
    { path: "/", icon: <LayoutDashboard size={20} />, label: t("dashboard.title", "Dashboard") },
    
    // 2. Market Overview
    { path: "/live-price-tracker", icon: <Wallet size={20} />, label: t("market.overview", "Market Overview") },
    
    // 3. Portfolio Hub
    { 
      path: "/unified-portfolio", 
      icon: <BarChart3 size={20} />, 
      label: t("portfolio.title", "Portfolio")
    },
    
    // 4. Trading Tools
    { 
      path: "/chart-analysis", 
      icon: <Scan size={20} />, 
      label: t("trading.tools", "Trading Tools")
    },
    
    // 5. NFT Center 
    { 
      path: "/nft-explorer", 
      icon: <Image size={20} />, 
      label: t("nft.center", "NFT Center")
    },
    
    // 6. Analytics & Insights
    { 
      path: "/analysis", 
      icon: <BrainCircuit size={20} />, 
      label: t("analytics.insights", "Analytics & Insights")
    },
    
    // 7. Personal
    { 
      path: "/favorites", 
      icon: <Star size={20} />, 
      label: t("personal.section", "Your Journey")
    },
    
    // 8. Alerts & Updates
    { 
      path: "/alerts", 
      icon: <Bell size={20} />, 
      label: t("alerts.title", "Alerts")
    },
    
    // 9. Learning & News
    { 
      path: "/news", 
      icon: <Newspaper size={20} />, 
      label: t("news.education", "News & Learning")
    },
    
    // 10. System (Admin only - this will be shown conditionally)
    { 
      path: "/admin/system-report", 
      icon: <Globe size={20} />, 
      label: t("admin.system", "System")
    },
  ];

  const toggleLanguageSwitcher = () => {
    setShowLanguageSwitcher(!showLanguageSwitcher);
  };

  return (
    <div className="hidden md:flex flex-col bg-card/50 w-[180px] border-r border-border h-full">
      <Link href="/">
        <div className="p-4 border-b border-border flex items-center gap-2 hover:bg-accent/20 transition-colors">
          <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center">
            <MessageSquare size={16} />
          </div>
          <span className="font-bold">CryptoPulse</span>
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
