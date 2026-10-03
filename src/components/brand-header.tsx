import { ShoppingBag02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/theme';
import { useShop } from '@/store/shop-provider';

export function BrandHeader({ eyebrow }: { eyebrow?: string }) {
  const { cartCount } = useShop();
  return (
    <View style={styles.header}>
      <View>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.wordmark}>
          Croesus<Text style={styles.dot}>.</Text>
        </Text>
      </View>
      <Pressable
        accessibilityLabel={`Open shopping bag with ${cartCount} items`}
        onPress={() => router.push('/bag')}
        style={({ pressed }) => [styles.bag, pressed && styles.pressed]}>
        <HugeiconsIcon icon={ShoppingBag02Icon} size={21} color={Palette.cream} strokeWidth={1.8} />
        {cartCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  eyebrow: {
    color: Palette.inkSoft,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  wordmark: {
    color: Palette.forestDark,
    fontFamily: 'DMSans_700Bold',
    fontSize: 27,
    letterSpacing: -1.2,
  },
  dot: { color: Palette.orange },
  bag: {
    alignItems: 'center',
    backgroundColor: Palette.forestDark,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderColor: Palette.cream,
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 3,
    position: 'absolute',
    right: -4,
    top: -4,
  },
  badgeText: { color: Palette.white, fontFamily: 'DMSans_700Bold', fontSize: 9 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.97 }] },
});
