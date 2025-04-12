import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTabContext } from './TabContextProvider';
import { addMessageToContext, getRecentMessages } from '@/utils/chatContextManager';

// Define the interface for chat flow
interface ChatFlow {
  flowId: string;
  name: string;
  description: string;
  triggers: string[];
  actions: {
    id: string;
    name: string;
    execute: (params?: any) => Promise<any>;
  }[];
}

// Define the interface for the chat flow registry
interface ChatFlowRegistry {
  [tabName: string]: ChatFlow[];
}

// Define the chat flow context
interface ChatFlowContextType {
  currentFlow: ChatFlow | null;
  availableFlows: ChatFlow[];
  triggerFlow: (flowId: string, params?: any) => Promise<any>;
  executeAction: (actionId: string, params?: any) => Promise<any>;
  addMessage: (role: string, content: string) => void;
  recentMessages: Array<{ role: string, content: string, timestamp: string }>;
}

// Create the context
const ChatFlowContext = createContext<ChatFlowContextType>({
  currentFlow: null,
  availableFlows: [],
  triggerFlow: async () => null,
  executeAction: async () => null,
  addMessage: () => {},
  recentMessages: []
});

// Define chat flows for each tab
const chatFlowRegistry: ChatFlowRegistry = {
  dashboard: [
    {
      flowId: 'dashboard_overview',
      name: 'Dashboard Overview',
      description: 'Provides an overview of the dashboard and available features',
      triggers: ['overview', 'help', 'guide'],
      actions: [
        {
          id: 'show_overview',
          name: 'Show Dashboard Overview',
          execute: async () => {
            console.log('Executing show_overview action');
            // This would update UI or provide information about the dashboard
            return {
              success: true,
              message: 'Dashboard overview displayed'
            };
          }
        }
      ]
    },
    {
      flowId: 'market_summary',
      name: 'Market Summary',
      description: 'Provides a summary of current market conditions',
      triggers: ['market', 'summary', 'overview'],
      actions: [
        {
          id: 'show_market_summary',
          name: 'Show Market Summary',
          execute: async () => {
            console.log('Executing show_market_summary action');
            // This would fetch and display market data
            return {
              success: true,
              message: 'Market summary displayed'
            };
          }
        }
      ]
    }
  ],
  portfolio: [
    {
      flowId: 'portfolio_analysis',
      name: 'Portfolio Analysis',
      description: 'Analyzes portfolio performance and provides insights',
      triggers: ['analyze', 'performance', 'insights'],
      actions: [
        {
          id: 'analyze_portfolio',
          name: 'Analyze Portfolio',
          execute: async () => {
            console.log('Executing analyze_portfolio action');
            // This would analyze portfolio data
            return {
              success: true,
              message: 'Portfolio analysis completed'
            };
          }
        },
        {
          id: 'show_portfolio_metrics',
          name: 'Show Portfolio Metrics',
          execute: async () => {
            console.log('Executing show_portfolio_metrics action');
            // This would display portfolio metrics
            return {
              success: true,
              message: 'Portfolio metrics displayed'
            };
          }
        }
      ]
    },
    {
      flowId: 'portfolio_rebalance',
      name: 'Portfolio Rebalance',
      description: 'Suggests portfolio rebalancing options',
      triggers: ['rebalance', 'adjust', 'optimize'],
      actions: [
        {
          id: 'suggest_rebalance',
          name: 'Suggest Rebalance',
          execute: async () => {
            console.log('Executing suggest_rebalance action');
            // This would suggest portfolio rebalancing options
            return {
              success: true,
              message: 'Rebalancing suggestions displayed'
            };
          }
        }
      ]
    }
  ],
  wallet: [
    {
      flowId: 'wallet_overview',
      name: 'Wallet Overview',
      description: 'Provides an overview of wallet balances and transactions',
      triggers: ['balance', 'transactions', 'overview'],
      actions: [
        {
          id: 'show_balances',
          name: 'Show Wallet Balances',
          execute: async () => {
            console.log('Executing show_balances action');
            // This would display wallet balances
            return {
              success: true,
              message: 'Wallet balances displayed'
            };
          }
        },
        {
          id: 'show_transactions',
          name: 'Show Recent Transactions',
          execute: async () => {
            console.log('Executing show_transactions action');
            // This would display recent transactions
            return {
              success: true,
              message: 'Recent transactions displayed'
            };
          }
        }
      ]
    }
  ],
  analytics: [
    {
      flowId: 'market_analysis',
      name: 'Market Analysis',
      description: 'Provides detailed market analysis',
      triggers: ['analysis', 'trends', 'patterns'],
      actions: [
        {
          id: 'show_market_analysis',
          name: 'Show Market Analysis',
          execute: async () => {
            console.log('Executing show_market_analysis action');
            // This would display market analysis
            return {
              success: true,
              message: 'Market analysis displayed'
            };
          }
        }
      ]
    }
  ],
  alerts: [
    {
      flowId: 'create_alert',
      name: 'Create Alert',
      description: 'Helps create a new price or event alert',
      triggers: ['create', 'new', 'add'],
      actions: [
        {
          id: 'show_alert_form',
          name: 'Show Alert Form',
          execute: async () => {
            console.log('Executing show_alert_form action');
            // This would display the alert creation form
            return {
              success: true,
              message: 'Alert form displayed'
            };
          }
        }
      ]
    },
    {
      flowId: 'manage_alerts',
      name: 'Manage Alerts',
      description: 'Helps manage existing alerts',
      triggers: ['manage', 'edit', 'update'],
      actions: [
        {
          id: 'show_alert_list',
          name: 'Show Alert List',
          execute: async () => {
            console.log('Executing show_alert_list action');
            // This would display the list of alerts
            return {
              success: true,
              message: 'Alert list displayed'
            };
          }
        }
      ]
    }
  ],
  news: [
    {
      flowId: 'news_filter',
      name: 'News Filter',
      description: 'Helps filter news by topic or asset',
      triggers: ['filter', 'find', 'search'],
      actions: [
        {
          id: 'filter_news',
          name: 'Filter News',
          execute: async (params) => {
            console.log('Executing filter_news action', params);
            // This would filter news by the specified parameters
            return {
              success: true,
              message: 'News filtered'
            };
          }
        }
      ]
    },
    {
      flowId: 'news_summary',
      name: 'News Summary',
      description: 'Provides a summary of recent news',
      triggers: ['summary', 'recap', 'overview'],
      actions: [
        {
          id: 'show_news_summary',
          name: 'Show News Summary',
          execute: async () => {
            console.log('Executing show_news_summary action');
            // This would display a summary of recent news
            return {
              success: true,
              message: 'News summary displayed'
            };
          }
        }
      ]
    }
  ],
  locations: [
    {
      flowId: 'location_search',
      name: 'Location Search',
      description: 'Helps search for crypto-friendly locations',
      triggers: ['search', 'find', 'locate'],
      actions: [
        {
          id: 'search_locations',
          name: 'Search Locations',
          execute: async (params) => {
            console.log('Executing search_locations action', params);
            // This would search for locations based on parameters
            return {
              success: true,
              message: 'Location search results displayed'
            };
          }
        }
      ]
    }
  ],
  converter: [
    {
      flowId: 'convert_currency',
      name: 'Convert Currency',
      description: 'Helps convert between different currencies',
      triggers: ['convert', 'exchange', 'calculate'],
      actions: [
        {
          id: 'perform_conversion',
          name: 'Perform Conversion',
          execute: async (params) => {
            console.log('Executing perform_conversion action', params);
            // This would perform the currency conversion
            return {
              success: true,
              message: 'Conversion completed'
            };
          }
        }
      ]
    }
  ],
  settings: [
    {
      flowId: 'update_settings',
      name: 'Update Settings',
      description: 'Helps update user settings',
      triggers: ['update', 'change', 'modify'],
      actions: [
        {
          id: 'show_settings_form',
          name: 'Show Settings Form',
          execute: async () => {
            console.log('Executing show_settings_form action');
            // This would display the settings form
            return {
              success: true,
              message: 'Settings form displayed'
            };
          }
        }
      ]
    }
  ],
  education: [
    {
      flowId: 'learn_topic',
      name: 'Learn Topic',
      description: 'Provides educational content on a specific topic',
      triggers: ['learn', 'explain', 'teach'],
      actions: [
        {
          id: 'show_topic_content',
          name: 'Show Topic Content',
          execute: async (params) => {
            console.log('Executing show_topic_content action', params);
            // This would display educational content
            return {
              success: true,
              message: 'Educational content displayed'
            };
          }
        }
      ]
    },
    {
      flowId: 'take_quiz',
      name: 'Take Quiz',
      description: 'Provides a quiz on a crypto topic',
      triggers: ['quiz', 'test', 'challenge'],
      actions: [
        {
          id: 'show_quiz',
          name: 'Show Quiz',
          execute: async (params) => {
            console.log('Executing show_quiz action', params);
            // This would display a quiz
            return {
              success: true,
              message: 'Quiz displayed'
            };
          }
        }
      ]
    }
  ],
  tax: [
    {
      flowId: 'calculate_tax',
      name: 'Calculate Tax',
      description: 'Helps calculate crypto taxes',
      triggers: ['calculate', 'estimate', 'determine'],
      actions: [
        {
          id: 'perform_tax_calculation',
          name: 'Perform Tax Calculation',
          execute: async (params) => {
            console.log('Executing perform_tax_calculation action', params);
            // This would perform a tax calculation
            return {
              success: true,
              message: 'Tax calculation completed'
            };
          }
        }
      ]
    }
  ],
  messages: [
    {
      flowId: 'send_message',
      name: 'Send Message',
      description: 'Helps send a message to another wallet',
      triggers: ['send', 'compose', 'write'],
      actions: [
        {
          id: 'show_message_form',
          name: 'Show Message Form',
          execute: async () => {
            console.log('Executing show_message_form action');
            // This would display the message form
            return {
              success: true,
              message: 'Message form displayed'
            };
          }
        }
      ]
    },
    {
      flowId: 'view_messages',
      name: 'View Messages',
      description: 'Helps view received messages',
      triggers: ['view', 'read', 'inbox'],
      actions: [
        {
          id: 'show_messages',
          name: 'Show Messages',
          execute: async () => {
            console.log('Executing show_messages action');
            // This would display received messages
            return {
              success: true,
              message: 'Messages displayed'
            };
          }
        }
      ]
    }
  ],
  admin: [
    {
      flowId: 'view_metrics',
      name: 'View Metrics',
      description: 'Provides admin metrics and analytics',
      triggers: ['metrics', 'analytics', 'stats'],
      actions: [
        {
          id: 'show_admin_metrics',
          name: 'Show Admin Metrics',
          execute: async () => {
            console.log('Executing show_admin_metrics action');
            // This would display admin metrics
            return {
              success: true,
              message: 'Admin metrics displayed'
            };
          }
        }
      ]
    }
  ]
};

