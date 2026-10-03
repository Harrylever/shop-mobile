import { Add01Icon, FavouriteIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/theme';
import { useShop } from '@/store/shop-provider';
import { formatNaira, type Product } from '@/types/shop';

const productColors: Record<string, [string, string]> = {
  'campus-hoodie': ['#DCE6D3', '#587260'],
  'vintage-denim-jacket': ['#D8E5E8', '#557B91'],
  'compact-study-desk': ['#EADBC9', '#9D684B'],
  'ergonomic-chair': ['#D8D9D4', '#626963'],
  'compact-fridge': ['#E7ECE8', '#729184'],
  'electric-kettle': ['#EBE0B9', '#A98C3F'],
  'wireless-headphones': ['#E9D5CF', '#9E5F58'],
  'surge-power-strip': ['#DDD9E7', '#736A91'],
  'double-wardrobe': ['#E1D6CA', '#856950'],
  'scientific-calculator': ['#D7D4D0', '#565C5A'],
};

export function ProductArtwork({ product, large = false }: { product: Product; large?: boolean }) {
  const colors = productColors[product.id] ?? ['#E2E6E4', '#66736E'];
  return (
    <View style={[styles.art, large && styles.artLarge, { backgroundColor: colors[0] }]}>
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <>
          <View style={[styles.artOrb, { backgroundColor: colors[1] }]} />
          <Text style={[styles.artLetter, { color: colors[0] }]}>{product.name.slice(0, 1)}</Text>
        </>
      )}
      <View style={styles.conditionPill}>
        <Text style={styles.conditionText}>{product.stock === 0 ? 'Sold out' : product.condition}</Text>
      </View>
    </View>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, favorites, toggleFavorite } = useShop();
  const favorite = favorites.includes(product.id);

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${product.name}`}
        onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}>
        <ProductArtwork product={product} />
      </Pressable>
      <Pressable
        accessibilityLabel={`${favorite ? 'Remove' : 'Add'} ${product.name} ${favorite ? 'from' : 'to'} favorites`}
        onPress={() => toggleFavorite(product.id)}
        style={[styles.favorite, favorite && styles.favoriteActive]}>
        <HugeiconsIcon
          icon={FavouriteIcon}
          size={17}
          color={favorite ? Palette.white : Palette.forestDark}
          strokeWidth={2}
        />
      </Pressable>
      <Text style={styles.category}>{product.category}</Text>
      <Text numberOfLines={2} style={styles.name}>
        {product.name}
      </Text>
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.price}>{formatNaira(product.priceKobo)}</Text>
          {product.compareAtPriceKobo ? (
            <Text style={styles.compare}>{formatNaira(product.compareAtPriceKobo)}</Text>
          ) : null}
        </View>
        <Pressable
          accessibilityLabel={`Add ${product.name} to bag`}
          disabled={product.stock === 0}
          onPress={() => addToCart(product)}
          style={({ pressed }) => [
            styles.add,
            product.stock === 0 && styles.disabled,
            pressed && styles.pressed,
          ]}>
          <HugeiconsIcon icon={Add01Icon} size={19} color={Palette.cream} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, flexBasis: '46%', maxWidth: '50%', minWidth: 0, paddingBottom: 8 },
  art: {
    alignItems: 'center',
    aspectRatio: 0.88,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  artLarge: { aspectRatio: 1.08, borderRadius: 20 },
  artOrb: { borderRadius: 80, height: '54%', opacity: 0.88, transform: [{ rotate: '-8deg' }], width: '46%' },
  artLetter: { fontFamily: 'DMSans_700Bold', fontSize: 54, position: 'absolute' },
  conditionPill: {
    backgroundColor: 'rgba(255,249,240,0.86)',
    left: 9,
    paddingHorizontal: 8,
    paddingVertical: 5,
    position: 'absolute',
    top: 9,
  },
  conditionText: {
    color: Palette.forestDark,
    fontFamily: 'DMSans_700Bold',
    fontSize: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  favorite: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,249,240,0.92)',
    borderRadius: 18,
    height: 34,
    justifyContent: 'center',
    position: 'absolute',
    right: 9,
    top: 9,
    width: 34,
  },
  favoriteActive: { backgroundColor: Palette.orange },
  category: {
    color: Palette.inkSoft,
    fontFamily: 'DMSans_700Bold',
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  name: { color: Palette.ink, fontFamily: 'DMSans_600SemiBold', fontSize: 14, lineHeight: 18, marginTop: 3 },
  cardFooter: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  price: { color: Palette.forestDark, fontFamily: 'DMSans_700Bold', fontSize: 13 },
  compare: { color: Palette.inkSoft, fontFamily: 'DMSans_400Regular', fontSize: 9, textDecorationLine: 'line-through' },
  add: { alignItems: 'center', backgroundColor: Palette.forestDark, borderRadius: 17, height: 34, justifyContent: 'center', width: 34 },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
});
