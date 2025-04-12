import { Request, Response } from 'express';
import { db } from '../db';
import { 
  users, 
  achievements, 
  userAchievements, 
  challenges, 
  userChallenges,
  activityLogs,
  leaderboards,
  leaderboardEntries,
  quizQuestions,
  userQuizResponses,
  tradingSimulations
} from '@shared/schema';
import { eq, and, desc, sql, asc } from 'drizzle-orm';

// Achievement Actions
export async function listAchievements(req: Request, res: Response) {
  try {
    const achievementsList = await db.select().from(achievements);
    
    return res.status(200).json({
      status: 'success',
      data: achievementsList
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch achievements',
      error: error.message
    });
  }
}

export async function getUserAchievements(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }
    
    const userAchievementsList = await db.select({
      id: userAchievements.id,
      achievementId: userAchievements.achievement_id,
      achievementName: achievements.name,
      achievementDescription: achievements.description,
      achievementIcon: achievements.icon,
      achievementCategory: achievements.category,
      achievementPoints: achievements.points,
      unlocked: userAchievements.completed,
      progress: userAchievements.progress,
      unlockedAt: userAchievements.unlocked_at
    })
    .from(userAchievements)
    .leftJoin(achievements, eq(userAchievements.achievement_id, achievements.id))
    .where(eq(userAchievements.user_id, parseInt(userId)));
    
    return res.status(200).json({
      status: 'success',
      data: userAchievementsList
    });
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user achievements',
      error: error.message
    });
  }
}

export async function unlockAchievement(req: Request, res: Response) {
  try {
    const { userId, achievementId } = req.params;
    
    if (!userId || !achievementId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID and Achievement ID are required'
      });
    }
    
    // Check if user has this achievement already
    const existingUserAchievement = await db.select()
      .from(userAchievements)
      .where(
        and(
          eq(userAchievements.user_id, parseInt(userId)),
          eq(userAchievements.achievement_id, parseInt(achievementId))
        )
      )
      .limit(1);
    
    if (existingUserAchievement.length > 0) {
      // Update existing user achievement
      const [updatedUserAchievement] = await db.update(userAchievements)
        .set({
          completed: true,
          progress: 100,
          unlocked_at: new Date()
        })
        .where(eq(userAchievements.id, existingUserAchievement[0].id))
        .returning();
      
      // Get achievement to add points
      const [achievementData] = await db.select()
        .from(achievements)
        .where(eq(achievements.id, parseInt(achievementId)))
        .limit(1);
      
      if (achievementData) {
        // Update user experience points
        await db.update(users)
          .set({
            experience_points: sql`${users.experience_points} + ${achievementData.points}`
          })
          .where(eq(users.id, parseInt(userId)));
        
        // Log activity
        await db.insert(activityLogs)
          .values({
            user_id: parseInt(userId),
            activity_type: 'achievement_unlocked',
            description: `Unlocked achievement: ${achievementData.name}`,
            points_earned: achievementData.points,
            metadata: {
              achievement_id: achievementData.id,
              achievement_name: achievementData.name,
              achievement_category: achievementData.category
            }
          });
        
        // Check for level up
        await checkForLevelUp(parseInt(userId));
      }
      
      return res.status(200).json({
        status: 'success',
        message: 'Achievement unlocked successfully',
        data: updatedUserAchievement
      });
    } else {
      // Get achievement details
      const [achievementData] = await db.select()
        .from(achievements)
        .where(eq(achievements.id, parseInt(achievementId)))
        .limit(1);
      
      if (!achievementData) {
        return res.status(404).json({
          status: 'error',
          message: 'Achievement not found'
        });
      }
      
      // Create new user achievement
      const [newUserAchievement] = await db.insert(userAchievements)
        .values({
          user_id: parseInt(userId),
          achievement_id: parseInt(achievementId),
          completed: true,
          progress: 100
        })
        .returning();
      
      // Update user experience points
      await db.update(users)
        .set({
          experience_points: sql`${users.experience_points} + ${achievementData.points}`
        })
        .where(eq(users.id, parseInt(userId)));
      
      // Log activity
      await db.insert(activityLogs)
        .values({
          user_id: parseInt(userId),
          activity_type: 'achievement_unlocked',
          description: `Unlocked achievement: ${achievementData.name}`,
          points_earned: achievementData.points,
          metadata: {
            achievement_id: achievementData.id,
            achievement_name: achievementData.name,
            achievement_category: achievementData.category
          }
        });
      
      // Check for level up
      await checkForLevelUp(parseInt(userId));
      
      return res.status(201).json({
        status: 'success',
        message: 'Achievement unlocked successfully',
        data: newUserAchievement
      });
    }
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to unlock achievement',
      error: error.message
    });
  }
}

