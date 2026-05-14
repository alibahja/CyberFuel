import { useCustomAlert } from '@/hooks/useCustomAlert';
import { useSettings } from '@/contexts/SettingsContext';
import { apiService } from '@/services/api';
import type { ConfirmPhotoRequest, PhotoAnalyzeResponse } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

export default function ConfirmPhotoScreen() {
  const { analysisId } = useLocalSearchParams<{ analysisId: string }>();
  const router = useRouter();
  const { colors, themeMode } = useSettings();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [analysis, setAnalysis] = useState<PhotoAnalyzeResponse | null>(null);

  const [formData, setFormData] = useState({
    adjustedCalories: '',
    adjustedProtein: '',
    adjustedCarbs: '',
    adjustedFats: '',
    saveAsMeal: true,
    mealDate: new Date().toISOString().split('T')[0],
    mealTime: new Date().toTimeString().substring(0, 5),
  });

  useEffect(() => {
    if (analysisId) {
      loadAnalysis();
    }
  }, [analysisId]);

  const loadAnalysis = async () => {
    try {
      setLoadingData(true);
      const data = await apiService.getPhotoAnalysis(parseInt(analysisId!));
      setAnalysis(data);
      setFormData({
        adjustedCalories: data.estimatedCalories.toString(),
        adjustedProtein: data.finalProtein.toString(),
        adjustedCarbs: data.finalCarbs.toString(),
        adjustedFats: data.finalFats.toString(),
        saveAsMeal: true,
        mealDate: new Date().toISOString().split('T')[0],
        mealTime: new Date().toTimeString().substring(0, 5),
      });
    } catch (error: any) {
      Alert.alert('LINK ERROR', 'Analysis sequence not found.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleConfirm = async () => {
    if (!analysis) return;

    setLoading(true);
    try {
      const [hours, minutes] = formData.mealTime.split(':').map(Number);
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;

      const data: ConfirmPhotoRequest = {
        photoAnalysisId: analysis.photoAnalysisId,
        adjustedCalories: formData.adjustedCalories ? parseFloat(formData.adjustedCalories) : undefined,
        adjustedProtein: formData.adjustedProtein ? parseFloat(formData.adjustedProtein) : undefined,
        adjustedCarbs: formData.adjustedCarbs ? parseFloat(formData.adjustedCarbs) : undefined,
        adjustedFats: formData.adjustedFats ? parseFloat(formData.adjustedFats) : undefined,
        saveAsMeal: formData.saveAsMeal,
        mealDate: formData.saveAsMeal ? formData.mealDate : undefined,
        mealTime: formData.saveAsMeal ? timeStr : undefined,
      };

      await apiService.confirmPhotoAnalysis(data);
      showAlert(
        'LOGGED',
        'Neural analysis synchronized with daily logs.',
        'success',
        [{
          text: 'OK',
          onPress: () => router.back()
        }]
      );

    } catch (error: any) {
      Alert.alert('SYNC ERROR', error.message || 'Failed to confirm data.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.secondary} />
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
            <Text style={[styles.subtitle, { color: colors.primary }]}>DATA VALIDATION</Text>
            <Text style={[styles.title, { color: colors.text }]}>OVERRIDE VALUES</Text>
          </View>

          <View style={[
            styles.detectionModule,
            {
              backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
              borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
            }
          ]}>
            <Text style={[styles.moduleLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>AI CLASSIFICATION</Text>
            <Text style={[styles.detectionValue, { color: colors.secondary }]}>{analysis?.detectedFoods || 'UNIDENTIFIED'}</Text>
          </View>

          <View style={styles.grid}>
            <View style={[
              styles.inputBox,
              {
                backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
              }
            ]}>
              <Text style={[styles.inputLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>CALORIES (KCAL)</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={formData.adjustedCalories}
                onChangeText={(t) => setFormData({ ...formData, adjustedCalories: t })}
                keyboardType="numeric"
                placeholderTextColor={themeMode === 'dark' ? "#333" : "#999"}
              />
            </View>
            <View style={[
              styles.inputBox,
              {
                backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
              }
            ]}>
              <Text style={[styles.inputLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>PROTEIN (G)</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={formData.adjustedProtein}
                onChangeText={(t) => setFormData({ ...formData, adjustedProtein: t })}
                keyboardType="numeric"
                placeholderTextColor={themeMode === 'dark' ? "#333" : "#999"}
              />
            </View>
            <View style={[
              styles.inputBox,
              {
                backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
              }
            ]}>
              <Text style={[styles.inputLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>CARBS (G)</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={formData.adjustedCarbs}
                onChangeText={(t) => setFormData({ ...formData, adjustedCarbs: t })}
                keyboardType="numeric"
                placeholderTextColor={themeMode === 'dark' ? "#333" : "#999"}
              />
            </View>
            <View style={[
              styles.inputBox,
              {
                backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
              }
            ]}>
              <Text style={[styles.inputLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>FATS (G)</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={formData.adjustedFats}
                onChangeText={(t) => setFormData({ ...formData, adjustedFats: t })}
                keyboardType="numeric"
                placeholderTextColor={themeMode === 'dark' ? "#333" : "#999"}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.protocolSwitch,
              {
                backgroundColor: themeMode === 'dark' ? '#111' : '#F0F0F0',
                borderColor: themeMode === 'dark' ? '#222' : '#E0E0E0'
              }
            ]}
            onPress={() => setFormData({ ...formData, saveAsMeal: !formData.saveAsMeal })}
          >
            <View style={[styles.statusIndicator, formData.saveAsMeal && styles.statusOn]} />
            <Text style={[styles.protocolText, { color: colors.text }]}>COMMIT TO DAILY LOG PROTOCOL</Text>
          </TouchableOpacity>

          {formData.saveAsMeal && (
            <View style={styles.timeModule}>
              <View style={[
                styles.timeField,
                {
                  backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                  borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
                }
              ]}>
                <Text style={[styles.inputLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>TIMESTAMP: DATE</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={formData.mealDate}
                  onChangeText={(t) => setFormData({ ...formData, mealDate: t })}
                  placeholderTextColor={themeMode === 'dark' ? "#333" : "#999"}
                />
              </View>
              <View style={[
                styles.timeField,
                {
                  backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                  borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
                }
              ]}>
                <Text style={[styles.inputLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>TIMESTAMP: TIME</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={formData.mealTime}
                  onChangeText={(t) => setFormData({ ...formData, mealTime: t })}
                  placeholderTextColor={themeMode === 'dark' ? "#333" : "#999"}
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: colors.secondary }, loading && styles.disabled]}
            onPress={handleConfirm}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.confirmText}>SYNC DATA</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <AlertComponent />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
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
  detectionModule: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  moduleLabel: {
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 6,
  },
  detectionValue: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  inputBox: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 8,
  },
  input: {
    fontSize: 20,
    fontWeight: '900',
    padding: 0,
  },
  protocolSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginRight: 12,
  },
  statusOn: {
    backgroundColor: '#34C759',
    shadowColor: '#34C759',
    shadowRadius: 5,
    elevation: 5,
  },
  protocolText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  timeModule: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  timeField: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  confirmButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmText: {
    color: '#000',
    fontWeight: '900',
    letterSpacing: 2,
    fontSize: 14,
  },
  disabled: {
    opacity: 0.5,
  },
});