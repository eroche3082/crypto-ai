/**
 * Phase 4 Automation Utilities
 * 
 * Provides automation functions for Phase 4 features including
 * AI recommendations, behavior tracking, and self-optimization.
 */

import { getFirebaseInstance } from '../services/firebaseSync';
import { sendContextAwareMessage } from '../services/contextAwareChatService';

// User interaction patterns
interface InteractionPattern {
  tabId: string;
  actions: string[];
  frequency: number;
  lastSeen: string;
}

// User behavior profile
interface UserBehaviorProfile {
  interests: string[];
  frequentSearches: string[];
  interactionPatterns: InteractionPattern[];
  preferredCurrencies: string[];
  sessionDuration: number;
  lastUpdated: string;
}

// AI recommendation
export interface AIRecommendation {
  id: string;
  type: 'content' | 'action' | 'notification';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  actionUrl?: string;
  icon?: string;
  dismissed?: boolean;
  createdAt: string;
}

// Cache for behavior profiles
const behaviorProfileCache = new Map<string, UserBehaviorProfile>();

/**
 * Track user behavior
 */
export async function trackBehavior(
  userId: string,
  action: string,
  details: any = {},
  tabContext?: string
): Promise<void> {
  // Skip tracking for anonymous users
  if (!userId) return;
  
  try {
    // Log to Firebase if available
    const firebase = getFirebaseInstance();
    
    if (firebase) {
      await firebase.logBehavior(userId, action, details, tabContext);
    }
    
    // Also update local cache
    updateBehaviorProfile(userId, action, details, tabContext);
  } catch (error) {
    console.error('Error tracking behavior:', error);
  }
}

/**
 * Update user behavior profile
 */
function updateBehaviorProfile(
  userId: string,
  action: string,
  details: any,
  tabContext?: string
): void {
  // Get or create profile
  let profile = behaviorProfileCache.get(userId);
  
  if (!profile) {
    profile = {
      interests: [],
      frequentSearches: [],
      interactionPatterns: [],
      preferredCurrencies: [],
      sessionDuration: 0,
      lastUpdated: new Date().toISOString()
    };
    behaviorProfileCache.set(userId, profile);
  }
  
  // Update profile based on action
  switch (action) {
    case 'search':
      if (details.query) {
        // Add to frequent searches
        const searchIndex = profile.frequentSearches.findIndex(s => s === details.query);
        if (searchIndex >= 0) {
          // Move to top if exists
          profile.frequentSearches.splice(searchIndex, 1);
        }
        profile.frequentSearches.unshift(details.query);
        
        // Keep only top 10
        if (profile.frequentSearches.length > 10) {
          profile.frequentSearches = profile.frequentSearches.slice(0, 10);
        }
      }
      break;
      
    case 'view_coin':
      if (details.coin) {
        // Add to interests
        if (!profile.preferredCurrencies.includes(details.coin)) {
          profile.preferredCurrencies.push(details.coin);
          
          // Keep only top 10
          if (profile.preferredCurrencies.length > 10) {
            profile.preferredCurrencies.pop();
          }
        }
      }
      break;
      
    case 'tab_interaction':
      if (tabContext) {
        // Update interaction patterns
        const patternIndex = profile.interactionPatterns.findIndex(p => p.tabId === tabContext);
        
        if (patternIndex >= 0) {
          // Increment existing pattern
          profile.interactionPatterns[patternIndex].frequency += 1;
          profile.interactionPatterns[patternIndex].lastSeen = new Date().toISOString();
          
          // Add action to pattern if new
          if (details.subAction && !profile.interactionPatterns[patternIndex].actions.includes(details.subAction)) {
            profile.interactionPatterns[patternIndex].actions.push(details.subAction);
          }
        } else {
          // Create new pattern
          profile.interactionPatterns.push({
            tabId: tabContext,
            actions: details.subAction ? [details.subAction] : [],
            frequency: 1,
            lastSeen: new Date().toISOString()
          });
        }
      }
      break;
  }
  
  // Update timestamp
  profile.lastUpdated = new Date().toISOString();
}

/**
 * Get AI recommendations based on user behavior
 */
