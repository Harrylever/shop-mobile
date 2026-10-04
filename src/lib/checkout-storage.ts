import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { CheckoutDetails, CheckoutResult } from '@/types/shop';

const DETAILS_KEY = 'croesus.mobile.checkout-details.v1';
const PENDING_PAYMENT_KEY = 'croesus.mobile.pending-payment.v1';

async function readPrivateStorage(key: string) {
  if (Platform.OS === 'web') return AsyncStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function savePrivateStorage(key: string, value: string) {
  if (Platform.OS === 'web') return AsyncStorage.setItem(key, value);
  return SecureStore.setItemAsync(key, value);
}

async function removePrivateStorage(key: string) {
  if (Platform.OS === 'web') return AsyncStorage.removeItem(key);
  return SecureStore.deleteItemAsync(key);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.values(value).every((item) => typeof item === 'string'),
  );
}

export async function readSavedCheckoutDetails(): Promise<CheckoutDetails | null> {
  try {
    const stored = await readPrivateStorage(DETAILS_KEY);
    if (!stored) return null;
    const value: unknown = JSON.parse(stored);
    if (!isStringRecord(value)) return null;
    const { name, email, phone, address, city, state } = value;
    if ([name, email, phone, address, city, state].some((item) => item === undefined)) {
      return null;
    }
    return { name, email, phone, address, city, state };
  } catch {
    return null;
  }
}

export function saveCheckoutDetails(details: CheckoutDetails) {
  return savePrivateStorage(DETAILS_KEY, JSON.stringify(details));
}

export function clearCheckoutDetails() {
  return removePrivateStorage(DETAILS_KEY);
}

export async function readPendingPayment(): Promise<CheckoutResult | null> {
  try {
    const stored = await AsyncStorage.getItem(PENDING_PAYMENT_KEY);
    if (!stored) return null;
    const value: unknown = JSON.parse(stored);
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const payment = value as Partial<CheckoutResult>;
    if (
      typeof payment.orderId !== 'string' ||
      typeof payment.reference !== 'string' ||
      typeof payment.authorizationUrl !== 'string'
    ) {
      return null;
    }
    return payment as CheckoutResult;
  } catch {
    return null;
  }
}

export function savePendingPayment(payment: CheckoutResult) {
  return AsyncStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(payment));
}

export function clearPendingPayment() {
  return AsyncStorage.removeItem(PENDING_PAYMENT_KEY);
}
