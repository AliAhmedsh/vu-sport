import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import ScreenBackground from '@/components/ScreenBackground';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <ScreenBackground>
      <SafeAreaView style={[styles.container]}>
        <Text style={[styles.title, { color: theme.text }]}>Admin Dashboard</Text>
        <Text style={[styles.subtitle, { color: theme.icon }]}>Welcome, {user?.name || 'Admin'}</Text>

        <View style={styles.grid}>
          <Link href="/admin/users" asChild>
            <Pressable style={[styles.card, { borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }]}> 
              <Text style={[styles.cardTitle, { color: theme.text }]}>Manage Users</Text>
              <Text style={[styles.cardDesc, { color: theme.icon }]}>Approve, block, or delete users</Text>
            </Pressable>
          </Link>
          <Link href="/admin/teams" asChild>
            <Pressable style={[styles.card, { borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }]}> 
              <Text style={[styles.cardTitle, { color: theme.text }]}>Manage Teams</Text>
              <Text style={[styles.cardDesc, { color: theme.icon }]}>Add, block, or delete teams</Text>
            </Pressable>
          </Link>
        </View>

        <Pressable onPress={() => { logout(); router.replace('/login'); }} style={[styles.logoutBtn]}> 
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 16 },
  grid: { gap: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 6 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardDesc: { fontSize: 14 },
  logoutBtn: { marginTop: 'auto', backgroundColor: '#FFECEC', padding: 14, borderRadius: 10, alignItems: 'center' },
  logoutText: { color: '#CC0000', fontWeight: '700' },
});
