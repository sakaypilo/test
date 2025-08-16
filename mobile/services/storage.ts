import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';

class StorageService {
  // Secure storage for sensitive data
  async setSecureItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde sécurisée: ${error}`);
    }
  }

  async getSecureItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Erreur lors de la récupération sécurisée: ${error}`);
      return null;
    }
  }

  async deleteSecureItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Erreur lors de la suppression sécurisée: ${error}`);
    }
  }

  // Regular storage for non-sensitive data
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde: ${error}`);
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Erreur lors de la récupération: ${error}`);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Erreur lors de la suppression: ${error}`);
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error(`Erreur lors du nettoyage: ${error}`);
    }
  }

  // Offline data management
  async saveOfflineData(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(`offline_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde hors ligne: ${error}`);
    }
  }

  async getOfflineData(key: string): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(`offline_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Erreur lors de la récupération hors ligne: ${error}`);
      return null;
    }
  }

  async removeOfflineData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`offline_${key}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression hors ligne: ${error}`);
    }
  }

  // Image management
  async saveImagePermanently(sourceUri: string): Promise<string | null> {
    try {
      // Créer le répertoire des images s'il n'existe pas
      const imagesDir = `${FileSystem.documentDirectory}images/`;
      const dirInfo = await FileSystem.getInfoAsync(imagesDir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
      }

      // Générer un nom unique pour l'image
      const timestamp = Date.now();
      const extension = sourceUri.split('.').pop() || 'jpg';
      const fileName = `incident_${timestamp}.${extension}`;
      const destinationUri = `${imagesDir}${fileName}`;

      // Copier l'image vers le répertoire permanent
      await FileSystem.copyAsync({
        from: sourceUri,
        to: destinationUri,
      });


      return destinationUri;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'image:', error);
      return null;
    }
  }

  async deleteImage(imageUri: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(imageUri);

      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
    }
  }

  async cleanupOldImages(): Promise<void> {
    try {
      const imagesDir = `${FileSystem.documentDirectory}images/`;
      const dirInfo = await FileSystem.getInfoAsync(imagesDir);

      if (dirInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(imagesDir);
        const now = Date.now();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 jours

        for (const file of files) {
          const filePath = `${imagesDir}${file}`;
          const fileInfo = await FileSystem.getInfoAsync(filePath);

          if (fileInfo.exists && fileInfo.modificationTime) {
            const fileAge = now - fileInfo.modificationTime * 1000;
            if (fileAge > maxAge) {
              await FileSystem.deleteAsync(filePath);

            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage des images:', error);
    }
  }

  // Vérifier si une image existe
  async testImageAccess(imageUri: string): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      return fileInfo.exists;
    } catch (error) {
      console.error('Erreur test accès image:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();