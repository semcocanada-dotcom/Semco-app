import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Input, TabControl } from '@/components/ui';
import { Colors, Fonts, Layout, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuthStore } from '@/store/auth';
import { upsertInstallerProfile } from '@/services/installer-profile';
import { PRIVACY_POLICY_URL } from '@/constants/legal';

type AuthMode = 'sign_in' | 'create';

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);
  const sendPasswordReset = useAuthStore((state) => state.sendPasswordReset);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [mode, setMode] = useState<AuthMode>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (mode === 'sign_in') {
      const signInError = await signIn(email, password);
      if (signInError) {
        setError(signInError);
        return;
      }
      router.replace('/dashboard' as any);
      return;
    }

    if (!companyName.trim() || !contactName.trim() || !postalCode.trim()) {
      setError('Company name, contact name, and postal code are required.');
      return;
    }

    const result = await signUp(email, password, { companyName, contactName, postalCode });
    if (result.error) {
      setError(result.error);
      return;
    }

    const user = useAuthStore.getState().user;
    if (user) {
      try {
        await upsertInstallerProfile(user.id, {
          companyName: companyName.trim(),
          contactName: contactName.trim(),
          email: email.trim(),
          postalCode: postalCode.trim().toUpperCase(),
        });
      } catch (profileError) {
        console.error('[auth] initial profile cloud sync failed', profileError);
        Alert.alert(
          'Finish your company profile',
          'Your installer account is ready. Review and save the company profile once more so Semco receives the cloud record.',
        );
      }
      router.replace('/profile' as any);
      return;
    }

    Alert.alert(
      'Check your email',
      'Open the confirmation email from Semco Pro, then return here and sign in to finish your company profile.',
    );
    setMode('sign_in');
  };

  const resetPassword = async () => {
    if (!email.trim()) {
      setError('Enter your email first.');
      return;
    }
    const resetError = await sendPasswordReset(email);
    if (resetError) setError(resetError);
    else Alert.alert('Reset email sent', 'Use the secure link in your email to choose a new password.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Card elevated style={styles.card}>
            <Image source={require('../../assets/images/semco-surfaces-logo.png')} style={styles.logo} resizeMode="contain" />
            <View style={styles.headingWrap}>
              <Text style={styles.title}>Semco Pro</Text>
              <Text style={styles.subtitle}>Installer projects, field records, warranties, and support.</Text>
            </View>

            <TabControl<AuthMode>
              options={[
                { value: 'sign_in', label: 'Sign In' },
                { value: 'create', label: 'Create Account' },
              ]}
              value={mode}
              onChange={(value) => { setMode(value); setError(null); }}
            />

            {mode === 'create' ? (
              <>
                <Input label="Company Name" value={companyName} onChangeText={setCompanyName} autoComplete="organization" />
                <Input label="Contact Name" value={contactName} onChangeText={setContactName} autoComplete="name" />
                <Input label="Postal Code" value={postalCode} onChangeText={setPostalCode} autoCapitalize="characters" placeholder="A1A 1A1" />
              </>
            ) : null}
            <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete={mode === 'create' ? 'new-password' : 'current-password'} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button label={mode === 'create' ? 'Create Installer Account' : 'Sign In'} onPress={submit} isLoading={isLoading} fullWidth size="lg" />
            {mode === 'sign_in' ? (
              <TouchableOpacity onPress={resetPassword} accessibilityRole="button" style={styles.resetButton}>
                <Text style={styles.resetText}>Forgot password?</Text>
              </TouchableOpacity>
            ) : null}
            <Text style={styles.privacy}>By creating an account, you agree that project and warranty records will be stored securely for Semco review.</Text>
            <TouchableOpacity
              onPress={() => { void Linking.openURL(PRIVACY_POLICY_URL); }}
              accessibilityRole="link"
              style={styles.privacyLinkButton}
            >
              <Text style={styles.privacyLink}>Read the privacy policy</Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.darkTeal },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  card: { width: '100%', maxWidth: Math.min(Layout.screenMaxWidth, 560), gap: Spacing.md, padding: Spacing.xl, borderRadius: Radius.lg },
  logo: { width: 238, height: 70, alignSelf: 'center' },
  headingWrap: { gap: Spacing.xs, alignItems: 'center' },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.xxl, textAlign: 'center' },
  subtitle: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.sm, lineHeight: Typography.size.sm * 1.45, textAlign: 'center' },
  error: { color: Colors.danger, fontFamily: Fonts.semibold, fontSize: Typography.size.sm },
  resetButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  resetText: { color: Colors.darkTeal, fontFamily: Fonts.semibold, fontSize: Typography.size.sm },
  privacy: { color: Colors.textDisabled, fontFamily: Fonts.regular, fontSize: Typography.size.xs, lineHeight: Typography.size.xs * 1.45, textAlign: 'center' },
  privacyLinkButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  privacyLink: { color: Colors.darkTeal, fontFamily: Fonts.semibold, fontSize: Typography.size.xs },
});
