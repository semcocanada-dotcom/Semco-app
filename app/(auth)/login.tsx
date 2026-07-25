import React, { useRef, useState } from 'react';
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
import { getSignInErrorMessage, normalizeEmail } from '@lib/auth';
import { Colors } from '@constants/colors';
import { AppLogo } from '@components/AppLogo';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  async function handleSignIn() {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (authError) setError(getSignInErrorMessage(authError));
    } catch (authError) {
      setError(getSignInErrorMessage(authError));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
      });
      if (authError) setError(getSignInErrorMessage(authError));
      else setError('Check your email to confirm your account.');
    } catch (authError) {
      setError(getSignInErrorMessage(authError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      {/* Decorative brand backdrop — soft tinted blobs + confetti dots,
          matching the Home hero's visual language. Purely presentational. */}
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: -90, left: -70, width: 260, height: 260, borderRadius: 999, backgroundColor: '#EFEAFF' }} />
        <View style={{ position: 'absolute', top: 40, right: -110, width: 230, height: 230, borderRadius: 999, backgroundColor: '#E8EEFF' }} />
        <View style={{ position: 'absolute', bottom: -110, right: -60, width: 280, height: 280, borderRadius: 999, backgroundColor: '#EFEAFF' }} />
        <View style={{ position: 'absolute', bottom: 60, left: -90, width: 190, height: 190, borderRadius: 999, backgroundColor: '#E6F7F1' }} />
        {[
          { x: 46,  y: 130, size: 8,  color: '#7C5CFC' },
          { x: 320, y: 90,  size: 6,  color: '#22C55E' },
          { x: 360, y: 210, size: 7,  color: '#3B82F6' },
          { x: 28,  y: 260, size: 6,  color: '#F59E0B' },
          { x: 300, y: 300, size: 5,  color: '#EC4899' },
          { x: 70,  y: 350, size: 5,  color: '#EF4444' },
        ].map((d, i) => (
          <View
            key={i}
            style={{
              position: 'absolute', left: d.x, top: d.y,
              width: d.size, height: d.size, borderRadius: 999,
              backgroundColor: d.color, opacity: 0.55,
            }}
          />
        ))}
      </View>
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
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                backgroundColor: Colors.surface,
                shadowColor: '#7C5CFC',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.16,
                shadowRadius: 16,
                elevation: 4,
              }}
            >
              <AppLogo size={72} />
            </View>
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
              textContentType="emailAddress"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => passwordRef.current?.focus()}
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
              ref={passwordRef}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleSignIn}
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

            <Pressable
              onPress={handleSignIn}
              disabled={loading}
              style={({ pressed }) => (pressed ? { transform: [{ scale: 0.98 }], opacity: 0.9 } : null)}
            >
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
