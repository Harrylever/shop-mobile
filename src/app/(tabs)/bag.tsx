import {
  Add01Icon,
  MinusSignIcon,
  ShoppingBag02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react-native"
import { router } from "expo-router"
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { ProductArtwork } from "@/components/product-card"
import { EmptyState } from "@/components/screen-state"
import { Palette } from "@/constants/theme"
import { useShop } from "@/store/shop-provider"
import { formatNaira } from "@/types/shop"

export default function BagScreen() {
  const { cart, cartCount, changeQuantity, products } = useShop()
  const items = products.filter((product) => cart[product.id])
  const subtotal = items.reduce(
    (sum, product) => sum + product.priceKobo * (cart[product.id] ?? 0),
    0,
  )
  const delivery = subtotal >= 7_500_000 || subtotal === 0 ? 0 : 350_000

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>READY WHEN YOU ARE</Text>
          <Text style={styles.title}>Your bag</Text>
        </View>
        <View style={styles.bagCount}>
          <Text style={styles.bagCountText}>{cartCount}</Text>
        </View>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, !items.length && styles.emptyList]}
        ListEmptyComponent={
          <View>
            <EmptyState
              title="Your bag is empty"
              copy="Add a campus find and it will appear here."
            />
            <Pressable
              onPress={() => router.push("/explore")}
              style={styles.shopButton}
            >
              <Text style={styles.shopButtonText}>Start shopping</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const quantity = cart[item.id] ?? 0
          return (
            <View style={styles.item}>
              <View style={styles.artWrap}>
                <ProductArtwork product={item} />
              </View>
              <View style={styles.itemCopy}>
                <Text style={styles.itemMeta}>
                  {item.condition} · {item.category}
                </Text>
                <Text numberOfLines={2} style={styles.itemName}>
                  {item.name}
                </Text>
                <Text style={styles.itemPrice}>
                  {formatNaira(item.priceKobo * quantity)}
                </Text>
                <View style={styles.quantity}>
                  <Pressable
                    accessibilityLabel={`Remove one ${item.name}`}
                    onPress={() => changeQuantity(item, -1)}
                    style={styles.quantityButton}
                  >
                    <HugeiconsIcon
                      icon={MinusSignIcon}
                      size={15}
                      color={Palette.forestDark}
                    />
                  </Pressable>
                  <Text style={styles.quantityText}>{quantity}</Text>
                  <Pressable
                    accessibilityLabel={`Add one ${item.name}`}
                    disabled={quantity >= item.stock}
                    onPress={() => changeQuantity(item, 1)}
                    style={[
                      styles.quantityButton,
                      quantity >= item.stock && styles.disabled,
                    ]}
                  >
                    <HugeiconsIcon
                      icon={Add01Icon}
                      size={15}
                      color={Palette.forestDark}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          )
        }}
        ListFooterComponent={
          items.length ? (
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatNaira(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={styles.summaryValue}>
                  {delivery ? formatNaira(delivery) : "Free"}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.total}>
                  {formatNaira(subtotal + delivery)}
                </Text>
              </View>
              <Pressable
                onPress={() => router.push("/checkout")}
                style={styles.checkout}
              >
                <Text style={styles.checkoutText}>Continue to checkout</Text>
                <HugeiconsIcon
                  icon={ShoppingBag02Icon}
                  size={18}
                  color={Palette.cream}
                />
              </Pressable>
              <Text style={styles.note}>
                Free delivery on orders over ₦75,000.
              </Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { backgroundColor: Palette.cream, flex: 1 },
  header: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  kicker: {
    color: Palette.orange,
    fontFamily: "DMSans_700Bold",
    fontSize: 9,
    letterSpacing: 1.5,
  },
  title: {
    color: Palette.ink,
    fontFamily: "DMSans_700Bold",
    fontSize: 31,
    letterSpacing: -1,
    marginTop: 4,
  },
  bagCount: {
    alignItems: "center",
    backgroundColor: Palette.forestDark,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  bagCountText: {
    color: Palette.cream,
    fontFamily: "DMSans_700Bold",
    fontSize: 13,
  },
  list: { paddingBottom: 120, paddingHorizontal: 20 },
  emptyList: { flexGrow: 1 },
  item: {
    borderBottomColor: Palette.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 14,
    paddingVertical: 16,
  },
  artWrap: { height: 132, overflow: "hidden", width: 112 },
  itemCopy: { flex: 1 },
  itemMeta: {
    color: Palette.inkSoft,
    fontFamily: "DMSans_700Bold",
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  itemName: {
    color: Palette.ink,
    fontFamily: "DMSans_600SemiBold",
    fontSize: 16,
    lineHeight: 20,
    marginTop: 4,
  },
  itemPrice: {
    color: Palette.forestDark,
    fontFamily: "DMSans_700Bold",
    fontSize: 14,
    marginTop: 8,
  },
  quantity: { alignItems: "center", flexDirection: "row", marginTop: 12 },
  quantityButton: {
    alignItems: "center",
    borderColor: Palette.border,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    width: 34,
  },
  quantityText: {
    color: Palette.ink,
    fontFamily: "DMSans_700Bold",
    fontSize: 12,
    textAlign: "center",
    width: 38,
  },
  disabled: { opacity: 0.35 },
  summary: { backgroundColor: Palette.white, marginTop: 24, padding: 20 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    color: Palette.inkSoft,
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
  },
  summaryValue: {
    color: Palette.ink,
    fontFamily: "DMSans_600SemiBold",
    fontSize: 13,
  },
  totalRow: {
    borderTopColor: Palette.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
    paddingTop: 16,
  },
  totalLabel: {
    color: Palette.ink,
    fontFamily: "DMSans_700Bold",
    fontSize: 16,
  },
  total: {
    color: Palette.forestDark,
    fontFamily: "DMSans_700Bold",
    fontSize: 18,
  },
  checkout: {
    alignItems: "center",
    backgroundColor: Palette.forestDark,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  checkoutText: {
    color: Palette.cream,
    fontFamily: "DMSans_700Bold",
    fontSize: 13,
  },
  note: {
    color: Palette.inkSoft,
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    marginTop: 11,
    textAlign: "center",
  },
  shopButton: {
    alignSelf: "center",
    backgroundColor: Palette.forestDark,
    marginTop: -70,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  shopButtonText: {
    color: Palette.cream,
    fontFamily: "DMSans_700Bold",
    fontSize: 12,
  },
})
