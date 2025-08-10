import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { Camera } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { MapPin, Wifi } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

interface CameraFormProps {
  camera?: Camera;
  onSubmit: (cameraData: Omit<Camera, 'id'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CameraForm({
  camera,
  onSubmit,
  onCancel,
  isLoading = false,
}: CameraFormProps) {
  const [formData, setFormData] = useState({
    numero: camera?.numero || '',
    zone: camera?.zone || '',
    emplacement: camera?.emplacement || '',
    ip: camera?.ip || '',
    statut: camera?.statut || 'hors_ligne' as const,
    dateInstallation: camera?.dateInstallation || new Date(),
    latitude: camera?.latitude || 0,
    longitude: camera?.longitude || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.numero.trim()) {
      newErrors.numero = 'Le numéro de caméra est requis';
    }

    if (!formData.zone.trim()) {
      newErrors.zone = 'La zone est requise';
    }

    if (!formData.emplacement.trim()) {
      newErrors.emplacement = 'L\'emplacement est requis';
    }

    if (!formData.ip.trim()) {
      newErrors.ip = 'L\'adresse IP est requise';
    } else if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(formData.ip.trim())) {
      newErrors.ip = 'Format d\'adresse IP invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'L\'accès à la localisation est nécessaire pour enregistrer la position de la caméra.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setFormData(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }));

      Alert.alert('Succès', 'Position géographique mise à jour');
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Impossible d\'obtenir la position actuelle. Vérifiez vos paramètres de localisation.'
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const cameraData: Omit<Camera, 'id'> = {
      ...formData,
      historiquePannes: camera?.historiquePannes || [],
      historiqueMutations: camera?.historiqueMutations || [],
    };

    onSubmit(cameraData);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>
          {camera ? 'Modifier la Caméra' : 'Nouvelle Caméra'}
        </Text>

        <Input
          label="Numéro de caméra"
          value={formData.numero}
          onChangeText={(text) => setFormData(prev => ({ ...prev, numero: text }))}
          placeholder="Ex: CAM-001"
          error={errors.numero}
          required
        />

        <Input
          label="Zone"
          value={formData.zone}
          onChangeText={(text) => setFormData(prev => ({ ...prev, zone: text }))}
          placeholder="Ex: Zone Conteneurs"
          error={errors.zone}
          required
        />

        <Input
          label="Emplacement"
          value={formData.emplacement}
          onChangeText={(text) => setFormData(prev => ({ ...prev, emplacement: text }))}
          placeholder="Ex: Entrée principale, poteau 5"
          error={errors.emplacement}
          required
        />

        <Input
          label="Adresse IP"
          value={formData.ip}
          onChangeText={(text) => setFormData(prev => ({ ...prev, ip: text }))}
          placeholder="Ex: 192.168.1.100"
          error={errors.ip}
          required
          keyboardType="numeric"
        />

        <View style={styles.statusSection}>
          <Text style={styles.statusLabel}>Statut de la caméra</Text>
          <View style={styles.statusOptions}>
            {(['en_ligne', 'hors_ligne', 'maintenance'] as const).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  formData.statut === status && styles.statusOptionActive,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, statut: status }))}
              >
                <Wifi 
                  size={16} 
                  color={formData.statut === status ? '#ffffff' : '#64748b'} 
                />
                <Text
                  style={[
                    styles.statusOptionText,
                    formData.statut === status && styles.statusOptionTextActive,
                  ]}
                >
                  {status === 'en_ligne' ? 'En ligne' : 
                   status === 'hors_ligne' ? 'Hors ligne' : 'Maintenance'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.locationSection}>
          <Text style={styles.locationLabel}>Position géographique</Text>
          <Text style={styles.locationHelp}>
            Position actuelle: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
          </Text>
          
          <Button
            title="Obtenir la position actuelle"
            onPress={getCurrentLocation}
            variant="outline"
            loading={isGettingLocation}
            disabled={isGettingLocation}
            style={styles.locationButton}
          />
        </View>

        <View style={styles.formActions}>
          <Button
            title="Annuler"
            onPress={onCancel}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title={camera ? 'Modifier' : 'Ajouter'}
            onPress={handleSubmit}
            variant="primary"
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  formCard: {
    margin: 20,
    padding: isTablet ? 30 : 20,
  },
  formTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 30,
  },
  statusSection: {
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flex: 1,
    minWidth: isTablet ? 150 : 100,
    justifyContent: 'center',
  },
  statusOptionActive: {
    backgroundColor: '#1e40af',
    borderColor: '#1e40af',
  },
  statusOptionText: {
    fontSize: isTablet ? 14 : 12,
    color: '#64748b',
    marginLeft: 8,
    fontWeight: '500',
  },
  statusOptionTextActive: {
    color: '#ffffff',
  },
  locationSection: {
    marginBottom: 20,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  locationHelp: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  locationButton: {
    alignSelf: 'flex-start',
  },
  formActions: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});