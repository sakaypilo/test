import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import { router } from 'expo-router';
import { useCamerasStore } from '@/stores/cameras';
import { apiService } from '@/services/api';
import CameraForm from '@/components/forms/CameraForm';
import { Camera } from '@/types';

export default function AddCameraScreen() {
  const { addCamera } = useCamerasStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (cameraData: Omit<Camera, 'id'>) => {
    setIsLoading(true);

    try {
      const response = await apiService.createCamera(cameraData);

      if (response.success && response.data) {
        addCamera(response.data);
        Alert.alert(
          'Succès',
          'Caméra ajoutée avec succès',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Erreur', response.message || 'Erreur lors de l\'ajout');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <CameraForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 50,
  },
});