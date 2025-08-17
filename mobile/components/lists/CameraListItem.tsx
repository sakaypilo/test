import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Camera } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { apiService } from '@/services/api';
import SimpleActionButtons from '@/components/ui/SimpleActionButtons';
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle,
  MapPin,
  Calendar
} from 'lucide-react-native';

interface CameraListItemProps {
  camera: Camera;
  onPress?: () => void;
  onRefresh?: () => void;
}

export default function CameraListItem({ 
  camera, 
  onPress, 
  onRefresh 
}: CameraListItemProps) {
  const { user } = useAuthStore();

  const canDelete = () => {
    if (!user) return false;
    
    // Admin peut supprimer toutes les caméras
    if (user.role === 'admin') return true;
    
    // Responsable peut supprimer toutes les caméras
    if (user.role === 'responsable') return true;
    
    // Technicien peut supprimer les caméras (selon les besoins métier)
    if (user.role === 'technicien') return true;
    
    return false;
  };

  const canView = () => {
    // Tous les utilisateurs connectés peuvent voir les détails
    return !!user;
  };

  const handleDelete = async () => {
    try {
      const response = await apiService.deleteCamera(
        (camera.idCamera || camera.id).toString(),
        'Suppression depuis l\'application mobile'
      );
      
      if (response.success) {
        // Rafraîchir immédiatement la liste
        if (onRefresh) {
          onRefresh();
        }
        
        Alert.alert(
          'Succès',
          'Caméra déplacée vers la corbeille avec succès',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Erreur', response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression caméra:', error);
      Alert.alert('Erreur', 'Erreur de connexion lors de la suppression');
    }
  };

  const getStatusIcon = () => {
    switch (camera.statut) {
      case 'en_ligne':
        return <Wifi size={16} color="#10b981" />;
      case 'hors_ligne':
        return <WifiOff size={16} color="#ef4444" />;
      case 'maintenance':
        return <AlertTriangle size={16} color="#f59e0b" />;
      default:
        return <WifiOff size={16} color="#6b7280" />;
    }
  };

  const getStatusColor = () => {
    switch (camera.statut) {
      case 'en_ligne':
        return '#10b981';
      case 'hors_ligne':
        return '#ef4444';
      case 'maintenance':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (camera.statut) {
      case 'en_ligne':
        return 'En ligne';
      case 'hors_ligne':
        return 'Hors ligne';
      case 'maintenance':
        return 'Maintenance';
      default:
        return 'Inconnu';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.numero}>Caméra {camera.numero}</Text>
          <View style={styles.statusContainer}>
            {getStatusIcon()}
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <MapPin size={14} color="#6b7280" />
          <Text style={styles.infoText}>
            {camera.zone} - {camera.emplacement}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>IP:</Text>
          <Text style={styles.infoValue}>{camera.ip}</Text>
        </View>

        <View style={styles.infoRow}>
          <Calendar size={14} color="#6b7280" />
          <Text style={styles.infoText}>
            Installée le {camera.dateInstallation.toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <SimpleActionButtons
          onView={canView() ? onPress : undefined}
          onDelete={canDelete() ? handleDelete : undefined}
          canView={canView()}
          canDelete={canDelete()}
          itemName={`la caméra ${camera.numero}`}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#00A550',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  numero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  content: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    minWidth: 30,
  },
  infoValue: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    fontFamily: 'monospace',
  },
  actions: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
});
