import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';

import {
  clearSyncedCart,
  getCartRealtimeUrl,
  getCatalog,
  getSyncedCart,
  mergeSyncedCart,
  setSyncedCartItem,
} from '@/lib/shop-api';
import type { SyncedCart } from '@/lib/shop-api';
import { useAuth } from '@/store/auth-provider';
import type { Product } from '@/types/shop';

type Cart = Record<string, number>;
type ShopContextValue = {
  products: Product[];
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  cart: Cart;
  cartCount: number;
  favorites: string[];
  refreshCatalog: () => Promise<void>;
  addToCart: (product: Product) => void;
  changeQuantity: (product: Product, delta: number) => void;
  clearCart: () => void;
  toggleFavorite: (productId: string) => void;
};

const CART_KEY = 'croesus.mobile.cart.v1';
const CART_OWNER_KEY = 'croesus.mobile.cart.owner.v1';
const FAVORITES_KEY = 'croesus.mobile.favorites.v1';
const ShopContext = createContext<ShopContextValue | null>(null);

function parseCart(value: string | null): Cart {
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([key, quantity]) =>
          key.length > 0 &&
          typeof quantity === 'number' &&
          Number.isInteger(quantity) &&
          quantity > 0 &&
          quantity <= 20,
      ),
    );
  } catch {
    return {};
  }
}

function parseFavorites(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? [...new Set(parsed.filter((item): item is string => typeof item === 'string'))]
      : [];
  } catch {
    return [];
  }
}

function cartFromSnapshot(snapshot: SyncedCart): Cart {
  return Object.fromEntries(
    snapshot.items.map((item) => [item.productId, item.quantity]),
  );
}

