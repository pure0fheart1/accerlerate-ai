import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, SubscriptionPlan, PlanFeatures } from '../types';
import { authService, profileService, subscriptionService } from '../services/supabase';
import { Session } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

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
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
      toast.error('Application configuration error. Please contact support.');
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const initialSession = await authService.getSession();
        setSession(initialSession);

        if (initialSession?.user) {
          const appUser = await profileService.buildUserObject(initialSession.user);
          setUser(appUser);
        }
      } catch (error) {
        console.error('Failed to get initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      setSession(session);

      if (session?.user) {
        try {
          const appUser = await profileService.buildUserObject(session.user);
          setUser(appUser);
        } catch (error) {
          console.error('Failed to build user object:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        toast.error('Application configuration error. Please contact support.');
        throw new Error('Supabase not configured');
      }

      const { user: supabaseUser, session } = await authService.signIn(email, password);

      if (supabaseUser && session) {
        const appUser = await profileService.buildUserObject(supabaseUser);
        setUser(appUser);
        setSession(session);
        toast.success('Successfully logged in!');
      }
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
      if (!isSupabaseConfigured()) {
        toast.error('Application configuration error. Please contact support.');
        throw new Error('Supabase not configured');
      }

      const { user: supabaseUser, session } = await authService.signUp(email, password, name);

      if (supabaseUser) {
        if (session) {
          // User was automatically signed in (email confirmation disabled)
          const appUser = await profileService.buildUserObject(supabaseUser);
          setUser(appUser);
          setSession(session);
          toast.success(`Welcome ${name}! Account created successfully.`);
        } else {
          // User needs to confirm email
          toast.success(`Welcome ${name}! Please check your email to confirm your account.`);
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Signup failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      // Clear any local storage items
      localStorage.removeItem('usage');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user || !session?.user) return;

    try {
      // Update profile in Supabase
      const profileUpdates: any = {};
      if (updates.name) profileUpdates.name = updates.name;
      if (updates.plan) profileUpdates.plan_id = updates.plan.id;
      if (updates.stripeCustomerId) profileUpdates.stripe_customer_id = updates.stripeCustomerId;
      if (updates.stripeSubscriptionId) profileUpdates.stripe_subscription_id = updates.stripeSubscriptionId;

      if (Object.keys(profileUpdates).length > 0) {
        await profileService.updateProfile(session.user.id, profileUpdates);
      }

      // Update local state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update profile');
    }
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