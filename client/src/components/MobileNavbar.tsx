import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  BarChart2, 
  AlertCircle, 
  RefreshCw, 
  BookOpen, 
  Newspaper, 
  Star, 
  MapPin,
  Menu,
  X,
  User,
  LogOut,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const MobileNavbar: React.FC = () => {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { path: '/dashboard', icon: <Home size={20} />, label: t('dashboard', 'Dashboard') },
    { path: '/portfolio', icon: <BarChart2 size={20} />, label: t('portfolio', 'Portfolio') },
    { path: '/alerts', icon: <AlertCircle size={20} />, label: t('alerts', 'Alerts') },
    { path: '/converter', icon: <RefreshCw size={20} />, label: t('converter', 'Converter') },
    { path: '/education', icon: <BookOpen size={20} />, label: t('education', 'Education') },
    { path: '/news', icon: <Newspaper size={20} />, label: t('news', 'News') },
    { path: '/favorites', icon: <Star size={20} />, label: t('favorites', 'Favorites') },
    { path: '/locations', icon: <MapPin size={20} />, label: t('locations', 'Locations') }
  ];

  return (
    <>
      {/* Fixed Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-card/90 backdrop-blur-md border-b border-border flex items-center justify-between px-4 z-40 md:hidden">
        <Link href="/">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center">
              <Home size={16} />
            </div>
            <span className="font-bold">CryptoPulse</span>
          </div>
        </Link>
        
        <button
          onClick={toggleMenu}
          className="p-2 rounded-full hover:bg-accent/20 transition-colors"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/90 backdrop-blur-sm z-30 flex flex-col transition-transform duration-300 ease-in-out md:hidden",
          isMenuOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="pt-16 px-4 flex-1 overflow-y-auto">
          <div className="space-y-4">
            {/* User info */}
            {user && (
              <div className="border border-border rounded-lg p-4 mb-6 bg-card/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="font-medium">{user.username || 'User'}</div>
                    <div className="text-xs text-muted-foreground">{user.email || 'user@example.com'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation links */}
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a 
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer transition-colors",
                      location === item.path 
                        ? "bg-primary text-primary-foreground" 
                        : "text-foreground hover:bg-accent/20"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                </Link>
              ))}
            </div>

            {/* Account actions */}
            <div className="border-t border-border pt-4 mt-4">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setIsMenuOpen(false);
                  // Navigate to settings when implemented
                }}
              >
                <Settings size={18} className="mr-2" />
                {t('settings', 'Settings')}
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
              >
                <LogOut size={18} className="mr-2" />
                {t('logout', 'Logout')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNavbar;