import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { Icons } from '@/components/ui/icons';

interface Achievement {
  id: number;
  achievementId: number;
  achievementName: string;
  achievementDescription: string;
  achievementIcon: string;
  achievementCategory: string;
  achievementPoints: number;
  unlocked: boolean;
  progress: number;
  unlockedAt: string | null;
}

interface AchievementsListProps {
  userId: number;
}

export function AchievementsList({ userId }: AchievementsListProps) {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  
  const { data: achievements, isLoading, error } = useQuery({
    queryKey: ['achievements', userId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/gamification/achievements/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }
      const json = await response.json();
      return json.data as Achievement[];
    },
    enabled: userId !== undefined && userId !== null
  });
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading achievements...</p>
      </div>
    );
  }
  
  if (error || !achievements) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Failed to load achievements</p>
      </div>
    );
  }
  
  // Filter achievements based on tab
  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    return true;
  });

  // Group achievements by category
  const achievementsByCategory = filteredAchievements.reduce((acc, achievement) => {
    const category = achievement.achievementCategory || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);
  
  const categories = Object.keys(achievementsByCategory).sort();
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({achievements.length})</TabsTrigger>
          <TabsTrigger value="unlocked">
            Unlocked ({achievements.filter(a => a.unlocked).length})
          </TabsTrigger>
          <TabsTrigger value="locked">
            Locked ({achievements.filter(a => !a.unlocked).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {filteredAchievements.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No achievements found</p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map(category => (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-semibold">{category}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {achievementsByCategory[category].map((achievement) => (
                  <Card 
                    key={achievement.id} 
                    className={`overflow-hidden ${achievement.unlocked ? 'border-primary/50' : 'border-muted-foreground/20'}`}
                  >
                    <CardHeader className="pb-2 space-y-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          {achievement.achievementIcon ? (
                            <div 
                              className="w-8 h-8 flex items-center justify-center text-lg"
                              dangerouslySetInnerHTML={{ __html: achievement.achievementIcon }}
                            />
                          ) : (
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Icons.trophy className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <CardTitle className="text-md">{achievement.achievementName}</CardTitle>
                        </div>
                        <Badge variant={achievement.unlocked ? "default" : "outline"}>
                          {achievement.achievementPoints} XP
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-xs mb-2">{achievement.achievementDescription}</CardDescription>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{achievement.progress}%</span>
                        </div>
                        <Progress value={achievement.progress} className="h-1" />
                      </div>
                      {achievement.unlocked && achievement.unlockedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}