import CustomAlert from '@/components/CustomAlert';
import { useSettings } from '@/contexts/SettingsContext';
import { apiService } from '@/services/api';
import type { PreferenceRequest, PreferenceResponse } from '@/types';
import { BudgetLevel, DietType } from '@/types';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function PreferencesScreen() {
  const router = useRouter();
  const { colors, themeMode } = useSettings();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [preferences, setPreferences] = useState<PreferenceResponse | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
  });

  // Enum to numeric value mappings (for backend serialization)
  const DietTypeMap: Record<DietType, number> = {
    [DietType.None]: 0,
    [DietType.Vegetarian]: 1,
    [DietType.Vegan]: 2,
    [DietType.GlutenFree]: 3,
    [DietType.DairyFree]: 4,
    [DietType.Keto]: 5,
    [DietType.Paleo]: 6,
    [DietType.Mediterranean]: 7,
  };

  // Reverse mapping: number to DietType enum string
  const NumberToDietType: Record<number, DietType> = {
    0: DietType.None,
    1: DietType.Vegetarian,
    2: DietType.Vegan,
    3: DietType.GlutenFree,
    4: DietType.DairyFree,
    5: DietType.Keto,
    6: DietType.Paleo,
    7: DietType.Mediterranean,
  };

  const BudgetLevelMap: Record<BudgetLevel, number> = {
    [BudgetLevel.Low]: 0,
    [BudgetLevel.Medium]: 1,
    [BudgetLevel.High]: 2,
  };

  // Reverse mapping: number to BudgetLevel enum string
  const NumberToBudgetLevel: Record<number, BudgetLevel> = {
    0: BudgetLevel.Low,
    1: BudgetLevel.Medium,
    2: BudgetLevel.High,
  };

  // Get all DietType enum values
  const allDietTypes = Object.values(DietType);
  
  // Get all BudgetLevel enum values
  const allBudgetLevels = Object.values(BudgetLevel);

  const [formData, setFormData] = useState({
    dietType: DietType.None,
    allergies: '',
    excludedFoods: '',
    budgetLevel: BudgetLevel.Medium,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoadingData(true);
      const data = await apiService.getPreferences();
      setPreferences(data);
      
      // IMPORTANT: Convert numeric values from backend to enum strings
      // The backend returns dietType and budgetLevel as numbers
      const dietTypeValue = typeof data.dietType === 'number' 
        ? NumberToDietType[data.dietType] 
        : data.dietType;
      
      const budgetLevelValue = typeof data.budgetLevel === 'number'
        ? NumberToBudgetLevel[data.budgetLevel]
        : data.budgetLevel;
      
      setFormData({
        dietType: dietTypeValue || DietType.None,
        allergies: data.allergies || '',
        excludedFoods: data.excludedFoods || '',
        budgetLevel: budgetLevelValue || BudgetLevel.Medium,
      });
      
      console.log('Loaded preferences:', {
        original: data,
        converted: {
          dietType: dietTypeValue,
          budgetLevel: budgetLevelValue,
        }
      });
    } catch (error) {
      console.log('No existing preferences found, using defaults');
    } finally {
      setLoadingData(false);
    }
  };

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    onClose?: () => void
  ) => {
    setAlertConfig({
      title,
      message: typeof message === 'string' ? message : 'Unexpected error occurred',
      type,
    });
    setAlertVisible(true);
    
    if (onClose) {
      const handleClose = () => {
        setAlertVisible(false);
        onClose();
      };
      setTimeout(() => {
        setAlertVisible(false);
        handleClose();
      }, 1000);
    }
  };

  const handleSave = async () => {
  setLoading(true);

  try {
    const payload = {
      dietType: DietTypeMap[formData.dietType],
      budgetLevel: BudgetLevelMap[formData.budgetLevel],
      allergies: formData.allergies.trim() || '',
      excludedFoods: formData.excludedFoods.trim() || '',
    };

    console.log('Saving preferences:', payload);

    let result: PreferenceResponse;

    if (preferences) {
      result = await apiService.updatePreferences(payload as unknown as PreferenceRequest);
    } else {
      result = await apiService.createPreferences(payload as unknown as PreferenceRequest);
    }

    setPreferences(result);

    // Regenerate meal plan to apply new preferences
    try {
      await apiService.regenerateMealPlan();
    } catch (regenerateError) {
      console.error('Error regenerating meal plan:', regenerateError);
    }
    
    // Show alert with onOkPress callback
    setAlertConfig({
      title: 'System Updated',
      message: 'Dietary directives have been saved successfully. Meal plan updated with new preferences.',
      type: 'success',
    });
    setAlertVisible(true);
    
  } catch (error: any) {
    console.error('Preferences save error:', error);

    const backendErrors = error?.response?.data?.errors;

    const errorMessage =
      backendErrors
        ? Object.values(backendErrors).flat().join('\n')
        : error?.response?.data?.title ||
          error?.message ||
          'Failed to save preferences';

    setAlertConfig({
      title: 'Update Failed',
      message: errorMessage,
      type: 'error',
    });
    setAlertVisible(true);
  } finally {
    setLoading(false);
  }
};
  if (loadingData) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle={themeMode === 'dark' ? "light-content" : "dark-content"} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.subtitle, { color: colors.primary }]}>USER PARAMETERS</Text>
            <Text style={[styles.title, { color: colors.text }]}>DIET PREFERENCES</Text>
            <Text style={[styles.description, { color: themeMode === 'dark' ? '#666' : '#999' }]}>
              Configure these constraints to personalize your AI-generated meal cycles.
            </Text>
          </View>

          {/* DIET TYPE */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>DIETARY ARCHITECTURE</Text>
            <View style={styles.chipGroup}>
              {allDietTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.chip,
                    { 
                      backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                      borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
                    },
                    formData.dietType === type && styles.chipSelected, 
                  ]}
                  onPress={() => setFormData({ ...formData, dietType: type })}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: themeMode === 'dark' ? '#666' : '#999' },
                      formData.dietType === type && styles.chipTextSelected,
                    ]}
                  >
                    {type.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* BUDGET */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>RESOURCE ALLOCATION (BUDGET)</Text>
            <View style={styles.chipGroup}>
              {allBudgetLevels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.chip,
                    { 
                      backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                      borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
                    },
                    formData.budgetLevel === level && styles.chipSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, budgetLevel: level })
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: themeMode === 'dark' ? '#666' : '#999' },
                      formData.budgetLevel === level && styles.chipTextSelected,
                    ]}
                  >
                    {level.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ALLERGIES */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>ALLERGIES & RISK FACTORS</Text>
            <TextInput
              style={[
                styles.textArea, 
                { 
                  backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                  borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0',
                  color: colors.text
                }
              ]}
              value={formData.allergies}
              onChangeText={(text) =>
                setFormData({ ...formData, allergies: text })
              }
              placeholder="e.g. Peanuts, Shellfish, Lactose..."
              placeholderTextColor={themeMode === 'dark' ? "#444" : "#999"}
              multiline
              editable={!loading}
            />
          </View>

          {/* EXCLUSIONS */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>
              EXCLUSION PROTOCOLS (FOODS TO AVOID)
            </Text>
            <TextInput
              style={[
                styles.textArea, 
                { 
                  backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                  borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0',
                  color: colors.text
                }
              ]}
              value={formData.excludedFoods}
              onChangeText={(text) =>
                setFormData({ ...formData, excludedFoods: text })
              }
              placeholder="e.g. Cilantro, Mushrooms, Red Meat..."
              placeholderTextColor={themeMode === 'dark' ? "#444" : "#999"}
              multiline
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.secondary }, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.saveButtonText}>SAVE CONFIGURATION</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

     <CustomAlert
  visible={alertVisible}
  title={alertConfig.title}
  message={alertConfig.message}
  type={alertConfig.type}
  onClose={() => setAlertVisible(false)}
  onOkPress={() => {
    setAlertVisible(false);
    router.replace('/(tabs)');
  }}
/>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { 
    padding: 24, 
    paddingTop: 60 
  },
  header: { 
    marginBottom: 35 
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '900',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
  },
  description: {
    fontSize: 13,
    marginTop: 8,
  },
  section: { 
    marginBottom: 30 
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '800',
    marginBottom: 15,
  },
  chipGroup: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10 
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipSelected: {
    borderColor: '#00D4FF',
    backgroundColor: 'rgba(0,212,255,0.1)',
  },
  chipText: { 
    fontSize: 12, 
    fontWeight: '700' 
  },
  chipTextSelected: { 
    color: '#00D4FF' 
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonDisabled: { 
    opacity: 0.5 
  },
  saveButtonText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});