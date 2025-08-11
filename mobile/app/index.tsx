import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { router, Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  // Par défaut, rediriger vers l'écran de login
  return <Redirect href="/(auth)/login" />;

  // Si vous voulez garder cet écran d'accueil, commentez la ligne ci-dessus et laissez le code ci-dessous.
  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.pexels.com/photos/906982/pexels-photo-906982.jpeg' }}
      style={styles.background}
      blurRadius={2}
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <View style={styles.logoSection}>
          <Text style={styles.title}>SMMC</Text>
          <Text style={styles.subtitle}>Port de Toamasina</Text>
          <Text style={styles.department}>Département Sécurité et Sûreté</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Plateforme de Surveillance</Text>
          <Text style={styles.cardDescription}>
            Gestion des caméras, incidents et interventions de sécurité
          </Text>
          
          <View style={styles.features}>
            <Text style={styles.feature}>• Gestion en temps réel des caméras</Text>
            <Text style={styles.feature}>• Rapports d'incidents sécurisés</Text>
            <Text style={styles.feature}>• Suivi des interventions</Text>
            <Text style={styles.feature}>• Fonctionnement hors ligne</Text>
          </View>

          <Button
            title="Se Connecter"
            onPress={handleLogin}
            variant="primary"
            size="large"
            style={styles.loginButton}
          />
        </Card>

        <Text style={styles.version}>Version 1.0.0 - Agents & Techniciens</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 64, 175, 0.7)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 24,
    color: '#e0e7ff',
    marginTop: 8,
  },
  department: {
    fontSize: 16,
    color: '#c7d2fe',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    width: width > 768 ? 600 : width - 80,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e40af',
    textAlign: 'center',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  features: {
    alignSelf: 'stretch',
    marginBottom: 30,
  },
  feature: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  loginButton: {
    width: '100%',
    marginTop: 10,
  },
  version: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 30,
    textAlign: 'center',
  },
});