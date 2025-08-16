import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { apiService } from '@/services/api';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Trash2,
  Plus,
  RefreshCw,
  Eye
} from 'lucide-react-native';
import { colors } from '@/theme/colors';

export default function TestFinalScreen() {
  const { user } = useAuthStore();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [testResults, setTestResults] = useState<any>({});

  const loadIncidents = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await apiService.getIncidents();
      
      if (response.success && response.data) {
        setIncidents(response.data);
        console.log('Incidents chargés:', response.data.length);
      }
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const onRefresh = () => {
    loadIncidents(true);
  };

  const createTestIncident = async () => {
    try {
      const testIncident = {
        dateIncident: new Date(),
        type: 'Test',
        description: `Test incident créé à ${new Date().toLocaleTimeString()}`,
        zone: 'Zone Test',
        emplacement: 'Test',
        agent: user?.nom || 'Test',
        photos: [],
        temoins: [],
        mesuresPrises: 'Test',
        statut: 'en_cours' as const,
        latitude: -18.1569,
        longitude: 49.4085,
        personnesImpliquees: [],
      };

      const response = await apiService.createIncident(testIncident);
      
      if (response.success) {
        Alert.alert('Succès', 'Incident de test créé !');
        loadIncidents();
      } else {
        Alert.alert('Erreur', response.message || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur création:', error);
      Alert.alert('Erreur', 'Erreur de connexion');
    }
  };

  const testDeleteIncident = async (incident: any) => {
    Alert.alert(
      'Test de Suppression',
      `Supprimer l'incident "${incident.typeIncident || incident.type}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.deleteIncident(
                (incident.idIncident || incident.id).toString(),
                'Test de suppression finale'
              );

              if (response.success) {
                Alert.alert('Succès', 'Incident supprimé !');
                loadIncidents(); // Recharger immédiatement
              } else {
                Alert.alert('Erreur', response.message || 'Erreur lors de la suppression');
              }
            } catch (error) {
              console.error('Erreur suppression:', error);
              Alert.alert('Erreur', 'Erreur de connexion');
            }
          }
        }
      ]
    );
  };

  const canDeleteIncident = (incident: any) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'responsable') return true;
    if (user.role === 'agent' && incident.idUtilisateur === user.idUtilisateur) return true;
    return false;
  };

  const runFullTest = async () => {
    const results: any = {};
    
    try {
      // Test 1: Créer un incident
      results.create = await testCreateIncident();
      
      // Test 2: Charger les incidents
      results.load = await testLoadIncidents();
      
      // Test 3: Supprimer l'incident créé
      if (results.create.success && results.create.incidentId) {
        results.delete = await testDeleteIncidentById(results.create.incidentId);
      }
      
      // Test 4: Vérifier qu'il a disparu
      results.verify = await testVerifyDeletion();
      
      setTestResults(results);
      
      const allSuccess = Object.values(results).every((r: any) => r.success);
      
      Alert.alert(
        allSuccess ? 'Tests Réussis !' : 'Tests Partiels',
        `Création: ${results.create?.success ? '✅' : '❌'}\n` +
        `Chargement: ${results.load?.success ? '✅' : '❌'}\n` +
        `Suppression: ${results.delete?.success ? '✅' : '❌'}\n` +
        `Vérification: ${results.verify?.success ? '✅' : '❌'}`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      Alert.alert('Erreur', `Erreur lors des tests: ${error}`);
    }
  };

  const testCreateIncident = async () => {
    try {
      const response = await apiService.createIncident({
        dateIncident: new Date(),
        type: 'Test Auto',
        description: 'Incident créé automatiquement pour test',
        zone: 'Zone Test Auto',
        emplacement: 'Test',
        agent: user?.nom || 'Test',
        photos: [],
        temoins: [],
        mesuresPrises: 'Test automatique',
        statut: 'en_cours' as const,
        latitude: -18.1569,
        longitude: 49.4085,
        personnesImpliquees: [],
      });
      
      return {
        success: response.success,
        incidentId: response.data?.idIncident || response.data?.id,
        message: response.message
      };
    } catch (error) {
      return { success: false, error: error };
    }
  };

  const testLoadIncidents = async () => {
    try {
      const response = await apiService.getIncidents();
      return {
        success: response.success,
        count: response.data?.length || 0
      };
    } catch (error) {
      return { success: false, error: error };
    }
  };

  const testDeleteIncidentById = async (incidentId: string) => {
    try {
      const response = await apiService.deleteIncident(incidentId, 'Test automatique');
      return {
        success: response.success,
        message: response.message
      };
    } catch (error) {
      return { success: false, error: error };
    }
  };

  const testVerifyDeletion = async () => {
    try {
      const response = await apiService.getIncidents();
      const hasTestIncident = response.data?.some((inc: any) => 
        inc.typeIncident === 'Test Auto' || inc.type === 'Test Auto'
      );
      
      return {
        success: response.success && !hasTestIncident,
        message: hasTestIncident ? 'Incident encore présent' : 'Incident bien supprimé'
      };
    } catch (error) {
      return { success: false, error: error };
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Test Final du Système' }} />
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Statut utilisateur */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Utilisateur Connecté</Text>
          {user ? (
            <View style={styles.userInfo}>
              <Text style={styles.userText}>
                {user.prenom} {user.nom} ({user.role})
              </Text>
              <Text style={styles.userText}>
                ID: {user.idUtilisateur} | Matricule: {user.matricule}
              </Text>
            </View>
          ) : (
            <Text style={styles.errorText}>Aucun utilisateur connecté</Text>
          )}
        </View>

        {/* Tests automatiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Tests Automatiques</Text>
          
          <TouchableOpacity style={styles.testButton} onPress={runFullTest}>
            <Text style={styles.testButtonText}>
              🚀 Lancer Test Complet (Créer → Supprimer → Vérifier)
            </Text>
          </TouchableOpacity>

          {Object.keys(testResults).length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>Résultats des Tests :</Text>
              
              {Object.entries(testResults).map(([test, result]: [string, any]) => (
                <View key={test} style={styles.resultItem}>
                  {result.success ? (
                    <CheckCircle size={16} color="#10b981" />
                  ) : (
                    <XCircle size={16} color="#ef4444" />
                  )}
                  <Text style={styles.resultText}>
                    {test}: {result.success ? 'Réussi' : 'Échec'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Actions manuelles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Tests Manuels</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={createTestIncident}>
            <Plus size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Créer Incident de Test</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/simple-trash')}
          >
            <Trash2 size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Voir la Corbeille</Text>
          </TouchableOpacity>
        </View>

        {/* Liste des incidents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Incidents Actifs ({incidents.length})</Text>
            <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
              <RefreshCw size={20} color={colors.primary[500]} />
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <Text style={styles.loadingText}>Chargement...</Text>
          ) : incidents.length > 0 ? (
            incidents.map((incident, index) => {
              const canDelete = canDeleteIncident(incident);
              
              return (
                <View key={index} style={styles.incidentItem}>
                  <View style={styles.incidentHeader}>
                    <Text style={styles.incidentTitle}>
                      {incident.typeIncident || incident.type}
                    </Text>
                    <View style={styles.incidentStatus}>
                      {incident.actif !== false ? (
                        <CheckCircle size={16} color="#10b981" />
                      ) : (
                        <XCircle size={16} color="#ef4444" />
                      )}
                    </View>
                  </View>
                  
                  <Text style={styles.incidentDescription} numberOfLines={2}>
                    {incident.description}
                  </Text>
                  
                  <View style={styles.incidentMeta}>
                    <Text style={styles.metaText}>ID: {incident.idIncident || incident.id}</Text>
                    <Text style={styles.metaText}>User: {incident.idUtilisateur}</Text>
                    <Text style={styles.metaText}>Actif: {incident.actif !== false ? 'Oui' : 'Non'}</Text>
                  </View>
                  
                  <View style={styles.incidentActions}>
                    <TouchableOpacity style={styles.viewButton}>
                      <Eye size={16} color="#6b7280" />
                      <Text style={styles.actionText}>Voir</Text>
                    </TouchableOpacity>
                    
                    {canDelete ? (
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => testDeleteIncident(incident)}
                      >
                        <Trash2 size={16} color="#fff" />
                        <Text style={styles.deleteText}>Supprimer</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.disabledButton}>
                        <Text style={styles.disabledText}>Pas autorisé</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>Aucun incident actif</Text>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Instructions de Test</Text>
          
          <View style={styles.instruction}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>
              Lancez le test complet pour vérifier tout le cycle
            </Text>
          </View>
          
          <View style={styles.instruction}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>
              Créez manuellement un incident et supprimez-le
            </Text>
          </View>
          
          <View style={styles.instruction}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>
              Vérifiez que l'incident disparaît immédiatement de la liste
            </Text>
          </View>
          
          <View style={styles.instruction}>
            <Text style={styles.stepNumber}>4</Text>
            <Text style={styles.stepText}>
              Allez dans la corbeille pour voir les incidents supprimés
            </Text>
          </View>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshButton: {
    padding: 8,
  },
  userInfo: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 12,
  },
  userText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  testButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 6,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 12,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  incidentItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  incidentStatus: {
    padding: 4,
  },
  incidentDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  incidentMeta: {
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  incidentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  disabledButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  deleteText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
  },
  disabledText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
