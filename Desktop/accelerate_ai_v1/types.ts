
export interface GeneratedContent {
  image: string | null;
  text: string | null;
}

export interface VideoIdea {
    title: string;
    concept: string;
    visuals: string;
    hook: string;
}

export interface Task {
    id: string;
    taskName: string;
    description: string;
    completed: boolean;
    priority: 'High' | 'Medium' | 'Low';
    dueDate: string | null;
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

export interface WikiPage {
    id: string;
    title: string;
    content: string;
    createdAt: number;
}

// Newly added types for all implemented pages

export interface Recipe {
    title: string;
    description: string;
    prepTime: string;
    cookTime: string;
    servings: string;
    ingredients: string[];
    instructions: string[];
}

export interface FitnessPlan {
    title: string;
    goal: string;
    duration: string;
    frequency: string;
    schedule: {
        day: string;
        workout: string;
        focus: string;
    }[];
}

export interface TravelItinerary {
    destination: string;
    duration: string;
    budget: string;
    dailyPlan: {
        day: number;
        title: string;
        activities: string[];
        diningSuggestions: string[];
    }[];
}

export interface Resume {
    summary: string;
    experiences: {
        company: string;
        role: string;
        date: string;
        points: string[];
    }[];
    education: {
        institution: string;
        degree: string;
        date: string;
    }[];
    skills: string[];
}

export interface CharacterProfile {
    name: string;
    age: number;
    appearance: string;
    personality: string;
    backstory: string;
}

export interface DomainSuggestion {
    name: string;
    available: boolean;
    reason: string;
}

export interface InvestmentSummary {
    ticker: string;
    companyName: string;
    summary: string;
    keyPoints: string[];
    sentiment: 'Positive' | 'Negative' | 'Neutral';
}

export interface LegalSummary {
    documentType: string;
    keyClauses: {
        clause: string;
        summary: string;
        potentialRisk: 'High' | 'Medium' | 'Low' | 'None';
    }[];
    overallSummary: string;
}

export interface DebateTopic {
    topic: string;
    pro: string[];
    con: string[];
}

export interface GiftIdea {
    idea: string;
    reason: string;
    estimatedCost: string;
}

export interface DreamInterpretation {
    dream: string;
    themes: string[];
    interpretation: string;
}

export interface BusinessPlanSection {
    title: string;
    content: string[];
}

export interface ColorPalette {
    name: string;
    hexCodes: string[];
}

export interface MindMapNode {
    id: string;
    text: string;
    children?: MindMapNode[];
}

export interface SwotAnalysis {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
}

export interface BudgetPlan {
    income: number;
    categories: {
        name: string;
        allocated: number;
        spent: number;
    }[];
}

export interface StudyGuide {
    topic: string;
    keyConcepts: {
        concept: string;
        explanation: string;
    }[];
    practiceQuestions: string[];
}

export interface ItineraryOptimization {
    optimizedPlan: {
        day: number;
        activities: string[];
    }[];
    suggestions: string[];
}

export interface PitchDeckSlide {
    slideNumber: number;
    title: string;
    content: string[];
}

export interface GoToMarketStrategy {
    targetAudience: string;
    valueProposition: string;
    channels: string[];
    marketingInitiatives: string[];
    successMetrics: string[];
}

export interface MealPlan {
    planTitle: string;
    dailyPlan: {
        day: number;
        breakfast: string;
        lunch: string;
        dinner: string;
    }[];
}

export interface NegotiationScript {
    situation: string;
    goal: string;
    phases: {
        phase: string;
        talkingPoints: string[];
        strategy: string;
    }[];
}

export interface CustomerPersona {
    name: string;
    age: number;
    jobTitle: string;
    goals: string[];
    painPoints: string[];
    bio: string;
}

export interface EventPlan {
    eventName: string;
    theme: string;
    timeline: {
        timeframe: string;
        task: string;
    }[];
    checklist: string[];
}

export interface Okr {
    objective: string;
    keyResults: {
        result: string;
        metric: string;
    }[];
}

export interface GddSection {
    title: string;
    points: string[];
}

export interface CocktailRecipe {
    name: string;
    ingredients: string[];
    instructions: string[];
    garnish: string;
}

export interface BoardGameIdea {
    title: string;
    playerCount: string;
    theme: string;
    mechanics: string[];
    shortDescription: string;
}

export interface TriviaQuestion {
    question: string;
    answer: string;
}

export interface DeclutterTask {
    area: string;
    steps: string[];
}

export interface UserStory {
    userType: string;
    goal: string;
    reason: string;
    acceptanceCriteria: string[];
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
}

export interface DietaryRecipe {
    title: string;
    description: string;
    dietaryMatch: string[];
    ingredients: string[];
    instructions: string[];
}

export interface LibraryPrompt {
  id: number;
  prompt: string;
  category: 'Characters' | 'Landscapes' | 'Sci-Fi' | 'Fantasy' | 'Abstract' | 'Animals' | 'Architecture' | 'Custom' | 'Polished';
  style: string;
  imageUrl: string;
}

// User Profile and Tier System Types
export type UserTier = 'Free' | 'Member' | 'VIP' | 'God-Tier';

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  profilePicture?: string;
  tier: UserTier;
  smechals: number;
  trialExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TierBenefits {
  tier: UserTier;
  name: string;
  price?: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  features: string[];
  smechalsIncluded: number;
  toolRequestsIncluded: number;
  prioritySupport: boolean;
  customization: boolean;
  apiAccess: boolean;
}

export interface UsageData {
  userId: string;
  totalToolsUsed: number;
  toolsUsedToday: number;
  toolsUsedThisMonth: number;
  favoriteTools: string[];
  timeSpent: number; // in minutes
  lastActive: Date;
  sessionsCount: number;
}

export interface SmechalsTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'spent' | 'bonus' | 'trial';
  description: string;
  relatedAction?: string;
  createdAt: Date;
}

export interface ToolRequest {
  id: string;
  userId: string;
  toolName: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_development' | 'completed' | 'rejected';
  costInSmechals: number;
  requestedAt: Date;
  completedAt?: Date;
  creditToUser: boolean;
}