import { useLocation, Link } from "wouter";
import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "react-i18next";
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
  ShieldAlert
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
    { path: "/portfolio", icon: <BarChart3 size={20} />, label: t("portfolio.title", "Portfolio") },
    { path: "/watchlist", icon: <ShieldAlert size={20} />, label: t("watchlist.title", "Risk Watchlist") },
    { path: "/news", icon: <Newspaper size={20} />, label: t("news.title", "News") },
    { path: "/alerts", icon: <Bell size={20} />, label: t("alerts.title", "Alerts") },
    { path: "/converter", icon: <ArrowLeftRight size={20} />, label: t("converter.title", "Converter") },
    { path: "/analysis", icon: <BrainCircuit size={20} />, label: t("analysis.title", "AI Analysis") },
    { path: "/education", icon: <GraduationCap size={20} />, label: t("education.title", "Education") },
    { path: "/locations", icon: <MapPin size={20} />, label: t("locations.title", "Locations") },
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
      
      <div className="flex-1 flex flex-col py-4">
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
