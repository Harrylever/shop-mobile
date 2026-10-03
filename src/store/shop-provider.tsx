import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getCatalog } from '@/lib/shop-api';
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

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<Cart>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

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

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const [catalogResult, storageResult] = await Promise.allSettled([
        getCatalog(),
        AsyncStorage.multiGet([CART_KEY, FAVORITES_KEY]),
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
        const entries = storageResult.value;
        const stored = Object.fromEntries(entries);
        setCart(parseCart(stored[CART_KEY] ?? null));
        setFavorites(parseFavorites(stored[FAVORITES_KEY] ?? null));
      }

      setLoading(false);
      setHydrated(true);
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated) void AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) void AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites, hydrated]);

  const addToCart = useCallback((product: Product) => {
    if (product.stock <= 0) return;
    setCart((current) => ({
      ...current,
      [product.id]: Math.min((current[product.id] ?? 0) + 1, product.stock, 20),
    }));
  }, []);

  const changeQuantity = useCallback((product: Product, delta: number) => {
    setCart((current) => {
      const nextQuantity = Math.min((current[product.id] ?? 0) + delta, product.stock, 20);
      if (nextQuantity <= 0) {
        const next = { ...current };
        delete next[product.id];
        return next;
      }
      return { ...current, [product.id]: nextQuantity };
    });
  }, []);

  const clearCart = useCallback(() => setCart({}), []);
  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((current) =>
      current.includes(productId)
        ? current.filter((item) => item !== productId)
        : [...current, productId],
    );
  }, []);
  const cartCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0);

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
