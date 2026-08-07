import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppLogo } from '@components/AppLogo';
import { Colors } from '@constants/colors';
import { useAuth } from '@context/AuthContext';
import { SASKATCHEWAN_PROVIDER_REGISTRY_URL } from '@lib/officialLinks';
import { supabase } from '@lib/supabase';
import type { Provider, ProviderCategory } from '@lib/types';

const CATEGORY_OPTIONS: { value: ProviderCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'aba_ibi', label: 'ABA / IBI', icon: 'extension-puzzle-outline' },
  { value: 'speech_language', label: 'Speech & Language', icon: 'chatbubble-ellipses-outline' },
  { value: 'occupational_therapy', label: 'Occupational Therapy', icon: 'hand-left-outline' },
  { value: 'physical_therapy', label: 'Physical Therapy', icon: 'walk-outline' },
  { value: 'psychology', label: 'Psychology', icon: 'heart-outline' },
  { value: 'respite', label: 'Respite', icon: 'home-outline' },
  { value: 'swimming', label: 'Swimming', icon: 'water-outline' },
  { value: 'social_skills', label: 'Social Skills', icon: 'people-outline' },
  { value: 'music_therapy', label: 'Music Therapy', icon: 'musical-notes-outline' },
  { value: 'art_therapy', label: 'Art Therapy', icon: 'color-palette-outline' },
  { value: 'assistive_technology', label: 'Assistive Technology', icon: 'phone-portrait-outline' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

interface ProviderDraft {
  name: string;
  organization: string;
  category: ProviderCategory;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
}

const EMPTY_DRAFT: ProviderDraft = {
  name: '',
  organization: '',
  category: 'speech_language',
  address: '',
  city: '',
  postalCode: '',
  notes: '',
};

function categoryMeta(category: ProviderCategory) {
  return CATEGORY_OPTIONS.find(option => option.value === category) ?? CATEGORY_OPTIONS[CATEGORY_OPTIONS.length - 1];
}

function ProviderEditor({
  visible,
  provider,
  onClose,
  onSaved,
}: {
  visible: boolean;
  provider: Provider | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { session } = useAuth();
  const [draft, setDraft] = useState<ProviderDraft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setDraft(provider ? {
      name: provider.name,
      organization: provider.organization ?? '',
      category: provider.category,
      address: provider.address ?? '',
      city: provider.city ?? '',
      postalCode: provider.postal_code ?? '',
      notes: provider.notes ?? '',
    } : EMPTY_DRAFT);
    setSaving(false);
  }, [provider, visible]);

  const update = <K extends keyof ProviderDraft,>(key: K, value: ProviderDraft[K]) => {
    setDraft(current => ({ ...current, [key]: value }));
  };

  const save = async () => {
    if (!session || saving) return;
    if (!draft.name.trim()) {
      Alert.alert('Name required', 'Enter the provider or organization name.');
      return;
    }
    if (!draft.city.trim()) {
      Alert.alert('City required', 'Enter the city for this private provider.');
      return;
    }

    setSaving(true);
    const values = {
      name: draft.name.trim(),
      organization: draft.organization.trim() || null,
      category: draft.category,
      phone: null,
      email: null,
      website: null,
      address: draft.address.trim() || null,
      city: draft.city.trim(),
      province: 'SK',
      postal_code: draft.postalCode.trim().toUpperCase() || null,
      notes: draft.notes.trim() || null,
      is_approved_sk: false,
      parent_id: session.user.id,
      lat: null,
      lng: null,
    };

    const result = provider
      ? await supabase
        .from('providers')
        .update(values)
        .eq('id', provider.id)
        .eq('parent_id', session.user.id)
      : await supabase.from('providers').insert(values);

    setSaving(false);
    if (result.error) {
      Alert.alert('Could not save provider', result.error.message);
      return;
    }

    onSaved();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe} edges={['top']}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{provider ? 'Edit Private Provider' : 'Add Private Provider'}</Text>
          <TouchableOpacity onPress={onClose} accessibilityRole="button">
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
          <Text style={styles.privateNotice}>
            This entry is private to your account. It is not copied from or verified against the Saskatchewan registry.
          </Text>

          <Text style={styles.fieldLabel}>Provider or organization name *</Text>
          <TextInput
            style={styles.textField}
            value={draft.name}
            onChangeText={value => update('name', value)}
            placeholder="Provider name"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="words"
          />

          <Text style={styles.fieldLabel}>Organization</Text>
          <TextInput
            style={styles.textField}
            value={draft.organization}
            onChangeText={value => update('organization', value)}
            placeholder="Optional"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="words"
          />

          <Text style={styles.fieldLabel}>Service category *</Text>
          <View style={styles.categoryGrid}>
            {CATEGORY_OPTIONS.map(option => {
              const active = option.value === draft.category;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.categoryButton, active && styles.categoryButtonActive]}
                  onPress={() => update('category', option.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.categoryButtonText, active && styles.categoryButtonTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>Street address</Text>
          <TextInput
            style={styles.textField}
            value={draft.address}
            onChangeText={value => update('address', value)}
            placeholder="Enter manually"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="words"
          />

          <View style={styles.row}>
            <View style={styles.cityField}>
              <Text style={styles.fieldLabel}>City *</Text>
              <TextInput
                style={styles.textField}
                value={draft.city}
                onChangeText={value => update('city', value)}
                placeholder="City"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.postalField}>
              <Text style={styles.fieldLabel}>Postal code</Text>
              <TextInput
                style={styles.textField}
                value={draft.postalCode}
                onChangeText={value => update('postalCode', value)}
                placeholder="S4P 3V7"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
                maxLength={7}
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Private notes</Text>
          <TextInput
            style={[styles.textField, styles.notesField]}
            value={draft.notes}
            onChangeText={value => update('notes', value)}
            placeholder="Optional notes for your family"
            placeholderTextColor={Colors.textMuted}
            multiline
          />

          <TouchableOpacity onPress={() => { void save(); }} disabled={saving} activeOpacity={0.85}>
            <LinearGradient colors={Colors.gradients.purple as unknown as string[]} style={styles.saveButton}>
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>Save Private Provider</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function ProvidersScreen() {
  const { session } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);

  const loadProviders = useCallback(async (asRefresh = false) => {
    if (!session) {
      setProviders([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (asRefresh) setRefreshing(true);
    else setLoading(true);

    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('parent_id', session.user.id)
      .order('name');

    if (error) Alert.alert('Could not load private providers', error.message);
    setProviders((data ?? []) as Provider[]);
    setLoading(false);
    setRefreshing(false);
  }, [session]);

  useEffect(() => {
    void loadProviders();
  }, [loadProviders]);

  const filteredProviders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return providers;
    return providers.filter(provider => (
      provider.name.toLowerCase().includes(query)
      || provider.organization?.toLowerCase().includes(query)
      || provider.city.toLowerCase().includes(query)
      || categoryMeta(provider.category).label.toLowerCase().includes(query)
    ));
  }, [providers, search]);

  const openEditor = (provider: Provider | null) => {
    setEditingProvider(provider);
    setEditorVisible(true);
  };

  const deleteProvider = (provider: Provider) => {
    if (!session) return;
    Alert.alert(
      'Delete private provider?',
      `${provider.name} will be removed from your account. Existing expense or appointment records will keep their other saved details.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void supabase
              .from('providers')
              .delete()
              .eq('id', provider.id)
              .eq('parent_id', session.user.id)
              .then(({ error }) => {
                if (error) Alert.alert('Could not delete provider', error.message);
                else void loadProviders();
              });
          },
        },
      ],
    );
  };

  const Header = (
    <View>
      <View style={styles.hero}>
        <AppLogo size={42} />
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>Providers</Text>
          <Text style={styles.heroSubtitle}>Use the official registry or keep your own private provider list.</Text>
        </View>
      </View>

      <View style={styles.registryCard}>
        <View style={styles.registryIcon}>
          <Ionicons name="open-outline" size={24} color="#1D4ED8" />
        </View>
        <View style={styles.registryCopy}>
          <Text style={styles.registryTitle}>Official Saskatchewan Provider Registry</Text>
          <Text style={styles.registryBody}>
            View the current government registry in your browser. Autism Fund Tracker does not copy, store, rank, or endorse its public directory.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.registryButton}
          onPress={() => { void Linking.openURL(SASKATCHEWAN_PROVIDER_REGISTRY_URL); }}
          accessibilityRole="link"
          accessibilityLabel="Open the official Saskatchewan Provider Registry"
        >
          <Text style={styles.registryButtonText}>Open Official Registry</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.privateHeader}>
        <View>
          <Text style={styles.sectionTitle}>My Private Providers</Text>
          <Text style={styles.sectionSubtitle}>Only entries you create are shown here.</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => openEditor(null)} accessibilityRole="button">
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {providers.length > 0 ? (
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search your private providers"
            placeholderTextColor={Colors.textMuted}
            autoCorrect={false}
          />
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={loading ? [] : filteredProviders}
        keyExtractor={provider => provider.id}
        ListHeaderComponent={Header}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={() => { void loadProviders(true); }}
        renderItem={({ item }) => {
          const meta = categoryMeta(item.category);
          return (
            <View style={styles.providerCard}>
              <View style={styles.providerIcon}>
                <Ionicons name={meta.icon} size={22} color={Colors.purple} />
              </View>
              <View style={styles.providerCopy}>
                <Text style={styles.providerName}>{item.name}</Text>
                {item.organization ? <Text style={styles.providerOrganization}>{item.organization}</Text> : null}
                <Text style={styles.providerMeta}>{meta.label} · {item.city}, SK</Text>
                <Text style={styles.privateBadge}>Private · Added by you</Text>
              </View>
              <View style={styles.providerActions}>
                <TouchableOpacity onPress={() => openEditor(item)} accessibilityLabel={`Edit ${item.name}`}>
                  <Ionicons name="create-outline" size={21} color={Colors.purple} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteProvider(item)} accessibilityLabel={`Delete ${item.name}`}>
                  <Ionicons name="trash-outline" size={20} color="#BE123C" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/(tabs)/appointments', params: { preselectId: item.id } })}
                  accessibilityLabel={`Add appointment with ${item.name}`}
                >
                  <Ionicons name="calendar-outline" size={20} color={Colors.teal} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={Colors.purple} />
            <Text style={styles.emptyText}>Loading your private providers…</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="lock-closed-outline" size={38} color={Colors.purple} />
            <Text style={styles.emptyTitle}>{search ? 'No private providers found' : 'No private providers yet'}</Text>
            <Text style={styles.emptyText}>
              {search ? 'Try another search.' : 'Add a provider only if you want to reuse its name in expenses, mileage, or appointments.'}
            </Text>
          </View>
        )}
      />

      <ProviderEditor
        visible={editorVisible}
        provider={editingProvider}
        onClose={() => setEditorVisible(false)}
        onSaved={() => { void loadProviders(); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  listContent: { padding: 16, paddingBottom: 60 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  heroCopy: { flex: 1 },
  heroTitle: { fontSize: 30, fontWeight: '800', color: Colors.textPrimary },
  heroSubtitle: { marginTop: 3, color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  registryCard: {
    backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1,
    borderRadius: 18, padding: 16, marginBottom: 22,
  },
  registryIcon: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: '#DBEAFE',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  registryCopy: { marginBottom: 14 },
  registryTitle: { color: '#1E3A8A', fontSize: 17, fontWeight: '800' },
  registryBody: { color: '#1E40AF', fontSize: 13, lineHeight: 19, marginTop: 6 },
  registryButton: {
    minHeight: 48, borderRadius: 13, backgroundColor: '#1D4ED8',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  registryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  privateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800' },
  sectionSubtitle: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  addButton: {
    minHeight: 42, paddingHorizontal: 14, borderRadius: 12, backgroundColor: Colors.purple,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface,
    borderColor: Colors.border, borderWidth: 1, borderRadius: 13, paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8 },
  providerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.surface,
    borderColor: Colors.border, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10,
  },
  providerIcon: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: '#F3E8FF',
    alignItems: 'center', justifyContent: 'center',
  },
  providerCopy: { flex: 1 },
  providerName: { color: Colors.textPrimary, fontSize: 15, fontWeight: '800' },
  providerOrganization: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  providerMeta: { color: Colors.textMuted, fontSize: 12, marginTop: 3 },
  privateBadge: { color: '#047857', fontSize: 11, fontWeight: '700', marginTop: 5 },
  providerActions: { gap: 14, alignItems: 'center' },
  emptyState: { alignItems: 'center', paddingHorizontal: 26, paddingVertical: 38 },
  emptyTitle: { color: Colors.textPrimary, fontSize: 17, fontWeight: '800', marginTop: 10, textAlign: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 6, textAlign: 'center' },
  modalSafe: { flex: 1, backgroundColor: Colors.bg },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderColor: Colors.border,
  },
  modalTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800' },
  cancelText: { color: Colors.purple, fontSize: 15, fontWeight: '700' },
  modalBody: { padding: 18, paddingBottom: 50 },
  privateNotice: {
    color: '#1E40AF', backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1,
    borderRadius: 12, padding: 12, fontSize: 13, lineHeight: 19, marginBottom: 18,
  },
  fieldLabel: {
    color: Colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 0.35, marginBottom: 6, marginTop: 14,
  },
  textField: {
    backgroundColor: Colors.surfaceAlt, borderColor: Colors.border, borderWidth: 1,
    borderRadius: 12, paddingHorizontal: 13, paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    color: Colors.textPrimary, fontSize: 15,
  },
  notesField: { minHeight: 88, textAlignVertical: 'top' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  categoryButton: {
    borderRadius: 16, borderColor: Colors.border, borderWidth: 1, backgroundColor: Colors.surface,
    paddingHorizontal: 11, paddingVertical: 8,
  },
  categoryButtonActive: { backgroundColor: Colors.purple, borderColor: Colors.purple },
  categoryButtonText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
  categoryButtonTextActive: { color: '#FFFFFF' },
  row: { flexDirection: 'row', gap: 10 },
  cityField: { flex: 2 },
  postalField: { flex: 1 },
  saveButton: { minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
