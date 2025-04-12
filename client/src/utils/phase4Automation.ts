/**
 * Phase 4 Automation Utilities
 * 
 * Provides utilities for AI-driven recommendations, self-optimization,
 * and adaptive user experience based on behavior patterns.
 */

import { v4 as uuidv4 } from 'uuid';
import { getFirebaseInstance } from '../services/firebaseSync';
import { getCombinedContextForTab } from './chatContextManager';

// Recommendation priority
export type RecommendationPriority = 'low' | 'medium' | 'high';

// Recommendation type
export type RecommendationType = 'content' | 'action' | 'notification';

// AI Recommendation
export interface AIRecommendation {
  id: string;
  title: string;
  message: string;
  priority: RecommendationPriority;
  type: RecommendationType;
  dismissed?: boolean;
  actionUrl?: string;
  category?: string;
  icon?: string;
  timestamp?: number;
}

// Behavior pattern
interface BehaviorPattern {
  pattern: string;
  frequency: number;
  lastSeen: number;
  firstSeen: number;
  confidence: number;
}

// Cache for user behavior patterns
const userBehaviorPatterns: Record<string, BehaviorPattern[]> = {};

// Cache for AI recommendations
const userRecommendations: Record<string, AIRecommendation[]> = {};

// Default recommendations (used when no user-specific recommendations are available)
const defaultRecommendations: AIRecommendation[] = [
  {
    id: 'default-1',
    title: 'Explore the CryptoBot AI',
    message: 'Ask me anything about cryptocurrencies, market trends, or trading strategies. I\'m here to help!',
    priority: 'medium',
    type: 'content',
    actionUrl: '#chatbot'
  },
  {
    id: 'default-2',
    title: 'Set Up Price Alerts',
    message: 'Never miss important price movements. Configure alerts for your favorite coins.',
    priority: 'medium',
    type: 'action',
    actionUrl: '/alerts',
    category: 'feature',
    icon: '🔔'
  },
  {
    id: 'default-3',
    title: 'Enable Cross-Device Sync',
    message: 'Keep your data synchronized across all your devices by connecting with your Google account.',
    priority: 'high',
    type: 'action',
    actionUrl: '/settings/sync',
    category: 'account',
    icon: '🔄'
  }
];

/**
 * Get AI recommendations for a user
 */
export async function getAIRecommendations(
  userId: string,
  count: number = 3
): Promise<AIRecommendation[]> {
  try {
    // Return cached recommendations if available
    if (userRecommendations[userId] && userRecommendations[userId].length >= count) {
      return userRecommendations[userId].slice(0, count);
    }
    
    // Get Firebase instance
    const firebase = getFirebaseInstance();
    
    if (!firebase) {
      // Return default recommendations if Firebase is not available
      return defaultRecommendations.slice(0, count);
    }
    
    // Load user preferences and behavior patterns
    const preferredTopics = await firebase.loadPreference(userId, 'preferredTopics') || [];
    const favoriteCoins = await firebase.loadPreference(userId, 'favoriteCoins') || [];
    const recentBehaviors = await firebase.getRecentBehaviors(userId, 50);
    
    // Analyze behaviors to find patterns
    const patterns = analyzeBehaviorPatterns(recentBehaviors);
    userBehaviorPatterns[userId] = patterns;
    
    // Generate personalized recommendations based on patterns
    const recommendations = generateRecommendations(
      patterns,
      preferredTopics,
      favoriteCoins
    );
    
    // Cache recommendations
    userRecommendations[userId] = recommendations;
    
    // Return the requested number of recommendations
    return recommendations.slice(0, count);
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    
    // Return default recommendations if there's an error
    return defaultRecommendations.slice(0, count);
  }
}

/**
 * Get context-aware recommendations for a specific tab
 */
export async function getTabRecommendations(
  userId: string,
  tabId: string,
  count: number = 3
): Promise<AIRecommendation[]> {
  try {
    // Get general recommendations
    const recommendations = await getAIRecommendations(userId, count * 2);
    
    // Get tab context
    const context = getCombinedContextForTab(tabId);
    
    // Filter recommendations based on tab context
    let filteredRecommendations = recommendations;
    
    if (context.tabName) {
      // Filter by tab name (simple matching)
      const tabNameLower = context.tabName.toLowerCase();
      
      // Prioritize recommendations related to this tab
      filteredRecommendations = recommendations.sort((a, b) => {
        const aMatchesTab = 
          a.title.toLowerCase().includes(tabNameLower) || 
          a.message.toLowerCase().includes(tabNameLower) ||
          (a.category && a.category.toLowerCase().includes(tabNameLower));
        
        const bMatchesTab = 
          b.title.toLowerCase().includes(tabNameLower) || 
          b.message.toLowerCase().includes(tabNameLower) ||
          (b.category && b.category.toLowerCase().includes(tabNameLower));
        
        if (aMatchesTab && !bMatchesTab) return -1;
        if (!aMatchesTab && bMatchesTab) return 1;
        return 0;
      });
    }
    
    if (context.currentCoin) {
      // Prioritize recommendations related to current coin
      const coinNameLower = context.currentCoin.toLowerCase();
      
      filteredRecommendations = filteredRecommendations.sort((a, b) => {
        const aMatchesCoin = 
          a.title.toLowerCase().includes(coinNameLower) || 
          a.message.toLowerCase().includes(coinNameLower);
        
        const bMatchesCoin = 
          b.title.toLowerCase().includes(coinNameLower) || 
          b.message.toLowerCase().includes(coinNameLower);
        
        if (aMatchesCoin && !bMatchesCoin) return -1;
        if (!aMatchesCoin && bMatchesCoin) return 1;
        return 0;
      });
    }
    
    // Take the top items after filtering
    return filteredRecommendations.slice(0, count);
  } catch (error) {
    console.error('Error getting tab recommendations:', error);
    
    // Return default recommendations if there's an error
    return defaultRecommendations.slice(0, count);
  }
}

