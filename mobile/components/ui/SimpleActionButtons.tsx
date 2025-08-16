import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Trash2, Eye } from 'lucide-react-native';
import { colors } from '@/theme/colors';

interface SimpleActionButtonsProps {
  onDelete?: () => void;
  onView?: () => void;
  canDelete?: boolean;
  canView?: boolean;
  itemName?: string;
}

export default function SimpleActionButtons({
  onDelete,
  onView,
  canDelete = true,
  canView = true,
  itemName = 'cet élément',
}: SimpleActionButtonsProps) {

  const handleDelete = () => {
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer ${itemName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: onDelete 
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {canView && onView && (
        <TouchableOpacity
          style={[styles.button, styles.viewButton]}
          onPress={onView}
        >
          <Eye size={16} color="#fff" />
        </TouchableOpacity>
      )}



      {canDelete && onDelete && (
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Trash2 size={16} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: colors.primary[500],
  },

  deleteButton: {
    backgroundColor: '#ef4444',
  },
});
