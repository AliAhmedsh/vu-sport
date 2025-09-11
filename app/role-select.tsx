import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import ScreenBackground from '@/components/ScreenBackground';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RoleSelectScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const go = (role: 'student' | 'coach') => {
    router.push({ pathname: '/register', params: { role } });
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={[styles.container]}>
        <Text style={[styles.title, { color: theme.text }]}>Choose Your Role</Text>
        <Text style={[styles.subtitle, { color: theme.icon }]}>Select a role to continue registration</Text>

        <View style={styles.grid}>
          <Pressable onPress={() => go('student')} style={({ pressed }) => [styles.card, { borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }, pressed && { opacity: 0.9 }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Participant</Text>
            <Text style={[styles.cardDesc, { color: theme.icon }]}>Participate in sports and events</Text>
          </Pressable>

          <Pressable onPress={() => go('coach')} style={({ pressed }) => [styles.card, { borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }, pressed && { opacity: 0.9 }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Coach / Team Lead</Text>
            <Text style={[styles.cardDesc, { color: theme.icon }]}>Requires admin approval</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', marginTop: 6, marginBottom: 20 },
  grid: { gap: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 6 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardDesc: { fontSize: 14 },
});
