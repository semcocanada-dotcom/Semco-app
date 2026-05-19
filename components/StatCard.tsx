import React from 'react';
import { Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@constants/colors';

type GradientKey = keyof typeof Colors.gradients;

interface StatCardProps {
  label: string;
  value: string;
  subLabel?: string;
  gradient: GradientKey;
}

function formatCAD(amount: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function StatCard({ label, value, subLabel, gradient }: StatCardProps) {
  const colors = Colors.gradients[gradient];

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flex: 1,
        borderRadius: 16,
        padding: 16,
        minHeight: 90,
        shadowColor: colors[1],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginTop: 6, letterSpacing: -0.5 }}>
        {value}
      </Text>
      {subLabel ? (
        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
          {subLabel}
        </Text>
      ) : null}
    </LinearGradient>
  );
}

export { formatCAD };
