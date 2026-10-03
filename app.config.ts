import type { ConfigContext, ExpoConfig } from "expo/config"

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Croesus",
  slug: "croesus-store",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/croesus-icon.png",
  scheme: "croesus",
  userInterfaceStyle: "light",
  ios: {
    icon: "./assets/images/croesus-icon.png",
    supportsTablet: true,
    bundleIdentifier: "live.croesus.store",
  },
  android: {
    package: "live.croesus.store",
    adaptiveIcon: {
      backgroundColor: "#173C2B",
      foregroundImage: "./assets/images/croesus-icon.png",
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: "static",
    favicon: "./assets/images/croesus-icon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#173C2B",
        image: "./assets/images/croesus-icon.png",
        imageWidth: 128,
      },
    ],
    "expo-asset",
    "expo-font",
    "expo-image",
    "expo-secure-store",
    "expo-asset",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
})
