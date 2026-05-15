import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, Platform,
} from 'react-native';
import { Colors } from '@constants/colors';

export interface AddressSuggestion {
  street: string;
  city:   string;
  postal: string;
  full:   string; // for geocoding
}

interface Props {
  value:         string;
  onChangeText:  (text: string) => void;
  onSelect:      (s: AddressSuggestion) => void;
  placeholder?:  string;
}

async function queryNominatim(q: string): Promise<AddressSuggestion[]> {
  const encoded = encodeURIComponent(`${q}, Saskatchewan, Canada`);
  const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=6&countrycodes=ca&addressdetails=1`;
  try {
    const res  = await fetch(url, { headers: { 'User-Agent': 'SemcoApp/1.0 (ca.semco.app)' } });
    const data = await res.json();
    const seen = new Set<string>();
    return (data as any[])
      .map((r: any) => {
        const a      = r.address ?? {};
        const street = [a.house_number, a.road].filter(Boolean).join(' ');
        const city   = a.city ?? a.town ?? a.village ?? a.municipality ?? '';
        const postal = (a.postcode ?? '').trim();
        const full   = [street, city, a.state_code ?? 'SK', postal].filter(Boolean).join(', ');
        return { street, city, postal, full };
      })
      .filter(s => {
        if (!s.street) return false;
        if (seen.has(s.full)) return false;
        seen.add(s.full);
        return true;
      });
  } catch {
    return [];
  }
}

export function AddressAutocomplete({ value, onChangeText, onSelect, placeholder }: Props) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading,     setLoading]     = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((text: string) => {
    onChangeText(text);
    if (timer.current) clearTimeout(timer.current);
    setSuggestions([]);
    if (text.trim().length < 4) return;
    timer.current = setTimeout(async () => {
      setLoading(true);
      const results = await queryNominatim(text);
      setSuggestions(results);
      setLoading(false);
    }, 400);
  }, [onChangeText]);

  function handleSelect(s: AddressSuggestion) {
    onSelect(s);
    setSuggestions([]);
    if (timer.current) clearTimeout(timer.current);
  }

  return (
    <View>
      <View style={ls.inputWrap}>
        <TextInput
          style={ls.input}
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder ?? '123 Main St'}
          placeholderTextColor={Colors.textMuted}
          returnKeyType="next"
          autoCorrect={false}
          autoCapitalize="words"
        />
        {loading && <ActivityIndicator size="small" color={Colors.purple} style={{ marginRight: 10 }} />}
      </View>

      {suggestions.length > 0 && (
        <View style={ls.dropdown}>
          {suggestions.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={[ls.item, i < suggestions.length - 1 && ls.itemBorder]}
              onPress={() => handleSelect(s)}
              activeOpacity={0.7}
            >
              <Text style={ls.line1}>{s.street}</Text>
              <Text style={ls.line2}>{[s.city, 'SK', s.postal].filter(Boolean).join('  ·  ')}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const ls = StyleSheet.create({
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 12,
  },
  input: {
    flex: 1, fontSize: 15, color: Colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  dropdown: {
    marginTop: 4, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09, shadowRadius: 10, elevation: 5,
  },
  item:       { paddingHorizontal: 14, paddingVertical: 11 },
  itemBorder: { borderBottomWidth: 1, borderColor: Colors.border },
  line1: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  line2: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
});
