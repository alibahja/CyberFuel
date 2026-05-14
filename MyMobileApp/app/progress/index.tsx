import { useCustomAlert } from '@/hooks/useCustomAlert';
import { useSettings } from '@/contexts/SettingsContext';
import { apiService } from '@/services/api';
import type { ProgressSummary, WeightLogResponse } from '@/types';
import { useFocusEffect, useRouter } from 'expo-router';
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
import Svg, { Circle, Defs, Line, LinearGradient, Path, Polyline, Rect, Stop, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 48;
const CHART_HEIGHT = 160;
const CHART_PADDING = { top: 20, bottom: 30, left: 40, right: 40 };

// ─── Sparkline Chart ────────────────────────────────────────────────────────

function WeightChart({ data, themeMode }: { data: WeightLogResponse[]; themeMode: 'dark' | 'light' }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  if (data.length < 2) {
    return (
      <View style={chartStyles.emptyChart}>
        <Text style={[chartStyles.emptyChartText, { color: themeMode === 'dark' ? '#2A2A3E' : '#CCC' }]}>LOG 2+ ENTRIES TO SEE CHART</Text>
      </View>
    );
  }

  const sorted = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const weights = sorted.map((d) => d.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  const innerW = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const innerH = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  const toX = (i: number) => CHART_PADDING.left + (i / (sorted.length - 1)) * innerW;
  const toY = (w: number) =>
    CHART_PADDING.top + innerH - ((w - minW) / range) * innerH;

  // Build SVG path for area fill
  const points = sorted.map((d, i) => `${toX(i)},${toY(d.weight)}`).join(' ');
  const firstX = toX(0);
  const lastX = toX(sorted.length - 1);
  const baseY = CHART_PADDING.top + innerH;
  const areaPath = `M${firstX},${baseY} L${firstX},${toY(sorted[0].weight)} L${points.slice(points.indexOf(',') + 1).replace(/^\d+,\d+/, '')}${sorted
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(d.weight)}`)
    .join(' ')} L${lastX},${baseY} Z`;

  // Build polyline points
  const linePoints = sorted.map((d, i) => `${toX(i)},${toY(d.weight)}`).join(' ');

  // Y-axis labels
  const yLabels = [minW, minW + range / 2, maxW].map((v) => ({
    y: toY(v),
    label: v.toFixed(1),
  }));

  // X-axis labels (first, mid, last)
  const xIndices = [0, Math.floor(sorted.length / 2), sorted.length - 1];
  const xLabels = xIndices.map((i) => ({
    x: toX(i),
    label: new Date(sorted[i].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
  }));

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#00D4FF" stopOpacity="0.25" />
            <Stop offset="1" stopColor="#00D4FF" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#8A2BE2" stopOpacity="1" />
            <Stop offset="1" stopColor="#00D4FF" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {yLabels.map((l, i) => (
          <Line
            key={i}
            x1={CHART_PADDING.left}
            y1={l.y}
            x2={CHART_WIDTH - CHART_PADDING.right}
            y2={l.y}
            stroke={themeMode === 'dark' ? "#1A1A2E" : "#E0E0E0"}
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        ))}

        {/* Y-axis labels */}
        {yLabels.map((l, i) => (
          <SvgText
            key={i}
            x={CHART_PADDING.left - 6}
            y={l.y + 4}
            fill={themeMode === 'dark' ? "#444" : "#999"}
            fontSize="9"
            fontWeight="700"
            textAnchor="end"
          >
            {l.label}
          </SvgText>
        ))}

        {/* X-axis labels */}
        {xLabels.map((l, i) => (
          <SvgText
            key={i}
            x={l.x}
            y={CHART_HEIGHT - 4}
            fill={themeMode === 'dark' ? "#444" : "#999"}
            fontSize="8"
            fontWeight="700"
            textAnchor={i === 0 ? 'start' : i === xLabels.length - 1 ? 'end' : 'middle'}
          >
            {l.label}
          </SvgText>
        ))}

        {/* Area fill */}
        <Path
          d={`M${sorted.map((d, i) => `${toX(i)},${toY(d.weight)}`).join(' L')} L${lastX},${baseY} L${firstX},${baseY} Z`}
          fill="url(#areaGrad)"
        />

        {/* Line */}
        <Polyline
          points={linePoints}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {sorted.map((d, i) => (
          <Circle
            key={i}
            cx={toX(i)}
            cy={toY(d.weight)}
            r={i === sorted.length - 1 ? 5 : 3}
            fill={i === sorted.length - 1 ? '#00D4FF' : (themeMode === 'dark' ? '#0F0F1E' : '#FFFFFF')}
            stroke={i === sorted.length - 1 ? '#00D4FF' : '#8A2BE2'}
            strokeWidth="1.5"
          />
        ))}

        {/* Latest value callout */}
        <SvgText
          x={toX(sorted.length - 1)}
          y={toY(sorted[sorted.length - 1].weight) - 10}
          fill="#00D4FF"
          fontSize="10"
          fontWeight="900"
          textAnchor="end"
        >
          {sorted[sorted.length - 1].weight.toFixed(1)}kg
        </SvgText>
      </Svg>
    </Animated.View>
  );
}

const chartStyles = StyleSheet.create({
  emptyChart: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
});

// ─── Stat Pill ────────────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  unit,
  color = '#00D4FF',
  accent = false,
  themeMode,
}: {
  label: string;
  value: string;
  unit: string;
  color?: string;
  accent?: boolean;
  themeMode: 'dark' | 'light';
}) {
  return (
    <View style={[pillStyles.pill, { 
      backgroundColor: themeMode === 'dark' ? '#0A0A16' : '#F5F5F5',
      borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
    }, accent && { borderColor: color }]}>
      <Text style={[pillStyles.label, { color: color }]}>{label}</Text>
      <Text style={[pillStyles.value, { color: themeMode === 'dark' ? '#FFF' : '#000' }]}>
        {value}
        <Text style={[pillStyles.unit, { color: themeMode === 'dark' ? '#555' : '#999' }]}> {unit}</Text>
      </Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  pill: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  value: {
    fontSize: 22,
    fontWeight: '900',
  },
  unit: {
    fontSize: 11,
    fontWeight: '600',
  },
});

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function GoalProgressBar({ current, start, goal, themeMode }: { current: number; start: number; goal: number; themeMode: 'dark' | 'light' }) {
  const animWidth = useRef(new Animated.Value(0)).current;
  const totalChange = Math.abs(goal - start);
  const currentChange = Math.abs(current - start);
  const pct = totalChange > 0 ? Math.min(currentChange / totalChange, 1) : 0;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: pct,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const barWidth = animWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={barStyles.container}>
      <View style={barStyles.header}>
        <Text style={[barStyles.label, { color: themeMode === 'dark' ? '#555' : '#999' }]}>GOAL PROGRESS</Text>
        <Text style={barStyles.pct}>{Math.round(pct * 100)}%</Text>
      </View>
      <View style={[barStyles.track, { backgroundColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0' }]}>
        <Animated.View style={[barStyles.fill, { width: barWidth }]} />
        <View style={[barStyles.marker, { left: `${pct * 100}%` as any }]} />
      </View>
      <View style={barStyles.footer}>
        <Text style={[barStyles.footerText, { color: themeMode === 'dark' ? '#333' : '#999' }]}>{start.toFixed(1)}kg</Text>
        <Text style={[barStyles.footerText, { color: themeMode === 'dark' ? '#333' : '#999' }]}>{goal.toFixed(1)}kg</Text>
      </View>
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  pct: {
    fontSize: 9,
    color: '#8A2BE2',
    fontWeight: '900',
    letterSpacing: 1,
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'visible',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#8A2BE2',
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  marker: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00D4FF',
    marginLeft: -6,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  footerText: {
    fontSize: 9,
    fontWeight: '700',
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProgressScreen() {
  const { colors, themeMode } = useSettings();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { showAlert, AlertComponent } = useCustomAlert();

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryData, historyData] = await Promise.all([
        apiService.getProgressSummary(),
        apiService.getWeightHistory(),
      ]);
      setSummary(summaryData);
      setWeightHistory(historyData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load progress data');
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

  const handleDelete = async (id: number) => {
    showAlert('Delete Weight Log', 'Are you sure you want to delete this weight entry?', 'warning', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiService.deleteWeightLog(id);
            loadData();
          } catch (error: any) {
            showAlert('Error', error.message || 'Failed to delete weight log', 'error');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={[styles.loadingText, { color: themeMode === 'dark' ? '#333' : '#999' }]}>LOADING TELEMETRY...</Text>
      </View>
    );
  }

  const totalChange = summary?.totalChange ?? 0;
  const isLoss = totalChange < 0;
  const isGain = totalChange > 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.secondary} />
      }
    >
      <StatusBar barStyle={themeMode === 'dark' ? "light-content" : "dark-content"} />
      <View style={styles.content}>

        {/* ── HEADER ── */}
        <Animated.View
          style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] }]}
        >
          <View>
            <Text style={[styles.subtitle, { color: colors.primary }]}>BIOMETRIC TRACKING</Text>
            <Text style={[styles.title, { color: colors.text }]}>PROGRESS</Text>
          </View>
          <TouchableOpacity style={[styles.addButton, { borderColor: colors.secondary, backgroundColor: themeMode === 'dark' ? 'rgba(0,212,255,0.08)' : 'rgba(0,212,255,0.15)' }]} onPress={() => router.push('/progress/log')}>
            <Text style={[styles.addButtonText, { color: colors.secondary }]}>+ LOG</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── STAT PILLS ── */}
        {summary && (
          <View style={styles.pillRow}>
            <StatPill
              label="CURRENT"
              value={summary.currentWeight?.weight.toFixed(1) ?? 'N/A'}
              unit="kg"
              color={colors.secondary}
              accent
              themeMode={themeMode}
            />
            <View style={{ width: 10 }} />
            {summary.startingWeight ? (
              <StatPill
                label="STARTING"
                value={summary.startingWeight.weight.toFixed(1)}
                unit="kg"
                color={colors.primary}
                themeMode={themeMode}
              />
            ) : null}
            <View style={{ width: 10 }} />
            <StatPill
              label="CHANGE"
              value={(isGain ? '+' : '') + totalChange.toFixed(1)}
              unit="kg"
              color={isLoss ? colors.secondary : isGain ? '#FF3B30' : (themeMode === 'dark' ? '#555' : '#999')}
              accent={totalChange !== 0}
              themeMode={themeMode}
            />
          </View>
        )}

        {/* ── CHART CARD ── */}
        <View style={[styles.chartCard, { 
          backgroundColor: themeMode === 'dark' ? '#0A0A16' : '#F5F5F5',
          borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
        }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: themeMode === 'dark' ? '#555' : '#999' }]}>WEIGHT TRAJECTORY</Text>
            {summary?.trend && (
              <View style={[styles.trendBadge, { backgroundColor: isLoss ? 'rgba(0,212,255,0.1)' : 'rgba(255,59,48,0.1)', borderColor: isLoss ? colors.secondary : '#FF3B30' }]}>
                <Text style={[styles.trendText, { color: isLoss ? colors.secondary : '#FF3B30' }]}>
                  {isLoss ? '↓' : isGain ? '↑' : '→'} {summary.trend.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <WeightChart data={weightHistory} themeMode={themeMode} />
        </View>

        {/* ── WEEKLY DELTA ── */}
        {summary?.averageWeeklyChange !== undefined && summary.averageWeeklyChange !== null && (
          <View style={[styles.deltaRow, { 
            backgroundColor: themeMode === 'dark' ? '#0A0A16' : '#F5F5F5',
            borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
          }]}>
            <View style={styles.deltaItem}>
              <Text style={[styles.deltaLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>AVG WEEKLY DELTA</Text>
              <Text style={[styles.deltaValue, { color: summary.averageWeeklyChange < 0 ? colors.secondary : '#FF3B30' }]}>
                {summary.averageWeeklyChange > 0 ? '+' : ''}{summary.averageWeeklyChange.toFixed(2)}
                <Text style={[styles.deltaUnit, { color: themeMode === 'dark' ? '#444' : '#999' }]}> kg/wk</Text>
              </Text>
            </View>
            <View style={[styles.deltaDivider, { backgroundColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0' }]} />
            <View style={styles.deltaItem}>
              <Text style={[styles.deltaLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>ENTRIES LOGGED</Text>
              <Text style={[styles.deltaValue, { color: colors.primary }]}>
                {weightHistory.length}
                <Text style={[styles.deltaUnit, { color: themeMode === 'dark' ? '#444' : '#999' }]}> logs</Text>
              </Text>
            </View>
          </View>
        )}

        {/* ── LOG HISTORY ── */}
        <View style={styles.historySection}>
          <Text style={[styles.sectionLabel, { color: themeMode === 'dark' ? '#333' : '#999' }]}>DATA LOG HISTORY</Text>

          {weightHistory.length === 0 ? (
            <View style={[styles.emptyContainer, { 
              backgroundColor: themeMode === 'dark' ? '#0A0A16' : '#F5F5F5',
              borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
            }]}>
              <Text style={[styles.emptyIcon, { color: themeMode === 'dark' ? '#1A1A2E' : '#CCC' }]}>◎</Text>
              <Text style={[styles.emptyText, { color: themeMode === 'dark' ? '#333' : '#999' }]}>No telemetry recorded.</Text>
              <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.secondary }]} onPress={() => router.push('/progress/log')}>
                <Text style={styles.emptyButtonText}>INITIALIZE LOG</Text>
              </TouchableOpacity>
            </View>
          ) : (
            [...weightHistory]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((log, index) => {
                const prev = weightHistory[index + 1];
                const delta = prev ? log.weight - prev.weight : null;
                return (
                  <View key={log.weightLogId} style={[styles.logCard, { 
                    backgroundColor: themeMode === 'dark' ? '#0A0A16' : '#F5F5F5',
                    borderColor: themeMode === 'dark' ? '#151525' : '#E0E0E0'
                  }]}>
                    <View style={styles.logLeft}>
                      <View style={styles.logIndexDot} />
                      <View>
                        <Text style={[styles.logWeight, { color: colors.text }]}>{log.weight.toFixed(1)}<Text style={[styles.logWeightUnit, { color: themeMode === 'dark' ? '#444' : '#999' }]}> kg</Text></Text>
                        <Text style={[styles.logDate, { color: themeMode === 'dark' ? '#333' : '#999' }]}>
                          {new Date(log.date).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          }).toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.logRight}>
                      {delta !== null && (
                        <Text style={[styles.logDelta, { color: delta < 0 ? colors.secondary : delta > 0 ? '#FF3B30' : (themeMode === 'dark' ? '#555' : '#999') }]}>
                          {delta > 0 ? '+' : ''}{delta.toFixed(1)}kg
                        </Text>
                      )}
                      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(log.weightLogId)}>
                        <Text style={styles.deleteButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
          )}
        </View>
      </View>

      <AlertComponent />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '900',
    marginBottom: 4,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  addButton: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  // Pills
  pillRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  // Chart
  chartCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  chartTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  trendText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // Delta row
  deltaRow: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 28,
    overflow: 'hidden',
  },
  deltaItem: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  deltaDivider: {
    width: 1,
  },
  deltaLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  deltaValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  deltaUnit: {
    fontSize: 11,
    fontWeight: '600',
  },

  // History
  historySection: {},
  sectionLabel: {
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: '900',
    marginBottom: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    borderRadius: 18,
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    marginBottom: 20,
    fontWeight: '700',
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // Log cards
  logCard: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logIndexDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8A2BE2',
  },
  logWeight: {
    fontSize: 18,
    fontWeight: '900',
  },
  logWeightUnit: {
    fontSize: 11,
    fontWeight: '600',
  },
  logDate: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  logRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logDelta: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,59,48,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 10,
    fontWeight: '900',
  },
});
