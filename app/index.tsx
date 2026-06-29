import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { Colors } from '@constants/colors';
import { useAuth } from '@context/AuthContext';

// Deterministic entry route. Without this, the initial path "/" is unmatched,
// which in a production build races against navigation and can crash on launch.
// Here we render a stable loading view while auth resolves, then redirect
// declaratively — no imperative navigation before the root is mounted.
export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.purple} />
      </View>
    );
  }

  return <Redirect href={session ? '/(tabs)' : '/(auth)/login'} />;
}