export async function getAIRecommendations(
  userId: string,
  count: number = 3
): Promise<AIRecommendation[]> {
  // Skip for anonymous users
  if (!userId) return [];
  
  try {
    // Get user profile
    const profile = behaviorProfileCache.get(userId);
    
    if (!profile) {
      return [];
    }
    
    // Get behaviors from Firebase
    const firebase = getFirebaseInstance();
    const recentBehaviors = firebase 
      ? await firebase.getRecentBehaviors(userId, 20)
      : [];
    
    // Generate prompt for AI
    const behaviorsText = recentBehaviors.length > 0
      ? `Recent user behaviors:\n${recentBehaviors.map(b => 
          `- ${b.action} in ${b.tabContext || 'unknown'} tab at ${b.timestamp}`
        ).join('\n')}`
      : '';
    
    const profileText = `User profile:
- Interests: ${profile.interests.join(', ') || 'None yet'}
- Frequent searches: ${profile.frequentSearches.join(', ') || 'None yet'}
- Preferred cryptocurrencies: ${profile.preferredCurrencies.join(', ') || 'None yet'}
- Most used tabs: ${profile.interactionPatterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3)
      .map(p => p.tabId)
      .join(', ') || 'None yet'}`;
    
    const prompt = `Based on the following user profile and behaviors, generate ${count} personalized cryptocurrency recommendations.
${profileText}
${behaviorsText}

For each recommendation, provide:
1. A short, specific title
2. A brief, helpful message (max 150 chars)
3. Priority (low, medium, high)
4. Type (content, action, notification)
5. A related URL or action

Format your response as JSON with this structure:
[
  {
    "title": "...",
    "message": "...",
    "priority": "...",
    "type": "...",
    "actionUrl": "..."
  }
]`;

    // Get AI recommendations
    const response = await sendContextAwareMessage(prompt, {
      systemPrompt: 'You are an AI recommendation engine for a cryptocurrency platform. Generate helpful, specific recommendations based on user behavior data.',
      provider: 'auto',
      temperature: 0.4,
      maxTokens: 1000
    });
    
    // Parse response
    let recommendations: Partial<AIRecommendation>[] = [];
    
    try {
      const responseText = response.text.replace(/```json|```/g, '').trim();
      recommendations = JSON.parse(responseText);
    } catch (error) {
      console.error('Error parsing AI recommendations:', error);
      return [];
    }
    
    // Format and return recommendations
    return recommendations.map((rec, index) => ({
      id: `rec_${Date.now()}_${index}`,
      title: rec.title || 'Recommendation',
      message: rec.message || 'Check out this interesting opportunity.',
      priority: rec.priority as 'low' | 'medium' | 'high' || 'medium',
      type: rec.type as 'content' | 'action' | 'notification' || 'content',
      actionUrl: rec.actionUrl,
      dismissed: false,
      createdAt: new Date().toISOString()
    })).slice(0, count);
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    return [];
  }
}

/**
 * Get tab-specific AI assistance
 */
export async function getTabAssistance(
  userId: string,
  tabId: string,
  userAction?: string
): Promise<string> {
  // Skip for anonymous users
  if (!userId) return '';
  
  try {
    // Get user profile
    const profile = behaviorProfileCache.get(userId);
    
    // Get tab pattern
    const tabPattern = profile
      ? profile.interactionPatterns.find(p => p.tabId === tabId)
      : null;
    
    // Generate prompt
    const prompt = `Generate a helpful tip for a user on the "${tabId}" tab of a cryptocurrency platform.
${profile ? `User's preferred currencies: ${profile.preferredCurrencies.join(', ')}` : ''}
${tabPattern ? `Common actions in this tab: ${tabPattern.actions.join(', ')}` : ''}
${userAction ? `Current action: ${userAction}` : ''}

The tip should be specific to the tab context and user's current action.
Keep it short, helpful and specific (max 150 characters).`;

    // Get AI assistance
    const response = await sendContextAwareMessage(prompt, {
      systemPrompt: 'You are a helpful cryptocurrency assistant. Provide concise, targeted advice based on the user\'s context.',
      provider: 'auto',
      temperature: 0.7,
      maxTokens: 200,
      tabContext: tabId
    });
    
    return response.text.trim();
  } catch (error) {
    console.error('Error getting tab assistance:', error);
    return '';
  }
}

/**
 * Get personalized crypto news based on user interests
 */
export async function getPersonalizedNews(
  userId: string,
  count: number = 3
): Promise<any[]> {
  // Skip for anonymous users
  if (!userId) return [];
  
  try {
    // Get user profile
    const profile = behaviorProfileCache.get(userId);
    
    if (!profile || profile.preferredCurrencies.length === 0) {
      // No personalization data available
      return [];
    }
    
    // Get top currencies
    const topCurrencies = profile.preferredCurrencies.slice(0, 3);
    
    // Fetch news (implementation depends on available news API)
    // For now, return empty array as this requires external API
    return [];
  } catch (error) {
    console.error('Error getting personalized news:', error);
    return [];
  }
}