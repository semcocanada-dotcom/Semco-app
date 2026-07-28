import fs from 'fs';
import path from 'path';

const dashboardSource = fs.readFileSync(
  path.join(__dirname, '..', 'app', '(tabs)', 'index.tsx'),
  'utf8',
);

const promptStart = dashboardSource.indexOf('function LocationPermissionModal');
const promptEnd = dashboardSource.indexOf('const ls = StyleSheet.create', promptStart);
const promptSource = dashboardSource.slice(promptStart, promptEnd);

describe('location permission pre-prompt', () => {
  it('uses one neutral action and always proceeds to the system permission request', () => {
    expect(promptSource.match(/<TouchableOpacity\b/g)).toHaveLength(1);
    expect(promptSource).toContain('>Continue</Text>');
    expect(promptSource).not.toContain('Allow Location Access');
    expect(promptSource).not.toContain('Not Now');

    const systemRequest = promptSource.indexOf(
      'await Location.requestForegroundPermissionsAsync()',
    );
    const dismissPrompt = promptSource.indexOf('onDone();');

    expect(systemRequest).toBeGreaterThan(-1);
    expect(dismissPrompt).toBeGreaterThan(systemRequest);
  });
});
