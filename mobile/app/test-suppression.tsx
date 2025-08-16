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
  Trash2, 
  RefreshCw, 
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react-native';
import { colors } from '@/theme/colors';

export default function TestSuppressionScreen() {
  const { user } = useAuthStore();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIncidents = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await apiService.getIncidents();
      
      if (response.success && response.data) {
        console.log('Incidents chargés:', response.data.length);
        setIncidents(response.data);
      } else {
        setError(response.message || 'Erreur lors du chargement');
      }
    } catch (err) {
      console.error('Erreur chargement:', err);
      setError('Erreur de connexion au serveur');
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

  const testDeleteIncident = async (incident: any) => {
    Alert.alert(
      'Confirmer la Suppression',
      `Voulez-vous supprimer l'incident "${incident.type}" ?\n\nCeci est un test de suppression.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.deleteIncident(
                (incident.idIncident || incident.id).toString(),
                'Test de suppression depuis l\'app mobile'
              );

              if (response.success) {
                // Rafraîchir immédiatement
                loadIncidents();
                
                Alert.alert(
                  'Succès',
                  'Incident supprimé avec succès !',
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert('Erreur', response.message || 'Erreur lors de la suppression');
              }
            } catch (error) {
              console.error('Erreur suppression:', error);
              Alert.alert('Erreur', 'Erreur de connexion lors de la suppression');
            }
          }
        }
      ]
    );
  };

  const canDeleteIncident = (incident: any) => {
    if (!user) return false;
    
    // Admin peut supprimer tous les incidents
    if (user.role === 'admin') return true;
    
    // Responsable peut supprimer tous les incidents
    if (user.role === 'responsable') return true;
    
    // Agent peut supprimer ses propres incidents
    if (user.role === 'agent' && incident.idUtilisateur === user.idUtilisateur) return true;
    
    return false;
  };

  const getIncidentStatus = (incident: any) => {
    if (incident.actif === false) {
      return { text: 'SUPPRIMÉ', color: '#ef4444', icon: <XCircle size={16} color="#ef4444" /> };
    }
    if (incident.statut === 'valide') {
      return { text: 'VALIDÉ', color: '#10b981', icon: <CheckCircle size={16} color="#10b981" /> };
    }
    return { text: 'EN COURS', color: '#f59e0b', icon: <AlertTriangle size={16} color="#f59e0b" /> };
  };

  // Filtrer les incidents actifs et supprimés séparément
  const activeIncidents = incidents.filter(incident => incident.actif !== false);
  const deletedIncidents = incidents.filter(incident => incident.actif === false);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Test Suppression' }} />
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Statut utilisateur */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Utilisateur & Permissions</Text>
          {user ? (
            <View style={styles.userInfo}>
              <Text style={styles.userText}>
                {user.prenom} {user.nom} ({user.role})
              </Text>
              <Text style={styles.userText}>
                ID: {user.idUtilisateur}
              </Text>
              <View style={styles.permissionsList}>
                <View style={styles.permissionItem}>
                  {user.role === 'admin' ? (
                    <CheckCircle size={16} color="#10b981" />
                  ) : (
                    <XCircle size={16} color="#ef4444" />
                  )}
                  <Text style={styles.permissionText}>Supprimer tous les incidents</Text>
                </View>
                <View style={styles.permissionItem}>
                  {['admin', 'responsable'].includes(user.role) ? (
                    <CheckCircle size={16} color="#10b981" />
                  ) : (
                    <XCircle size={16} color="#ef4444" />
                  )}
                  <Text style={styles.permissionText}>Accès à la corbeille</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={styles.errorText}>Aucun utilisateur connecté</Text>
          )}
        </View>

        {/* Statistiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Statistiques</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{incidents.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#10b981' }]}>{activeIncidents.length}</Text>
              <Text style={styles.statLabel}>Actifs</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#ef4444' }]}>{deletedIncidents.length}</Text>
              <Text style={styles.statLabel}>Supprimés</Text>
            </View>
          </View>
        </View>

        {/* Incidents actifs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Incidents Actifs ({activeIncidents.length})</Text>
            <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
              <RefreshCw size={20} color={colors.primary[500]} />
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <Text style={styles.loadingText}>Chargement...</Text>
          ) : activeIncidents.length > 0 ? (
            activeIncidents.map((incident, index) => {
              const status = getIncidentStatus(incident);
              const canDelete = canDeleteIncident(incident);
              
              return (
                <View key={index} style={styles.incidentItem}>
                  <View style={styles.incidentHeader}>
                    <Text style={styles.incidentTitle}>
                      {incident.typeIncident || incident.type}
                    </Text>
                    <View style={styles.incidentStatus}>
                      {status.icon}
                      <Text style={[styles.statusText, { color: status.color }]}>
                        {status.text}
                      </Text>
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

        {/* Incidents supprimés */}
        {deletedIncidents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🗑️ Incidents Supprimés ({deletedIncidents.length})</Text>
            
            {deletedIncidents.map((incident, index) => (
              <View key={index} style={[styles.incidentItem, styles.deletedItem]}>
                <View style={styles.incidentHeader}>
                  <Text style={[styles.incidentTitle, styles.deletedTitle]}>
                    {incident.typeIncident || incident.type}
                  </Text>
                  <View style={styles.deletedBadge}>
                    <XCircle size={16} color="#ef4444" />
                    <Text style={styles.deletedBadgeText}>SUPPRIMÉ</Text>
                  </View>
                </View>
                
                <Text style={[styles.incidentDescription, styles.deletedDescription]} numberOfLines={2}>
                  {incident.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Actions Rapides</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/simple-trash')}
          >
            <Trash2 size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Aller à la Corbeille</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/incidents')}
          >
            <Eye size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Liste des Incidents</Text>
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
  permissionsList: {
    marginTop: 8,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  permissionText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  incidentItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  deletedItem: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
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
  deletedTitle: {
    color: '#6b7280',
    textDecorationLine: 'line-through',
  },
  incidentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  incidentDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  deletedDescription: {
    color: '#9ca3af',
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
  deletedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fecaca',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deletedBadgeText: {
    fontSize: 10,
    color: '#dc2626',
    fontWeight: '600',
    marginLeft: 4,
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
