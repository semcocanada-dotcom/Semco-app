import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { Button, Card, Input } from '@/components/ui';
import { Colors, Fonts, Layout, Spacing, Typography } from '@/constants/theme';
import { supabase } from '@/services/supabase';

function getAuthParameters(url: string) {
  const normalized = url.includes('#') ? url.replace('#', '?') : url;
  const parsed = new URL(normalized);
  return {
    accessToken: parsed.searchParams.get('access_token'),
    refreshToken: parsed.searchParams.get('refresh_token'),
    code: parsed.searchParams.get('code'),
    error: parsed.searchParams.get('error_description') ?? parsed.searchParams.get('error'),
  };
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const url = Linking.useLinkingURL();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isReady, setReady] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const prepareRecoverySession = async () => {
      try {
        if (url) {
          const parameters = getAuthParameters(url);
          if (parameters.error) throw new Error(parameters.error);
          if (parameters.accessToken && parameters.refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: parameters.accessToken,
              refresh_token: parameters.refreshToken,
            });
            if (sessionError) throw sessionError;
          } else if (parameters.code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(parameters.code);
            if (exchangeError) throw exchangeError;
          }
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!data.session) throw new Error('This reset link is invalid or has expired. Request a new link from the sign-in screen.');
        if (active) setReady(true);
      } catch (recoveryError) {
        if (active) setError(recoveryError instanceof Error ? recoveryError.message : 'The reset link could not be verified.');
      }
    };

    prepareRecoverySession();
    return () => { active = false; };
  }, [url]);

  const updatePassword = async () => {
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.replace('/dashboard' as any);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Card elevated style={styles.card}>
          <Text style={styles.title}>Choose a new password</Text>
          <Text style={styles.body}>Use at least 8 characters. This password will protect your installer projects and records.</Text>
          <Input label="New Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" editable={isReady} />
          <Input label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry autoComplete="new-password" editable={isReady} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label={isReady ? 'Update Password' : 'Verifying Reset Link'} onPress={updatePassword} disabled={!isReady} isLoading={isSaving} fullWidth size="lg" />
          {!isReady && error ? <Button label="Return to Sign In" variant="ghost" onPress={() => router.replace('/login' as any)} fullWidth /> : null}
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.darkTeal },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  card: { width: '100%', maxWidth: Math.min(Layout.screenMaxWidth, 560), gap: Spacing.md, padding: Spacing.xl },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.xl },
  body: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.sm, lineHeight: Typography.size.sm * 1.5 },
  error: { color: Colors.danger, fontFamily: Fonts.semibold, fontSize: Typography.size.sm },
});
