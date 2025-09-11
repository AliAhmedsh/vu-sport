import React, { useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenBackground from '@/components/ScreenBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, logout } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [name, setName] = useState(user?.name ?? '');
  const [sportsPreferences, setSportsPreferences] = useState<string>((user?.sportsPreferences ?? []).join(', '));
  const [pastParticipation, setPastParticipation] = useState(user?.pastParticipation ?? '');
  const [achievements, setAchievements] = useState(user?.achievements ?? '');
  const [sportsExpertise, setSportsExpertise] = useState(user?.sportsExpertise ?? '');
  const [teamManagement, setTeamManagement] = useState(user?.teamManagement ?? '');
  const [availability, setAvailability] = useState(user?.availability ?? '');
  const [saving, setSaving] = useState(false);

  const approvedText = useMemo(() => {
    if (!user) return '';
    if (user.role === 'coach') {
      return user.approvedByAdmin ? 'Approved by Admin' : 'Pending Admin Approval';
    }
    return user.approvedByCoach ? 'Approved by Coach' : 'Pending Coach Approval';
  }, [user?.role, user?.approvedByAdmin, user?.approvedByCoach]);

  const onSave = async () => {
    setSaving(true);
    await updateProfile({
      name,
      sportsPreferences: sportsPreferences
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      pastParticipation,
      achievements,
      sportsExpertise: user?.role === 'coach' ? sportsExpertise : undefined,
      teamManagement: user?.role === 'coach' ? teamManagement : undefined,
      availability: user?.role === 'coach' ? availability : undefined,
    });
    setSaving(false);
    Alert.alert('Saved', 'Your profile has been updated.');
  };

  const onLogout = () => {
    logout();
    router.replace('/login');
  };

  if (!user) return null;

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.container]}>
          <View style={[styles.card, { borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }]}>
            <Text style={[styles.title, { color: theme.text }]}>My Profile</Text>

            <View style={[styles.badge, (user.role === 'coach' ? user.approvedByAdmin : user.approvedByCoach) ? styles.badgeApproved : styles.badgePending]}>
              <Text style={[styles.badgeText, (user.role === 'coach' ? user.approvedByAdmin : user.approvedByCoach) ? styles.badgeTextApproved : styles.badgeTextPending]}>
                {approvedText}
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.icon }]}>Email</Text>
              <TextInput style={[styles.input, { backgroundColor: '#F5F7FA', color: theme.text, borderColor: '#E5E7EB' }]} value={user.email} editable={false} />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.icon }]}>Full Name</Text>
              <TextInput style={[styles.input, { color: theme.text, borderColor: '#E5E7EB' }]} value={name} onChangeText={setName} />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.icon }]}>Role</Text>
              <TextInput style={[styles.input, { backgroundColor: '#F5F7FA', color: theme.text, borderColor: '#E5E7EB' }]} value={user.role} editable={false} />
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

            {user.role === 'coach' && (
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

            <Pressable onPress={onSave} style={({ pressed }) => [styles.buttonPrimary, { backgroundColor: theme.tint }, pressed && { opacity: 0.9 }]}>
              <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
            </Pressable>

            <Pressable onPress={onLogout} style={({ pressed }) => [styles.buttonSecondary, pressed && { opacity: 0.9 }]}>
              <Text style={[styles.buttonText, { color: '#cc0000' }]}>Logout</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, gap: 12 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  field: { gap: 6 },
  label: { fontSize: 14 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: '#FFFFFF' },
  buttonPrimary: { padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  buttonSecondary: { backgroundColor: 'rgba(255,76,76,0.12)', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  badge: { alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 8 },
  badgeApproved: { backgroundColor: '#E8F5E9' },
  badgePending: { backgroundColor: '#FFF7E6' },
  badgeText: { fontWeight: '700' },
  badgeTextApproved: { color: '#1f7a44' },
  badgeTextPending: { color: '#a16600' },
});
