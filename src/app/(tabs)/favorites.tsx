import { router } from "expo-router"
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { BrandHeader } from "@/components/brand-header"
import { ProductCard } from "@/components/product-card"
import { EmptyState } from "@/components/screen-state"
import { Palette } from "@/constants/theme"
import { useShop } from "@/store/shop-provider"

export default function FavoritesScreen() {
  const { favorites, products } = useShop()
  const selected = products.filter((product) => favorites.includes(product.id))

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <BrandHeader eyebrow="Your shortlist" />
      <FlatList
        data={selected}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.list,
          !selected.length && styles.emptyList,
        ]}
        ListHeaderComponent={
          selected.length ? (
            <View style={styles.heading}>
              <Text style={styles.kicker}>SAVED FOR LATER</Text>
              <Text style={styles.title}>Favorites</Text>
              <Text style={styles.copy}>
                Your best finds, kept in one place.
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View>
            <EmptyState
              title="Nothing saved yet"
              copy="Tap the heart on any product to keep it here."
            />
            <Pressable
              onPress={() => router.push("/explore")}
              style={styles.exploreButton}
            >
              <Text style={styles.exploreText}>Explore products</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => <ProductCard product={item} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { backgroundColor: Palette.cream, flex: 1 },
  list: { paddingBottom: 120, paddingHorizontal: 20 },
  emptyList: { flexGrow: 1 },
  row: { gap: 14, marginBottom: 20 },
  heading: { paddingBottom: 24, paddingTop: 22 },
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
    marginTop: 5,
  },
  copy: {
    color: Palette.inkSoft,
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    marginTop: 6,
  },
  exploreButton: {
    alignSelf: "center",
    backgroundColor: Palette.forestDark,
    marginTop: -70,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  exploreText: {
    color: Palette.cream,
    fontFamily: "DMSans_700Bold",
    fontSize: 12,
  },
})
