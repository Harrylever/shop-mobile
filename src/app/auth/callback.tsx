import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Palette } from "@/constants/theme"
import { useAuth } from "@/store/auth-provider"

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{ code?: string | string[] }>()
  const code = Array.isArray(params.code) ? params.code[0] : params.code
  const { completeSignIn, error, user } = useAuth()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true

    async function finish() {
      if (user) {
        router.replace("/account")
        return
      }
      if (!code) {
        setFailed(true)
        return
      }
      const completed = await completeSignIn(code)
      if (!active) return
      if (completed) router.replace("/account")
      else setFailed(true)
    }

    void finish()
    return () => {
      active = false
    }
  }, [code, completeSignIn, user])

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <View style={styles.mark}>
          <Text style={styles.markText}>C.</Text>
        </View>
        {failed ? (
          <>
            <Text style={styles.title}>Sign-in was not completed.</Text>
            <Text style={styles.copy}>
              {error ?? "Google did not return a valid authentication code."}
            </Text>
            <Pressable onPress={() => router.replace("/account")} style={styles.button}>
              <Text style={styles.buttonText}>Return to account</Text>
            </Pressable>
          </>
        ) : (
          <>
            <ActivityIndicator color={Palette.orange} />
            <Text style={styles.title}>Finishing sign-in…</Text>
            <Text style={styles.copy}>Securely connecting your Google account to Croesus.</Text>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { alignItems: "center", backgroundColor: Palette.cream, flex: 1, justifyContent: "center", padding: 24 },
  card: { alignItems: "center", backgroundColor: Palette.white, borderColor: Palette.border, borderWidth: 1, maxWidth: 420, padding: 28, width: "100%" },
  mark: { alignItems: "center", backgroundColor: Palette.forestDark, height: 64, justifyContent: "center", marginBottom: 24, width: 64 },
  markText: { color: Palette.cream, fontFamily: "DMSans_700Bold", fontSize: 25 },
  title: { color: Palette.ink, fontFamily: "DMSans_700Bold", fontSize: 22, marginTop: 18, textAlign: "center" },
  copy: { color: Palette.inkSoft, fontFamily: "DMSans_400Regular", fontSize: 13, lineHeight: 20, marginTop: 9, textAlign: "center" },
  button: { backgroundColor: Palette.forestDark, marginTop: 22, paddingHorizontal: 20, paddingVertical: 14 },
  buttonText: { color: Palette.cream, fontFamily: "DMSans_700Bold", fontSize: 12 },
})
