export function useColorScheme() {
  // Croesus currently ships with one deliberate, light storefront theme.
  // Keeping the web value stable also prevents a server/client hydration mismatch.
  return 'light';
}
