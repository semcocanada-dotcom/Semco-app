import React, { useState } from 'react';
import { View, Text, Pressable, Platform, Modal, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import { Colors } from '@constants/colors';

interface DateFieldProps {
  value: string;                 // ISO 'yyyy-MM-dd'
  onChange: (iso: string) => void;
  maximumDate?: Date;            // defaults to today (no future dates)
}

function toDate(iso: string): Date {
  if (!iso) return new Date();
  const d = parseISO(iso);
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Tappable date field that opens the native calendar picker instead of making
 * the user type YYYY-MM-DD. Emits an ISO 'yyyy-MM-dd' string so it is a drop-in
 * replacement for the previous text inputs.
 */
export function DateField({ value, onChange, maximumDate = new Date() }: DateFieldProps) {
  const [show, setShow] = useState(false);
  const current = toDate(value);

  function handleChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') {
      setShow(false);
      if (event.type === 'set' && selected) onChange(format(selected, 'yyyy-MM-dd'));
      return;
    }
    if (selected) onChange(format(selected, 'yyyy-MM-dd'));
  }

  return (
    <>
      <Pressable style={styles.field} onPress={() => setShow(true)}>
        <Text style={styles.text}>{format(current, 'EEE, MMM d, yyyy')}</Text>
        <Text style={styles.icon}>📅</Text>
      </Pressable>

      {Platform.OS === 'ios' ? (
        <Modal visible={show} transparent animationType="fade" onRequestClose={() => setShow(false)}>
          <Pressable style={styles.backdrop} onPress={() => setShow(false)}>
            <Pressable style={styles.sheet} onPress={() => {}}>
              <DateTimePicker
                value={current}
                mode="date"
                display="inline"
                maximumDate={maximumDate}
                onChange={handleChange}
              />
              <Pressable style={styles.doneBtn} onPress={() => setShow(false)}>
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      ) : (
        show && (
          <DateTimePicker
            value={current}
            mode="date"
            display="calendar"
            maximumDate={maximumDate}
            onChange={handleChange}
          />
        )
      )}
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 13 : 11,
  },
  text:  { fontSize: 15, color: Colors.textPrimary },
  icon:  { fontSize: 16 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 24 },
  sheet: { backgroundColor: Colors.surface, borderRadius: 18, padding: 12 },
  doneBtn:  { alignSelf: 'flex-end', paddingHorizontal: 18, paddingVertical: 10, marginTop: 4 },
  doneText: { fontSize: 16, fontWeight: '700', color: Colors.purple },
});
