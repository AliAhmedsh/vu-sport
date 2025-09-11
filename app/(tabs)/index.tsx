import { StyleSheet, View, Text } from 'react-native';
import ScreenBackground from '@/components/ScreenBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  return (
    <ScreenBackground>
      <View style={styles.container}>
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Text style={[styles.title, { color: theme.text }]}>Home</Text>
          <Text style={[styles.subtitle, { color: theme.icon }]}>Browse events and teams using the tabs below.</Text>
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: {},
});
