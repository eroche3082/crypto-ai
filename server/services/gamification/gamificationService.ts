import { db } from "../../db";
import { sql } from "drizzle-orm";
import type { User } from "@shared/schema";

// Types for gamification data
export interface GamificationProfile {
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

export interface Achievement {
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

export interface Challenge {
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

export interface ActivityLogItem {
  id: number;
  user_id: number;
  activity_type: string;
  description: string;
  points_earned: number;
  metadata: Record<string, any>;
  created_at: string;
}

// Calculate level based on XP
function calculateLevel(xp: number): number {
  // XP required for each level follows a progression
  // Level 1: 0 XP
  // Level 2: 100 XP
  // Level 3: 250 XP
  // Level 4: 450 XP
  // And so on, with increasing requirements
  
  // Simple formula: level = floor(sqrt(xp / 25)) + 1
  return Math.floor(Math.sqrt(xp / 25)) + 1;
}

// Calculate XP required for a given level
function xpForLevel(level: number): number {
  // Inverse of the level calculation formula
  return (level - 1) * (level - 1) * 25;
}

// Main gamification service
export class GamificationService {
  // Get a user's gamification profile
  async getProfile(userId: number): Promise<GamificationProfile> {
    try {
      // First, check if the user exists
      const userResult = await db.execute<User>(
        sql`SELECT * FROM users WHERE id = ${userId} LIMIT 1`
      );
      const user = userResult.rows[0];
      
      if (!user) {
        throw new Error("User not found");
      }
      
      // Since we don't have actual tables yet, we'll simulate the data
      // This will be replaced with real database queries once the tables are created
      
      // Simulate achievements stats
      const achievements = {
        total: 20,
        completed: userId % 5 + 3 // Simulate different completion levels
      };
      
      // Simulate challenges stats
      const challenges = {
        total: 15,
        completed: userId % 4 + 2 // Simulate different completion levels
      };
      
      // Simulate experience points
      const experiencePoints = userId * 100 + 150;
      
      // Calculate level and progress
      const level = calculateLevel(experiencePoints);
      const currentLevelXp = xpForLevel(level);
      const nextLevelXp = xpForLevel(level + 1);
      const xpToNextLevel = nextLevelXp - experiencePoints;
      const progress = ((experiencePoints - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
      
      // Build and return the profile
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        experiencePoints,
        level,
        profileImage: user.profile_image,
        achievements,
        challenges,
        points: {
          total: experiencePoints + 50, // Points are slightly higher than XP
        },
        levelProgress: {
          currentLevel: level,
          experiencePoints,
          nextLevelXp,
          currentLevelXp,
          xpToNextLevel,
          progress: Math.min(Math.max(progress, 0), 100),
        },
      };
    } catch (error) {
      console.error("Error getting gamification profile:", error);
      throw error;
    }
  }
  
  // Get user achievements
  async getUserAchievements(userId: number): Promise<Achievement[]> {
    try {
      // Simulate achievements data since we don't have a table yet
      // This will be replaced with real database queries
      
      const achievementCategories = [
        "Basics", 
        "Trading", 
        "Learning", 
        "Social", 
        "NFT", 
        "Advanced"
      ];
      
      const achievements: Achievement[] = [];
      
      // Generate a set of achievements for each category
      achievementCategories.forEach((category, categoryIndex) => {
        const count = categoryIndex === 0 ? 5 : 3; // More achievements in the Basics category
        
        for (let i = 0; i < count; i++) {
          const id = achievements.length + 1;
          const isUnlocked = Math.random() < 0.4 || 
                            (category === "Basics" && i < 2) || 
                            (userId % (id + 3) === 0);
          
          const progress = isUnlocked ? 100 : Math.floor(Math.random() * 80);
          
          achievements.push({
            id,
            achievementId: id,
            achievementName: this.getAchievementName(category, i),
            achievementDescription: this.getAchievementDescription(category, i),
            achievementIcon: this.getAchievementIcon(category, i),
            achievementCategory: category,
            achievementPoints: (categoryIndex + 1) * 25 + i * 10,
            unlocked: isUnlocked,
            progress,
            unlockedAt: isUnlocked ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
          });
        }
      });
      
      return achievements;
    } catch (error) {
      console.error("Error getting user achievements:", error);
      throw error;
    }
  }
  
  // Helper methods for achievement data generation
  private getAchievementName(category: string, index: number): string {
    const names: Record<string, string[]> = {
      "Basics": [
        "Welcome Aboard", 
        "First Trade", 
        "Profile Customizer", 
        "Market Explorer", 
        "Crypto Beginner"
      ],
      "Trading": [
        "Trading Novice", 
        "Market Timer", 
        "Diversification Expert"
      ],
      "Learning": [
        "Knowledge Seeker", 
        "Chart Wizard", 
        "Research Enthusiast"
      ],
      "Social": [
        "Community Member", 
        "Social Sharer", 
        "Influencer"
      ],
      "NFT": [
        "NFT Collector", 
        "Collection Analyzer", 
        "NFT Predictor"
      ],
      "Advanced": [
        "Data Scientist", 
        "Whale Tracker", 
        "Crypto Veteran"
      ]
    };
    
    return names[category][index] || `${category} Achievement ${index + 1}`;
  }
  
  private getAchievementDescription(category: string, index: number): string {
    const descriptions: Record<string, string[]> = {
      "Basics": [
        "Welcome to CryptoBot! Complete your first login.",
        "Execute your first trade on the platform.",
        "Customize your profile settings and preferences.",
        "Explore all market sections in the dashboard.",
        "Learn the basics of cryptocurrency trading."
      ],
      "Trading": [
        "Complete 5 trades on the platform.",
        "Make a successful trade during a market dip.",
        "Hold at least 5 different cryptocurrencies."
      ],
      "Learning": [
        "Complete 3 educational modules in the learning center.",
        "Analyze 10 different price charts using technical indicators.",
        "Read 20 crypto news articles."
      ],
      "Social": [
        "Connect your first social account.",
        "Share a market analysis on social media.",
        "Reach 100 followers on connected accounts."
      ],
      "NFT": [
        "Add your first NFT to your collection.",
        "Analyze 5 different NFT collections.",
        "Accurately predict an NFT floor price movement."
      ],
      "Advanced": [
        "Use advanced data analysis tools for market prediction.",
        "Track and analyze whale transactions.",
        "Stay active on the platform for 90 days."
      ]
    };
    
    return descriptions[category][index] || `Complete ${category.toLowerCase()} tasks to earn this achievement.`;
  }
  
  private getAchievementIcon(category: string, index: number): string {
    // SVG icons encoded as string
    const icons: Record<string, string[]> = {
      "Basics": [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M20 21v-2a8 8 0 0 0-16 0v2"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-9.5c1-1.2 2-3 2-4.5 0-1-.5-2.5-1-3.5"/></svg>'
      ],
      "Trading": [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>'
      ],
      "Learning": [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>'
      ],
      "Social": [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="M15.41 6.51l-6.82 3.98"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19c-2.3 0-6.4-.2-8.1-.6-.7-.2-1.2-.7-1.4-1.4-.3-1.1-.5-3.4-.5-5s.2-3.9.5-5c.2-.7.7-1.2 1.4-1.4C5.6 5.2 9.7 5 12 5s6.4.2 8.1.6c.7.2 1.2.7 1.4 1.4.3 1.1.5 3.4.5 5s-.2 3.9-.5 5c-.2.7-.7 1.2-1.4 1.4-1.7.4-5.8.6-8.1.6 0 0 0 0 0 0z"/><polygon points="10 15 15 12 10 9 10 15"/></svg>'
      ],
      "NFT": [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.21 15.89-9-9a2 2 0 0 0-2.83 0l-8.59 8.6a2 2 0 0 0 0 2.82l9 9a2 2 0 0 0 2.82 0l8.6-8.6a2 2 0 0 0 0-2.82Z"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>'
      ],
      "Advanced": [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 17h-7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2Z"/><path d="M16 21h-7a2 2 0 0 1-2-2V9"/><path d="M12 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M5.3 16a9 9 0 0 1 13.4 0"/><path d="M16 7a4 4 0 1 1-8 0"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 22V6M14 22V11"/><rect x="2" y="2" width="20" height="14" rx="2"/><path d="M6 18h4"/><path d="M14 18h4"/></svg>'
      ]
    };
    
    const categoryIcons = icons[category] || [];
    return categoryIcons[index % categoryIcons.length] || '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
  }
  
  // Get user challenges
  async getUserChallenges(userId: number): Promise<Challenge[]> {
    try {
      // Simulate challenges data since we don't have a table yet
      // This will be replaced with real database queries
      
      const challengeCategories = [
        "Daily", 
        "Weekly", 
        "Market", 
        "Social", 
        "Learning"
      ];
      
      const difficultyLevels = ["Easy", "Medium", "Hard", "Expert"];
      
      const challenges: Challenge[] = [];
      
      // Generate a set of challenges for each category
      challengeCategories.forEach((category, categoryIndex) => {
        const count = categoryIndex < 2 ? 3 : 2; // More daily and weekly challenges
        
        for (let i = 0; i < count; i++) {
          const id = challenges.length + 1;
          const isCompleted = Math.random() < 0.3 || (categoryIndex === 0 && i === 0);
          
          const progress = isCompleted ? 100 : Math.floor(Math.random() * 90);
          const difficulty = difficultyLevels[Math.min(categoryIndex, i) % difficultyLevels.length];
          
          // Create start and end dates
          const now = new Date();
          const startDate = new Date(now);
          startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 10));
          
          const endDate = new Date(now);
          if (category === "Daily") {
            endDate.setDate(endDate.getDate() + 1);
          } else if (category === "Weekly") {
            endDate.setDate(endDate.getDate() + 7 - now.getDay());
          } else {
            endDate.setDate(endDate.getDate() + 14 + Math.floor(Math.random() * 14));
          }
          
          challenges.push({
            id,
            challengeId: id,
            challengeName: this.getChallengeName(category, i),
            challengeDescription: this.getChallengeDescription(category, i),
            challengeDifficulty: difficulty,
            challengeCategory: category,
            challengePoints: this.getChallengePoints(difficulty),
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            completed: isCompleted,
            progress,
            startedAt: new Date(startDate.getTime() + 1000 * 60 * 60 * Math.random() * 24).toISOString(),
            completedAt: isCompleted ? 
              new Date(startDate.getTime() + 1000 * 60 * 60 * (24 + Math.random() * 48)).toISOString() : 
              null,
          });
        }
      });
      
      return challenges;
    } catch (error) {
      console.error("Error getting user challenges:", error);
      throw error;
    }
  }
  
