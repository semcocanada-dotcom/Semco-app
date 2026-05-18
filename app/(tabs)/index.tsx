import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@constants/colors';
import { useAuth } from '@context/AuthContext';
import { useChild } from '@context/ChildContext';
import { useBudget } from '@hooks/useBudget';
import { useRecentExpenses } from '@hooks/useExpenses';
import { BudgetRing } from '@components/BudgetRing';
import { formatCAD } from '@components/StatCard';
import { ChildSelector } from '@components/ChildSelector';
import { AlertBanner } from '@components/AlertBanner';
import { FAB } from '@components/FAB';
import { ExpenseListItem } from '@components/ExpenseListItem';

function greeting(name: string) {
  const h = new Date().getHours();
  const time = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  return `${time}, ${name}`;
}

export default function DashboardScreen() {
  const { profile } = useAuth();
  const { children, activeChild, setActiveChild, refetch: refetchChildren } = useChild();
  const { summary, loading: budgetLoading, refetch: refetchBudget } = useBudget(activeChild?.id ?? null);
  const { expenses, loading: expensesLoading, refetch: refetchExpenses } = useRecentExpenses(activeChild?.id ?? null);

  const isRefreshing = budgetLoading || expensesLoading;
  const onRefresh = useCallback(async () => {
    await Promise.all([refetchChildren(), refetchBudget(), refetchExpenses()]);
  }, [refetchChildren, refetchBudget, refetchExpenses]);

  const firstName  = profile?.full_name?.split(' ')[0] ?? 'there';
  const isExpired  = summary.daysRemaining === 0 && summary.fundingYear !== null;
  const isLowBal   = !isExpired && summary.remaining < 500;
  const isLowDays  = !isExpired && summary.daysRemaining > 0 && summary.daysRemaining < 30;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.purple} />
        }
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, color: Colors.textMuted, fontWeight: '500' }}>
              {greeting(firstName)}
            </Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, marginTop: 1 }}>
              {firstName} 🧩
            </Text>
            <Text style={{ fontSize: 13, color: Colors.purple, fontWeight: '600', marginTop: 3 }}>
              You're doing an amazing job! 💙
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/reports')}
            style={{
              backgroundColor: Colors.surfaceAlt,
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 8,
              marginTop: 4,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.purple }}>Reports</Text>
          </Pressable>
        </View>

        {/* Child selector */}
        {children.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <ChildSelector children={children} activeChild={activeChild} onSelect={setActiveChild} />
          </View>
        )}

        {/* No children state */}
        {children.length === 0 && (
          <View style={{ alignItems: 'center', padding: 32 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>👶</Text>
            <Text style={{ fontSize: 17, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' }}>
              Add your first child
            </Text>
            <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 6 }}>
              Set up a child profile to start tracking their autism funding grant.
            </Text>
          </View>
        )}

        {/* Alert banners */}
        {(isExpired || isLowBal || isLowDays) && (
          <View style={{ paddingHorizontal: 20, gap: 8, marginBottom: 16 }}>
            {isExpired && (
              <AlertBanner variant="danger" message="Grant year has ended" subText="Contact Saskatchewan Education to renew your child's funding." />
            )}
            {isLowBal && (
              <AlertBanner variant="warning" message={`Low balance — ${formatCAD(summary.remaining)} remaining`} subText="You're nearing your $8,000 annual limit." />
            )}
            {isLowDays && (
              <AlertBanner variant="info" message={`${summary.daysRemaining} days left in grant year`} subText="Plan your remaining therapy bookings soon." />
            )}
          </View>
        )}

        {/* Rainbow arc budget card */}
        {activeChild && (
          <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
            <BudgetRing
              totalBudget={summary.totalBudget}
              totalSpent={summary.totalSpent}
              totalPending={summary.totalPending}
              remaining={summary.remaining}
              yearLabel={summary.fundingYear?.label}
            />
          </View>
        )}

        {/* Mileage pill */}
        {activeChild && (
          <View style={{ paddingHorizontal: 20, marginBottom: 18 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: Colors.surface,
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: Colors.border,
            }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textSecondary }}>🚗  Mileage Reimbursement</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.teal }}>{formatCAD(summary.totalMileage)}</Text>
            </View>
          </View>
        )}

        {/* Recent expenses */}
        {activeChild && (
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{
              backgroundColor: Colors.surface,
              borderRadius: 20,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.purple + '18', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 16 }}>🧾</Text>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary }}>Recent Expenses</Text>
                </View>
                <Pressable onPress={() => router.push('/(tabs)/expenses')}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.purple }}>See all →</Text>
                </Pressable>
              </View>

              {expenses.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                  <Text style={{ fontSize: 28, marginBottom: 8 }}>🧾</Text>
                  <Text style={{ fontSize: 14, color: Colors.textMuted, textAlign: 'center' }}>No expenses yet. Tap + to add one.</Text>
                </View>
              ) : (
                expenses.map((expense, index) => (
                  <View key={expense.id}>
                    <ExpenseListItem expense={expense} />
                    {index < expenses.length - 1 && <View style={{ height: 1, backgroundColor: Colors.border }} />}
                  </View>
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <FAB onPress={() => router.push('/(tabs)/expenses')} />
    </SafeAreaView>
  );
}
