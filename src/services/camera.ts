import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';

export interface CapturedPhoto {
  localUri: string;
  width: number;
  height: number;
}

export async function requestCameraPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

export async function captureColorSample(): Promise<CapturedPhoto | null> {
  const granted = await requestCameraPermissions();
  if (!granted) return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  return {
    localUri: asset.uri,
    width: asset.width,
    height: asset.height,
  };
}

export async function captureProgressPhoto(): Promise<CapturedPhoto | null> {
  const granted = await requestCameraPermissions();
  if (!granted) return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 0.9,
  });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  return {
    localUri: asset.uri,
    width: asset.width,
    height: asset.height,
  };
}

export async function uploadPhoto(
  localUri: string,
  bucket: string,
  storagePath: string,
): Promise<string | null> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (!fileInfo.exists) return null;

    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: 'base64',
    });
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    const { error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, bytes, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('[camera] upload error:', error);
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    return data.publicUrl;
  } catch (err) {
    console.error('[camera] upload failed:', err);
    return null;
  }
}
