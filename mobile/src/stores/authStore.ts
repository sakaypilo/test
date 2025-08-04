import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { authAPI } from '../services/api';

export type UserRole = 'admin' | 'agent' | 'technicien' | 'responsable';

export interface User {
  idUtilisateur: number;
  matricule: string;
  nom: string;
  prenom: string;
  role: UserRole;
  email: string;
  telephone: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (matricule: string, motDePasse: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({
          user,
          token,
          isAuthenticated: true,
          isInitialized: true
        });
      } else {
        set({ isInitialized: true });
      }
    } catch (error) {
      console.error('Erreur initialisation auth:', error);
      set({ isInitialized: true });
    }
  },

  login: async (matricule: string, motDePasse: string) => {
    set({ isLoading: true });

    try {
      const response = await authAPI.login({ matricule, motDePasse });

      if (response.success && response.data) {
        const { user, token } = response.data;

        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false
        });

        return { success: true };
      } else {
        throw new Error(response.message || 'Erreur de connexion');
      }
    } catch (error: any) {
      set({ isLoading: false });

      let errorMessage = 'Erreur de connexion';
      if (error.response?.status === 422) {
        errorMessage = 'Identifiants invalides';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    } finally {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      set({
        user: null,
        token: null,
        isAuthenticated: false
      });
    }
  }
}));