import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiService } from '@/services/api';
import { API_BASE_URL } from '@/config/api';
import type { AuthResponse, ProfileResponse } from '@/types';

interface AuthContextType {
  user: AuthResponse | null;
  profile: ProfileResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const userDataStr = await SecureStore.getItemAsync('userData');
      
      if (token && userDataStr) {
        const userData = JSON.parse(userDataStr);
        setUser(userData);
        
        // Try to load profile
        try {
          const profileData = await apiService.getProfile();
          setProfile(profileData);
        } catch (error) {
          // Profile might not exist yet
          console.log('Profile not found');
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });
      await SecureStore.setItemAsync('authToken', response.token);
      await SecureStore.setItemAsync('userData', JSON.stringify(response));
      setUser(response);
      
      // Try to load profile
      try {
        const profileData = await apiService.getProfile();
        setProfile(profileData);
      } catch (error) {
        // Profile might not exist yet
      }
    } catch (error: any) {
      // Handle network errors specifically
      if (error.code === 'NETWORK_ERROR' || 
          error.message?.includes('Network Error') || 
          error.message?.includes('ECONNREFUSED') ||
          error.message?.includes('timeout') ||
          !error.response) {
        const errorMessage = error.message || 'Network error';
        throw new Error(
          `Network Error: Unable to connect to server. Please check:\n` +
          `1. Your phone and computer are on the same Wi-Fi network\n` +
          `2. The server is running at ${API_BASE_URL}\n` +
          `3. Your firewall allows connections\n\n` +
          `Error: ${errorMessage}`
        );
      }
      
      // Handle HTTP errors
      const errorData = error.response?.data;
      if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else if (errorData?.message) {
        throw new Error(errorData.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    try {
      const response = await apiService.register({ fullName, email, password });
      await SecureStore.setItemAsync('authToken', response.token);
      await SecureStore.setItemAsync('userData', JSON.stringify(response));
      setUser(response);
    } catch (error: any) {
      throw new Error(error.response?.data || error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('userData');
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const profileData = await apiService.getProfile();
      setProfile(profileData);
    } catch (error) {
      setProfile(null);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshProfile,
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

