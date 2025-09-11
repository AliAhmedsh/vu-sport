import React, { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * Wrap any screen with a full-bleed sports-themed background + dark overlay.
 * Usage:
 * <ScreenBackground>
 *   ...content...
 * </ScreenBackground>
 */
export default function ScreenBackground({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  return (
    <View style={[styles.root, { backgroundColor: theme.background }, style]}>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, padding: 16 },
});
