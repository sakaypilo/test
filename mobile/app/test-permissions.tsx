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
import { useIncidentsStore } from '@/stores/incidents';
import SimpleActionButtons from '@/components/ui/SimpleActionButtons';
import { colors } from '@/theme/colors';

export default function TestPermissionsScreen() {
  const { user } = useAuthStore();
  const { incidents, loadIncidents } = useIncidentsStore();
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    loadIncidents();
  }, []);

  useEffect(() => {
    if (user && incidents.length > 0) {
      testPermissions();
    }
  }, [user, incidents]);

  const testPermissions = () => {
    const results = incidents.map(incident => {
      const canDelete = checkCanDelete(incident);
      return {
        incident,
        canDelete,
        reason: getDeleteReason(incident)
      };
    });
    setTestResults(results);
  };

  const checkCanDelete = (incident: any) => {
    if (!user) return false;
    
    // Admin peut supprimer tous les incidents
    if (user.role === 'admin') return true;
    
    // Responsable peut supprimer tous les incidents
    if (user.role === 'responsable') return true;
    
    // Agent peut supprimer ses propres incidents
    if (user.role === 'agent' && incident.idUtilisateur === user.idUtilisateur) return true;
    
    return false;
  };

  const getDeleteReason = (incident: any) => {
    if (!user) return 'Pas d\'utilisateur connecté';
    
    if (user.role === 'admin') return 'Admin - peut tout supprimer';
    if (user.role === 'responsable') return 'Responsable - peut tout supprimer';
    if (user.role === 'agent') {
      if (incident.idUtilisateur === user.idUtilisateur) {
        return 'Agent - peut supprimer ses incidents';
      } else {
        return `Agent - ne peut pas supprimer (incident user: ${incident.idUtilisateur}, user: ${user.idUtilisateur})`;
      }
    }
    if (user.role === 'technicien') return 'Technicien - ne peut pas supprimer';
    
    return 'Rôle non reconnu';
  };

  const handleTestDelete = (incident: any) => {
    Alert.alert(
      'Test de Suppression',
      `Incident: ${incident.typeIncident || incident.type}\nPeut supprimer: ${checkCanDelete(incident) ? 'OUI' : 'NON'}\nRaison: ${getDeleteReason(incident)}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Test des Permissions' }} />
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Utilisateur Connecté</Text>
          {user ? (
            <View style={styles.userInfo}>
              <Text style={styles.infoText}>Nom: {user.nom} {user.prenom}</Text>
              <Text style={styles.infoText}>Rôle: {user.role}</Text>
              <Text style={styles.infoText}>ID: {user.idUtilisateur}</Text>
            </View>
          ) : (
            <Text style={styles.errorText}>Aucun utilisateur connecté</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Test des Permissions par Incident</Text>
          
          <TouchableOpacity style={styles.refreshButton} onPress={testPermissions}>
            <Text style={styles.refreshButtonText}>🔄 Rafraîchir le Test</Text>
          </TouchableOpacity>

          {testResults.length > 0 ? (
            testResults.map((result, index) => (
              <View key={index} style={styles.testItem}>
                <View style={styles.testHeader}>
                  <Text style={styles.incidentTitle}>
                    {result.incident.typeIncident || result.incident.type || 'Incident'}
                  </Text>
                  <View style={[
                    styles.permissionBadge,
                    { backgroundColor: result.canDelete ? '#10b981' : '#ef4444' }
                  ]}>
                    <Text style={styles.permissionText}>
                      {result.canDelete ? '✅ PEUT' : '❌ NE PEUT PAS'}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.incidentDesc} numberOfLines={2}>
                  {result.incident.description}
                </Text>
                
                <Text style={styles.reasonText}>
                  Raison: {result.reason}
                </Text>
                
                <View style={styles.incidentMeta}>
                  <Text style={styles.metaText}>
                    ID Incident: {result.incident.idIncident || result.incident.id}
                  </Text>
                  <Text style={styles.metaText}>
                    ID Utilisateur Incident: {result.incident.idUtilisateur}
                  </Text>
                  <Text style={styles.metaText}>
                    ID Utilisateur Connecté: {user?.idUtilisateur}
                  </Text>
                </View>

                <View style={styles.testActions}>
                  <SimpleActionButtons
                    onView={() => Alert.alert('Vue', 'Test de vue')}
                    onDelete={result.canDelete ? () => handleTestDelete(result.incident) : undefined}
                    canDelete={result.canDelete}
                    canView={true}
                    itemName={`l'incident ${result.incident.typeIncident || result.incident.type}`}
                  />
                  
                  <TouchableOpacity 
                    style={styles.debugButton}
                    onPress={() => handleTestDelete(result.incident)}
                  >
                    <Text style={styles.debugButtonText}>🧪 Debug</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>
              {incidents.length === 0 ? 'Aucun incident trouvé' : 'Chargement...'}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Résumé des Permissions</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Admin</Text>
              <Text style={styles.summaryValue}>Peut tout supprimer</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Responsable</Text>
              <Text style={styles.summaryValue}>Peut tout supprimer</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Agent</Text>
              <Text style={styles.summaryValue}>Ses incidents seulement</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Technicien</Text>
              <Text style={styles.summaryValue}>Ne peut rien supprimer</Text>
            </View>
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
  refreshButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  testItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  testHeader: {
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
  permissionBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  permissionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  incidentDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 13,
    color: '#374151',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  incidentMeta: {
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  testActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  debugButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noDataText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  summaryGrid: {
    gap: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  summaryValue: {
    fontSize: 14,
    color: '#6b7280',
  },
});
