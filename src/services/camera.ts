import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { createPrivateFileUrl } from './private-storage';

export interface CapturedPhoto {
  localUri: string;
  width: number;
  height: number;
  mimeType?: string | null;
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
    mimeType: asset.mimeType,
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
    mimeType: asset.mimeType,
  };
}

export async function pickProgressPhoto(): Promise<CapturedPhoto | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 0.9,
  });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return { localUri: asset.uri, width: asset.width, height: asset.height, mimeType: asset.mimeType };
}

export async function pickReceiptPhoto(): Promise<CapturedPhoto | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 0.9,
  });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return { localUri: asset.uri, width: asset.width, height: asset.height, mimeType: asset.mimeType };
}

export async function persistProjectPhoto(localUri: string, photoId: string): Promise<string> {
  if (!FileSystem.documentDirectory) return localUri;
  const directory = `${FileSystem.documentDirectory}semco-project-photos/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const target = `${directory}${photoId}.jpg`;
  await FileSystem.copyAsync({ from: localUri, to: target });
  return target;
}

export type PrivatePhotoUpload = { storagePath: string; signedUrl: string | null };

export async function uploadPrivatePhoto(
  localUri: string,
  bucket: string,
  storagePath: string,
  mimeType?: string | null,
): Promise<PrivatePhotoUpload | null> {
  try {
    const upload = await readPhotoForUpload(localUri, mimeType);
    if (!upload) return null;
    const { error } = await supabase.storage.from(bucket).upload(storagePath, upload.bytes, {
      contentType: upload.contentType,
      upsert: true,
    });
    if (error) {
      console.error('[camera] private upload error:', error);
      return null;
    }
    return { storagePath, signedUrl: await createPrivateFileUrl(bucket, storagePath) };
  } catch (error) {
    console.error('[camera] private upload failed:', error);
    return null;
  }
}

export async function uploadPhoto(
  localUri: string,
  bucket: string,
  storagePath: string,
  mimeType?: string | null,
): Promise<string | null> {
  try {
    const upload = await readPhotoForUpload(localUri, mimeType);
    if (!upload) return null;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, upload.bytes, {
        contentType: upload.contentType,
        upsert: true,
      });

    if (error) {
      console.error('[camera] upload error:', error);
      return null;
    }

    return await createPrivateFileUrl(bucket, storagePath);
  } catch (err) {
    console.error('[camera] upload failed:', err);
    return null;
  }
}

async function readPhotoForUpload(
  localUri: string,
  mimeType?: string | null,
): Promise<{ bytes: Uint8Array; contentType: string } | null> {
  if (Platform.OS === 'web') {
    const response = await fetch(localUri);
    if (!response.ok) return null;
    const blob = await response.blob();
    return {
      bytes: new Uint8Array(await blob.arrayBuffer()),
      contentType: mimeType || blob.type || inferImageMimeType(localUri),
    };
  }

  const fileInfo = await FileSystem.getInfoAsync(localUri);
  if (!fileInfo.exists) return null;
  const base64 = await FileSystem.readAsStringAsync(localUri, { encoding: 'base64' });
  return {
    bytes: Uint8Array.from(atob(base64), (character) => character.charCodeAt(0)),
    contentType: mimeType || inferImageMimeType(localUri),
  };
}

function inferImageMimeType(uri: string) {
  const normalized = uri.toLowerCase().split(/[?#]/)[0];
  if (normalized.endsWith('.png')) return 'image/png';
  if (normalized.endsWith('.heic')) return 'image/heic';
  if (normalized.endsWith('.heif')) return 'image/heif';
  return 'image/jpeg';
}
