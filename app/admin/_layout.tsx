import { Stack, router } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout() {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (user?.role !== 'admin') {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, user?.role]);

  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Admin Dashboard' }} />
      <Stack.Screen name="users" options={{ title: 'Manage Users' }} />
      <Stack.Screen name="teams" options={{ title: 'Manage Teams' }} />
    </Stack>
  );
}
