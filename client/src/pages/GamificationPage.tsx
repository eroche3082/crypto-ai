import React, { useState, useEffect } from 'react';
import { GamificationProfile } from '@/components/gamification/GamificationProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Helmet } from 'react-helmet';

export default function GamificationPage() {
  const { user } = useAuth();
  const [demoUserId, setDemoUserId] = useState<number | null>(null);
  
  useEffect(() => {
    // If the user is logged in, use their ID, otherwise use a demo user
    if (user && user.id) {
      setDemoUserId(user.id);
    } else {
      // Default demo user ID
      setDemoUserId(1);
    }
  }, [user]);
  
  const handleUserChange = (value: string) => {
    setDemoUserId(parseInt(value));
  };
  
  return (
    <>
      <Helmet>
        <title>Gamification | CryptoBot</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gamification</h1>
            <p className="text-muted-foreground">Track your progress, earn achievements, and complete challenges</p>
          </div>
          
          {/* Demo selector - only shown when no real user is logged in */}
          {!user && (
            <Select value={demoUserId?.toString()} onValueChange={handleUserChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select demo user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Demo User 1</SelectItem>
                <SelectItem value="2">Demo User 2</SelectItem>
                <SelectItem value="3">Demo User 3</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        
        {demoUserId ? (
          <GamificationProfile userId={demoUserId} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>User Profile Required</CardTitle>
              <CardDescription>You need to be logged in to view your gamification profile</CardDescription>
            </CardHeader>
            <CardContent>
              <Button>Sign In</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}