import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  ActivityIndicator,
} from 'react-native-paper';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../theme/theme';

export default function LoginScreen() {
  const { login, isLoading } = useAuthStore();
  const [matricule, setMatricule] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [errors, setErrors] = useState({ matricule: '', motDePasse: '' });

  const validateForm = () => {
    const newErrors = { matricule: '', motDePasse: '' };

    if (!matricule) {
      newErrors.matricule = 'Le matricule est requis';
    } else if (!/^\d{7}$/.test(matricule)) {
      newErrors.matricule = 'Le matricule doit contenir 7 chiffres';
    }

    if (!motDePasse) {
      newErrors.motDePasse = 'Le mot de passe est requis';
    }

    setErrors(newErrors);
    return !newErrors.matricule && !newErrors.motDePasse;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    const result = await login(matricule, motDePasse);
    if (!result.success) {
      Alert.alert('Erreur de connexion', result.error || 'Identifiants invalides');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/smmc-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text variant="headlineMedium" style={styles.title}>
            SMMC Security
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Port de Toamasina
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Matricule"
              value={matricule}
              onChangeText={setMatricule}
              mode="outlined"
              keyboardType="numeric"
              placeholder="Ex: 2018025"
              error={!!errors.matricule}
              style={styles.input}
            />
            {errors.matricule ? (
              <Text style={styles.errorText}>{errors.matricule}</Text>
            ) : null}

            <TextInput
              label="Mot de passe"
              value={motDePasse}
              onChangeText={setMotDePasse}
              mode="outlined"
              secureTextEntry
              placeholder="Votre mot de passe"
              error={!!errors.motDePasse}
              style={styles.input}
            />
            {errors.motDePasse ? (
              <Text style={styles.errorText}>{errors.motDePasse}</Text>
            ) : null}

            <Button
              mode="contained"
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                'Se connecter'
              )}
            </Button>
          </Card.Content>
        </Card>

        <Text variant="bodySmall" style={styles.footer}>
          Connectez-vous avec vos identifiants SMMC
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 80,
    marginBottom: 16,
  },
  title: {
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  card: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  footer: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
});