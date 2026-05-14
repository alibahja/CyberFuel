import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Decorative Glow Elements */}
          <View style={styles.glowTop} />
          
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <View style={styles.accentBar} />
            <Text style={styles.subtitle}>Sign in to access your dashboard</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="name@company.com"
                placeholderTextColor="#555"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#555"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.linkText}>
                New here? <Text style={styles.linkTextBold}>Create an account</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508', // Deep dark blue-black
  },
  scrollContent: {
    flexGrow: 1,
  },
  glowTop: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#6200EE',
    opacity: 0.15,
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 50,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  accentBar: {
    width: 40,
    height: 4,
    backgroundColor: '#8A2BE2', // Neon Purple
    marginTop: 10,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#888899',
    marginTop: 15,
    fontWeight: '400',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
    color: '#8A2BE2',
    letterSpacing: 1.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1A1A2E',
    borderRadius: 12,
    padding: 18,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#0F0F1E',
  },
  button: {
    backgroundColor: '#6200EE',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    // Neumorphic/Glow effect shadow
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonDisabled: {
    backgroundColor: '#2A2A3E',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  linkButton: {
    marginTop: 30,
    alignItems: 'center',
  },
  linkText: {
    color: '#777788',
    fontSize: 14,
  },
  linkTextBold: {
    color: '#00D4FF', // Electric Blue
    fontWeight: '700',
  },
});