/**
 * Analyze behavior patterns
 */
function analyzeBehaviorPatterns(behaviors: any[]): BehaviorPattern[] {
  // Simple pattern detection for common user actions
  const patterns: Record<string, BehaviorPattern> = {};
  
  // Count occurrences of each action
  for (const behavior of behaviors) {
    const action = behavior.action;
    const timestamp = behavior.timestamp.toDate ? behavior.timestamp.toDate().getTime() : behavior.timestamp;
    
    if (!patterns[action]) {
      patterns[action] = {
        pattern: action,
        frequency: 1,
        lastSeen: timestamp,
        firstSeen: timestamp,
        confidence: 0.5 // Initial confidence
      };
    } else {
      patterns[action].frequency += 1;
      patterns[action].lastSeen = Math.max(patterns[action].lastSeen, timestamp);
      patterns[action].firstSeen = Math.min(patterns[action].firstSeen, timestamp);
      
      // Increase confidence with repeated observations
      patterns[action].confidence = Math.min(0.95, patterns[action].confidence + 0.05);
    }
  }
  
  // Look for tab sequences (common navigation paths)
  const tabSequences: Record<string, number> = {};
  for (let i = 0; i < behaviors.length - 1; i++) {
    if (behaviors[i].action === 'tab_change' && behaviors[i+1].action === 'tab_change') {
      const sequence = `${behaviors[i].tabContext} → ${behaviors[i+1].tabContext}`;
      tabSequences[sequence] = (tabSequences[sequence] || 0) + 1;
    }
  }
  
  // Add tab sequence patterns
  Object.entries(tabSequences).forEach(([sequence, count]) => {
    if (count >= 2) { // Only include sequences that occur multiple times
      patterns[`sequence_${sequence}`] = {
        pattern: `tab_sequence:${sequence}`,
        frequency: count,
        lastSeen: behaviors[0].timestamp.toDate ? behaviors[0].timestamp.toDate().getTime() : behaviors[0].timestamp,
        firstSeen: behaviors[behaviors.length - 1].timestamp.toDate ? 
          behaviors[behaviors.length - 1].timestamp.toDate().getTime() : 
          behaviors[behaviors.length - 1].timestamp,
        confidence: Math.min(0.9, 0.5 + (count / 10))
      };
    }
  });
  
  // Convert to array and sort by frequency
  return Object.values(patterns).sort((a, b) => b.frequency - a.frequency);
}

/**
 * Generate recommendations based on behavior patterns
 */
