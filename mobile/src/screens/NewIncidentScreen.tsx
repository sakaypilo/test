import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  ActivityIndicator,
  Menu,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { incidentsAPI, camerasAPI } from '../services/api';
import { colors } from '../theme/theme';

export default function NewIncidentScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [zoneMenuVisible, setZoneMenuVisible] = useState(false);
  
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    typeIncident: '',
    description: '',
    zone: '',
    idCamera: '',
    photos: [] as string[],
  });

  const incidentTypes = [
    'Intrusion',
    'Vol suspect',
    'Vandalisme',
    'Bagarre',
    'Accident',
    'Autre'
  ];

  const zones = [
    'Zone Portuaire Nord',
    'Zone Portuaire Sud',
    'Zone Administrative',
    'Zone de Stockage',
    'Parking'
  ];

  useEffect(() => {
    loadCameras();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'L\'accès à la galerie photo est nécessaire pour ajouter des photos.'
      );
    }
  };

  const loadCameras = async () => {
    try {
      const response = await camerasAPI.getAll();
      if (response.success) {
        setCameras(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement caméras:', error);
    }
  };

  const pickImage = async () => {
    if (form.photos.length >= 6) {
      Alert.alert('Limite atteinte', 'Vous ne pouvez ajouter que 6 photos maximum.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setForm(prev => ({
        ...prev,
        photos: [...prev.photos, result.assets[0].uri]
      }));
    }
  };

  const removePhoto = (index: number) => {
    setForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.typeIncident || !form.zone || !form.idCamera || !form.description) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      const dateTime = `${form.date} ${form.time}:00`;
      
      formData.append('dateHeure', dateTime);
      formData.append('typeIncident', form.typeIncident);
      formData.append('description', form.description);
      formData.append('zone', form.zone);
      formData.append('idCamera', form.idCamera);

      // Ajouter les photos
      form.photos.forEach((photoUri, index) => {
        formData.append(`photos[${index}]`, {
          uri: photoUri,
          type: 'image/jpeg',
          name: `incident_photo_${index}.jpg`,
        } as any);
      });

      const response = await incidentsAPI.create(formData);

      if (response.success) {
        Alert.alert(
          'Succès',
          'Incident enregistré avec succès !',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Erreur', response.message || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Erreur création incident:', error);
      Alert.alert('Erreur', 'Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCamera = cameras.find((c: any) => c.idCamera.toString() === form.idCamera);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          {/* Type d'incident */}
          <View style={styles.inputContainer}>
            <Text variant="labelLarge" style={styles.label}>
              Type d'incident *
            </Text>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setMenuVisible(true)}
                >
                  <Text style={form.typeIncident ? styles.selectedText : styles.placeholderText}>
                    {form.typeIncident || 'Sélectionner un type'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              }
            >
              {incidentTypes.map((type) => (
                <Menu.Item
                  key={type}
                  onPress={() => {
                    setForm(prev => ({ ...prev, typeIncident: type }));
                    setMenuVisible(false);
                  }}
                  title={type}
                />
              ))}
            </Menu>
          </View>

          {/* Zone */}
          <View style={styles.inputContainer}>
            <Text variant="labelLarge" style={styles.label}>
              Zone *
            </Text>
            <Menu
              visible={zoneMenuVisible}
              onDismiss={() => setZoneMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setZoneMenuVisible(true)}
                >
                  <Text style={form.zone ? styles.selectedText : styles.placeholderText}>
                    {form.zone || 'Sélectionner une zone'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              }
            >
              {zones.map((zone) => (
                <Menu.Item
                  key={zone}
                  onPress={() => {
                    setForm(prev => ({ ...prev, zone }));
                    setZoneMenuVisible(false);
                  }}
                  title={zone}
                />
              ))}
            </Menu>
          </View>

          {/* Caméra */}
          <View style={styles.inputContainer}>
            <Text variant="labelLarge" style={styles.label}>
              Caméra concernée *
            </Text>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                // Afficher une liste de caméras
                Alert.alert(
                  'Sélectionner une caméra',
                  'Choisissez la caméra concernée',
                  cameras.map((camera: any) => ({
                    text: `${camera.numeroSerie} - ${camera.emplacement}`,
                    onPress: () => setForm(prev => ({ 
                      ...prev, 
                      idCamera: camera.idCamera.toString() 
                    }))
                  })).concat([{ text: 'Annuler', style: 'cancel' }])
                );
              }}
            >
              <Text style={selectedCamera ? styles.selectedText : styles.placeholderText}>
                {selectedCamera 
                  ? `${selectedCamera.numeroSerie} - ${selectedCamera.emplacement}`
                  : 'Sélectionner une caméra'
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Date et heure */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text variant="labelLarge" style={styles.label}>
                Date *
              </Text>
              <TextInput
                value={form.date}
                onChangeText={(date) => setForm(prev => ({ ...prev, date }))}
                mode="outlined"
                dense
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text variant="labelLarge" style={styles.label}>
                Heure *
              </Text>
              <TextInput
                value={form.time}
                onChangeText={(time) => setForm(prev => ({ ...prev, time }))}
                mode="outlined"
                dense
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text variant="labelLarge" style={styles.label}>
              Description détaillée *
            </Text>
            <TextInput
              value={form.description}
              onChangeText={(description) => setForm(prev => ({ ...prev, description }))}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Décrivez l'incident en détail..."
            />
          </View>

          {/* Photos */}
          <View style={styles.inputContainer}>
            <Text variant="labelLarge" style={styles.label}>
              Photos ({form.photos.length}/6)
            </Text>
            
            <View style={styles.photosContainer}>
              {form.photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Ionicons name="close-circle" size={24} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
              
              {form.photos.length < 6 && (
                <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                  <Ionicons name="camera" size={32} color={colors.textSecondary} />
                  <Text style={styles.addPhotoText}>Ajouter photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Boutons */}
          <View style={styles.buttonsContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                'Enregistrer l\'incident'
              )}
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              disabled={loading}
              style={styles.cancelButton}
            >
              Annuler
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    margin: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    color: colors.text,
  },
  menuButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 12,
    backgroundColor: colors.surface,
  },
  selectedText: {
    color: colors.text,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
  },
  buttonsContainer: {
    marginTop: 24,
    gap: 12,
  },
  submitButton: {
    paddingVertical: 8,
  },
  cancelButton: {
    paddingVertical: 8,
  },
});