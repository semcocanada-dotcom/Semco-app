import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '@constants/colors';

type AlertVariant = 'warning' | 'danger' | 'info';

interface AlertBannerProps {
  variant: AlertVariant;
  message: string;
  subText?: string;
}

const VARIANTS: Record<AlertVariant, { bg: string; border: string; icon: string; textColor: string }> = {
  warning: { bg: '#FFFBEB', border: '#FDE68A', icon: '⚠️', textColor: '#92400E' },
  danger:  { bg: '#FFF1F2', border: '#FECDD3', icon: '🚨', textColor: '#9F1239' },
  info:    { bg: '#EFF6FF', border: '#BFDBFE', icon: 'ℹ️', textColor: '#1E40AF' },
};

export function AlertBanner({ variant, message, subText }: AlertBannerProps) {
  const { bg, border, icon, textColor } = VARIANTS[variant];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: border,
        borderRadius: 12,
        padding: 12,
      }}
    >
      <Text style={{ fontSize: 16 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: textColor }}>{message}</Text>
        {subText ? (
          <Text style={{ fontSize: 12, color: textColor, opacity: 0.8, marginTop: 2 }}>
            {subText}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
