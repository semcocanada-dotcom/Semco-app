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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@constants/colors';
import { useAuth } from '@context/AuthContext';
import { useChild } from '@context/ChildContext';
import { useBudget } from '@hooks/useBudget';
import { useRecentExpenses } from '@hooks/useExpenses';
import { BudgetRing } from '@components/BudgetRing';
import { StatCard, formatCAD } from '@components/StatCard';
import { AppLogo } from '@components/AppLogo';
import { ChildArt, ReceiptArt } from '@components/EmptyArt';
import { ChildSelector } from '@components/ChildSelector';
import { AlertBanner } from '@components/AlertBanner';
import { FAB } from '@components/FAB';
import { ExpenseListItem } from '@components/ExpenseListItem';

// ─────────────────────────────────────────────────────────────────────────────

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
  const isLowBal   = summary.fundingYear !== null && !isExpired && summary.remaining < 500;
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
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 18, overflow: 'visible' }}>
          <View style={{ width: '56%' }}>
            <Text style={{ fontSize: 14, color: Colors.textMuted, fontWeight: '500' }}>
              {greeting(firstName).split(',')[0]},
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 1 }}>
              <Text style={{ fontSize: 30, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 }}>
                {firstName}
              </Text>
              <AppLogo size={32} />
            </View>
            <Text style={{ fontSize: 13, color: Colors.purple, fontWeight: '600', marginTop: 4 }}>
              You're doing an amazing job! 💙
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 10 }}>
              <Pressable
                onPress={() => router.push('/(tabs)/reports')}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
                hitSlop={8}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.purple }}>Reports</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.purple }}>›</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/(tabs)/profile')}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
                hitSlop={8}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.purple }}>Profile</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.purple }}>›</Text>
              </Pressable>
            </View>
          </View>

          {/* Floating puzzle-heart hero */}
          <View style={{ flex: 1, height: 130, overflow: 'visible' }}>
            <View style={{
              position: 'absolute', right: -10, top: -10,
              width: 150, height: 120, borderRadius: 999,
              backgroundColor: '#E8EEFF', transform: [{ rotate: '-10deg' }],
            }} />
            <View style={{ position: 'absolute', right: 8, top: 0 }}>
              <AppLogo size={130} />
            </View>
            {[
              { x: 10,  y: 10,  size: 8, color: '#7C5CFC' },
              { x: 140, y: 20,  size: 6, color: '#22C55E' },
              { x: 155, y: 80,  size: 8, color: '#3B82F6' },
              { x: 130, y: 130, size: 5, color: '#EF4444' },
              { x: 5,   y: 100, size: 6, color: '#F59E0B' },
              { x: 60,  y: -5,  size: 7, color: '#EC4899' },
            ].map((d, i) => (
              <View
                key={i}
                style={{
                  position: 'absolute', left: d.x, top: d.y,
                  width: d.size, height: d.size, borderRadius: 999,
                  backgroundColor: d.color,
                }}
              />
            ))}
          </View>
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
            <ChildArt />
            <Text style={{ fontSize: 17, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center', marginTop: 12 }}>
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
              <AlertBanner
                variant="danger"
                message="Grant year has ended"
                subText="Check the official ASD-IF page or contact the Ministry of Social Services about renewal."
              />
            )}
            {isLowBal && (
              <AlertBanner variant="warning" message={`Low balance — ${formatCAD(summary.remaining)} remaining`} subText="You're nearing the active funding-year amount you entered." />
            )}
            {isLowDays && (
              <AlertBanner variant="info" message={`${summary.daysRemaining} days left in grant year`} subText="Plan your remaining therapy bookings soon." />
            )}
          </View>
        )}

        {/* Rainbow arc budget card */}
        {activeChild && summary.fundingYear && (
          <Animated.View entering={FadeInDown.duration(420).delay(40)} style={{ paddingHorizontal: 20, marginBottom: 14 }}>
            <BudgetRing
              totalBudget={summary.totalBudget}
              totalSpent={summary.totalSpent}
              remaining={summary.remaining}
              yearLabel={summary.fundingYear?.label}
            />
          </Animated.View>
        )}

        {/* Stat cards */}
        {activeChild && summary.fundingYear && (
          <Animated.View entering={FadeInDown.duration(420).delay(110)} style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 18 }}>
            <StatCard
              label="Total Spent"
              value={formatCAD(summary.totalSpent)}
              subLabel="Expenses logged"
              accent="blue"
              icon="wallet-outline"
              onPress={() => router.push('/(tabs)/expenses')}
            />
            <StatCard
              label="Remaining"
              value={formatCAD(Math.max(summary.remaining, 0))}
              subLabel={`of ${formatCAD(summary.totalBudget)}`}
              accent="green"
              icon="wallet"
              onPress={() => router.push('/(tabs)/reports')}
            />
          </Animated.View>
        )}

        {activeChild && !budgetLoading && !summary.fundingYear && (
          <View style={{ marginHorizontal: 20, marginBottom: 18, padding: 18, borderRadius: 16, backgroundColor: Colors.surface }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary }}>Add a funding year</Text>
            <Text style={{ fontSize: 13, color: Colors.textMuted, marginTop: 5, lineHeight: 19 }}>
              Enter the amount Saskatchewan actually approved before using budget totals. Any age-based value shown
              during setup is an editable estimate, not an eligibility or approval decision.
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/profile')} hitSlop={8} style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.purple }}>Open Profile</Text>
            </Pressable>
          </View>
        )}

        {/* User-recorded mileage estimate (grant year) */}
        {activeChild && (
          <Animated.View entering={FadeInDown.duration(420).delay(180)} style={{ paddingHorizontal: 20, marginBottom: 18 }}>
            <Pressable
              onPress={() => router.push('/(tabs)/mileage')}
              style={({ pressed }) => [{
                backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
                flexDirection: 'row', alignItems: 'center', gap: 12,
                shadowColor: '#1E1B4B', shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.07, shadowRadius: 10, elevation: 2,
              }, pressed ? { opacity: 0.85 } : null]}
            >
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#14B8A61A', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 20 }}>🚗</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#0F766E', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  Recorded Mileage Estimate
                </Text>
                <Text style={{ fontSize: 13, color: Colors.textMuted, marginTop: 1 }}>
                  This grant year
                </Text>
              </View>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#15803D', letterSpacing: -0.5 }}>
                {formatCAD(summary.totalMileage)}
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Recent expenses */}
        {activeChild && (
          <Animated.View entering={FadeInDown.duration(420).delay(250)} style={{ paddingHorizontal: 20 }}>
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
                  <ReceiptArt size={84} />
                  <Text style={{ fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginTop: 8 }}>No expenses yet. Tap + to add one.</Text>
                </View>
              ) : (
                expenses.map((expense, index) => (
                  <View key={expense.id}>
                    <ExpenseListItem
                      expense={expense}
                      onPress={() => router.push(`/(tabs)/expenses?openExpenseId=${expense.id}`)}
                    />
                    {index < expenses.length - 1 && <View style={{ height: 1, backgroundColor: Colors.border }} />}
                  </View>
                ))
              )}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <FAB onPress={() => router.push('/(tabs)/expenses')} />

    </SafeAreaView>
  );
}
