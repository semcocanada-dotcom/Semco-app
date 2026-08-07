import fs from 'fs';
import path from 'path';

const root = path.join(__dirname, '..');
const dashboardSource = fs.readFileSync(path.join(root, 'app', '(tabs)', 'index.tsx'), 'utf8');
const providersSource = fs.readFileSync(path.join(root, 'app', '(tabs)', 'providers.tsx'), 'utf8');
const appConfig = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

describe('location privacy', () => {
  it('does not request device location from the dashboard or providers screen', () => {
    for (const source of [dashboardSource, providersSource]) {
      expect(source).not.toContain('expo-location');
      expect(source).not.toContain('requestForegroundPermissionsAsync');
      expect(source).not.toContain('getCurrentPositionAsync');
      expect(source).not.toContain('LocationPermissionModal');
    }
  });

  it('does not configure or install the native location module', () => {
    expect(appConfig.expo.plugins).not.toEqual(
      expect.arrayContaining([
        expect.arrayContaining(['expo-location']),
      ]),
    );
    expect(packageJson.dependencies).not.toHaveProperty('expo-location');
  });

  it('opens the official registry without presenting a copied nearby directory', () => {
    expect(providersSource).toContain('SASKATCHEWAN_PROVIDER_REGISTRY_URL');
    expect(providersSource).toContain('Linking.openURL(SASKATCHEWAN_PROVIDER_REGISTRY_URL)');
    expect(providersSource).toContain('Open Official Registry');
    expect(providersSource).not.toContain('Sort by Current Location');
    expect(providersSource).not.toContain('Registry-Listed Provider');
  });

  it('keeps native purpose strings factual and minimal', () => {
    const imagePickerPlugin = appConfig.expo.plugins.find(
      (plugin: unknown) => Array.isArray(plugin) && plugin[0] === 'expo-image-picker',
    )[1];
    const calendarPlugin = appConfig.expo.plugins.find(
      (plugin: unknown) => Array.isArray(plugin) && plugin[0] === 'expo-calendar',
    )[1];

    expect(imagePickerPlugin.microphonePermission).toBe(false);
    expect(imagePickerPlugin.photosPermission).toBe(
      'Autism Fund Tracker uses only the photos you select to attach as receipt records.',
    );
    expect(appConfig.expo.ios.infoPlist.NSPhotoLibraryUsageDescription).toBe(
      imagePickerPlugin.photosPermission,
    );
    expect(calendarPlugin.remindersPermission).toBe(false);
    expect(appConfig.expo.ios.infoPlist.NSAppTransportSecurity.NSAllowsArbitraryLoads).toBe(false);
  });
});
