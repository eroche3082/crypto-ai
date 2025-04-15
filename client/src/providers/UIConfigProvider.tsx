import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Define the UI configuration interfaces
export interface VisibleSections {
  chat: boolean;
  features: boolean;
  pricing: boolean;
  news?: boolean;
  portfolio?: boolean;
  [key: string]: boolean | undefined;
}

export interface UIConfig {
  primary_color: string;
  font_family: string;
  layout: "dark" | "light";
  button_shape: "rounded" | "square" | "pill";
  homepage_title: string;
  homepage_subtitle: string;
  cta_text: string;
  header_menu: string[];
  visible_sections: VisibleSections;
  logo_url?: string;
  background_image_url?: string;
  header_image_url?: string;
}

// Default values to use while loading
const defaultConfig: UIConfig = {
  primary_color: "#6366f1",
  font_family: "Inter",
  layout: "dark",
  button_shape: "rounded",
  homepage_title: "Welcome",
  homepage_subtitle: "Loading...",
  cta_text: "Start",
  header_menu: ["Home"],
  visible_sections: {
    chat: true,
    features: true,
    pricing: true
  }
};

interface UIConfigContextType {
  config: UIConfig;
  isLoading: boolean;
  error: Error | null;
  updateConfig: (newConfig: Partial<UIConfig>) => Promise<void>;
  uploadImage: (imageType: 'logo' | 'background' | 'header', file: File) => Promise<string>;
}

// Create the context
const UIConfigContext = createContext<UIConfigContextType | undefined>(undefined);

interface UIConfigProviderProps {
  children: ReactNode;
  agentName: string;
}

export const UIConfigProvider: React.FC<UIConfigProviderProps> = ({ children, agentName }) => {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<UIConfig>(defaultConfig);
  
  // Fetch the configuration
  const { data, isLoading, error } = useQuery<UIConfig>({
    queryKey: ['/api/config', agentName],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/config/${agentName}`);
      return response.json();
    },
    // Only refetch if window regains focus or network reconnects
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Update config when data changes
  useEffect(() => {
    if (data) {
      setConfig(data);
      // Apply CSS variables for theming
      applyTheme(data);
    }
  }, [data]);
  
  // Function to apply theme CSS variables
  const applyTheme = (config: UIConfig) => {
    const root = document.documentElement;
    
    // Set CSS variables
    root.style.setProperty('--primary-color', config.primary_color);
    root.style.setProperty('--font-family', config.font_family);
    
    // Apply button shape class
    document.body.classList.remove('button-rounded', 'button-square', 'button-pill');
    document.body.classList.add(`button-${config.button_shape}`);
    
    // Apply layout theme
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${config.layout}`);
  };
  
  // Function to update the configuration
  const updateConfig = async (newConfig: Partial<UIConfig>): Promise<void> => {
    try {
      const response = await apiRequest('PUT', `/api/config/${agentName}`, newConfig);
      const result = await response.json();
      
      if (result.success) {
        // Invalidate the query to trigger a refetch
        queryClient.invalidateQueries({ queryKey: ['/api/config', agentName] });
      } else {
        throw new Error(result.error || 'Failed to update configuration');
      }
    } catch (error) {
      console.error('Error updating configuration:', error);
      throw error;
    }
  };
  
  // Function to upload an image
  const uploadImage = async (imageType: 'logo' | 'background' | 'header', file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`/api/config/upload/${agentName}/${imageType}`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Invalidate the query to trigger a refetch
        queryClient.invalidateQueries({ queryKey: ['/api/config', agentName] });
        return result.url;
      } else {
        throw new Error(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };
  
  return (
    <UIConfigContext.Provider value={{ 
      config, 
      isLoading, 
      error: error as Error | null, 
      updateConfig,
      uploadImage
    }}>
      {children}
    </UIConfigContext.Provider>
  );
};

// Hook to use the UI configuration
export const useUIConfig = () => {
  const context = useContext(UIConfigContext);
  if (context === undefined) {
    throw new Error('useUIConfig must be used within a UIConfigProvider');
  }
  return context;
};

// HOC to wrap components that need the configuration
export const withUIConfig = <P extends object>(
  Component: React.ComponentType<P & { uiConfig: UIConfigContextType }>
) => {
  return (props: P) => {
    const uiConfig = useUIConfig();
    return <Component {...props} uiConfig={uiConfig} />;
  };
};