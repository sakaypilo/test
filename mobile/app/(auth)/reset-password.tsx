import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { apiService } from '@/services/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { ArrowLeft, Mail } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    setError('');

    if (!email.trim()) {
      setError('L\'adresse email est requise');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Format d\'email invalide');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.resetPassword(email.trim());

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || 'Erreur lors de la réinitialisation');
      }
    } catch (err) {
      setError('Erreur de connexion. Vérifiez votre connexion internet.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (success) {
    return (
      <ImageBackground
        source={{ uri: 'https://images.pexels.com/photos/906982/pexels-photo-906982.jpeg' }}
        style={styles.background}
        blurRadius={2}
      >
        <View style={styles.overlay} />
        <View style={styles.container}>
          <Card style={styles.card}>
            <Mail size={64} color="#10b981" style={styles.successIcon} />
            <Text style={styles.successTitle}>Email envoyé !</Text>
            <Text style={styles.successMessage}>
              Un lien de réinitialisation a été envoyé à votre adresse email.
              Vérifiez votre boîte de réception et suivez les instructions.
            </Text>
            <Button
              title="Retour à la connexion"
              onPress={() => router.replace('/(auth)/login')}
              variant="primary"
              style={styles.backToLoginButton}
            />
          </Card>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={{ uri: 'https://images.pexels.com/photos/906982/pexels-photo-906982.jpeg' }}
      style={styles.background}
      blurRadius={2}
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Button
            title="Retour"
            onPress={handleGoBack}
            variant="outline"
            style={styles.backButton}
          />

          <View style={styles.logoSection}>
            <Text style={styles.title}>Réinitialisation</Text>
            <Text style={styles.subtitle}>Mot de passe oublié</Text>
          </View>

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Récupération du mot de passe</Text>
            <Text style={styles.cardDescription}>
              Saisissez votre adresse email professionnelle pour recevoir
              un lien de réinitialisation de votre mot de passe.
            </Text>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Input
              label="Adresse email"
              value={email}
              onChangeText={setEmail}
              placeholder="votre.email@smmc-port.mg"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              required
            />

            <Button
              title="Envoyer le lien"
              onPress={handleResetPassword}
              loading={isLoading}
              disabled={isLoading}
              style={styles.resetButton}
            />

            <Button
              title="Retour à la connexion"
              onPress={() => router.replace('/(auth)/login')}
              variant="outline"
              style={styles.loginButton}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(0, 165, 80, 0.8)', // primary.500
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 40,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#dcfce7', // primary.100
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    width: width > 768 ? 500 : width - 80,
    maxWidth: 500,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00A550', // primary.500
    textAlign: 'center',
    marginBottom: 16,
  },
  cardDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderColor: '#64748b',
  },
  successIcon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  backToLoginButton: {
    marginTop: 10,
  },
});