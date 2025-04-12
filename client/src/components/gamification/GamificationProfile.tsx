import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AchievementsList } from './AchievementsList';
import { ChallengesList } from './ChallengesList';
import { ActivityList } from './ActivityList';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Icons } from '@/components/ui/icons';

// Types
interface GamificationProfile {
  id: number;
  username: string;
  email: string;
  experiencePoints: number;
  level: number;
  profileImage?: string;
  achievements: {
    total: number;
    completed: number;
  };
  challenges: {
    total: number;
    completed: number;
  };
  points: {
    total: number;
  };
  levelProgress: {
    currentLevel: number;
    experiencePoints: number;
    nextLevelXp: number;
    currentLevelXp: number;
    xpToNextLevel: number;
    progress: number;
  };
}

interface GamificationProfileProps {
  userId: number;
}

export function GamificationProfile({ userId }: GamificationProfileProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const { 
    data: profile, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['gamification-profile', userId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/gamification/profile/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch gamification profile');
      }
      const json = await response.json();
      return json.data as GamificationProfile;
    },
    enabled: userId !== undefined && userId !== null
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load gamification profile. Please try again.',
        variant: 'destructive'
      });
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading gamification profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold">No Profile Data</h3>
          <p className="text-sm text-muted-foreground mb-4">We couldn't find gamification data for this user.</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center space-x-4">
              {profile.profileImage ? (
                <img 
                  src={profile.profileImage} 
                  alt={profile.username}
                  className="h-20 w-20 rounded-full"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <CardTitle>{profile.username}</CardTitle>
                <CardDescription>Level {profile.level} Crypto Explorer</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Level {profile.level}</span>
                  <span className="text-sm text-muted-foreground">Level {profile.level + 1}</span>
                </div>
                <Progress value={profile.levelProgress.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {profile.levelProgress.experiencePoints - profile.levelProgress.currentLevelXp} / {profile.levelProgress.nextLevelXp - profile.levelProgress.currentLevelXp} XP
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <p className="text-3xl font-bold">{profile.points.total}</p>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <p className="text-3xl font-bold">{profile.achievements.completed}</p>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Achievements</span>
                  <span className="text-sm text-muted-foreground">{profile.achievements.completed}/{profile.achievements.total}</span>
                </div>
                <Progress 
                  value={profile.achievements.total > 0 ? (profile.achievements.completed / profile.achievements.total) * 100 : 0} 
                  className="h-2" 
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Challenges</span>
                  <span className="text-sm text-muted-foreground">{profile.challenges.completed}/{profile.challenges.total}</span>
                </div>
                <Progress 
                  value={profile.challenges.total > 0 ? (profile.challenges.completed / profile.challenges.total) * 100 : 0} 
                  className="h-2" 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => refetch()}>
              Refresh Profile
            </Button>
          </CardFooter>
        </Card>

        {/* Main Content */}
        <div className="col-span-1 lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{profile.level}</div>
                    <p className="text-sm text-muted-foreground">Next level in {profile.levelProgress.xpToNextLevel} XP</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{profile.achievements.completed}</div>
                    <p className="text-sm text-muted-foreground">of {profile.achievements.total} total</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Challenges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{profile.challenges.completed}</div>
                    <p className="text-sm text-muted-foreground">of {profile.challenges.total} total</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest achievements and progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityList userId={userId} limit={5} />
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={() => setActiveTab('achievements')}>
                    View All Achievements
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="achievements" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Achievements</CardTitle>
                  <CardDescription>
                    Unlock achievements by completing various tasks in the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AchievementsList userId={userId} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="challenges" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Challenges</CardTitle>
                  <CardDescription>
                    Complete challenges to earn XP and unlock special rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChallengesList userId={userId} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}