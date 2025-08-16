import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  StyleSheet,
  Alert,
} from 'react-native';
import { Edit, Trash2, Eye, RotateCcw } from 'lucide-react-native';
import { colors } from '@/theme/colors';

interface SwipeableListItemProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onRestore?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canView?: boolean;
  canRestore?: boolean;
  isDeleted?: boolean;
  itemName?: string;
}

export default function SwipeableListItem({
  children,
  onEdit,
  onDelete,
  onView,
  onRestore,
  canEdit = true,
  canDelete = true,
  canView = true,
  canRestore = false,
  isDeleted = false,
  itemName = 'cet élément',
}: SwipeableListItemProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);

  const handleGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    const { translationX } = event.nativeEvent;
    const newValue = lastOffset.current + translationX;
    
    // Limiter le swipe à gauche seulement (valeurs négatives)
    if (newValue <= 0) {
      translateX.setValue(Math.max(newValue, -200));
    }
  };

  const handleGestureEnd = (event: PanGestureHandlerGestureEvent) => {
    const { translationX, velocityX } = event.nativeEvent;
    const newValue = lastOffset.current + translationX;

    // Si on a swipé assez loin ou assez vite, révéler les actions
    if (newValue < -80 || velocityX < -500) {
      Animated.spring(translateX, {
        toValue: -160,
        useNativeDriver: true,
      }).start();
      lastOffset.current = -160;
    } else {
      // Sinon, revenir à la position initiale
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      lastOffset.current = 0;
    }
  };

  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    lastOffset.current = 0;
  };

  const handleEdit = () => {
    resetPosition();
    onEdit?.();
  };

  const handleDelete = () => {
    resetPosition();
    
    const title = isDeleted ? 'Supprimer définitivement' : 'Supprimer';
    const message = isDeleted 
      ? `Êtes-vous sûr de vouloir supprimer définitivement ${itemName} ? Cette action est irréversible.`
      : `Êtes-vous sûr de vouloir supprimer ${itemName} ?`;

    Alert.alert(
      title,
      message,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: isDeleted ? 'Supprimer définitivement' : 'Supprimer', 
          style: 'destructive',
          onPress: onDelete 
        },
      ]
    );
  };

  const handleView = () => {
    resetPosition();
    onView?.();
  };

  const handleRestore = () => {
    resetPosition();
    
    Alert.alert(
      'Restaurer',
      `Êtes-vous sûr de vouloir restaurer ${itemName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Restaurer', onPress: onRestore },
      ]
    );
  };

  const renderActions = () => {
    const actions = [];

    if (canView && onView) {
      actions.push(
        <TouchableOpacity
          key="view"
          style={[styles.actionButton, styles.viewButton]}
          onPress={handleView}
        >
          <Eye size={20} color="#fff" />
        </TouchableOpacity>
      );
    }

    if (!isDeleted && canEdit && onEdit) {
      actions.push(
        <TouchableOpacity
          key="edit"
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
        >
          <Edit size={20} color="#fff" />
        </TouchableOpacity>
      );
    }

    if (isDeleted && canRestore && onRestore) {
      actions.push(
        <TouchableOpacity
          key="restore"
          style={[styles.actionButton, styles.restoreButton]}
          onPress={handleRestore}
        >
          <RotateCcw size={20} color="#fff" />
        </TouchableOpacity>
      );
    }

    if (canDelete && onDelete) {
      actions.push(
        <TouchableOpacity
          key="delete"
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Trash2 size={20} color="#fff" />
        </TouchableOpacity>
      );
    }

    return actions;
  };

  return (
    <View style={styles.container}>
      {/* Actions cachées */}
      <View style={styles.actionsContainer}>
        {renderActions()}
      </View>

      {/* Contenu principal */}
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onEnded={handleGestureEnd}
      >
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.itemContent}
            onPress={() => {
              if (lastOffset.current !== 0) {
                resetPosition();
              } else {
                onView?.();
              }
            }}
            activeOpacity={0.7}
          >
            {children}
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#fff',
    marginVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    width: 160,
  },
  actionButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  viewButton: {
    backgroundColor: colors.primary[500],
  },
  editButton: {
    backgroundColor: '#3b82f6',
  },
  restoreButton: {
    backgroundColor: '#10b981',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  itemContent: {
    padding: 16,
  },
});
