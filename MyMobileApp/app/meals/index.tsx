import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { apiService } from '@/services/api';
import type { MealLogResponse } from '@/types';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import CustomAlert from '@/components/CustomAlert';

export default function MealsScreen() {
  const { colors, themeMode } = useSettings();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayLogs, setTodayLogs] = useState<MealLogResponse[]>([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [pendingMealName, setPendingMealName] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const today = new Date().toLocaleDateString('en-CA');
      const logs = await apiService.getDailyLogs(today);
      setTodayLogs(logs);
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  useFocusEffect(useCallback(() => { loadData(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const showDeleteCustomAlert = (mealLogId: number, mealName: string) => {
    setPendingMealName(mealName);
    setPendingDeleteId(mealLogId);
    setAlertVisible(true);
  };

  const handleDeleteMeal = async (mealLogId: number) => {
    try {
      await apiService.deleteMealLog(mealLogId);
      setTodayLogs((prev) => prev.filter((l) => l.mealLogId !== mealLogId));
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete meal.');
    }
  };

  const totalCal = todayLogs.reduce((s, l) => s + l.loggedCalories, 0);
  const totalProtein = todayLogs.reduce((s, l) => s + (l.loggedProtein || 0), 0);
  const totalCarbs = todayLogs.reduce((s, l) => s + (l.loggedCarbs || 0), 0);
  const totalFats = todayLogs.reduce((s, l) => s + (l.loggedFats || 0), 0);

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  const dateStr = new Date()
    .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={themeMode === 'dark' ? "light-content" : "dark-content"} />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.secondary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.subtitle, { color: colors.primary }]}>FOOD LOG</Text>
              <Text style={[styles.title, { color: colors.text }]}>TODAYS MEALS</Text>
              <Text style={[styles.date, { color: themeMode === 'dark' ? '#5A5A7A' : '#999' }]}>{dateStr}</Text>
            </View>
            <TouchableOpacity style={[styles.logButton, { borderColor: colors.secondary }]} onPress={() => router.push('/meals/log')}>
              <Text style={[styles.logButtonText, { color: colors.secondary }]}>+ LOG</Text>
            </TouchableOpacity>
          </View>

          {/* Summary Stats */}
          <View style={[styles.statsCard, { 
            backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
            borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
          }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>TOTAL CALORIES</Text>
              <Text style={[styles.statValue, { color: colors.secondary }]}>{totalCal.toFixed(0)}</Text>
              <Text style={[styles.statUnit, { color: themeMode === 'dark' ? '#444' : '#999' }]}>KCAL</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0' }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>PROTEIN</Text>
              <Text style={[styles.statValue, { color: '#FF6B6B' }]}>{totalProtein.toFixed(0)}</Text>
              <Text style={[styles.statUnit, { color: themeMode === 'dark' ? '#444' : '#999' }]}>G</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0' }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>CARBS</Text>
              <Text style={[styles.statValue, { color: '#4ECDC4' }]}>{totalCarbs.toFixed(0)}</Text>
              <Text style={[styles.statUnit, { color: themeMode === 'dark' ? '#444' : '#999' }]}>G</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0' }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>FATS</Text>
              <Text style={[styles.statValue, { color: '#FFE66D' }]}>{totalFats.toFixed(0)}</Text>
              <Text style={[styles.statUnit, { color: themeMode === 'dark' ? '#444' : '#999' }]}>G</Text>
            </View>
          </View>

          {/* Meals List */}
          {todayLogs.length === 0 ? (
            <View style={[styles.emptyContainer, { 
              backgroundColor: themeMode === 'dark' ? '#0A0A18' : '#F5F5F5',
              borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
            }]}>
              <Text style={[styles.emptyIcon, { color: themeMode === 'dark' ? '#1A1A2E' : '#CCC' }]}>🍽️</Text>
              <Text style={[styles.emptyText, { color: themeMode === 'dark' ? '#4A4A6A' : '#999' }]}>No meals logged today</Text>
              <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.secondary }]} onPress={() => router.push('/meals/log')}>
                <Text style={styles.emptyButtonText}>LOG YOUR FIRST MEAL</Text>
              </TouchableOpacity>
            </View>
          ) : (
            todayLogs.map((log) => (
              <MealRow 
                key={log.mealLogId} 
                log={log} 
                onDelete={handleDeleteMeal} 
                onShowCustomAlert={showDeleteCustomAlert}
                colors={colors}
                themeMode={themeMode}
              />
            ))
          )}
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title="Remove Entry"
        message={`Delete "${pendingMealName}" from today's log?`}
        type="warning"
        onClose={() => {
          setAlertVisible(false);
          setPendingDeleteId(null);
          setPendingMealName('');
        }}
        buttons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setAlertVisible(false);
              setPendingDeleteId(null);
              setPendingMealName('');
            },
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              if (pendingDeleteId) handleDeleteMeal(pendingDeleteId);
              setAlertVisible(false);
              setPendingDeleteId(null);
              setPendingMealName('');
            },
          },
        ]}
        themeMode={themeMode}
      />
    </View>
  );
}