  // Helper methods for challenge data generation
  private getChallengeName(category: string, index: number): string {
    const names: Record<string, string[]> = {
      "Daily": [
        "Market Check-In", 
        "Daily Trade", 
        "News Reader"
      ],
      "Weekly": [
        "Portfolio Diversification", 
        "Technical Analysis", 
        "Trend Spotter"
      ],
      "Market": [
        "Whale Alert", 
        "Market Prediction"
      ],
      "Social": [
        "Community Contributor", 
        "Social Connector"
      ],
      "Learning": [
        "Crypto Encyclopedia", 
        "Chart Master"
      ]
    };
    
    return names[category][index] || `${category} Challenge ${index + 1}`;
  }
  
  private getChallengeDescription(category: string, index: number): string {
    const descriptions: Record<string, string[]> = {
      "Daily": [
        "Check the market dashboard daily for 5 consecutive days.",
        "Execute at least one trade with a minimum value of $100.",
        "Read at least 3 cryptocurrency news articles."
      ],
      "Weekly": [
        "Hold at least 5 different cryptocurrencies in your portfolio for a week.",
        "Analyze 3 different cryptocurrency charts using at least 2 indicators each.",
        "Correctly predict a market trend direction for any major cryptocurrency."
      ],
      "Market": [
        "Identify and track a large transaction (>$1M) and analyze its market impact.",
        "Make 3 correct market predictions with the prediction tool."
      ],
      "Social": [
        "Share 5 market analyses with the community.",
        "Connect all your social accounts to your CryptoBot profile."
      ],
      "Learning": [
        "Complete all beginner learning modules in the education center.",
        "Master advanced chart pattern recognition for 5 different patterns."
      ]
    };
    
    return descriptions[category][index] || `Complete this ${category.toLowerCase()} challenge to earn points.`;
  }
  
