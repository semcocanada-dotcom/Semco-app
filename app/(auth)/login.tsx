import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(app)/assistant');
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opening Semco Pro…</Text>
      <Text style={styles.subtitle}>Loading preview mode.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.appBackground,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.size.base,
    textAlign: 'center',
  },
});