interface ChatbotFlowProviderProps {
  children: React.ReactNode;
}

export const ChatbotFlowProvider: React.FC<ChatbotFlowProviderProps> = ({ children }) => {
  const { currentTab } = useTabContext();
  const [currentFlow, setCurrentFlow] = useState<ChatFlow | null>(null);
  const [availableFlows, setAvailableFlows] = useState<ChatFlow[]>([]);
  const [recentMessages, setRecentMessages] = useState<Array<{ role: string, content: string, timestamp: string }>>([]);
  
  // Update available flows when the tab changes
  useEffect(() => {
    if (currentTab && chatFlowRegistry[currentTab]) {
      setAvailableFlows(chatFlowRegistry[currentTab]);
    } else {
      setAvailableFlows([]);
    }
    
    // Reset current flow when changing tabs
    setCurrentFlow(null);
    
    // Update recent messages
    setRecentMessages(getRecentMessages());
  }, [currentTab]);
  
  // Function to trigger a flow by ID
  const triggerFlow = async (flowId: string, params?: any): Promise<any> => {
    // Find the flow in the available flows
    const flow = availableFlows.find(f => f.flowId === flowId);
    
    if (!flow) {
      console.error(`Flow not found: ${flowId}`);
      return {
        success: false,
        error: 'Flow not found'
      };
    }
    
    // Set as current flow
    setCurrentFlow(flow);
    
    console.log(`Triggered flow: ${flow.name}`);
    
    // Execute the first action if available
    if (flow.actions.length > 0) {
      return executeAction(flow.actions[0].id, params);
    }
    
    return {
      success: true,
      message: `Flow "${flow.name}" triggered, but no actions found`
    };
  };
  
  // Function to execute a specific action
  const executeAction = async (actionId: string, params?: any): Promise<any> => {
    // If no current flow, check all available flows for the action
    if (!currentFlow) {
      for (const flow of availableFlows) {
        const action = flow.actions.find(a => a.id === actionId);
        
        if (action) {
          // Set as current flow
          setCurrentFlow(flow);
          
          console.log(`Executing action ${action.name} from flow ${flow.name}`);
          return action.execute(params);
        }
      }
      
      console.error(`Action not found: ${actionId}`);
      return {
        success: false,
        error: 'Action not found'
      };
    }
    
    // Find the action in the current flow
    const action = currentFlow.actions.find(a => a.id === actionId);
    
    if (!action) {
      console.error(`Action not found in current flow: ${actionId}`);
      return {
        success: false,
        error: 'Action not found in current flow'
      };
    }
    
    console.log(`Executing action ${action.name} from flow ${currentFlow.name}`);
    return action.execute(params);
  };
  
  // Function to add a message to the context
  const addMessage = (role: string, content: string) => {
    addMessageToContext(role, content);
    setRecentMessages(getRecentMessages());
  };
  
  return (
    <ChatFlowContext.Provider
      value={{
        currentFlow,
        availableFlows,
        triggerFlow,
        executeAction,
        addMessage,
        recentMessages
      }}
    >
      {children}
    </ChatFlowContext.Provider>
  );
};

// Hook to use the chat flow context
export const useChatFlow = () => useContext(ChatFlowContext);

export default ChatbotFlowProvider;