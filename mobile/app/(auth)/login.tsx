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
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { apiService } from '@/services/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ matricule?: string; password?: string }>({});
  
  const { setUser, setTokens, setLoading, setError, isLoading, error } = useAuthStore();

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!matricule.trim()) {
      newErrors.matricule = 'Le matricule est requis';
    } else if (!/^\d{7}$/.test(matricule.trim())) {
      newErrors.matricule = 'Le matricule doit contenir 7 chiffres';
    }

    if (!password.trim()) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.login(matricule.trim(), password);

      if (response.success && response.data) {
        setUser(response.data.user);
        setTokens(response.data.token, response.data.refreshToken);
        router.replace('/(tabs)/dashboard');
      } else {
        setError(response.message || 'Échec de la connexion');
      }
    } catch (err) {
      setError('Erreur de connexion. Vérifiez votre connexion internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/reset-password');
  };

  const handleGoBack = () => {
    router.back();
  };

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
            <Text style={styles.title}>Connexion Agent</Text>
            <Text style={styles.subtitle}>SMMC - Port de Toamasina</Text>
          </View>

          <Card style={styles.loginCard}>
            <Text style={styles.loginTitle}>Authentification</Text>
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Input
              label="Matricule"
              value={matricule}
              onChangeText={setMatricule}
              placeholder="Exemple: 2018025"
              keyboardType="numeric"
              maxLength={7}
              error={errors.matricule}
              required
              autoCapitalize="none"
            />

            <View style={styles.passwordContainer}>
              <Input
                label="Mot de passe"
                value={password}
                onChangeText={setPassword}
                placeholder="Votre mot de passe"
                secureTextEntry={!showPassword}
                error={errors.password}
                required
                style={styles.passwordInput}
              />
              <Button
                title={showPassword ? "Masquer" : "Afficher"}
                onPress={() => setShowPassword(!showPassword)}
                variant="outline"
                size="small"
                style={styles.passwordToggle}
              />
            </View>

            <Button
              title="Se Connecter"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
            />

            <Button
              title="Mot de passe oublié ?"
              onPress={handleForgotPassword}
              variant="outline"
              style={styles.forgotButton}
            />
          </Card>

          <Text style={styles.helpText}>
            En cas de problème, contactez l'administrateur système
          </Text>
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
    fontSize: 36,
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
  loginCard: {
    width: width > 768 ? 500 : width - 80,
    maxWidth: 500,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.secondary[800],
    textAlign: 'center',
    marginBottom: 30,
  },
  errorContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  passwordInput: {
    flex: 1,
  },
  passwordToggle: {
    marginBottom: 16,
    minWidth: 80,
  },
  loginButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  forgotButton: {
    backgroundColor: 'transparent',
    borderColor: '#64748b',
  },
  helpText: {
    fontSize: 14,
    color: '#bbf7d0', // primary.200
    textAlign: 'center',
    marginTop: 30,
    lineHeight: 20,
  },
});