function cartItems(cart: Cart): SyncedCart['items'] {
  return Object.entries(cart).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const { loading: authLoading, token, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<Cart>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const cartRef = useRef<Cart>({});
  const cartOwnerRef = useRef<string | null>(null);
  const syncQueueRef = useRef<Promise<void>>(Promise.resolve());

  const replaceCart = useCallback((next: Cart) => {
    cartRef.current = next;
    setCart(next);
  }, []);

  const enqueue = useCallback((operation: () => Promise<unknown>) => {
    syncQueueRef.current = syncQueueRef.current
      .catch(() => undefined)
      .then(operation)
      .then(() => undefined)
      .catch((cause) => {
        console.error('Could not synchronize the cart', cause);
      });
  }, []);

  const refreshCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await getCatalog());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load the catalog.');
    } finally {
      setLoading(false);
    }
  }, []);

  const syncWithAccount = useCallback(() => {
    if (!token || !user) return;
    enqueue(async () => {
      const localCart = cartRef.current;
      const hasGuestItems =
        !cartOwnerRef.current && Object.keys(localCart).length > 0;
      const snapshot = hasGuestItems
        ? await mergeSyncedCart(cartItems(localCart), token)
        : await getSyncedCart(token);

      cartOwnerRef.current = user.id;
      await AsyncStorage.setItem(CART_OWNER_KEY, user.id);
      replaceCart(cartFromSnapshot(snapshot));
    });
  }, [enqueue, replaceCart, token, user]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const [catalogResult, storageResult] = await Promise.allSettled([
        getCatalog(),
        AsyncStorage.multiGet([CART_KEY, CART_OWNER_KEY, FAVORITES_KEY]),
      ]);

      if (cancelled) return;

      if (catalogResult.status === 'fulfilled') {
        setProducts(catalogResult.value);
      } else {
        setError(
          catalogResult.reason instanceof Error
            ? catalogResult.reason.message
            : 'Could not load the catalog.',
        );
      }

      if (storageResult.status === 'fulfilled') {
        const stored = Object.fromEntries(storageResult.value);
        replaceCart(parseCart(stored[CART_KEY] ?? null));
        cartOwnerRef.current = stored[CART_OWNER_KEY] ?? null;
        setFavorites(parseFavorites(stored[FAVORITES_KEY] ?? null));
      }

      setLoading(false);
      setHydrated(true);
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [replaceCart]);

  useEffect(() => {
    if (hydrated) void AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) void AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites, hydrated]);

  useEffect(() => {
    if (!hydrated || authLoading) return;
    if (token && user) {
      syncWithAccount();
      return;
    }
    if (!token && !user && cartOwnerRef.current) {
      cartOwnerRef.current = null;
      replaceCart({});
      void AsyncStorage.removeItem(CART_OWNER_KEY);
    }
  }, [authLoading, hydrated, replaceCart, syncWithAccount, token, user]);

  useEffect(() => {
    if (!hydrated || !token || !user) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncWithAccount();
    });
    return () => subscription.remove();
  }, [hydrated, syncWithAccount, token, user]);

  useEffect(() => {
    if (!hydrated || !token || !user) return;

    let disposed = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let reconnectAttempt = 0;

    const scheduleReconnect = () => {
      if (disposed || reconnectTimer !== undefined) return;
      const delay = Math.min(1_000 * 2 ** reconnectAttempt, 15_000);
      reconnectAttempt += 1;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = undefined;
        void connect();
      }, delay);
    };

    const connect = async () => {
      try {
        const url = await getCartRealtimeUrl(token);
        if (disposed) return;

        const nextSocket = new WebSocket(url);
        socket = nextSocket;
        nextSocket.addEventListener('open', () => {
          reconnectAttempt = 0;
        });
        nextSocket.addEventListener('message', (event) => {
          try {
            const message: unknown = JSON.parse(String(event.data));
            if (
              !message ||
              typeof message !== 'object' ||
              !('type' in message) ||
              message.type !== 'cart.updated' ||
              !('data' in message)
            ) {
              return;
            }
            const snapshot = message.data as SyncedCart;
            if (!Array.isArray(snapshot.items)) return;
            replaceCart(cartFromSnapshot(snapshot));
          } catch {
            // Ignore malformed realtime messages and keep the connection open.
          }
        });
        nextSocket.addEventListener('error', () => nextSocket.close());
        nextSocket.addEventListener('close', scheduleReconnect);
      } catch {
        scheduleReconnect();
      }
    };

    void connect();
    return () => {
      disposed = true;
      if (reconnectTimer !== undefined) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [hydrated, replaceCart, token, user]);

  const persistItem = useCallback(
    (productId: string, quantity: number) => {
      if (!token || !user) return;
      enqueue(() => setSyncedCartItem(productId, quantity, token));
    },
    [enqueue, token, user],
  );

  const addToCart = useCallback(
    (product: Product) => {
      if (product.stock <= 0) return;
      const nextQuantity = Math.min(
        (cartRef.current[product.id] ?? 0) + 1,
        product.stock,
        20,
      );
      replaceCart({ ...cartRef.current, [product.id]: nextQuantity });
      persistItem(product.id, nextQuantity);
    },
    [persistItem, replaceCart],
  );

  const changeQuantity = useCallback(
    (product: Product, delta: number) => {
      const nextQuantity = Math.min(
        (cartRef.current[product.id] ?? 0) + delta,
        product.stock,
        20,
      );
      if (nextQuantity <= 0) {
        const next = { ...cartRef.current };
        delete next[product.id];
        replaceCart(next);
        persistItem(product.id, 0);
        return;
      }
      replaceCart({ ...cartRef.current, [product.id]: nextQuantity });
      persistItem(product.id, nextQuantity);
    },
    [persistItem, replaceCart],
  );

  const clearCart = useCallback(() => {
    replaceCart({});
    if (token && user) enqueue(() => clearSyncedCart(token));
  }, [enqueue, replaceCart, token, user]);

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((current) =>
      current.includes(productId)
        ? current.filter((item) => item !== productId)
        : [...current, productId],
    );
  }, []);

  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0,
  );

  const value = useMemo(
    () => ({
      products,
      loading,
      error,
      hydrated,
      cart,
      cartCount,
      favorites,
      refreshCatalog,
      addToCart,
      changeQuantity,
      clearCart,
      toggleFavorite,
    }),
    [
      addToCart,
      cart,
      cartCount,
      changeQuantity,
      clearCart,
      error,
      favorites,
      hydrated,
      loading,
      products,
      refreshCatalog,
      toggleFavorite,
    ],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used inside ShopProvider');
  return context;
}
