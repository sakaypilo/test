import { create } from 'zustand';

export interface Personne {
  idPersonne: number;
  nom: string;
  prenom: string;
  CIN: string;
  statut: 'interne' | 'externe';
  photo?: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
  interpellations?: Interpellation[];
}

export interface Interpellation {
  idInterpellation: number;
  dateHeure: string;
  faitAssocie: string;
  statut: 'en_garde_a_vue' | 'libere' | 'transfere';
  idPersonne: number;
  idUtilisateur: number;
  created_at: string;
  updated_at: string;
}

interface PersonnesState {
  personnes: Personne[];
  selectedPersonne: Personne | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setPersonnes: (personnes: Personne[]) => void;
  setSelectedPersonne: (personne: Personne | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addPersonne: (personne: Personne) => void;
  updatePersonne: (id: number, personne: Partial<Personne>) => void;
  removePersonne: (id: number) => void;
}

export const usePersonnesStore = create<PersonnesState>((set) => ({
  personnes: [],
  selectedPersonne: null,
  isLoading: false,
  error: null,

  setPersonnes: (personnes) => set({ personnes }),
  setSelectedPersonne: (personne) => set({ selectedPersonne: personne }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  addPersonne: (personne) => set((state) => ({
    personnes: [...state.personnes, personne]
  })),
  
  updatePersonne: (id, updatedPersonne) => set((state) => ({
    personnes: state.personnes.map(p => 
      p.idPersonne === id ? { ...p, ...updatedPersonne } : p
    )
  })),
  
  removePersonne: (id) => set((state) => ({
    personnes: state.personnes.filter(p => p.idPersonne !== id)
  })),
}));
