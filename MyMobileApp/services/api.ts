import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';
import * as SecureStore from 'expo-secure-store';
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  ProfileRequest,
  ProfileResponse,
  MealLogRequest,
  MealLogResponse,
  MealPlanResponse,
  PhotoAnalyzeResponse,
  ConfirmPhotoRequest,
  PreferenceRequest,
  PreferenceResponse,
  SettingsRequest,
  SettingsResponse,
  WeightLogRequest,
  WeightLogResponse,
  ProgressSummary,
} from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 120000, // 120 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // Log request URL for debugging
        const fullUrl = `${config.baseURL}${config.url}`;
        console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Log network errors for debugging
        if (!error.response) {
          console.error('Network Error Details:', {
            message: error.message,
            code: error.code,
            config: {
              url: error.config?.url,
              baseURL: error.config?.baseURL,
              method: error.config?.method,
            },
          });
        }
        
        if (error.response?.status === 401) {
          // Token expired or invalid
          await SecureStore.deleteItemAsync('authToken');
          await SecureStore.deleteItemAsync('userData');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth APIs
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>(API_ENDPOINTS.REGISTER, data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>(API_ENDPOINTS.LOGIN, data);
    return response.data;
  }

  // Profile APIs
  async getProfile(): Promise<ProfileResponse> {
    const response = await this.api.get<ProfileResponse>(API_ENDPOINTS.PROFILE);
    return response.data;
  }

  async createProfile(data: ProfileRequest): Promise<ProfileResponse> {
    const response = await this.api.post<ProfileResponse>(API_ENDPOINTS.PROFILE, data);
    return response.data;
  }

  async updateProfile(data: ProfileRequest): Promise<ProfileResponse> {
    const response = await this.api.put<ProfileResponse>(API_ENDPOINTS.PROFILE, data);
    return response.data;
  }

  // Meal Log APIs
  async logMeal(data: MealLogRequest): Promise<MealLogResponse> {
    const response = await this.api.post<MealLogResponse>(API_ENDPOINTS.MEAL_LOG, data);
    return response.data;
  }

  async getDailyLogs(date: string): Promise<MealLogResponse[]> {
    const response = await this.api.get<MealLogResponse[]>(API_ENDPOINTS.MEAL_LOG_DAILY(date));
    return response.data;
  }

  async updateMealLog(id: number, data: MealLogRequest): Promise<MealLogResponse> {
    const response = await this.api.put<MealLogResponse>(API_ENDPOINTS.MEAL_LOG_UPDATE(id), data);
    return response.data;
  }

  async deleteMealLog(id: number): Promise<void> {
    await this.api.delete(API_ENDPOINTS.MEAL_LOG_DELETE(id));
  }

  // Meal Plan APIs
  async generateMealPlan(): Promise<MealPlanResponse> {
    const response = await this.api.post<MealPlanResponse>(API_ENDPOINTS.MEAL_PLAN_GENERATE);
    return response.data;
  }

  async regenerateMealPlan(): Promise<MealPlanResponse> {
    const response = await this.api.put<MealPlanResponse>(API_ENDPOINTS.MEAL_PLAN_REGENERATE);
    return response.data;
  }

  async getMealPlan(): Promise<MealPlanResponse> {
    const response = await this.api.get<MealPlanResponse>(API_ENDPOINTS.MEAL_PLAN);
    return response.data;
  }

  // Photo Analysis APIs
  async analyzePhoto(imageUri: string): Promise<PhotoAnalyzeResponse> {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('imageFile', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await this.api.post<PhotoAnalyzeResponse>(
      API_ENDPOINTS.PHOTO_ANALYZE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async confirmPhotoAnalysis(data: ConfirmPhotoRequest): Promise<PhotoAnalyzeResponse> {
    const response = await this.api.post<PhotoAnalyzeResponse>(API_ENDPOINTS.PHOTO_CONFIRM, data);
    return response.data;
  }

  async getPhotoAnalysis(id: number): Promise<PhotoAnalyzeResponse> {
    const response = await this.api.get<PhotoAnalyzeResponse>(API_ENDPOINTS.PHOTO_GET(id));
    return response.data;
  }

  // Preferences APIs
  async getPreferences(): Promise<PreferenceResponse> {
    const response = await this.api.get<PreferenceResponse>(API_ENDPOINTS.PREFERENCES);
    return response.data;
  }

  async createPreferences(data: PreferenceRequest): Promise<PreferenceResponse> {
    const response = await this.api.post<PreferenceResponse>(API_ENDPOINTS.PREFERENCES, data);
    return response.data;
  }

  async updatePreferences(data: PreferenceRequest): Promise<PreferenceResponse> {
    const response = await this.api.put<PreferenceResponse>(API_ENDPOINTS.PREFERENCES, data);
    return response.data;
  }

  // Settings APIs
  async getSettings(): Promise<SettingsResponse> {
    const response = await this.api.get<SettingsResponse>(API_ENDPOINTS.SETTINGS);
    return response.data;
  }

  async updateSettings(data: SettingsRequest): Promise<SettingsResponse> {
    const response = await this.api.put<SettingsResponse>(API_ENDPOINTS.SETTINGS, data);
    return response.data;
  }

  // Weight/Progress APIs
  async getProgressSummary(): Promise<ProgressSummary> {
    const response = await this.api.get<ProgressSummary>(API_ENDPOINTS.PROGRESS_SUMMARY);
    return response.data;
  }

  async logWeight(data: WeightLogRequest): Promise<WeightLogResponse> {
    const response = await this.api.post<WeightLogResponse>(API_ENDPOINTS.PROGRESS_WEIGHT, data);
    return response.data;
  }

  async getWeightHistory(startDate?: string, endDate?: string): Promise<WeightLogResponse[]> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await this.api.get<WeightLogResponse[]>(API_ENDPOINTS.PROGRESS_WEIGHT, { params });
    return response.data;
  }

  async deleteWeightLog(id: number): Promise<void> {
    await this.api.delete(API_ENDPOINTS.PROGRESS_WEIGHT_DELETE(id));
  }
}

export const apiService = new ApiService();

