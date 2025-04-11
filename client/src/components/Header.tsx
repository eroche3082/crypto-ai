import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginWithGoogle, logoutUser } from "../firebase";
import { Search, Bell, Settings, UserCircle, Globe } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const Header = ({ title, subtitle }: HeaderProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="bg-background border-b border-border px-4 flex flex-col w-full">
      {/* Title section when provided */}
      {(title || subtitle) && (
        <div className="py-3 w-full">
          {title && <h1 className="text-xl font-semibold">{title}</h1>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      
      {/* Original header content */}
      <div className={`${title || subtitle ? 'py-2' : 'py-4'} flex justify-between items-center w-full`}>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            type="search" 
            placeholder={t("header.search", "Search for cryptocurrencies (BTC, ETH, ADA...)")}
            className="pl-10 bg-background border-border" 
          />
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground"
          >
            <Globe size={20} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground"
          >
            <Bell size={20} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings size={20} />
          </Button>
          
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">{user.displayName}</span>
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || "User"} 
                  className="w-8 h-8 rounded-full border border-border"
                />
              ) : (
                <UserCircle size={32} className="text-muted-foreground" />
              )}
            </div>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => loginWithGoogle()}
            >
              {t("header.login", "demo")}
            </Button>
          )}
        </div>
      </div>
      
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("settings.title", "Settings")}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <h3 className="text-sm font-medium mb-2">{t("settings.theme", "Theme")}</h3>
              <div className="flex space-x-2">
                <Button size="sm" variant="default">{t("settings.darkTheme", "Dark")}</Button>
                <Button size="sm" variant="outline">{t("settings.lightTheme", "Light")}</Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">{t("settings.language", "Language")}</h3>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">English</Button>
                <Button size="sm" variant="default">Español</Button>
              </div>
            </div>
            
            {user && (
              <div className="pt-4">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => {
                    logoutUser();
                    setSettingsOpen(false);
                  }}
                >
                  {t("settings.logout", "Logout")}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;