  private getChallengePoints(difficulty: string): number {
    switch (difficulty) {
      case "Easy": return 50;
      case "Medium": return 100;
      case "Hard": return 200;
      case "Expert": return 350;
      default: return 75;
    }
  }
  
  // Get available challenges
  async getAvailableChallenges(): Promise<any[]> {
    try {
      // Simulate available challenges
      // This will be replaced with real database queries
      
      return [
        {
          id: 101,
          name: "Market Maestro",
          description: "Track and analyze 10 different cryptocurrency markets over 7 days.",
          difficulty: "Hard",
          category: "Market",
          points: 250,
          requirements: "User must have completed at least 3 basic challenges",
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 102,
          name: "NFT Explorer",
          description: "Analyze 5 different NFT collections and predict their floor price movement.",
          difficulty: "Medium",
          category: "NFT",
          points: 150,
          requirements: null,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 103,
          name: "Social Butterfly",
          description: "Share your market insights on social media and get at least 10 engagements.",
          difficulty: "Easy",
          category: "Social",
          points: 100,
          requirements: null,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    } catch (error) {
      console.error("Error getting available challenges:", error);
      throw error;
    }
  }
  
  // Start a challenge for a user
  async startChallenge(userId: number, challengeId: number): Promise<any> {
    try {
      // In a real implementation, this would check if the challenge exists
      // and create a user_challenge record
      
      // For now, just return success
      return {
        id: Date.now(),
        message: "Challenge started successfully",
      };
    } catch (error) {
      console.error("Error starting challenge:", error);
      throw error;
    }
  }
  
  // Get user activity logs
  async getUserActivity(userId: number, limit: number = 10): Promise<ActivityLogItem[]> {
    try {
      // Simulate activity logs
      // This will be replaced with real database queries
      
      const activityTypes = [
        "achievement_unlocked",
        "challenge_started",
        "challenge_completed",
        "level_up",
        "market_analysis",
        "portfolio_update",
        "login",
        "trade_executed",
        "quiz_completed"
      ];
      
      const activities: ActivityLogItem[] = [];
      
      // Generate random activity logs
      for (let i = 0; i < limit; i++) {
        const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        
        // Date within the last 30 days, more recent first
        const daysAgo = i === 0 ? 0 : Math.floor(Math.random() * 30);
        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 24 * 60 * 60 * 1000);
        
        activities.push({
          id: limit - i,
          user_id: userId,
          activity_type: activityType,
          description: this.getActivityDescription(activityType),
          points_earned: this.getActivityPoints(activityType),
          metadata: {},
          created_at: createdAt.toISOString()
        });
      }
      
      // Sort by most recent first
      return activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
      console.error("Error getting user activity:", error);
      throw error;
    }
  }
  
  // Helper methods for activity data generation
  private getActivityDescription(activityType: string): string {
    switch (activityType) {
      case "achievement_unlocked":
        return `Unlocked the "${["Market Explorer", "Crypto Beginner", "Trading Novice"][Math.floor(Math.random() * 3)]}" achievement`;
      case "challenge_started":
        return `Started the "${["Market Check-In", "Daily Trade", "Portfolio Diversification"][Math.floor(Math.random() * 3)]}" challenge`;
      case "challenge_completed":
        return `Completed the "${["Market Check-In", "Daily Trade", "Social Connector"][Math.floor(Math.random() * 3)]}" challenge`;
      case "level_up":
        return `Reached level ${Math.floor(Math.random() * 5) + 2}`;
      case "market_analysis":
        return `Performed market analysis on ${["Bitcoin", "Ethereum", "Solana", "XRP"][Math.floor(Math.random() * 4)]}`;
      case "portfolio_update":
        return `Updated portfolio with a new ${["Bitcoin", "Ethereum", "Solana", "XRP"][Math.floor(Math.random() * 4)]} position`;
      case "login":
        return "Logged in to CryptoBot";
      case "trade_executed":
        return `Executed a ${["buy", "sell"][Math.floor(Math.random() * 2)]} trade for ${["Bitcoin", "Ethereum", "Solana", "XRP"][Math.floor(Math.random() * 4)]}`;
      case "quiz_completed":
        return "Completed a crypto knowledge quiz";
      default:
        return "Performed an activity on CryptoBot";
    }
  }
  
  private getActivityPoints(activityType: string): number {
    switch (activityType) {
      case "achievement_unlocked":
        return Math.floor(Math.random() * 5) * 25 + 25; // 25-125
      case "challenge_completed":
        return Math.floor(Math.random() * 4) * 50 + 50; // 50-200
      case "level_up":
        return 100;
      case "market_analysis":
        return 10;
      case "portfolio_update":
        return 15;
      case "quiz_completed":
        return 30;
      case "trade_executed":
        return 20;
      default:
        return 5;
    }
  }
}

export const gamificationService = new GamificationService();