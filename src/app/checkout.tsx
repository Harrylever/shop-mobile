import { LockKeyIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Checkbox } from 'expo-checkbox';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Palette } from '@/constants/theme';
import {
  clearCheckoutDetails,
  readPendingPayment,
  readSavedCheckoutDetails,
  saveCheckoutDetails,
  savePendingPayment,
} from '@/lib/checkout-storage';
import { initializeCheckout } from '@/lib/shop-api';
import { useAuth } from '@/store/auth-provider';
import { useShop } from '@/store/shop-provider';
import { formatNaira, type CheckoutDetails, type CheckoutResult } from '@/types/shop';

const initialForm: CheckoutDetails = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
};

export default function CheckoutScreen() {
  const { token, user } = useAuth();
  const { cart, products } = useShop();
  const [form, setForm] = useState(() => ({
    ...initialForm,
    name: user?.name ?? '',
    email: user?.email ?? '',
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<CheckoutResult | null>(null);
  const [saveInformation, setSaveInformation] = useState(false);
  const checkoutForm = {
    ...form,
    name: form.name || user?.name || '',
    email: form.email || user?.email || '',
  };
  const items = useMemo(() => products.filter((product) => cart[product.id]), [cart, products]);
  const subtotal = items.reduce((sum, product) => sum + product.priceKobo * (cart[product.id] ?? 0), 0);
  const delivery = subtotal >= 7_500_000 || subtotal === 0 ? 0 : 350_000;
  const total = subtotal + delivery;

  useEffect(() => {
    let active = true;
    void Promise.all([readSavedCheckoutDetails(), readPendingPayment()]).then(
      ([savedDetails, storedPayment]) => {
        if (!active) return;
        if (savedDetails) {
          setForm(savedDetails);
          setSaveInformation(true);
        }
        if (storedPayment) setPendingPayment(storedPayment);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  function update(field: keyof CheckoutDetails, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function openPayment(payment: CheckoutResult) {
    const redirectUri = Linking.createURL('payments/callback', { scheme: 'croesus' });
    const result = await WebBrowser.openAuthSessionAsync(payment.authorizationUrl, redirectUri, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    });
    if (result.type !== 'success') {
      setNotice('Payment was not confirmed. Your order is saved, so you can return to Paystack or check its status.');
      return;
    }
    const parsed = Linking.parse(result.url);
    const returnedReference = parsed.queryParams?.reference;
    const reference = Array.isArray(returnedReference)
      ? returnedReference[0]
      : returnedReference || payment.reference;
    const returnedCancelled = parsed.queryParams?.cancelled;
    const cancelled = Array.isArray(returnedCancelled)
      ? returnedCancelled[0] === 'true'
      : returnedCancelled === 'true';
    router.replace({
      pathname: '/payments/callback',
      params: cancelled ? { reference, cancelled: 'true' } : { reference },
    });
  }

  async function pay() {
    if (!items.length || submitting) return;
    if (!checkoutForm.name.trim() || !checkoutForm.email.includes('@') || checkoutForm.phone.trim().length < 7 || !checkoutForm.address.trim() || !checkoutForm.city.trim() || !checkoutForm.state.trim()) {
      setError('Complete all delivery fields with valid details.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const normalized = Object.fromEntries(
        Object.entries(checkoutForm).map(([key, value]) => [key, value.trim()]),
      ) as CheckoutDetails;
      await (saveInformation
        ? saveCheckoutDetails(normalized)
        : clearCheckoutDetails()
      ).catch(() => undefined);
      const payment = await initializeCheckout(
        normalized,
        items.map((product) => ({ productId: product.id, quantity: cart[product.id] ?? 0 })),
        token,
      );
      setPendingPayment(payment);
      await savePendingPayment(payment).catch(() => undefined);
      await openPayment(payment);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not start payment.');
    } finally {
      setSubmitting(false);
    }
  }

  function checkPendingPayment() {
    if (!pendingPayment || submitting) return;
    router.push({
      pathname: '/payments/callback',
      params: { reference: pendingPayment.reference },
    });
  }

  async function reopenPayment() {
    if (!pendingPayment || submitting) return;
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      await openPayment(pendingPayment);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not reopen payment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>DELIVERY & PAYMENT</Text>
        <Text style={styles.title}>Almost yours.</Text>
        <Text style={styles.copy}>Enter your delivery details, then complete payment securely with Paystack.</Text>

        <View style={styles.form}>
          <Field label="Full name" value={checkoutForm.name} onChangeText={(value) => update('name', value)} autoComplete="name" />
          <Field label="Email address" value={checkoutForm.email} onChangeText={(value) => update('email', value)} autoComplete="email" keyboardType="email-address" autoCapitalize="none" />
          <Field label="Phone number" value={checkoutForm.phone} onChangeText={(value) => update('phone', value)} autoComplete="tel" keyboardType="phone-pad" />
          <Field label="Delivery address" value={checkoutForm.address} onChangeText={(value) => update('address', value)} autoComplete="street-address" />
          <View style={styles.fieldRow}>
            <View style={styles.half}><Field label="City" value={checkoutForm.city} onChangeText={(value) => update('city', value)} autoComplete="postal-address-locality" /></View>
            <View style={styles.half}><Field label="State" value={checkoutForm.state} onChangeText={(value) => update('state', value)} autoComplete="postal-address-region" /></View>
          </View>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Order summary · {items.length} items</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>{formatNaira(subtotal)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Delivery</Text><Text style={styles.summaryValue}>{delivery ? formatNaira(delivery) : 'Free'}</Text></View>
          <View style={[styles.summaryRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.total}>{formatNaira(total)}</Text></View>
        </View>

        <View style={styles.saveRow}>
          <Checkbox
            accessibilityLabel="Save checkout information"
            color={saveInformation ? Palette.forestDark : undefined}
            onValueChange={(value) => {
              setSaveInformation(value);
              if (!value) void clearCheckoutDetails();
            }}
            style={styles.checkbox}
            value={saveInformation}
          />
          <Pressable
            onPress={() => {
              const next = !saveInformation;
              setSaveInformation(next);
              if (!next) void clearCheckoutDetails();
            }}
            style={styles.saveCopy}>
            <Text style={styles.saveLabel}>Save information for faster checkout</Text>
            <Text style={styles.saveHint}>Contact and delivery details are stored securely on this device.</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        {pendingPayment ? (
          <View style={styles.pending}>
            <Text style={styles.pendingLabel}>PAYMENT IN PROGRESS</Text>
            <Text style={styles.pendingReference}>{pendingPayment.reference}</Text>
            <Text style={styles.pendingCopy}>Keep this screen open while you finish securely with Paystack.</Text>
            <Pressable onPress={reopenPayment} style={styles.reopen}>
              <Text style={styles.reopenText}>Return to Paystack</Text>
            </Pressable>
          </View>
        ) : null}
        <Pressable
          disabled={submitting || !items.length}
          onPress={pendingPayment ? checkPendingPayment : pay}
          style={[styles.pay, (submitting || !items.length) && styles.disabled]}>
          <Text style={styles.payText}>
            {submitting
              ? pendingPayment ? 'Checking payment…' : 'Connecting to Paystack…'
              : pendingPayment ? 'Check payment status' : `Pay ${formatNaira(total)}`}
          </Text>
          <HugeiconsIcon icon={LockKeyIcon} size={18} color={Palette.cream} />
        </Pressable>
        <Text style={styles.secure}>Your payment details are handled securely by Paystack.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type FieldProps = React.ComponentProps<typeof TextInput> & { label: string };
function Field({ label, ...props }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...props} placeholderTextColor={Palette.inkSoft} style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { backgroundColor: Palette.cream, flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  kicker: { color: Palette.orange, fontFamily: 'DMSans_700Bold', fontSize: 9, letterSpacing: 1.5 },
  title: { color: Palette.ink, fontFamily: 'DMSans_700Bold', fontSize: 34, letterSpacing: -1.2, marginTop: 5 },
  copy: { color: Palette.inkSoft, fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 20, marginTop: 8 },
  form: { gap: 14, marginTop: 26 },
  field: { gap: 6 },
  label: { color: Palette.ink, fontFamily: 'DMSans_600SemiBold', fontSize: 11 },
  input: { backgroundColor: Palette.white, borderColor: Palette.border, borderWidth: 1, color: Palette.ink, fontFamily: 'DMSans_400Regular', fontSize: 14, height: 50, paddingHorizontal: 14 },
  fieldRow: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  summary: { backgroundColor: Palette.paper, marginTop: 26, padding: 18 },
  summaryTitle: { color: Palette.ink, fontFamily: 'DMSans_700Bold', fontSize: 14, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 11 },
  summaryLabel: { color: Palette.inkSoft, fontFamily: 'DMSans_400Regular', fontSize: 12 },
  summaryValue: { color: Palette.ink, fontFamily: 'DMSans_600SemiBold', fontSize: 12 },
  totalRow: { borderTopColor: Palette.border, borderTopWidth: 1, marginBottom: 0, paddingTop: 14 },
  totalLabel: { color: Palette.ink, fontFamily: 'DMSans_700Bold', fontSize: 15 },
  total: { color: Palette.forestDark, fontFamily: 'DMSans_700Bold', fontSize: 17 },
  saveRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 11, marginTop: 18 },
  checkbox: { borderRadius: 4, height: 20, marginTop: 1, width: 20 },
  saveCopy: { flex: 1 },
  saveLabel: { color: Palette.ink, fontFamily: 'DMSans_600SemiBold', fontSize: 12 },
  saveHint: { color: Palette.inkSoft, fontFamily: 'DMSans_400Regular', fontSize: 10, lineHeight: 15, marginTop: 3 },
  error: { backgroundColor: '#FBE5DF', color: Palette.danger, fontFamily: 'DMSans_500Medium', fontSize: 12, lineHeight: 18, marginTop: 16, padding: 12 },
  notice: { backgroundColor: Palette.sage, color: Palette.forestDark, fontFamily: 'DMSans_500Medium', fontSize: 12, lineHeight: 18, marginTop: 16, padding: 12 },
  pending: { borderColor: Palette.border, borderWidth: 1, marginTop: 16, padding: 16 },
  pendingLabel: { color: Palette.orange, fontFamily: 'DMSans_700Bold', fontSize: 9, letterSpacing: 1.3 },
  pendingReference: { color: Palette.ink, fontFamily: 'DMSans_700Bold', fontSize: 13, marginTop: 5 },
  pendingCopy: { color: Palette.inkSoft, fontFamily: 'DMSans_400Regular', fontSize: 11, lineHeight: 17, marginTop: 6 },
  reopen: { alignSelf: 'flex-start', marginTop: 10, paddingVertical: 4 },
  reopenText: { color: Palette.forest, fontFamily: 'DMSans_700Bold', fontSize: 11, textDecorationLine: 'underline' },
  pay: { alignItems: 'center', backgroundColor: Palette.forestDark, flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, paddingHorizontal: 18, paddingVertical: 17 },
  payText: { color: Palette.cream, fontFamily: 'DMSans_700Bold', fontSize: 13 },
  disabled: { opacity: 0.45 },
  secure: { color: Palette.inkSoft, fontFamily: 'DMSans_400Regular', fontSize: 10, marginTop: 10, textAlign: 'center' },
});
