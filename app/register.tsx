import React, { useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenBackground from '@/components/ScreenBackground';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams<{ role?: 'student' | 'coach' }>();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'coach'>(params.role ?? 'student');
  const [sportsPreferences, setSportsPreferences] = useState(''); // comma-separated
  const [pastParticipation, setPastParticipation] = useState('');
  const [achievements, setAchievements] = useState('');
  const [sportsExpertise, setSportsExpertise] = useState('');
  const [teamManagement, setTeamManagement] = useState('');
  const [availability, setAvailability] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing fields', 'Name, Email, and Password are required.');
      return;
    }
    setLoading(true);
    const res = await register({
      name,
      email,
      password,
      role,
      sportsPreferences: sportsPreferences
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      pastParticipation,
      achievements,
      sportsExpertise: role === 'coach' ? sportsExpertise : undefined,
      teamManagement: role === 'coach' ? teamManagement : undefined,
      availability: role === 'coach' ? availability : undefined,
    });
    setLoading(false);
    if (!res.success) {
      Alert.alert('Registration failed', res.message || 'Try again.');
      return;
    }
    const msg = role === 'coach'
      ? 'Registered successfully. Await admin approval to login.'
      : 'Registered successfully as Participant. Await coach approval to login.';
    Alert.alert('Success', msg, [
      { text: 'OK', onPress: () => router.replace('/login') },
    ]);
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.container]}>
          <View style={[styles.card, { borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }]}>
            <Text style={[styles.title, { color: theme.text }]}>VU Sports Society</Text>
            <Text style={[styles.subtitle, { color: theme.icon }]}>Create Account</Text>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.icon }]}>Full Name</Text>
              <TextInput style={[styles.input, { color: theme.text, borderColor: '#E5E7EB' }]} value={name} onChangeText={setName} placeholder="Ali Khan" />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.icon }]}>Email</Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: '#E5E7EB' }]}
                value={email}
                onChangeText={setEmail}
                placeholder="you@vu.edu.pk"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.icon }]}>Password</Text>
              <TextInput style={[styles.input, { color: theme.text, borderColor: '#E5E7EB' }]} value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.icon }]}>Role</Text>
              <View style={styles.row}>
                <Pressable onPress={() => setRole('student')} style={[styles.chip, role === 'student' && { backgroundColor: theme.tint, borderColor: theme.tint }]}>
                  <Text style={[styles.chipText, role === 'student' && styles.chipTextActive]}>Participant</Text>
                </Pressable>
                <Pressable onPress={() => setRole('coach')} style={[styles.chip, role === 'coach' && { backgroundColor: theme.tint, borderColor: theme.tint }]}>
                  <Text style={[styles.chipText, role === 'coach' && styles.chipTextActive]}>Coach / Team Lead</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.icon }]}>Sports Preferences (comma-separated)</Text>
              <TextInput style={[styles.input, { color: theme.text, borderColor: '#E5E7EB' }]} value={sportsPreferences} onChangeText={setSportsPreferences} placeholder="Cricket, Football, Badminton" />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.icon }]}>Past Participation</Text>
              <TextInput style={[styles.input, { height: 80, color: theme.text, borderColor: '#E5E7EB' }]} multiline value={pastParticipation} onChangeText={setPastParticipation} placeholder="Inter-university cricket 2023" />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.icon }]}>Achievements</Text>
              <TextInput style={[styles.input, { height: 80, color: theme.text, borderColor: '#E5E7EB' }]} multiline value={achievements} onChangeText={setAchievements} placeholder="Gold medal in badminton 2022" />
            </View>

            {role === 'coach' && (
              <>
                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.icon }]}>Sports Expertise</Text>
                  <TextInput style={[styles.input, { color: theme.text, borderColor: '#E5E7EB' }]} value={sportsExpertise} onChangeText={setSportsExpertise} placeholder="Cricket coaching, Fitness" />
                </View>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.icon }]}>Team Management</Text>
                  <TextInput style={[styles.input, { color: theme.text, borderColor: '#E5E7EB' }]} value={teamManagement} onChangeText={setTeamManagement} placeholder="Managed VU Cricket Team 2023" />
                </View>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.icon }]}>Availability</Text>
                  <TextInput style={[styles.input, { color: theme.text, borderColor: '#E5E7EB' }]} value={availability} onChangeText={setAvailability} placeholder="Weekdays 5-8 PM" />
                </View>
              </>
            )}

            <Pressable onPress={onSubmit} style={({ pressed }) => [styles.button, { backgroundColor: theme.tint }, pressed && { opacity: 0.9 }]}>
              <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Register'}</Text>
            </Pressable>

            <View style={{ height: 24 }} />

            <Link href="/login" asChild>
              <Pressable style={styles.linkBtn}>
                <Text style={[styles.linkText, { color: theme.tint }]}>Already have an account? Login</Text>
              </Pressable>
            </Link>

            <Link href="/role-select" asChild>
              <Pressable style={styles.linkBtn}>
                <Text style={[styles.linkText, { color: theme.tint }]}>Choose a different role</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, gap: 12 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 18, textAlign: 'center', marginBottom: 16 },
  field: { gap: 6 },
  label: { fontSize: 14 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: '#FFFFFF' },
  row: { flexDirection: 'row', gap: 10 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#ccc' },
  chipText: { color: '#111' },
  chipTextActive: { color: 'white', fontWeight: '600' },
  button: { padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  linkBtn: { padding: 12, alignItems: 'center' },
  linkText: { fontWeight: '600' },
});
