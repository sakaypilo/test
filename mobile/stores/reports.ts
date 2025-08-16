import { create } from 'zustand';

export interface Report {
  idRapport: number;
  typeRapport: 'incident' | 'camera' | 'personne' | 'general';
  titre: string;
  contenu: string;
  dateGeneration: string;
  idUtilisateur: number;
  idIncident?: number;
  idCamera?: number;
  idPersonne?: number;
  fichierPDF?: string;
  created_at: string;
  updated_at: string;
  utilisateur?: {
    idUtilisateur: number;
    nom: string;
    prenom: string;
    matricule: string;
  };
}

interface ReportsState {
  reports: Report[];
  selectedReport: Report | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setReports: (reports: Report[]) => void;
  setSelectedReport: (report: Report | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addReport: (report: Report) => void;
  updateReport: (id: number, report: Partial<Report>) => void;
  removeReport: (id: number) => void;
}

export const useReportsStore = create<ReportsState>((set) => ({
  reports: [],
  selectedReport: null,
  isLoading: false,
  error: null,

  setReports: (reports) => set({ reports }),
  setSelectedReport: (report) => set({ selectedReport: report }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  addReport: (report) => set((state) => ({
    reports: [...state.reports, report]
  })),
  
  updateReport: (id, updatedReport) => set((state) => ({
    reports: state.reports.map(r => 
      r.idRapport === id ? { ...r, ...updatedReport } : r
    )
  })),
  
  removeReport: (id) => set((state) => ({
    reports: state.reports.filter(r => r.idRapport !== id)
  })),
}));
