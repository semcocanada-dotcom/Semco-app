import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader, Button, Card, Input, SectionHeader } from '@/components/ui';
import { Colors, Fonts, Layout, Spacing, Typography } from '@/constants/theme';
import { useAuthStore } from '@/store/auth';
import { supabase } from '@/services/supabase';

export default function AccountScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const sendPasswordReset = useAuthStore((state) => state.sendPasswordReset);
  const [reason, setReason] = useState('');
  const [requesting, setRequesting] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login' as any);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    const error = await sendPasswordReset(user.email);
    Alert.alert(error ? 'Reset could not be sent' : 'Reset email sent', error ?? 'Use the secure link in your email to choose a new password.');
  };

  const submitDeletion = () => {
    Alert.alert(
      'Request account deletion?',
      'This starts deletion of your installer account and personal project data. Semco will review signed contract retention requirements and complete the request within 30 days.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Deletion',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            setRequesting(true);
            const { error } = await supabase.from('account_deletion_requests').insert({
              installer_id: user.id,
              status: 'pending',
              reason: reason.trim() || null,
            });
            setRequesting(false);
            if (error) {
              Alert.alert('Request not submitted', 'Please try again or contact semcocanada@gmail.com.');
              return;
            }
            Alert.alert('Deletion requested', 'Your request was recorded. Semco will complete it within 30 days and contact you if a signed record must be retained.');
            await handleSignOut();
          },
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
            <Button label="Sign Out" variant="ghost" onPress={handleSignOut} fullWidth />
          </Card>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Delete account" subtitle="You can start an account and data deletion request inside the app." />
          <Card style={styles.card}>
            <Text style={styles.body}>Deletion removes the installer account and associated personal data. Signed customer contracts may be retained only where Semco has a legal recordkeeping obligation.</Text>
            <Input label="Reason (optional)" value={reason} onChangeText={setReason} multiline placeholder="Anything Semco should know" />
            <Button label="Request Account Deletion" variant="danger" onPress={submitDeletion} isLoading={requesting} fullWidth />
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
