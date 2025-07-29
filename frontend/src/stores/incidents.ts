import { create } from 'zustand'
import { incidentsAPI } from '../services/api'

export interface Incident {
  idIncident: number
  dateHeure: string
  typeIncident: string
  description: string
  zone: string
  photos: string[]
  idCamera: number
  idUtilisateur: number
  statut: 'en_attente' | 'valide' | 'rejete'
  cameraInfo?: {
    numeroSerie: string
    emplacement: string
  }
}

interface IncidentsState {
  incidents: Incident[]
  isLoading: boolean
  error: string | null
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  } | null
  fetchIncidents: (filters?: any) => Promise<void>
  addIncident: (incident: Omit<Incident, 'idIncident'>) => void
  validateIncident: (id: number) => void
  rejectIncident: (id: number) => void
  createIncident: (formData: FormData) => Promise<{ success: boolean; error?: string }>
}

export const useIncidentsStore = create<IncidentsState>((set, get) => ({
  incidents: [],
  isLoading: false,
  error: null,
  pagination: null,

  fetchIncidents: async (filters = {}) => {
    set({ isLoading: true, error: null })
    try {
      const response = await incidentsAPI.getAll(filters)
      if (response.success) {
        set({
          incidents: response.data || [],
          pagination: response.pagination || null,
          isLoading: false
        })
      } else {
        set({ error: response.message || 'Erreur lors du chargement', isLoading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  addIncident: (incident: Omit<Incident, 'idIncident'>) => {
    const { incidents } = get()
    const newIncident: Incident = {
      ...incident,
      idIncident: incidents.length + 1
    }
    set({ incidents: [...incidents, newIncident] })
  },

  createIncident: async (formData: FormData) => {
    try {
      const response = await incidentsAPI.create(formData)
      if (response.success) {
        // Recharger la liste des incidents
        get().fetchIncidents()
        return { success: true }
      } else {
        return { success: false, error: response.message }
      }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  },
  validateIncident: async (id: number) => {
    try {
      const response = await incidentsAPI.validate(id, { statut: 'valide' })
      if (response.success) {
        const { incidents } = get()
        const updatedIncidents = incidents.map(incident =>
          incident.idIncident === id ? { ...incident, statut: 'valide' as const } : incident
        )
        set({ incidents: updatedIncidents })
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error)
    }
  },

  rejectIncident: async (id: number) => {
    try {
      const response = await incidentsAPI.validate(id, { statut: 'rejete' })
      if (response.success) {
        const { incidents } = get()
        const updatedIncidents = incidents.map(incident =>
          incident.idIncident === id ? { ...incident, statut: 'rejete' as const } : incident
        )
        set({ incidents: updatedIncidents })
      }
    } catch (error) {
      console.error('Erreur lors du rejet:', error)
    }
  }
}))