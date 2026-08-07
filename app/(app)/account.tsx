import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader, Button, Card, Input, SectionHeader } from '@/components/ui';
import { Colors, Fonts, Layout, Spacing, Typography } from '@/constants/theme';
import { SEMCO_PRIVACY_EMAIL } from '@/constants/legal';
import { useAuthStore } from '@/store/auth';
import { deleteCurrentAccount } from '@/services/account-deletion';

export default function AccountScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const sendPasswordReset = useAuthStore((state) => state.sendPasswordReset);
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const deletionConfirmed = confirmation.trim().toUpperCase() === 'DELETE';

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login' as any);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    const error = await sendPasswordReset(user.email);
    Alert.alert(error ? 'Reset could not be sent' : 'Reset email sent', error ?? 'Use the secure link in your email to choose a new password.');
  };

  const completeDeletion = async () => {
    if (!user || !deletionConfirmed) return;
    setDeleting(true);

    try {
      await deleteCurrentAccount();
      setDeleting(false);
      await signOut();
      router.replace('/login' as any);
      Alert.alert(
        'Account deleted',
        'Your Semco Pro account, cloud records, private files, and data stored by this app on this device were permanently deleted.',
      );
    } catch (error) {
      setDeleting(false);
      Alert.alert(
        'Account not deleted',
        error instanceof Error
          ? error.message
          : `Please try again or contact ${SEMCO_PRIVACY_EMAIL}.`,
      );
    }
  };

  const submitDeletion = () => {
    if (!deletionConfirmed) return;
    Alert.alert(
      'Permanently delete account?',
      'This immediately deletes your sign-in, company profile, projects, customer details, photos, receipts, forms, signatures, warranties, and saved conversations. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => { void completeDeletion(); },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <AppHeader title="Account and Security" subtitle={user?.email ?? 'Installer account'} rightIcon="shield-checkmark-outline" />

        <View style={styles.section}>
          <SectionHeader title="Sign-in security" subtitle="Password reset links are sent only to the account email." />
          <Card style={styles.card}>
            <Text style={styles.title}>{user?.email}</Text>
            <Text style={styles.body}>Your project records sync to this account and remain available when you move between an iPhone and iPad.</Text>
            <Button label="Send Password Reset Email" variant="secondary" onPress={handlePasswordReset} fullWidth />
            <Button label="Sign Out" variant="ghost" onPress={handleSignOut} disabled={deleting} fullWidth />
          </Card>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Delete account" subtitle="Permanently delete your account and its associated app data." />
          <Card style={styles.card}>
            <Text style={styles.body}>This immediately removes your sign-in, company profile, projects, customer details, private photos, receipts, forms, signatures, warranties, and saved conversations from Semco Pro. It cannot be undone.</Text>
            <Input
              label="Type DELETE to confirm"
              value={confirmation}
              onChangeText={setConfirmation}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="DELETE"
              hint="The final button becomes available after you enter DELETE."
            />
            <Button
              label="Permanently Delete Account"
              variant="danger"
              onPress={submitDeletion}
              isLoading={deleting}
              disabled={!deletionConfirmed}
              fullWidth
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.appBackground },
  scroll: { width: '100%', maxWidth: Layout.screenMaxWidth, alignSelf: 'center', padding: Spacing.base, paddingBottom: Spacing.xxxl, gap: Spacing.lg },
  section: { gap: Spacing.md },
  card: { gap: Spacing.md },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.md },
  body: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.sm, lineHeight: Typography.size.sm * 1.5 },
});
