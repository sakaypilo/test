import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { apiService } from '@/services/api';
import { colors } from '@/theme/colors';

export default function DebugUserScreen() {
  const { user, token } = useAuthStore();
  const [debugData, setDebugData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadDebugData = async () => {
    if (!user || !token) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    setIsLoading(true);
    try {
      // Tester l'API de debug
      const response = await fetch('http://localhost:8000/api/debug/user-incidents', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setDebugData(data);
    } catch (error) {
      console.error('Erreur debug:', error);
      Alert.alert('Erreur', 'Erreur lors du chargement des données de debug');
    } finally {
      setIsLoading(false);
    }
  };

  const testDeleteIncident = async (incidentId: number) => {
    if (!token) {
      Alert.alert('Erreur', 'Token manquant');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/incidents/${incidentId}/delete`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: 'Test de suppression depuis debug'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Succès', 'Incident supprimé avec succès');
        loadDebugData(); // Recharger les données
      } else {
        Alert.alert('Erreur', data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      Alert.alert('Erreur', 'Erreur de connexion lors de la suppression');
    }
  };

  useEffect(() => {
    if (user && token) {
      loadDebugData();
    }
  }, [user, token]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Debug Utilisateur' }} />
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Utilisateur Connecté</Text>
          {user ? (
            <View style={styles.userInfo}>
              <Text style={styles.infoText}>ID: {user.idUtilisateur}</Text>
              <Text style={styles.infoText}>Nom: {user.nom} {user.prenom}</Text>
              <Text style={styles.infoText}>Matricule: {user.matricule}</Text>
              <Text style={styles.infoText}>Rôle: {user.role}</Text>
              <Text style={styles.infoText}>Email: {user.email}</Text>
            </View>
          ) : (
            <Text style={styles.errorText}>Aucun utilisateur connecté</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔑 Token</Text>
          {token ? (
            <Text style={styles.tokenText} numberOfLines={3}>
              {token}
            </Text>
          ) : (
            <Text style={styles.errorText}>Aucun token</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Données API Debug</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={loadDebugData}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Chargement...' : 'Recharger les Données'}
            </Text>
          </TouchableOpacity>

          {debugData && (
            <View style={styles.debugInfo}>
              <Text style={styles.debugTitle}>Réponse API :</Text>
              <Text style={styles.debugText}>
                Succès: {debugData.success ? 'Oui' : 'Non'}
              </Text>
              {debugData.user && (
                <View>
                  <Text style={styles.debugText}>
                    Utilisateur API: {debugData.user.nom} (ID: {debugData.user.id})
                  </Text>
                  <Text style={styles.debugText}>
                    Rôle API: {debugData.user.role}
                  </Text>
                </View>
              )}
              <Text style={styles.debugText}>
                Nombre d'incidents: {debugData.incidents_count || 0}
              </Text>
              
              {debugData.incidents && debugData.incidents.length > 0 && (
                <View style={styles.incidentsSection}>
                  <Text style={styles.debugTitle}>Incidents :</Text>
                  {debugData.incidents.map((incident: any) => (
                    <View key={incident.id} style={styles.incidentItem}>
                      <Text style={styles.incidentText}>
                        ID: {incident.id} - {incident.type}
                      </Text>
                      <Text style={styles.incidentDesc}>
                        {incident.description}
                      </Text>
                      <Text style={styles.incidentMeta}>
                        User ID: {incident.user_id} | Actif: {incident.actif ? 'Oui' : 'Non'}
                      </Text>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => testDeleteIncident(incident.id)}
                      >
                        <Text style={styles.deleteButtonText}>
                          🗑️ Tester Suppression
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Tests Rapides</Text>
          
          <TouchableOpacity 
            style={styles.testButton} 
            onPress={() => {
              Alert.alert('Info', `Utilisateur: ${user?.nom || 'Non connecté'}\nRôle: ${user?.role || 'Aucun'}\nToken: ${token ? 'Présent' : 'Absent'}`);
            }}
          >
            <Text style={styles.testButtonText}>Afficher Infos Rapides</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  userInfo: {
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    fontStyle: 'italic',
  },
  tokenText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 4,
  },
  button: {
    backgroundColor: colors.primary[500],
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  debugInfo: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  incidentsSection: {
    marginTop: 12,
  },
  incidentItem: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  incidentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  incidentDesc: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  incidentMeta: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
