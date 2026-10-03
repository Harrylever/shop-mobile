import type { CheckoutDetails, CheckoutResult, Product, ShopUser } from '@/types/shop';

const API_URL = (process.env.EXPO_PUBLIC_SHOP_API_URL ?? 'https://xs.croesus.live').replace(
  /\/$/,
  '',
);

type Envelope<T> = { data?: T; error?: { message?: string } };

async function request<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
      signal: controller.signal,
    });
    const payload = (await response.json()) as Envelope<T>;
    if (!response.ok || payload.data === undefined) {
      throw new Error(payload.error?.message ?? 'The Croesus service is unavailable.');
    }
    return payload.data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('The request timed out. Check your connection and try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function getCatalog() {
  return request<Product[]>('/api/v1/catalog/products');
}

export function initializeCheckout(
  details: CheckoutDetails,
  items: { productId: string; quantity: number }[],
  token?: string | null,
) {
  return request<CheckoutResult>('/api/v1/orders/checkout', {
    method: 'POST',
    body: JSON.stringify({
      customer: { name: details.name, email: details.email, phone: details.phone },
      delivery: { address: details.address, city: details.city, state: details.state },
      items,
    }),
  }, token ?? undefined);
}

export function verifyPayment(reference: string) {
  return request<{
    reference: string;
    status: 'pending' | 'paid' | 'failed';
    email: string;
    emailSent: boolean;
  }>(`/api/v1/payments/verify/${encodeURIComponent(reference)}`);
}

export function mobileGoogleAuthUrl(redirectUri: string, challenge: string) {
  const query = new URLSearchParams({ returnTo: redirectUri, challenge });
  return `${API_URL}/api/v1/auth/google/mobile/start?${query.toString()}`;
}

export function exchangeMobileAuthCode(code: string, verifier: string) {
  return request<{ token: string; user: ShopUser }>('/api/v1/auth/mobile/exchange', {
    method: 'POST',
    body: JSON.stringify({ code, verifier }),
  });
}

export function getCurrentUser(token: string) {
  return request<ShopUser | null>('/api/v1/auth/me', undefined, token);
}

export function endSession(token: string) {
  return request<{ signedOut: boolean }>(
    '/api/v1/auth/logout',
    { method: 'POST' },
    token,
  );
}
