import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '@constants/colors';
import type { Expense, ProviderCategory } from '@lib/types';
import { expenseRecordPresentation } from '@lib/expenseRecordState';
import { format, parseISO } from 'date-fns';

const CATEGORY_LABELS: Record<ProviderCategory, string> = {
  aba_ibi: 'ABA / IBI',
  speech_language: 'Speech & Language',
  occupational_therapy: 'Occupational Therapy',
  physical_therapy: 'Physical Therapy',
  psychology: 'Psychology',
  respite: 'Respite',
  swimming: 'Swimming',
  social_skills: 'Social Skills',
  music_therapy: 'Music Therapy',
  art_therapy: 'Art Therapy',
  assistive_technology: 'Assistive Tech',
  other: 'Other',
};

const CATEGORY_ICONS: Record<ProviderCategory, string> = {
  aba_ibi: '🧠',
  speech_language: '💬',
  occupational_therapy: '✋',
  physical_therapy: '🏃',
  psychology: '🧘',
  respite: '🏡',
  swimming: '🏊',
  social_skills: '🤝',
  music_therapy: '🎵',
  art_therapy: '🎨',
  assistive_technology: '📱',
  other: '📋',
};

function formatCAD(amount: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 2,
  }).format(amount);
}

interface ExpenseListItemProps {
  expense: Expense;
  onPress?: () => void;
}

export function ExpenseListItem({ expense, onPress }: ExpenseListItemProps) {
  const status = expenseRecordPresentation(expense.status);
  const icon = CATEGORY_ICONS[expense.category];
  const categoryLabel = CATEGORY_LABELS[expense.category];
  const providerName = expense.providers?.name;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
      }}
    >
      {/* Category icon bubble */}
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          backgroundColor: Colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>

      {/* Details */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary }} numberOfLines={1}>
          {providerName ?? categoryLabel}
        </Text>
        <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 1 }}>
          {format(parseISO(expense.expense_date), 'MMM d, yyyy')}
        </Text>
      </View>

      {/* Amount + excluded badge */}
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary }}>
          {formatCAD(expense.amount)}
        </Text>
        {expense.status === 'rejected' && (
          <View
            style={{
              marginTop: 3,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
              backgroundColor: status.bg,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '600', color: status.text }}>
              {status.label}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
