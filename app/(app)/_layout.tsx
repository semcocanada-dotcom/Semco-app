import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Colors } from '@/constants/theme';

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
  // Keep network status hooks active for the app, but do not block preview access on auth.
  useNetworkStatus();

  return (
    <Tabs
      screenOptions={({ route }) => {
        const tab = TABS.find((t) => t.name === route.name);
        return {
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            borderTopWidth: 0.5,
            height: 54,
            paddingTop: 6,
            paddingBottom: 4,
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textDisabled,
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
