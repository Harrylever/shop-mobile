import { RefreshIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/theme';

export function LoadingState({ label = 'Loading the collection…' }: { label?: string }) {
  return (
    <View style={styles.state}>
      <ActivityIndicator color={Palette.orange} size="small" />
      <Text style={styles.copy}>{label}</Text>
    </View>
  );
}

export function EmptyState({ title, copy }: { title: string; copy: string }) {
  return (
    <View style={styles.state}>
      <View style={styles.monogram}><Text style={styles.monogramText}>C.</Text></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.copy}>{copy}</Text>
    </View>
  );
}

export function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return (
    <View style={styles.state}>
      <Text style={styles.title}>We could not load the store.</Text>
      <Text style={styles.copy}>{message}</Text>
      <Pressable onPress={retry} style={styles.retry}>
        <HugeiconsIcon icon={RefreshIcon} size={17} color={Palette.white} />
        <Text style={styles.retryText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  state: { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 360, padding: 28 },
  monogram: { alignItems: 'center', backgroundColor: Palette.forestDark, borderRadius: 36, height: 72, justifyContent: 'center', marginBottom: 18, width: 72 },
  monogramText: { color: Palette.cream, fontFamily: 'DMSans_700Bold', fontSize: 28 },
  title: { color: Palette.ink, fontFamily: 'DMSans_700Bold', fontSize: 22, textAlign: 'center' },
  copy: { color: Palette.inkSoft, fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 21, marginTop: 8, textAlign: 'center' },
  retry: { alignItems: 'center', backgroundColor: Palette.forestDark, borderRadius: 24, flexDirection: 'row', gap: 8, marginTop: 20, paddingHorizontal: 18, paddingVertical: 12 },
  retryText: { color: Palette.white, fontFamily: 'DMSans_600SemiBold', fontSize: 13 },
});
