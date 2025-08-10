import { create } from 'zustand';
import { Camera, Panne, Mutation } from '@/types';

interface CamerasState {
  cameras: Camera[];
  pannes: Panne[];
  mutations: Mutation[];
  selectedCamera: Camera | null;
  isLoading: boolean;
  error: string | null;
  
  setCameras: (cameras: Camera[]) => void;
  addCamera: (camera: Camera) => void;
  updateCamera: (id: string, updates: Partial<Camera>) => void;
  deleteCamera: (id: string) => void;
  setSelectedCamera: (camera: Camera | null) => void;
  addPanne: (panne: Panne) => void;
  addMutation: (mutation: Mutation) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useCamerasStore = create<CamerasState>((set, get) => ({
  cameras: [],
  pannes: [],
  mutations: [],
  selectedCamera: null,
  isLoading: false,
  error: null,

  setCameras: (cameras: Camera[]) => {
    set({ cameras, error: null });
  },

  addCamera: (camera: Camera) => {
    set(state => ({
      cameras: [...state.cameras, camera],
      error: null,
    }));
  },

  updateCamera: (id: string, updates: Partial<Camera>) => {
    set(state => ({
      cameras: state.cameras.map(camera =>
        camera.id === id ? { ...camera, ...updates } : camera
      ),
      error: null,
    }));
  },

  deleteCamera: (id: string) => {
    set(state => ({
      cameras: state.cameras.filter(camera => camera.id !== id),
      selectedCamera: state.selectedCamera?.id === id ? null : state.selectedCamera,
      error: null,
    }));
  },

  setSelectedCamera: (camera: Camera | null) => {
    set({ selectedCamera: camera });
  },

  addPanne: (panne: Panne) => {
    set(state => ({
      pannes: [...state.pannes, panne],
      cameras: state.cameras.map(camera =>
        camera.id === panne.cameraId
          ? { ...camera, historiquePannes: [...camera.historiquePannes, panne] }
          : camera
      ),
    }));
  },

  addMutation: (mutation: Mutation) => {
    set(state => ({
      mutations: [...state.mutations, mutation],
      cameras: state.cameras.map(camera =>
        camera.id === mutation.cameraId
          ? { ...camera, historiqueMutations: [...camera.historiqueMutations, mutation] }
          : camera
      ),
    }));
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
}));