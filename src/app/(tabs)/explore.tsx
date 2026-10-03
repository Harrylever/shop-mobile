import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react-native"
import { useMemo, useState } from "react"
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { BrandHeader } from "@/components/brand-header"
import { ProductCard } from "@/components/product-card"
import { EmptyState, ErrorState, LoadingState } from "@/components/screen-state"
import { Palette } from "@/constants/theme"
import { useShop } from "@/store/shop-provider"
import { categories } from "@/types/shop"

export default function ExploreScreen() {
  const { products, loading, error, refreshCatalog } = useShop()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<(typeof categories)[number]>("All")
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return products.filter(
      (product) =>
        (category === "All" || product.category === category) &&
        (!normalized ||
          `${product.name} ${product.category}`
            .toLowerCase()
            .includes(normalized)),
    )
  }, [category, products, query])

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <BrandHeader eyebrow="Browse everything" />
      <View style={styles.search}>
        <HugeiconsIcon icon={Search01Icon} size={19} color={Palette.inkSoft} />
        <TextInput
          accessibilityLabel="Search products"
          onChangeText={setQuery}
          placeholder="Search clothes, furniture, tech…"
          placeholderTextColor={Palette.inkSoft}
          returnKeyType="search"
          style={styles.searchInput}
          value={query}
        />
      </View>
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshCatalog} />
        }
        ListHeaderComponent={
          <>
            <FlatList
              horizontal
              data={categories}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.categories}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setCategory(item)}
                  style={[styles.chip, item === category && styles.chipActive]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      item === category && styles.chipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
              showsHorizontalScrollIndicator={false}
            />
            <View style={styles.heading}>
              <Text style={styles.title}>
                {category === "All" ? "All essentials" : category}
              </Text>
              <Text style={styles.count}>{visible.length} items</Text>
            </View>
            {loading && products.length === 0 ? <LoadingState /> : null}
            {error && products.length === 0 ? (
              <ErrorState message={error} retry={refreshCatalog} />
            ) : null}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <EmptyState
              title="No matches found"
              copy="Try another search or category."
            />
          ) : null
        }
        renderItem={({ item }) => <ProductCard product={item} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { backgroundColor: Palette.cream, flex: 1 },
  search: {
    alignItems: "center",
    backgroundColor: Palette.white,
    borderColor: Palette.border,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 14,
  },
  searchInput: {
    color: Palette.ink,
    flex: 1,
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    height: 48,
  },
  list: { paddingBottom: 120, paddingHorizontal: 20 },
  row: { gap: 14, marginBottom: 20 },
  categories: { gap: 8, paddingBottom: 20, paddingTop: 18 },
  chip: {
    borderColor: Palette.border,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipActive: {
    backgroundColor: Palette.forestDark,
    borderColor: Palette.forestDark,
  },
  chipText: {
    color: Palette.inkSoft,
    fontFamily: "DMSans_600SemiBold",
    fontSize: 11,
  },
  chipTextActive: { color: Palette.cream },
  heading: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    color: Palette.ink,
    fontFamily: "DMSans_700Bold",
    fontSize: 25,
    letterSpacing: -0.8,
  },
  count: {
    color: Palette.inkSoft,
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
  },
})
