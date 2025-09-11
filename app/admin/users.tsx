import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenBackground from '@/components/ScreenBackground';
import { useAuth, User } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AdminUsers() {
  const {
    listUsers,
    adminApproveUser,
    adminBlockUser,
    adminDeleteUser,
    adminUpdateUser,
  } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [query, setQuery] = useState('');
  const users = listUsers();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editRole, setEditRole] = useState<User['role']>('student');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => [u.name, u.email, u.role].some(v => (v || '').toString().toLowerCase().includes(q)));
  }, [users, query]);

  const renderItem = ({ item }: { item: User }) => {
    const pending = item.role === 'coach' ? !item.approvedByAdmin : (item.role === 'student' || item.role === 'staff') ? !item.approvedByCoach : false;
    const isEditing = editingId === item.id;
    return (
      <View style={[styles.card, { borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }]}>
        <Text style={[styles.name, { color: theme.text }]}>{item.name} <Text style={{ color: theme.icon }}>({item.role})</Text></Text>
        <Text style={{ color: theme.icon }}>{item.email}</Text>
        {pending && <Text style={{ color: '#a16600', fontWeight: '700' }}>Pending Approval</Text>}
        {item.blocked && <Text style={{ color: '#cc0000', fontWeight: '700' }}>Blocked</Text>}
        {isEditing && (
          <View style={{ gap: 6, marginTop: 8 }}>
            <TextInput value={editName} onChangeText={setEditName} placeholder="Full name" style={[styles.input, { color: theme.text }]} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['student','staff','coach','admin'] as User['role'][]).map(r => (
                <Pressable key={r} onPress={() => setEditRole(r)} style={[styles.chip, editRole === r && { backgroundColor: theme.tint, borderColor: theme.tint }]}>
                  <Text style={{ color: editRole === r ? '#fff' : theme.text, fontWeight: '600', textTransform: 'capitalize' }}>{r}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={[styles.row, { marginTop: 8 }]}>
          {!isEditing && (
            <Pressable onPress={() => { setEditingId(item.id); setEditName(item.name); setEditRole(item.role); }} style={[styles.btn, { backgroundColor: '#555' }]}>
              <Text style={styles.btnText}>Edit</Text>
            </Pressable>
          )}
          {isEditing && (
            <>
              <Pressable onPress={() => { setEditingId(null); }} style={[styles.btn, { backgroundColor: '#999' }]}>
                <Text style={styles.btnText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={() => { adminUpdateUser(item.id, { name: editName, role: editRole }); setEditingId(null); }} style={[styles.btn, { backgroundColor: theme.tint }]}>
                <Text style={styles.btnText}>Save</Text>
              </Pressable>
            </>
          )}
          {/* Admin approves only coaches. Participant approvals are handled by coaches. */}
          {pending && item.role === 'coach' && (
            <Pressable onPress={() => adminApproveUser(item.id)} style={[styles.btn, { backgroundColor: theme.tint }]}> 
              <Text style={styles.btnText}>Approve Coach</Text>
            </Pressable>
          )}
          <Pressable onPress={() => adminBlockUser(item.id, !item.blocked)} style={[styles.btn, { backgroundColor: item.blocked ? '#1f7a44' : '#a11' }]}>
            <Text style={styles.btnText}>{item.blocked ? 'Unblock' : 'Block'}</Text>
          </Pressable>
          <Pressable onPress={() => {
            Alert.alert('Confirm', `Delete ${item.name}?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => adminDeleteUser(item.id) },
            ]);
          }} style={[styles.btn, { backgroundColor: '#555' }]}>
            <Text style={styles.btnText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 16, gap: 10 }}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, email, or role"
            placeholderTextColor="#9CA3AF"
            style={[styles.input, { color: theme.text, backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }]}
          />
          <FlatList
            data={filtered}
            keyExtractor={(u) => u.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            ListEmptyComponent={<Text style={{ color: theme.icon, textAlign: 'center', marginTop: 20 }}>No users found.</Text>}
          />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 4 },
  name: { fontSize: 16, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#ccc' },
});
