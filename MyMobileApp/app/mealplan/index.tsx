import { useCustomAlert } from '@/hooks/useCustomAlert';
import { useSettings } from '@/contexts/SettingsContext';
import { apiService } from '@/services/api';
import type { MealPlanResponse } from '@/types';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function MealPlanScreen() {
  const { colors, themeMode } = useSettings();
  const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { showAlert, AlertComponent } = useCustomAlert();

  useEffect(() => {
    loadMealPlan();
  }, []);

  const loadMealPlan = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMealPlan();
      setMealPlan(data);
    } catch (error: any) {
      setMealPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const data = await apiService.generateMealPlan();
      setMealPlan(data);
      showAlert('Success', 'Protocol generated successfully');

    } catch (error: any) {
      Alert.alert('Error', error.response?.data || error.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setGenerating(true);
      const data = await apiService.regenerateMealPlan();
      setMealPlan(data);
      showAlert('Success', 'Protocol updated');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data || error.message || 'Update failed');
    } finally {
      setGenerating(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMealPlan();
    setRefreshing(false);
  };

  const groupMealsByTypeAndOption = () => {
    if (!mealPlan) return {};
    // Group by meal type, then by option number
    const grouped: { [key: string]: { [option: number]: typeof mealPlan.meals } } = {};
    mealPlan.meals.forEach((item) => {
      if (!grouped[item.mealType]) grouped[item.mealType] = {};
      if (!grouped[item.mealType][item.optionNumber]) grouped[item.mealType][item.optionNumber] = [];
      grouped[item.mealType][item.optionNumber].push(item);
    });
    return grouped;
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const groupedMeals = groupMealsByTypeAndOption();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={themeMode === 'dark' ? "light-content" : "dark-content"} />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.secondary} />}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>NUTRITION</Text>
            <Text style={[styles.subtitle, { color: colors.primary }]}>DAILY PROTOCOL</Text>
          </View>
          {mealPlan && (
            <TouchableOpacity
              style={[styles.regenerateBadge, { 
                backgroundColor: themeMode === 'dark' ? '#1A1A2E' : '#F0F0F0',
                borderColor: themeMode === 'dark' ? '#333' : '#E0E0E0'
              }]}
              onPress={handleRegenerate}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator color={colors.secondary} size="small" />
              ) : (
                <Text style={[styles.regenerateText, { color: colors.secondary }]}>REGENERATE</Text>
              )}
            </TouchableOpacity>
          )}
          <AlertComponent />
        </View>

        {mealPlan ? (
          <>
            <View style={[styles.summaryCard, { 
              backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
              borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
            }]}>
              <View style={styles.summaryTop}>
                <Text style={[styles.summaryLabel, { color: colors.primary }]}>TOTAL ENERGY BUDGET</Text>
                <Text style={[styles.summaryValue, { color: colors.secondary }]}>
                  {(() => {
                    // Calculate total calories from option 1 of each meal type only
                    let total = 0;
                    Object.entries(groupedMeals).forEach(([mealType, options]) => {
                      const option1Meals = options[1] || [];
                      const optionCalories = option1Meals.reduce(
                        (sum, item) => sum + (item.meal.calories * item.meal.portionSize * item.portionMultiplier),
                        0
                      );
                      total += optionCalories;
                    });
                    return total.toFixed(0);
                  })()} <Text style={[styles.summaryUnit, { color: themeMode === 'dark' ? '#444' : '#999' }]}>KCAL</Text>
                </Text>
              </View>
              <View style={[styles.dateBadge, { backgroundColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0' }]}>
                <Text style={[styles.dateText, { color: themeMode === 'dark' ? '#AAA' : '#666' }]}>
                  {new Date(mealPlan.date).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric'
                  }).toUpperCase()}
                </Text>
              </View>
            </View>

            {Object.entries(groupedMeals).map(([mealType, options]) => (
              <View key={mealType} style={styles.mealTypeSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.dot} />
                  <Text style={[styles.mealTypeTitle, { color: themeMode === 'dark' ? '#555' : '#999' }]}>{mealType.toUpperCase()}</Text>
                </View>

                {/* Display 3 options */}
                {[1, 2, 3].map((optionNum) => {
                  const optionMeals = options[optionNum] || [];
                  if (optionMeals.length === 0) return null;

                  const optionCalories = optionMeals.reduce(
                    (sum, item) => sum + (item.meal.calories * item.meal.portionSize * item.portionMultiplier),
                    0
                  );

                  return (
                    <View key={`${mealType}-option-${optionNum}`} style={[styles.optionCard, { 
                      backgroundColor: themeMode === 'dark' ? '#0A0A14' : '#F5F5F5',
                      borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
                    }]}>
                      <View style={[styles.optionHeader, { borderBottomColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0' }]}>
                        <Text style={[styles.optionLabel, { color: colors.primary }]}>OPTION {optionNum}</Text>
                        <Text style={[styles.optionCalories, { color: colors.secondary }]}>{optionCalories.toFixed(0)} KCAL</Text>
                      </View>

                      {optionMeals.map((item) => (
                        <View key={item.mealPlanItemId} style={[styles.mealCard, { 
                          backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#FFFFFF',
                          borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
                        }]}>
                          <View style={styles.mealMainInfo}>
                            <Text style={[styles.mealName, { color: colors.text }]}>{item.meal.name}</Text>
                            <Text style={[styles.mealCalories, { color: colors.secondary }]}>
                              {(item.meal.calories * item.meal.portionSize * item.portionMultiplier).toFixed(0)} KCAL
                            </Text>
                          </View>
                          
                          <View style={[styles.macroStrip, { backgroundColor: themeMode === 'dark' ? '#050508' : '#F0F0F0' }]}>
                            <View style={styles.macroItem}>
                              <Text style={[styles.macroLabel, { color: colors.primary }]}>P</Text>
                              <Text style={[styles.macroValue, { color: colors.text }]}>{(item.meal.protein * item.meal.portionSize * item.portionMultiplier).toFixed(0)}g</Text>
                            </View>
                            <View style={styles.macroItem}>
                              <Text style={[styles.macroLabel, { color: colors.primary }]}>C</Text>
                              <Text style={[styles.macroValue, { color: colors.text }]}>{(item.meal.carbs * item.meal.portionSize * item.portionMultiplier).toFixed(0)}g</Text>
                            </View>
                            <View style={styles.macroItem}>
                              <Text style={[styles.macroLabel, { color: colors.primary }]}>F</Text>
                              <Text style={[styles.macroValue, { color: colors.text }]}>{(item.meal.fats * item.meal.portionSize * item.portionMultiplier).toFixed(0)}g</Text>
                            </View>
                            {item.portionMultiplier !== 1 && (
                              <View style={[styles.portionBadge, { backgroundColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0' }]}>
                                <Text style={styles.portionText}>{item.portionMultiplier.toFixed(1)}X</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  );
                })}
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { 
              backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
              borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
            }]}>
              <Text style={styles.emptyIcon}>📂</Text>
            </View>
            <Text style={[styles.emptyText, { color: colors.text }]}>NO PROTOCOL ACTIVE</Text>
            <Text style={[styles.emptySubtext, { color: themeMode === 'dark' ? '#666' : '#999' }]}>
              Initialize your AI-driven nutrition schedule based on your current biometrics.
            </Text>
            <TouchableOpacity
              style={[styles.generateButtonLarge, { 
                backgroundColor: colors.primary,
                shadowColor: colors.primary
              }]}
              onPress={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.generateButtonText}>GENERATE PROTOCOL</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  regenerateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  regenerateText: {
    fontSize: 10,
    fontWeight: '800',
  },
  summaryCard: {
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 30,
  },
  summaryTop: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 42,
    fontWeight: '900',
  },
  summaryUnit: {
    fontSize: 14,
  },
  dateBadge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 15,
  },
  dateText: {
    fontSize: 10,
    fontWeight: '700',
  },
  mealTypeSection: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8A2BE2',
    marginRight: 10,
  },
  mealTypeTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  optionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  optionLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  optionCalories: {
    fontSize: 14,
    fontWeight: '900',
  },
  mealCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  mealMainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  mealCalories: {
    fontSize: 14,
    fontWeight: '900',
  },
  macroStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 15,
  },
  macroLabel: {
    fontSize: 9,
    fontWeight: '900',
    marginRight: 4,
  },
  macroValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  portionBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  portionText: {
    color: '#FBC02D',
    fontSize: 9,
    fontWeight: '900',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 30,
    lineHeight: 20,
  },
  generateButtonLarge: {
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  generateButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});