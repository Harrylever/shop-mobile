import { Platform } from 'react-native';

export const Palette = {
  forest: '#1F5139',
  forestDark: '#173C2B',
  orange: '#DE6A3A',
  cream: '#FFF9F0',
  paper: '#F7F3EA',
  white: '#FFFFFF',
  ink: '#162019',
  inkSoft: '#657069',
  border: '#DDD8CE',
  sage: '#DCE6D3',
  danger: '#A63B2B',
} as const;

export const Colors = {
  light: {
    text: Palette.ink,
    background: Palette.cream,
    backgroundElement: Palette.paper,
    backgroundSelected: Palette.sage,
    textSecondary: Palette.inkSoft,
  },
  dark: {
    text: Palette.ink,
    background: Palette.cream,
    backgroundElement: Palette.paper,
    backgroundSelected: Palette.sage,
    textSecondary: Palette.inkSoft,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'DMSans_400Regular',
    serif: 'Georgia',
    rounded: 'DMSans_600SemiBold',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'DMSans_400Regular',
    serif: 'serif',
    rounded: 'DMSans_600SemiBold',
    mono: 'monospace',
  },
  web: {
    sans: 'DMSans_400Regular',
    serif: 'Georgia, serif',
    rounded: 'DMSans_600SemiBold',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
  seven: 48,
} as const;

export const BottomTabInset = 88;
export const MaxContentWidth = 760;
