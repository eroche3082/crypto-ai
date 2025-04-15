import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { apiRequest } from './queryClient';

interface AuthUser {
  id: number;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

// Create context
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null
});

// Create provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For demo purposes, we'll create a mock user
    // In a real app, this would be connected to Firebase auth
    const mockUser: AuthUser = {
      id: 1,
      uid: 'mock-uid-123',
      email: 'demo@socialbrands.ai',
      displayName: 'Demo User',
      photoURL: undefined
    };

    // Set a timeout to simulate loading
    const timer = setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

// Create hook
export function useAuth() {
  return useContext(AuthContext);
}