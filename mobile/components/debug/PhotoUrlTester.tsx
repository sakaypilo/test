import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { colors } from '@/theme/colors';

export default function PhotoUrlTester() {
  const [testUrl, setTestUrl] = useState('http://localhost:8000/storage/incidents/incident_1755380852_1.jpg');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const testUrl1 = 'http://localhost:8000/storage/incidents/incident_1755380852_1.jpg';
  const testUrl2 = 'http://10.0.2.2:8000/storage/incidents/incident_1755380852_1.jpg';
  const testUrl3 = 'http://172.20.10.2:8000/storage/incidents/incident_1755380852_1.jpg';

  const testImage = () => {
    setImageLoaded(false);
    setImageError(null);
    console.log('Testing URL:', testUrl);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(null);
    console.log('Image loaded successfully');
    Alert.alert('Succès', 'Image chargée avec succès !');
  };

  const handleImageError = (error: any) => {
    setImageLoaded(false);
    setImageError(error.nativeEvent.error || 'Erreur inconnue');
    console.error('Image error:', error.nativeEvent);
    Alert.alert('Erreur', `Impossible de charger l'image: ${error.nativeEvent.error}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Test des URLs de Photos</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>URL à tester:</Text>
        <TextInput
          style={styles.input}
          value={testUrl}
          onChangeText={setTestUrl}
          placeholder="Entrez l'URL de l'image"
          multiline
        />
        
        <TouchableOpacity style={styles.button} onPress={testImage}>
          <Text style={styles.buttonText}>Tester l'Image</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>URLs de test rapides:</Text>
        
        <TouchableOpacity 
          style={styles.quickButton} 
          onPress={() => setTestUrl(testUrl1)}
        >
          <Text style={styles.quickButtonText}>localhost:8000</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickButton} 
          onPress={() => setTestUrl(testUrl2)}
        >
          <Text style={styles.quickButtonText}>10.0.2.2:8000 (Android)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickButton} 
          onPress={() => setTestUrl(testUrl3)}
        >
          <Text style={styles.quickButtonText}>172.20.10.2:8000 (WiFi)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Résultat:</Text>
        
        {testUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: testUrl }}
              style={styles.testImage}
              onLoad={handleImageLoad}
              onError={handleImageError}
              resizeMode="contain"
            />
            
            <View style={styles.status}>
              {imageLoaded && (
                <Text style={styles.successText}>✅ Image chargée</Text>
              )}
              {imageError && (
                <Text style={styles.errorText}>❌ Erreur: {imageError}</Text>
              )}
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Informations de debug:</Text>
        <Text style={styles.debugText}>URL testée: {testUrl}</Text>
        <Text style={styles.debugText}>Statut: {imageLoaded ? 'Chargée' : imageError ? 'Erreur' : 'En attente'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary[600],
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9fafb',
    marginBottom: 12,
    minHeight: 60,
  },
  button: {
    backgroundColor: colors.primary[500],
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  quickButton: {
    backgroundColor: '#e5e7eb',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  quickButtonText: {
    color: '#374151',
    fontSize: 14,
  },
  imageContainer: {
    alignItems: 'center',
  },
  testImage: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 12,
  },
  status: {
    alignItems: 'center',
  },
  successText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  debugText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});
