import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuthStore } from '@/stores/auth';
import { apiService } from '@/services/api';
import SimpleActionButtons from '@/components/ui/SimpleActionButtons';
import { 
  User, 
  CreditCard, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react-native';

interface PersonneListItemProps {
  personne: any; // Type Laravel direct
  onPress?: () => void;
  onRefresh?: () => void;
}

export default function PersonneListItem({ 
  personne, 
  onPress, 
  onRefresh 
}: PersonneListItemProps) {
  const { user } = useAuthStore();

  const canDelete = () => {
    if (!user) return false;
    
    // Admin peut supprimer toutes les personnes
    if (user.role === 'admin') return true;
    
    // Responsable peut supprimer toutes les personnes
    if (user.role === 'responsable') return true;
    
    // Agent peut supprimer les personnes qu'il a ajoutées (selon les besoins métier)
    if (user.role === 'agent') return true;
    
    return false;
  };

  const canView = () => {
    // Tous les utilisateurs connectés peuvent voir les détails
    return !!user;
  };

  const handleDelete = async () => {
    try {
      const response = await apiService.deletePerson(
        (personne.idPersonne || personne.id).toString(),
        'Suppression depuis l\'application mobile'
      );
      
      if (response.success) {
        // Rafraîchir immédiatement la liste
        if (onRefresh) {
          onRefresh();
        }
        
        Alert.alert(
          'Succès',
          'Personne déplacée vers la corbeille avec succès',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Erreur', response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression personne:', error);
      Alert.alert('Erreur', 'Erreur de connexion lors de la suppression');
    }
  };

  const getStatusIcon = () => {
    switch (personne.statut?.toLowerCase()) {
      case 'libre':
        return <CheckCircle size={16} color="#10b981" />;
      case 'detenu':
        return <XCircle size={16} color="#ef4444" />;
      case 'recherche':
        return <AlertTriangle size={16} color="#f59e0b" />;
      default:
        return <User size={16} color="#6b7280" />;
    }
  };

  const getStatusColor = () => {
    switch (personne.statut?.toLowerCase()) {
      case 'libre':
        return '#10b981';
      case 'detenu':
        return '#ef4444';
      case 'recherche':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (personne.statut?.toLowerCase()) {
      case 'libre':
        return 'Libre';
      case 'detenu':
        return 'Détenu';
      case 'recherche':
        return 'Recherché';
      default:
        return personne.statut || 'Inconnu';
    }
  };

  const getInterpellationsCount = () => {
    return personne.interpellations?.length || 0;
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.nom}>
            {personne.prenom} {personne.nom}
          </Text>
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
          <CreditCard size={14} color="#6b7280" />
          <Text style={styles.infoText}>
            CIN: {personne.CIN || 'Non renseigné'}
          </Text>
        </View>

        {personne.faitAssocie && (
          <View style={styles.infoRow}>
            <AlertTriangle size={14} color="#f59e0b" />
            <Text style={styles.infoText}>
              Fait associé: {personne.faitAssocie}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <User size={14} color="#6b7280" />
          <Text style={styles.infoText}>
            {getInterpellationsCount()} interpellation(s)
          </Text>
        </View>

        {personne.dateCreation && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ajouté le:</Text>
            <Text style={styles.infoValue}>
              {new Date(personne.dateCreation).toLocaleDateString('fr-FR')}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <SimpleActionButtons
          onView={canView() ? onPress : undefined}
          onDelete={canDelete() ? handleDelete : undefined}
          canView={canView()}
          canDelete={canDelete()}
          itemName={`${personne.prenom} ${personne.nom}`}
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
    borderLeftColor: '#3b82f6',
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
  nom: {
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
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  actions: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
});
