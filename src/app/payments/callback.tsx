import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/theme';
import { clearPendingPayment } from '@/lib/checkout-storage';
import { verifyPayment } from '@/lib/shop-api';
import { useShop } from '@/store/shop-provider';

type PaymentState =
  | { type: 'checking' }
  | { type: 'paid'; email: string }
  | { type: 'pending' }
  | { type: 'failed'; message: string };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function PaymentCallbackScreen() {
  const params = useLocalSearchParams<{
    reference?: string | string[];
    cancelled?: string | string[];
  }>();
  const reference = first(params.reference);
  const cancelled = first(params.cancelled) === 'true';
  const { clearCart } = useShop();
  const [paymentState, setPaymentState] = useState<PaymentState>({ type: 'checking' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    if (cancelled) return () => {
      active = false;
    };
    if (!reference) {
      void Promise.resolve().then(() => {
        if (active) {
          setPaymentState({
            type: 'failed',
            message: 'Paystack did not return an order reference.',
          });
        }
      });
      return () => {
        active = false;
      };
    }
    void verifyPayment(reference)
      .then(async (verification) => {
        if (!active) return;
        if (verification.status === 'paid') {
          await clearPendingPayment();
          if (!active) return;
          clearCart();
          setPaymentState({ type: 'paid', email: verification.email });
        } else if (verification.status === 'failed') {
          await clearPendingPayment();
          if (!active) return;
          setPaymentState({
            type: 'failed',
            message: 'Paystack marked this payment as unsuccessful. You can start a new checkout.',
          });
        } else {
          setPaymentState({ type: 'pending' });
        }
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setPaymentState({
          type: 'failed',
          message: cause instanceof Error ? cause.message : 'Could not verify this payment.',
        });
      });
    return () => {
      active = false;
    };
  }, [attempt, cancelled, clearCart, reference]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <View style={styles.mark}>
          <Text style={styles.markText}>C.</Text>
        </View>
        {cancelled ? (
          <>
            <Text style={styles.title}>Payment paused</Text>
            <Text style={styles.copy}>
              Your order is still here. Return to checkout when you are ready to finish paying.
            </Text>
            <Action label="Return to checkout" onPress={() => router.replace('/checkout')} />
          </>
        ) : paymentState.type === 'checking' ? (
          <>
            <ActivityIndicator color={Palette.orange} />
            <Text style={styles.title}>Confirming payment…</Text>
            <Text style={styles.copy}>We are securely checking this transaction with Paystack.</Text>
          </>
        ) : paymentState.type === 'paid' ? (
          <>
            <Text style={styles.success}>PAYMENT CONFIRMED</Text>
            <Text style={styles.title}>Thank you for your order.</Text>
            <Text style={styles.copy}>
              Order {reference} is confirmed. We sent the receipt to {paymentState.email}.
            </Text>
            <Action label="Continue shopping" onPress={() => router.replace('/')} />
          </>
        ) : paymentState.type === 'pending' ? (
          <>
            <Text style={styles.title}>Payment is still processing</Text>
            <Text style={styles.copy}>
              Paystack has not confirmed this transaction yet. Wait a moment, then check again.
            </Text>
            <Action
              label="Check again"
              onPress={() => {
                setPaymentState({ type: 'checking' });
                setAttempt((value) => value + 1);
              }}
            />
            <Pressable onPress={() => router.replace('/checkout')} style={styles.textAction}>
              <Text style={styles.textActionLabel}>Return to checkout</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.title}>We could not confirm payment</Text>
            <Text style={styles.copy}>{paymentState.message}</Text>
            <Action label="Return to checkout" onPress={() => router.replace('/checkout')} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function Action({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    alignItems: 'center',
    backgroundColor: Palette.cream,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderColor: Palette.border,
    borderWidth: 1,
    maxWidth: 420,
    padding: 28,
    width: '100%',
  },
  mark: {
    alignItems: 'center',
    backgroundColor: Palette.forestDark,
    height: 64,
    justifyContent: 'center',
    marginBottom: 24,
    width: 64,
  },
  markText: { color: Palette.cream, fontFamily: 'DMSans_700Bold', fontSize: 25 },
  success: {
    color: Palette.orange,
    fontFamily: 'DMSans_700Bold',
    fontSize: 9,
    letterSpacing: 1.4,
  },
  title: {
    color: Palette.ink,
    fontFamily: 'DMSans_700Bold',
    fontSize: 22,
    marginTop: 18,
    textAlign: 'center',
  },
  copy: {
    color: Palette.inkSoft,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 9,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Palette.forestDark,
    marginTop: 22,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  buttonText: { color: Palette.cream, fontFamily: 'DMSans_700Bold', fontSize: 12 },
  textAction: { marginTop: 14, padding: 6 },
  textActionLabel: {
    color: Palette.forest,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
