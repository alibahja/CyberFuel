import React, { useEffect } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

export interface CustomAlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  onOkPress?: () => void; // ADD THIS - callback for when OK button is pressed
  onClosed?: () => void;
  buttons?: CustomAlertButton[];
  themeMode?: 'dark' | 'light';
  autoCloseDelay?: number;
}

const { width } = Dimensions.get('window');

export default function CustomAlert({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  onOkPress, // ADD THIS
  onClosed,
  buttons,
  themeMode: propThemeMode,
  autoCloseDelay,
}: CustomAlertProps) {
  const systemTheme = useColorScheme();
  const themeMode = propThemeMode || (systemTheme === 'dark' ? 'dark' : 'light');
  
  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);

  // Use provided buttons or create default based on type
  const defaultButtons = (() => {
    if (buttons) return buttons;
    
    // For success alerts, just show OK button with custom onPress
    if (type === 'success') {
      return [{ 
        text: 'OK', 
        style: 'default' as const,
        onPress: () => {
          if (onOkPress) onOkPress();
        }
      }];
    }
    
    // Default for other types
    return [{ text: 'OK', style: 'default' as const, onPress: () => {} }];
  })();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (autoCloseDelay) {
        const timer = setTimeout(() => {
          onClose();
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      if (onClosed) {
        setTimeout(() => onClosed(), 300);
      }
    }
  }, [visible, autoCloseDelay]);

  const getTypeColor = () => {
    switch (type) {
      case 'success': return '#00E5FF';
      case 'error': return '#FF3D00';
      case 'warning': return '#FFD600';
      default: return '#A020F0';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '!';
      default: return 'ℹ';
    }
  };

  const isDark = themeMode === 'dark';
  
  const dynamicStyles = {
    overlay: {
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.65)',
    },
    container: {
      backgroundColor: isDark ? '#0F0F1E' : '#FFFFFF',
      borderColor: isDark ? '#1A1A2E' : '#E0E0E0',
    },
    iconContainer: {
      backgroundColor: isDark ? '#050508' : '#F5F5F5',
    },
    title: {
      color: isDark ? '#FFF' : '#000',
    },
    message: {
      color: isDark ? '#BBB' : '#666',
    },
    cancelButton: {
      backgroundColor: isDark ? '#2A2A3A' : '#F0F0F0',
    },
    cancelButtonText: {
      color: isDark ? '#FFF' : '#000',
    },
    destructiveButtonText: {
      color: '#FFF',
    },
  };

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="none" 
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, dynamicStyles.overlay]}>
        <Animated.View style={[styles.container, dynamicStyles.container, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          <View style={[styles.iconContainer, dynamicStyles.iconContainer, { borderColor: getTypeColor() }]}>
            <Text style={[styles.icon, { color: getTypeColor() }]}>{getTypeIcon()}</Text>
          </View>
          <Text style={[styles.title, dynamicStyles.title]}>{title.toUpperCase()}</Text>
          <Text style={[styles.message, dynamicStyles.message]}>{message}</Text>
          <View style={styles.buttonContainer}>
            {defaultButtons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === 'cancel' && [styles.cancelButton, dynamicStyles.cancelButton],
                  button.style === 'destructive' && styles.destructiveButton,
                  (button.style === 'default' || !button.style) && { 
                    backgroundColor: getTypeColor(),
                    shadowColor: getTypeColor(),
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 10,
                    elevation: 5,
                  },
                ]}
                onPress={() => {
                  if (button.onPress) button.onPress();
                  onClose();
                }}
              >
                <Text style={[
                  styles.buttonText,
                  button.style === 'cancel' && [styles.cancelButtonText, dynamicStyles.cancelButtonText],
                  button.style === 'destructive' && [styles.destructiveButtonText, dynamicStyles.destructiveButtonText],
                  (button.style === 'default' || !button.style) && { color: '#000' },
                ]}>
                  {button.text.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  container: { 
    borderRadius: 24, 
    padding: 30, 
    width: width * 0.85, 
    maxWidth: 400, 
    borderWidth: 1.5,
    alignItems: 'center' 
  },
  iconContainer: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    borderWidth: 3, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20, 
  },
  icon: { fontSize: 32, fontWeight: '900' },
  title: { 
    fontSize: 20, 
    fontWeight: '900', 
    marginBottom: 12, 
    textAlign: 'center',
    letterSpacing: 1
  },
  message: { 
    fontSize: 15, 
    textAlign: 'center', 
    marginBottom: 30,
    lineHeight: 22 
  },
  buttonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-evenly', 
    width: '100%',
    gap: 12
  },
  button: { 
    flex: 1,
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButton: {},
  destructiveButton: { backgroundColor: '#FF3B30' },
  buttonText: { 
    fontSize: 13, 
    fontWeight: '900',
    letterSpacing: 0.5 
  },
  cancelButtonText: {},
  destructiveButtonText: { color: '#FFF' },
});