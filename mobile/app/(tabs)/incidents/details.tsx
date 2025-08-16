import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useIncidentsStore } from '@/stores/incidents';
import { apiService } from '@/services/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { 
  ArrowLeft, 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  User, 
  Camera,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function IncidentDetailsScreen() {
  const { selectedIncident, setSelectedIncident } = useIncidentsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Délai pour permettre au store de se synchroniser
    const timer = setTimeout(() => {
      setIsInitialized(true);
      if (!selectedIncident) {
        router.back();
        return;
      }
      loadIncidentDetails();
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedIncident]);

  const loadIncidentDetails = async () => {
    if (!selectedIncident) return;

    try {
      const response = await apiService.getIncidentDetails(selectedIncident.id);
      if (response.success && response.data) {
        setSelectedIncident(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIncidentDetails();
    setRefreshing(false);
  };

  const handleBack = () => {
    router.back();
  };



  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return colors.warning;
      case 'valide': return colors.success;
      case 'rejete': return colors.danger;
      default: return colors.secondary[500];
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'en_attente': return <Clock size={20} color={colors.warning} />;
      case 'valide': return <CheckCircle size={20} color={colors.success} />;
      case 'rejete': return <XCircle size={20} color={colors.danger} />;
      default: return <AlertTriangle size={20} color={colors.secondary[500]} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vol': return colors.danger;
      case 'bagarre': return colors.warning;
      case 'accident': return colors.primary[600];
      default: return colors.secondary[500];
    }
  };

  const renderPhotos = () => {
    if (!selectedIncident?.photos || selectedIncident.photos.length === 0) {
      return [];
    }

    return selectedIncident.photos.map((photoUrl, index) => (
      <Image
        key={`detail-photo-${index}-${photoUrl.split('/').pop()}`}
        source={{ uri: photoUrl }}
        style={styles.photo}
        resizeMode="cover"
      />
    ));
  };

  if (!isInitialized || !selectedIncident) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            title=""
            onPress={handleBack}
            variant="outline"
            style={styles.backButton}
          >
            <ArrowLeft size={20} color={colors.white} />
          </Button>
          <Text style={styles.headerTitle}>
            {!isInitialized ? 'Chargement...' : 'Incident non trouvé'}
          </Text>
          <View style={styles.placeholder} />
        </View>
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
        >
          <ArrowLeft size={20} color={colors.white} />
        </Button>
        <Text style={styles.headerTitle}>Détails Incident</Text>
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
            <View style={styles.typeContainer}>
              <AlertTriangle size={20} color={getTypeColor(selectedIncident.type)} />
              <Text style={[styles.type, { color: getTypeColor(selectedIncident.type) }]}>
                {(selectedIncident.type || '').toUpperCase()}
              </Text>
            </View>
            <View style={styles.statusContainer}>
              {getStatusIcon(selectedIncident.statut)}
              <Text style={[styles.status, { color: getStatusColor(selectedIncident.statut) }]}>
                {(selectedIncident.statut || '').replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.incidentTitle}>
            Incident #{selectedIncident.id}
          </Text>

          <View style={styles.infoRow}>
            <Calendar size={16} color={colors.secondary[600]} />
            <Text style={styles.infoText}>
              {new Date(selectedIncident.dateHeure || selectedIncident.dateIncident).toLocaleString('fr-FR')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={16} color={colors.secondary[600]} />
            <Text style={styles.infoText}>Zone: {selectedIncident.zone}</Text>
          </View>

          {selectedIncident.camera && (
            <View style={styles.infoRow}>
              <Camera size={16} color={colors.secondary[600]} />
              <Text style={styles.infoText}>
                Caméra #{selectedIncident.camera.numeroSerie}
              </Text>
            </View>
          )}

          {selectedIncident.utilisateur && (
            <View style={styles.infoRow}>
              <User size={16} color={colors.secondary[600]} />
              <Text style={styles.infoText}>
                Rapporté par: {selectedIncident.utilisateur.prenom} {selectedIncident.utilisateur.nom}
              </Text>
            </View>
          )}
        </Card>

        {/* Description */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{selectedIncident.description}</Text>
        </Card>



        {/* Photos */}
        {renderPhotos().length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <View style={styles.photosContainer}>
              {renderPhotos()}
            </View>
          </Card>
        )}



        {/* Affichage alternatif si pas de photos */}
        {(!selectedIncident?.photos || selectedIncident.photos.length === 0) && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <Text style={styles.description}>Aucune photo disponible</Text>
          </Card>
        )}

        {/* Validation */}
        {selectedIncident.statut !== 'en_attente' && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Validation</Text>
            <View style={styles.validationInfo}>
              <Text style={styles.validationDate}>
                Validé le {selectedIncident.dateValidation ? new Date(selectedIncident.dateValidation).toLocaleString('fr-FR') : 'Date inconnue'}
              </Text>
              {selectedIncident.validateur && (
                <Text style={styles.validationUser}>
                  Par: {selectedIncident.validateur.prenom} {selectedIncident.validateur.nom}
                </Text>
              )}
              {selectedIncident.commentaireValidation && (
                <Text style={styles.validationComment}>
                  Commentaire: {selectedIncident.commentaireValidation}
                </Text>
              )}
            </View>
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
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  type: {
    fontSize: 14,
    fontWeight: '600',
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
  incidentTitle: {
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
  description: {
    fontSize: 16,
    color: colors.secondary[700],
    lineHeight: 24,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photo: {
    width: (width - 80) / 3,
    height: (width - 80) / 3,
    borderRadius: 8,
  },
  validationInfo: {
    gap: 8,
  },
  validationDate: {
    fontSize: 14,
    color: colors.secondary[600],
    fontWeight: '500',
  },
  validationUser: {
    fontSize: 14,
    color: colors.secondary[700],
  },
  validationComment: {
    fontSize: 14,
    color: colors.secondary[700],
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    marginTop: 50,
  },
});
