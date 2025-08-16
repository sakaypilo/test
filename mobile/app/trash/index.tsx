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
import ErrorMessage from '@/components/ui/ErrorMessage';
import Button from '@/components/ui/Button';
import { colors } from '@/theme/colors';

interface TrashItem {
  id: number;
  type: string;
  name: string;
  deletedAt: string;
  deletedBy: string;
  reason?: string;
}

export default function TrashScreen() {
  const { user } = useAuthStore();
  const [trashItems, setTrashItems] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');

  const loadTrashItems = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await apiService.getTrashItems(selectedType === 'all' ? undefined : selectedType);
      
      if (response.success && response.data) {
        setTrashItems(response.data);
      } else {
        setError(response.message || 'Erreur lors du chargement');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTrashItems();
  }, [selectedType]);

  const onRefresh = () => {
    loadTrashItems(true);
  };

  const handleRestore = async (type: string, id: number, itemName: string) => {
    Alert.alert(
      'Restaurer',
      `Êtes-vous sûr de vouloir restaurer ${itemName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Restaurer',
          onPress: async () => {
            try {
              const response = await apiService.restoreFromTrash(type, id.toString());
              
              if (response.success) {
                Alert.alert('Succès', 'Élément restauré avec succès');
                loadTrashItems();
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

  const handlePermanentDelete = async (type: string, id: number, itemName: string) => {
    Alert.alert(
      'Supprimer définitivement',
      `Êtes-vous sûr de vouloir supprimer définitivement ${itemName} ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer définitivement',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.permanentDelete(type, id.toString());
              
              if (response.success) {
                Alert.alert('Succès', 'Élément supprimé définitivement');
                loadTrashItems();
              } else {
                Alert.alert('Erreur', response.message || 'Erreur lors de la suppression');
              }
            } catch (error) {
              Alert.alert('Erreur', 'Erreur de connexion lors de la suppression');
            }
          }
        },
      ]
    );
  };

  const handleEmptyTrash = () => {
    Alert.alert(
      'Vider la corbeille',
      'Êtes-vous sûr de vouloir supprimer définitivement tous les éléments de plus de 30 jours ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider la corbeille',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.emptyTrash(30);
              
              if (response.success) {
                Alert.alert('Succès', 'Corbeille vidée avec succès');
                loadTrashItems();
              } else {
                Alert.alert('Erreur', response.message || 'Erreur lors du vidage');
              }
            } catch (error) {
              Alert.alert('Erreur', 'Erreur de connexion lors du vidage');
            }
          }
        },
      ]
    );
  };

  const renderTrashItem = (item: any, type: string) => {
    const getItemName = () => {
      switch (type) {
        case 'incidents':
          return `Incident ${item.typeIncident || 'inconnu'}`;
        case 'cameras':
          return `Caméra ${item.numeroSerie || item.zone}`;
        case 'personnes':
          return `${item.prenom} ${item.nom}`;
        case 'users':
          return `${item.prenom} ${item.nom} (${item.role})`;
        default:
          return 'Élément inconnu';
      }
    };

    return (
      <View key={`${type}-${item.id}`} style={styles.trashItem}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{getItemName()}</Text>
          <Text style={styles.itemType}>{type}</Text>
        </View>
        
        <Text style={styles.itemDate}>
          Supprimé le {new Date(item.deleted_at).toLocaleDateString('fr-FR')}
        </Text>
        
        {item.deletion_reason && (
          <Text style={styles.itemReason}>
            Raison: {item.deletion_reason}
          </Text>
        )}
        
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.restoreButton]}
            onPress={() => handleRestore(type, item.id, getItemName())}
          >
            <RotateCcw size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Restaurer</Text>
          </TouchableOpacity>
          
          {user?.role === 'admin' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handlePermanentDelete(type, item.id, getItemName())}
            >
              <Trash2 size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Supprimer</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderTrashItems = () => {
    if (selectedType === 'all') {
      return Object.entries(trashItems).map(([type, items]: [string, any]) => (
        <View key={type}>
          {Array.isArray(items) && items.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
              {items.map(item => renderTrashItem(item, type))}
            </>
          )}
        </View>
      ));
    } else {
      const items = trashItems[selectedType] || [];
      return items.map((item: any) => renderTrashItem(item, selectedType));
    }
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
      <ErrorMessage 
        message={error} 
        onRetry={() => loadTrashItems()} 
      />
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
        {user?.role === 'admin' && (
          <Button
            title="Vider la corbeille"
            onPress={handleEmptyTrash}
            variant="outline"
            style={styles.emptyButton}
          />
        )}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderTrashItems()}
        
        {Object.keys(trashItems).length === 0 && (
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  emptyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  trashItem: {
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
  itemName: {
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
  deleteButton: {
    backgroundColor: '#ef4444',
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
