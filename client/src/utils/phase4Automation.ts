/**
 * Phase 4 Automation Utilities
 * 
 * Provides tools for AI-powered recommendation system, user behavior tracking,
 * and interface optimization based on usage patterns.
 */

import { getFirebaseInstance } from '@/services/firebaseSync';
import { v4 as uuidv4 } from 'uuid';

// Recommendation priority levels
export type RecommendationPriority = 'low' | 'medium' | 'high';

// Recommendation categories
export type RecommendationCategory = 
  | 'portfolio' 
  | 'trading' 
  | 'news' 
  | 'education' 
  | 'security' 
  | 'feature'
  | 'action'
  | 'system';

// Recommendation interaction types
export type RecommendationInteraction = 'view' | 'click' | 'dismiss';

// Recommendation interface
export interface AIRecommendation {
  id: string;
  title: string;
  message: string;
  priority: RecommendationPriority;
  category?: RecommendationCategory;
  timestamp?: number;
  icon?: string;
  actionUrl?: string;
  dismissed?: boolean;
  source?: string;
  tabContext?: string;
  metadata?: Record<string, any>;
}

// Behavior pattern interface
export interface BehaviorPattern {
  id: string;
  userId: string;
  pattern: string;
  frequency: number;
  lastDetected: number;
  metadata?: Record<string, any>;
}

// User preference interface
export interface UserPreference {
  id: string;
  userId: string;
  category: string;
  value: any;
  confidence: number;
  lastUpdated: number;
}

// Session context interface
export interface SessionContext {
  id: string;
  userId: string;
  startTime: number;
  lastActive: number;
  device: string;
  browser: string;
  behaviors: string[];
}

/**
 * Generate a recommendation based on behavior and context
 */
