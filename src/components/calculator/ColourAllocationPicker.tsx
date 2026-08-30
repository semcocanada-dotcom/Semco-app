import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchBar } from '@/components/ui/SearchBar';
import {
  COLOUR_TINT_STATS,
  COLOUR_SWATCH_STATS,
  getColourChargeRecord,
  searchTintColours,
} from '@/knowledge/colour-charges';
import type {
  CalculatorColourMode,
  CalculatorColourSelection,
} from '@/hooks/useCalculator';
import { Colors, Fonts, Layout, Radius, Spacing, Typography } from '@/constants/theme';

interface ColourAllocationPickerProps {
  mode: CalculatorColourMode;
  selections: CalculatorColourSelection[];
  totalAreaSqft: string;
  onModeChange: (mode: CalculatorColourMode) => void;
  onSelectColour: (slotId: string, colourId: string) => void;
  onAreaChange: (slotId: string, areaSqft: string) => void;
  onAddColour: () => void;
  onRemoveColour: (slotId: string) => void;
}

export function ColourAllocationPicker({
  mode,
  selections,
  totalAreaSqft,
  onModeChange,
  onSelectColour,
  onAreaChange,
  onAddColour,
  onRemoveColour,
}: ColourAllocationPickerProps) {
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const options = useMemo(() => searchTintColours(query), [query]);
  const totalArea = Number.parseFloat(totalAreaSqft);
  const allocatedArea = mode === 'multiple'
    ? selections.reduce((total, selection) => {
        const value = Number.parseFloat(selection.areaSqft);
        return total + (Number.isFinite(value) ? value : 0);
      }, 0)
    : Number.isFinite(totalArea) && selections[0]?.colourId ? totalArea : 0;
  const remainingArea = Number.isFinite(totalArea) ? totalArea - allocatedArea : null;
  const activeColourId = selections.find((selection) => selection.slotId === activeSlotId)?.colourId;

  function openPicker(slotId: string) {
    setActiveSlotId(slotId);
    setQuery('');
  }

  function chooseColour(colourId: string) {
    if (!activeSlotId) return;
    onSelectColour(activeSlotId, colourId);
    setActiveSlotId(null);
    setQuery('');
  }

  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <View style={styles.titleIcon}>
          <Ionicons name="color-palette-outline" size={20} color={Colors.darkTeal} />
        </View>
        <View style={styles.titleCopy}>
          <Text style={styles.title}>Project colour</Text>
          <Text style={styles.helper}>
            Choose one colour, or split the area between multiple colours.
          </Text>
        </View>
      </View>

      <View style={styles.modeRow}>
        <Button
          label="One colour"
          onPress={() => onModeChange('single')}
          variant={mode === 'single' ? 'primary' : 'secondary'}
          size="sm"
          style={styles.modeButton}
        />
        <Button
          label="Multiple colours"
          onPress={() => onModeChange('multiple')}
          variant={mode === 'multiple' ? 'primary' : 'secondary'}
          size="sm"
          style={styles.modeButton}
        />
      </View>

      {mode === 'multiple' ? (
        <Text style={styles.helper}>Enter each colour area. Together they must equal the full project area.</Text>
      ) : null}

      <View style={styles.selectionList}>
        {selections.map((selection, index) => {
          const colour = selection.colourId ? getColourChargeRecord(selection.colourId) : undefined;
          return (
            <View key={selection.slotId} style={styles.selectionCard}>
              {mode === 'multiple' ? (
                <View style={styles.selectionHeader}>
                  <Text style={styles.selectionLabel}>Colour {index + 1}</Text>
                  {selections.length > 2 ? (
                    <TouchableOpacity
                      onPress={() => onRemoveColour(selection.slotId)}
                      style={styles.removeButton}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove colour ${index + 1}`}
                    >
                      <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}

              <TouchableOpacity
                onPress={() => openPicker(selection.slotId)}
                activeOpacity={0.76}
                style={[styles.colourButton, colour && styles.colourButtonSelected]}
                accessibilityRole="button"
                accessibilityLabel={colour ? `Change ${colour.name}` : `Choose colour ${index + 1}`}
                accessibilityState={{ selected: Boolean(colour) }}
              >
                <MiniSwatch hex={colour?.swatchHex} size={34} />
                <View style={styles.colourButtonCopy}>
                  <Text style={colour ? styles.colourName : styles.colourPlaceholder}>
                    {colour?.name ?? 'Choose a colour'}
                  </Text>
                  <Text style={styles.colourCode}>
                    {colour
                      ? colour.code
                      : `${COLOUR_TINT_STATS.mappedColours.toLocaleString('en-CA')} colours, A–Z`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textDisabled} />
              </TouchableOpacity>

              {mode === 'multiple' ? (
                <Input
                  label="Area for this colour"
                  value={selection.areaSqft}
                  onChangeText={(value) => onAreaChange(selection.slotId, value)}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 150"
                  suffix="sq ft"
                />
              ) : null}
            </View>
          );
        })}
      </View>

      {mode === 'multiple' ? (
        <>
          <Button label="Add another colour" onPress={onAddColour} variant="secondary" size="sm" fullWidth />
          <View style={styles.allocationSummary}>
            <View>
              <Text style={styles.allocationLabel}>Allocated</Text>
              <Text style={styles.allocationValue}>{formatArea(allocatedArea)} sq ft</Text>
            </View>
            <View style={styles.allocationRight}>
              <Text style={styles.allocationLabel}>Remaining</Text>
              <Text style={[
                styles.allocationValue,
                remainingArea != null && Math.abs(remainingArea) <= 0.05 && styles.allocationComplete,
                remainingArea != null && remainingArea < -0.05 && styles.allocationOver,
              ]} accessibilityLiveRegion="polite">
                {formatRemainingArea(remainingArea)}
              </Text>
            </View>
          </View>
        </>
      ) : null}

      <Modal
        visible={activeSlotId !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveSlotId(null)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleCopy}>
                <Text style={styles.modalTitle}>Choose X-Bond colour</Text>
                <Text style={styles.modalSubtitle}>Alphabetical by colour name.</Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveSlotId(null)}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close colour picker"
              >
                <Ionicons name="close" size={24} color={Colors.navy} />
              </TouchableOpacity>
            </View>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search colour name or code..."
              autoFocus
              autoCorrect={false}
            />
            <View style={styles.resultMeta}>
              <Text style={styles.resultCount} accessibilityLiveRegion="polite">{options.length} colour{options.length === 1 ? '' : 's'}</Text>
              <Text style={styles.swatchCount}>{COLOUR_SWATCH_STATS.available} digital swatches</Text>
            </View>
            <Text style={styles.swatchDisclaimer}>Digital swatches are a guide only. Confirm the final colour with the physical SEMCO fan deck.</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.optionList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => chooseColour(item.id)}
                  activeOpacity={0.74}
                  style={styles.optionRow}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name}, ${item.code}`}
                  accessibilityState={{ selected: activeColourId === item.id }}
                >
                  <MiniSwatch hex={item.swatchHex} size={36} />
                  <View style={styles.optionCopy}>
                    <Text style={styles.optionName}>{item.name}</Text>
                    <Text style={styles.optionCode}>
                      {item.code}{item.formulaCode !== item.code ? ` · source formula ${item.formulaCode}` : ''}
                    </Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={21} color={Colors.semcoOrange} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={28} color={Colors.textDisabled} />
                  <Text style={styles.emptyTitle}>No colour found</Text>
                  <Text style={styles.helper}>Try another name or fan-deck code.</Text>
                </View>
              }
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function formatArea(value: number): string {
  if (!Number.isFinite(value)) return '0';
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function formatRemainingArea(value: number | null): string {
  if (value == null) return 'Enter total area';
  if (Math.abs(value) <= 0.05) return 'Allocation complete';
  if (value < 0) return `${formatArea(Math.abs(value))} sq ft over`;
  return `${formatArea(value)} sq ft`;
}

function MiniSwatch({ hex, size }: { hex?: string | null; size: number }) {
  return (
    <View
      style={[
        styles.swatch,
        { width: size, height: size, borderRadius: size / 2 },
        hex ? { backgroundColor: hex } : styles.swatchUnavailable,
      ]}
      accessible={false}
    >
      {!hex ? <Ionicons name="remove-outline" size={17} color={Colors.textDisabled} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  titleIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryMuted,
  },
  titleCopy: { flex: 1, gap: 2 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.base },
  helper: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.xs, lineHeight: Typography.size.xs * 1.4 },
  modeRow: { flexDirection: 'row', gap: Spacing.sm },
  modeButton: { flex: 1 },
  selectionList: { gap: Spacing.sm },
  selectionCard: {
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
    padding: Spacing.sm,
  },
  selectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectionLabel: { color: Colors.textSecondary, fontFamily: Fonts.semibold, fontSize: Typography.size.xs, textTransform: 'uppercase' },
  removeButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF2F0' },
  colourButton: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.sm,
  },
  colourButtonSelected: { borderColor: Colors.lightTeal, backgroundColor: Colors.primaryMuted },
  swatch: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(8, 46, 55, 0.18)',
  },
  swatchUnavailable: { backgroundColor: Colors.white, borderStyle: 'dashed' },
  colourButtonCopy: { flex: 1, gap: 2 },
  colourName: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.sm },
  colourPlaceholder: { color: Colors.textSecondary, fontFamily: Fonts.semibold, fontSize: Typography.size.sm },
  colourCode: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.xs },
  allocationSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryMuted,
    padding: Spacing.sm,
  },
  allocationRight: { alignItems: 'flex-end' },
  allocationLabel: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: Typography.size.xs },
  allocationValue: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.sm },
  allocationComplete: { color: Colors.success },
  allocationOver: { color: Colors.danger },
  modalSafe: { flex: 1, backgroundColor: Colors.appBackground },
  modalContent: { flex: 1, width: '100%', maxWidth: Layout.screenMaxWidth, alignSelf: 'center', padding: Spacing.base, gap: Spacing.sm },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  modalTitleCopy: { flex: 1, gap: 2 },
  modalTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.lg },
  modalSubtitle: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.xs },
  closeButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white },
  resultCount: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: Typography.size.xs },
  resultMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  swatchCount: { color: Colors.darkTeal, fontFamily: Fonts.semibold, fontSize: Typography.size.xs },
  swatchDisclaimer: { color: Colors.textDisabled, fontFamily: Fonts.regular, fontSize: Typography.size.xs, lineHeight: Typography.size.xs * 1.3 },
  optionList: { paddingBottom: Spacing.xxl },
  optionRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
  },
  optionCopy: { flex: 1, gap: 2 },
  optionName: { color: Colors.navy, fontFamily: Fonts.semibold, fontSize: Typography.size.sm },
  optionCode: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.xs },
  emptyState: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xxl },
  emptyTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.base },
});
