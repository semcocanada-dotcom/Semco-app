import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@constants/colors';

export default function ReportsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📊</Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' }}>
          Reports
        </Text>
        <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
          Generate PDF reports for grant submission with expense summaries by category. Coming soon.
        </Text>
      </View>
    </SafeAreaView>
  );
}
