import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenBackground from '@/components/ScreenBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';

export default function RequestsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user, listUsers, coachApproveUser } = useAuth();

  const pendingParticipants = useMemo(() => {
    const all = listUsers();
    return all.filter(
      (u) => (u.role === 'student' || u.role === 'staff') && !u.approvedByCoach
    );
  }, [listUsers]);

  return (
    <ScreenBackground>
      <View style={styles.container}>
        {user?.role === 'coach' ? (
          <>
            <Text style={[styles.title, { color: theme.text }]}>Pending Requests</Text>
            <FlatList
              data={pendingParticipants}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              ListEmptyComponent={<Text style={{ color: theme.icon }}>No pending requests.</Text>}
              renderItem={({ item }) => (
                <View style={[styles.card, { borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }]}> 
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
                    <Text style={{ color: theme.icon }}>{item.email} • {item.role}</Text>
                  </View>
                  <Pressable onPress={() => coachApproveUser(item.id)} style={[styles.approveBtn, { backgroundColor: theme.tint }]}>
                    <Text style={styles.approveText}>Approve</Text>
                  </Pressable>
                </View>
              )}
            />
          </>
        ) : (
          <Text style={{ color: theme.icon, textAlign: 'center' }}>Requests are available to coaches only.</Text>
        )}
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  card: { padding: 12, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontWeight: '700' },
  approveBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  approveText: { color: '#fff', fontWeight: '700' },
});
