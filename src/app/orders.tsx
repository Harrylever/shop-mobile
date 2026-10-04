import { DeliveryTracking01Icon, RefreshIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/theme';
import { getOrders } from '@/lib/shop-api';
import { useAuth } from '@/store/auth-provider';
import { formatNaira, type OrderHistory } from '@/types/shop';

const statusLabel = {
  paid: 'Payment confirmed',
  pending: 'Awaiting payment',
  failed: 'Payment unsuccessful',
} as const;

type OrdersState =
  | { type: 'loading'; orders: OrderHistory[] }
  | { type: 'ready'; orders: OrderHistory[] }
  | { type: 'error'; orders: OrderHistory[]; message: string };

export default function OrdersScreen() {
  const { authenticating, loading: authLoading, signIn, token, user } = useAuth();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<OrdersState>({ type: 'loading', orders: [] });

  useEffect(() => {
    if (!token) return;
    let active = true;
    void getOrders(token)
      .then((orders) => {
        if (active) setState({ type: 'ready', orders });
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setState({
          type: 'error',
          orders: [],
          message: cause instanceof Error ? cause.message : 'Could not load your orders.',
        });
      });
    return () => {
      active = false;
    };
  }, [attempt, token]);

  if (authLoading) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.center}>
        <ActivityIndicator color={Palette.orange} />
        <Text style={styles.centerCopy}>Restoring your account…</Text>
      </SafeAreaView>
    );
  }

  if (!user || !token) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.center}>
        <View style={styles.icon}>
          <HugeiconsIcon icon={DeliveryTracking01Icon} size={31} color={Palette.cream} />
        </View>
        <Text style={styles.centerTitle}>Sign in to track your orders</Text>
        <Text style={styles.centerCopy}>
          Purchases made with your verified Google email will appear here, including guest orders.
        </Text>
        <Pressable
          disabled={authenticating}
          onPress={() => void signIn()}
          style={[styles.primaryButton, authenticating && styles.disabled]}>
          <Text style={styles.primaryButtonText}>
            {authenticating ? 'Opening Google…' : 'Continue with Google'}
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <FlatList
        data={state.orders}
        keyExtractor={(order) => order.id}
        contentContainerStyle={[styles.list, !state.orders.length && styles.emptyList]}
        ListHeaderComponent={
          <View style={styles.heading}>
            <Text style={styles.kicker}>ORDER HISTORY</Text>
            <Text style={styles.title}>Your purchases</Text>
            <Text style={styles.intro}>Orders placed with {user.email} are connected to this account.</Text>
          </View>
        }
        ListEmptyComponent={
          state.type === 'loading' ? (
            <View style={styles.empty}>
              <ActivityIndicator color={Palette.orange} />
              <Text style={styles.centerCopy}>Loading your orders…</Text>
            </View>
          ) : state.type === 'error' ? (
            <View style={styles.empty}>
              <Text style={styles.centerTitle}>We could not load your orders</Text>
              <Text style={styles.centerCopy}>{state.message}</Text>
              <Pressable
                onPress={() => {
                  setState({ type: 'loading', orders: [] });
                  setAttempt((value) => value + 1);
                }}
                style={styles.retryButton}>
                <HugeiconsIcon icon={RefreshIcon} size={17} color={Palette.cream} />
                <Text style={styles.primaryButtonText}>Try again</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.empty}>
              <View style={styles.icon}>
                <HugeiconsIcon icon={DeliveryTracking01Icon} size={31} color={Palette.cream} />
              </View>
              <Text style={styles.centerTitle}>No orders yet</Text>
              <Text style={styles.centerCopy}>Your next Croesus purchase will appear here.</Text>
            </View>
          )
        }
        renderItem={({ item: order }) => (
          <View style={styles.order}>
            <View style={styles.orderHeader}>
              <View style={styles.orderIdentity}>
                <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
                <Text numberOfLines={1} style={styles.reference}>{order.reference}</Text>
              </View>
              <View style={[styles.status, styles[`${order.status}Status`]]}>
                <Text style={[styles.statusText, styles[`${order.status}StatusText`]]}>
                  {statusLabel[order.status]}
                </Text>
              </View>
            </View>
            <View style={styles.items}>
              {order.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text numberOfLines={2} style={styles.itemName}>{item.quantity}× {item.productName}</Text>
                  <Text style={styles.itemPrice}>{formatNaira(item.lineTotalKobo)}</Text>
                </View>
              ))}
            </View>
            <View style={styles.orderFooter}>
              <View style={styles.destination}>
                <Text style={styles.destinationLabel}>DELIVER TO</Text>
                <Text style={styles.destinationText}>{order.deliveryCity}, {order.deliveryState}</Text>
              </View>
              <Text style={styles.total}>{formatNaira(order.totalKobo)}</Text>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

