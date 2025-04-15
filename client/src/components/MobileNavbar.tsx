import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Star, 
  BarChart3, 
  Image, 
  Bell, 
  GraduationCap, 
  Scan,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

const MobileNavbar = () => {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLanguageSwitcher, setShowLanguageSwitcher] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) {
      setShowLanguageSwitcher(false);
    }
  };

  const toggleLanguageSwitcher = () => {
    setShowLanguageSwitcher(!showLanguageSwitcher);
  };

  const mainNavItems = [
    { path: "/dashboard", icon: <LayoutDashboard size={18} />, label: t("dashboard.title", "Dashboard") },
    { path: "/favorites", icon: <Star size={18} />, label: t("favorites.title", "Favorites") },
    { path: "/unified-portfolio", icon: <BarChart3 size={18} />, label: t("portfolio.title", "Portfolio") },
    { path: "/unified-digital-assets", icon: <Image size={18} />, label: t("digitalAssets.title", "Digital Assets") },
    { path: "/alerts", icon: <Bell size={18} />, label: t("alerts.title", "Alerts") },
    { path: "/education", icon: <GraduationCap size={18} />, label: t("education.title", "Education") },
    { path: "/chart-analysis", icon: <Scan size={18} />, label: t("chartAnalysis.title", "Chart Analysis") }
  ];

  return (
    <>
      {/* Fixed mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-card z-50 border-b border-border px-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center">
              <BarChart3 size={16} />
            </div>
            <span className="font-bold text-sm">CryptoPulse</span>
          </div>
        </Link>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-background z-40 pt-14 overflow-y-auto">
          <div className="p-4">
            <div className="space-y-1 mb-6">
              {mainNavItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer transition-colors",
                      location === item.path 
                        ? "bg-accent/40 text-primary" 
                        : "text-muted-foreground hover:bg-accent/20 hover:text-foreground"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Language setting */}
            <div 
              className="flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer text-muted-foreground hover:bg-accent/20 hover:text-foreground transition-colors mt-auto"
              onClick={toggleLanguageSwitcher}
            >
              <Globe size={18} />
              <span>{t("language.settings", "Language Settings")}</span>
              <span className="ml-auto text-xs bg-primary/20 text-primary rounded-full px-1.5 py-0.5">
                {language.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Language switcher */}
          {showLanguageSwitcher && (
            <div className="px-4 mt-4">
              <LanguageSwitcher 
                onClose={() => setShowLanguageSwitcher(false)} 
                isMobile={true}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MobileNavbar;