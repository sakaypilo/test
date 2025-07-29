import { create } from 'zustand'
import { camerasAPI } from '../services/api'

export interface Camera {
  idCamera: number
  numeroSerie: string
  adresseIP: string
  zone: string
  emplacement: string
  statut: 'actif' | 'panne' | 'hors ligne'
  dateInstallation: string
}

interface CamerasState {
  cameras: Camera[]
  isLoading: boolean
  error: string | null
  fetchCameras: (filters?: any) => Promise<void>
  getCamerasByStatus: (status: string) => Camera[]
  addCamera: (camera: Omit<Camera, 'idCamera'>) => void
  createCamera: (data: any) => Promise<{ success: boolean; error?: string }>
}

export const useCamerasStore = create<CamerasState>((set, get) => ({
  cameras: [],
  isLoading: false,
  error: null,

  fetchCameras: async (filters = {}) => {
    set({ isLoading: true, error: null })
    try {
      const response = await camerasAPI.getAll(filters)
      if (response.success) {
        set({
          cameras: response.data || [],
          isLoading: false
        })
      } else {
        set({ error: response.message || 'Erreur lors du chargement', isLoading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  getCamerasByStatus: (status: string) => {
    return get().cameras.filter(camera => camera.statut === status)
  },

  addCamera: (camera: Omit<Camera, 'idCamera'>) => {
    const { cameras } = get()
    const newCamera: Camera = {
      ...camera,
      idCamera: cameras.length + 1
    }
    set({ cameras: [...cameras, newCamera] })
  },
  createCamera: async (data: any) => {
    try {
      const response = await camerasAPI.create(data)
      if (response.success) {
        // Recharger la liste des caméras
        get().fetchCameras()
        return { success: true }
      } else {
        return { success: false, error: response.message }
      }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }
}))