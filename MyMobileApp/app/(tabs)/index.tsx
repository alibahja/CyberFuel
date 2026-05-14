import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { apiService } from '@/services/api';
import type { MealLogResponse, MealPlanResponse, ProgressSummary } from '@/types';
import { useFocusEffect, useRouter } from 'expo-router';
import CustomAlert from '@/components/CustomAlert';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Animated Progress Bar ───────────────────────────────────────────────────

function AnimatedBar({
  progress,
  color,
  height = 4,
  style,
  colors,
  themeMode,
}: {
  progress: number;
  color: string;
  height?: number;
  style?: any;
  colors: any;
  themeMode: 'dark' | 'light';
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: Math.min(progress, 100),
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
  }, [progress]);

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[{ height, backgroundColor: themeMode === 'dark' ? '#0D0D1F' : '#E0E0E0', borderRadius: height / 2, overflow: 'hidden' }, style]}>
      <Animated.View
        style={{
          height: '100%',
          width,
          backgroundColor: color,
          borderRadius: height / 2,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: 6,
        }}
      />
    </View>
  );
}

// ─── Macro Chip ───────────────────────────────────────────────────────────────

function MacroChip({
  label,
  value,
  target,
  color,
  unit = 'g',
  colors,
  themeMode,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
  unit?: string;
  colors: any;
  themeMode: 'dark' | 'light';
}) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  return (
    <LinearGradient
      colors={themeMode === 'dark' ? ['#0C0C1E', '#080814'] : ['#F5F5F5', '#EBEBEB']}
      style={[chipStyles.container, { borderColor: color + '40' }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={chipStyles.top}>
        <Text style={[chipStyles.label, {
          color,
          textShadowColor: color,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 6,
        }]}>{label}</Text>
        <Text style={[chipStyles.pct, { color: color + 'DD' }]}>{pct.toFixed(0)}%</Text>
      </View>
      <AnimatedBar progress={pct} color={color} height={3} style={{ marginBottom: 8 }} colors={colors} themeMode={themeMode} />
      <Text style={[chipStyles.value, { color: themeMode === 'dark' ? '#FFF' : '#000' }]}>
        {value.toFixed(0)}
        <Text style={[chipStyles.target, { color: themeMode === 'dark' ? '#3A3A5A' : '#999' }]}>/{target.toFixed(0)}{unit}</Text>
      </Text>
    </LinearGradient>
  );
}

const chipStyles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  pct: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    fontWeight: '900',
    textShadowColor: 'rgba(0,212,255,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  target: {
    fontSize: 9,
    fontWeight: '700',
  },
});

// ─── Quick Action Card ────────────────────────────────────────────────────────

