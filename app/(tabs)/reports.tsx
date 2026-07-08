import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format, parseISO } from 'date-fns';
import { Colors } from '@constants/colors';
import { AppLogo } from '@components/AppLogo';
import { supabase } from '@lib/supabase';
import type { Expense, MileageLog, ProviderCategory, Child, FundingYear } from '@lib/types';
import { useChild } from '@context/ChildContext';
import { useBudget } from '@hooks/useBudget';
import { useAuth } from '@context/AuthContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CAD = (n: number) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n);

// User-entered values (names, descriptions, health card) must be escaped
// before interpolation into the report HTML, mirroring the edge function.
const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const CATEGORY_LABELS: Record<ProviderCategory, string> = {
  aba_ibi:              'ABA / IBI (Applied Behaviour Analysis)',
  speech_language:      'Speech-Language Pathology',
  occupational_therapy: 'Occupational Therapy',
  physical_therapy:     'Physical Therapy',
  psychology:           'Psychology / Counselling',
  respite:              'Respite Care',
  swimming:             'Swimming / Aquatic Therapy',
  social_skills:        'Social Skills Training',
  music_therapy:        'Music Therapy',
  art_therapy:          'Art Therapy',
  assistive_technology: 'Assistive Technology',
  other:                'Other',
};

const CATEGORY_EMOJI: Record<ProviderCategory, string> = {
  aba_ibi: '🧩', speech_language: '🗣️', occupational_therapy: '✋',
  physical_therapy: '🏃', psychology: '🧠', respite: '🏠',
  swimming: '🏊', social_skills: '👫', music_therapy: '🎵',
  art_therapy: '🎨', assistive_technology: '📱', other: '📋',
};

interface CategorySummary {
  category: ProviderCategory;
  approved: number;
  pending: number;
  count: number;
}

// ─── PDF HTML builder ─────────────────────────────────────────────────────────

