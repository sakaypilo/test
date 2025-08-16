import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/ui/Button';
import { colors } from '@/theme/colors';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
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
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.logoSection}>
            <Text style={styles.title}>SMMC Security</Text>
            <Text style={styles.subtitle}>Port de Toamasina</Text>
            <Text style={styles.description}>
              Système de surveillance et de sécurité maritime
            </Text>
          </View>

          <View style={styles.featuresSection}>
            <View style={styles.feature}>
              <Text style={styles.featureTitle}>🎥 Surveillance</Text>
              <Text style={styles.featureText}>
                Monitoring en temps réel des caméras de sécurité
              </Text>
            </View>
            
            <View style={styles.feature}>
              <Text style={styles.featureTitle}>🚨 Incidents</Text>
              <Text style={styles.featureText}>
                Gestion et suivi des incidents de sécurité
              </Text>
            </View>
            
            <View style={styles.feature}>
              <Text style={styles.featureTitle}>👥 Interpellations</Text>
              <Text style={styles.featureText}>
                Enregistrement des interpellations et contrôles
              </Text>
            </View>
          </View>

          <View style={styles.buttonSection}>
            <Button
              title="Se connecter"
              onPress={handleLogin}
              variant="primary"
              style={styles.loginButton}
            />
            
            <Text style={styles.footerText}>
              Accès réservé au personnel autorisé
            </Text>
          </View>
        </View>
      </ScrollView>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 20,
    color: colors.primary[400],
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresSection: {
    width: '100%',
    marginVertical: 40,
  },
  feature: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 20,
  },
  buttonSection: {
    width: '100%',
    alignItems: 'center',
  },
  loginButton: {
    width: '100%',
    marginBottom: 24,
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
