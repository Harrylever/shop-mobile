import { FavouriteIcon, ShoppingBag02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react-native"
import { router, useLocalSearchParams } from "expo-router"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"

import { ProductArtwork } from "@/components/product-card"
import { EmptyState } from "@/components/screen-state"
import { Palette } from "@/constants/theme"
import { useShop } from "@/store/shop-provider"
import { formatNaira } from "@/types/shop"

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { addToCart, cart, favorites, products, toggleFavorite } = useShop()
  const product = products.find((item) => item.id === id)

  if (!product) {
    return (
      <EmptyState
        title="Product unavailable"
        copy="This item may have been removed from the collection."
      />
    )
  }

  const favorite = favorites.includes(product.id)
  const quantity = cart[product.id] ?? 0
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ProductArtwork product={product} large />
      <View style={styles.metaRow}>
        <Text style={styles.meta}>
          {product.category} · {product.condition}
        </Text>
        <Text style={styles.stock}>
          {product.stock === 0 ? "Sold out" : `${product.stock} available`}
        </Text>
      </View>
      <Text style={styles.name}>{product.name}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatNaira(product.priceKobo)}</Text>
        {product.compareAtPriceKobo ? (
          <Text style={styles.compare}>
            {formatNaira(product.compareAtPriceKobo)}
          </Text>
        ) : null}
      </View>
      <Text style={styles.description}>
        {product.description ??
          `A practical ${product.condition} ${product.category.toLowerCase()} find selected for student life.`}
      </Text>
      <View style={styles.detailGrid}>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>CONDITION</Text>
          <Text style={styles.detailValue}>
            {product.condition === "new" ? "Brand new" : "Quality checked"}
          </Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>DELIVERY</Text>
          <Text style={styles.detailValue}>Campus ready</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={() => toggleFavorite(product.id)}
          style={[styles.favorite, favorite && styles.favoriteActive]}
        >
          <HugeiconsIcon
            icon={FavouriteIcon}
            size={21}
            color={favorite ? Palette.white : Palette.forestDark}
          />
        </Pressable>
        <Pressable
          disabled={product.stock === 0 || quantity >= product.stock}
          onPress={() => addToCart(product)}
          style={[
            styles.add,
            (product.stock === 0 || quantity >= product.stock) &&
              styles.disabled,
          ]}
        >
          <Text style={styles.addText}>
            {quantity ? `Add another · ${quantity} in bag` : "Add to bag"}
          </Text>
          <HugeiconsIcon
            icon={ShoppingBag02Icon}
            size={19}
            color={Palette.cream}
          />
        </Pressable>
      </View>
      {quantity ? (
        <Pressable onPress={() => router.push("/bag")} style={styles.viewBag}>
          <Text style={styles.viewBagText}>View bag and checkout</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { backgroundColor: Palette.cream, padding: 20, paddingBottom: 48 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },
  meta: {
    color: Palette.orange,
    fontFamily: "DMSans_700Bold",
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  stock: {
    color: Palette.forest,
    fontFamily: "DMSans_600SemiBold",
    fontSize: 10,
  },
  name: {
    color: Palette.ink,
    fontFamily: "DMSans_700Bold",
    fontSize: 32,
    letterSpacing: -1.2,
    lineHeight: 37,
    marginTop: 9,
  },
  priceRow: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  price: {
    color: Palette.forestDark,
    fontFamily: "DMSans_700Bold",
    fontSize: 21,
  },
  compare: {
    color: Palette.inkSoft,
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    textDecorationLine: "line-through",
  },
  description: {
    color: Palette.inkSoft,
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 20,
  },
  detailGrid: { flexDirection: "row", gap: 10, marginTop: 24 },
  detail: { backgroundColor: Palette.paper, flex: 1, padding: 15 },
  detailLabel: {
    color: Palette.inkSoft,
    fontFamily: "DMSans_700Bold",
    fontSize: 8,
    letterSpacing: 1.1,
  },
  detailValue: {
    color: Palette.ink,
    fontFamily: "DMSans_600SemiBold",
    fontSize: 12,
    marginTop: 5,
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 24 },
  favorite: {
    alignItems: "center",
    borderColor: Palette.forestDark,
    borderWidth: 1,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  favoriteActive: {
    backgroundColor: Palette.orange,
    borderColor: Palette.orange,
  },
  add: {
    alignItems: "center",
    backgroundColor: Palette.forestDark,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  addText: { color: Palette.cream, fontFamily: "DMSans_700Bold", fontSize: 13 },
  disabled: { opacity: 0.4 },
  viewBag: { alignItems: "center", marginTop: 18, paddingVertical: 12 },
  viewBagText: {
    color: Palette.forest,
    fontFamily: "DMSans_700Bold",
    fontSize: 12,
    textDecorationLine: "underline",
  },
})
