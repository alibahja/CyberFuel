import { useCustomAlert } from '@/hooks/useCustomAlert';
import { useSettings } from '@/contexts/SettingsContext';
import { apiService } from '@/services/api';
import type { MealLogRequest } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function LogMealScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { colors, themeMode } = useSettings();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);
  const { showAlert, AlertComponent } = useCustomAlert();

  const [formData, setFormData] = useState({
    mealId: 0,
    mealName: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().substring(0, 5),
    loggedCalories: '',
    isFromAI: false,
    loggedProtein: '',
    loggedCarbs: '',
    loggedFats: '',
    portionMultiplier: '1.0',
  });

  useEffect(() => {
    if (id) loadMealLog();
  }, [id]);

  const loadMealLog = async () => {
    try {
      setLoadingData(true);
      const dateStr = formData.date;
      const logs = await apiService.getDailyLogs(dateStr);
      const log = logs.find((l) => l.mealLogId === parseInt(id!));
      if (log) {
        setFormData({
          mealId: log.mealId,
          mealName: (log as any).mealName || '',
          date: log.date.split('T')[0],
          time: log.time.substring(0, 5),
          loggedCalories: log.loggedCalories.toString(),
          isFromAI: log.isFromAI,
          loggedProtein: log.loggedProtein?.toString() || '',
          loggedCarbs: log.loggedCarbs?.toString() || '',
          loggedFats: log.loggedFats?.toString() || '',
          portionMultiplier: log.portionMultiplier?.toString() || '1.0',
        });
      }
    } catch (error: any) {
      showAlert('System Error', 'Could not retrieve meal data.', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async () => {
    if (!formData.loggedCalories) {
      showAlert('Data Required', 'Energy intake (kcal) must be defined.', 'error');
      return;
    }

    setLoading(true);
    try {
      const [hours, minutes] = formData.time.split(':').map(Number);
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;

      const data: MealLogRequest = {
        mealId: formData.mealId || null,
        mealName: formData.mealName || undefined,
        date: formData.date,
        time: timeStr,
        loggedCalories: parseFloat(formData.loggedCalories),
        isFromAI: formData.isFromAI,
        loggedProtein: formData.loggedProtein ? parseFloat(formData.loggedProtein) : undefined,
        loggedCarbs: formData.loggedCarbs ? parseFloat(formData.loggedCarbs) : undefined,
        loggedFats: formData.loggedFats ? parseFloat(formData.loggedFats) : undefined,
        portionMultiplier: formData.portionMultiplier ? parseFloat(formData.portionMultiplier) : undefined,
      };

      if (id) {
        await apiService.updateMealLog(parseInt(id), data);
      } else {
        await apiService.logMeal(data);
      }

      showAlert(
        'Success',
        id ? 'Meal log updated successfully.' : 'Meal logged successfully.',
        'success',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      showAlert('Upload Failed', error.message || 'Check network connection.', 'error');
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

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={[styles.subtitle, { color: colors.primary }]}>{id ? 'UPDATE LOG' : 'NEW ENTRY'}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{id ? 'EDIT MEAL' : 'LOG MEAL'}</Text>
          </View>

          {/* MEAL NAME — new field */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: themeMode === 'dark' ? '#444' : '#999' }]}>MEAL NAME</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: themeMode === 'dark' ? '#0A0A18' : '#F5F5F5',
                  borderColor: themeMode === 'dark' ? '#111128' : '#E0E0E0',
                  color: colors.text
                }
              ]}
              value={formData.mealName}
              onChangeText={(text) => setFormData({ ...formData, mealName: text })}
              placeholder="e.g. Grilled Chicken Salad"
              placeholderTextColor={themeMode === 'dark' ? "#2A2A3E" : "#999"}
              autoCapitalize="words"
            />
          </View>

          {/* DATE & TIME ROW */}
          <View style={styles.row}>
            <View style={[styles.inputWrapper, { flex: 1.5, marginBottom: 0 }]}>
              <Text style={[styles.label, { color: themeMode === 'dark' ? '#444' : '#999' }]}>DATE</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: themeMode === 'dark' ? '#0A0A18' : '#F5F5F5',
                    borderColor: themeMode === 'dark' ? '#111128' : '#E0E0E0',
                    color: colors.text
                  }
                ]}
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={themeMode === 'dark' ? "#2A2A3E" : "#999"}
              />
            </View>
            <View style={[styles.inputWrapper, { flex: 1, marginBottom: 0 }]}>
              <Text style={[styles.label, { color: themeMode === 'dark' ? '#444' : '#999' }]}>TIME</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: themeMode === 'dark' ? '#0A0A18' : '#F5F5F5',
                    borderColor: themeMode === 'dark' ? '#111128' : '#E0E0E0',
                    color: colors.text
                  }
                ]}
                value={formData.time}
                onChangeText={(text) => setFormData({ ...formData, time: text })}
                placeholder="HH:MM"
                placeholderTextColor={themeMode === 'dark' ? "#2A2A3E" : "#999"}
              />
            </View>
          </View>

          {/* ENERGY INPUT */}
          <View style={[
            styles.energyCard, 
            { 
              backgroundColor: themeMode === 'dark' ? '#0A0A18' : '#F5F5F5',
              borderColor: themeMode === 'dark' ? '#111128' : '#E0E0E0'
            }
          ]}>
            <Text style={[styles.energyLabel, { color: colors.primary }]}>ENERGY INTAKE (KCAL)</Text>
            <TextInput
              style={[styles.energyInput, { color: colors.secondary }]}
              value={formData.loggedCalories}
              onChangeText={(text) => setFormData({ ...formData, loggedCalories: text })}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={themeMode === 'dark' ? "#1A1A2E" : "#CCC"}
            />
          </View>

          {/* MACROS */}
          <Text style={[styles.sectionTitle, { color: themeMode === 'dark' ? '#333' : '#999' }]}>MACRONUTRIENTS</Text>
          <View style={styles.macroGrid}>
            <View style={[
              styles.macroBox, 
              { 
                backgroundColor: themeMode === 'dark' ? '#0A0A18' : '#F5F5F5',
                borderColor: '#FF6B6B30' 
              }
            ]}>
              <Text style={[styles.macroLabel, { color: '#FF6B6B' }]}>PROTEIN</Text>
              <TextInput
                style={[styles.macroInput, { color: colors.text }]}
                value={formData.loggedProtein}
                onChangeText={(text) => setFormData({ ...formData, loggedProtein: text })}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={themeMode === 'dark' ? "#333" : "#999"}
              />
              <Text style={[styles.macroUnit, { color: themeMode === 'dark' ? '#333' : '#999' }]}>g</Text>
            </View>
            <View style={[
              styles.macroBox, 
              { 
                backgroundColor: themeMode === 'dark' ? '#0A0A18' : '#F5F5F5',
                borderColor: '#4ECDC430' 
              }
            ]}>
              <Text style={[styles.macroLabel, { color: '#4ECDC4' }]}>CARBS</Text>
              <TextInput
                style={[styles.macroInput, { color: colors.text }]}
                value={formData.loggedCarbs}
                onChangeText={(text) => setFormData({ ...formData, loggedCarbs: text })}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={themeMode === 'dark' ? "#333" : "#999"}
              />
              <Text style={[styles.macroUnit, { color: themeMode === 'dark' ? '#333' : '#999' }]}>g</Text>
            </View>
            <View style={[
              styles.macroBox, 
              { 
                backgroundColor: themeMode === 'dark' ? '#0A0A18' : '#F5F5F5',
                borderColor: '#FFE66D30' 
              }
            ]}>
              <Text style={[styles.macroLabel, { color: '#FFE66D' }]}>FATS</Text>
              <TextInput
                style={[styles.macroInput, { color: colors.text }]}
                value={formData.loggedFats}
                onChangeText={(text) => setFormData({ ...formData, loggedFats: text })}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={themeMode === 'dark' ? "#333" : "#999"}
              />
              <Text style={[styles.macroUnit, { color: themeMode === 'dark' ? '#333' : '#999' }]}>g</Text>
            </View>
          </View>

          {/* PORTION */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: themeMode === 'dark' ? '#444' : '#999' }]}>PORTION MULTIPLIER</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: themeMode === 'dark' ? '#0A0A18' : '#F5F5F5',
                  borderColor: themeMode === 'dark' ? '#111128' : '#E0E0E0',
                  color: colors.text
                }
              ]}
              value={formData.portionMultiplier}
              onChangeText={(text) => setFormData({ ...formData, portionMultiplier: text })}
              keyboardType="numeric"
              placeholder="1.0"
              placeholderTextColor={themeMode === 'dark' ? "#2A2A3E" : "#999"}
            />
          </View>

          {/* AI TOGGLE */}
          <TouchableOpacity
            style={[
              styles.aiToggle, 
              { 
                backgroundColor: themeMode === 'dark' ? '#0A0A18' : '#F5F5F5',
                borderColor: themeMode === 'dark' ? '#111128' : '#E0E0E0'
              }
            ]}
            onPress={() => setFormData({ ...formData, isFromAI: !formData.isFromAI })}
          >
            <View style={[styles.toggleBox, formData.isFromAI && styles.toggleActive]}>
              {formData.isFromAI && <View style={styles.toggleInner} />}
            </View>
            <Text style={[styles.toggleText, { color: themeMode === 'dark' ? '#444' : '#999' }]}>AI ANALYSIS VERIFIED</Text>
            {formData.isFromAI && (
              <View style={styles.aiActiveBadge}>
                <Text style={styles.aiActiveBadgeText}>ACTIVE</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* SAVE BUTTON */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>{id ? 'UPDATE ARCHIVE' : 'SAVE DATA'}</Text>
            )}
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
    paddingBottom: 50,
  },
  header: {
    marginBottom: 28,
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '900',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
  },
  energyCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  energyLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 10,
  },
  energyInput: {
    fontSize: 56,
    fontWeight: '900',
    textAlign: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 14,
  },
  macroGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  macroBox: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  macroLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  macroInput: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    width: '100%',
  },
  macroUnit: {
    fontSize: 9,
    fontWeight: '700',
  },
  aiToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  toggleBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#8A2BE2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#8A2BE2',
  },
  toggleInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#FFF',
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    flex: 1,
  },
  aiActiveBadge: {
    backgroundColor: '#8A2BE220',
    borderWidth: 1,
    borderColor: '#8A2BE240',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  aiActiveBadgeText: {
    color: '#8A2BE2',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  button: {
    backgroundColor: '#00D4FF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
});