import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current viewport is mobile-sized
 * @param breakpoint The width in pixels below which is considered mobile (default: 768)
 * @returns Boolean indicating if the viewport is mobile-sized
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  // Initialize with a default value (mobile detection) during server-side rendering
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Set the initial value
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    // Check immediately on mount
    checkMobile();
    
    // Set up listener for window resize events
    window.addEventListener('resize', checkMobile);
    
    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [breakpoint]);

  return isMobile;
}