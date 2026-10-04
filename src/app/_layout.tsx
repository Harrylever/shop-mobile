import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  useFonts,
} from "@expo-google-fonts/dm-sans"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { Palette } from "@/constants/theme"
import { AuthProvider } from "@/store/auth-provider"
import { ShopProvider } from "@/store/shop-provider"

void SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded) void SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ShopProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: Palette.cream },
              headerBackButtonDisplayMode: "minimal",
              headerShadowVisible: false,
              headerStyle: { backgroundColor: Palette.cream },
              headerTintColor: Palette.forestDark,
              headerTitleStyle: { fontFamily: "DMSans_600SemiBold" },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="product/[id]"
              options={{ title: "Product details" }}
            />
            <Stack.Screen
              name="checkout"
              options={{ title: "Secure checkout", presentation: "modal" }}
            />
            <Stack.Screen name="orders" options={{ title: "Your orders" }} />
            <Stack.Screen
              name="auth/callback"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="payments/callback"
              options={{ headerShown: false }}
            />
          </Stack>
        </ShopProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
