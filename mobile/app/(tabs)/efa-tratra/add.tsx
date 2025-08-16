import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { usePersonnesStore } from '@/stores/personnes';
import { apiService } from '@/services/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { ArrowLeft, User, IdCard, FileText } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

interface PersonneForm {
  nom: string;
  prenom: string;
  CIN: string;
  statut: 'interne' | 'externe';
  faitAssocie: string;
}

export default function AddPersonneScreen() {
  const { addPersonne } = usePersonnesStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [form, setForm] = useState<PersonneForm>({
    nom: '',
    prenom: '',
    CIN: '',
    statut: 'externe',
    faitAssocie: '',
  });

  const handleInputChange = (field: keyof PersonneForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!form.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }

    if (!form.CIN.trim()) {
      newErrors.CIN = 'Le CIN est requis';
    } else if (form.CIN.length < 12) {
      newErrors.CIN = 'Le CIN doit contenir au moins 12 caractères';
    }

    if (!form.faitAssocie.trim()) {
      newErrors.faitAssocie = 'Le fait associé est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiService.addPersonne(form);
      
      if (response.success && response.data) {
        addPersonne(response.data);
        Alert.alert(
          'Succès',
          'La personne a été ajoutée avec succès',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Erreur', response.message || 'Erreur lors de l\'ajout');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout:', error);
      Alert.alert('Erreur', 'Erreur de connexion au serveur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          title=""
          onPress={handleBack}
          variant="outline"
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={colors.white} />
        </Button>
        <Text style={styles.headerTitle}>Nouvelle Interpellation</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.formCard}>
            <View style={styles.formHeader}>
              <User size={24} color={colors.primary[500]} />
              <Text style={styles.formTitle}>Informations personnelles</Text>
            </View>

            <Input
              label="Nom"
              value={form.nom}
              onChangeText={(value) => handleInputChange('nom', value)}
              placeholder="Entrez le nom"
              error={errors.nom}
              required
            />

            <Input
              label="Prénom"
              value={form.prenom}
              onChangeText={(value) => handleInputChange('prenom', value)}
              placeholder="Entrez le prénom"
              error={errors.prenom}
              required
            />

            <Input
              label="CIN"
              value={form.CIN}
              onChangeText={(value) => handleInputChange('CIN', value)}
              placeholder="Numéro de carte d'identité"
              error={errors.CIN}
              required
            />

            <View style={styles.statutContainer}>
              <Text style={styles.statutLabel}>Statut *</Text>
              <View style={styles.statutButtons}>
                <Button
                  title="Externe"
                  onPress={() => handleInputChange('statut', 'externe')}
                  variant={form.statut === 'externe' ? 'primary' : 'outline'}
                  style={styles.statutButton}
                />
                <Button
                  title="Interne"
                  onPress={() => handleInputChange('statut', 'interne')}
                  variant={form.statut === 'interne' ? 'primary' : 'outline'}
                  style={styles.statutButton}
                />
              </View>
            </View>
          </Card>

          <Card style={styles.formCard}>
            <View style={styles.formHeader}>
              <FileText size={24} color={colors.primary[500]} />
              <Text style={styles.formTitle}>Interpellation</Text>
            </View>

            <Input
              label="Fait associé"
              value={form.faitAssocie}
              onChangeText={(value) => handleInputChange('faitAssocie', value)}
              placeholder="Décrivez le fait associé à l'interpellation"
              multiline
              numberOfLines={4}
              error={errors.faitAssocie}
              required
            />
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              title="Annuler"
              onPress={handleBack}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title={isSubmitting ? "Ajout en cours..." : "Ajouter"}
              onPress={handleSubmit}
              variant="primary"
              style={styles.submitButton}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  header: {
    backgroundColor: colors.primary[500],
    padding: isTablet ? 30 : 20,
    paddingTop: isTablet ? 60 : 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  placeholder: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formCard: {
    marginBottom: 20,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textBase,
  },
  statutContainer: {
    marginBottom: 16,
  },
  statutLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary[700],
    marginBottom: 8,
  },
  statutButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  statutButton: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});
