import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CalculationResult } from '@/database/schema/calculations';

const PENDING_MATERIAL_REQUEST_KEY = 'semco.pendingMaterialRequest.v1';

export async function savePendingMaterialRequest(result: CalculationResult): Promise<void> {
  await AsyncStorage.setItem(PENDING_MATERIAL_REQUEST_KEY, JSON.stringify(result));
}

export async function getPendingMaterialRequest(): Promise<CalculationResult | null> {
  const raw = await AsyncStorage.getItem(PENDING_MATERIAL_REQUEST_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CalculationResult;
  } catch {
    await clearPendingMaterialRequest();
    return null;
  }
}

export async function clearPendingMaterialRequest(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_MATERIAL_REQUEST_KEY);
}
