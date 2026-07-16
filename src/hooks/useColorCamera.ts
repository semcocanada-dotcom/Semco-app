import { useState, useCallback } from 'react';
import { captureColorSample, uploadPrivatePhoto, type PrivatePhotoUpload } from '@/services/camera';
import { useAuthStore } from '@/store/auth';

interface ColorCameraState {
  localUri: string | null;
  remoteUrl: string | null;
  isUploading: boolean;
  error: string | null;
}

export function useColorCamera() {
  const [state, setState] = useState<ColorCameraState>({
    localUri: null,
    remoteUrl: null,
    isUploading: false,
    error: null,
  });

  const user = useAuthStore((s) => s.user);

  const capture = useCallback(async () => {
    setState((s) => ({ ...s, error: null }));
    const photo = await captureColorSample();

    if (!photo) {
      setState((s) => ({ ...s, error: 'Camera permission denied or cancelled' }));
      return;
    }

    setState((s) => ({ ...s, localUri: photo.localUri }));
  }, []);

  const upload = useCallback(
    async (colorId: string): Promise<PrivatePhotoUpload | null> => {
      if (!state.localUri || !user) return null;

      setState((s) => ({ ...s, isUploading: true, error: null }));

      const path = `${user.id}/colors/${colorId}.jpg`;
      const uploadResult = await uploadPrivatePhoto(state.localUri, 'color-samples', path);

      setState((s) => ({
        ...s,
        isUploading: false,
        remoteUrl: uploadResult?.signedUrl ?? null,
        error: uploadResult ? null : 'Upload failed. Photo saved locally.',
      }));

      return uploadResult;
    },
    [state.localUri, user],
  );

  const reset = useCallback(() => {
    setState({ localUri: null, remoteUrl: null, isUploading: false, error: null });
  }, []);

  return { ...state, capture, upload, reset };
}
