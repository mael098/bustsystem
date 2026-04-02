import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { User, Driver, Parent } from '@/types';
import { mockDriver, mockParents, mockCredentials } from '@/data/mock-data';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: 'driver' | 'parent') => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Check driver credentials
      if (email === mockCredentials.driver.email && password === mockCredentials.driver.password) {
        setUser(mockDriver);
        setIsLoading(false);
        return { success: true };
      }
      
      // Check parent credentials
      if (email === mockCredentials.parent.email && password === mockCredentials.parent.password) {
        setUser(mockParents[0]);
        setIsLoading(false);
        return { success: true };
      }
      
      // Check other parent emails (same password for demo)
      const parent = mockParents.find(p => p.email === email);
      if (parent && password === 'parent123') {
        setUser(parent);
        setIsLoading(false);
        return { success: true };
      }
      
      setIsLoading(false);
      return { success: false, error: 'Invalid email or password' };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'An error occurred during login' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const register = useCallback(async (
    name: string, 
    email: string, 
    password: string, 
    role: 'driver' | 'parent'
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // In a real app, this would create a new user in the database
      // For this demo, we'll create a mock user
      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        role,
        phone: '',
      };
      
      if (role === 'driver') {
        const driverUser: Driver = {
          ...newUser,
          role: 'driver',
          vehicleInfo: {
            model: 'Not specified',
            plateNumber: 'Not specified',
            capacity: 0,
          },
          isOnRoute: false,
        };
        setUser(driverUser);
      } else {
        const parentUser: Parent = {
          ...newUser,
          role: 'parent',
          childrenIds: [],
        };
        setUser(parentUser);
      }
      
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'An error occurred during registration' };
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      register,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
