import React, { useState } from 'react';
import { Alert, FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenBackground from '@/components/ScreenBackground';
import { useAuth, Team } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AdminTeams() {
  const { listTeams, adminAddTeam, adminDeleteTeam, adminBlockTeam } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [name, setName] = useState('');
  const [refresh, setRefresh] = useState(0);

  const teams = listTeams();

  const addTeam = () => {
    const n = name.trim();
    if (!n) return;
    adminAddTeam(n);
    setName('');
    setRefresh(v => v + 1);
  };

  const renderItem = ({ item }: { item: Team }) => (
    <View style={[styles.card, { borderColor: theme.tabIconDefault }]}>
      <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
      {item.blocked && <Text style={{ color: '#cc0000', fontWeight: '700' }}>Blocked</Text>}
      <View style={styles.row}>
        <Pressable onPress={() => adminBlockTeam(item.id, !item.blocked)} style={[styles.btn, { backgroundColor: item.blocked ? '#1f7a44' : '#a11' }]}>
          <Text style={styles.btnText}>{item.blocked ? 'Unblock' : 'Block'}</Text>
        </Pressable>
        <Pressable onPress={() => {
          Alert.alert('Confirm', `Delete team ${item.name}?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => { adminDeleteTeam(item.id); setRefresh(v => v + 1); } },
          ]);
        }} style={[styles.btn, { backgroundColor: '#555' }]}>
          <Text style={styles.btnText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 16, gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="New team name"
              placeholderTextColor="#9CA3AF"
              style={[styles.input, { flex: 1, color: '#fff', backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.25)' }]}
            />
            <Pressable onPress={addTeam} style={[styles.btn, { backgroundColor: theme.tint }]}>
              <Text style={styles.btnText}>Add</Text>
            </Pressable>
          </View>
          <FlatList
            data={teams}
            extraData={refresh}
            keyExtractor={(t) => t.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            ListEmptyComponent={<Text style={{ color: '#E5E7EB', textAlign: 'center', marginTop: 20 }}>No teams yet.</Text>}
          />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 4, borderColor: 'rgba(255,255,255,0.22)', backgroundColor: 'rgba(17,24,39,0.5)' },
  name: { fontSize: 16, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
});
