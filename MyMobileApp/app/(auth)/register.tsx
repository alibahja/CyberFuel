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

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Decorative Glow Elements */}
          <View style={styles.glowBottom} />
          
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Join Us</Text>
            <View style={styles.accentBar} />
            <Text style={styles.subtitle}>Create your secure account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#555"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="name@gmail.com"
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRM PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#555"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {loading ? 'CREATING ACCOUNT...' : 'GET STARTED'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.back()}
            >
              <Text style={styles.linkText}>
                Already have an account? <Text style={styles.linkTextBold}>Sign In</Text>
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
    backgroundColor: '#050508',
  },
  scrollContent: {
    flexGrow: 1,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -50,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#00D4FF',
    opacity: 0.1,
  },
  content: {
    flex: 1,
    padding: 30,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 35,
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
    backgroundColor: '#00D4FF', // Cyan accent for Register
    marginTop: 10,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#888899',
    marginTop: 15,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
    color: '#00D4FF',
    letterSpacing: 1.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#0F0F1E',
  },
  button: {
    backgroundColor: '#6200EE',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
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
    marginTop: 25,
    alignItems: 'center',
  },
  linkText: {
    color: '#777788',
    fontSize: 14,
  },
  linkTextBold: {
    color: '#8A2BE2',
    fontWeight: '700',
  },
});
