import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Incident, EfaTratra } from '@/types';

interface IncidentsState {
  incidents: Incident[];
  efaTratra: EfaTratra[];
  selectedIncident: Incident | null;
  draftIncidents: Incident[];
  isLoading: boolean;
  error: string | null;
  
  setIncidents: (incidents: Incident[]) => void;
  addIncident: (incident: Incident) => void;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  deleteIncident: (id: string) => void;
  setSelectedIncident: (incident: Incident | null) => void;
  saveDraft: (incident: Incident) => void;
  removeDraft: (id: string) => void;
  syncDrafts: () => Promise<void>;
  addEfaTratra: (efa: EfaTratra) => void;
  updateEfaTratra: (id: string, updates: Partial<EfaTratra>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useIncidentsStore = create<IncidentsState>()(
  persist(
    (set, get) => ({
      incidents: [],
      efaTratra: [],
      selectedIncident: null,
      draftIncidents: [],
      isLoading: false,
      error: null,

      setIncidents: (incidents: Incident[]) => {
        set({ incidents, error: null });
      },

      addIncident: (incident: Incident) => {
        set(state => ({
          incidents: [...state.incidents, incident],
          error: null,
        }));
      },

      updateIncident: (id: string, updates: Partial<Incident>) => {
        set(state => ({
          incidents: state.incidents.map(incident =>
            incident.id === id ? { ...incident, ...updates } : incident
          ),
          error: null,
        }));
      },

      deleteIncident: (id: string) => {
        set(state => ({
          incidents: state.incidents.filter(incident => incident.id !== id),
          selectedIncident: state.selectedIncident?.id === id ? null : state.selectedIncident,
          error: null,
        }));
      },

      setSelectedIncident: (incident: Incident | null) => {
        set({ selectedIncident: incident });
      },

      saveDraft: (incident: Incident) => {
        set(state => ({
          draftIncidents: [...state.draftIncidents.filter(d => d.id !== incident.id), incident],
        }));
      },

      removeDraft: (id: string) => {
        set(state => ({
          draftIncidents: state.draftIncidents.filter(d => d.id !== id),
        }));
      },

      syncDrafts: async () => {
        const { draftIncidents } = get();
        // Implementation for syncing drafts when online
        // This would call the API service to sync all draft incidents
      },

      addEfaTratra: (efa: EfaTratra) => {
        set(state => ({
          efaTratra: [...state.efaTratra, efa],
          error: null,
        }));
      },

      updateEfaTratra: (id: string, updates: Partial<EfaTratra>) => {
        set(state => ({
          efaTratra: state.efaTratra.map(efa =>
            efa.id === id ? { ...efa, ...updates } : efa
          ),
          error: null,
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
    }),
    {
      name: 'incidents-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        draftIncidents: state.draftIncidents,
      }),
    }
  )
);