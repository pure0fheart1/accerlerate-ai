import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, SubscriptionPlan, PlanFeatures } from '../types';
import { apiClient } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'usd',
    interval: 'month',
    features: {
      imageGenerations: 5,
      videoGenerations: 1,
      aiChatMessages: 10,
      storageGB: 1,
      prioritySupport: false,
      advancedFeatures: false,
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    currency: 'usd',
    interval: 'month',
    features: {
      imageGenerations: 100,
      videoGenerations: 20,
      aiChatMessages: 500,
      storageGB: 10,
      prioritySupport: true,
      advancedFeatures: true,
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 49.99,
    currency: 'usd',
    interval: 'month',
    features: {
      imageGenerations: -1, // unlimited
      videoGenerations: -1, // unlimited
      aiChatMessages: -1, // unlimited
      storageGB: 100,
      prioritySupport: true,
      advancedFeatures: true,
    }
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and validate with server
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        apiClient.setToken(token);
        const response = await apiClient.getCurrentUser();
        setUser(response.user);
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid token
        apiClient.setToken(null);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await apiClient.login(email, password);

      // Set token and user
      apiClient.setToken(response.token);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));

      toast.success('Successfully logged in!');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await apiClient.signup(email, password, name);

      // Set token and user
      apiClient.setToken(response.token);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));

      toast.success(`Welcome ${name}! Account created successfully.`);
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Signup failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    apiClient.setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('usage');
    toast.success('Logged out successfully');
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};