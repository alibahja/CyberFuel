import CustomAlert from '@/components/CustomAlert';
import { useSettings } from '@/contexts/SettingsContext';
import { UnitSystem } from '@/types';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SettingsScreen() {
  const { settings, updateSettings, refreshSettings, darkMode, preferredUnits, dailyCalorieReminder, mealReminderEnabled, colors } = useSettings();
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'info' as 'success' | 'error' | 'info' });

  // Enum to numeric value mappings (for backend serialization)
  const UnitSystemMap: Record<UnitSystem, number> = {
    [UnitSystem.Metric]: 0,
    [UnitSystem.Imperial]: 1,
  };

  const [formData, setFormData] = useState({
    preferredUnits: preferredUnits,
    dailyCalorieReminder: dailyCalorieReminder,
    darkMode: darkMode,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        preferredUnits: settings.preferredUnits,
        dailyCalorieReminder: settings.dailyCalorieReminder,
        darkMode: settings.darkMode,
      });
    }
  }, [settings]);

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        preferredUnits: UnitSystemMap[formData.preferredUnits],
        dailyCalorieReminder: formData.dailyCalorieReminder,
        mealReminderEnabled: mealReminderEnabled,
        darkMode: formData.darkMode,
      };
      await updateSettings(payload as any);
      await refreshSettings();
      showAlert('System Alert', 'Core settings synchronized successfully.', 'success');
    } catch (error: any) {
      showAlert('Sync Error', 'Failed to update remote settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({ value, onValueChange, label, hint }: any) => (
    <TouchableOpacity 
      style={[styles.switchRow, { backgroundColor: colors.surface }]} 
      onPress={() => onValueChange(!value)}
      activeOpacity={0.7}
    >
      <View style={styles.switchLabelContainer}>
        <Text style={[styles.switchLabel, { color: colors.text }]}>{label.toUpperCase()}</Text>
        <Text style={[styles.switchHint, { color: colors.textSecondary }]}>{hint}</Text>
      </View>
      <View style={[styles.customSwitch, { borderColor: value ? colors.secondary : colors.border }, value && { borderColor: colors.secondary }]}>
        <View style={[styles.customThumb, value && { backgroundColor: colors.secondary, alignSelf: 'flex-end' }]} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.subtitle, { color: colors.primary }]}>SYSTEM CONFIG</Text>
            <Text style={[styles.title, { color: colors.text }]}>SETTINGS</Text>
          </View>

          {/* UNIT SELECTION MODULE */}
          

          {/* NOTIFICATION MODULE */}
          <View style={[styles.module, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.moduleHeader, { color: colors.textSecondary }]}>ALERT DISPATCH</Text>
            <Toggle 
              label="Daily Calorie Target"
              hint="Reminders for daily target maintenance"
              value={formData.dailyCalorieReminder}
              onValueChange={(val: boolean) => setFormData({...formData, dailyCalorieReminder: val})}
            />
          </View>

          {/* INTERFACE MODULE */}
          <View style={[styles.module, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.moduleHeader, { color: colors.textSecondary }]}>VISUAL INTERFACE</Text>
            <Toggle 
              label="Dark Protocol"
              hint="High-contrast dark mode interface"
              value={formData.darkMode}
              onValueChange={(val: boolean) => setFormData({...formData, darkMode: val})}
            />
          </View>

          <TouchableOpacity
            style={[styles.syncButton, loading && styles.buttonDisabled, { backgroundColor: colors.secondary }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={[styles.syncButtonText, { color: colors.textInverse }]}>SYNC WITH SERVER</Text>
            )}
          </TouchableOpacity>
          
          <Text style={[styles.versionText, { color: colors.textTertiary }]}>BUILD v1.0.4 - STABLE RELEASE</Text>
        </View>
      </ScrollView>
      
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const baseStyles = StyleSheet.create({
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
  },
  module: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  moduleHeader: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  unitToggleGroup: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  unitTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  unitTabActive: {
    borderWidth: 1,
  },
  unitTabText: {
    fontSize: 12,
    fontWeight: '800',
  },
  unitTabTextActive: {
    fontWeight: '900',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 15,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  switchHint: {
    fontSize: 11,
  },
  customSwitch: {
    width: 48,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    padding: 3,
  },
  customThumb: {
    width: 16,
    height: 16,
    borderRadius: 2,
  },
  divider: {
    height: 1,
    marginVertical: 15,
  },
  syncButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  syncButtonText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 30,
    marginBottom: 20,
    letterSpacing: 1,
  },
});

const styles = baseStyles;

