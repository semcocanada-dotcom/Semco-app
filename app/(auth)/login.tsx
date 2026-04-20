import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@lib/supabase';
import { Colors } from '@constants/colors';
import { AppLogo } from '@components/AppLogo';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) setError(authError.message);
    setLoading(false);
  }

  async function handleSignUp() {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) {
      setError(authError.message);
    } else {
      setError('Check your email to confirm your account.');
    }
    setLoading(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ marginBottom: 40, alignItems: 'center' }}>
            <LinearGradient
              colors={Colors.gradients.purple}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <AppLogo size={62} variant="light" />
            </LinearGradient>
            <Text style={{ fontSize: 26, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.5, textAlign: 'center' }}>
              Autism Fund Tracker
            </Text>
            <Text style={{ fontSize: 15, color: Colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
              Saskatchewan ASD-IF Grant Management
            </Text>
          </View>

          {/* Form card */}
          <View
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 20,
              padding: 24,
              shadowColor: Colors.purple,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 4,
            }}
          >
            {error ? (
              <View
                style={{
                  backgroundColor: '#FFF1F2',
                  borderWidth: 1,
                  borderColor: '#FECDD3',
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: '#9F1239', fontSize: 13 }}>{error}</Text>
              </View>
            ) : null}

            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 }}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="you@example.com"
              placeholderTextColor={Colors.textMuted}
              style={{
                backgroundColor: Colors.surfaceAlt,
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 13,
                fontSize: 15,
                color: Colors.textPrimary,
                marginBottom: 16,
              }}
            />

            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 }}>
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              style={{
                backgroundColor: Colors.surfaceAlt,
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 13,
                fontSize: 15,
                color: Colors.textPrimary,
                marginBottom: 24,
              }}
            />

            <Pressable onPress={handleSignIn} disabled={loading}>
              <LinearGradient
                colors={Colors.gradients.purple}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 14,
                  paddingVertical: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>Sign In</Text>
                )}
              </LinearGradient>
            </Pressable>

            <Pressable onPress={handleSignUp} disabled={loading} style={{ marginTop: 14, alignItems: 'center' }}>
              <Text style={{ color: Colors.purple, fontWeight: '600', fontSize: 14 }}>
                Don't have an account? Create one
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
