// API Configuration
// Update this to match your backend URL
// For physical devices/emulators, use your computer's IP address instead of localhost
// Example: 'http://192.168.1.100:5000' or 'http://10.0.2.2:5000' for Android emulator
export const API_BASE_URL = __DEV__ 
  ? 'http://10.21.137.113:5039' // Change to your backend URL (use IP address for physical devices)
  : 'https://your-production-api.com';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  
  // Profile
  PROFILE: '/api/profile',
  
  // Meal Log
  MEAL_LOG: '/api/meallog',
  MEAL_LOG_DAILY: (date: string) => `/api/meallog/daily/${date}`,
  MEAL_LOG_UPDATE: (id: number) => `/api/meallog/${id}`,
  MEAL_LOG_DELETE: (id: number) => `/api/meallog/${id}`,
  
  // Meal Plan
  MEAL_PLAN: '/api/mealplan',
  MEAL_PLAN_GENERATE: '/api/mealplan/generate',
  MEAL_PLAN_REGENERATE: '/api/mealplan/regenerate',
  
  // Photo Analysis
  PHOTO_ANALYZE: '/api/photo/analyze',
  PHOTO_CONFIRM: '/api/photo/confirm',
  PHOTO_GET: (id: number) => `/api/photo/${id}`,
  
  // Preferences
  PREFERENCES: '/api/preferences',
  
  // Settings
  SETTINGS: '/api/settings',
  
  // Progress/Weight
  PROGRESS_SUMMARY: '/api/progress/summary',
  PROGRESS_WEIGHT: '/api/progress/weight',
  PROGRESS_WEIGHT_DELETE: (id: number) => `/api/progress/weight/${id}`,
};

