import {
  DeliveryTracking01Icon,
  Logout03Icon,
  Shield01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandHeader } from '@/components/brand-header';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/store/auth-provider';

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function AccountScreen() {
  const { authenticating, error, loading, signIn, signOut, user } = useAuth();

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <BrandHeader eyebrow="Your Croesus account" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Palette.orange} />
            <Text style={styles.loadingText}>Restoring your account…</Text>
          </View>
        ) : user ? (
          <>
            <Text style={styles.kicker}>SIGNED IN</Text>
            <Text style={styles.title}>Welcome back.</Text>
            <View style={styles.profileCard}>
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} contentFit="cover" />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.initials}>{initials(user.name)}</Text>
                </View>
              )}
              <View style={styles.identity}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.email}>{user.email}</Text>
                <View style={styles.verifiedRow}>
                  <HugeiconsIcon icon={Shield01Icon} size={14} color={Palette.forest} />
                  <Text style={styles.verified}>Verified with Google</Text>
                </View>
              </View>
            </View>
            <View style={styles.benefit}>
              <Text style={styles.benefitTitle}>Your checkout, connected.</Text>
              <Text style={styles.benefitCopy}>
                Orders placed with {user.email} appear here, including purchases made as a guest before you signed in.
              </Text>
            </View>
            <Pressable onPress={() => router.push('/orders')} style={styles.ordersButton}>
              <View>
                <Text style={styles.ordersButtonTitle}>My orders</Text>
                <Text style={styles.ordersButtonCopy}>View purchases and payment status</Text>
              </View>
              <HugeiconsIcon icon={DeliveryTracking01Icon} size={22} color={Palette.cream} />
            </Pressable>
            <Pressable
              disabled={authenticating}
              onPress={signOut}
              style={[styles.outlineButton, authenticating && styles.disabled]}>
              <Text style={styles.outlineButtonText}>
                {authenticating ? 'Signing out…' : 'Sign out'}
              </Text>
              <HugeiconsIcon icon={Logout03Icon} size={19} color={Palette.forestDark} />
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.mark}>
              <Text style={styles.markText}>C.</Text>
            </View>
            <Text style={styles.kicker}>YOUR ACCOUNT</Text>
            <Text style={styles.title}>Sign in. Shop easier.</Text>
            <Text style={styles.copy}>
              Continue with Google to see purchases placed with the same email, including guest orders, and prefill your verified checkout details.
            </Text>
            <Pressable
              disabled={authenticating}
              onPress={signIn}
              style={[styles.googleButton, authenticating && styles.disabled]}>
              <Text style={styles.googleLetter}>G</Text>
              <Text style={styles.googleButtonText}>
                {authenticating ? 'Opening Google…' : 'Continue with Google'}
              </Text>
            </Pressable>
            <Text style={styles.privacy}>Croesus receives your name, email, and profile photo.</Text>
          </>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: Palette.cream, flex: 1 },
  content: { flexGrow: 1, padding: 24, paddingBottom: 120 },
  center: { alignItems: 'center', flex: 1, gap: 12, justifyContent: 'center' },
  loadingText: { color: Palette.inkSoft, fontFamily: 'DMSans_400Regular', fontSize: 13 },
  mark: { alignItems: 'center', backgroundColor: Palette.forestDark, height: 72, justifyContent: 'center', marginBottom: 28, marginTop: 44, width: 72 },
  markText: { color: Palette.cream, fontFamily: 'DMSans_700Bold', fontSize: 28 },
  kicker: { color: Palette.orange, fontFamily: 'DMSans_700Bold', fontSize: 9, letterSpacing: 1.6, marginTop: 20 },
  title: { color: Palette.ink, fontFamily: 'DMSans_700Bold', fontSize: 34, letterSpacing: -1.2, marginTop: 6 },
  copy: { color: Palette.inkSoft, fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 22, marginTop: 14, maxWidth: 350 },
  googleButton: { alignItems: 'center', backgroundColor: Palette.forestDark, flexDirection: 'row', gap: 14, justifyContent: 'center', marginTop: 30, paddingHorizontal: 18, paddingVertical: 17 },
  googleLetter: { backgroundColor: Palette.white, borderRadius: 12, color: '#4285F4', fontFamily: 'DMSans_700Bold', fontSize: 13, height: 24, lineHeight: 24, textAlign: 'center', width: 24 },
  googleButtonText: { color: Palette.cream, fontFamily: 'DMSans_700Bold', fontSize: 13 },
  privacy: { color: Palette.inkSoft, fontFamily: 'DMSans_400Regular', fontSize: 10, lineHeight: 16, marginTop: 12, textAlign: 'center' },
  profileCard: { alignItems: 'center', backgroundColor: Palette.white, borderColor: Palette.border, borderWidth: 1, flexDirection: 'row', gap: 16, marginTop: 24, padding: 18 },
  avatar: { borderRadius: 34, height: 68, width: 68 },
  avatarFallback: { alignItems: 'center', backgroundColor: Palette.sage, borderRadius: 34, height: 68, justifyContent: 'center', width: 68 },
  initials: { color: Palette.forestDark, fontFamily: 'DMSans_700Bold', fontSize: 20 },
  identity: { flex: 1 },
  name: { color: Palette.ink, fontFamily: 'DMSans_700Bold', fontSize: 18 },
  email: { color: Palette.inkSoft, fontFamily: 'DMSans_400Regular', fontSize: 11, marginTop: 3 },
  verifiedRow: { alignItems: 'center', flexDirection: 'row', gap: 5, marginTop: 10 },
  verified: { color: Palette.forest, fontFamily: 'DMSans_600SemiBold', fontSize: 10 },
  benefit: { backgroundColor: Palette.paper, marginTop: 18, padding: 18 },
  benefitTitle: { color: Palette.ink, fontFamily: 'DMSans_700Bold', fontSize: 14 },
  benefitCopy: { color: Palette.inkSoft, fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 19, marginTop: 7 },
  ordersButton: { alignItems: 'center', backgroundColor: Palette.forestDark, flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, padding: 18 },
  ordersButtonTitle: { color: Palette.cream, fontFamily: 'DMSans_700Bold', fontSize: 14 },
  ordersButtonCopy: { color: Palette.sage, fontFamily: 'DMSans_400Regular', fontSize: 10, marginTop: 3 },
  outlineButton: { alignItems: 'center', borderColor: Palette.forestDark, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 22, paddingHorizontal: 18, paddingVertical: 16 },
  outlineButtonText: { color: Palette.forestDark, fontFamily: 'DMSans_700Bold', fontSize: 13 },
  disabled: { opacity: 0.5 },
  error: { backgroundColor: '#FBE5DF', color: Palette.danger, fontFamily: 'DMSans_500Medium', fontSize: 12, lineHeight: 18, marginTop: 16, padding: 12 },
});
