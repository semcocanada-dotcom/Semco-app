import fs from 'fs';
import path from 'path';
import { pickProgressPhoto, pickReceiptPhoto } from './camera';

const mockLaunchImageLibraryAsync = jest.fn();
const mockRequestCameraPermissionsAsync = jest.fn();
const mockRequestMediaLibraryPermissionsAsync = jest.fn();
const mockAlert = jest.fn();

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: (...args: unknown[]) => mockLaunchImageLibraryAsync(...args),
  launchCameraAsync: jest.fn(),
  requestCameraPermissionsAsync: (...args: unknown[]) => mockRequestCameraPermissionsAsync(...args),
  requestMediaLibraryPermissionsAsync: (...args: unknown[]) => mockRequestMediaLibraryPermissionsAsync(...args),
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: null,
}));

jest.mock('react-native', () => ({
  Alert: { alert: (...args: unknown[]) => mockAlert(...args) },
  Linking: { openSettings: jest.fn() },
  Platform: { OS: 'ios' },
}));

jest.mock('./supabase', () => ({
  supabase: { storage: { from: jest.fn() } },
}));

jest.mock('./private-storage', () => ({
  createPrivateFileUrl: jest.fn(),
}));

describe('system photo picker privacy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not request broad photo-library permission before choosing a project photo', async () => {
    mockLaunchImageLibraryAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///project.jpg', width: 1200, height: 900, mimeType: 'image/jpeg' }],
    });

    await expect(pickProgressPhoto()).resolves.toEqual({
      localUri: 'file:///project.jpg',
      width: 1200,
      height: 900,
      mimeType: 'image/jpeg',
    });
    expect(mockRequestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
  });

  it('does not declare an unnecessary iOS Photos usage description', () => {
    const appConfig = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', '..', 'app.json'), 'utf8'),
    );
    const imagePickerPlugin = appConfig.expo.plugins.find(
      (plugin: unknown) => Array.isArray(plugin) && plugin[0] === 'expo-image-picker',
    );
    expect(appConfig.expo.ios.infoPlist.NSPhotoLibraryUsageDescription).toBeUndefined();
    expect(appConfig.expo.ios.infoPlist.NSPhotoLibraryAddUsageDescription).toBeUndefined();
    expect(imagePickerPlugin[1].photosPermission).toBe(false);
  });

  it('treats a canceled receipt selection as no photo', async () => {
    mockLaunchImageLibraryAsync.mockResolvedValueOnce({ canceled: true, assets: [] });

    await expect(pickReceiptPhoto()).resolves.toBeNull();
    expect(mockAlert).not.toHaveBeenCalled();
    expect(mockRequestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
  });

  it('handles picker errors without crashing or requesting full library access', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockLaunchImageLibraryAsync.mockRejectedValueOnce(new Error('picker unavailable'));

    await expect(pickProgressPhoto()).resolves.toBeNull();
    expect(mockAlert).toHaveBeenCalledWith(
      'Photo unavailable',
      'The photo picker could not be opened. Please try again.',
    );
    expect(mockRequestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
