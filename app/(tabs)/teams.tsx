import React from 'react';
import { StyleSheet, FlatList, View, Text } from 'react-native';
import ScreenBackground from '@/components/ScreenBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const mockTeams = [
  { id: 't1', name: 'VU Cricket Team' },
  { id: 't2', name: 'VU Football Club' },
  { id: 't3', name: 'VU Badminton Squad' },
];

export default function TeamsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  return (
    <ScreenBackground>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>Teams</Text>
        <FlatList
          data={mockTeams}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }]}> 
              <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
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
  
});
