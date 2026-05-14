// Enums matching backend
export enum DietType {
  None = 'None',
  Vegetarian = 'Vegetarian',
  Vegan = 'Vegan',
  GlutenFree = 'GlutenFree',
  DairyFree = 'DairyFree',
  Keto = 'Keto',
  Paleo = 'Paleo',
  Mediterranean = 'Mediterranean',
}

export enum BudgetLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export enum UnitSystem {
  Metric = 'Metric',
  Imperial = 'Imperial',
}

export enum SourceType {
  Manual = 'Manual',
  AI = 'AI',
  Database = 'Database',
}

export enum MealType {
  Breakfast = 'Breakfast',
  Lunch = 'Lunch',
  Dinner = 'Dinner',
  Snack = 'Snack',
}

// Auth Types
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: number;
  fullName: string;
  email: string;
  token: string;
  hasCompletedProfile: boolean;
}

// Profile Types
export interface ProfileRequest {
  age: number;
  height: number; // in cm
  weight: number; // in kg
  targetWeight: number; // in kg
  gender?: string;
  goalType: string; // "Lose", "Maintain", "Gain"
  activityLevel: string; // "Sedentary", "Light", etc.
  dailyCalorieTarget?: number; // Optional - will be calculated automatically
}

export interface ProfileResponse {
  age: number;
  height: number;
  weight: number;
  targetWeight: number;
  gender?: string;
  goalType: string;
  activityLevel: string;
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbsTarget: number;
  dailyFatsTarget: number;
  createdAt: string;
  updatedAt?: string;
}

// Meal Log Types
export interface MealLogRequest {
  mealId: number | null;
  mealName?: string;
  date: string; // ISO date string
  time: string; // HH:mm format
  loggedCalories: number;
  isFromAI: boolean;
  loggedProtein?: number;
  loggedCarbs?: number;
  loggedFats?: number;
  portionMultiplier?: number;
}

export interface MealLogResponse {
  mealLogId: number;
  mealName?: string;
  mealId: number;
  date: string;
  time: string;
  loggedCalories: number;
  isFromAI: boolean;
  loggedProtein?: number;
  loggedCarbs?: number;
  loggedFats?: number;
  portionMultiplier?: number;
  createdAt: string;
}

// Meal Plan Types
export interface MealDto {
  mealId: number;
  name: string;
  source: SourceType;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  portionSize: number;
}

export interface MealPlanItemDto {
  mealPlanItemId: number;
  mealType: string; // "Breakfast", "Lunch", etc.
  meal: MealDto;
  portionMultiplier: number;
  optionNumber: number; // 1, 2, or 3 to group meals into options
}

export interface MealPlanResponse {
  mealPlanId: number;
  date: string;
  totalCalories: number;
  meals: MealPlanItemDto[];
  createdAt: string;
}

// Photo Analysis Types
export interface PhotoAnalyzeResponse {
  photoAnalysisId: number;
  estimatedCalories: number;
  finalProtein: number;
  finalCarbs: number;
  finalFats: number;
  detectedFoods: string;
  confidenceLevel: string;
  imageUrl: string;
  isConfirmed: boolean;
  aiServiceUsed: string;
  createdAt: string;
  mealLogId?: number;
}

export interface ConfirmPhotoRequest {
  photoAnalysisId: number;
  adjustedCalories?: number;
  adjustedProtein?: number;
  adjustedCarbs?: number;
  adjustedFats?: number;
  saveAsMeal: boolean;
  mealDate?: string;
  mealTime?: string;
}

// Diet Preference Types
export interface PreferenceRequest {
  dietType: DietType;
  allergies: string;
  excludedFoods: string;
  budgetLevel: BudgetLevel;
}

export interface PreferenceResponse {
  preferenceId: number;
  dietType: DietType;
  allergies: string;
  excludedFoods: string;
  budgetLevel: BudgetLevel;
}

// Settings Types
export interface SettingsRequest {
  preferredUnits: UnitSystem;
  dailyCalorieReminder: boolean;
  mealReminderEnabled: boolean;
  darkMode: boolean;
}

export interface SettingsResponse {
  settingsId: number;
  preferredUnits: UnitSystem;
  dailyCalorieReminder: boolean;
  mealReminderEnabled: boolean;
  darkMode: boolean;
  createdAt: string;
  updatedAt: string;
}

// Weight Log Types
export interface WeightLogRequest {
  weight: number;
  date: string; // ISO date string
  notes?: string;
  bodyFatPercentage?: number;
  muscleMass?: number;
  waistCircumference?: number;
}

export interface WeightLogResponse {
  weightLogId: number;
  weight: number;
  date: string;
  notes?: string;
  bodyFatPercentage?: number;
  muscleMass?: number;
  waistCircumference?: number;
  createdAt: string;
}

export interface ProgressSummary {
  currentWeight?: WeightLogResponse;
  startingWeight?: WeightLogResponse;
  totalChange?: number; // kg lost/gained
  averageWeeklyChange?: number;
  recentLogs: WeightLogResponse[];
  trend?: string; // "Losing", "Gaining", "Maintaining"
}

