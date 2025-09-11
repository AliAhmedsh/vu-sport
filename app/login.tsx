import React, { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter email and password');
      return;
    }
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      Alert.alert('Login failed', res.message || 'Please try again.');
      return;
    }
    // Redirect to tabs; admins will be redirected to /admin by guards
    // @ts-ignore - We know this is a valid route
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}> 
      <View style={[styles.card, { borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }]}> 
        <Text style={[styles.title, { color: theme.text }]}>VU Sports Society</Text>
        <Text style={[styles.subtitle, { color: theme.icon }]}>Sign in to continue</Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.icon }]}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@vu.edu.pk"
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, { color: theme.text, borderColor: '#E5E7EB' }]}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.icon }]}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            style={[styles.input, { color: theme.text, borderColor: '#E5E7EB' }]}
          />
        </View>

        <Pressable onPress={onLogin} style={({ pressed }) => [styles.button, { backgroundColor: theme.tint }, pressed && { opacity: 0.9 }]}>
          <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Login'}</Text>
        </Pressable>

        <View style={{ height: 16 }} />

        <Link href="/register" asChild>
          <Pressable style={styles.linkBtn}>
            <Text style={[styles.linkText, { color: theme.tint }]}>Create an account</Text>
          </Pressable>
        </Link>

        <Link href="/role-select" asChild>
          <Pressable style={styles.linkBtn}>
            <Text style={[styles.linkText, { color: theme.tint }]}>Choose a role</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12, justifyContent: 'center' },
  safeArea: { flex: 1, padding: 20, justifyContent: 'center' },
  card: { borderWidth: 1, borderRadius: 12, padding: 20, gap: 12 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 12 },
  field: { gap: 6 },
  label: { fontSize: 14, color: '#666' },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: '#FFFFFF' },
  button: { padding: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  linkBtn: { padding: 12, alignItems: 'center' },
  linkText: { fontWeight: '600' },
  demoBtn: { padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginTop: 8 },
  demoText: { color: '#444' },
});
