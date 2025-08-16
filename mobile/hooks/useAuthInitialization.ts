import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';

/**
 * Hook personnalisé pour gérer l'initialisation de l'authentification
 * Vérifie automatiquement la validité du token au démarrage de l'app
 */
export function useAuthInitialization() {
  const { isInitialized, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  return {
    isInitialized,
    isLoading,
  };
}
