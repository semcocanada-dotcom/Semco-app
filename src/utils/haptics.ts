import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

async function runHaptic(action: () => Promise<void>) {
  if (Platform.OS === 'web') return;

  try {
    await action();
  } catch {
    // Haptics are polish only; never block the app if the device does not support them.
  }
}

export function selectionHaptic() {
  void runHaptic(() => Haptics.selectionAsync());
}

export function lightImpactHaptic() {
  void runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function mediumImpactHaptic() {
  void runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export function successHaptic() {
  void runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}