export async function updateAchievementProgress(req: Request, res: Response) {
  try {
    const { userId, achievementId } = req.params;
    const { progress } = req.body;
    
    if (!userId || !achievementId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID and Achievement ID are required'
      });
    }
    
    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Progress must be a number between 0 and 100'
      });
    }
    
    // Check if user has this achievement already
    const existingUserAchievement = await db.select()
      .from(userAchievements)
      .where(
        and(
          eq(userAchievements.user_id, parseInt(userId)),
          eq(userAchievements.achievement_id, parseInt(achievementId))
        )
      )
      .limit(1);
    
    if (existingUserAchievement.length > 0) {
      // Update existing user achievement
      const [updatedUserAchievement] = await db.update(userAchievements)
        .set({
          progress: progress,
          completed: progress >= 100,
          ...(progress >= 100 ? { unlocked_at: new Date() } : {})
        })
        .where(eq(userAchievements.id, existingUserAchievement[0].id))
        .returning();
      
      // If achievement is completed, update user points and log activity
      if (progress >= 100 && !existingUserAchievement[0].completed) {
        // Get achievement to add points
        const [achievementData] = await db.select()
          .from(achievements)
          .where(eq(achievements.id, parseInt(achievementId)))
          .limit(1);
        
        if (achievementData) {
          // Update user experience points
          await db.update(users)
            .set({
              experience_points: sql`${users.experience_points} + ${achievementData.points}`
            })
            .where(eq(users.id, parseInt(userId)));
          
          // Log activity
          await db.insert(activityLogs)
            .values({
              user_id: parseInt(userId),
              activity_type: 'achievement_unlocked',
              description: `Unlocked achievement: ${achievementData.name}`,
              points_earned: achievementData.points,
              metadata: {
                achievement_id: achievementData.id,
                achievement_name: achievementData.name,
                achievement_category: achievementData.category
              }
            });
          
          // Check for level up
          await checkForLevelUp(parseInt(userId));
        }
      }
      
      return res.status(200).json({
        status: 'success',
        message: 'Achievement progress updated successfully',
        data: updatedUserAchievement
      });
    } else {
      // Create new user achievement
      const [newUserAchievement] = await db.insert(userAchievements)
        .values({
          user_id: parseInt(userId),
          achievement_id: parseInt(achievementId),
          progress: progress,
          completed: progress >= 100
        })
        .returning();
      
      // If achievement is completed, update user points and log activity
      if (progress >= 100) {
        // Get achievement to add points
        const [achievementData] = await db.select()
          .from(achievements)
          .where(eq(achievements.id, parseInt(achievementId)))
          .limit(1);
        
        if (achievementData) {
          // Update user experience points
          await db.update(users)
            .set({
              experience_points: sql`${users.experience_points} + ${achievementData.points}`
            })
            .where(eq(users.id, parseInt(userId)));
          
          // Log activity
          await db.insert(activityLogs)
            .values({
              user_id: parseInt(userId),
              activity_type: 'achievement_unlocked',
              description: `Unlocked achievement: ${achievementData.name}`,
              points_earned: achievementData.points,
              metadata: {
                achievement_id: achievementData.id,
                achievement_name: achievementData.name,
                achievement_category: achievementData.category
              }
            });
          
          // Check for level up
          await checkForLevelUp(parseInt(userId));
        }
      }
      
      return res.status(201).json({
        status: 'success',
        message: 'Achievement progress created successfully',
        data: newUserAchievement
      });
    }
  } catch (error) {
    console.error('Error updating achievement progress:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update achievement progress',
      error: error.message
    });
  }
}

