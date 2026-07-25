import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { Colors } from '@constants/colors';
import { useAuth } from '@context/AuthContext';

export default function AuthLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg }}>
        <ActivityIndicator color={Colors.purple} />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
