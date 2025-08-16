import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { AlertTriangle, Calendar, MapPin, Clock, CheckCircle } from 'lucide-react-native';
import SimpleActionButtons from '@/components/ui/SimpleActionButtons';
import { colors } from '@/theme/colors';
import { apiService } from '@/services/api';
import { useIncidentsStore } from '@/stores/incidents';
import { useAuthStore } from '@/stores/auth';

interface IncidentListItemProps {
  incident: any;
  onRefresh?: () => void;
}

export default function IncidentListItem({ incident, onRefresh }: IncidentListItemProps) {
  const { user } = useAuthStore();
  const { setSelectedIncident } = useIncidentsStore();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vol': return '#dc2626';
      case 'bagarre': return '#f59e0b';
      case 'accident': return colors.primary[600];
      default: return '#64748b';
    }
  };

  const getTypeIcon = (type: string) => {
    return <AlertTriangle size={20} color={getTypeColor(type)} />;
  };



  const canDelete = () => {
    if (!user) return false;

    // Admin peut supprimer tous les incidents
    if (user.role === 'admin') return true;

    // Responsable peut supprimer tous les incidents
    if (user.role === 'responsable') return true;

    // Agent peut supprimer ses propres incidents
    if (user.role === 'agent' && incident.idUtilisateur === user.idUtilisateur) return true;

    return false;
  };

  const handleView = () => {
    setSelectedIncident(incident);
    router.push('/(tabs)/incidents/details');
  };



  const handleDelete = async () => {
    try {
      const response = await apiService.deleteIncident(
        (incident.idIncident || incident.id).toString(),
        'Suppression depuis l\'application mobile'
      );

      if (response.success) {
        // Rafraîchir immédiatement la liste
        if (onRefresh) {
          onRefresh();
        }

        Alert.alert(
          'Succès',
          'Incident déplacé vers la corbeille avec succès',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Erreur', response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression incident:', error);
      Alert.alert('Erreur', 'Erreur de connexion lors de la suppression');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          {getTypeIcon(incident.type)}
          <Text style={[styles.typeText, { color: getTypeColor(incident.type) }]}>
            {(incident.type || '').toUpperCase()}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          {incident.statut === 'en_cours' ? (
            <Clock size={16} color="#f59e0b" />
          ) : (
            <CheckCircle size={16} color="#10b981" />
          )}
        </View>
      </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {incident.description}
        </Text>
        
        <View style={styles.meta}>
          <View style={styles.metaRow}>
            <Calendar size={14} color="#64748b" />
            <Text style={styles.metaText}>
              {new Date(incident.dateIncident).toLocaleDateString('fr-FR')}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <MapPin size={14} color="#64748b" />
            <Text style={styles.metaText}>{incident.zone}</Text>
          </View>
        </View>
        
        {incident.photos && incident.photos.length > 0 && (
          <View style={styles.photosIndicator}>
            <Text style={styles.photosText}>
              📷 {incident.photos.length} photo(s)
            </Text>
          </View>
        )}

      {incident.isDeleted && (
        <View style={styles.deletedBadge}>
          <Text style={styles.deletedText}>Supprimé</Text>
        </View>
      )}

      {/* Boutons d'actions */}
      <View style={styles.actionsContainer}>
        <SimpleActionButtons
          onView={handleView}
          onDelete={canDelete() ? handleDelete : undefined}
          canDelete={canDelete()}
          canView={true}
          itemName={`l'incident ${incident.type || 'inconnu'}`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusContainer: {
    padding: 4,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  meta: {
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 6,
  },
  photosIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  photosText: {
    fontSize: 12,
    color: colors.primary[600],
    fontWeight: '500',
  },
  deletedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deletedText: {
    fontSize: 10,
    color: '#dc2626',
    fontWeight: '600',
  },
  actionsContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});
