import React from 'react';
import { StyleSheet, FlatList, View, Text } from 'react-native';
import ScreenBackground from '@/components/ScreenBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const mockEvents = [
  { id: '1', title: 'Cricket Trials', date: 'Sep 20, 2025' },
  { id: '2', title: 'Football Friendly', date: 'Sep 25, 2025' },
  { id: '3', title: 'Badminton Championship', date: 'Oct 2, 2025' },
];

export default function EventsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  return (
    <ScreenBackground>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>Events</Text>
        <FlatList
          data={mockEvents}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.cardSubtitle, { color: theme.icon }]}>{item.date}</Text>
            </View>
          )}
        />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  card: { padding: 12, borderRadius: 12, borderWidth: 1 },
  cardTitle: { fontWeight: '700' },
  cardSubtitle: {},
});
