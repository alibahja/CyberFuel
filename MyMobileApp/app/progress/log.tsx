import { useCustomAlert } from '@/hooks/useCustomAlert';
import { useSettings } from '@/contexts/SettingsContext';
import { apiService } from '@/services/api';
import type { WeightLogRequest } from '@/types';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
  View
} from 'react-native';

export default function LogWeightScreen() {
  const router = useRouter();
  const { colors, themeMode } = useSettings();
  const [loading, setLoading] = useState(false);
  const { showAlert, AlertComponent } = useCustomAlert();

  const [formData, setFormData] = useState({
    weight: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    bodyFatPercentage: '',
    muscleMass: '',
    waistCircumference: '',
  });

  const handleSave = async () => {
    if (!formData.weight) {
      showAlert('Incomplete Data', 'Primary weight metric is required.', 'error');
      return;
    }

    const weight = parseFloat(formData.weight);
    if (isNaN(weight) || weight < 30 || weight > 300) {
      showAlert('Calibration Error', 'Weight must be within 30 - 300 kg range.', 'error');
      return;
    }

    setLoading(true);

    try {
      const data: WeightLogRequest = {
        weight,
        date: formData.date,
        notes: formData.notes || undefined,
        bodyFatPercentage: formData.bodyFatPercentage ? parseFloat(formData.bodyFatPercentage) : undefined,
        muscleMass: formData.muscleMass ? parseFloat(formData.muscleMass) : undefined,
        waistCircumference: formData.waistCircumference ? parseFloat(formData.waistCircumference) : undefined,
      };

      await apiService.logWeight(data);
      showAlert(
        'Success', 
        'Biometrics updated successfully.', 
        'success', 
        [
          { 
            text: 'OK', 
            onPress: () => router.back() 
          }
        ]
      );
    } catch (error: any) {
      showAlert('Sync Failed', error.response?.data || error.message || 'System error during upload', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle={themeMode === 'dark' ? "light-content" : "dark-content"} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.subtitle, { color: colors.primary }]}>BIOMETRIC UPDATE</Text>
            <Text style={[styles.title, { color: colors.text }]}>SYNC WEIGHT</Text>
          </View>

          {/* MAIN INPUT SECTION */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>CORE METRICS</Text>
            <View style={[
              styles.mainInputContainer, 
              { 
                backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
              }
            ]}>
              <TextInput
                style={[styles.hugeInput, { color: colors.secondary }]}
                value={formData.weight}
                onChangeText={(text) => setFormData({ ...formData, weight: text })}
                keyboardType="decimal-pad"
                placeholder="00.0"
                placeholderTextColor={themeMode === 'dark' ? "#222" : "#CCC"}
                editable={!loading}
              />
              <Text style={[styles.hugeUnit, { color: themeMode === 'dark' ? '#1A1A2E' : '#CCC' }]}>KG</Text>
            </View>
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: themeMode === 'dark' ? '#666' : '#999' }]}>LOG DATE</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                    borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0',
                    color: colors.text
                  }
                ]}
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={themeMode === 'dark' ? "#444" : "#999"}
                editable={!loading}
              />
            </View>
          </View>

          {/* COMPOSITION SECTION */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>BODY COMPOSITION (OPTIONAL)</Text>
            <View style={styles.grid}>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <Text style={[styles.label, { color: themeMode === 'dark' ? '#666' : '#999' }]}>BODY FAT %</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                      borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0',
                      color: colors.text
                    }
                  ]}
                  value={formData.bodyFatPercentage}
                  onChangeText={(text) => setFormData({ ...formData, bodyFatPercentage: text })}
                  keyboardType="numeric"
                  placeholder="--"
                  placeholderTextColor={themeMode === 'dark' ? "#444" : "#999"}
                />
              </View>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <Text style={[styles.label, { color: themeMode === 'dark' ? '#666' : '#999' }]}>MUSCLE (KG)</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                      borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0',
                      color: colors.text
                    }
                  ]}
                  value={formData.muscleMass}
                  onChangeText={(text) => setFormData({ ...formData, muscleMass: text })}
                  keyboardType="numeric"
                  placeholder="--"
                  placeholderTextColor={themeMode === 'dark' ? "#444" : "#999"}
                />
              </View>
            </View>
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: themeMode === 'dark' ? '#666' : '#999' }]}>WAIST CIRCUMFERENCE (CM)</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                    borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0',
                    color: colors.text
                  }
                ]}
                value={formData.waistCircumference}
                onChangeText={(text) => setFormData({ ...formData, waistCircumference: text })}
                keyboardType="numeric"
                placeholder="--"
                placeholderTextColor={themeMode === 'dark' ? "#444" : "#999"}
              />
            </View>
          </View>

          {/* NOTES */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: themeMode === 'dark' ? '#666' : '#999' }]}>OBSERVATIONS</Text>
            <TextInput
              style={[
                styles.input, 
                styles.textArea,
                { 
                  backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                  borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0',
                  color: colors.text
                }
              ]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Record any physical changes or conditions..."
              placeholderTextColor={themeMode === 'dark' ? "#444" : "#999"}
              multiline
              numberOfLines={4}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button, 
              { backgroundColor: colors.secondary },
              loading && styles.buttonDisabled
            ]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>COMMIT UPDATE</Text>
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
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
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
  section: {
    marginBottom: 30,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '800',
    marginBottom: 15,
  },
  mainInputContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  hugeInput: {
    fontSize: 64,
    fontWeight: '900',
    minWidth: 150,
  },
  hugeUnit: {
    fontSize: 24,
    fontWeight: '900',
    marginLeft: 10,
  },
  grid: {
    flexDirection: 'row',
    gap: 15,
  },
  inputWrapper: {
    marginBottom: 15,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
});