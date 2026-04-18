import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store/auth';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signIn, isLoading } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter your email and password');
      return;
    }
    const errorMsg = await signIn(email.trim().toLowerCase(), password);
    if (errorMsg) {
      setError(errorMsg);
    } else {
      router.replace('/(app)/assistant');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.wordmark}>SEMCO</Text>
          <Text style={styles.tagline}>Pro Assistant</Text>
          <Text style={styles.subtitle}>For certified installers only</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="your@email.com"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            placeholder="••••••••"
            error={error ?? undefined}
          />

          <Button
            label="Sign In"
            onPress={handleLogin}
            isLoading={isLoading}
            fullWidth
            size="lg"
          />

          <Button
            label="Forgot password?"
            onPress={() => router.push('/(auth)/forgot-password')}
            variant="ghost"
            fullWidth
          />
        </View>

        <Text style={styles.footer}>
          Access is restricted to certified Semco installers.{'\n'}
          Contact your Semco representative to request access.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 80,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xxl,
  },
  header: { alignItems: 'center', gap: Spacing.xs },
  wordmark: {
    color: Colors.primary,
    fontSize: 42,
    fontWeight: Typography.weight.bold,
    letterSpacing: 8,
  },
  tagline: {
    color: Colors.textPrimary,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.medium,
  },
  subtitle: { color: Colors.textSecondary, fontSize: Typography.size.sm },
  form: { gap: Spacing.md },
  footer: {
    color: Colors.textDisabled,
    fontSize: Typography.size.sm,
    textAlign: 'center',
    lineHeight: Typography.size.sm * 1.6,
  },
});
