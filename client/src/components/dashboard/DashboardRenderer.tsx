import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubscriberProfile } from '@/lib/subscriberSchema';
import { getCurrentUserProfile } from '@/services/subscriberService';
import { Loader2, BarChart3, Clock, Newspaper, Wallet, FileText, BookOpen, Trophy } from 'lucide-react';
import { useLocation } from 'wouter';

interface DashboardRendererProps {
  onRetakeOnboarding?: () => void;
}

export function DashboardRenderer({ onRetakeOnboarding }: DashboardRendererProps) {
  const [profile, setProfile] = useState<Partial<SubscriberProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userProfile = await getCurrentUserProfile();
        setProfile(userProfile);
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const renderWelcomeCard = () => (
    <Card className="col-span-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome, {profile?.name || 'Crypto Enthusiast'}!</CardTitle>
        <CardDescription className="text-white text-opacity-80">
          Your personalized crypto dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          {profile?.experience === 'Beginner' 
            ? "We've customized your dashboard with beginner-friendly resources to help you start your crypto journey." 
            : profile?.experience === 'Expert'
            ? "Your dashboard is loaded with advanced analytics and trading tools for expert-level crypto management."
            : "Your dashboard has been tailored based on your preferences and experience level."}
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onRetakeOnboarding} className="border-white text-white hover:bg-white hover:text-blue-600">
          Update Preferences
        </Button>
      </CardFooter>
    </Card>
  );

  const renderSuggestedWidgets = () => {
    const widgets = [];
    
    // Market Analytics widget for those interested in trading
    if (profile?.interests?.includes('Trading') || profile?.interests?.includes('Investing')) {
      widgets.push(
        <Card key="market-analytics">
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart3 className="mr-2" /> Market Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Real-time market analytics and price movement indicators for your preferred assets.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" onClick={() => setLocation('/markets')}>
              View Markets
            </Button>
          </CardFooter>
        </Card>
      );
    }
    
    // News Feed for those interested in News
    if (profile?.interests?.includes('News')) {
      widgets.push(
        <Card key="news-feed">
          <CardHeader>
            <CardTitle className="flex items-center"><Newspaper className="mr-2" /> News Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Latest crypto news and trends, filtered by your interests.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" onClick={() => setLocation('/news')}>
              Browse News
            </Button>
          </CardFooter>
        </Card>
      );
    }
    
    // Wallet Connect for those who mentioned specific exchanges
    if (profile?.exchanges && profile.exchanges.length > 0) {
      widgets.push(
        <Card key="wallet-connect">
          <CardHeader>
            <CardTitle className="flex items-center"><Wallet className="mr-2" /> Wallet Connect</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Connect your wallets and exchanges for automated portfolio tracking.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" onClick={() => setLocation('/wallet')}>
              Connect Wallet
            </Button>
          </CardFooter>
        </Card>
      );
    }
    
    // Learning Resources for beginners
    if (profile?.experience === 'Beginner' || profile?.experience === 'Intermediate') {
      widgets.push(
        <Card key="learning">
          <CardHeader>
            <CardTitle className="flex items-center"><BookOpen className="mr-2" /> Learning Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Educational content tailored to your experience level.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" onClick={() => setLocation('/learn')}>
              Start Learning
            </Button>
          </CardFooter>
        </Card>
      );
    }
    
    // Tax & Compliance for advanced users
    if (profile?.experience === 'Advanced' || profile?.experience === 'Expert') {
      widgets.push(
        <Card key="tax">
          <CardHeader>
            <CardTitle className="flex items-center"><FileText className="mr-2" /> Tax Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track your crypto transactions for tax reporting and compliance.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" onClick={() => setLocation('/tax')}>
              Tax Tools
            </Button>
          </CardFooter>
        </Card>
      );
    }
    
    // Gamification for everyone
    widgets.push(
      <Card key="gamification">
        <CardHeader>
          <CardTitle className="flex items-center"><Trophy className="mr-2" /> Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete challenges and earn rewards while learning about crypto.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" onClick={() => setLocation('/achievements')}>
            View Achievements
          </Button>
        </CardFooter>
      </Card>
    );
    
    // Alert System for those who want updates
    if (profile?.updateFrequency) {
      widgets.push(
        <Card key="alerts">
          <CardHeader>
            <CardTitle className="flex items-center"><Clock className="mr-2" /> Price Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Set up customized alerts for price movements and market events.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" onClick={() => setLocation('/alerts')}>
              Manage Alerts
            </Button>
          </CardFooter>
        </Card>
      );
    }
    
    return widgets;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderWelcomeCard()}
        
        {/* Render dynamic widgets based on user profile */}
        {renderSuggestedWidgets()}
      </div>
    </div>
  );
}