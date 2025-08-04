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
  Searchbar,
  ActivityIndicator,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { camerasAPI } from '../services/api';
import { colors } from '../theme/theme';

export default function CamerasScreen() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadCameras = async () => {
    try {
      const response = await camerasAPI.getAll();
      if (response.success) {
        setCameras(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement caméras:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCameras();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadCameras();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'actif':
        return colors.success;
      case 'panne':
        return colors.error;
      case 'hors ligne':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'actif':
        return 'checkmark-circle';
      case 'panne':
        return 'close-circle';
      case 'hors ligne':
        return 'warning';
      default:
        return 'help-circle';
    }
  };

  const filteredCameras = cameras.filter((camera: any) =>
    camera.numeroSerie.toLowerCase().includes(searchQuery.toLowerCase()) ||
    camera.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    camera.emplacement.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCamera = ({ item }: { item: any }) => (
    <Card style={styles.cameraCard}>
      <Card.Content>
        <View style={styles.cameraHeader}>
          <View style={styles.cameraInfo}>
            <Ionicons name="videocam" size={24} color={colors.primary} />
            <View style={styles.cameraDetails}>
              <Text variant="titleMedium" style={styles.cameraSerial}>
                {item.numeroSerie}
              </Text>
              <Text variant="bodySmall" style={styles.cameraIP}>
                {item.adresseIP}
              </Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <Ionicons
              name={getStatusIcon(item.statut)}
              size={16}
              color={getStatusColor(item.statut)}
            />
            <Chip
              mode="outlined"
              textStyle={{ fontSize: 12 }}
              style={[
                styles.statusChip,
                { borderColor: getStatusColor(item.statut) }
              ]}
            >
              {item.statut}
            </Chip>
          </View>
        </View>
        
        <View style={styles.cameraMeta}>
          <Text variant="bodyMedium" style={styles.cameraZone}>
            📍 {item.zone}
          </Text>
          <Text variant="bodySmall" style={styles.cameraLocation}>
            {item.emplacement}
          </Text>
          <Text variant="bodySmall" style={styles.installDate}>
            📅 Installée le {new Date(item.dateInstallation).toLocaleDateString('fr-FR')}
          </Text>
        </View>

        {item.technicien && (
          <Text variant="bodySmall" style={styles.technicianInfo}>
            👨‍🔧 {item.technicien.prenom} {item.technicien.nom}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des caméras...</Text>
      </View>
    );
  }

  // Statistiques
  const stats = {
    total: cameras.length,
    actives: cameras.filter((c: any) => c.statut === 'actif').length,
    pannes: cameras.filter((c: any) => c.statut === 'panne').length,
    horsLigne: cameras.filter((c: any) => c.statut === 'hors ligne').length,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Caméras
        </Text>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {stats.actives}
            </Text>
            <Text style={styles.statLabel}>Actives</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.error }]}>
              {stats.pannes}
            </Text>
            <Text style={styles.statLabel}>En panne</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>
              {stats.horsLigne}
            </Text>
            <Text style={styles.statLabel}>Hors ligne</Text>
          </View>
        </View>

        <Searchbar
          placeholder="Rechercher une caméra..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <FlatList
        data={filteredCameras}
        renderItem={renderCamera}
        keyExtractor={(item) => item.idCamera.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune caméra trouvée</Text>
          </View>
        }
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  searchbar: {
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
  },
  cameraCard: {
    marginBottom: 12,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cameraInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cameraDetails: {
    marginLeft: 12,
    flex: 1,
  },
  cameraSerial: {
    fontWeight: 'bold',
  },
  cameraIP: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusChip: {
    height: 28,
  },
  cameraMeta: {
    marginBottom: 8,
  },
  cameraZone: {
    fontWeight: '500',
    marginBottom: 4,
  },
  cameraLocation: {
    color: colors.textSecondary,
    marginBottom: 4,
  },
  installDate: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  technicianInfo: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
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
});