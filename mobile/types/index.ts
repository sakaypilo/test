export interface User {
  id: string; // idUtilisateur dans Laravel
  idUtilisateur?: number; // ID numérique original de Laravel (pour les permissions)
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string; // optionnel dans Laravel
  role: 'agent' | 'technicien' | 'responsable' | 'admin';
  isActive: boolean; // actif dans Laravel
  lastLogin?: Date;
}

export interface Camera {
  id: string; // idCamera dans Laravel
  idCamera?: number; // ID original de Laravel
  actif?: boolean; // Champ pour savoir si la caméra est supprimée ou non
  numero: string; // numeroSerie dans Laravel
  zone: string;
  emplacement: string;
  ip: string; // adresseIP dans Laravel
  statut: 'actif' | 'panne' | 'hors_ligne'; // statut dans Laravel
  dateInstallation: Date;
  latitude?: number; // pas dans le modèle Laravel actuel
  longitude?: number; // pas dans le modèle Laravel actuel
  historiquePannes?: Panne[]; // optionnel
  historiqueMutations?: Mutation[]; // optionnel
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
  id: string; // idMutation dans Laravel
  cameraId: string; // idCamera dans Laravel
  ancienEmplacement: string; // ancienEmplacement dans Laravel
  nouvelEmplacement: string; // nouvelEmplacement dans Laravel
  dateMutation: Date; // dateHeureMutation dans Laravel
  technicien: string; // idTechnicien dans Laravel
  motif: string;
}

export interface Incident {
  id: string; // idIncident dans Laravel
  idIncident?: number; // ID original de Laravel
  idUtilisateur?: number; // ID de l'utilisateur qui a créé l'incident (IMPORTANT pour permissions)
  type: string; // typeIncident dans Laravel
  typeIncident?: string; // Type original de Laravel
  description: string;
  dateIncident: Date; // dateHeure dans Laravel
  dateHeure?: Date; // alias pour compatibilité
  zone: string;
  emplacement?: string; // pas dans le modèle Laravel actuel
  agent: string; // idUtilisateur dans Laravel
  photos: string[]; // photo1-photo6 dans Laravel
  temoins?: string[]; // pas dans le modèle Laravel actuel
  mesuresPrises?: string; // pas dans le modèle Laravel actuel
  statut: 'en_attente' | 'valide' | 'rejete'; // statut dans Laravel
  actif?: boolean; // Champ pour savoir si l'incident est supprimé ou non
  latitude?: number; // pas dans le modèle Laravel actuel
  longitude?: number; // pas dans le modèle Laravel actuel
  personnesImpliquees?: string[]; // pas dans le modèle Laravel actuel
  cameraId?: string; // idCamera dans Laravel
  camera?: { // informations de la caméra pour l'affichage
    numeroSerie: string;
    emplacement: string;
  };
  utilisateur?: { // informations de l'utilisateur pour l'affichage
    nom: string;
    prenom: string;
  };
  validateur?: { // informations du validateur
    nom: string;
    prenom: string;
  };
  dateValidation?: Date;
  commentaireValidation?: string;
}

export interface EfaTratra {
  id: string; // idPersonne dans Laravel
  nom: string;
  prenom: string;
  CIN: string; // CIN dans Laravel
  age?: number; // pas dans le modèle Laravel actuel
  adresse?: string; // pas dans le modèle Laravel actuel
  telephone?: string; // pas dans le modèle Laravel actuel
  photo?: string;
  statut: 'interne' | 'externe'; // statut dans Laravel
  faitsAssocies?: string[]; // géré via les interpellations
  dateApprehension?: Date; // géré via les interpellations
  agent?: string; // géré via les interpellations
  observations?: string; // géré via les interpellations
}

export interface Interpellation {
  id: string; // idInterpellation dans Laravel
  personneId: string; // idPersonne dans Laravel
  userId: string; // idUtilisateur dans Laravel
  faitAssocie: string;
  dateHeure: Date;
  observations?: string;
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