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
      >
        <Tabs.Screen name="dashboard" options={{ title: 'Home' }} />
        <Tabs.Screen name="projects" options={{ title: 'Projects' }} />
        <Tabs.Screen name="add" options={{ title: 'Add' }} />
        <Tabs.Screen name="library" options={{ title: 'Library' }} />
        <Tabs.Screen name="more" options={{ title: 'More' }} />
        <Tabs.Screen name="assistant" options={{ href: null }} />
        <Tabs.Screen name="calculator" options={{ href: null }} />
        <Tabs.Screen name="colors" options={{ href: null }} />
        <Tabs.Screen name="orders" options={{ href: null }} />
        <Tabs.Screen name="products" options={{ href: null }} />
        <Tabs.Screen name="takeoff" options={{ href: null }} />
      </Tabs>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
