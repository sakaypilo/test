import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth';

export default function WelcomeScreen() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  // Par défaut, rediriger vers l'écran de login
  return <Redirect href="/(auth)/login" />;
}