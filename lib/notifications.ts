import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Autism Fund Tracker',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  return true;
}

export async function scheduleAppointmentReminder(
  appointmentId: string,
  title: string,
  scheduledAt: Date,
): Promise<string | null> {
  const secondsUntil = Math.floor((scheduledAt.getTime() - 24 * 60 * 60 * 1000 - Date.now()) / 1000);
  if (secondsUntil <= 0) return null;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: '📅 Appointment Tomorrow',
        body: title,
        data: { appointmentId },
      },
      trigger: { seconds: secondsUntil } as any,
    });
  } catch {
    return null;
  }
}

export async function cancelNotification(identifier: string) {
  try { await Notifications.cancelScheduledNotificationAsync(identifier); } catch {}
}

export async function scheduleBudgetWarning(childName: string, remaining: number) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⚠️ Grant Alert — ${childName}`,
        body: `Only ${new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(remaining)} remaining. Log more expenses to maximize your grant.`,
      },
      trigger: null,
    });
  } catch {}
}
