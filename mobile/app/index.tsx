import React from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuthStore } from '@/stores/auth';
import { useAuthInitialization } from '@/hooks/useAuthInitialization';

export default function WelcomeScreen() {
  const { isAuthenticated, user } = useAuthStore();
  const { isInitialized, isLoading } = useAuthInitialization();

  // Afficher un écran de chargement pendant l'initialisation
  if (!isInitialized || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#00A550" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#64748b' }}>
          Vérification de l'authentification...
        </Text>
      </View>
    );
  }

  if (isAuthenticated && user) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  // Par défaut, rediriger vers l'écran d'accueil
  return <Redirect href="/welcome" />;
}