function buildPDF(
  child: Child,
  fundingYear: FundingYear,
  expenses: Expense[],
  mileageLogs: MileageLog[],
  parentName: string,
): string {
  const approved  = expenses.filter(e => e.status === 'approved');
  const pending   = expenses.filter(e => e.status === 'pending' || e.status === 'submitted');
  const totalApproved = approved.reduce((s, e) => s + Number(e.amount), 0);
  const totalPending  = pending.reduce((s, e) => s + Number(e.amount), 0);
  const totalMileage  = mileageLogs.reduce((s, m) => s + Number(m.reimbursement_amount), 0);
  const totalUsed     = totalApproved + totalPending + totalMileage;
  const remaining     = Number(fundingYear.total_budget) - totalUsed;

  // Category breakdown
  const catMap: Partial<Record<ProviderCategory, { approved: number; pending: number; count: number }>> = {};
  for (const e of expenses.filter(e => e.status !== 'rejected')) {
    if (!catMap[e.category]) catMap[e.category] = { approved: 0, pending: 0, count: 0 };
    catMap[e.category]!.count++;
    if (e.status === 'approved') catMap[e.category]!.approved += Number(e.amount);
    else catMap[e.category]!.pending += Number(e.amount);
  }

  const catRows = Object.entries(catMap)
    .sort((a, b) => (b[1].approved + b[1].pending) - (a[1].approved + a[1].pending))
    .map(([cat, data]) => `
      <tr>
        <td>${CATEGORY_LABELS[cat as ProviderCategory] ?? cat}</td>
        <td class="num">${data.count}</td>
        <td class="num green">${CAD(data.approved)}</td>
        <td class="num amber">${CAD(data.pending)}</td>
        <td class="num bold">${CAD(data.approved + data.pending)}</td>
      </tr>`)
    .join('');

  const expRows = [...expenses]
    .sort((a, b) => b.expense_date.localeCompare(a.expense_date))
    .map(e => {
      const statusColor = e.status === 'approved' ? '#15803D' : e.status === 'rejected' ? '#BE123C' : '#92400E';
      const provName = (e as any).providers?.name ?? '—';
      return `
      <tr>
        <td>${format(parseISO(e.expense_date), 'MMM d, yyyy')}</td>
        <td>${esc(provName)}</td>
        <td>${esc(CATEGORY_LABELS[e.category] ?? e.category)}</td>
        <td>${esc(e.description ?? '—')}</td>
        <td class="num bold">${CAD(Number(e.amount))}</td>
        <td style="color:${statusColor};font-weight:600;text-transform:capitalize">${e.status}</td>
      </tr>`;
    }).join('');

  const mileageRows = mileageLogs.length > 0 ? `
    <h2>Mileage Log</h2>
    <table>
      <thead><tr><th>Date</th><th>Description</th><th class="num">Distance (km)</th><th class="num">Rate/km</th><th class="num">Reimbursement</th></tr></thead>
      <tbody>
        ${mileageLogs.map(m => `
          <tr>
            <td>${format(parseISO(m.trip_date), 'MMM d, yyyy')}</td>
            <td>${esc(m.description ?? '—')}${m.is_round_trip ? ' (round trip)' : ''}</td>
            <td class="num">${m.distance_km} km</td>
            <td class="num">$${Number(m.rate_per_km).toFixed(4)}</td>
            <td class="num bold">${CAD(Number(m.reimbursement_amount))}</td>
          </tr>`).join('')}
        <tr class="total-row">
          <td colspan="4"><strong>Total Mileage Reimbursement</strong></td>
          <td class="num bold green">${CAD(totalMileage)}</td>
        </tr>
      </tbody>
    </table>` : '';

  const dob = child.date_of_birth
    ? format(parseISO(child.date_of_birth), 'MMMM d, yyyy') : '—';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, Arial, sans-serif; font-size: 13px; color: #1E1B4B; background: #fff; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 3px solid #7C5CFC; }
  .header-left h1 { font-size: 22px; font-weight: 800; color: #7C5CFC; }
  .header-left p { font-size: 12px; color: #6B7280; margin-top: 4px; }
  .header-right { text-align: right; font-size: 12px; color: #6B7280; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
  .info-card { background: #F3F0FF; border-radius: 10px; padding: 14px 16px; }
  .info-card h3 { font-size: 10px; font-weight: 700; color: #7C5CFC; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .info-card p { font-size: 13px; color: #1E1B4B; line-height: 1.6; }
  .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
  .summary-card { border-radius: 10px; padding: 14px; text-align: center; }
  .summary-card.purple { background: #EDE9FE; }
  .summary-card.green  { background: #DCFCE7; }
  .summary-card.amber  { background: #FEF3C7; }
  .summary-card.red    { background: #FEE2E2; }
  .summary-card .amount { font-size: 18px; font-weight: 800; margin-bottom: 2px; }
  .summary-card.purple .amount { color: #7C5CFC; }
  .summary-card.green  .amount { color: #15803D; }
  .summary-card.amber  .amount { color: #92400E; }
  .summary-card.red    .amount { color: #BE123C; }
  .summary-card .label { font-size: 10px; color: #6B7280; font-weight: 600; text-transform: uppercase; }
  h2 { font-size: 15px; font-weight: 700; color: #1E1B4B; margin: 24px 0 10px; border-left: 4px solid #7C5CFC; padding-left: 10px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  th { background: #F3F0FF; color: #7C5CFC; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; padding: 8px 10px; text-align: left; }
  td { padding: 8px 10px; border-bottom: 1px solid #E8E4F3; font-size: 12px; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .num { text-align: right; }
  .bold { font-weight: 700; }
  .green { color: #15803D; }
  .amber { color: #92400E; }
  .total-row td { background: #F3F0FF; font-weight: 700; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E8E4F3; font-size: 11px; color: #9CA3AF; text-align: center; }
  .utilization-bar { background: #E8E4F3; border-radius: 6px; height: 12px; margin: 10px 0 6px; overflow: hidden; display: flex; }
  .util-approved { background: #7C5CFC; height: 100%; }
  .util-pending  { background: #F59E0B; height: 100%; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>

<div class="header">
  <div class="header-left">
    <h1>Saskatchewan IAF Grant Report</h1>
    <p>Individualized Autism Funding — Expense Audit Summary</p>
  </div>
  <div class="header-right">
    <p>Generated: ${format(new Date(), 'MMMM d, yyyy')}</p>
    <p>Funding Year: ${fundingYear.label}</p>
  </div>
</div>

<div class="info-grid">
  <div class="info-card">
    <h3>Child Information</h3>
    <p><strong>${esc(child.name)}</strong></p>
    ${child.date_of_birth ? `<p>Date of Birth: ${dob}</p>` : ''}
    ${child.health_card_number ? `<p>Health Card: ${esc(child.health_card_number)}</p>` : ''}
  </div>
  <div class="info-card">
    <h3>Funding Year</h3>
    <p><strong>${fundingYear.label}</strong></p>
    <p>${format(parseISO(fundingYear.start_date), 'MMMM d, yyyy')} – ${format(parseISO(fundingYear.end_date), 'MMMM d, yyyy')}</p>
    <p>Total Budget: <strong>${CAD(Number(fundingYear.total_budget))}</strong></p>
  </div>
</div>

<div class="summary-grid">
  <div class="summary-card purple">
    <div class="amount">${CAD(Number(fundingYear.total_budget))}</div>
    <div class="label">Total Budget</div>
  </div>
  <div class="summary-card green">
    <div class="amount">${CAD(totalApproved)}</div>
    <div class="label">Approved</div>
  </div>
  <div class="summary-card amber">
    <div class="amount">${CAD(totalPending + totalMileage)}</div>
    <div class="label">Pending / Mileage</div>
  </div>
  <div class="summary-card ${remaining > 0 ? 'red' : 'green'}">
    <div class="amount">${CAD(Math.max(remaining, 0))}</div>
    <div class="label">Remaining</div>
  </div>
</div>

<div style="margin-bottom: 24px;">
  <div style="display:flex;justify-content:space-between;font-size:11px;color:#6B7280;margin-bottom:4px;">
    <span>Grant utilization: ${Math.min(Math.round((totalUsed / Number(fundingYear.total_budget)) * 100), 100)}%</span>
    <span>${CAD(totalUsed)} of ${CAD(Number(fundingYear.total_budget))}</span>
  </div>
  <div class="utilization-bar">
    <div class="util-approved" style="width:${Math.min((totalApproved / Number(fundingYear.total_budget)) * 100, 100)}%"></div>
    <div class="util-pending"  style="width:${Math.min((totalPending / Number(fundingYear.total_budget)) * 100, 100 - (totalApproved / Number(fundingYear.total_budget)) * 100)}%"></div>
  </div>
</div>

<h2>Spending by Category</h2>
<table>
  <thead>
    <tr>
      <th>Category</th>
      <th class="num">Sessions</th>
      <th class="num">Approved</th>
      <th class="num">Pending</th>
      <th class="num">Total</th>
    </tr>
  </thead>
  <tbody>
    ${catRows}
    ${totalMileage > 0 ? `<tr><td>Mileage Reimbursement</td><td class="num">${mileageLogs.length}</td><td class="num green">${CAD(totalMileage)}</td><td class="num">—</td><td class="num bold">${CAD(totalMileage)}</td></tr>` : ''}
    <tr class="total-row">
      <td><strong>TOTAL</strong></td>
      <td class="num">${expenses.length}</td>
      <td class="num green">${CAD(totalApproved)}</td>
      <td class="num amber">${CAD(totalPending)}</td>
      <td class="num bold">${CAD(totalUsed)}</td>
    </tr>
  </tbody>
</table>

<h2>Itemized Expense List</h2>
<table>
  <thead>
    <tr>
      <th>Date</th>
      <th>Provider</th>
      <th>Category</th>
      <th>Description</th>
      <th class="num">Amount</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    ${expRows || '<tr><td colspan="6" style="text-align:center;color:#9CA3AF;">No expenses logged</td></tr>'}
  </tbody>
</table>

${mileageRows}

<div class="footer">
  <p>This report was generated by Autism Fund Tracker — Saskatchewan ASD-IF</p>
  <p>Parent/Guardian: ${esc(parentName)} · Generated ${format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')}</p>
  <p>For questions about the Individualized Autism Funding program, contact the Ministry of Health: 1-800-667-7766</p>
</div>

</body>
</html>`;
}

// ─── CategoryCard ─────────────────────────────────────────────────────────────

function CategoryCard({ cat, totalBudget }: { cat: CategorySummary; totalBudget: number }) {
  const total = cat.approved + cat.pending;
  const pct   = Math.min((total / totalBudget) * 100, 100);
  return (
    <View style={s.catCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <Text style={{ fontSize: 22 }}>{CATEGORY_EMOJI[cat.category]}</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.catName} numberOfLines={1}>{CATEGORY_LABELS[cat.category]}</Text>
          <Text style={s.catCount}>{cat.count} expense{cat.count !== 1 ? 's' : ''}</Text>
        </View>
        <Text style={s.catTotal}>{CAD(total)}</Text>
      </View>
      <View style={s.miniTrack}>
        <View style={[s.miniApproved, { width: `${Math.min((cat.approved / totalBudget) * 100, 100)}%` }]} />
        <View style={[s.miniPending,  { width: `${Math.min((cat.pending  / totalBudget) * 100, 100)}%` }]} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        {cat.approved > 0 && <Text style={s.miniLabel}>✓ {CAD(cat.approved)} approved</Text>}
        {cat.pending  > 0 && <Text style={[s.miniLabel, { color: Colors.amber }]}>◷ {CAD(cat.pending)} pending</Text>}
        <Text style={[s.miniLabel, { marginLeft: 'auto' }]}>{pct.toFixed(1)}% of grant</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ReportsScreen() {
  const { activeChild }                                  = useChild();
  const { profile }                                      = useAuth();
  const { summary, loading: bLoading }                   = useBudget(activeChild?.id ?? null);
  const [expenses,    setExpenses]                       = useState<Expense[]>([]);
  const [mileageLogs, setMileageLogs]                    = useState<MileageLog[]>([]);
  const [loadingData, setLoadingData]                    = useState(true);
  const [generating,  setGenerating]                     = useState(false);

  const fetchData = useCallback(async () => {
    if (!activeChild || !summary.fundingYear) { setLoadingData(false); return; }
    setLoadingData(true);
    const [expRes, milRes] = await Promise.all([
      supabase
        .from('expenses')
        .select('*, providers(name, category)')
        .eq('child_id', activeChild.id)
        .eq('funding_year_id', summary.fundingYear.id)
        .order('expense_date', { ascending: false }),
      supabase
        .from('mileage_logs')
        .select('*')
        .eq('child_id', activeChild.id)
        .eq('funding_year_id', summary.fundingYear.id)
        .order('trip_date', { ascending: false }),
    ]);
    setExpenses((expRes.data ?? []) as Expense[]);
    setMileageLogs((milRes.data ?? []) as MileageLog[]);
    setLoadingData(false);
  }, [activeChild, summary.fundingYear]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Build category summaries
  const catSummaries: CategorySummary[] = (() => {
    const map: Partial<Record<ProviderCategory, CategorySummary>> = {};
    for (const e of expenses.filter(e => e.status !== 'rejected')) {
      if (!map[e.category]) map[e.category] = { category: e.category, approved: 0, pending: 0, count: 0 };
      map[e.category]!.count++;
      if (e.status === 'approved') map[e.category]!.approved += Number(e.amount);
      else map[e.category]!.pending += Number(e.amount);
    }
    return Object.values(map).sort((a, b) => (b.approved + b.pending) - (a.approved + a.pending)) as CategorySummary[];
  })();

  async function generatePDF() {
    if (!activeChild || !summary.fundingYear) return;
    setGenerating(true);
    try {
      const html = buildPDF(
        activeChild,
        summary.fundingYear,
        expenses,
        mileageLogs,
        profile?.full_name ?? 'Parent/Guardian',
      );
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `IAF Grant Report — ${activeChild.name}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF saved', `File saved to: ${uri}`);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not generate PDF.');
    } finally {
      setGenerating(false);
    }
  }

  const loading = bLoading || loadingData;
  const fy      = summary.fundingYear;
  const utilizationPct = fy
    ? Math.min(((summary.totalSpent + summary.totalPending + summary.totalMileage) / summary.totalBudget) * 100, 100)
    : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AppLogo size={30} />
            <Text style={s.headerTitle}>Reports</Text>
          </View>
          {activeChild && <Text style={s.headerSub}>Grant summary for {activeChild.name} 💙</Text>}
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.purple} style={{ marginTop: 60 }} />
        ) : !fy ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📅</Text>
            <Text style={s.emptyTitle}>No active funding year</Text>
            <Text style={s.emptySub}>Add a funding year to generate reports</Text>
          </View>
        ) : (
          <>
            {/* Generate button — prominent at top */}
            <TouchableOpacity onPress={generatePDF} disabled={generating} activeOpacity={0.85}>
              <LinearGradient
                colors={Colors.gradients.purple as unknown as string[]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.generateBtn}
              >
                {generating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={s.generateIcon}>📄</Text>
                    <View>
                      <Text style={s.generateTitle}>Generate PDF Report</Text>
                      <Text style={s.generateSub}>For grant submission &amp; audit</Text>
                    </View>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Budget summary */}
            <Text style={s.sectionLabel}>Budget Summary · {fy.label}</Text>
            <View style={s.summaryGrid}>
              {[
                { label: 'Total Budget',  value: summary.totalBudget,  color: Colors.purple },
                { label: 'Approved',      value: summary.totalSpent,   color: Colors.green  },
                { label: 'Pending',       value: summary.totalPending, color: Colors.amber  },
                { label: 'Remaining',     value: Math.max(summary.remaining, 0), color: summary.remaining > 0 ? Colors.coral : Colors.green },
              ].map(item => (
                <View key={item.label} style={s.summaryCard}>
                  <Text style={[s.summaryAmount, { color: item.color }]}>{CAD(item.value)}</Text>
                  <Text style={s.summaryLabel}>{item.label}</Text>
                </View>
              ))}
            </View>

            {/* Utilization bar */}
            <View style={s.utilCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={s.utilTitle}>Grant Utilization</Text>
                <Text style={[s.utilPct, { color: utilizationPct >= 90 ? Colors.green : utilizationPct >= 60 ? Colors.amber : Colors.coral }]}>
                  {utilizationPct.toFixed(1)}%
                </Text>
              </View>
              <View style={s.utilTrack}>
                <View style={[s.utilApproved, { width: `${Math.min((summary.totalSpent / summary.totalBudget) * 100, 100)}%` }]} />
                <View style={[s.utilPending,  { width: `${Math.min((summary.totalPending / summary.totalBudget) * 100, 100)}%` }]} />
              </View>
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                <View style={s.legendRow}><View style={[s.dot, { backgroundColor: Colors.purple }]} /><Text style={s.legendText}>Approved</Text></View>
                <View style={s.legendRow}><View style={[s.dot, { backgroundColor: Colors.amber  }]} /><Text style={s.legendText}>Pending</Text></View>
                {summary.totalMileage > 0 && (
                  <View style={s.legendRow}><View style={[s.dot, { backgroundColor: Colors.teal }]} /><Text style={s.legendText}>Mileage {CAD(summary.totalMileage)}</Text></View>
                )}
              </View>
              <Text style={s.utilHint}>
                {summary.daysRemaining > 0
                  ? `${summary.daysRemaining} days remaining in ${fy.label}`
                  : `${fy.label} has ended`}
              </Text>
            </View>

            {/* Category breakdown */}
            {catSummaries.length > 0 && (
              <>
                <Text style={s.sectionLabel}>Spending by Category</Text>
                <View style={{ gap: 8 }}>
                  {catSummaries.map(cat => (
                    <CategoryCard key={cat.category} cat={cat} totalBudget={summary.totalBudget} />
                  ))}
                  {summary.totalMileage > 0 && (
                    <View style={s.catCard}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Text style={{ fontSize: 22 }}>🚗</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={s.catName}>Mileage Reimbursement</Text>
                          <Text style={s.catCount}>{mileageLogs.length} trip{mileageLogs.length !== 1 ? 's' : ''}</Text>
                        </View>
                        <Text style={s.catTotal}>{CAD(summary.totalMileage)}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </>
            )}

            {/* What's in the PDF */}
            <Text style={s.sectionLabel}>PDF Report Includes</Text>
            <View style={s.pdfContentsCard}>
              {[
                'Child name, date of birth & health card number',
                'Funding year dates and total budget',
                'Budget utilization bar (approved vs pending)',
                'Spending breakdown table by category',
                'Full itemized expense list with dates & providers',
                'Mileage log with distance, rate & reimbursement',
                'Government contact information',
              ].map((item, i) => (
                <View key={i} style={[s.pdfItem, i > 0 && { borderTopWidth: 1, borderColor: Colors.border }]}>
                  <Text style={{ color: Colors.green, fontWeight: '700', fontSize: 14 }}>✓</Text>
                  <Text style={s.pdfItemText}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Empty state */}
            {expenses.length === 0 && (
              <View style={s.noExpenses}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🧾</Text>
                <Text style={{ fontWeight: '600', color: Colors.textPrimary }}>No expenses logged yet</Text>
                <Text style={{ color: Colors.textMuted, fontSize: 13, marginTop: 4 }}>Log expenses to see category breakdowns here</Text>
              </View>
            )}

            {/* Second generate button at bottom */}
            <TouchableOpacity onPress={generatePDF} disabled={generating} activeOpacity={0.85} style={{ marginTop: 8 }}>
              <LinearGradient
                colors={Colors.gradients.purple as unknown as string[]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.generateBtn}
              >
                {generating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={s.generateIcon}>📤</Text>
                    <View>
                      <Text style={s.generateTitle}>Share / Save PDF</Text>
                      <Text style={s.generateSub}>{expenses.length} expense{expenses.length !== 1 ? 's' : ''} · {CAD(summary.totalSpent + summary.totalPending)} logged</Text>
                    </View>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  scroll:   { paddingHorizontal: 16, paddingBottom: 48, paddingTop: 8, gap: 10 },
  header:   { gap: 3, paddingTop: 8, paddingBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  headerSub:   { fontSize: 14, color: Colors.textMuted },

  empty:      {
    alignItems: 'center', gap: 6, marginTop: 24,
    backgroundColor: Colors.surface, borderRadius: 18, padding: 32,
    borderWidth: 1, borderColor: Colors.border,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  emptySub:   { fontSize: 14, color: Colors.textMuted },

  // Generate button
  generateBtn: { borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  generateIcon:  { fontSize: 32 },
  generateTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  generateSub:   { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 6 },

  // Summary grid
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summaryCard: {
    flex: 1, minWidth: '44%',
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, padding: 14,
  },
  summaryAmount: { fontSize: 18, fontWeight: '800' },
  summaryLabel:  { fontSize: 11, color: Colors.textMuted, marginTop: 2, fontWeight: '500' },

  // Utilization
  utilCard: { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 16, gap: 0 },
  utilTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  utilPct:   { fontSize: 16, fontWeight: '800' },
  utilTrack: { height: 12, backgroundColor: Colors.border, borderRadius: 6, flexDirection: 'row', overflow: 'hidden' },
  utilApproved: { height: '100%', backgroundColor: Colors.purple },
  utilPending:  { height: '100%', backgroundColor: Colors.amber  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot:       { width: 8, height: 8, borderRadius: 4 },
  legendText:{ fontSize: 12, color: Colors.textSecondary },
  utilHint:  { fontSize: 11, color: Colors.textMuted, marginTop: 4 },

  // Category cards
  catCard: { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14 },
  catName:  { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  catCount: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  catTotal: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  miniTrack:    { height: 6, backgroundColor: Colors.border, borderRadius: 3, flexDirection: 'row', overflow: 'hidden' },
  miniApproved: { height: '100%', backgroundColor: Colors.purple },
  miniPending:  { height: '100%', backgroundColor: Colors.amber  },
  miniLabel:    { fontSize: 11, color: Colors.textSecondary },

  // PDF contents
  pdfContentsCard: { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  pdfItem:     { flexDirection: 'row', alignItems: 'flex-start', padding: 12, gap: 10 },
  pdfItemText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },

  noExpenses: { alignItems: 'center', paddingVertical: 24, gap: 4 },
});