function generateRecommendations(
  patterns: BehaviorPattern[],
  preferredTopics: string[] = [],
  favoriteCoins: string[] = []
): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];
  
  // Add recommendations based on behavior patterns
  for (const pattern of patterns) {
    if (pattern.frequency >= 3) {
      if (pattern.pattern.startsWith('tab_sequence:')) {
        // Tab sequence recommendation
        const sequence = pattern.pattern.replace('tab_sequence:', '');
        const [fromTab, toTab] = sequence.split(' → ');
        
        recommendations.push({
          id: uuidv4(),
          title: `Optimize Your Workflow`,
          message: `We noticed you frequently navigate from ${fromTab} to ${toTab}. Would you like to create a custom dashboard with both?`,
          priority: 'medium',
          type: 'action',
          actionUrl: '/settings/custom-dashboard',
          category: 'user_experience',
          icon: '📊',
          timestamp: Date.now()
        });
      } else if (pattern.pattern === 'search') {
        // Search recommendation
        recommendations.push({
          id: uuidv4(),
          title: 'Improve Your Search Experience',
          message: 'You search often. Create saved searches for quick access to your common queries.',
          priority: 'medium',
          type: 'action',
          actionUrl: '/settings/saved-searches',
          category: 'user_experience',
          icon: '🔍',
          timestamp: Date.now()
        });
      } else if (pattern.pattern === 'view_chart') {
        // Chart recommendation
        recommendations.push({
          id: uuidv4(),
          title: 'Enhanced Charts',
          message: 'Enable advanced chart indicators for more detailed market analysis.',
          priority: 'medium',
          type: 'action',
          actionUrl: '/settings/charts',
          category: 'feature',
          icon: '📈',
          timestamp: Date.now()
        });
      } else if (pattern.pattern === 'favorite_coin') {
        // Favorite recommendation
        recommendations.push({
          id: uuidv4(),
          title: 'Favorite Coins Management',
          message: 'Organize your favorite coins into watchlist groups for better portfolio monitoring.',
          priority: 'high',
          type: 'action',
          actionUrl: '/portfolio/watchlists',
          category: 'feature',
          icon: '⭐',
          timestamp: Date.now()
        });
      }
    }
  }
  
  // Add recommendations based on preferred topics
  if (preferredTopics.includes('defi')) {
    recommendations.push({
      id: uuidv4(),
      title: 'DeFi Opportunities',
      message: 'Check out the latest DeFi protocols with high yield opportunities.',
      priority: 'medium',
      type: 'content',
      actionUrl: '/defi/opportunities',
      category: 'defi',
      icon: '💸',
      timestamp: Date.now()
    });
  }
  
  if (preferredTopics.includes('nft')) {
    recommendations.push({
      id: uuidv4(),
      title: 'NFT Market Trends',
      message: 'Explore the latest trending NFT collections and market analytics.',
      priority: 'medium',
      type: 'content',
      actionUrl: '/nft/trends',
      category: 'nft',
      icon: '🖼️',
      timestamp: Date.now()
    });
  }
  
  // Add recommendations based on favorite coins
  if (favoriteCoins.length > 0) {
    recommendations.push({
      id: uuidv4(),
      title: 'Portfolio Insights',
      message: 'Get AI-powered insights on your favorite coins and optimal portfolio allocation.',
      priority: 'high',
      type: 'content',
      actionUrl: '/portfolio/insights',
      category: 'portfolio',
      icon: '📊',
      timestamp: Date.now()
    });
  }
  
  // Add default recommendations if we don't have enough
  if (recommendations.length < 3) {
    for (const defaultRec of defaultRecommendations) {
      if (!recommendations.some(r => r.title === defaultRec.title)) {
        recommendations.push({
          ...defaultRec,
          id: uuidv4(),
          timestamp: Date.now()
        });
      }
      
      if (recommendations.length >= 5) break;
    }
  }
  
  // Sort by priority
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Track user interaction with a recommendation
 */
export async function trackRecommendationInteraction(
  userId: string,
  recommendationId: string,
  action: 'view' | 'dismiss' | 'click'
): Promise<void> {
  try {
    const firebase = getFirebaseInstance();
    
    if (!firebase) {
      return;
    }
    
    // Track interaction with the recommendation
    await firebase.trackBehavior(
      userId,
      'recommendation_interaction',
      {
        recommendationId,
        action
      }
    );
    
    // Update user recommendations if recommendation was dismissed
    if (action === 'dismiss' && userRecommendations[userId]) {
      userRecommendations[userId] = userRecommendations[userId].filter(r => r.id !== recommendationId);
    }
  } catch (error) {
    console.error('Error tracking recommendation interaction:', error);
  }
}

/**
 * Optimize user experience based on behavior patterns
 */
export async function optimizeUserExperience(
  userId: string
): Promise<{
  optimizations: string[];
  applied: boolean;
}> {
  try {
    const firebase = getFirebaseInstance();
    
    if (!firebase) {
      return {
        optimizations: [],
        applied: false
      };
    }
    
    // Get recent behaviors
    const recentBehaviors = await firebase.getRecentBehaviors(userId, 100);
    
    // Analyze patterns
    const patterns = analyzeBehaviorPatterns(recentBehaviors);
    
    // Apply optimizations based on patterns
    const optimizations: string[] = [];
    
    // Only optimize if we have enough data
    if (patterns.length < 3 || patterns[0].frequency < 5) {
      return {
        optimizations: [],
        applied: false
      };
    }
    
    // Check for frequently used features
    const frequentFeatures = patterns
      .filter(p => p.frequency >= 5)
      .map(p => p.pattern);
    
    if (frequentFeatures.includes('view_chart')) {
      // Optimize chart settings
      await firebase.savePreference(userId, 'optimizedCharts', true);
      optimizations.push('Enhanced chart loading speed');
    }
    
    if (frequentFeatures.includes('search')) {
      // Optimize search experience
      await firebase.savePreference(userId, 'searchHistoryEnabled', true);
      optimizations.push('Enabled search history for faster results');
    }
    
    if (frequentFeatures.includes('tab_change')) {
      // Optimize tab switching
      await firebase.savePreference(userId, 'tabPreloading', true);
      optimizations.push('Enabled tab preloading for smoother navigation');
    }
    
    // Apply any tab sequence optimizations
    const sequencePatterns = patterns.filter(p => p.pattern.startsWith('tab_sequence:'));
    if (sequencePatterns.length > 0) {
      await firebase.savePreference(userId, 'commonSequences', 
        sequencePatterns.map(p => p.pattern.replace('tab_sequence:', ''))
      );
      optimizations.push('Optimized navigation for your common workflows');
    }
    
    return {
      optimizations,
      applied: optimizations.length > 0
    };
  } catch (error) {
    console.error('Error optimizing user experience:', error);
    return {
      optimizations: [],
      applied: false
    };
  }
}