import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveApiBaseUrl(): string {
  let url =
    ((Constants.expoConfig?.extra as any)?.apiUrl as string) ||
    process.env.EXPO_PUBLIC_API_URL ||
    'http://localhost:8000/api';

  // Replace localhost with Android emulator loopback
  if (Platform.OS === 'android') {
    url = url.replace('127.0.0.1', '10.0.2.2').replace('localhost', '10.0.2.2');
  }

  return url;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  setUser: (user: User) => void;
  setTokens: (token: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initialize: () => Promise<void>;
  checkTokenValidity: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isInitialized: false,

      setUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          error: null,
        });
      },

      setTokens: (token: string, refreshToken: string) => {
        set({
          token,
          refreshToken,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      initialize: async () => {
        const state = get();
        set({ isLoading: true });

        try {
          if (state.token && state.user) {
            // Vérifier la validité du token avec retry
            const isValid = await get().checkTokenValidity();
            if (isValid) {
              set({
                isAuthenticated: true,
                isInitialized: true,
                isLoading: false
              });
            } else {
              // Token invalide, déconnecter
              console.log('Token invalide, déconnexion automatique');
              get().logout();
              set({
                isInitialized: true,
                isLoading: false
              });
            }
          } else {
            // Pas de token ou d'utilisateur sauvegardé
            set({
              isAuthenticated: false,
              isInitialized: true,
              isLoading: false
            });
          }
        } catch (error) {
          console.error('Erreur lors de l\'initialisation:', error);
          // En cas d'erreur, on considère que l'utilisateur n'est pas connecté
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false
          });
        }
      },

      checkTokenValidity: async (): Promise<boolean> => {
        const state = get();
        if (!state.token) return false;

        try {
          // Utiliser l'endpoint /me pour vérifier le token
          const apiUrl = resolveApiBaseUrl();
          const response = await fetch(`${apiUrl}/me`, {
            headers: {
              'Authorization': `Bearer ${state.token}`,
              'Accept': 'application/json',
            },
          });

          return response.ok;
        } catch (error) {
          console.error('Erreur lors de la vérification du token:', error);
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        // Ne pas persister isAuthenticated pour forcer la vérification au démarrage
      }),
    }
  )
);