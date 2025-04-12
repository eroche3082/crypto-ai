import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import PortfolioAnalysisFlow from './flows/PortfolioAnalysisFlow';
import EducationFlow from './flows/EducationFlow';
import NewsFlow from './flows/NewsFlow';
import LocationsFlow from './flows/LocationsFlow';
import TaxSimulatorFlow from './flows/TaxSimulatorFlow';
import WalletMessagingFlow from './flows/WalletMessagingFlow';

/**
 * The ChatbotFlowProvider determines which flow component to render
 * based on the current tab the user is viewing
 */
export const ChatbotFlowProvider: React.FC = () => {
  const [location] = useLocation();
  const [currentTab, setCurrentTab] = useState<string>('');
  
  // Extract the current tab from the URL
  useEffect(() => {
    const pathSegments = location.split('/').filter(Boolean);
    const tab = pathSegments.length > 0 ? pathSegments[0] : 'dashboard';
    setCurrentTab(tab.toLowerCase());
    
    // Save the current tab to context memory
    localStorage.setItem('current_tab', tab.toLowerCase());
    
    // Log for debugging
    console.log('Current tab:', tab.toLowerCase());
  }, [location]);
  
  // Render different flow components based on the current tab
  const renderFlowComponent = () => {
    switch (currentTab) {
      case 'portfolioanalysis':
      case 'portfolio-analysis':
        return <PortfolioAnalysisFlow />;
      
      case 'education':
        return <EducationFlow />;
      
      case 'news':
        return <NewsFlow />;
      
      case 'locations':
        return <LocationsFlow />;
      
      case 'tax':
      case 'taxsimulator':
      case 'tax-simulator':
        return <TaxSimulatorFlow />;
      
      case 'walletmessaging':
      case 'wallet-messaging':
      case 'messages':
        return <WalletMessagingFlow />;
      
      default:
        // No specific flow component for this tab
        return null;
    }
  };
  
  // If there's no specific flow component for the current tab, return null
  if (!renderFlowComponent()) {
    return null;
  }
  
  return (
    <div className="mb-4">
      {renderFlowComponent()}
    </div>
  );
};

export default ChatbotFlowProvider;