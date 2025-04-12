import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Icons } from '@/components/ui/icons';
import { Badge } from '@/components/ui/badge';

interface ActivityLogItem {
  id: number;
  user_id: number;
  activity_type: string;
  description: string;
  points_earned: number;
  metadata: Record<string, any>;
  created_at: string;
}

interface ActivityListProps {
  userId: number;
  limit?: number;
}

export function ActivityList({ userId, limit = 10 }: ActivityListProps) {
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['activities', userId, limit],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/gamification/activity/${userId}?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user activities');
      }
      const json = await response.json();
      return json.data as ActivityLogItem[];
    },
    enabled: userId !== undefined && userId !== null
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Icons.spinner className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !activities) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Failed to load activity</p>
      </div>
    );
  }
  
  if (activities.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No activity found</p>
      </div>
    );
  }
  
  // Helper to get icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'achievement_unlocked':
        return <Icons.trophy className="h-5 w-5 text-yellow-500" />;
      case 'challenge_started':
        return <Icons.play className="h-5 w-5 text-blue-500" />;
      case 'challenge_completed':
        return <Icons.check className="h-5 w-5 text-green-500" />;
      case 'level_up':
        return <Icons.arrowUp className="h-5 w-5 text-purple-500" />;
      case 'market_analysis':
        return <Icons.barChart className="h-5 w-5 text-cyan-500" />;
      case 'portfolio_update':
        return <Icons.wallet className="h-5 w-5 text-emerald-500" />;
      case 'quiz_completed':
        return <Icons.brain className="h-5 w-5 text-pink-500" />;
      default:
        return <Icons.activity className="h-5 w-5 text-primary" />;
    }
  };
  
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3 py-2 border-b last:border-b-0">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
            {getActivityIcon(activity.activity_type)}
          </div>
          
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium">{activity.description}</p>
              {activity.points_earned > 0 && (
                <Badge variant="outline" className="ml-2">+{activity.points_earned} XP</Badge>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              {new Date(activity.created_at).toLocaleDateString()} at {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}