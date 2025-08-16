import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useIncidentsStore } from '@/stores/incidents';
import { useAuthStore } from '@/stores/auth';
import { apiService } from '@/services/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import IncidentListItem from '@/components/lists/IncidentListItem';
import { TriangleAlert as AlertTriangle, Plus, Calendar, MapPin, Clock, CircleCheck as CheckCircle, Circle as XCircle, Trash2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function IncidentsScreen() {
  const {
    incidents,
    setIncidents,
    setSelectedIncident,
    isLoading,
    error,
    setLoading,
    setError,
  } = useIncidentsStore();

  const { user } = useAuthStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'tous' | 'en_cours' | 'clos'>('tous');

  const loadIncidents = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await apiService.getIncidents();
      
      if (response.success && response.data) {
        setIncidents(response.data);
      } else {
        setError(response.message || 'Erreur lors du chargement');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur Laravel');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const onRefresh = () => {
    loadIncidents(true);
  };

  const handleIncidentPress = (incident: any) => {
    setSelectedIncident(incident);
    router.push('/(tabs)/incidents/details');
  };

  const handleAddIncident = () => {
    router.push('/(tabs)/incidents/add');
  };

  const handleTrash = () => {
    router.push('/simple-trash');
  };

  const getFilteredIncidents = () => {
    // D'abord filtrer les incidents actifs (non supprimés)
    const activeIncidents = incidents.filter(incident => {
      // Vérifier si l'incident est actif (pas supprimé)
      // Si le champ actif n'existe pas, on considère l'incident comme actif
      return incident.actif !== false;
    });

    // Ensuite filtrer par statut si nécessaire
    if (filter === 'tous') return activeIncidents;
    return activeIncidents.filter(incident => incident.statut === filter);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vol': return '#dc2626';
      case 'bagarre': return '#f59e0b';
      case 'accident': return '#059669'; // primary.600
      default: return '#64748b';
    }
  };

  const getTypeIcon = (type: string) => {
    return <AlertTriangle size={20} color={getTypeColor(type)} />;
  };

  if (isLoading && !incidents.length) {
    return <LoadingSpinner message="Chargement des incidents..." />;
  }

  if (error && !incidents.length) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={() => loadIncidents()} 
      />
    );
  }

  const filteredIncidents = getFilteredIncidents();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestion des Incidents</Text>
        <Text style={styles.subtitle}>
          {incidents.length} incidents enregistrés
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Nouvel Incident"
          onPress={handleAddIncident}
          variant="primary"
          style={styles.addButton}
        />
        {user && ['admin', 'responsable'].includes(user.role) && (
          <TouchableOpacity
            style={styles.trashButton}
            onPress={handleTrash}
          >
            <Trash2 size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filters}>
        {(['tous', 'en_cours', 'clos'] as const).map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            style={[
              styles.filterButton,
              filter === filterOption && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(filterOption)}
          >
            <Text
              style={[
                styles.filterText,
                filter === filterOption && styles.filterTextActive,
              ]}
            >
              {filterOption === 'tous' ? 'Tous' : filterOption.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredIncidents.length === 0 ? (
          <Card style={styles.emptyCard}>
            <AlertTriangle size={64} color="#94a3b8" />
            <Text style={styles.emptyTitle}>
              {filter === 'tous' ? 'Aucun incident' : `Aucun incident ${filter.replace('_', ' ')}`}
            </Text>
            <Text style={styles.emptyMessage}>
              {filter === 'tous' 
                ? 'Commencez par signaler votre premier incident'
                : `Aucun incident ${filter.replace('_', ' ')} trouvé`
              }
            </Text>
            {filter === 'tous' && (
              <Button
                title="Signaler un incident"
                onPress={handleAddIncident}
                variant="primary"
                style={styles.emptyButton}
              />
            )}
          </Card>
        ) : (
          <View style={styles.incidentsList}>
            {filteredIncidents.map((incident) => (
              <IncidentListItem
                key={incident.idIncident || incident.id}
                incident={incident}
                onRefresh={() => loadIncidents(true)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#00A550', // primary.500
    padding: isTablet ? 30 : 20,
    paddingTop: isTablet ? 60 : 50,
  },
  title: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: isTablet ? 16 : 14,
    color: '#bbf7d0', // primary.200
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    gap: 12,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trashButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterButtonActive: {
    backgroundColor: '#00A550', // primary.500
    borderColor: '#00A550', // primary.500
  },
  filterText: {
    fontSize: isTablet ? 14 : 12,
    color: '#64748b',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  emptyCard: {
    alignItems: 'center',
    margin: 20,
    padding: 40,
  },
  emptyTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: isTablet ? 16 : 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  emptyButton: {
    paddingHorizontal: 30,
  },
  incidentsList: {
    padding: 16,
    gap: 8,
  },
  incidentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 15,
  },
  incidentCard: {
    width: isTablet ? (width - 60) / 2 - 7.5 : width - 40,
    padding: 16,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeText: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statusContainer: {
    marginLeft: 10,
  },
  incidentDescription: {
    fontSize: isTablet ? 16 : 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  incidentMeta: {
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: isTablet ? 14 : 12,
    color: '#64748b',
    marginLeft: 6,
  },
  photosIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f0fdf4', // primary.50
    borderRadius: 12,
  },
  photosText: {
    fontSize: isTablet ? 12 : 10,
    color: '#00A550', // primary.500
    fontWeight: '500',
  },
});