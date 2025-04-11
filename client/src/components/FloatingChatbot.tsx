import React from 'react';
import { AdvancedChatProvider } from "../contexts/AdvancedChatContext";
import AdvancedChatbot from "./AdvancedChatbot";

interface FloatingChatbotProps {
  defaultOpen?: boolean;
}

const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ defaultOpen = false }) => {
  return (
    <AdvancedChatProvider>
      <AdvancedChatbot />
    </AdvancedChatProvider>
  );
};

export default FloatingChatbot;