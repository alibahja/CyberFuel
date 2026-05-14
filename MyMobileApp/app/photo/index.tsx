import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { apiService } from '@/services/api';
import type { PhotoAnalyzeResponse } from '@/types';
import { useRouter } from 'expo-router';
import { useSettings } from '@/contexts/SettingsContext';

export default function PhotoAnalysisScreen() {
  const { colors, themeMode } = useSettings();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PhotoAnalyzeResponse | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const router = useRouter();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('PERMISSION DENIED', 'Access to neural archives required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
       // Changed to square for better flexibility
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setAnalysis(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('PERMISSION DENIED', 'Optical sensor access required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      
       // Changed to square for better flexibility
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setAnalysis(null);
    }
  };

  const analyzeImage = async () => {
    if (!imageUri) {
      Alert.alert('NO DATA', 'Please provide an image for analysis.');
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.analyzePhoto(imageUri);
      setAnalysis(result);
    } catch (error: any) {
      Alert.alert('ANALYSIS FAILED', error.message || 'Optical recognition error.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!analysis) return;
    router.push({
      pathname: '/photo/confirm',
      params: { analysisId: analysis.photoAnalysisId.toString() },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={themeMode === 'dark' ? "light-content" : "dark-content"} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.subtitle, { color: colors.primary }]}>OPTICAL RECOGNITION</Text>
            <Text style={[styles.title, { color: colors.text }]}>SCAN MEAL</Text>
          </View>

          {/* IMAGE VIEWFINDER */}
          <View style={styles.imageSection}>
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.image} />
                <View style={styles.scanOverlay} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => {
                    setImageUri(null);
                    setAnalysis(null);
                  }}
                >
                  <Text style={styles.removeButtonText}>✕ DISCARD</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={[
                  styles.placeholder, 
                  { 
                    backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                    borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
                  }
                ]} 
                onPress={takePhoto}
              >
                <Text style={[styles.placeholderText, { color: themeMode === 'dark' ? '#444' : '#999' }]}>[ SENSOR OFFLINE ]</Text>
                <Text style={[styles.placeholderSub, { color: themeMode === 'dark' ? '#222' : '#CCC' }]}>Tap to activate camera</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* CONTROL ROW */}
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[
                styles.imageButton, 
                { 
                  backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                  borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
                }
              ]} 
              onPress={pickImage}
            >
              <Text style={[styles.imageButtonText, { color: colors.text }]}>LIBRARY</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.imageButton, styles.primaryImageButton, { backgroundColor: '#FFF' }]} 
              onPress={takePhoto}
            >
              <Text style={[styles.imageButtonText, { color: '#000' }]}>CAMERA</Text>
            </TouchableOpacity>
          </View>

          {/* ANALYZE ACTION */}
          {imageUri && !analysis && (
            <TouchableOpacity
              style={[styles.analyzeButton, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
              onPress={analyzeImage}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.analyzeButtonText}>INITIALIZE AI ANALYSIS</Text>
              )}
            </TouchableOpacity>
          )}

          {/* READOUT CARD */}
          {analysis && (
            <View style={[
              styles.analysisCard, 
              { 
                backgroundColor: themeMode === 'dark' ? '#0F0F1E' : '#F5F5F5',
                borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
              }
            ]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.analysisTitle, { color: colors.primary }]}>ANALYSIS READOUT</Text>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>{analysis.confidenceLevel || 'HIGH'}</Text>
                </View>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>DETECTION</Text>
                <Text style={[styles.resultValue, { color: colors.text }]}>{analysis.detectedFoods || 'UNKNOWN'}</Text>
              </View>

              <View style={styles.statGrid}>
                <View style={[
                  styles.statBox, 
                  { 
                    backgroundColor: themeMode === 'dark' ? '#050508' : '#FFFFFF',
                    borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
                  }
                ]}>
                  <Text style={[styles.statLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>ENERGY</Text>
                  <Text style={[styles.statValue, { color: colors.secondary }]}>{analysis.estimatedCalories.toFixed(0)}</Text>
                  <Text style={[styles.statUnit, { color: themeMode === 'dark' ? '#222' : '#CCC' }]}>KCAL</Text>
                </View>
                <View style={[
                  styles.statBox, 
                  { 
                    backgroundColor: themeMode === 'dark' ? '#050508' : '#FFFFFF',
                    borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
                  }
                ]}>
                  <Text style={[styles.statLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>PROTEIN</Text>
                  <Text style={[styles.statValue, { color: colors.secondary }]}>{analysis.finalProtein.toFixed(1)}</Text>
                  <Text style={[styles.statUnit, { color: themeMode === 'dark' ? '#222' : '#CCC' }]}>G</Text>
                </View>
                <View style={[
                  styles.statBox, 
                  { 
                    backgroundColor: themeMode === 'dark' ? '#050508' : '#FFFFFF',
                    borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
                  }
                ]}>
                  <Text style={[styles.statLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>CARBS</Text>
                  <Text style={[styles.statValue, { color: colors.secondary }]}>{analysis.finalCarbs.toFixed(1)}</Text>
                  <Text style={[styles.statUnit, { color: themeMode === 'dark' ? '#222' : '#CCC' }]}>G</Text>
                </View>
                <View style={[
                  styles.statBox, 
                  { 
                    backgroundColor: themeMode === 'dark' ? '#050508' : '#FFFFFF',
                    borderColor: themeMode === 'dark' ? '#1A1A2E' : '#E0E0E0'
                  }
                ]}>
                  <Text style={[styles.statLabel, { color: themeMode === 'dark' ? '#444' : '#999' }]}>FAT</Text>
                  <Text style={[styles.statValue, { color: colors.secondary }]}>{analysis.finalFats.toFixed(1)}</Text>
                  <Text style={[styles.statUnit, { color: themeMode === 'dark' ? '#222' : '#CCC' }]}>G</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.confirmButton, { backgroundColor: colors.secondary }]} 
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>CONFIRM & COMMIT TO LOG</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '900',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
  },
  imageSection: {
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  image: {
    width: '100%',
    height: 320,
    resizeMode: 'cover',
    backgroundColor: '#0F0F1E',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
  },
  removeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  placeholder: {
    width: '100%',
    height: 320,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  placeholderSub: {
    fontSize: 10,
    marginTop: 8,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  imageButton: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  primaryImageButton: {
    backgroundColor: '#FFF',
  },
  imageButtonText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  analyzeButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  analyzeButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  analysisCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    marginBottom: 40,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  analysisTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  confidenceBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  confidenceText: {
    color: '#34C759',
    fontSize: 10,
    fontWeight: '900',
  },
  resultRow: {
    marginBottom: 24,
  },
  resultLabel: {
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '900',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  statUnit: {
    fontSize: 8,
    fontWeight: '800',
  },
  confirmButton: {
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
});