// Meal Row Component
function MealRow({
  log,
  onDelete,
  onShowCustomAlert,
  colors,
  themeMode,
}: {
  log: MealLogResponse;
  onDelete: (id: number) => void;
  onShowCustomAlert: (id: number, mealName: string) => void;
  colors: any;
  themeMode: 'dark' | 'light';
}) {
  const handleDelete = () => {
    const mealName = (log as any).mealName || (log.isFromAI ? 'AI Scan' : 'Manual Entry');
    onShowCustomAlert(log.mealLogId, mealName);
  };

  const mealName = (log as any).mealName || (log.isFromAI ? 'AI Scan' : 'Manual Entry');
  const timeStr = typeof log.time === 'string' ? log.time.substring(0, 5) : '—';

  return (
    <View style={[styles.mealRow, { 
      backgroundColor: themeMode === 'dark' ? '#0A0A18' : '#F5F5F5',
      borderColor: themeMode === 'dark' ? '#1E1E40' : '#E0E0E0'
    }]}>
      <LinearGradient
        colors={['#00D4FF', '#8A2BE2']}
        style={styles.leftAccent}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <View style={styles.mealInfo}>
        <View style={styles.mealTopRow}>
          <Text style={[styles.mealName, { color: colors.text }]} numberOfLines={1}>{mealName}</Text>
          <Text style={[styles.mealTime, { color: themeMode === 'dark' ? '#5A5A7A' : '#999' }]}>◷ {timeStr}</Text>
        </View>
        <View style={styles.mealMacroRow}>
          <Text style={[styles.mealCal, { color: colors.secondary }]}>{log.loggedCalories.toFixed(0)} kcal</Text>
          {log.loggedProtein != null && (
            <Text style={[styles.macroTag, { color: '#FF6B6B' }]}>P {log.loggedProtein.toFixed(0)}g</Text>
          )}
          {log.loggedCarbs != null && (
            <Text style={[styles.macroTag, { color: '#4ECDC4' }]}>C {log.loggedCarbs.toFixed(0)}g</Text>
          )}
          {log.loggedFats != null && (
            <Text style={[styles.macroTag, { color: '#FFE66D' }]}>F {log.loggedFats.toFixed(0)}g</Text>
          )}
          {log.isFromAI && (
            <LinearGradient colors={['#8A2BE2', '#00D4FF']} style={styles.aiTagGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.aiTag}>⚡ AI</Text>
            </LinearGradient>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteIcon}>✕</Text>
      </TouchableOpacity>
    </View>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '900',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  logButton: {
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  logButtonText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  statUnit: {
    fontSize: 8,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    marginHorizontal: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    paddingLeft: 18,
    marginBottom: 10,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  leftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  mealInfo: {
    flex: 1,
  },
  mealTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  mealName: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  mealTime: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  mealMacroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  mealCal: {
    fontSize: 12,
    fontWeight: '800',
  },
  macroTag: {
    fontSize: 10,
    fontWeight: '800',
  },
  aiTagGradient: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiTag: {
    fontSize: 8,
    color: '#FFF',
    fontWeight: '900',
    letterSpacing: 1,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,59,48,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '900',
  },
});