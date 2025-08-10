import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useIncidentsStore } from '@/stores/incidents';
import { useAuthStore } from '@/stores/auth';
import { apiService } from '@/services/api';
import IncidentForm from '@/components/forms/IncidentForm';
import { Incident } from '@/types';
import { generateId } from '@/utils/helpers';

export default function AddIncidentScreen() {
  const { addIncident, saveDraft } = useIncidentsStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (incidentData: Omit<Incident, 'id'>) => {
    setIsLoading(true);

    const newIncident: Incident = {
      ...incidentData,
      id: generateId(),
      agent: user?.matricule || incidentData.agent,
    };

    try {
      const response = await apiService.createIncident(incidentData);

      if (response.success && response.data) {
        addIncident(response.data);
        Alert.alert(
          'Succès',
          'Incident enregistré avec succès',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        // Save as draft if API fails
        saveDraft(newIncident);
        Alert.alert(
          'Sauvegarde hors ligne',
          'Incident sauvegardé localement. Il sera synchronisé dès que la connexion sera rétablie.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      // Save as draft if network error
      saveDraft(newIncident);
      Alert.alert(
        'Sauvegarde hors ligne',
        'Incident sauvegardé localement. Il sera synchronisé dès que la connexion sera rétablie.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <IncidentForm
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