import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useCamerasStore } from '@/stores/cameras';
import { apiService } from '@/services/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { 
  ArrowLeft, 
  Camera, 
  MapPin, 
  Calendar, 
  User, 
  Wifi, 
  WifiOff,
  Settings,
  AlertTriangle
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function CameraDetailsScreen() {
  const { selectedCamera, setSelectedCamera } = useCamerasStore();
  const [refreshing, setRefreshing] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [mutations, setMutations] = useState([]);

  useEffect(() => {
    if (!selectedCamera) {
      router.back();
      return;
    }
    loadCameraDetails();
  }, [selectedCamera]);

  const loadCameraDetails = async () => {
    if (!selectedCamera) return;
    
    try {
      const response = await apiService.getCameraDetails(selectedCamera.idCamera);
      if (response.success && response.data) {
        setSelectedCamera(response.data);
        setIncidents(response.data.incidents || []);
        setMutations(response.data.mutations || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCameraDetails();
    setRefreshing(false);
  };

  const handleBack = () => {
    router.back();
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'en_ligne': return colors.success;
      case 'hors_ligne': return colors.danger;
      case 'maintenance': return colors.warning;
      default: return colors.secondary[500];
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'en_ligne': return <Wifi size={20} color={colors.success} />;
      case 'hors_ligne': return <WifiOff size={20} color={colors.danger} />;
      case 'maintenance': return <Settings size={20} color={colors.warning} />;
      default: return <Camera size={20} color={colors.secondary[500]} />;
    }
  };

  if (!selectedCamera) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Caméra non trouvée</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          title=""
          onPress={handleBack}
          variant="outline"
          style={styles.backButton}
          textStyle={{ color: colors.white }}
        >
          <ArrowLeft size={20} color={colors.white} />
        </Button>
        <Text style={styles.headerTitle}>Détails Caméra</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Informations principales */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.statusContainer}>
              {getStatusIcon(selectedCamera.statut)}
              <Text style={[styles.status, { color: getStatusColor(selectedCamera.statut) }]}>
                {(selectedCamera.statut || '').replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.cameraTitle}>
            Caméra #{selectedCamera.numeroSerie}
          </Text>

          <View style={styles.infoRow}>
            <MapPin size={16} color={colors.secondary[600]} />
            <Text style={styles.infoText}>
              {selectedCamera.zone} - {selectedCamera.emplacement}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Settings size={16} color={colors.secondary[600]} />
            <Text style={styles.infoText}>IP: {selectedCamera.adresseIP}</Text>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={16} color={colors.secondary[600]} />
            <Text style={styles.infoText}>
              Installée le {new Date(selectedCamera.dateInstallation).toLocaleDateString('fr-FR')}
            </Text>
          </View>

          {selectedCamera.technicien && (
            <View style={styles.infoRow}>
              <User size={16} color={colors.secondary[600]} />
              <Text style={styles.infoText}>
                Technicien: {selectedCamera.technicien.prenom} {selectedCamera.technicien.nom}
              </Text>
            </View>
          )}
        </Card>

        {/* Incidents récents */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Incidents récents</Text>
          {incidents.length > 0 ? (
            incidents.slice(0, 5).map((incident: any, index: number) => (
              <View key={index} style={styles.incidentItem}>
                <View style={styles.incidentHeader}>
                  <AlertTriangle size={16} color={colors.warning} />
                  <Text style={styles.incidentType}>{incident.typeIncident}</Text>
                  <Text style={styles.incidentDate}>
                    {new Date(incident.dateHeure).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                <Text style={styles.incidentDescription} numberOfLines={2}>
                  {incident.description}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Aucun incident enregistré</Text>
          )}
        </Card>

        {/* Historique des mutations */}
        {mutations.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Historique des mutations</Text>
            {mutations.slice(0, 3).map((mutation: any, index: number) => (
              <View key={index} style={styles.mutationItem}>
                <Text style={styles.mutationDate}>
                  {new Date(mutation.dateMutation).toLocaleDateString('fr-FR')}
                </Text>
                <Text style={styles.mutationText}>
                  Transférée à {mutation.technicien?.prenom} {mutation.technicien?.nom}
                </Text>
                {mutation.motif && (
                  <Text style={styles.mutationMotif}>Motif: {mutation.motif}</Text>
                )}
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  header: {
    backgroundColor: colors.primary[500],
    padding: isTablet ? 30 : 20,
    paddingTop: isTablet ? 60 : 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  cameraTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textBase,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: colors.secondary[700],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textBase,
    marginBottom: 12,
  },
  incidentItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary[200],
    paddingBottom: 12,
    marginBottom: 12,
  },
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  incidentType: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textBase,
    flex: 1,
  },
  incidentDate: {
    fontSize: 12,
    color: colors.secondary[500],
  },
  incidentDescription: {
    fontSize: 14,
    color: colors.secondary[600],
    lineHeight: 20,
  },
  mutationItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary[200],
    paddingBottom: 8,
    marginBottom: 8,
  },
  mutationDate: {
    fontSize: 12,
    color: colors.secondary[500],
    marginBottom: 2,
  },
  mutationText: {
    fontSize: 14,
    color: colors.textBase,
    fontWeight: '500',
  },
  mutationMotif: {
    fontSize: 12,
    color: colors.secondary[600],
    fontStyle: 'italic',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: colors.secondary[500],
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    marginTop: 50,
  },
});
