import { StyleSheet } from 'react-native';
import colors from './colors';

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 24,
  },
  fieldLabel: {
    color: colors.muted,
    marginBottom: 6,
    fontSize: 12,
  }
});
