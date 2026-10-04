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
  useRef,
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
const PENDING_VERIFIER_KEY = "croesus.mobile.auth-verifier.v1"

type AuthContextValue = {
  user: ShopUser | null
  token: string | null
  loading: boolean
  authenticating: boolean
  error: string | null
  completeSignIn: (code: string) => Promise<boolean>
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function readStorage(key: string) {
  if (Platform.OS === "web") return AsyncStorage.getItem(key)
  return SecureStore.getItemAsync(key)
}

async function saveStorage(key: string, value: string) {
  if (Platform.OS === "web") return AsyncStorage.setItem(key, value)
  return SecureStore.setItemAsync(key, value)
}

async function removeStorage(key: string) {
  if (Platform.OS === "web") return AsyncStorage.removeItem(key)
  return SecureStore.deleteItemAsync(key)
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
  const completionRef = useRef<Promise<boolean> | null>(null)

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      const storedToken = await readStorage(SESSION_KEY)
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
          await removeStorage(SESSION_KEY)
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

  const completeSignIn = useCallback((code: string) => {
    if (completionRef.current) return completionRef.current

    const completion = (async () => {
      setAuthenticating(true)
      setError(null)
      try {
        const verifier = await readStorage(PENDING_VERIFIER_KEY)
        if (!verifier) {
          const existingToken = await readStorage(SESSION_KEY)
          if (existingToken) {
            const existingUser = await getCurrentUser(existingToken)
            if (existingUser) {
              setToken(existingToken)
              setUser(existingUser)
              return true
            }
          }
          throw new Error("This Google sign-in request expired. Please start again.")
        }
        const session = await exchangeMobileAuthCode(code, verifier)
        await saveStorage(SESSION_KEY, session.token)
        setToken(session.token)
        setUser(session.user)
        return true
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : "Google sign-in failed.",
        )
        return false
      } finally {
        await removeStorage(PENDING_VERIFIER_KEY)
        setAuthenticating(false)
        completionRef.current = null
      }
    })()

    completionRef.current = completion
    return completion
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
      await saveStorage(PENDING_VERIFIER_KEY, verifier)
      const result = await WebBrowser.openAuthSessionAsync(
        mobileGoogleAuthUrl(redirectUri, challenge),
        redirectUri,
      )
      if (result.type !== "success") {
        return
      }
      const code = callbackCode(result.url)
      if (!code) throw new Error("Google did not return a valid sign-in code.")
      await completeSignIn(code)
    } catch (cause) {
      await removeStorage(PENDING_VERIFIER_KEY)
      setError(
        cause instanceof Error ? cause.message : "Google sign-in failed.",
      )
    } finally {
      setAuthenticating(false)
    }
  }, [authenticating, completeSignIn])

  const signOut = useCallback(async () => {
    const activeToken = token
    setAuthenticating(true)
    setError(null)
    try {
      if (activeToken) await endSession(activeToken)
    } catch {
      // Clearing the local credential still signs this device out.
    } finally {
      await Promise.all([
        removeStorage(SESSION_KEY),
        removeStorage(PENDING_VERIFIER_KEY),
      ])
      setToken(null)
      setUser(null)
      setAuthenticating(false)
    }
  }, [token])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      authenticating,
      error,
      completeSignIn,
      signIn,
      signOut,
    }),
    [
      authenticating,
      completeSignIn,
      error,
      loading,
      signIn,
      signOut,
      token,
      user,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}
