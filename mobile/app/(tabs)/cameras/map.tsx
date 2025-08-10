import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useCamerasStore } from '@/stores/cameras';
import { getStatusColor } from '@/utils/helpers';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ArrowLeft, Wifi, WifiOff, Wrench } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function CamerasMapScreen() {
  const { cameras, setSelectedCamera } = useCamerasStore();
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  const initialRegion = {
    latitude: -18.1569, // Toamasina coordinates
    longitude: 49.4085,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const handleMarkerPress = (camera: any) => {
    setSelectedCameraId(camera.id);
  };

  const handleCalloutPress = (camera: any) => {
    setSelectedCamera(camera);
    router.push('/(tabs)/cameras/details');
  };

  const getMarkerColor = (statut: string) => {
    switch (statut) {
      case 'en_ligne': return '#10b981';
      case 'hors_ligne': return '#dc2626';
      case 'maintenance': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'en_ligne': return <Wifi size={16} color="#ffffff" />;
      case 'hors_ligne': return <WifiOff size={16} color="#ffffff" />;
      case 'maintenance': return <Wrench size={16} color="#ffffff" />;
      default: return <Wifi size={16} color="#ffffff" />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Carte des Caméras</Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {cameras.map((camera) => (
          <Marker
            key={camera.id}
            coordinate={{
              latitude: camera.latitude,
              longitude: camera.longitude,
            }}
            pinColor={getMarkerColor(camera.statut)}
            onPress={() => handleMarkerPress(camera)}
          >
            <Callout onPress={() => handleCalloutPress(camera)}>
              <View style={styles.callout}>
                <View style={styles.calloutHeader}>
                  <Text style={styles.calloutTitle}>{camera.numero}</Text>
                  <View style={[styles.statusIndicator, { backgroundColor: getMarkerColor(camera.statut) }]}>
                    {getStatusIcon(camera.statut)}
                  </View>
                </View>
                <Text style={styles.calloutZone}>{camera.zone}</Text>
                <Text style={styles.calloutLocation}>{camera.emplacement}</Text>
                <Text style={styles.calloutIP}>IP: {camera.ip}</Text>
                <Text style={styles.calloutTap}>Appuyez pour voir les détails</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.legend}>
        <Card style={styles.legendCard}>
          <Text style={styles.legendTitle}>Légende</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>En ligne</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#dc2626' }]} />
              <Text style={styles.legendText}>Hors ligne</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.legendText}>Maintenance</Text>
            </View>
          </View>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1e40af',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  map: {
    flex: 1,
  },
  callout: {
    width: 200,
    padding: 10,
  },
  calloutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calloutZone: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  calloutLocation: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  calloutIP: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
    marginTop: 5,
  },
  calloutTap: {
    fontSize: 11,
    color: '#1e40af',
    marginTop: 8,
    textAlign: 'center',
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  legendCard: {
    padding: 12,
    minWidth: 120,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  legendItems: {
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#475569',
  },
});