function ActionCard({
  icon,
  label,
  onPress,
  accent = false,
  accentColor = '#00D4FF',
  colors,
  themeMode,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  accent?: boolean;
  accentColor?: string;
  colors: any;
  themeMode: 'dark' | 'light';
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const cardWidth = (SCREEN_WIDTH - 48 - 16) / 3;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, tension: 200 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200 }).start();

  return (
    <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1}>
      <Animated.View
        style={[
          actionStyles.card,
          { width: cardWidth, height: cardWidth, backgroundColor: themeMode === 'dark' ? '#0A0A18' : '#F5F5F5' },
          accent && {
            borderColor: accentColor + '80',
            shadowColor: accentColor,
            shadowOpacity: 0.5,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 0 },
          },
          !accent && { borderColor: themeMode === 'dark' ? '#1A1A3E' : '#E0E0E0' },
          { transform: [{ scale }] },
        ]}
      >
        {accent && (
          <LinearGradient
            colors={[accentColor + '15', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        )}
        <Text style={[
          actionStyles.icon,
          accent && {
            textShadowColor: accentColor,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 10,
          },
        ]}>{icon}</Text>
        <Text style={[
          actionStyles.label,
          accent
            ? { color: accentColor, textShadowColor: accentColor, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 }
            : { color: themeMode === 'dark' ? '#5A5A7A' : '#999' },
        ]}>{label}</Text>
        {accent && (
          <View style={[actionStyles.glowDot, {
            backgroundColor: accentColor,
            shadowColor: accentColor,
            shadowOpacity: 1,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 0 },
          }]} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const actionStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  icon: { fontSize: 24 },
  label: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  glowDot: {
    position: 'absolute',
    bottom: 7,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

// ─── Meal Row ─────────────────────────────────────────────────────────────────

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
  const slideAnim = useRef(new Animated.Value(1)).current;
  

  const handleDelete = () => {
    const mealName = (log as any).mealName || (log.isFromAI ? 'AI Scan' : 'Manual Entry');
    onShowCustomAlert(log.mealLogId, mealName);
  };

  const mealName = (log as any).mealName || (log.isFromAI ? 'AI Scan' : 'Manual Entry');
  const timeStr = typeof log.time === 'string' ? log.time.substring(0, 5) : '—';

  return (
    <Animated.View style={[mealStyles.row, { opacity: slideAnim, transform: [{ scaleY: slideAnim }], backgroundColor: themeMode === 'dark' ? '#0A0A18' : '#F5F5F5', borderColor: themeMode === 'dark' ? '#1E1E40' : '#E0E0E0' }]}>
      {/* Subtle gradient background */}
      <LinearGradient
        colors={themeMode === 'dark' ? ['#00D4FF08', '#8A2BE208'] : ['#00D4FF10', '#8A2BE210']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {/* Left accent bar */}
      <LinearGradient
        colors={['#00D4FF', '#8A2BE2']}
        style={mealStyles.leftAccent}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <View style={mealStyles.dot} />
      <View style={mealStyles.info}>
        <View style={mealStyles.topRow}>
          <Text style={[mealStyles.name, { color: themeMode === 'dark' ? '#E8E8FF' : '#000' }]} numberOfLines={1}>{mealName}</Text>
          <Text style={[mealStyles.time, { color: themeMode === 'dark' ? '#5A5A7A' : '#999' }]}>◷ {timeStr}</Text>
        </View>
        <View style={mealStyles.macroRow}>
          <Text style={mealStyles.cal}>{log.loggedCalories.toFixed(0)} kcal</Text>
          {log.loggedProtein != null && (
            <Text style={[mealStyles.macroTag, { color: '#FF6B6B', textShadowColor: '#FF6B6B', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 }]}>P {log.loggedProtein.toFixed(0)}g</Text>
          )}
          {log.loggedCarbs != null && (
            <Text style={[mealStyles.macroTag, { color: '#4ECDC4', textShadowColor: '#4ECDC4', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 }]}>C {log.loggedCarbs.toFixed(0)}g</Text>
          )}
          {log.loggedFats != null && (
            <Text style={[mealStyles.macroTag, { color: '#FFE66D', textShadowColor: '#FFE66D', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 }]}>F {log.loggedFats.toFixed(0)}g</Text>
          )}
          {log.isFromAI && (
            <LinearGradient colors={['#8A2BE2', '#00D4FF']} style={mealStyles.aiTagGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={mealStyles.aiTag}>⚡ AI</Text>
            </LinearGradient>
          )}
        </View>
      </View>
      <TouchableOpacity style={mealStyles.deleteBtn} onPress={handleDelete}>
        <Text style={mealStyles.deleteIcon}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const mealStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    paddingLeft: 18,
    marginBottom: 8,
    borderWidth: 1,
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  leftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00D4FF',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  info: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  cal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00D4FF',
    textShadowColor: '#00D4FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  macroTag: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  aiTagGradient: {
    paddingHorizontal: 5,
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
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,59,48,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  deleteIcon: {
    color: '#FF3B30',
    fontSize: 10,
    fontWeight: '900',
    textShadowColor: '#FF3B30',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ label, action, onAction, colors }: { label: string; action?: string; onAction?: () => void; colors: any }) {
  return (
    <View style={secStyles.row}>
      <View style={secStyles.labelWrap}>
        <LinearGradient
          colors={['#00D4FF', '#8A2BE2']}
          style={secStyles.labelAccent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <Text style={[secStyles.label, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      {action && onAction && (
        <TouchableOpacity onPress={onAction} style={secStyles.actionBtn}>
          <Text style={secStyles.action}>{action} ⟼</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const secStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  labelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelAccent: {
    width: 3,
    height: 14,
    borderRadius: 2,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2.5,
    textShadowColor: 'rgba(0,212,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  actionBtn: {
    backgroundColor: '#00D4FF15',
    borderWidth: 1,
    borderColor: '#00D4FF40',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  action: {
    fontSize: 9,
    color: '#00D4FF',
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: '#00D4FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { user, profile, logout } = useAuth();
  const { colors, convertWeight, convertCalories, convertMacro, themeMode } = useSettings();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayLogs, setTodayLogs] = useState<MealLogResponse[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [pendingMealName, setPendingMealName] = useState<string>('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const hasAnimated = useRef(false);

  const animateIn = () => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
    ]).start();
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const today = new Date().toLocaleDateString('en-CA');
      const [logs, plan, progressData] = await Promise.allSettled([
        apiService.getDailyLogs(today),
        apiService.getMealPlan(),
        apiService.getProgressSummary(),
      ]);
      if (logs.status === 'fulfilled') setTodayLogs(logs.value);
      if (plan.status === 'fulfilled') setMealPlan(plan.value);
      if (progressData.status === 'fulfilled') setProgress(progressData.value);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      animateIn();
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

  const calTarget = profile?.dailyCalorieTarget ?? 2000;
  const calPct = Math.min((totalCal / calTarget) * 100, 100);

  const getMacroTargets = () => {
    if (!profile) return { protein: 150, carbs: 200, fats: 60 };
    const proteinTarget = profile.weight * 1.0;
    const proteinCal = proteinTarget * 4;
    const remaining = profile.dailyCalorieTarget - proteinCal;
    return {
      protein: proteinTarget,
      carbs: (remaining * 0.5) / 4,
      fats: (remaining * 0.3) / 9,
    };
  };

  const macroTargets = getMacroTargets();
  const ringColor = calPct >= 100 ? '#FF3B30' : calPct >= 75 ? '#FFE66D' : '#00D4FF';

  if (loading) {
    return (
      <LinearGradient colors={themeMode === 'dark' ? ['#050508', '#0A0A18'] : ['#FFFFFF', '#F5F5F5']} style={styles.loader}>
        <ActivityIndicator size="large" color="#00D4FF" />
        <Text style={[styles.loaderText, { color: '#00D4FF' }]}>INITIALIZING SYSTEM...</Text>
        <View style={styles.loaderDots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.loaderDot, { opacity: 0.3 + i * 0.3 }]} />
          ))}
        </View>
      </LinearGradient>
    );
  }

  const dateStr = new Date()
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    .toUpperCase();

  const totalDelta = progress?.totalChange ?? 0;
  const deltaColor = totalDelta < 0 ? '#00D4FF' : totalDelta > 0 ? '#FF3B30' : '#5A5A7A';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00D4FF" />}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle={themeMode === 'dark' ? "light-content" : "dark-content"} />

      {/* Full-page background gradient */}
      <LinearGradient
        colors={themeMode === 'dark' ? ['#060610', '#050508'] : ['#FFFFFF', '#F5F5F5']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.dateStr, { color: themeMode === 'dark' ? '#5A5A7A' : '#999' }]}>◈ {dateStr}</Text>
            <Text style={[styles.greeting, { color: themeMode === 'dark' ? '#F0F0FF' : '#000', textShadowColor: themeMode === 'dark' ? 'rgba(0,212,255,0.25)' : 'rgba(0,212,255,0.1)' }]}>
              {user?.fullName?.split(' ')[0]?.toUpperCase() || 'USER'}
            </Text>
            <LinearGradient
              colors={['#00D4FF', '#8A2BE200']}
              style={styles.greetingUnderline}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <TouchableOpacity onPress={logout} activeOpacity={0.8}>
            <View style={styles.logoutBtn}>
              <LinearGradient
                colors={themeMode === 'dark' ? ['#1A0000', '#2A0000'] : ['#FFE5E5', '#FFCCCC']}
                style={styles.logoutGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.logoutText}>⏻ EXIT</Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── STATUS BAR (decorative) ── */}
        <View style={styles.statusBar}>
          <View style={styles.statusDot} />
          <Text style={[styles.statusText, { color: '#00FF88', textShadowColor: '#00FF88' }]}>SYSTEM ONLINE</Text>
          <View style={[styles.statusLine, { backgroundColor: themeMode === 'dark' ? '#1A1A3E' : '#E0E0E0' }]} />
          <Text style={[styles.statusUser, { color: themeMode === 'dark' ? '#3A3A5A' : '#999' }]}>UID:{user?.fullName?.slice(0, 4).toUpperCase() || '????'}</Text>
        </View>

        {/* ── PROFILE ALERT ── */}
        {!profile && (
          <TouchableOpacity style={[styles.alertCard, { backgroundColor: themeMode === 'dark' ? '#0C0C1A' : '#FFF', borderColor: '#FFE66D40' }]} onPress={() => router.push('/profile')}>
            <View style={[styles.alertIconWrap, { backgroundColor: '#FFE66D20', borderColor: '#FFE66D50' }]}>
              <Text style={styles.alertIcon}>⚠</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.alertTitle, { color: '#FFE66D', textShadowColor: '#FFE66D' }]}>SETUP REQUIRED</Text>
              <Text style={[styles.alertSub, { color: themeMode === 'dark' ? '#6A6A8A' : '#666' }]}>Complete your biometric profile to unlock AI planning.</Text>
            </View>
            <Text style={[styles.alertArrow, { color: '#FFE66D' }]}>⟼</Text>
          </TouchableOpacity>
        )}

        {/* ── CALORIE CARD ── */}
        {profile && (
          <LinearGradient
            colors={themeMode === 'dark' ? ['#0C0C1E', '#080812'] : ['#F5F5F5', '#EBEBEB']}
            style={[styles.calorieCard, { borderColor: themeMode === 'dark' ? '#1E1E40' : '#E0E0E0' }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Corner accent */}
            <LinearGradient
              colors={[ringColor + '60', 'transparent']}
              style={styles.calorieCorner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <View style={styles.calorieTop}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardMicro, {
                  color: ringColor,
                  textShadowColor: ringColor,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 6,
                }]}>◈ DAILY FUEL INTAKE ◈</Text>
                <Text style={[styles.calorieNum, {
                  color: ringColor,
                  textShadowColor: ringColor,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 3,
                }]}>
                  {totalCal.toFixed(0)}
                  <Text style={[styles.calorieOf, { color: themeMode === 'dark' ? '#6A6AFF' : '#8A8AFF' }]}> / {calTarget.toFixed(0)}</Text>
                </Text>
                <Text style={[styles.calorieSub, { color: themeMode === 'dark' ? '#2A2A4A' : '#CCC' }]}>KCAL CONSUMED TODAY</Text>
              </View>

              {/* Ring */}
              <View style={styles.ringWrap}>
                <View style={[styles.ringOuter, { borderColor: ringColor + '25', shadowColor: ringColor }]}>
                  <View style={[styles.ring, { borderColor: ringColor + '60' }]}>
                    <View style={[styles.ringInner, {
                      borderColor: ringColor,
                      shadowColor: ringColor,
                      shadowOpacity: 0.8,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 0 },
                    }]}>
                      <Text style={[styles.ringPct, {
                        color: ringColor,
                        textShadowColor: ringColor,
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 8,
                      }]}>{calPct.toFixed(0)}</Text>
                      <Text style={[styles.ringSymbol, { color: ringColor + 'BB' }]}>%</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <AnimatedBar progress={calPct} color={ringColor} height={5} style={{ marginBottom: 20 }} colors={colors} themeMode={themeMode} />

            <View style={styles.macroChipRow}>
              <MacroChip label="PROTEIN" value={totalProtein} target={macroTargets.protein} color="#FF6B6B" colors={colors} themeMode={themeMode} />
              <View style={{ width: 8 }} />
              <MacroChip label="CARBS" value={totalCarbs} target={macroTargets.carbs} color="#4ECDC4" colors={colors} themeMode={themeMode} />
              <View style={{ width: 8 }} />
              <MacroChip label="FATS" value={totalFats} target={macroTargets.fats} color="#FFE66D" colors={colors} themeMode={themeMode} />
            </View>
          </LinearGradient>
        )}

        {/* ── QUICK ACTIONS ── */}
        <View style={styles.section}>
          <SectionHeader label="COMMANDS" colors={colors} />
          <View style={styles.actionGrid}>
            <ActionCard icon="🍴" label="LOG MEAL" onPress={() => router.push('/meals/log')} accent accentColor="#00D4FF" colors={colors} themeMode={themeMode} />
            <ActionCard icon="👁️" label="SCAN PHOTO" onPress={() => router.push('/photo')} accent accentColor="#8A2BE2" colors={colors} themeMode={themeMode} />
            <ActionCard icon="⚖️" label="SYNC WEIGHT" onPress={() => router.push('/progress/log')} colors={colors} themeMode={themeMode} />
            <ActionCard icon="📅" label="MEAL PLAN" onPress={() => router.push('/mealplan')} colors={colors} themeMode={themeMode} />
            <ActionCard icon="📊" label="PROGRESS" onPress={() => router.push('/progress')} colors={colors} themeMode={themeMode} />
            <ActionCard icon="👤" label="PROFILE" onPress={() => router.push('/profile')} colors={colors} themeMode={themeMode} />
          </View>
        </View>

        {/* ── WEIGHT STRIP ── */}
        {progress?.currentWeight && (
          <LinearGradient
            colors={themeMode === 'dark' ? ['#0C0C1E', '#080812'] : ['#F5F5F5', '#EBEBEB']}
            style={[styles.weightStrip, { borderColor: themeMode === 'dark' ? '#1E1E40' : '#E0E0E0' }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.weightItem}>
              <Text style={[styles.weightLabel, { color: themeMode === 'dark' ? '#4A4A6A' : '#999' }]}>MASS</Text>
              <Text style={[styles.weightValue, {
                color: '#00D4FF',
                textShadowColor: '#00D4FF',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 5,
              }]}>
                {convertWeight(progress.currentWeight.weight).value.toFixed(1)}
                <Text style={[styles.weightUnit, { color: themeMode === 'dark' ? '#4A4A6A' : '#999' }]}> {convertWeight(progress.currentWeight.weight).unit}</Text>
              </Text>
            </View>
            <View style={[styles.weightDivider, { backgroundColor: themeMode === 'dark' ? '#1A1A3E' : '#E0E0E0' }]} />
            <View style={styles.weightItem}>
              <Text style={[styles.weightLabel, { color: themeMode === 'dark' ? '#4A4A6A' : '#999' }]}>DELTA</Text>
              <Text style={[styles.weightValue, {
                color: deltaColor,
                textShadowColor: deltaColor,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 4,
              }]}>
                {totalDelta > 0 ? '+' : ''}{convertWeight(totalDelta).value.toFixed(1)}
                <Text style={[styles.weightUnit, { color: themeMode === 'dark' ? '#4A4A6A' : '#999' }]}> {convertWeight(totalDelta).unit}</Text>
              </Text>
            </View>
            <View style={[styles.weightDivider, { backgroundColor: themeMode === 'dark' ? '#1A1A3E' : '#E0E0E0' }]} />
            <View style={styles.weightItem}>
              <Text style={[styles.weightLabel, { color: themeMode === 'dark' ? '#4A4A6A' : '#999' }]}>TREND</Text>
              <Text style={[styles.weightValue, {
                color: '#8A2BE2',
                fontSize: 11,
                textShadowColor: '#8A2BE2',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 5,
              }]}>
                {progress.trend?.toUpperCase() ?? '—'}
              </Text>
            </View>
          </LinearGradient>
        )}

        {/* ── TODAY'S MEALS ── */}
        {/* ── TODAY'S MEALS ── */}
<View style={styles.section}>
  <SectionHeader
    label="TODAY'S LOG"
    action={todayLogs.length > 0 ? 'ALL MEALS' : undefined}
    onAction={() => router.push('/meals')}
    colors={colors}
  />

  {todayLogs.length === 0 ? (
    <View style={[styles.emptyMeals, { backgroundColor: themeMode === 'dark' ? '#0A0A18' : '#F5F5F5', borderColor: '#00D4FF25' }]}>
      <LinearGradient
        colors={['#00D4FF10', 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => router.push('/meals/log')}>
        <Text style={[styles.emptyMealsIcon, { color: '#00D4FF', textShadowColor: '#00D4FF' }]}>◈</Text>
        <Text style={[styles.emptyMealsText, { color: themeMode === 'dark' ? '#4A4A6A' : '#999' }]}>No meals logged today.</Text>
        <LinearGradient
          colors={['#00D4FF', '#8A2BE2']}
          style={styles.emptyCtaBtn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.emptyMealsCta}>⟼ TAP TO LOG YOUR FIRST MEAL</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  ) : (
    <>
      {todayLogs.slice(0, 4).map((log) => (
        <MealRow 
          key={log.mealLogId} 
          log={log} 
          onDelete={handleDeleteMeal} 
          onShowCustomAlert={showDeleteCustomAlert}
          colors={colors}
          themeMode={themeMode}
        />
      ))}
     
    </>
  )}
</View>

        {/* ── SYSTEM MENU ── */}
        <View style={[styles.menuSection, { borderTopColor: themeMode === 'dark' ? '#1A1A3E' : '#E0E0E0' }]}>
          <SectionHeader label="SYSTEM" colors={colors} />
          {[
            { label: 'DIETARY PREFERENCES', path: '/preferences', icon: '⚙' },
            { label: 'CORE SETTINGS', path: '/settings', icon: '◈' },
          ].map((item) => (
            <TouchableOpacity
              key={item.path}
              style={[styles.menuItem, { borderBottomColor: themeMode === 'dark' ? '#0E0E2A' : '#F0F0F0' }]}
              onPress={() => router.push(item.path as any)}
            >
              <View style={styles.menuLeft}>
                <Text style={[styles.menuIcon, { color: '#00D4FF', textShadowColor: '#00D4FF' }]}>{item.icon}</Text>
                <Text style={[styles.menuText, { color: themeMode === 'dark' ? '#6A6A9A' : '#666' }]}>{item.label}</Text>
              </View>
              <Text style={[styles.menuArrow, { color: '#00D4FF', textShadowColor: '#00D4FF' }]}>⟼</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Alert */}
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
      </Animated.View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  loaderText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
    textShadowColor: '#00D4FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  loaderDots: {
    flexDirection: 'row',
    gap: 6,
  },
  loaderDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#00D4FF',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  content: {
    padding: 24,
    paddingTop: 56,
    paddingBottom: 48,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dateStr: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  greetingUnderline: {
    width: 50,
    height: 2,
    borderRadius: 1,
    marginTop: 5,
  },
  logoutBtn: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FF3B30',
    overflow: 'hidden',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  logoutGradient: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: '#FF3B30',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

  // Status bar (decorative)
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 22,
    paddingHorizontal: 2,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#00FF88',
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  viewAllButton: {
  marginTop: 12,
  paddingVertical: 12,
  alignItems: 'center',
  borderTopWidth: 1,
  borderTopColor: '#1A1A3E',
},
viewAllText: {
  fontSize: 11,
  fontWeight: '900',
  letterSpacing: 1,
},
  statusText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  statusLine: {
    flex: 1,
    height: 1,
  },
  statusUser: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Alert
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#FFE66D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  alertIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertIcon: {
    fontSize: 14,
    color: '#FFE66D',
  },
  alertTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  alertSub: {
    fontSize: 11,
    fontWeight: '600',
  },
  alertArrow: {
    fontSize: 16,
    fontWeight: '900',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },

  // Calorie Card
  calorieCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  calorieCorner: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 80,
    height: 80,
    borderTopLeftRadius: 20,
  },
  calorieTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardMicro: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  calorieNum: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
  },
  calorieOf: {
    fontSize: 16,
    fontWeight: '700',
  },
  calorieSub: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 6,
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  ring: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPct: {
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
  },
  ringSymbol: {
    fontSize: 8,
    fontWeight: '700',
  },
  macroChipRow: {
    flexDirection: 'row',
  },

  // Actions
  section: {
    marginBottom: 28,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  // Weight strip
  weightStrip: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 28,
    overflow: 'hidden',
  },
  weightItem: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
  },
  weightDivider: {
    width: 1,
  },
  weightLabel: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 6,
  },
  weightValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  weightUnit: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Empty meals
  emptyMeals: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 36,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  emptyMealsIcon: {
    fontSize: 30,
    marginBottom: 12,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  emptyMealsText: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  emptyCtaBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyMealsCta: {
    fontSize: 9,
    color: '#FFF',
    fontWeight: '900',
    letterSpacing: 1,
  },

  // Menu
  menuSection: {
    borderTopWidth: 1,
    paddingTop: 24,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuIcon: {
    fontSize: 12,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  menuText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  menuArrow: {
    fontSize: 16,
    fontWeight: '900',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
});