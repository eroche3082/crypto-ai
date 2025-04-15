import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  BarChart2, 
  AlertCircle, 
  Newspaper, 
  Star, 
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Wallet,
  Image,
  Scan,
  BrainCircuit
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

  // Use the same reorganized structure as Sidebar for consistency
  const navItems = [
    // 1. Dashboard - Main entry point
    { path: '/', icon: <Home size={20} />, label: t('dashboard', 'Dashboard') },
    
    // 2. Market Overview
    { path: '/live-price-tracker', icon: <Wallet size={20} />, label: t('market.overview', 'Market Overview') },
    
    // 3. Portfolio Hub
    { path: '/unified-portfolio', icon: <BarChart2 size={20} />, label: t('portfolio', 'Portfolio') },
    
    // 4. Trading Tools
    { path: '/chart-analysis', icon: <Scan size={20} />, label: t('trading.tools', 'Trading Tools') },
    
    // 5. NFT Center
    { path: '/nft-explorer', icon: <Image size={20} />, label: t('nft.center', 'NFT Center') },
    
    // 6. Analytics & Insights
    { path: '/analysis', icon: <BrainCircuit size={20} />, label: t('analytics.insights', 'Analytics & Insights') },
    
    // 7. Personal
    { path: '/favorites', icon: <Star size={20} />, label: t('personal.section', 'Your Journey') },
    
    // 8. Alerts & Updates
    { path: '/alerts', icon: <AlertCircle size={20} />, label: t('alerts', 'Alerts') },
    
    // 9. Learning & News 
    { path: '/news', icon: <Newspaper size={20} />, label: t('news.education', 'News & Learning') }
    
    // System is hidden on mobile for simplicity
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
                  <div 
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
                  </div>
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