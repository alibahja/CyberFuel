import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { apiService } from '@/services/api';
import type { ProfileResponse } from '@/types';
import { useCustomAlert } from '@/hooks/useCustomAlert';

export default function ProfileScreen() {
  const { profile: contextProfile, refreshProfile } = useAuth();
  const { colors, themeMode } = useSettings();
  const [profile, setProfile] = useState<ProfileResponse | null>(contextProfile);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(!contextProfile);
  const router = useRouter();
  const { showAlert, AlertComponent } = useCustomAlert();

  const [formData, setFormData] = useState({
    age: profile?.age.toString() || '',
    height: profile?.height.toString() || '',
    weight: profile?.weight.toString() || '',
    targetWeight: profile?.targetWeight.toString() || '',
    gender: profile?.gender || '',
    goalType: profile?.goalType || 'Maintain',
    activityLevel: profile?.activityLevel || 'Sedentary',
  });

  useEffect(() => {
    if (contextProfile) {
      setProfile(contextProfile);
      setFormData({
        age: contextProfile.age.toString(),
        height: contextProfile.height.toString(),
        weight: contextProfile.weight.toString(),
        targetWeight: contextProfile.targetWeight.toString(),
        gender: contextProfile.gender || '',
        goalType: contextProfile.goalType,
        activityLevel: contextProfile.activityLevel,
      });
    }
  }, [contextProfile]);

  const handleSave = async () => {
    if (!formData.age || !formData.height || !formData.weight || !formData.targetWeight) {
      showAlert('Error', 'Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = {
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        targetWeight: parseFloat(formData.targetWeight),
        gender: formData.gender || undefined,
        goalType: formData.goalType,
        activityLevel: formData.activityLevel,
        // dailyCalorieTarget will be calculated automatically by the backend
      };

      let result: ProfileResponse;
      if (profile) {
        result = await apiService.updateProfile(data);
      } else {
        result = await apiService.createProfile(data);
      }

      setProfile(result);
      await refreshProfile();
      setEditing(false);
      showAlert('Success', 'Profile saved successfully', 'success');
    } catch (error: any) {
      showAlert('Error', error.response?.data || error.message || 'Failed to save profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!editing && !profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={themeMode === 'dark' ? "light-content" : "dark-content"} />
        <Text style={[styles.emptyText, { color: themeMode === 'dark' ? '#555' : '#999' }]}>No profile found. Please create one.</Text>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={() => setEditing(true)}>
          <Text style={styles.buttonText}>CREATE PROFILE</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={themeMode === 'dark' ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Biometrics</Text>
              <View style={styles.accentBar} />
            </View>
            {!editing && (
              <TouchableOpacity 
                style={[styles.editBadge, { 
                  backgroundColor: themeMode === 'dark' ? '#1A1A2E' : '#F0F0F0',
                  borderColor: themeMode === 'dark' ? '#333' : '#E0E0E0'
                }]} 
                onPress={() => setEditing(true)}
              >
                <Text style={[styles.editButtonText, { color: colors.secondary }]}>EDIT</Text>
              </TouchableOpacity>
            )}
          </View>

          {editing ? (
            <View style={styles.form}>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={[styles.label, { color: colors.primary }]}>AGE</Text>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                        borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0',
                        color: colors.text
                      }
                    ]}
                    value={formData.age}
                    onChangeText={(text) => setFormData({ ...formData, age: text })}
                    keyboardType="numeric"
                    placeholderTextColor={themeMode === 'dark' ? "#444" : "#999"}
                    editable={!loading}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.primary }]}>GENDER</Text>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                        borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0',
                        color: colors.text
                      }
                    ]}
                    value={formData.gender}
                    onChangeText={(text) => setFormData({ ...formData, gender: text })}
                    placeholder="M/F"
                    placeholderTextColor={themeMode === 'dark' ? "#444" : "#999"}
                    editable={!loading}
                  />
                </View>
              </View>

              <Text style={[styles.label, { color: colors.primary }]}>HEIGHT (CM)</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                    borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0',
                    color: colors.text
                  }
                ]}
                value={formData.height}
                onChangeText={(text) => setFormData({ ...formData, height: text })}
                keyboardType="numeric"
                editable={!loading}
              />

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={[styles.label, { color: colors.primary }]}>WEIGHT (KG)</Text>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                        borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0',
                        color: colors.text
                      }
                    ]}
                    value={formData.weight}
                    onChangeText={(text) => setFormData({ ...formData, weight: text })}
                    keyboardType="numeric"
                    editable={!loading}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.primary }]}>TARGET (KG)</Text>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                        borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0',
                        color: colors.text
                      }
                    ]}
                    value={formData.targetWeight}
                    onChangeText={(text) => setFormData({ ...formData, targetWeight: text })}
                    keyboardType="numeric"
                    editable={!loading}
                  />
                </View>
              </View>

              <Text style={[styles.label, { color: colors.primary }]}>GOAL TYPE</Text>
              <View style={styles.radioGroup}>
                {['Lose', 'Maintain', 'Gain'].map((goal) => (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      styles.radioButton, 
                      { 
                        backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                        borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
                      },
                      formData.goalType === goal && [styles.radioButtonSelected, { backgroundColor: colors.primary, borderColor: colors.primary }]
                    ]}
                    onPress={() => setFormData({ ...formData, goalType: goal })}
                  >
                    <Text style={[
                      styles.radioText, 
                      { color: themeMode === 'dark' ? '#888' : '#999' },
                      formData.goalType === goal && styles.radioTextSelected
                    ]}>{goal}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.primary }]}>ACTIVITY LEVEL</Text>
              <View style={styles.radioGroup}>
                {['Sedentary', 'Light', 'Moderate', 'Active', 'VeryActive'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.radioButton, 
                      { 
                        backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                        borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
                      },
                      formData.activityLevel === level && [styles.radioButtonSelected, { backgroundColor: colors.primary, borderColor: colors.primary }]
                    ]}
                    onPress={() => setFormData({ ...formData, activityLevel: level })}
                  >
                    <Text style={[
                      styles.radioText, 
                      { color: themeMode === 'dark' ? '#888' : '#999' },
                      formData.activityLevel === level && styles.radioTextSelected
                    ]}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { borderColor: themeMode === 'dark' ? '#333' : '#E0E0E0' }]}
                  onPress={() => {
                    if (profile) {
                      setEditing(false);
                      setFormData({
                        age: profile.age.toString(),
                        height: profile.height.toString(),
                        weight: profile.weight.toString(),
                        targetWeight: profile.targetWeight.toString(),
                        gender: profile.gender || '',
                        goalType: profile.goalType,
                        activityLevel: profile.activityLevel,
                      });
                    }
                  }}
                  disabled={loading}
                >
                  <Text style={[styles.cancelButtonText, { color: themeMode === 'dark' ? '#777' : '#999' }]}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton, { backgroundColor: colors.secondary }]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SAVE DATA</Text>}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.viewMode}>
              <View style={styles.grid}>
                <View style={[styles.dataCard, { 
                  backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                  borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
                }]}>
                  <Text style={[styles.cardLabel, { color: colors.primary }]}>AGE</Text>
                  <Text style={[styles.cardValue, { color: colors.text }]}>{profile?.age}</Text>
                </View>
                <View style={[styles.dataCard, { 
                  backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                  borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
                }]}>
                  <Text style={[styles.cardLabel, { color: colors.primary }]}>HEIGHT</Text>
                  <Text style={[styles.cardValue, { color: colors.text }]}>{profile?.height}<Text style={[styles.unit, { color: themeMode === 'dark' ? '#555' : '#999' }]}>cm</Text></Text>
                </View>
                <View style={[styles.dataCard, { 
                  backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                  borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
                }]}>
                  <Text style={[styles.cardLabel, { color: colors.primary }]}>WEIGHT</Text>
                  <Text style={[styles.cardValue, { color: colors.text }]}>{profile?.weight}<Text style={[styles.unit, { color: themeMode === 'dark' ? '#555' : '#999' }]}>kg</Text></Text>
                </View>
                <View style={[styles.dataCard, { 
                  backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                  borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
                }]}>
                  <Text style={[styles.cardLabel, { color: colors.primary }]}>TARGET</Text>
                  <Text style={[styles.cardValue, { color: colors.text }]}>{profile?.targetWeight}<Text style={[styles.unit, { color: themeMode === 'dark' ? '#555' : '#999' }]}>kg</Text></Text>
                </View>
              </View>

              <View style={[styles.wideCard, { 
                backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
              }]}>
                <Text style={[styles.cardLabel, { color: colors.primary }]}>DAILY TARGET</Text>
                <Text style={[styles.cardValue, styles.neonText, { color: colors.secondary }]}>{profile?.dailyCalorieTarget.toFixed(0)} <Text style={[styles.unit, { color: themeMode === 'dark' ? '#555' : '#999' }]}>kcal</Text></Text>
              </View>

              <View style={styles.macroGrid}>
                <View style={[styles.macroCard, { 
                  backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                  borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
                }]}>
                  <Text style={[styles.cardLabel, { color: colors.primary }]}>PROTEIN</Text>
                  <Text style={[styles.cardValue, { color: colors.text }]}>{profile?.dailyProteinTarget.toFixed(0)}<Text style={[styles.unit, { color: themeMode === 'dark' ? '#555' : '#999' }]}>g</Text></Text>
                </View>
                <View style={[styles.macroCard, { 
                  backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                  borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
                }]}>
                  <Text style={[styles.cardLabel, { color: colors.primary }]}>CARBS</Text>
                  <Text style={[styles.cardValue, { color: colors.text }]}>{profile?.dailyCarbsTarget.toFixed(0)}<Text style={[styles.unit, { color: themeMode === 'dark' ? '#555' : '#999' }]}>g</Text></Text>
                </View>
                <View style={[styles.macroCard, { 
                  backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                  borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
                }]}>
                  <Text style={[styles.cardLabel, { color: colors.primary }]}>FATS</Text>
                  <Text style={[styles.cardValue, { color: colors.text }]}>{profile?.dailyFatsTarget.toFixed(0)}<Text style={[styles.unit, { color: themeMode === 'dark' ? '#555' : '#999' }]}>g</Text></Text>
                </View>
              </View>

              <View style={[styles.infoRow, { borderBottomColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0' }]}>
                <Text style={[styles.infoLabel, { color: themeMode === 'dark' ? '#888' : '#999' }]}>Goal Type</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{profile?.goalType}</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0' }]}>
                <Text style={[styles.infoLabel, { color: themeMode === 'dark' ? '#888' : '#999' }]}>Activity Level</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{profile?.activityLevel}</Text>
              </View>
              {profile?.gender && (
                <View style={[styles.infoRow, { borderBottomColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0' }]}>
                  <Text style={[styles.infoLabel, { color: themeMode === 'dark' ? '#888' : '#999' }]}>Gender</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{profile.gender}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      <AlertComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  accentBar: {
    width: 40,
    height: 4,
    backgroundColor: '#8A2BE2',
    marginTop: 8,
    borderRadius: 2,
  },
  editBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  form: {
    marginTop: 10,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 15,
    letterSpacing: 1.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  highlightInput: {
    borderColor: '#8A2BE2',
    color: '#00D4FF',
    fontWeight: 'bold',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  radioButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  radioButtonSelected: {
    backgroundColor: '#8A2BE2',
    borderColor: '#8A2BE2',
  },
  radioText: {
    fontSize: 12,
    fontWeight: '600',
  },
  radioTextSelected: {
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
  },
  button: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#6200EE',
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  viewMode: {
    marginTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dataCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
  },
  wideCard: {
    width: '100%',
    padding: 25,
    borderRadius: 16,
    marginBottom: 25,
    borderWidth: 1,
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  neonText: {
    fontSize: 32,
  },
  unit: {
    fontSize: 14,
    fontWeight: '400',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
    marginBottom: 20,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 12,
  },
  macroCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
});