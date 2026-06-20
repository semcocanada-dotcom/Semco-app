import 'react-native-url-polyfill/auto';
import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { initDatabase } from '@/database/client';
import { seedDatabase } from '@/database/seed';
import { Colors } from '@/constants/theme';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { AppTabBar } from '@/components/navigation/AppTabBar';

export default function AppLayout() {
  useEffect(() => {
    initDatabase().then(() => seedDatabase()).catch(console.error);
  }, []);

  useNetworkStatus();

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

const styles = StyleSheet.create({ root: { flex: 1 } });
