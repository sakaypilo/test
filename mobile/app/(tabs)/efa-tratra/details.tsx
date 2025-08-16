import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { usePersonnesStore } from '@/stores/personnes';
import { apiService } from '@/services/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { 
  ArrowLeft, 
  User, 
  IdCard, 
  Calendar, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function PersonneDetailsScreen() {
  const { selectedPersonne, setSelectedPersonne } = usePersonnesStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!selectedPersonne) {
      router.back();
      return;
    }
    loadPersonneDetails();
  }, [selectedPersonne]);

  const loadPersonneDetails = async () => {
    if (!selectedPersonne) return;
    
    try {
      const response = await apiService.getPersonneDetails(selectedPersonne.idPersonne);
      if (response.success && response.data) {
        setSelectedPersonne(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPersonneDetails();
    setRefreshing(false);
  };

  const handleBack = () => {
    router.back();
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'interne': return colors.primary[500];
      case 'externe': return colors.secondary[500];
      default: return colors.secondary[400];
    }
  };

  const getInterpellationStatusColor = (statut: string) => {
    switch (statut) {
      case 'en_garde_a_vue': return colors.danger;
      case 'libere': return colors.success;
      case 'transfere': return colors.warning;
      default: return colors.secondary[500];
    }
  };

  const getInterpellationStatusIcon = (statut: string) => {
    switch (statut) {
      case 'en_garde_a_vue': return <AlertTriangle size={16} color={colors.danger} />;
      case 'libere': return <CheckCircle size={16} color={colors.success} />;
      case 'transfere': return <Clock size={16} color={colors.warning} />;
      default: return <FileText size={16} color={colors.secondary[500]} />;
    }
  };

  if (!selectedPersonne) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Personne non trouvée</Text>
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
        <Text style={styles.headerTitle}>Détails Personne</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Informations personnelles */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.personInfo}>
              {selectedPersonne.photo ? (
                <Image
                  source={{ uri: selectedPersonne.photo }}
                  style={styles.photo}
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <User size={40} color={colors.secondary[400]} />
                </View>
              )}
              <View style={styles.nameContainer}>
                <Text style={styles.personName}>
                  {selectedPersonne.prenom} {selectedPersonne.nom}
                </Text>
                <View style={styles.statutContainer}>
                  <Text style={[styles.statut, { color: getStatutColor(selectedPersonne.statut) }]}>
                    {(selectedPersonne.statut || '').toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <IdCard size={16} color={colors.secondary[600]} />
            <Text style={styles.infoText}>CIN: {selectedPersonne.CIN}</Text>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={16} color={colors.secondary[600]} />
            <Text style={styles.infoText}>
              Enregistré le {new Date(selectedPersonne.created_at).toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </Card>

        {/* Interpellations */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Historique des interpellations</Text>
          {selectedPersonne.interpellations && selectedPersonne.interpellations.length > 0 ? (
            selectedPersonne.interpellations.map((interpellation, index) => (
              <View key={index} style={styles.interpellationItem}>
                <View style={styles.interpellationHeader}>
                  <View style={styles.interpellationStatus}>
                    {getInterpellationStatusIcon(interpellation.statut)}
                    <Text style={[
                      styles.interpellationStatusText,
                      { color: getInterpellationStatusColor(interpellation.statut) }
                    ]}>
                      {(interpellation.statut || '').replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.interpellationDate}>
                    {new Date(interpellation.dateHeure).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                
                <Text style={styles.interpellationFait}>
                  Fait: {interpellation.faitAssocie}
                </Text>
                
                <Text style={styles.interpellationTime}>
                  {new Date(interpellation.dateHeure).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Aucune interpellation enregistrée</Text>
          )}
        </Card>

        {/* Actions */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionsContainer}>
            <Button
              title="Nouvelle interpellation"
              onPress={() => {
                // Navigate to add interpellation
                router.push(`/(tabs)/efa-tratra/add-interpellation?personneId=${selectedPersonne.idPersonne}`);
              }}
              variant="primary"
              style={styles.actionButton}
            />
            
            <Button
              title="Générer rapport"
              onPress={() => {
                // Navigate to generate report
                Alert.alert('Info', 'Fonctionnalité en cours de développement');
              }}
              variant="outline"
              style={styles.actionButton}
            />
          </View>
        </Card>
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
    marginBottom: 16,
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameContainer: {
    flex: 1,
  },
  personName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textBase,
    marginBottom: 4,
  },
  statutContainer: {
    alignSelf: 'flex-start',
  },
  statut: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.secondary[100],
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
  interpellationItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary[200],
    paddingBottom: 12,
    marginBottom: 12,
  },
  interpellationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  interpellationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  interpellationStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  interpellationDate: {
    fontSize: 12,
    color: colors.secondary[500],
  },
  interpellationFait: {
    fontSize: 14,
    color: colors.textBase,
    marginBottom: 4,
  },
  interpellationTime: {
    fontSize: 12,
    color: colors.secondary[500],
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    width: '100%',
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