// Challenge Actions
export async function listChallenges(req: Request, res: Response) {
  try {
    const challengesList = await db.select().from(challenges)
      .where(eq(challenges.is_active, true));
    
    return res.status(200).json({
      status: 'success',
      data: challengesList
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch challenges',
      error: error.message
    });
  }
}

export async function getUserChallenges(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }
    
    const userChallengesList = await db.select({
      id: userChallenges.id,
      challengeId: userChallenges.challenge_id,
      challengeName: challenges.name,
      challengeDescription: challenges.description,
      challengeDifficulty: challenges.difficulty,
      challengeCategory: challenges.category,
      challengePoints: challenges.points,
      startDate: challenges.start_date,
      endDate: challenges.end_date,
      completed: userChallenges.completed,
      progress: userChallenges.progress,
      startedAt: userChallenges.started_at,
      completedAt: userChallenges.completed_at
    })
    .from(userChallenges)
    .leftJoin(challenges, eq(userChallenges.challenge_id, challenges.id))
    .where(eq(userChallenges.user_id, parseInt(userId)));
    
    return res.status(200).json({
      status: 'success',
      data: userChallengesList
    });
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user challenges',
      error: error.message
    });
  }
}

export async function startChallenge(req: Request, res: Response) {
  try {
    const { userId, challengeId } = req.params;
    
    if (!userId || !challengeId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID and Challenge ID are required'
      });
    }
    
    // Check if challenge exists and is active
    const [challengeData] = await db.select()
      .from(challenges)
      .where(
        and(
          eq(challenges.id, parseInt(challengeId)),
          eq(challenges.is_active, true)
        )
      )
      .limit(1);
    
    if (!challengeData) {
      return res.status(404).json({
        status: 'error',
        message: 'Challenge not found or not active'
      });
    }
    
    // Check if user already started this challenge
    const existingUserChallenge = await db.select()
      .from(userChallenges)
      .where(
        and(
          eq(userChallenges.user_id, parseInt(userId)),
          eq(userChallenges.challenge_id, parseInt(challengeId))
        )
      )
      .limit(1);
    
    if (existingUserChallenge.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'User has already started this challenge',
        data: existingUserChallenge[0]
      });
    }
    
    // Start the challenge for the user
    const [newUserChallenge] = await db.insert(userChallenges)
      .values({
        user_id: parseInt(userId),
        challenge_id: parseInt(challengeId),
        progress: 0,
        completed: false
      })
      .returning();
    
    // Log activity
    await db.insert(activityLogs)
      .values({
        user_id: parseInt(userId),
        activity_type: 'challenge_started',
        description: `Started challenge: ${challengeData.name}`,
        points_earned: 0,
        metadata: {
          challenge_id: challengeData.id,
          challenge_name: challengeData.name,
          challenge_category: challengeData.category
        }
      });
    
    return res.status(201).json({
      status: 'success',
      message: 'Challenge started successfully',
      data: newUserChallenge
    });
  } catch (error) {
    console.error('Error starting challenge:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to start challenge',
      error: error.message
    });
  }
}

