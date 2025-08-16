import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X, AlertCircle } from 'lucide-react-native';
import { imageService } from '@/services/imageService';
import { storageService } from '@/services/storage';

interface PhotoPickerProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

export default function PhotoPicker({
  photos,
  onPhotosChange,
  maxPhotos = 6,
  disabled = false,
}: PhotoPickerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);

  const selectPhotoSource = () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Limite atteinte', `Maximum ${maxPhotos} photos`);
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
        quality: 1, // Qualité maximale, on compressera après
      });

      if (!result.canceled && result.assets[0]) {
        await processAndAddPhoto(result.assets[0].uri);
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
        quality: 1, // Qualité maximale, on compressera après
      });

      if (!result.canceled && result.assets[0]) {
        await processAndAddPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erreur sélection photo:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner la photo');
    }
  };

  const processAndAddPhoto = async (uri: string) => {
    setIsProcessing(true);
    setProcessingIndex(photos.length);

    try {
      // Traitement de l'image (validation + compression)
      const result = await imageService.processImage(uri, {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
      });

      if (!result.success) {
        Alert.alert(
          'Erreur de traitement',
          result.errors?.join('\n') || 'Impossible de traiter l\'image'
        );
        return;
      }

      // Sauvegarder l'image traitée de manière permanente
      const permanentUri = await storageService.saveImagePermanently(
        result.processedUri!
      );

      if (permanentUri) {
        // Vérifier que le fichier existe
        const fileExists = await storageService.testImageAccess(permanentUri);
        if (fileExists) {
          onPhotosChange([...photos, permanentUri]);
        } else {
          Alert.alert('Erreur', 'Photo sauvegardée mais inaccessible');
        }
      } else {
        Alert.alert('Erreur', 'Impossible de sauvegarder la photo');
      }
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      Alert.alert('Erreur', 'Erreur lors du traitement de la photo');
    } finally {
      setIsProcessing(false);
      setProcessingIndex(null);
    }
  };

  const removePhoto = async (index: number) => {
    const photoToRemove = photos[index];

    Alert.alert(
      'Supprimer la photo',
      'Êtes-vous sûr de vouloir supprimer cette photo ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            // Supprimer le fichier physique
            if (photoToRemove) {
              await storageService.deleteImage(photoToRemove);
            }

            const newPhotos = photos.filter((_, i) => i !== index);
            onPhotosChange(newPhotos);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Photos ({photos.length}/{maxPhotos})
      </Text>
      
      <View style={styles.photosGrid}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removePhoto(index)}
              disabled={disabled}
            >
              <X size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Slot de traitement en cours */}
        {isProcessing && processingIndex !== null && (
          <View style={[styles.photoContainer, styles.processingContainer]}>
            <ActivityIndicator size="large" color="#00A550" />
            <Text style={styles.processingText}>Traitement...</Text>
          </View>
        )}

        {/* Bouton d'ajout */}
        {photos.length < maxPhotos && !isProcessing && (
          <TouchableOpacity
            style={[styles.addButton, disabled && styles.addButtonDisabled]}
            onPress={selectPhotoSource}
            disabled={disabled}
          >
            <Camera size={24} color={disabled ? "#9ca3af" : "#64748b"} />
            <Text style={[styles.addButtonText, disabled && styles.addButtonTextDisabled]}>
              Ajouter
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {photos.length === 0 && (
        <View style={styles.emptyState}>
          <ImageIcon size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>
            Aucune photo ajoutée
          </Text>
          <Text style={styles.emptySubtext}>
            Appuyez sur "Ajouter" pour prendre ou sélectionner des photos
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingContainer: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  processingText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  addButtonDisabled: {
    borderColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
  },
  addButtonText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  addButtonTextDisabled: {
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
});
