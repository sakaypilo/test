import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { rapportsAPI, incidentsAPI } from '../services/api';
import { colors } from '../theme/theme';

export default function ReportsScreen() {
  const [reports, setReports] = useState([]);
  const [validatedIncidents, setValidatedIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const [reportsResponse, incidentsResponse] = await Promise.all([
        rapportsAPI.getAll(),
        incidentsAPI.getAll({ statut: 'valide' })
      ]);

      if (reportsResponse.success) {
        setReports(reportsResponse.data);
      }

      Alert.alert(
        'Téléchargement',
        'Le téléchargement de rapports PDF n\'est pas disponible sur mobile. Utilisez la version web pour télécharger les rapports.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erreur chargement rapports:', error);
    } finally {
      setLoading(false);
      Alert.alert('Erreur', 'Fonctionnalité non disponible sur mobile');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const hasReport = (incidentId: number) => {
    return reports.some((report: any) => report.idIncident === incidentId);
  };

  const generateReport = async (incident: any) => {
    Alert.alert(
      'Générer rapport',
      `Voulez-vous générer un rapport pour l'incident "${incident.typeIncident}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Générer',
          onPress: async () => {
            setGenerating(incident.idIncident);
            try {
              const response = await rapportsAPI.generateIncidentReport(
                incident.idIncident,
                { observations: '' }
              );

              if (response.success) {
                Alert.alert('Succès', 'Rapport généré avec succès !');
                loadData(); // Recharger les données
              } else {
                Alert.alert('Erreur', response.message || 'Erreur lors de la génération');
              }
            } catch (error) {
              console.error('Erreur génération rapport:', error);
              Alert.alert('Erreur', 'Erreur de connexion');
            } finally {
              setGenerating(null);
            }
          }
        }
      ]
    );
  };

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
              { 
                borderColor: hasReport(item.idIncident) 
                  ? colors.success 
                  : colors.warning 
              }
            ]}
          >
            {hasReport(item.idIncident) ? 'Rapport généré' : 'En attente'}
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
        </View>

        {!hasReport(item.idIncident) && (
          <Button
            mode="contained"
            onPress={() => generateReport(item)}
            disabled={generating === item.idIncident}
            style={styles.generateButton}
            icon="file-document"
          >
            {generating === item.idIncident ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              'Générer rapport'
            )}
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  const renderReport = ({ item }: { item: any }) => (
    <Card style={styles.reportCard}>
      <Card.Content>
        <View style={styles.reportHeader}>
          <Ionicons name="document-text" size={24} color={colors.primary} />
          <View style={styles.reportInfo}>
            <Text variant="titleMedium" style={styles.reportTitle}>
              Rapport #{item.idRapport}
            </Text>
            <Text variant="bodySmall" style={styles.reportDate}>
              {new Date(item.dateCreation).toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>
        
        {item.incident && (
          <Text variant="bodyMedium" style={styles.reportIncident}>
            Incident: {item.incident.typeIncident} - {item.incident.zone}
          </Text>
        )}
        
        <Text variant="bodySmall" style={styles.reportValidator}>
          Validé par: {item.validateur?.prenom} {item.validateur?.nom}
        </Text>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des rapports...</Text>
      </View>
    );
  }

  const incidentsWithoutReport = validatedIncidents.filter(
    (incident: any) => !hasReport(incident.idIncident)
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Rapports
        </Text>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: 'white' }]}>
              {reports.length}
            </Text>
            <Text style={styles.statLabel}>Générés</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>
              {incidentsWithoutReport.length}
            </Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {validatedIncidents.length}
            </Text>
            <Text style={styles.statLabel}>Incidents validés</Text>
          </View>
        </View>
      </View>

      {/* Incidents sans rapport */}
      {incidentsWithoutReport.length > 0 && (
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Incidents disponibles pour rapport
          </Text>
          <FlatList
            data={incidentsWithoutReport}
            renderItem={renderIncident}
            keyExtractor={(item) => `incident-${item.idIncident}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* Rapports générés */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Rapports générés ({reports.length})
        </Text>
        <FlatList
          data={reports}
          renderItem={renderReport}
          keyExtractor={(item) => `report-${item.idRapport}`}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun rapport généré</Text>
            </View>
          }
        />
      </View>
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
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    padding: 16,
    paddingBottom: 8,
    fontWeight: 'bold',
    color: colors.text,
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  listContainer: {
    padding: 16,
  },
  incidentCard: {
    width: 280,
    marginRight: 12,
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
    marginBottom: 12,
  },
  metaText: {
    color: colors.textSecondary,
    marginBottom: 2,
  },
  generateButton: {
    marginTop: 8,
  },
  reportCard: {
    marginBottom: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportInfo: {
    marginLeft: 12,
    flex: 1,
  },
  reportTitle: {
    fontWeight: 'bold',
  },
  reportDate: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  reportIncident: {
    marginBottom: 8,
    lineHeight: 20,
  },
  reportValidator: {
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
});