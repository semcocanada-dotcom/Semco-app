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
  offsetMinutes = 1440,
): Promise<string | null> {
  const fireAt = scheduledAt.getTime() - offsetMinutes * 60 * 1000;
  const secondsUntil = Math.floor((fireAt - Date.now()) / 1000);
  if (secondsUntil <= 0) return null;
  const label = offsetMinutes >= 1440 ? 'Tomorrow' : offsetMinutes >= 120 ? 'In 2 hours' : 'In 1 hour';
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `📅 Appointment ${label}`,
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
