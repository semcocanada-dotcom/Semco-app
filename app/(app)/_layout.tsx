import 'react-native-url-polyfill/auto';
import { useEffect, useRef, useState } from 'react';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { initDatabase } from '@/database/client';
import { seedDatabase } from '@/database/seed';
import { Colors } from '@/constants/theme';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { AppTabBar } from '@/components/navigation/AppTabBar';
import { useAuthStore } from '@/store/auth';
import { bootstrapContractorCloud } from '@/services/cloud-sync';
import { Fonts, Typography } from '@/constants/theme';
import { getInstallerProfile, upsertInstallerProfile } from '@/services/installer-profile';

export default function AppLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const session = useAuthStore((state) => state.session);
  const user = session?.user;
  const userId = user?.id;
  const userEmail = user?.email ?? null;
  const userCompanyName = typeof user?.user_metadata?.company_name === 'string' ? user.user_metadata.company_name : null;
  const userContactName = typeof user?.user_metadata?.contact_name === 'string' ? user.user_metadata.contact_name : null;
  const userPostalCode = typeof user?.user_metadata?.postal_code === 'string' ? user.user_metadata.postal_code : null;
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const [isWorkspaceReady, setWorkspaceReady] = useState(false);
  const bootstrappedUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isInitialized) return;
    if (!userId) {
      bootstrappedUserRef.current = null;
      setWorkspaceReady(false);
      router.replace('/login' as any);
      return;
    }
    if (bootstrappedUserRef.current === userId) return;
    bootstrappedUserRef.current = userId;

    let cancelled = false;
    setWorkspaceReady(false);
    let needsProfile = false;
    initDatabase()
      .then(() => seedDatabase())
      .then(() => bootstrapContractorCloud(userId))
      .then(async () => {
        const existing = await getInstallerProfile(userId);
        if (existing) return;
        needsProfile = true;
        await upsertInstallerProfile(userId, {
          companyName: userCompanyName,
          contactName: userContactName,
          postalCode: userPostalCode,
          email: userEmail,
        });
      })
      .catch((error) => {
        // Local-first operation remains available when the network is down.
        console.error('[workspace] cloud bootstrap failed; continuing offline', error);
      })
      .finally(() => {
        if (!cancelled) {
          setWorkspaceReady(true);
          if (needsProfile && pathname !== '/profile') router.replace('/profile' as any);
        }
      });
    return () => { cancelled = true; };
  }, [isInitialized, pathname, router, userCompanyName, userContactName, userEmail, userId, userPostalCode]);

  useNetworkStatus();

  if (!isInitialized || !session || !isWorkspaceReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.lightTeal} />
        <Text style={styles.loadingText}>Opening your Semco workspace...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: Colors.appBackground },
          tabBarHideOnKeyboard: true,
        }}
        tabBar={(props) => <AppTabBar {...props} />}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: Colors.appBackground },
  loadingText: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: Typography.size.sm },
});
