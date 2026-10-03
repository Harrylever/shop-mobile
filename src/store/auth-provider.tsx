import AsyncStorage from "@react-native-async-storage/async-storage"
import Constants from "expo-constants"
import * as Crypto from "expo-crypto"
import * as Linking from "expo-linking"
import * as SecureStore from "expo-secure-store"
import * as WebBrowser from "expo-web-browser"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { Platform } from "react-native"

import {
  endSession,
  exchangeMobileAuthCode,
  getCurrentUser,
  mobileGoogleAuthUrl,
} from "@/lib/shop-api"
import type { ShopUser } from "@/types/shop"

const SESSION_KEY = "croesus.mobile.session.v1"

type AuthContextValue = {
  user: ShopUser | null
  token: string | null
  loading: boolean
  authenticating: boolean
  error: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function readToken() {
  if (Platform.OS === "web") return AsyncStorage.getItem(SESSION_KEY)
  return SecureStore.getItemAsync(SESSION_KEY)
}

async function saveToken(token: string) {
  if (Platform.OS === "web") return AsyncStorage.setItem(SESSION_KEY, token)
  return SecureStore.setItemAsync(SESSION_KEY, token)
}

async function removeToken() {
  if (Platform.OS === "web") return AsyncStorage.removeItem(SESSION_KEY)
  return SecureStore.deleteItemAsync(SESSION_KEY)
}

function callbackCode(url: string) {
  const parsed = Linking.parse(url)
  const value = parsed.queryParams?.code
  return Array.isArray(value) ? value[0] : value
}

function hex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ShopUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [authenticating, setAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      const storedToken = await readToken()
      if (!storedToken) {
        if (!cancelled) setLoading(false)
        return
      }
      try {
        const account = await getCurrentUser(storedToken)
        if (cancelled) return
        if (account) {
          setToken(storedToken)
          setUser(account)
        } else {
          await removeToken()
        }
      } catch {
        if (!cancelled) {
          setToken(storedToken)
          setError(
            "We could not refresh your account. Check your connection and try again.",
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void restoreSession()
    return () => {
      cancelled = true
    }
  }, [])

  const signIn = useCallback(async () => {
    if (authenticating) return
    setAuthenticating(true)
    setError(null)
    try {
      if (Platform.OS === "web") {
        throw new Error(
          "Google sign-in is available in the Croesus Android and iOS apps.",
        )
      }
      if (Constants.appOwnership === "expo") {
        throw new Error(
          "Google sign-in requires a Croesus development build rather than Expo Go.",
        )
      }
      const redirectUri = Linking.createURL("auth/callback", {
        scheme: "croesus",
      })
      const verifier = hex(await Crypto.getRandomBytesAsync(32))
      const challenge = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        verifier,
      )
      const result = await WebBrowser.openAuthSessionAsync(
        mobileGoogleAuthUrl(redirectUri, challenge),
        redirectUri,
      )
      if (result.type !== "success") return
      const code = callbackCode(result.url)
      if (!code) throw new Error("Google did not return a valid sign-in code.")
      const session = await exchangeMobileAuthCode(code, verifier)
      await saveToken(session.token)
      setToken(session.token)
      setUser(session.user)
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Google sign-in failed.",
      )
    } finally {
      setAuthenticating(false)
    }
  }, [authenticating])

  const signOut = useCallback(async () => {
    const activeToken = token
    setAuthenticating(true)
    setError(null)
    try {
      if (activeToken) await endSession(activeToken)
    } catch {
      // Clearing the local credential still signs this device out.
    } finally {
      await removeToken()
      setToken(null)
      setUser(null)
      setAuthenticating(false)
    }
  }, [token])

  const value = useMemo(
    () => ({ user, token, loading, authenticating, error, signIn, signOut }),
    [authenticating, error, loading, signIn, signOut, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}