const styles = StyleSheet.create({
  safe: { backgroundColor: Palette.cream, flex: 1 },
  list: { gap: 14, padding: 20, paddingBottom: 44 },
  emptyList: { flexGrow: 1 },
  heading: { marginBottom: 10 },
  kicker: { color: Palette.orange, fontFamily: 'DMSans_700Bold', fontSize: 9, letterSpacing: 1.5 },
  title: { color: Palette.ink, fontFamily: 'DMSans_700Bold', fontSize: 32, letterSpacing: -1, marginTop: 4 },
  intro: { color: Palette.inkSoft, fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 18, marginTop: 7 },
  center: { alignItems: 'center', backgroundColor: Palette.cream, flex: 1, justifyContent: 'center', padding: 28 },
  empty: { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 300, padding: 24 },
  icon: { alignItems: 'center', backgroundColor: Palette.forestDark, borderRadius: 34, height: 68, justifyContent: 'center', marginBottom: 18, width: 68 },
  centerTitle: { color: Palette.ink, fontFamily: 'DMSans_700Bold', fontSize: 21, textAlign: 'center' },
  centerCopy: { color: Palette.inkSoft, fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 20, marginTop: 8, maxWidth: 340, textAlign: 'center' },
  primaryButton: { backgroundColor: Palette.forestDark, marginTop: 22, paddingHorizontal: 22, paddingVertical: 15 },
  primaryButtonText: { color: Palette.cream, fontFamily: 'DMSans_700Bold', fontSize: 12 },
  retryButton: { alignItems: 'center', backgroundColor: Palette.forestDark, flexDirection: 'row', gap: 8, marginTop: 20, paddingHorizontal: 20, paddingVertical: 13 },
  disabled: { opacity: 0.5 },
  order: { backgroundColor: Palette.white, borderColor: Palette.border, borderWidth: 1 },
  orderHeader: { alignItems: 'center', borderBottomColor: Palette.border, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 10, justifyContent: 'space-between', padding: 15 },
  orderIdentity: { flex: 1 },
  date: { color: Palette.inkSoft, fontFamily: 'DMSans_400Regular', fontSize: 10 },
  reference: { color: Palette.ink, fontFamily: 'DMSans_700Bold', fontSize: 11, marginTop: 3 },
  status: { paddingHorizontal: 8, paddingVertical: 6 },
  statusText: { fontFamily: 'DMSans_700Bold', fontSize: 8, letterSpacing: 0.4, textTransform: 'uppercase' },
  paidStatus: { backgroundColor: Palette.sage },
  paidStatusText: { color: Palette.forestDark },
  pendingStatus: { backgroundColor: '#F4E8C8' },
  pendingStatusText: { color: '#7B5B1C' },
  failedStatus: { backgroundColor: '#FBE5DF' },
  failedStatusText: { color: Palette.danger },
  items: { gap: 10, padding: 15 },
  itemRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  itemName: { color: Palette.inkSoft, flex: 1, fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 17 },
  itemPrice: { color: Palette.ink, fontFamily: 'DMSans_600SemiBold', fontSize: 11 },
  orderFooter: { alignItems: 'flex-end', backgroundColor: Palette.paper, borderTopColor: Palette.border, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'space-between', padding: 15 },
  destination: { flex: 1 },
  destinationLabel: { color: Palette.inkSoft, fontFamily: 'DMSans_700Bold', fontSize: 8, letterSpacing: 0.7 },
  destinationText: { color: Palette.ink, fontFamily: 'DMSans_500Medium', fontSize: 11, marginTop: 3 },
  total: { color: Palette.forestDark, fontFamily: 'DMSans_700Bold', fontSize: 17 },
});
