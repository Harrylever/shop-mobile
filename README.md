# Croesus mobile

The Expo mobile storefront for Croesus Fashion & Stores. It uses the same catalog,
inventory, checkout, Paystack, and order-confirmation backend as the web store.

## Included

- Live database-backed product catalog from `shop-backend`
- Search and category filters
- Product detail screens
- Persistent favorites and shopping bag via AsyncStorage
- Google sign-in with a SecureStore-backed mobile session
- Stock-aware quantity controls
- Guest delivery form and Paystack checkout handoff
- Android, iOS, and web-compatible Expo Router navigation
- Croesus app icon and splash branding

## Requirements

- Bun
- Node.js 22.13 or newer for Expo SDK 57
- Expo Go or an Android/iOS simulator

## Configure

Copy `.env.example` to `.env.local`:

```sh
cp .env.example .env.local
```

The production API is the default, so the app runs without an environment file.
Override it when working against a local backend:

```env
EXPO_PUBLIC_SHOP_API_URL=http://192.168.1.20:4100
```

Use your computer's LAN address on a physical device. `localhost` points to the
phone itself. Add the Expo web origin to the backend `CORS_ORIGINS` when testing
the web target.

## Run

```sh
bun install
bunx expo start
```

Then press `i`, `a`, or `w` for iOS, Android, or web. You can also scan the QR
code with Expo Go.

The catalog and guest checkout work in Expo Go. Google sign-in uses the stable
`croesus://auth/callback` deep link and therefore requires a development or release
build. Expo recommends a build for stable OAuth callback URLs because Expo Go URLs
change with the development server.

## Validate

```sh
bunx expo lint
bunx tsc --noEmit
bunx expo-doctor
```

## Payments

Checkout creates an order through `POST /api/v1/orders/checkout` and opens the
returned Paystack authorization URL with `expo-web-browser`. Payment state remains
authoritative on the backend through Paystack verification and webhooks.

## Authentication

The app opens the backend Google OAuth flow with `expo-web-browser`. After Google
returns to `croesus://auth/callback`, the app exchanges the short-lived, single-use
code with its PKCE verifier for a session token and stores that token with
`expo-secure-store`. Authenticated API calls send it as a bearer token. The existing
web storefront continues to use its HTTP-only session cookie.
