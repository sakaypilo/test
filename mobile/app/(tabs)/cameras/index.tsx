import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useCamerasStore } from '@/stores/cameras';
import { apiService } from '@/services/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { Camera, MapPin, Plus, Wifi, WifiOff, Wrench } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function CamerasScreen() {
  const {
    cameras,
    setCameras,
    setSelectedCamera,
    isLoading,
    error,
    setLoading,
    setError,
  } = useCamerasStore();
  
  const [refreshing, setRefreshing] = useState(false);

  const loadCameras = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await apiService.getCameras();
      
      if (response.success && response.data) {
        setCameras(response.data);
      } else {
        setError(response.message || 'Erreur lors du chargement');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur Laravel');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCameras();
  }, []);

  const onRefresh = () => {
    loadCameras(true);
  };

  const handleCameraPress = (camera: any) => {
    setSelectedCamera(camera);
    router.push('/(tabs)/cameras/details');
  };

  const handleAddCamera = () => {
    router.push('/(tabs)/cameras/add');
  };

  const handleViewMap = () => {
    router.push('/(tabs)/cameras/map');
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'en_ligne': return '#10b981';
      case 'hors_ligne': return '#dc2626';
      case 'maintenance': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'en_ligne': return <Wifi size={20} color="#10b981" />;
      case 'hors_ligne': return <WifiOff size={20} color="#dc2626" />;
      case 'maintenance': return <Wrench size={20} color="#f59e0b" />;
      default: return <Camera size={20} color="#64748b" />;
    }
  };

  if (isLoading && !cameras.length) {
    return <LoadingSpinner message="Chargement des caméras..." />;
  }

  if (error && !cameras.length) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={() => loadCameras()} 
      />
    );
  }

  const camerasEnLigne = cameras.filter(c => c.statut === 'en_ligne').length;
  const camerasHorsLigne = cameras.filter(c => c.statut === 'hors_ligne').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestion des Caméras</Text>
        <Text style={styles.subtitle}>
          {cameras.length} caméras • {camerasEnLigne} en ligne • {camerasHorsLigne} hors ligne
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <Button
          title="Ajouter Caméra"
          onPress={handleAddCamera}
          variant="primary"
          style={styles.addButton}
        />
        <Button
          title="Vue Carte"
          onPress={handleViewMap}
          variant="outline"
          style={styles.mapButton}
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {cameras.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Camera size={64} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Aucune caméra</Text>
            <Text style={styles.emptyMessage}>
              Commencez par ajouter votre première caméra de surveillance
            </Text>
            <Button
              title="Ajouter une caméra"
              onPress={handleAddCamera}
              variant="primary"
              style={styles.emptyButton}
            />
          </Card>
        ) : (
          <View style={styles.camerasGrid}>
            {cameras.map((camera) => (
              <TouchableOpacity
                key={camera.id}
                onPress={() => handleCameraPress(camera)}
                activeOpacity={0.8}
              >
                <Card style={styles.cameraCard}>
                  <View style={styles.cameraHeader}>
                    <View style={styles.cameraInfo}>
                      <Text style={styles.cameraNumber}>{camera.numero}</Text>
                      <Text style={styles.cameraZone}>{camera.zone}</Text>
                    </View>
                    <View style={styles.statusContainer}>
                      {getStatusIcon(camera.statut)}
                    </View>
                  </View>
                  
                  <View style={styles.cameraDetails}>
                    <View style={styles.detailRow}>
                      <MapPin size={16} color="#64748b" />
                      <Text style={styles.detailText}>{camera.emplacement}</Text>
                    </View>
                    <Text style={styles.ipText}>{camera.ip}</Text>
                  </View>
                  
                  <View style={styles.statusBadge}>
                    <Text style={[styles.statusText, { color: getStatusColor(camera.statut) }]}>
                      {(camera.statut || '').replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                  
                  {camera.historiquePannes.filter(p => p.statut === 'en_cours').length > 0 && (
                    <View style={styles.alertBadge}>
                      <AlertTriangle size={16} color="#dc2626" />
                      <Text style={styles.alertText}>
                        {camera.historiquePannes.filter(p => p.statut === 'en_cours').length} panne(s)
                      </Text>
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#00A550', // primary.500
    padding: isTablet ? 30 : 20,
    paddingTop: isTablet ? 60 : 50,
  },
  title: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: isTablet ? 16 : 14,
    color: '#bbf7d0', // primary.200
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  addButton: {
    flex: 1,
  },
  mapButton: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  emptyCard: {
    alignItems: 'center',
    margin: 20,
    padding: 40,
  },
  emptyTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: isTablet ? 16 : 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  emptyButton: {
    paddingHorizontal: 30,
  },
  camerasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 15,
  },
  cameraCard: {
    width: isTablet ? (width - 60) / 3 - 10 : (width - 50) / 2 - 7.5,
    padding: 16,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cameraInfo: {
    flex: 1,
  },
  cameraNumber: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  cameraZone: {
    fontSize: isTablet ? 14 : 12,
    color: '#64748b',
    marginTop: 2,
  },
  statusContainer: {
    marginLeft: 10,
  },
  cameraDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: isTablet ? 14 : 12,
    color: '#475569',
    marginLeft: 6,
    flex: 1,
  },
  ipText: {
    fontSize: isTablet ? 12 : 10,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  statusText: {
    fontSize: isTablet ? 12 : 10,
    fontWeight: '600',
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fef2f2',
    borderRadius: 6,
  },
  alertText: {
    fontSize: isTablet ? 12 : 10,
    color: '#dc2626',
    marginLeft: 4,
    fontWeight: '500',
  },
});