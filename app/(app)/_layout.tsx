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
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: Colors.background },
          tabBarHideOnKeyboard: true,
        }}
        tabBar={(props) => <AppTabBar {...props} />}
      >
        <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
        <Tabs.Screen name="projects" options={{ title: 'Projects' }} />
        <Tabs.Screen name="add" options={{ title: 'Add' }} />
        <Tabs.Screen name="library" options={{ title: 'Library' }} />
        <Tabs.Screen name="more" options={{ title: 'More' }} />
      </Tabs>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
