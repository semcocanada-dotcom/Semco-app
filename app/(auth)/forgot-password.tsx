import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input } from '@/components/ui';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/auth';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const sendPasswordReset = useAuthStore((state) => state.sendPasswordReset);

  const handleReset = async () => {
    setError(null);
    if (!email.trim()) { setError('Enter your email address'); return; }
    setIsLoading(true);
    const resetError = await sendPasswordReset(email);
    setIsLoading(false);
    if (resetError) { setError(resetError); return; }
    setSent(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <Button label="← Back" onPress={() => router.back()} variant="ghost" />

        <Text style={styles.heading}>Reset Password</Text>

        {sent ? (
          <Text style={styles.success}>
            Check your email for a password reset link.
          </Text>
        ) : (
          <>
            <Text style={styles.body}>
              Enter your registered email and we'll send you a reset link.
            </Text>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="your@email.com"
              error={error ?? undefined}
            />
            <Button label="Send Reset Link" onPress={handleReset} isLoading={isLoading} fullWidth />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.appBackground },
  container: { flex: 1, padding: Spacing.xl, paddingTop: 60, gap: Spacing.lg },
  heading: {
    color: Colors.textPrimary,
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
  },
  body: { color: Colors.textSecondary, fontSize: Typography.size.base, lineHeight: Typography.size.base * 1.5 },
  success: { color: Colors.success, fontSize: Typography.size.base, lineHeight: Typography.size.base * 1.5 },
});
