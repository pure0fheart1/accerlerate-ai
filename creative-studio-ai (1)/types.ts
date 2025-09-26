

export interface ImagePrompt {
  id: string;
  prompt: string;
}

export interface Settings {
  font: string;
  textSize: 'sm' | 'base' | 'lg';
}

export type GeneratedContentType = 'image' | 'video';

export interface GeneratedContent {
  id: string;
  type: GeneratedContentType;
  prompt: string;
  url: string; 
  createdAt: Date;
}

export type Module = 'whiteboard' | 'prompts' | 'image' | 'video' | 'gallery' | 'editor' | 'settings' | 'notes' | 'geminiChat' | 'wiki' | 'aiNotes' | 'photobooth';

export interface Shortcuts {
  [action: string]: string;
}

export interface SavedNote {
  id: string;
  title: string;
  content: string;
  destination: 'wiki' | 'aiNotes';
  createdAt: string; // ISO string format for easy storage
}

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  plan: SubscriptionPlan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: PlanFeatures;
}

export interface PlanFeatures {
  imageGenerations: number; // -1 for unlimited
  videoGenerations: number; // -1 for unlimited
  aiChatMessages: number; // -1 for unlimited
  storageGB: number; // -1 for unlimited
  prioritySupport: boolean;
  advancedFeatures: boolean;
}

export interface UsageStats {
  userId: string;
  period: string; // YYYY-MM format
  imageGenerations: number;
  videoGenerations: number;
  aiChatMessages: number;
  storageUsedMB: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}