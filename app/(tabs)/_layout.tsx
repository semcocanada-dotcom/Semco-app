import { ActivityIndicator, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@constants/colors';
import { useAuth } from '@context/AuthContext';

export default function TabsLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg }}>
        <ActivityIndicator color={Colors.purple} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
          shadowColor: Colors.purple,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: Colors.purple,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={size ?? 24} />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} color={color} size={size ?? 24} />
          ),
        }}
      />
      <Tabs.Screen
        name="mileage"
        options={{
          title: 'Mileage',
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons name={focused ? 'car' : 'car-outline'} color={color} size={size ?? 24} />
          ),
        }}
      />
      <Tabs.Screen
        name="respite"
        options={{
          title: 'Respite',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-heart" color={color} size={size ?? 24} />
          ),
        }}
      />
      <Tabs.Screen
        name="claims"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} color={color} size={size ?? 24} />
          ),
        }}
      />
      <Tabs.Screen
        name="providers"
        options={{
          title: 'Providers',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} color={color} size={size ?? 24} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      {/* Reports is navigable from Profile but not in the tab bar */}
      <Tabs.Screen
        name="reports"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
