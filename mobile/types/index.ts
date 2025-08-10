export interface User {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'agent' | 'technicien';
  isActive: boolean;
  lastLogin?: Date;
}

export interface Camera {
  id: string;
  numero: string;
  zone: string;
  emplacement: string;
  ip: string;
  statut: 'en_ligne' | 'hors_ligne' | 'maintenance';
  dateInstallation: Date;
  latitude: number;
  longitude: number;
  historiquePannes: Panne[];
  historiqueMutations: Mutation[];
}

export interface Panne {
  id: string;
  cameraId: string;
  description: string;
  datePanne: Date;
  dateReparation?: Date;
  technicien: string;
  statut: 'en_cours' | 'resolu';
}

export interface Mutation {
  id: string;
  cameraId: string;
  ancienneZone: string;
  nouvelleZone: string;
  ancienEmplacement: string;
  nouvelEmplacement: string;
  dateMutation: Date;
  technicien: string;
  motif: string;
}

export interface Incident {
  id: string;
  type: 'vol' | 'bagarre' | 'accident' | 'autre';
  description: string;
  dateIncident: Date;
  zone: string;
  emplacement: string;
  agent: string;
  photos: string[];
  temoins: string[];
  mesuresPrises: string;
  statut: 'en_cours' | 'clos';
  latitude?: number;
  longitude?: number;
  personnesImpliquees?: string[];
}

export interface EfaTratra {
  id: string;
  nom: string;
  prenom: string;
  age?: number;
  adresse?: string;
  telephone?: string;
  photo?: string;
  faitsAssocies: string[];
  dateApprehension: Date;
  agent: string;
  statut: 'en_garde_a_vue' | 'libere' | 'transfere';
  observations: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface DashboardStats {
  camerasTotal: number;
  camerasEnLigne: number;
  camerasHorsLigne: number;
  incidentsTotal: number;
  incidentsDuMois: number;
  efaTratraTotal: number;
  zonesRisque: { zone: string; incidents: number }[];
}