export async function updateChallengeProgress(req: Request, res: Response) {
  try {
    const { userId, challengeId } = req.params;
    const { progress } = req.body;
    
    if (!userId || !challengeId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID and Challenge ID are required'
      });
    }
    
    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Progress must be a number between 0 and 100'
      });
    }
    
    // Check if user has started this challenge
    const existingUserChallenge = await db.select()
      .from(userChallenges)
      .where(
        and(
          eq(userChallenges.user_id, parseInt(userId)),
          eq(userChallenges.challenge_id, parseInt(challengeId))
        )
      )
      .limit(1);
    
    if (existingUserChallenge.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User has not started this challenge'
      });
    }
    
    // Get challenge details
    const [challengeData] = await db.select()
      .from(challenges)
      .where(eq(challenges.id, parseInt(challengeId)))
      .limit(1);
    
    if (!challengeData) {
      return res.status(404).json({
        status: 'error',
        message: 'Challenge not found'
      });
    }
    
    // Update user challenge progress
    const [updatedUserChallenge] = await db.update(userChallenges)
      .set({
        progress: progress,
        completed: progress >= 100,
        ...(progress >= 100 ? { completed_at: new Date() } : {})
      })
      .where(eq(userChallenges.id, existingUserChallenge[0].id))
      .returning();
    
    // If challenge is completed, update user points and log activity
    if (progress >= 100 && !existingUserChallenge[0].completed) {
      // Update user experience points
      await db.update(users)
        .set({
          experience_points: sql`${users.experience_points} + ${challengeData.points}`
        })
        .where(eq(users.id, parseInt(userId)));
      
      // Log activity
      await db.insert(activityLogs)
        .values({
          user_id: parseInt(userId),
          activity_type: 'challenge_completed',
          description: `Completed challenge: ${challengeData.name}`,
          points_earned: challengeData.points,
          metadata: {
            challenge_id: challengeData.id,
            challenge_name: challengeData.name,
            challenge_category: challengeData.category
          }
        });
      
      // Check for level up
      await checkForLevelUp(parseInt(userId));
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Challenge progress updated successfully',
      data: updatedUserChallenge
    });
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update challenge progress',
      error: error.message
    });
  }
}

// Activity and Points
export async function getUserActivity(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }
    
    const userActivities = await db.select()
      .from(activityLogs)
      .where(eq(activityLogs.user_id, parseInt(userId)))
      .orderBy(desc(activityLogs.created_at))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));
    
    return res.status(200).json({
      status: 'success',
      data: userActivities
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user activities',
      error: error.message
    });
  }
}