export async function generateRecommendation(
  userId: string,
  currentContext: string,
  behaviors: any[] = []
): Promise<AIRecommendation | null> {
  try {
    const firebase = getFirebaseInstance();
    if (!firebase) return null;
    
    // Get user preferences
    const preferences = await firebase.getUserPreferences(userId);
    
    // Get existing recommendations
    const existingRecommendations = await firebase.getUserRecommendations(userId);
    
    // Generate new recommendation based on context, behaviors, and preferences
    const recommendation = await createContextualRecommendation(
      userId,
      currentContext,
      behaviors,
      preferences,
      existingRecommendations
    );
    
    if (recommendation) {
      // Save the recommendation
      await firebase.saveRecommendation(userId, recommendation);
      return recommendation;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating recommendation:', error);
    return null;
  }
}

/**
 * Create a contextual recommendation
 */
export async function createContextualRecommendation(
  userId: string,
  currentContext: string,
  behaviors: any[],
  preferences: UserPreference[],
  existingRecommendations: AIRecommendation[]
): Promise<AIRecommendation | null> {
  try {
    // Get context-specific recommendation strategies
    const strategies = getRecommendationStrategies(currentContext);
    
    // Filter out strategies that have already been recommended
    const freshStrategies = strategies.filter(strategy => {
      return !existingRecommendations.some(
        rec => rec.source === strategy.id && rec.dismissed !== true
      );
    });
    
    if (freshStrategies.length === 0) {
      return null;
    }
    
    // Choose the highest priority strategy
    const strategy = freshStrategies.sort((a, b) => {
      const priorityValues = {
        high: 3,
        medium: 2,
        low: 1
      };
      
      return priorityValues[b.priority] - priorityValues[a.priority];
    })[0];
    
    // Create recommendation from strategy
    return {
      id: uuidv4(),
      title: strategy.title,
      message: strategy.message,
      priority: strategy.priority,
      category: strategy.category,
      timestamp: Date.now(),
      icon: strategy.icon,
      actionUrl: strategy.actionUrl,
      dismissed: false,
      source: strategy.id,
      tabContext: currentContext,
      metadata: {
        strategy: strategy.id,
        rules: strategy.rules
      }
    };
  } catch (error) {
    console.error('Error creating contextual recommendation:', error);
    return null;
  }
}

/**
 * Get recommendation strategies for a specific context
 */
function getRecommendationStrategies(context: string): any[] {
  const globalStrategies = [
    {
      id: 'global_portfolio_diversification',
      title: 'Diversify Your Portfolio',
      message: 'Your portfolio appears heavily concentrated in a few assets. Consider diversifying to reduce risk.',
      priority: 'medium' as RecommendationPriority,
      category: 'portfolio' as RecommendationCategory,
      icon: '📊',
      actionUrl: '/portfolio',
      rules: ['portfolio_concentration > 0.7']
    },
    {
      id: 'global_security_check',
      title: 'Security Check Recommended',
      message: 'It\'s been over 30 days since your last security review. Take a moment to verify your account security.',
      priority: 'high' as RecommendationPriority,
      category: 'security' as RecommendationCategory,
      icon: '🔒',
      actionUrl: '/settings/security',
      rules: ['days_since_security_check > 30']
    },
    {
      id: 'global_crypto_news',
      title: 'Market Insight Available',
      message: 'Major market movements detected. Check the latest news for investment opportunities.',
      priority: 'medium' as RecommendationPriority,
      category: 'news' as RecommendationCategory,
      icon: '📰',
      actionUrl: '/news',
      rules: ['market_volatility > 0.2']
    },
    {
      id: 'global_trending_assets',
      title: 'Trending Assets',
      message: 'Several assets are gaining significant attention. Explore trending cryptocurrencies.',
      priority: 'low' as RecommendationPriority,
      category: 'trading' as RecommendationCategory,
      icon: '🔥',
      actionUrl: '/market/trending',
      rules: ['trending_assets_count > 5']
    }
  ];
  
  // Context-specific strategies
  const contextStrategies: Record<string, any[]> = {
    dashboard: [
      {
        id: 'dashboard_portfolio_alert',
        title: 'Portfolio Alert',
        message: 'One of your assets has increased by over 5% in the last 24 hours.',
        priority: 'medium' as RecommendationPriority,
        category: 'portfolio' as RecommendationCategory,
        icon: '📈',
        actionUrl: '/portfolio',
        rules: ['portfolio_asset_increase > 0.05']
      },
      {
        id: 'dashboard_market_summary',
        title: 'Market Summary',
        message: 'View your personalized market summary with key metrics and insights.',
        priority: 'low' as RecommendationPriority,
        category: 'trading' as RecommendationCategory,
        icon: '📊',
        actionUrl: '/market/summary',
        rules: ['dashboard_visits > 5']
      }
    ],
    portfolio: [
      {
        id: 'portfolio_rebalance',
        title: 'Portfolio Rebalance',
        message: 'Your portfolio allocation has drifted from your targets. Consider rebalancing.',
        priority: 'medium' as RecommendationPriority,
        category: 'portfolio' as RecommendationCategory,
        icon: '⚖️',
        actionUrl: '/portfolio/rebalance',
        rules: ['portfolio_drift > 0.1']
      },
      {
        id: 'portfolio_tax_loss_harvesting',
        title: 'Tax Loss Harvesting',
        message: 'You may have opportunities for tax loss harvesting in your portfolio.',
        priority: 'medium' as RecommendationPriority,
        category: 'portfolio' as RecommendationCategory,
        icon: '💰',
        actionUrl: '/portfolio/tax',
        rules: ['unrealized_losses > 1000']
      }
    ],
    news: [
      {
        id: 'news_saved_articles',
        title: 'Saved Articles',
        message: 'You have unread saved articles. Continue where you left off.',
        priority: 'low' as RecommendationPriority,
        category: 'news' as RecommendationCategory,
        icon: '📑',
        actionUrl: '/news/saved',
        rules: ['unread_saved_articles > 0']
      }
    ],
    education: [
      {
        id: 'education_course_progress',
        title: 'Continue Learning',
        message: 'You\'re 75% through your current course. Complete it to earn your certificate.',
        priority: 'medium' as RecommendationPriority,
        category: 'education' as RecommendationCategory,
        icon: '🎓',
        actionUrl: '/education/courses/current',
        rules: ['course_completion > 0.5', 'course_completion < 1.0']
      }
    ],
    settings: [
      {
        id: 'settings_notification_preferences',
        title: 'Update Notifications',
        message: 'You have unoptimized notification settings. Customize them for better alerts.',
        priority: 'low' as RecommendationPriority,
        category: 'system' as RecommendationCategory,
        icon: '🔔',
        actionUrl: '/settings/notifications',
        rules: ['notification_settings_unchanged']
      }
    ]
  };
  
  // Return context-specific strategies plus global strategies
  return [
    ...(contextStrategies[context] || []),
    ...globalStrategies
  ];
}

/**
 * Track user interaction with a recommendation
 */
export async function trackRecommendationInteraction(
  userId: string,
  recommendationId: string,
  interactionType: RecommendationInteraction
): Promise<void> {
  try {
    const firebase = getFirebaseInstance();
    if (!firebase) return;
    
    // Log the interaction
    await firebase.logUserInteraction(userId, 'recommendation_interaction', {
      recommendationId,
      interactionType,
      timestamp: Date.now()
    });
    
    // If dismissed, update recommendation
    if (interactionType === 'dismiss') {
      await firebase.updateRecommendation(userId, recommendationId, {
        dismissed: true
      });
    }
  } catch (error) {
    console.error('Error tracking recommendation interaction:', error);
    throw error;
  }
}

/**
 * Detect behavior patterns from user actions
 */
export async function detectBehaviorPatterns(
  userId: string,
  recentBehaviors: any[]
): Promise<BehaviorPattern[]> {
  try {
    // Detect patterns in user behavior
    const patterns: BehaviorPattern[] = [];
    
    // Frequency analysis
    const actionCounts: Record<string, number> = {};
    const tabCounts: Record<string, number> = {};
    const timeCounts: Record<number, number> = {};
    
    recentBehaviors.forEach(behavior => {
      // Count actions
      actionCounts[behavior.action] = (actionCounts[behavior.action] || 0) + 1;
      
      // Count tabs
      if (behavior.tabContext) {
        tabCounts[behavior.tabContext] = (tabCounts[behavior.tabContext] || 0) + 1;
      }
      
      // Count activity times
      if (behavior.timestamp) {
        const date = new Date(behavior.timestamp);
        const hour = date.getHours();
        timeCounts[hour] = (timeCounts[hour] || 0) + 1;
      }
    });
    
    // Detect frequent actions
    Object.entries(actionCounts).forEach(([action, count]) => {
      if (count >= 5) {
        patterns.push({
          id: uuidv4(),
          userId,
          pattern: `frequent_action_${action}`,
          frequency: count,
          lastDetected: Date.now(),
          metadata: { action }
        });
      }
    });
    
    // Detect preferred tabs
    Object.entries(tabCounts).forEach(([tab, count]) => {
      if (count >= 3) {
        patterns.push({
          id: uuidv4(),
          userId,
          pattern: `preferred_tab_${tab}`,
          frequency: count,
          lastDetected: Date.now(),
          metadata: { tab }
        });
      }
    });
    
    // Detect active hours
    Object.entries(timeCounts).forEach(([hour, count]) => {
      if (count >= 3) {
        patterns.push({
          id: uuidv4(),
          userId,
          pattern: `active_hour_${hour}`,
          frequency: count,
          lastDetected: Date.now(),
          metadata: { hour: parseInt(hour) }
        });
      }
    });
    
    // Detect sequences (e.g., dashboard -> portfolio -> trade)
    const sequences = detectActionSequences(recentBehaviors);
    sequences.forEach(seq => {
      patterns.push({
        id: uuidv4(),
        userId,
        pattern: `sequence_${seq.sequence.join('_')}`,
        frequency: seq.count,
        lastDetected: Date.now(),
        metadata: { sequence: seq.sequence }
      });
    });
    
    // Save detected patterns
    const firebase = getFirebaseInstance();
    if (firebase) {
      for (const pattern of patterns) {
        await firebase.saveBehaviorPattern(userId, pattern);
      }
    }
    
    return patterns;
  } catch (error) {
    console.error('Error detecting behavior patterns:', error);
    return [];
  }
}

/**
 * Detect common action sequences in user behavior
 */
function detectActionSequences(behaviors: any[]): Array<{sequence: string[], count: number}> {
  // Sequences to detect
  const sequences = [
    { sequence: ['view_dashboard', 'view_portfolio', 'view_trade'], count: 0 },
    { sequence: ['view_dashboard', 'view_news', 'view_portfolio'], count: 0 },
    { sequence: ['view_portfolio', 'view_asset_details', 'add_to_watchlist'], count: 0 },
    { sequence: ['search_asset', 'view_asset_details', 'view_trade'], count: 0 },
    { sequence: ['view_education', 'start_course', 'complete_lesson'], count: 0 }
  ];
  
  // Check for each sequence in the behavior history
  sequences.forEach(seq => {
    for (let i = 0; i <= behaviors.length - seq.sequence.length; i++) {
      let match = true;
      
      for (let j = 0; j < seq.sequence.length; j++) {
        if (behaviors[i + j]?.action !== seq.sequence[j]) {
          match = false;
          break;
        }
      }
      
      if (match) {
        seq.count++;
      }
    }
  });
  
  // Return only sequences that occurred at least once
  return sequences.filter(seq => seq.count > 0);
}

/**
 * Update user interface preferences based on behavior
 */
export async function updateInterfacePreferences(
  userId: string,
  patterns: BehaviorPattern[]
): Promise<void> {
  try {
    const firebase = getFirebaseInstance();
    if (!firebase) return;
    
    const preferences: UserPreference[] = [];
    
    // Convert patterns to preferences
    patterns.forEach(pattern => {
      // Preferred tab
      if (pattern.pattern.startsWith('preferred_tab_')) {
        const tab = pattern.metadata?.tab;
        if (tab) {
          preferences.push({
            id: uuidv4(),
            userId,
            category: 'default_tab',
            value: tab,
            confidence: Math.min(0.9, pattern.frequency / 10),
            lastUpdated: Date.now()
          });
        }
      }
      
      // Active hours
      if (pattern.pattern.startsWith('active_hour_')) {
        const hour = pattern.metadata?.hour;
        if (hour !== undefined) {
          preferences.push({
            id: uuidv4(),
            userId,
            category: 'active_hours',
            value: hour,
            confidence: Math.min(0.9, pattern.frequency / 10),
            lastUpdated: Date.now()
          });
        }
      }
      
      // Sequence preferences
      if (pattern.pattern.startsWith('sequence_')) {
        const sequence = pattern.metadata?.sequence;
        if (sequence && sequence.includes('view_trade')) {
          preferences.push({
            id: uuidv4(),
            userId,
            category: 'trading_frequency',
            value: 'active',
            confidence: Math.min(0.8, pattern.frequency / 5),
            lastUpdated: Date.now()
          });
        }
      }
    });
    
    // Save preferences
    for (const preference of preferences) {
      await firebase.saveUserPreference(userId, preference);
    }
  } catch (error) {
    console.error('Error updating interface preferences:', error);
  }
}

/**
 * Initialize Phase 4 automation for a user
 */
export async function initializePhase4Automation(userId: string): Promise<boolean> {
  try {
    const firebase = getFirebaseInstance();
    if (!firebase) return false;
    
    // Log initialization
    await firebase.logSystemEvent('phase4_automation_initialized', {
      userId,
      timestamp: Date.now(),
      version: '1.0.0'
    });
    
    // Get device info
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      deviceId: await getOrCreateDeviceId(),
      isDesktop: !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    };
    
    // Initialize session context
    const sessionId = uuidv4();
    const sessionContext: SessionContext = {
      id: sessionId,
      userId,
      startTime: Date.now(),
      lastActive: Date.now(),
      device: deviceInfo.deviceId,
      browser: getBrowserName(),
      behaviors: []
    };
    
    // Save session context
    await firebase.saveSessionContext(userId, sessionContext);
    
    // Set initialization flag in local storage
    localStorage.setItem('phase4_initialized', 'true');
    localStorage.setItem('current_session_id', sessionId);
    
    return true;
  } catch (error) {
    console.error('Error initializing Phase 4 automation:', error);
    return false;
  }
}

/**
 * Get or create a unique device ID
 */
async function getOrCreateDeviceId(): Promise<string> {
  let deviceId = localStorage.getItem('device_id');
  
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem('device_id', deviceId);
  }
  
  return deviceId;
}

/**
 * Get browser name from user agent
 */
function getBrowserName(): string {
  const userAgent = navigator.userAgent;
  
  if (userAgent.indexOf('Firefox') > -1) {
    return 'Firefox';
  } else if (userAgent.indexOf('SamsungBrowser') > -1) {
    return 'Samsung Browser';
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    return 'Opera';
  } else if (userAgent.indexOf('Trident') > -1) {
    return 'Internet Explorer';
  } else if (userAgent.indexOf('Edge') > -1) {
    return 'Edge';
  } else if (userAgent.indexOf('Chrome') > -1) {
    return 'Chrome';
  } else if (userAgent.indexOf('Safari') > -1) {
    return 'Safari';
  } else {
    return 'Unknown';
  }
}

/**
 * Reset Phase 4 automation for testing
 */
export function resetPhase4Automation(): void {
  localStorage.removeItem('phase4_initialized');
  localStorage.removeItem('current_session_id');
  localStorage.removeItem('device_id');
}