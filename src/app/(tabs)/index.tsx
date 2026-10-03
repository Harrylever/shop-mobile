import {
  ArrowRight01Icon,
  DeliveryTruck02Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react-native"
import { router } from "expo-router"
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { BrandHeader } from "@/components/brand-header"
import { ProductCard } from "@/components/product-card"
import { ErrorState, LoadingState } from "@/components/screen-state"
import { Palette } from "@/constants/theme"
import { useShop } from "@/store/shop-provider"

export default function HomeScreen() {
  const { products, loading, error, refreshCatalog } = useShop()
  const featured = products.slice(0, 4)

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <BrandHeader eyebrow="Campus essentials" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading && products.length > 0}
            onRefresh={refreshCatalog}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>THE STUDENT STORE</Text>
          <Text style={styles.heroTitle}>
            Good finds.{`\n`}Better campus days.
          </Text>
          <Text style={styles.heroCopy}>
            Shop trusted fashion, furniture, electronics and everyday essentials
            in one place.
          </Text>
          <Pressable
            onPress={() => router.push("/explore")}
            style={styles.heroButton}
          >
            <Text style={styles.heroButtonText}>Shop the collection</Text>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              color={Palette.forestDark}
              size={18}
            />
          </Pressable>
          <View style={styles.heroStamp}>
            <Text style={styles.stampC}>C</Text>
            <Text style={styles.stampDot}>.</Text>
          </View>
        </View>

        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <HugeiconsIcon
              icon={DeliveryTruck02Icon}
              size={19}
              color={Palette.forest}
            />
            <View>
              <Text style={styles.trustTitle}>Campus delivery</Text>
              <Text style={styles.trustCopy}>Fast and trackable</Text>
            </View>
          </View>
          <View style={styles.trustItem}>
            <HugeiconsIcon
              icon={Shield01Icon}
              size={19}
              color={Palette.forest}
            />
            <View>
              <Text style={styles.trustTitle}>Secure payment</Text>
              <Text style={styles.trustCopy}>Powered by Paystack</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.kicker}>CURATED FOR YOU</Text>
            <Text style={styles.sectionTitle}>Fresh campus finds</Text>
          </View>
          <Pressable onPress={() => router.push("/explore")}>
            <Text style={styles.viewAll}>View all</Text>
          </Pressable>
        </View>

        {loading && products.length === 0 ? <LoadingState /> : null}
        {error && products.length === 0 ? (
          <ErrorState message={error} retry={refreshCatalog} />
        ) : null}
        <View style={styles.grid}>
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>

        <View style={styles.story}>
          <Text style={styles.storyKicker}>
            COMMON GOODS, THOUGHTFULLY CHOSEN
          </Text>
          <Text style={styles.storyTitle}>
            Everything you need to make campus feel like home.
          </Text>
          <Text style={styles.storyCopy}>
            New essentials and quality used finds, priced for student life.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { backgroundColor: Palette.cream, flex: 1 },
  content: { paddingBottom: 120 },
  hero: {
    backgroundColor: Palette.forestDark,
    margin: 14,
    minHeight: 340,
    overflow: "hidden",
    padding: 24,
    position: "relative",
  },
  heroKicker: {
    color: "#BFD0C2",
    fontFamily: "DMSans_700Bold",
    fontSize: 10,
    letterSpacing: 1.8,
  },
  heroTitle: {
    color: Palette.cream,
    fontFamily: "DMSans_700Bold",
    fontSize: 38,
    letterSpacing: -1.7,
    lineHeight: 41,
    marginTop: 24,
    maxWidth: 290,
  },
  heroCopy: {
    color: "#D6DFD8",
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 14,
    maxWidth: 290,
  },
  heroButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: Palette.cream,
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  heroButtonText: {
    color: Palette.forestDark,
    fontFamily: "DMSans_700Bold",
    fontSize: 12,
  },
  heroStamp: {
    alignItems: "baseline",
    bottom: -24,
    flexDirection: "row",
    opacity: 0.08,
    position: "absolute",
    right: -8,
  },
  stampC: {
    color: Palette.cream,
    fontFamily: "DMSans_700Bold",
    fontSize: 170,
    letterSpacing: -18,
  },
  stampDot: {
    color: Palette.orange,
    fontFamily: "DMSans_700Bold",
    fontSize: 100,
  },
  trustRow: {
    borderBottomColor: Palette.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 18,
    marginHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 4,
  },
  trustItem: { alignItems: "center", flex: 1, flexDirection: "row", gap: 9 },
  trustTitle: {
    color: Palette.ink,
    fontFamily: "DMSans_600SemiBold",
    fontSize: 11,
  },
  trustCopy: {
    color: Palette.inkSoft,
    fontFamily: "DMSans_400Regular",
    fontSize: 9,
    marginTop: 2,
  },
  sectionHeading: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    marginHorizontal: 20,
    marginTop: 34,
  },
  kicker: {
    color: Palette.orange,
    fontFamily: "DMSans_700Bold",
    fontSize: 9,
    letterSpacing: 1.5,
  },
  sectionTitle: {
    color: Palette.ink,
    fontFamily: "DMSans_700Bold",
    fontSize: 24,
    letterSpacing: -0.8,
    marginTop: 4,
  },
  viewAll: {
    color: Palette.forest,
    fontFamily: "DMSans_700Bold",
    fontSize: 11,
    textDecorationLine: "underline",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    paddingHorizontal: 20,
  },
  story: {
    backgroundColor: Palette.orange,
    marginHorizontal: 14,
    marginTop: 38,
    padding: 24,
  },
  storyKicker: {
    color: "#FFE0D2",
    fontFamily: "DMSans_700Bold",
    fontSize: 9,
    letterSpacing: 1.4,
  },
  storyTitle: {
    color: Palette.white,
    fontFamily: "DMSans_700Bold",
    fontSize: 26,
    letterSpacing: -0.8,
    lineHeight: 31,
    marginTop: 12,
  },
  storyCopy: {
    color: "#FFF2EB",
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
})
