import type { ConfigContext, ExpoConfig } from "expo/config"

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Croesus",
  slug: "croesus-store",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "croesus",
  userInterfaceStyle: "light",
  ios: {
    icon: "./assets/images/icon.png",
    supportsTablet: true,
    bundleIdentifier: "live.croesus.store",
  },
  android: {
    package: "live.croesus.store",
    adaptiveIcon: {
      backgroundColor: "#173C2B",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: "static",
    favicon: "./assets/images/icon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#FFFFFF",
        image: "./assets/images/splash-icon.png",
        imageWidth: 150,
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
  extra: {
    eas: {
      projectId: "6969141a-a86c-4d2f-bc87-34735d266949",
    },
  },
})
