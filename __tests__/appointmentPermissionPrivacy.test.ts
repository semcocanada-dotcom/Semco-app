import fs from 'fs';
import path from 'path';

const root = path.join(__dirname, '..');
const appointments = fs.readFileSync(
  path.join(root, 'app', '(tabs)', 'appointments.tsx'),
  'utf8',
);
const notifications = fs.readFileSync(path.join(root, 'lib', 'notifications.ts'), 'utf8');

describe('appointment permission privacy', () => {
  it('defaults calendar and notification options off', () => {
    expect(appointments).toContain('useState(false);\n  const [scheduleReminder');
    expect(appointments).toContain('setSyncCalendar(false); setScheduleReminder(false)');
    expect(appointments).toContain('Off by default · asks only when you choose this');
    expect(appointments).toContain('Off by default · lock-screen text stays private');
  });

  it('requests each permission only inside its explicit opt-in branch', () => {
    const save = appointments.slice(
      appointments.indexOf('async function handleSave'),
      appointments.indexOf('return (', appointments.indexOf('async function handleSave')),
    );
    expect(save).toMatch(/if \(syncCalendar\)[\s\S]*getWritableCalendarId\(\)/);
    expect(save).toMatch(/if \(scheduleReminder\)[\s\S]*requestNotificationPermission\(\)/);
    expect(save).toMatch(/if \(granted\)[\s\S]*scheduleAppointmentReminder/);
    expect(save).toContain('} catch {}');
  });

  it('uses generic lock-screen notification content', () => {
    expect(notifications).toContain("title: 'Autism Fund Tracker reminder'");
    expect(notifications).toContain("body: 'Open the app to view your scheduled reminder.'");
    expect(notifications).not.toContain('body: title');
    expect(notifications).not.toContain('${childName}');
    expect(notifications).not.toContain('${remaining}');
  });
});
