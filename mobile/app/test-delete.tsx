import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { apiService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import SimpleActionButtons from '@/components/ui/SimpleActionButtons';

export default function TestDeleteScreen() {
  const { user } = useAuthStore();
  const [testResult, setTestResult] = useState<string>('');

  const testIncident = {
    idIncident: 1,
    id: 1,
    type: 'test',
    description: 'Test incident pour suppression',
    idUtilisateur: user?.idUtilisateur,
  };

  const handleTestDelete = async () => {
    try {
      setTestResult('Test en cours...');
      
      const response = await apiService.deleteIncident(
        testIncident.idIncident.toString(),
        'Test de suppression'
      );

      if (response.success) {
        setTestResult('✅ Test réussi : Incident supprimé');
        Alert.alert('Succès', 'Test de suppression réussi !');
      } else {
        setTestResult(`❌ Erreur : ${response.message}`);
        Alert.alert('Erreur', response.message || 'Erreur lors du test');
      }
    } catch (error) {
      setTestResult(`❌ Erreur de connexion : ${error}`);
      Alert.alert('Erreur', 'Erreur de connexion lors du test');
    }
  };

  const handleTestRestore = async () => {
    try {
      setTestResult('Test de restauration en cours...');
      
      const response = await apiService.restoreIncident(
        testIncident.idIncident.toString()
      );

      if (response.success) {
        setTestResult('✅ Test réussi : Incident restauré');
        Alert.alert('Succès', 'Test de restauration réussi !');
      } else {
        setTestResult(`❌ Erreur : ${response.message}`);
        Alert.alert('Erreur', response.message || 'Erreur lors du test');
      }
    } catch (error) {
      setTestResult(`❌ Erreur de connexion : ${error}`);
      Alert.alert('Erreur', 'Erreur de connexion lors du test');
    }
  };

  const handleTestTrash = async () => {
    try {
      setTestResult('Test de corbeille en cours...');
      
      const response = await apiService.getDeletedItems();

      if (response.success) {
        setTestResult(`✅ Test réussi : ${JSON.stringify(response.data).length} caractères de données`);
        Alert.alert('Succès', 'Test de corbeille réussi !');
      } else {
        setTestResult(`❌ Erreur : ${response.message}`);
        Alert.alert('Erreur', response.message || 'Erreur lors du test');
      }
    } catch (error) {
      setTestResult(`❌ Erreur de connexion : ${error}`);
      Alert.alert('Erreur', 'Erreur de connexion lors du test');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Test de Suppression' }} />
      
      <View style={styles.content}>
        <Text style={styles.title}>🧪 Test du Système de Suppression</Text>
        
        <View style={styles.userInfo}>
          <Text style={styles.userText}>
            Utilisateur connecté : {user?.nom || 'Non connecté'}
          </Text>
          <Text style={styles.userText}>
            Rôle : {user?.role || 'Aucun'}
          </Text>
        </View>

        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Test avec Incident Fictif</Text>
          
          <View style={styles.incidentCard}>
            <Text style={styles.incidentTitle}>Incident Test</Text>
            <Text style={styles.incidentDesc}>{testIncident.description}</Text>
            
            <View style={styles.actionsContainer}>
              <SimpleActionButtons
                onView={() => Alert.alert('Vue', 'Test de vue')}
                onDelete={handleTestDelete}
                canDelete={true}
                canView={true}
                itemName="l'incident test"
              />
            </View>
          </View>
        </View>

        <View style={styles.testButtons}>
          <TouchableOpacity style={styles.testButton} onPress={handleTestDelete}>
            <Text style={styles.testButtonText}>🗑️ Test Suppression</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.testButton} onPress={handleTestRestore}>
            <Text style={styles.testButtonText}>🔄 Test Restauration</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.testButton} onPress={handleTestTrash}>
            <Text style={styles.testButtonText}>📋 Test Corbeille</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Résultat du Test :</Text>
          <Text style={styles.resultText}>{testResult || 'Aucun test effectué'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  userInfo: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  userText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  testSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  incidentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    position: 'relative',
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  incidentDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  actionsContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  testButtons: {
    gap: 12,
    marginBottom: 24,
  },
  testButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
