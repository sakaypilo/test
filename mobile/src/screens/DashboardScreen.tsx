import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { dashboardAPI, incidentsAPI, camerasAPI } from '../services/api';
import { colors } from '../theme/theme';
import { useAuthStore } from '../stores/authStore';

interface DashboardStats {
  cameras: {
    total: number;
    actives: number;
    en_panne: number;
    hors_ligne: number;
  };
  incidents: {
    total: number;
    ce_mois: number;
    en_attente: number;
    valides: number;
  };
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [statsResponse, incidentsResponse] = await Promise.all([
        dashboardAPI.getStats(),
        incidentsAPI.getAll({ limit: 5 })
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data.statistiques);
      }

      if (incidentsResponse.success) {
        setRecentIncidents(incidentsResponse.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'actif':
      case 'valide':
        return colors.success;
      case 'en_attente':
        return colors.warning;
      case 'panne':
      case 'rejete':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.welcomeText}>
          Bonjour, {user?.prenom}
        </Text>
        <Text variant="bodyMedium" style={styles.roleText}>
          {user?.role} - SMMC Port de Toamasina
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { backgroundColor: colors.success + '20' }]}>
            <Card.Content style={styles.statContent}>
              <Ionicons name="videocam" size={24} color={colors.success} />
              <Text variant="headlineSmall" style={styles.statNumber}>
                {stats?.cameras.actives || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Caméras actives
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.warning + '20' }]}>
            <Card.Content style={styles.statContent}>
              <Ionicons name="warning" size={24} color={colors.warning} />
              <Text variant="headlineSmall" style={styles.statNumber}>
                {stats?.incidents.ce_mois || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Incidents ce mois
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { backgroundColor: colors.info + '20' }]}>
            <Card.Content style={styles.statContent}>
              <Ionicons name="time" size={24} color={colors.info} />
              <Text variant="headlineSmall" style={styles.statNumber}>
                {stats?.incidents.en_attente || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                En attente
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.primary + '20' }]}>
            <Card.Content style={styles.statContent}>
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              <Text variant="headlineSmall" style={styles.statNumber}>
                {stats?.incidents.valides || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Validés
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Recent Incidents */}
      <Card style={styles.card}>
        <Card.Title title="Incidents récents" />
        <Card.Content>
          {recentIncidents.length > 0 ? (
            recentIncidents.map((incident: any) => (
              <View key={incident.idIncident} style={styles.incidentItem}>
                <View style={styles.incidentHeader}>
                  <Text variant="bodyMedium" style={styles.incidentType}>
                    {incident.typeIncident}
                  </Text>
                  <Chip
                    mode="outlined"
                    textStyle={{ fontSize: 10 }}
                    style={[
                      styles.statusChip,
                      { borderColor: getStatusColor(incident.statut) }
                    ]}
                  >
                    {incident.statut.replace('_', ' ')}
                  </Chip>
                </View>
                <Text variant="bodySmall" style={styles.incidentZone}>
                  {incident.zone}
                </Text>
                <Text variant="bodySmall" style={styles.incidentDate}>
                  {new Date(incident.dateHeure).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>Aucun incident récent</Text>
          )}
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Title title="Actions rapides" />
        <Card.Content>
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => navigation.navigate('NewIncident' as never)}
              style={styles.actionButton}
            >
              Signaler incident
            </Button>
            
            {['responsable', 'admin'].includes(user?.role || '') && (
              <Button
                mode="outlined"
                icon="file-document"
                onPress={() => navigation.navigate('Reports' as never)}
                style={styles.actionButton}
              >
                Rapports
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
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
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
  },
  header: {
    padding: 20,
    backgroundColor: colors.primary,
  },
  welcomeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  roleText: {
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  statsContainer: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
  card: {
    margin: 16,
    marginTop: 0,
  },
  incidentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  incidentType: {
    fontWeight: '500',
    flex: 1,
  },
  statusChip: {
    height: 24,
  },
  incidentZone: {
    color: colors.textSecondary,
    marginBottom: 2,
  },
  incidentDate: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  noDataText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});