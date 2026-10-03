import {
  FavouriteIcon,
  Home01Icon,
  Search01Icon,
  ShoppingBag02Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native"
import {
  Tabs,
  TabList,
  TabSlot,
  TabTrigger,
  type TabTriggerSlotProps,
} from "expo-router/ui"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Palette } from "@/constants/theme"
import { useShop } from "@/store/shop-provider"

function TabButton({
  icon,
  label,
  count,
  isFocused,
  ...props
}: TabTriggerSlotProps & {
  icon: IconSvgElement
  label: string
  count?: number
}) {
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
        <HugeiconsIcon
          icon={icon}
          size={21}
          color={isFocused ? Palette.cream : Palette.inkSoft}
          strokeWidth={isFocused ? 2.1 : 1.7}
        />
        {count ? (
          <View style={styles.count}>
            <Text style={styles.countText}>{count > 99 ? "99+" : count}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.label, isFocused && styles.labelActive]}>
        {label}
      </Text>
    </Pressable>
  )
}

export default function ShopTabs() {
  const insets = useSafeAreaInsets()
  const { cartCount, favorites } = useShop()
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <View
          style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 9) }]}
        >
          <TabTrigger name="home" href="/" asChild>
            <TabButton icon={Home01Icon} label="Home" />
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton icon={Search01Icon} label="Explore" />
          </TabTrigger>
          <TabTrigger name="favorites" href="/favorites" asChild>
            <TabButton
              icon={FavouriteIcon}
              label="Saved"
              count={favorites.length}
            />
          </TabTrigger>
          <TabTrigger name="bag" href="/bag" asChild>
            <TabButton icon={ShoppingBag02Icon} label="Bag" count={cartCount} />
          </TabTrigger>
          <TabTrigger name="account" href="/account" asChild>
            <TabButton icon={UserCircleIcon} label="Account" />
          </TabTrigger>
        </View>
      </TabList>
    </Tabs>
  )
}

const styles = StyleSheet.create({
  slot: { height: "100%" },
  tabBar: {
    alignItems: "center",
    backgroundColor: Palette.white,
    borderColor: Palette.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    flexDirection: "row",
    left: 0,
    paddingHorizontal: 10,
    paddingTop: 8,
    position: "absolute",
    right: 0,
  },
  tab: { alignItems: "center", flex: 1, gap: 3, justifyContent: "center" },
  iconWrap: {
    alignItems: "center",
    borderRadius: 19,
    height: 36,
    justifyContent: "center",
    position: "relative",
    width: 48,
  },
  iconWrapActive: { backgroundColor: Palette.forestDark },
  label: {
    color: Palette.inkSoft,
    fontFamily: "DMSans_600SemiBold",
    fontSize: 10,
  },
  labelActive: { color: Palette.forestDark },
  count: {
    alignItems: "center",
    backgroundColor: Palette.orange,
    borderRadius: 8,
    height: 16,
    justifyContent: "center",
    minWidth: 16,
    paddingHorizontal: 3,
    position: "absolute",
    right: 1,
    top: -2,
  },
  countText: {
    color: Palette.white,
    fontFamily: "DMSans_700Bold",
    fontSize: 8,
  },
  pressed: { opacity: 0.7 },
})