export async function getUserProfile(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }
    
    // Get user data
    const [userData] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      experiencePoints: users.experience_points
      // Do not select profile_image as it may not exist in the database yet
      // We'll add a default profile image later
    })
    .from(users)
    .where(eq(users.id, parseInt(userId)))
    .limit(1);
    
    if (!userData) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Get user achievements count
    const [achievementsCount] = await db.select({
      total: sql<number>`count(*)`,
      completed: sql<number>`sum(case when ${userAchievements.completed} = true then 1 else 0 end)`
    })
    .from(userAchievements)
    .where(eq(userAchievements.user_id, parseInt(userId)));
    
    // Get user challenges count
    const [challengesCount] = await db.select({
      total: sql<number>`count(*)`,
      completed: sql<number>`sum(case when ${userChallenges.completed} = true then 1 else 0 end)`
    })
    .from(userChallenges)
    .where(eq(userChallenges.user_id, parseInt(userId)));
    
    // Get total points earned
    const [pointsData] = await db.select({
      totalPoints: sql<number>`sum(${activityLogs.points_earned})`
    })
    .from(activityLogs)
    .where(eq(activityLogs.user_id, parseInt(userId)));
    
    // Calculate level from experience points
    let calculatedLevel = 1;
    while (calculateXpForLevel(calculatedLevel + 1) <= userData.experiencePoints) {
      calculatedLevel++;
    }
    
    // Calculate next level requirement
    const nextLevelXp = calculateXpForNextLevel(calculatedLevel);
    const currentLevelXp = calculateXpForLevel(calculatedLevel);
    const xpProgress = Math.min(100, Math.floor(((userData.experiencePoints - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100));
    
    return res.status(200).json({
      status: 'success',
      data: {
        ...userData,
        // Add default profile image
        profileImage: '/assets/default-avatar.png',
        achievements: {
          total: achievementsCount.total || 0,
          completed: achievementsCount.completed || 0
        },
        challenges: {
          total: challengesCount.total || 0,
          completed: challengesCount.completed || 0
        },
        points: {
          total: pointsData.totalPoints || 0
        },
        levelProgress: {
          currentLevel: calculatedLevel,
          experiencePoints: userData.experiencePoints,
          nextLevelXp,
          currentLevelXp,
          xpToNextLevel: nextLevelXp - userData.experiencePoints,
          progress: xpProgress
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
}

// Leaderboard Actions
export async function getLeaderboards(req: Request, res: Response) {
  try {
    const { category, type } = req.query;
    
    let query = db.select().from(leaderboards);
    
    if (category) {
      query = query.where(eq(leaderboards.category, category as string));
    }
    
    if (type) {
      query = query.where(eq(leaderboards.type, type as string));
    }
    
    const leaderboardsList = await query;
    
    return res.status(200).json({
      status: 'success',
      data: leaderboardsList
    });
  } catch (error) {
    console.error('Error fetching leaderboards:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch leaderboards',
      error: error.message
    });
  }
}

export async function getLeaderboardEntries(req: Request, res: Response) {
  try {
    const { leaderboardId } = req.params;
    const { limit = 100, offset = 0 } = req.query;
    
    if (!leaderboardId) {
      return res.status(400).json({
        status: 'error',
        message: 'Leaderboard ID is required'
      });
    }
    
    // Get leaderboard details
    const [leaderboardData] = await db.select()
      .from(leaderboards)
      .where(eq(leaderboards.id, parseInt(leaderboardId)))
      .limit(1);
    
    if (!leaderboardData) {
      return res.status(404).json({
        status: 'error',
        message: 'Leaderboard not found'
      });
    }
    
    // Get entries
    const entries = await db.select({
      id: leaderboardEntries.id,
      leaderboardId: leaderboardEntries.leaderboard_id,
      userId: leaderboardEntries.user_id,
      username: users.username,
      // Removed reference to users.profile_image
      score: leaderboardEntries.score,
      rank: leaderboardEntries.rank,
      updatedAt: leaderboardEntries.updated_at
    })
    .from(leaderboardEntries)
    .leftJoin(users, eq(leaderboardEntries.user_id, users.id))
    .where(eq(leaderboardEntries.leaderboard_id, parseInt(leaderboardId)))
    .orderBy(asc(leaderboardEntries.rank))
    .limit(parseInt(limit as string))
    .offset(parseInt(offset as string));
    
    // Add default profile image to each entry
    const entriesWithDefaults = entries.map(entry => ({
      ...entry,
      profileImage: '/assets/default-avatar.png'
    }));

    return res.status(200).json({
      status: 'success',
      data: {
        leaderboard: leaderboardData,
        entries: entriesWithDefaults
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard entries:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch leaderboard entries',
      error: error.message
    });
  }
}

// Helper methods
// Calculate XP needed for a specific level
function calculateXpForLevel(level: number): number {
  // Level 1: 0 XP
  // Each level requires baseXP * level * 1.5 points more than the previous level
  if (level <= 1) return 0;
  
  const baseXP = 100;
  let totalXP = 0;
  
  for (let i = 1; i < level; i++) {
    totalXP += Math.floor(baseXP * i * 1.5);
  }
  
  return totalXP;
}

// Calculate XP needed for the next level
function calculateXpForNextLevel(currentLevel: number): number {
  return calculateXpForLevel(currentLevel + 1);
}

// Check if user leveled up and update if needed
async function checkForLevelUp(userId: number): Promise<boolean> {
  try {
    // Get user current XP
    const [userData] = await db.select({
      id: users.id,
      experiencePoints: users.experience_points
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
    
    if (!userData) return false;
    
    // Calculate the current level based on XP
    let currentLevel = 1;
    while (calculateXpForLevel(currentLevel + 1) <= userData.experiencePoints) {
      currentLevel++;
    }
    
    // Calculate the new level based on XP after the XP update
    let newLevel = currentLevel;
    let leveledUp = false;
    
    // Keep checking levels until we find the appropriate level for current XP
    while (calculateXpForLevel(newLevel + 1) <= userData.experiencePoints) {
      newLevel++;
      leveledUp = true;
    }
    
    if (leveledUp) {
      // Update user level
      await db.update(users)
        .set({ level: newLevel })
        .where(eq(users.id, userId));
      
      // Log level up activity
      await db.insert(activityLogs)
        .values({
          user_id: userId,
          activity_type: 'level_up',
          description: `Leveled up to level ${newLevel}`,
          points_earned: 0,
          metadata: {
            old_level: currentLevel,
            new_level: newLevel
          }
        });
      
      // Check for level achievements
      // This could trigger achievements for reaching certain levels
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking for level up:', error);
    return false;
  }
}