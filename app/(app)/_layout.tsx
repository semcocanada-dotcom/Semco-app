import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Colors, Typography } from '@/constants/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  title: string;
  icon: IoniconsName;
  iconFocused: IoniconsName;
}

const TABS: TabConfig[] = [
  { name: 'assistant', title: 'Assistant', icon: 'chatbubble-outline', iconFocused: 'chatbubble' },
  { name: 'calculator', title: 'Calculator', icon: 'calculator-outline', iconFocused: 'calculator' },
  { name: 'colors', title: 'Colors', icon: 'color-palette-outline', iconFocused: 'color-palette' },
  { name: 'projects', title: 'Projects', icon: 'folder-outline', iconFocused: 'folder' },
  { name: 'products', title: 'Products', icon: 'library-outline', iconFocused: 'library' },
];

export default function AppLayout() {
  const { session, isInitialized } = useAuthStore();
  const router = useRouter();

  // Kick to network status subscription
  useNetworkStatus();

  useEffect(() => {
    if (isInitialized && !session) {
      router.replace('/(auth)/login');
    }
  }, [session, isInitialized, router]);

  return (
    <Tabs
      screenOptions={({ route }) => {
        const tab = TABS.find((t) => t.name === route.name);
        return {
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            borderTopWidth: 1,
            height: 60,
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textDisabled,
          tabBarLabelStyle: { fontSize: Typography.size.xs, fontWeight: Typography.weight.medium },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? (tab?.iconFocused ?? tab?.icon ?? 'ellipse') : (tab?.icon ?? 'ellipse')}
              size={size}
              color={color}
            />
          ),
        };
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title }} />
      ))}
    </Tabs>
  );
}
