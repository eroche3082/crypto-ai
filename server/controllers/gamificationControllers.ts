import { Request, Response } from 'express';
import { gamificationService } from '../services/gamification/gamificationService';

// Get user's gamification profile
export async function getGamificationProfile(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    const profile = await gamificationService.getProfile(userId);
    
    return res.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    console.error('Error in gamification profile controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving gamification profile'
    });
  }
}

// Get user achievements
export async function getUserAchievements(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    const achievements = await gamificationService.getUserAchievements(userId);
    
    return res.json({
      success: true,
      data: achievements
    });
  } catch (error: any) {
    console.error('Error in user achievements controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving user achievements'
    });
  }
}

// Get all available achievements
export async function getAvailableAchievements(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    const availableAchievements = await gamificationService.getAvailableAchievements(userId);
    
    return res.json({
      success: true,
      data: availableAchievements
    });
  } catch (error: any) {
    console.error('Error in available achievements controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving available achievements'
    });
  }
}

// Get user challenges
export async function getUserChallenges(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    const challenges = await gamificationService.getUserChallenges(userId);
    
    return res.json({
      success: true,
      data: challenges
    });
  } catch (error: any) {
    console.error('Error in user challenges controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving user challenges'
    });
  }
}

// Get all available challenges
export async function getAvailableChallenges(req: Request, res: Response) {
  try {
    const availableChallenges = await gamificationService.getAvailableChallenges();
    
    return res.json({
      success: true,
      data: availableChallenges
    });
  } catch (error: any) {
    console.error('Error in available challenges controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving available challenges'
    });
  }
}

// Start a challenge for a user
export async function startChallenge(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);
    const challengeId = parseInt(req.params.challengeId);
    
    if (isNaN(userId) || isNaN(challengeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID or challenge ID'
      });
    }
    
    const result = await gamificationService.startChallenge(userId, challengeId);
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error in start challenge controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error starting challenge'
    });
  }
}

// Get user activity logs
export async function getUserActivity(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    const activityLogs = await gamificationService.getUserActivity(userId, limit);
    
    return res.json({
      success: true,
      data: activityLogs
    });
  } catch (error: any) {
    console.error('Error in user activity controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving user activity logs'
    });
  }
}