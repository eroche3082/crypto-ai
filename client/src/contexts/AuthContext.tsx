import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email?: string;
  role?: string;
  plan?: 'basic' | 'pro' | 'enterprise' | 'free';
  avatar?: string;
  accessCode?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  loginWithAccessCode: (accessCode: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to fetch user from session
        const storedUser = localStorage.getItem('cryptobot_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login function with username/password
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For demo purposes, we're using mock authentication
      // In production, this would make a request to your backend
      
      // Check if using demo credentials (for ease of testing)
      if (username === 'admin' && password === 'admin123456') {
        const user: User = {
          id: 1,
          username: 'admin',
          email: 'admin@socialbrands.ai',
          role: 'admin',
          plan: 'enterprise',
          avatar: '/assets/avatar.png',
          accessCode: 'CRYPTO-VIP-2025'
        };
        
        // Store user in localStorage for persistence
        localStorage.setItem('cryptobot_user', JSON.stringify(user));
        setUser(user);
        return true;
      }
      
      // Add a simulated request for other users
      const response = await new Promise<{success: boolean, user?: User, message?: string}>((resolve) => {
        // Simulate API latency
        setTimeout(() => {
          if (username === 'demo' && password === 'demo123456') {
            resolve({
              success: true,
              user: {
                id: 2,
                username: 'demo',
                email: 'demo@cryptobot.ai',
                role: 'user',
                plan: 'basic',
                accessCode: 'CRYPTO-STD-1234'
              }
            });
          } else {
            resolve({
              success: false,
              message: 'Invalid username or password'
            });
          }
        }, 800);
      });
      
      if (response.success && response.user) {
        localStorage.setItem('cryptobot_user', JSON.stringify(response.user));
        setUser(response.user);
        return true;
      } else {
        setError(response.message || 'Login failed');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Login with access code
  const loginWithAccessCode = async (accessCode: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would validate the access code with the server
      const response = await new Promise<{success: boolean, user?: User, message?: string}>((resolve) => {
        // Simulate API latency
        setTimeout(() => {
          if (accessCode === 'CRYPTO-VIP-2025' || accessCode === 'CRYPTO-STD-1234') {
            const user: User = {
              id: accessCode === 'CRYPTO-VIP-2025' ? 1 : 2,
              username: accessCode === 'CRYPTO-VIP-2025' ? 'admin' : 'demo',
              email: accessCode === 'CRYPTO-VIP-2025' ? 'admin@cryptobot.ai' : 'demo@cryptobot.ai',
              role: accessCode === 'CRYPTO-VIP-2025' ? 'admin' : 'user',
              plan: accessCode === 'CRYPTO-VIP-2025' ? 'enterprise' : 'basic',
              accessCode: accessCode
            };
            
            resolve({
              success: true,
              user
            });
          } else {
            resolve({
              success: false,
              message: 'Invalid access code'
            });
          }
        }, 800);
      });
      
      if (response.success && response.user) {
        localStorage.setItem('cryptobot_user', JSON.stringify(response.user));
        setUser(response.user);
        return true;
      } else {
        setError(response.message || 'Access code validation failed');
        return false;
      }
    } catch (err) {
      console.error('Access code login error:', err);
      setError('An error occurred while validating your access code. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('cryptobot_user');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithAccessCode,
    logout,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}