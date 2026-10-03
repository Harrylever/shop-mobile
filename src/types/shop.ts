export type ProductCategory = 'Fashion' | 'Furniture' | 'Appliances' | 'Electronics' | 'Study';

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  condition: 'new' | 'used';
  priceKobo: number;
  compareAtPriceKobo: number | null;
  stock: number;
  imageUrl: string | null;
  imageAttributionName: string | null;
  imageAttributionUrl: string | null;
  imageSourceUrl: string | null;
};

export type CheckoutDetails = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
};

export type CheckoutResult = {
  orderId: string;
  reference: string;
  authorizationUrl: string;
};

export type ShopUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isAdmin: boolean;
};

export const categories = [
  'All',
  'Fashion',
  'Furniture',
  'Appliances',
  'Electronics',
  'Study',
] as const;

export function formatNaira(kobo: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}
