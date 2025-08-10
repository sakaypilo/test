import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

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
}

export const storageService = new StorageService();