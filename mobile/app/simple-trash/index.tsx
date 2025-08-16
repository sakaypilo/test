import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Stack } from 'expo-router';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react-native';
import { apiService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { colors } from '@/theme/colors';

export default function SimpleTrashScreen() {
  const { user } = useAuthStore();
  const [deletedItems, setDeletedItems] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDeletedItems = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await apiService.getDeletedItems();
      
      if (response.success && response.data) {
        setDeletedItems(response.data);
      } else {
        setError(response.message || 'Erreur lors du chargement');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur chargement corbeille:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDeletedItems();
  }, []);

  const onRefresh = () => {
    loadDeletedItems(true);
  };

  const handleRestoreIncident = async (id: number, name: string) => {
    Alert.alert(
      'Restaurer',
      `Êtes-vous sûr de vouloir restaurer ${name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Restaurer',
          onPress: async () => {
            try {
              const response = await apiService.restoreIncident(id.toString());
              
              if (response.success) {
                Alert.alert('Succès', 'Incident restauré avec succès');
                loadDeletedItems();
              } else {
                Alert.alert('Erreur', response.message || 'Erreur lors de la restauration');
              }
            } catch (error) {
              Alert.alert('Erreur', 'Erreur de connexion lors de la restauration');
            }
          }
        },
      ]
    );
  };

  const renderIncident = (incident: any) => {
    return (
      <View key={incident.idIncident} style={styles.item}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>
            Incident {incident.typeIncident || 'inconnu'}
          </Text>
          <Text style={styles.itemType}>incident</Text>
        </View>
        
        <Text style={styles.itemDescription} numberOfLines={2}>
          {incident.description}
        </Text>
        
        <Text style={styles.itemDate}>
          Supprimé le {new Date(incident.deleted_at).toLocaleDateString('fr-FR')}
        </Text>
        
        {incident.deletion_reason && (
          <Text style={styles.itemReason}>
            Raison: {incident.deletion_reason}
          </Text>
        )}
        
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.restoreButton]}
            onPress={() => handleRestoreIncident(incident.idIncident, `l'incident ${incident.typeIncident}`)}
          >
            <RotateCcw size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Restaurer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!user || !['admin', 'responsable'].includes(user.role)) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Corbeille' }} />
        <View style={styles.noAccess}>
          <AlertTriangle size={64} color="#f59e0b" />
          <Text style={styles.noAccessTitle}>Accès refusé</Text>
          <Text style={styles.noAccessText}>
            Vous n'avez pas les permissions pour accéder à la corbeille.
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading && !refreshing) {
    return <LoadingSpinner message="Chargement de la corbeille..." />;
  }

  if (error && !refreshing) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Corbeille' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => loadDeletedItems()}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Corbeille',
          headerShown: true,
        }} 
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Éléments supprimés</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Incidents supprimés */}
        {deletedItems.incidents && deletedItems.incidents.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Incidents</Text>
            {deletedItems.incidents.map(renderIncident)}
          </View>
        )}

        {/* Caméras supprimées */}
        {deletedItems.cameras && deletedItems.cameras.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Caméras</Text>
            {deletedItems.cameras.map((camera: any) => (
              <View key={camera.idCamera} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    Caméra {camera.numeroSerie || camera.zone}
                  </Text>
                  <Text style={styles.itemType}>caméra</Text>
                </View>
                <Text style={styles.itemDate}>
                  Supprimé le {new Date(camera.deleted_at).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Personnes supprimées */}
        {deletedItems.personnes && deletedItems.personnes.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Personnes</Text>
            {deletedItems.personnes.map((personne: any) => (
              <View key={personne.idPersonne} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {personne.prenom} {personne.nom}
                  </Text>
                  <Text style={styles.itemType}>personne</Text>
                </View>
                <Text style={styles.itemDate}>
                  Supprimé le {new Date(personne.deleted_at).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {Object.keys(deletedItems).length === 0 && (
          <View style={styles.emptyState}>
            <Trash2 size={64} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Corbeille vide</Text>
            <Text style={styles.emptyMessage}>
              Aucun élément supprimé trouvé
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 12,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  itemType: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  itemDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  itemReason: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  restoreButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  noAccess: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noAccessTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  noAccessText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});
