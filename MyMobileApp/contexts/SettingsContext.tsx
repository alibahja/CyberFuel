import { Colors } from '@/constants/theme';
import { apiService } from '@/services/api';
import { scheduleDailyReminderTask } from '@/services/notifications';
import type { SettingsResponse } from '@/types';
import { UnitSystem } from '@/types';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface SettingsContextType {
  settings: SettingsResponse | null;
  preferredUnits: UnitSystem;
  darkMode: boolean;
  dailyCalorieReminder: boolean;
  mealReminderEnabled: boolean;
  isLoading: boolean;
  updateSettings: (settings: Partial<SettingsResponse>) => Promise<void>;
  convertWeight: (kg: number) => { value: number; unit: string };
  convertHeight: (cm: number) => { value: number; unit: string };
  convertCalories: (calories: number) => { value: number; unit: string };
  convertMacro: (grams: number) => { value: number; unit: string };
  convertPortionSize: (value: number) => { value: number; unit: string };
  refreshSettings: () => Promise<void>;
  // Theme-related
  colors: typeof Colors.dark | typeof Colors.light;
  themeMode: 'dark' | 'light';
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await apiService.getSettings();
      setSettings(data);
      // Schedule reminder based on saved settings
      await scheduleDailyReminderTask(data.dailyCalorieReminder);
    } catch (error) {
      // Use defaults if settings don't exist
      const defaultSettings = {
        settingsId: 0,
        preferredUnits: UnitSystem.Metric,
        dailyCalorieReminder: true,
        mealReminderEnabled: true,
        darkMode: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSettings(defaultSettings);
      // Schedule reminder based on default settings
      await scheduleDailyReminderTask(defaultSettings.dailyCalorieReminder);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  const updateSettings = async (newSettings: Partial<SettingsResponse>) => {
    try {
      const updated = await apiService.updateSettings({
        preferredUnits: newSettings.preferredUnits ?? settings?.preferredUnits ?? UnitSystem.Metric,
        dailyCalorieReminder: newSettings.dailyCalorieReminder ?? settings?.dailyCalorieReminder ?? true,
        mealReminderEnabled: newSettings.mealReminderEnabled ?? settings?.mealReminderEnabled ?? true,
        darkMode: newSettings.darkMode ?? settings?.darkMode ?? true,
      });
      setSettings(updated);

      // Schedule or cancel reminder based on the setting
      const reminderEnabled = updated.dailyCalorieReminder ?? false;
      await scheduleDailyReminderTask(reminderEnabled);
    } catch (error) {
      throw error;
    }
  };

  const convertWeight = (kg: number) => {
    const units = settings?.preferredUnits ?? UnitSystem.Metric;
    if (units === UnitSystem.Imperial) {
      const lbs = kg * 2.20462;
      return { value: Math.round(lbs * 10) / 10, unit: 'lbs' };
    }
    return { value: Math.round(kg * 10) / 10, unit: 'kg' };
  };

  const convertHeight = (cm: number) => {
    const units = settings?.preferredUnits ?? UnitSystem.Metric;
    if (units === UnitSystem.Imperial) {
      const totalInches = cm / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return { 
        value: feet * 12 + inches, 
        unit: `${feet}'${inches}"`,
        feet,
        inches,
      };
    }
    return { value: Math.round(cm * 10) / 10, unit: 'cm' };
  };

  const convertCalories = (calories: number) => {
    // Calories are the same in both systems
    return { value: Math.round(calories), unit: 'kcal' };
  };

  const convertMacro = (grams: number) => {
    // Macronutrients (protein, carbs, fats) are in grams in both systems
    // We could optionally convert to ounces in imperial, but keep grams for precision
    return { value: Math.round(grams * 10) / 10, unit: 'g' };
  };

  const convertPortionSize = (value: number) => {
    const units = settings?.preferredUnits ?? UnitSystem.Metric;
    if (units === UnitSystem.Imperial) {
      // Convert ml to fl oz (1 ml = 0.033814 fl oz)
      const flOz = value * 0.033814;
      return { value: Math.round(flOz * 10) / 10, unit: 'fl oz' };
    }
    // Keep milliliters for metric
    return { value: Math.round(value), unit: 'ml' };
  };

  const currentTheme = settings?.darkMode ?? true;
  const themeColors = currentTheme ? Colors.dark : Colors.light;

  const value: SettingsContextType = {
    settings,
    preferredUnits: settings?.preferredUnits ?? UnitSystem.Metric,
    darkMode: settings?.darkMode ?? true,
    dailyCalorieReminder: settings?.dailyCalorieReminder ?? true,
    mealReminderEnabled: settings?.mealReminderEnabled ?? true,
    isLoading,
    updateSettings,
    convertWeight,
    convertHeight,
    convertCalories,
    convertMacro,
    convertPortionSize,
    refreshSettings,
    colors: themeColors,
    themeMode: currentTheme ? 'dark' : 'light',
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

