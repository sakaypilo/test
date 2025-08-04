import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  FAB,
  Searchbar,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { incidentsAPI } from '../services/api';
import { colors } from '../theme/theme';
import { useAuthStore } from '../stores/authStore';

export default function IncidentsScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadIncidents = async () => {
    try {
      const response = await incidentsAPI.getAll();
      if (response.success) {
        setIncidents(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement incidents:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadIncidents();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valide':
        return colors.success;
      case 'en_attente':
        return colors.warning;
      case 'rejete':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const filteredIncidents = incidents.filter((incident: any) =>
    incident.typeIncident.toLowerCase().includes(searchQuery.toLowerCase()) ||
    incident.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    incident.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderIncident = ({ item }: { item: any }) => (
    <Card style={styles.incidentCard}>
      <Card.Content>
        <View style={styles.incidentHeader}>
          <Text variant="titleMedium" style={styles.incidentType}>
            {item.typeIncident}
          </Text>
          <Chip
            mode="outlined"
            textStyle={{ fontSize: 12 }}
            style={[
              styles.statusChip,
              { borderColor: getStatusColor(item.statut) }
            ]}
          >
            {item.statut.replace('_', ' ')}
          </Chip>
        </View>
        
        <Text variant="bodyMedium" style={styles.incidentDescription}>
          {item.description}
        </Text>
        
        <View style={styles.incidentMeta}>
          <Text variant="bodySmall" style={styles.metaText}>
            📍 {item.zone}
          </Text>
          <Text variant="bodySmall" style={styles.metaText}>
            📅 {new Date(item.dateHeure).toLocaleDateString('fr-FR')}
          </Text>
          <Text variant="bodySmall" style={styles.metaText}>
            🕐 {new Date(item.dateHeure).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>

        {item.cameraInfo && (
          <Text variant="bodySmall" style={styles.cameraInfo}>
            📹 {item.cameraInfo.numeroSerie}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des incidents...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Incidents
        </Text>
        <Searchbar
          placeholder="Rechercher un incident..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <FlatList
        data={filteredIncidents}
        renderItem={renderIncident}
        keyExtractor={(item) => item.idIncident.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun incident trouvé</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('NewIncident' as never)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 16,
    paddingTop: 50,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchbar: {
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
  },
  incidentCard: {
    marginBottom: 12,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  incidentType: {
    fontWeight: 'bold',
    flex: 1,
  },
  statusChip: {
    height: 28,
  },
  incidentDescription: {
    marginBottom: 12,
    lineHeight: 20,
  },
  incidentMeta: {
    marginBottom: 8,
  },
  metaText: {
    color: colors.textSecondary,
    marginBottom: 2,
  },
  cameraInfo: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});