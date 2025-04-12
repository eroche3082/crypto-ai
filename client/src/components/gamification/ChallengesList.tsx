import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { Icons } from '@/components/ui/icons';
import { toast } from '@/hooks/use-toast';

interface Challenge {
  id: number;
  challengeId: number;
  challengeName: string;
  challengeDescription: string;
  challengeDifficulty: string;
  challengeCategory: string;
  challengePoints: number;
  startDate: string;
  endDate: string;
  completed: boolean;
  progress: number;
  startedAt: string | null;
  completedAt: string | null;
}

interface ChallengesListProps {
  userId: number;
}

export function ChallengesList({ userId }: ChallengesListProps) {
  const [filter, setFilter] = useState<'active' | 'completed' | 'available'>('active');
  const queryClient = useQueryClient();
  
  const { data: userChallenges, isLoading: isLoadingUserChallenges } = useQuery({
    queryKey: ['challenges', 'user', userId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/gamification/challenges/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user challenges');
      }
      const json = await response.json();
      return json.data as Challenge[];
    },
    enabled: userId !== undefined && userId !== null
  });
  
  const { data: availableChallenges, isLoading: isLoadingAvailableChallenges } = useQuery({
    queryKey: ['challenges', 'available'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/gamification/challenges`);
      if (!response.ok) {
        throw new Error('Failed to fetch available challenges');
      }
      const json = await response.json();
      return json.data;
    },
    enabled: filter === 'available'
  });
  
  const startChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      const response = await apiRequest('POST', `/api/gamification/challenges/user/${userId}/${challengeId}/start`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start challenge');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges', 'user', userId] });
      queryClient.invalidateQueries({ queryKey: ['gamification-profile', userId] });
      toast({
        title: 'Challenge started',
        description: 'Good luck with your new challenge!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to start challenge',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  const isLoading = isLoadingUserChallenges || (filter === 'available' && isLoadingAvailableChallenges);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading challenges...</p>
      </div>
    );
  }
  
  if (!userChallenges) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Failed to load challenges</p>
      </div>
    );
  }
  
  // Prepare data based on filter
  let displayedChallenges: any[] = [];
  
  if (filter === 'active') {
    displayedChallenges = userChallenges.filter(c => !c.completed);
  } else if (filter === 'completed') {
    displayedChallenges = userChallenges.filter(c => c.completed);
  } else if (filter === 'available' && availableChallenges) {
    // Filter out challenges that the user has already started
    const userChallengeIds = new Set(userChallenges.map(c => c.challengeId));
    displayedChallenges = availableChallenges.filter(c => !userChallengeIds.has(c.id));
  }
  
  // Group challenges by category
  const challengesByCategory = displayedChallenges.reduce((acc, challenge) => {
    const category = challenge.challengeCategory || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(challenge);
    return acc;
  }, {} as Record<string, any[]>);
  
  const categories = Object.keys(challengesByCategory).sort();
  
  // Helper to render difficulty badge
  const renderDifficultyBadge = (difficulty: string) => {
    let variant = 'secondary';
    
    switch (difficulty.toLowerCase()) {
      case 'easy':
        variant = 'outline';
        break;
      case 'medium':
        variant = 'secondary';
        break;
      case 'hard':
        variant = 'default';
        break;
      case 'expert':
        variant = 'destructive';
        break;
      default:
        variant = 'secondary';
    }
    
    return (
      <Badge variant={variant as any}>{difficulty}</Badge>
    );
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="active" onValueChange={(value) => setFilter(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Active ({userChallenges.filter(c => !c.completed).length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({userChallenges.filter(c => c.completed).length})
          </TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {displayedChallenges.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No challenges found</p>
          {filter === 'active' && (
            <Button 
              variant="secondary" 
              className="mt-4"
              onClick={() => setFilter('available')}
            >
              Find New Challenges
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map(category => (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-semibold">{category}</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {challengesByCategory[category].map((challenge) => (
                  <Card 
                    key={filter === 'available' ? challenge.id : challenge.id}
                    className={`overflow-hidden ${challenge.completed ? 'border-primary/50' : 'border-muted-foreground/20'}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-md">{challenge.challengeName || challenge.name}</CardTitle>
                        <div className="flex space-x-2">
                          {renderDifficultyBadge(challenge.challengeDifficulty || challenge.difficulty)}
                          <Badge variant="outline">
                            {challenge.challengePoints || challenge.points} XP
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">
                        {challenge.challengeDescription || challenge.description}
                      </CardDescription>
                      
                      {filter !== 'available' && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{challenge.progress}%</span>
                          </div>
                          <Progress value={challenge.progress} className="h-1" />
                        </div>
                      )}
                      
                      {filter === 'active' && challenge.startedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Started on {new Date(challenge.startedAt).toLocaleDateString()}
                        </p>
                      )}
                      
                      {filter === 'completed' && challenge.completedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Completed on {new Date(challenge.completedAt).toLocaleDateString()}
                        </p>
                      )}
                      
                      {filter === 'available' && (
                        <div className="flex items-center mt-2">
                          <Icons.calendar className="h-3 w-3 mr-1" />
                          <p className="text-xs text-muted-foreground">
                            Available until {new Date(challenge.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                    
                    {filter === 'available' && (
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          onClick={() => startChallengeMutation.mutate(challenge.id)}
                          disabled={startChallengeMutation.isPending}
                        >
                          {startChallengeMutation.isPending && (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Start Challenge
                        </Button>
                      </CardFooter>
                    )}
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