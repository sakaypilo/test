import { ApiResponse, User, Camera, Incident, EfaTratra, DashboardStats } from '@/types';
import { useAuthStore } from '@/stores/auth';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveApiBaseUrl(): string {
  let url =
    ((Constants.expoConfig?.extra as any)?.apiUrl as string) ||
    process.env.EXPO_PUBLIC_API_URL ||
    'http://localhost:8000/api';

  // Replace localhost with Android emulator loopback
  if (Platform.OS === 'android') {
    url = url.replace('127.0.0.1', '10.0.2.2').replace('localhost', '10.0.2.2');
  }

  return url;
}

const API_BASE_URL = resolveApiBaseUrl();

// Map backend incident type to strict union type
type IncidentTypeUnion = Incident['type'];
function mapIncidentType(input: any): IncidentTypeUnion {
  const s = String(input || '').toLowerCase().replace(' ', '_');
  switch (s) {
    case 'vol':
    case 'bagarre':
    case 'accident':
    case 'autre':
    case 'intrusion':
    case 'vol_suspect':
    case 'vandalisme':
      return s as IncidentTypeUnion;
    default:
      return 'autre';
  }
}


class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { token } = useAuthStore.getState();

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Une erreur est survenue',
          errors: data.errors,
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur de connexion au serveur',
      };
    }
  }

  // Authentication - Utilise les endpoints Laravel
  async login(matricule: string, password: string): Promise<ApiResponse<{ user: User; token: string; refreshToken?: string }>> {
    const response = await this.makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ matricule, motDePasse: password }),
    });

    // Adapter la réponse Laravel au format attendu par le mobile
    if (
      response.success &&
      response.data &&
      typeof response.data === 'object' &&
      'user' in response.data &&
      response.data.user &&
      typeof response.data.user === 'object' &&
      'idUtilisateur' in response.data.user
    ) {
      return {
        success: true,
        data: {
          user: {
            id: (response.data.user as any).idUtilisateur.toString(),
            matricule: (response.data.user as any).matricule,
            nom: (response.data.user as any).nom,
            prenom: (response.data.user as any).prenom,
            email: (response.data.user as any).email,
            telephone: (response.data.user as any).telephone,
            role: (response.data.user as any).role === 'agent' ? 'agent' : 'technicien',
            isActive: true,
          },
          token: (response as any).token || (response.data as any).token,
          refreshToken: (response as any).token || (response.data as any).token, // Laravel Sanctum n'utilise pas de refresh token
        }
      };
    }

    return response as ApiResponse<{ user: User; token: string; refreshToken?: string }>;
  }

  async logout(): Promise<ApiResponse<null>> {
    return this.makeRequest('/logout', {
      method: 'POST',
    });
  }

  async resetPassword(email: string): Promise<ApiResponse<null>> {
    // Cette fonctionnalité n'est pas implémentée dans le backend Laravel
    return {
      success: false,
      message: 'Fonctionnalité non disponible. Contactez l\'administrateur.',
    };
  }

  // Dashboard - Utilise l'endpoint Laravel
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await this.makeRequest<DashboardStats>('/dashboard');

    if (
      response.success &&
      response.data &&
      typeof response.data === 'object' &&
      'statistiques' in response.data
    ) {
      // Adapter les données Laravel au format mobile
      const stats = (response.data as any).statistiques;
      return {
        success: true,
        data: {
          camerasTotal: stats.cameras.total,
          camerasEnLigne: stats.cameras.actives,
          camerasHorsLigne: stats.cameras.hors_ligne + stats.cameras.en_panne,
          incidentsTotal: stats.incidents.total,
          incidentsDuMois: stats.incidents.ce_mois,
          efaTratraTotal: stats.personnes.total,
          zonesRisque: (response.data as any).cameras_par_zone ?
            Object.entries((response.data as any).cameras_par_zone).map(([zone, data]: [string, any]) => ({
              zone,
              incidents: data.reduce((sum: number, item: any) => sum + item.count, 0)
            })) : []
        }
      };
    }

    return response as ApiResponse<DashboardStats>;
  }

  // Cameras - Utilise les endpoints Laravel
  async getCameras(): Promise<ApiResponse<Camera[]>> {
    const response = await this.makeRequest<Camera[]>('/cameras');

    if (response.success && Array.isArray(response.data)) {
      // Adapter les données Laravel au format mobile
      const cameras = (response.data as any[]).map((camera) => ({
        id: camera.idCamera.toString(),
        numero: camera.numeroSerie,
        zone: camera.zone,
        emplacement: camera.emplacement,
        ip: camera.adresseIP,
        statut: camera.statut === 'actif'
          ? 'en_ligne'
          : camera.statut === 'panne'
          ? 'maintenance'
          : 'hors_ligne' as 'hors_ligne' | 'en_ligne' | 'maintenance',
        dateInstallation: new Date(camera.dateInstallation),
        latitude: -18.1569, // Coordonnées par défaut de Toamasina
        longitude: 49.4085,
        historiquePannes: [],
        historiqueMutations: [],
      }));

      return {
        success: true,
        data: cameras
      };
    }

    return response as ApiResponse<Camera[]>;
  };

  async createCamera(camera: Omit<Camera, 'id'>): Promise<ApiResponse<Camera>> {
    const cameraData = {
      numeroSerie: camera.numero,
      adresseIP: camera.ip,
      zone: camera.zone,
      emplacement: camera.emplacement,
      dateInstallation: camera.dateInstallation.toISOString().split('T')[0],
    };

    const response = await this.makeRequest('/cameras', {
      method: 'POST',
      body: JSON.stringify(cameraData),
    });

    if (
      response.success &&
      response.data &&
      typeof response.data === 'object' &&
      'idCamera' in response.data
    ) {
      const newCamera = response.data as {
        idCamera: number | string;
        numeroSerie: string;
        zone: string;
        emplacement: string;
        adresseIP: string;
        dateInstallation: string;
      };
      return {
        success: true,
        data: {
          id: newCamera.idCamera.toString(),
          numero: newCamera.numeroSerie,
          zone: newCamera.zone,
          emplacement: newCamera.emplacement,
          ip: newCamera.adresseIP,
          statut: 'en_ligne',
          dateInstallation: new Date(newCamera.dateInstallation),
          latitude: camera.latitude,
          longitude: camera.longitude,
          historiquePannes: [],
          historiqueMutations: [],
        }
      };
    }

    return response as ApiResponse<Camera>;
  }

  async updateCamera(id: string, updates: Partial<Camera>): Promise<ApiResponse<Camera>> {
    const updateData: any = {};

    if (updates.numero) updateData.numeroSerie = updates.numero;
    if (updates.ip) updateData.adresseIP = updates.ip;
    if (updates.zone) updateData.zone = updates.zone;
    if (updates.emplacement) updateData.emplacement = updates.emplacement;
    if (updates.statut) {
      updateData.statut = updates.statut === 'en_ligne' ? 'actif' :
                          updates.statut === 'maintenance' ? 'panne' : 'hors ligne';
    }

    return this.makeRequest(`/cameras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteCamera(id: string): Promise<ApiResponse<null>> {
    return this.makeRequest(`/cameras/${id}`, {
      method: 'DELETE',
    });
  }

  // Incidents - Utilise les endpoints Laravel
  async getIncidents(): Promise<ApiResponse<Incident[]>> {
    const response = await this.makeRequest('/incidents');

    if (response.success && Array.isArray(response.data)) {
      // Adapter les données Laravel au format mobile
      const incidents = (response.data as any[]).map((incident) => ({
        id: String(incident.idIncident),
        type: mapIncidentType(incident.typeIncident),
        description: incident.description,
        dateIncident: new Date(incident.dateHeure),
        zone: incident.zone,
        emplacement: incident.camera?.emplacement || 'Non spécifié',
        agent: incident.utilisateur ? `${incident.utilisateur.prenom} ${incident.utilisateur.nom}` : 'Agent inconnu',
        photos: incident.photos || [],
        temoins: [],
        mesuresPrises: 'Mesures prises selon protocole',
        statut: incident.statut === 'valide' ? 'clos' : 'en_cours',
        latitude: -18.1569,
        longitude: 49.4085,
        personnesImpliquees: [],
      } as Incident));

      return {
        success: true,
        data: incidents
      };
    }

    return response as ApiResponse<Incident[]>;
  }

  async createIncident(incident: Omit<Incident, 'id'>): Promise<ApiResponse<Incident>> {
    const formData = new FormData();

    // Adapter les données mobile au format Laravel
    formData.append('dateHeure', incident.dateIncident.toISOString());
    formData.append('typeIncident', incident.type.charAt(0).toUpperCase() + incident.type.slice(1).replace('_', ' '));
    formData.append('description', incident.description);
    formData.append('zone', incident.zone);
    formData.append('idCamera', '1'); // Utiliser la première caméra par défaut

    // Ajouter les photos si présentes
    incident.photos.forEach((photo, index) => {
      if (photo) {
        formData.append(`photos[${index}]`, {
          uri: photo,
          type: 'image/jpeg',
          name: `photo_${index}.jpg`,
        } as any);
      }
    });

    const { token } = useAuthStore.getState();

    try {
      const response = await fetch(`${API_BASE_URL}/incidents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Erreur lors de la création',
        };
      }

      return {
        success: true,
        data: {
          id: data.data.idIncident.toString(),
          type: incident.type,
          description: incident.description,
          dateIncident: incident.dateIncident,
          zone: incident.zone,
          emplacement: incident.emplacement,
          agent: incident.agent,
          photos: incident.photos,
          temoins: incident.temoins,
          mesuresPrises: incident.mesuresPrises,
          statut: 'en_cours',
          latitude: incident.latitude,
          longitude: incident.longitude,
          personnesImpliquees: incident.personnesImpliquees,
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur de connexion au serveur',
      };
    }
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<ApiResponse<Incident>> {
    // Laravel n'a pas d'endpoint de mise à jour d'incident, utiliser validation
    if (updates.statut === 'clos') {
      return this.makeRequest(`/incidents/${id}/validate`, {
        method: 'POST',
        body: JSON.stringify({ statut: 'valide' }),
      });
    }

    return {
      success: false,
      message: 'Mise à jour non supportée',
    };
  }

  // Efa Tratra (Personnes) - Utilise les endpoints Laravel
  async getEfaTratra(): Promise<ApiResponse<EfaTratra[]>> {
    const response = await this.makeRequest('/personnes');

    if (response.success && Array.isArray(response.data)) {
      // Adapter les données Laravel au format mobile
      const efaTratra = (response.data as any[]).map((personne) => ({
        id: String(personne.idPersonne),
        nom: personne.nom,
        prenom: personne.prenom,
        age: undefined,
        adresse: undefined,
        telephone: undefined,
        photo: personne.photo,
        faitsAssocies: personne.interpellations?.map((i: any) => i.faitAssocie) || [],
        dateApprehension: personne.interpellations?.[0]?.dateHeure ?
          new Date(personne.interpellations[0].dateHeure) : new Date(),
        agent: personne.interpellations?.[0]?.utilisateur ?
          `${personne.interpellations[0].utilisateur.prenom} ${personne.interpellations[0].utilisateur.nom}` :
          'Agent inconnu',
        statut: 'en_garde_a_vue', // Statut par défaut
        observations: personne.interpellations?.map((i: any) => i.faitAssocie).join('; ') || '',
      } as EfaTratra));

      return {
        success: true,
        data: efaTratra
      };
    }

    return response as ApiResponse<EfaTratra[]>;
  }

  async createEfaTratra(efa: Omit<EfaTratra, 'id'>): Promise<ApiResponse<EfaTratra>> {
    const formData = new FormData();

    formData.append('nom', efa.nom);
    formData.append('prenom', efa.prenom);
    formData.append('CIN', Math.random().toString().substr(2, 12)); // Générer un CIN temporaire
    formData.append('statut', 'externe');
    formData.append('faitAssocie', efa.faitsAssocies.join('; '));

    if (efa.photo) {
      formData.append('photo', {
        uri: efa.photo,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);
    }

    const { token } = useAuthStore.getState();

    try {
      const response = await fetch(`${API_BASE_URL}/personnes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Erreur lors de la création',
        };
      }

      return {
        success: true,
        data: {
          id: data.data.idPersonne.toString(),
          nom: efa.nom,
          prenom: efa.prenom,
          age: efa.age,
          adresse: efa.adresse,
          telephone: efa.telephone,
          photo: efa.photo,
          faitsAssocies: efa.faitsAssocies,
          dateApprehension: efa.dateApprehension,
          agent: efa.agent,
          statut: efa.statut,
          observations: efa.observations,
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur de connexion au serveur',
      };
    }
  }

  async updateEfaTratra(id: string, updates: Partial<EfaTratra>): Promise<ApiResponse<EfaTratra>> {
    const formData = new FormData();

    if (updates.nom) formData.append('nom', updates.nom);
    if (updates.prenom) formData.append('prenom', updates.prenom);
    if (updates.statut) formData.append('statut', updates.statut === 'en_garde_a_vue' ? 'externe' : 'interne');

    const { token } = useAuthStore.getState();

    try {
      const response = await fetch(`${API_BASE_URL}/personnes/${id}`, {
        method: 'POST', // Laravel utilise POST avec _method=PUT
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Erreur lors de la mise à jour',
        };
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur de connexion au serveur',
      };
    }
  }

  // File upload - Adapter pour Laravel
  async uploadPhoto(uri: string): Promise<ApiResponse<{ url: string }>> {
    // Laravel gère l'upload dans les endpoints spécifiques (incidents, personnes)
    // Cette méthode peut être utilisée pour des uploads génériques si nécessaire
    return {
      success: false,
      message: 'Upload direct non supporté. Utilisez les formulaires spécifiques.',
    };
  }

  // Méthodes utilitaires pour tester la connexion
  async testConnection(): Promise<ApiResponse<any>> {
    return this.makeRequest('/test');
  }

  async getMe(): Promise<ApiResponse<User>> {
    const response = await this.makeRequest('/me');

    if (
      response.success &&
      response.data &&
      typeof response.data === 'object' &&
      'user' in response.data
    ) {
      const user: any = (response.data as any).user;
      if (user && typeof user === 'object' && 'idUtilisateur' in user) {
        return {
          success: true,
          data: {
            id: String(user.idUtilisateur),
            matricule: user.matricule,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            telephone: user.telephone,
            role: user.role === 'agent' ? 'agent' : 'technicien',
            isActive: true,
          }
        };
      }
    }

    return response as ApiResponse<User>;
  }
}

export const apiService = new ApiService();