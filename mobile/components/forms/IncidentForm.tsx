import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Incident } from '@/types';
import { storageService } from '@/services/storage';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Camera, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

interface IncidentFormProps {
  incident?: Incident;
  onSubmit: (incidentData: Omit<Incident, 'id'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function IncidentForm({
  incident,
  onSubmit,
  onCancel,
  isLoading = false,
}: IncidentFormProps) {
  const [formData, setFormData] = useState({
    type: incident?.type || 'autre' as const,
    description: incident?.description || '',
    zone: incident?.zone || '',
    emplacement: incident?.emplacement || '',
    agent: incident?.agent || '',
    photos: incident?.photos || [],
    mesuresPrises: incident?.mesuresPrises || '',
    dateIncident: incident?.dateIncident || new Date(),
    statut: incident?.statut || 'en_attente' as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  const incidentTypes = [
    { key: 'intrusion', label: 'Intrusion', icon: '🚨' },
    { key: 'vol_suspect', label: 'Vol suspect', icon: '👀' },
    { key: 'vandalisme', label: 'Vandalisme', icon: '🔨' },
    { key: 'bagarre', label: 'Bagarre', icon: '👊' },
    { key: 'accident', label: 'Accident', icon: '⚠️' },
    { key: 'autre', label: 'Autre', icon: '📝' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (!formData.zone.trim()) {
      newErrors.zone = 'La zone est requise';
    }

    if (!formData.emplacement.trim()) {
      newErrors.emplacement = 'L\'emplacement est requis';
    }

    if (!formData.agent.trim()) {
      newErrors.agent = 'L\'agent est requis';
    }

    if (!formData.mesuresPrises.trim()) {
      newErrors.mesuresPrises = 'Les mesures prises sont requises';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const selectPhotoSource = () => {
    if (formData.photos.length >= 6) {
      Alert.alert('Limite atteinte', 'Maximum 6 photos par incident');
      return;
    }

    Alert.alert(
      'Ajouter une photo',
      'Choisissez une source',
      [
        { text: 'Appareil photo', onPress: takePhoto },
        { text: 'Galerie', onPress: pickFromGallery },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'L\'accès à l\'appareil photo est nécessaire.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const tempUri = result.assets[0].uri;

        setIsSavingPhoto(true);

        try {
          // Sauvegarder l'image de manière permanente
          const permanentUri = await storageService.saveImagePermanently(tempUri);

          if (permanentUri) {
            // Vérifier que le fichier existe
            const fileExists = await storageService.testImageAccess(permanentUri);
            if (fileExists) {
              setFormData(prev => ({
                ...prev,
                photos: [...prev.photos, permanentUri],
              }));
            } else {
              Alert.alert('Erreur', 'Photo sauvegardée mais inaccessible');
            }
          } else {
            Alert.alert('Erreur', 'Impossible de sauvegarder la photo');
          }
        } catch (error) {
          console.error('Erreur lors de la sauvegarde:', error);
          Alert.alert('Erreur', 'Erreur lors de la sauvegarde de la photo');
        } finally {
          setIsSavingPhoto(false);
        }
      }
    } catch (error) {
      console.error('Erreur prise de photo:', error);
      Alert.alert('Erreur', 'Impossible de prendre la photo');
    }
  };

  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'L\'accès à la galerie est nécessaire.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const tempUri = result.assets[0].uri;

        setIsSavingPhoto(true);

        try {
          // Sauvegarder l'image de manière permanente
          const permanentUri = await storageService.saveImagePermanently(tempUri);

          if (permanentUri) {
            // Vérifier que le fichier existe
            const fileExists = await storageService.testImageAccess(permanentUri);
            if (fileExists) {
              setFormData(prev => ({
                ...prev,
                photos: [...prev.photos, permanentUri],
              }));
            } else {
              Alert.alert('Erreur', 'Photo sauvegardée mais inaccessible');
            }
          } else {
            Alert.alert('Erreur', 'Impossible de sauvegarder la photo');
          }
        } catch (error) {
          console.error('Erreur lors de la sauvegarde:', error);
          Alert.alert('Erreur', 'Erreur lors de la sauvegarde de la photo');
        } finally {
          setIsSavingPhoto(false);
        }
      }
    } catch (error) {
      console.error('Erreur sélection photo:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner la photo');
    }
  };

  const removePhoto = async (index: number) => {
    const photoToRemove = formData.photos[index];

    // Supprimer le fichier physique
    if (photoToRemove) {
      await storageService.deleteImage(photoToRemove);
    }

    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };



  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>
          {incident ? 'Modifier l\'Incident' : 'Nouveau Rapport d\'Incident'}
        </Text>

        <View style={styles.typeSection}>
          <Text style={styles.sectionLabel}>Type d'incident *</Text>
          <View style={styles.typeGrid}>
            {incidentTypes.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.typeOption,
                  formData.type === type.key && styles.typeOptionActive,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, type: type.key as any }))}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text
                  style={[
                    styles.typeText,
                    formData.type === type.key && styles.typeTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Input
          label="Description détaillée"
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholder="Décrivez l'incident en détail..."
          multiline
          numberOfLines={4}
          error={errors.description}
          required
        />

        <View style={styles.locationRow}>
          <Input
            label="Zone"
            value={formData.zone}
            onChangeText={(text) => setFormData(prev => ({ ...prev, zone: text }))}
            placeholder="Ex: Zone A"
            error={errors.zone}
            required
            containerStyle={styles.locationInput}
          />
          
          <Input
            label="Emplacement"
            value={formData.emplacement}
            onChangeText={(text) => setFormData(prev => ({ ...prev, emplacement: text }))}
            placeholder="Ex: Quai 3"
            error={errors.emplacement}
            required
            containerStyle={styles.locationInput}
          />
        </View>



        <View style={styles.photosSection}>
          <Text style={styles.sectionLabel}>Photos ({formData.photos.length}/6)</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
            {formData.photos.map((photo, index) => (
              <View key={`photo-${index}-${photo.split('/').pop()}`} style={styles.photoContainer}>
                <Image
                  source={{ uri: photo }}
                  style={styles.photo}
                />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(index)}
                >
                  <X size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            ))}
            
            {formData.photos.length < 6 && (
              <TouchableOpacity
                style={[styles.addPhotoButton, isSavingPhoto && styles.addPhotoButtonDisabled]}
                onPress={isSavingPhoto ? undefined : selectPhotoSource}
                disabled={isSavingPhoto}
              >
                <Camera size={24} color={isSavingPhoto ? "#9ca3af" : "#64748b"} />
                <Text style={[styles.addPhotoText, isSavingPhoto && styles.addPhotoTextDisabled]}>
                  {isSavingPhoto ? 'Sauvegarde...' : 'Ajouter'}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>



        <Input
          label="Agent rapporteur"
          value={formData.agent}
          onChangeText={(text) => setFormData(prev => ({ ...prev, agent: text }))}
          placeholder="Matricule ou nom de l'agent"
          error={errors.agent}
          required
        />

        <Input
          label="Mesures prises"
          value={formData.mesuresPrises}
          onChangeText={(text) => setFormData(prev => ({ ...prev, mesuresPrises: text }))}
          placeholder="Décrivez les mesures prises suite à l'incident..."
          multiline
          numberOfLines={3}
          error={errors.mesuresPrises}
          required
        />

        <View style={styles.formActions}>
          <Button
            title="Annuler"
            onPress={onCancel}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title={incident ? 'Modifier' : 'Enregistrer'}
            onPress={handleSubmit}
            variant="primary"
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  formCard: {
    margin: 20,
    padding: isTablet ? 30 : 20,
  },
  formTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 30,
  },
  typeSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flex: 1,
    minWidth: isTablet ? 140 : 100,
    justifyContent: 'center',
  },
  typeOptionActive: {
    backgroundColor: '#1e40af',
    borderColor: '#1e40af',
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  typeText: {
    fontSize: isTablet ? 14 : 12,
    color: '#64748b',
    fontWeight: '500',
  },
  typeTextActive: {
    color: '#ffffff',
  },
  locationRow: {
    flexDirection: 'row',
    gap: 15,
  },
  locationInput: {
    flex: 1,
  },

  photosSection: {
    marginBottom: 20,
  },
  photosScroll: {
    marginTop: 10,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 10,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  addPhotoButtonDisabled: {
    opacity: 0.6,
    borderColor: '#e5e7eb',
  },
  addPhotoTextDisabled: {
    color: '#9ca3af',
  },

  formActions: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 30,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});