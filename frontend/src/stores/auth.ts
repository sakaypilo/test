import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI, LoginRequest } from '../services/api'

// Type global pour le rôle
export type UserRole = 'admin' | 'agent' | 'technicien' | 'responsable'

export interface User {
  idUtilisateur: number
  matricule: string
  nom: string
  prenom: string
  role: UserRole
  email: string
  telephone: string
}

// Validation du rôle
function isValidRole(role: string): role is UserRole {
  return ['admin', 'agent', 'technicien', 'responsable'].includes(role)
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  login: (matricule: string, motDePasse: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  checkAuth: () => Promise<void>
  initialize: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  initialize: () => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser)
        if (isValidRole(user.role)) {
          set({
            user,
            token,
            isAuthenticated: true,
            isInitialized: true
          })
          return
        }
      } catch (error) {
        console.error('Erreur parsing user:', error)
      }
    }
    
    // Si pas de données valides, nettoyer
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: true
    })
  },
  login: async (matricule: string, motDePasse: string) => {
    set({ isLoading: true })

    try {
      const credentials: LoginRequest = { matricule, motDePasse }
      const response = await authAPI.login(credentials)

      if (response.success && response.data) {
        const { user: apiUser, token } = response.data

        if (!isValidRole(apiUser.role)) {
          throw new Error('Rôle utilisateur invalide')
        }

        const user: User = { ...apiUser, role: apiUser.role }

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false
        })

         return { success: true }
    } else {
      throw new Error(response.message || 'Erreur de connexion')
    }
  } catch (error: any) {
    set({ isLoading: false })

    let errorMessage = 'Erreur de connexion'

    if (error.response) {
      // Erreurs envoyées par l'API (par ex: 422)
      if (error.response.status === 422) {
        errorMessage = error.response.data.message || 'Identifiants invalides'
      } else if (error.response.status === 401) {
        errorMessage = 'Accès non autorisé'
      } else {
        errorMessage = error.response.data.message || `Erreur serveur (${error.response.status})`
      }
    } else if (error.request) {
      errorMessage = 'Aucune réponse du serveur'
    } else {
      errorMessage = error.message
    }

    console.error('Erreur de connexion:', errorMessage)
    return { success: false, error: errorMessage }
  }
},


  logout: async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      set({
        user: null,
        token: null,
        isAuthenticated: false
      })
    }
  },

  checkAuth: async () => {
    const { token, user } = get()

    if (token && user) {
      try {

        const response = await authAPI.me()
        if (response.success && response.data) {
          const apiUser = response.data

          if (!isValidRole(apiUser.role)) {
            get().logout()
            return
          }

          const user: User = { ...apiUser, role: apiUser.role }

          set({
            user: updatedUser,
            token,
            isAuthenticated: true
          })

        } else {
          get().logout()
        }
      } catch (error) {
        console.error('Erreur de vérification auth:', error)
        get().logout()
      }
    }
  }
}),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
