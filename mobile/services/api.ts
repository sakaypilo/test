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

// Fonction utilitaire pour construire les URLs de photos
function buildPhotoUrl(photoPath: string): string {
  if (!photoPath || photoPath === null || photoPath === '') {
    return '';
  }

  // Si c'est déjà une URL complète, la retourner telle quelle
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }

  // Nettoyer le chemin (enlever les préfixes redondants)
  let cleanPath = photoPath;

  // Enlever le préfixe 'storage/' s'il existe
  if (cleanPath.startsWith('storage/')) {
    cleanPath = cleanPath.substring(8);
  }

  // Enlever le préfixe 'public/' s'il existe
  if (cleanPath.startsWith('public/')) {
    cleanPath = cleanPath.substring(7);
  }

  // Construire l'URL complète
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}/storage/${cleanPath}`;
}

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
          'Accept': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      // Vérifier si la réponse est du JSON valide
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Erreur de parsing JSON:', parseError);
        return {
          success: false,
          message: 'Réponse serveur invalide',
        };
      }

      if (!response.ok) {
        // Gestion spécifique des codes d'erreur
        let message = 'Une erreur est survenue';

        switch (response.status) {
          case 401:
            message = 'Session expirée, veuillez vous reconnecter';
            // Déconnecter l'utilisateur
            useAuthStore.getState().logout();
            break;
          case 403:
            message = 'Accès non autorisé';
            break;
          case 404:
            message = 'Ressource non trouvée';
            break;
          case 422:
            message = data.message || 'Données invalides';
            break;
          case 500:
            message = 'Erreur serveur interne';
            break;
          default:
            message = data.message || `Erreur ${response.status}`;
        }

        return {
          success: false,
          message,
          errors: data.errors,
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('Erreur API:', error);

      // Gestion spécifique des erreurs réseau
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
        };
      }

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
      const cameras = (response.data as any[])
        .filter((camera) => camera && camera.idCamera) // Filtrer les caméras invalides
        .map((camera) => ({
          id: (camera.idCamera || Date.now()).toString(),
          numero: camera.numeroSerie || 'N/A',
          zone: camera.zone || 'Zone non spécifiée',
          emplacement: camera.emplacement || 'Emplacement non spécifié',
          ip: camera.adresseIP || '0.0.0.0',
          statut: camera.statut === 'actif'
            ? 'en_ligne'
            : camera.statut === 'panne'
            ? 'maintenance'
            : 'hors_ligne' as 'hors_ligne' | 'en_ligne' | 'maintenance',
          dateInstallation: camera.dateInstallation ? new Date(camera.dateInstallation) : new Date(),
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
      const incidents = (response.data as any[])
        .filter((incident) => incident && incident.idIncident) // Filtrer les incidents invalides
        .map((incident) => ({
          id: String(incident.idIncident || Date.now()), // Fallback si idIncident est undefined
          type: mapIncidentType(incident.typeIncident),
          description: incident.description || 'Description non disponible',
          dateIncident: incident.dateHeure ? new Date(incident.dateHeure) : new Date(),
          zone: incident.zone || 'Zone non spécifiée',
          emplacement: incident.camera?.emplacement || 'Non spécifié',
          agent: incident.utilisateur ? `${incident.utilisateur.prenom || ''} ${incident.utilisateur.nom || ''}`.trim() : 'Agent inconnu',
          photos: Array.isArray(incident.photos) ? incident.photos.map((photo: any) => {
            // Si les photos sont des objets avec une propriété 'url' ou 'path'
            if (typeof photo === 'object' && photo.url) {
              return photo.url;
            }
            if (typeof photo === 'object' && photo.path) {
              return `${API_BASE_URL}/storage/${photo.path}`;
            }
            // Si c'est déjà une URL
            return typeof photo === 'string' ? photo : '';
          }).filter(Boolean) : [],
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

    // Ajouter les photos
    incident.photos.forEach((photo, index) => {
      if (photo && photo.trim()) {
        const photoObject = {
          uri: photo,
          type: 'image/jpeg',
          name: `incident_photo_${index + 1}.jpg`,
        };

        formData.append('photos[]', photoObject as any);
      }
    });

    const { token } = useAuthStore.getState();

    try {
      // Pour React Native, ne pas définir Content-Type pour multipart/form-data
      // Le navigateur/RN le définira automatiquement avec la boundary
      const response = await fetch(`${API_BASE_URL}/incidents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Ne pas définir Content-Type pour multipart/form-data
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

      // Extraire les URLs des photos depuis la réponse du serveur
      const serverData = data?.data || {};
      const serverPhotos = [];

      // Le serveur Laravel stocke les photos dans photo1, photo2, etc.
      for (let i = 1; i <= 6; i++) {
        const photoField = `photo${i}`;
        const photoValue = serverData[photoField];

        if (photoValue && photoValue !== null && photoValue !== '') {
          const photoUrl = buildPhotoUrl(photoValue);
          if (photoUrl) {
            serverPhotos.push(photoUrl);
          }
        }
      }

      // Construire l'incident final avec les photos du serveur
      const finalIncident = {
        id: (data?.data?.idIncident || Date.now()).toString(),
        type: incident.type,
        description: incident.description,
        dateIncident: incident.dateIncident,
        dateHeure: incident.dateIncident, // Alias pour compatibilité
        zone: incident.zone,
        emplacement: incident.emplacement,
        agent: incident.agent,
        photos: serverPhotos.length > 0 ? serverPhotos : [], // Utiliser les photos du serveur ou tableau vide
        temoins: incident.temoins || [],
        mesuresPrises: incident.mesuresPrises,
        statut: 'en_attente' as const,
        latitude: incident.latitude,
        longitude: incident.longitude,
        personnesImpliquees: incident.personnesImpliquees || [],
        cameraId: '1',
        camera: serverData.camera ? {
          numeroSerie: serverData.camera.numeroSerie || '',
          emplacement: serverData.camera.emplacement || ''
        } : undefined,
        utilisateur: serverData.utilisateur ? {
          nom: serverData.utilisateur.nom || '',
          prenom: serverData.utilisateur.prenom || ''
        } : undefined,
      };

      return {
        success: true,
        data: finalIncident
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
  async getEfaTratra(): Promise<ApiResponse<any[]>> {
    const response = await this.makeRequest('/personnes');

    if (response.success && Array.isArray(response.data)) {
      // Retourner les données Laravel directement
      return {
        success: true,
        data: response.data
      };
    }

    return response as ApiResponse<any[]>;
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
  // Nouvelles méthodes pour les détails
  async getCameraDetails(id: number): Promise<ApiResponse<any>> {
    return this.makeRequest(`/cameras/${id}`);
  }

  async getIncidentDetails(id: string): Promise<ApiResponse<Incident>> {
    const response = await this.makeRequest(`/incidents/${id}`);

    if (response.success && response.data) {
      const incident = response.data as any;
      console.log('Incident data from server:', incident);

      // Adapter les données Laravel au format mobile
      const mappedIncident: Incident = {
        id: String(incident.idIncident || id),
        type: mapIncidentType(incident.typeIncident),
        description: incident.description || 'Description non disponible',
        dateIncident: incident.dateHeure ? new Date(incident.dateHeure) : new Date(),
        dateHeure: incident.dateHeure ? new Date(incident.dateHeure) : new Date(),
        zone: incident.zone || 'Zone non spécifiée',
        emplacement: incident.camera?.emplacement || 'Non spécifié',
        agent: incident.utilisateur ? `${incident.utilisateur.prenom || ''} ${incident.utilisateur.nom || ''}`.trim() : 'Agent inconnu',
        photos: (() => {
          const photos = [];

          // Extraire les photos depuis photo1, photo2, etc.
          for (let i = 1; i <= 6; i++) {
            const photoField = `photo${i}`;
            const photoValue = incident[photoField];

            if (photoValue && photoValue !== null && photoValue !== '') {
              const photoUrl = buildPhotoUrl(photoValue);
              console.log(`Photo ${i}: ${photoValue} -> ${photoUrl}`);
              if (photoUrl) {
                photos.push(photoUrl);
              }
            }
          }

          console.log('Final photos array:', photos);
          return photos;
        })(),
        temoins: [],
        mesuresPrises: incident.mesuresPrises || 'Mesures prises selon protocole',
        statut: incident.statut || 'en_attente',
        latitude: incident.latitude || -18.1569,
        longitude: incident.longitude || 49.4085,
        personnesImpliquees: [],
        cameraId: incident.idCamera ? String(incident.idCamera) : undefined,
        camera: incident.camera ? {
          numeroSerie: incident.camera.numeroSerie || '',
          emplacement: incident.camera.emplacement || ''
        } : undefined,
        utilisateur: incident.utilisateur ? {
          nom: incident.utilisateur.nom || '',
          prenom: incident.utilisateur.prenom || ''
        } : undefined,
        validateur: incident.validateur ? {
          nom: incident.validateur.nom || '',
          prenom: incident.validateur.prenom || ''
        } : undefined,
        dateValidation: incident.dateValidation ? new Date(incident.dateValidation) : undefined,
        commentaireValidation: incident.commentaireValidation || undefined,
      };

      return {
        success: true,
        data: mappedIncident
      };
    }

    return response as ApiResponse<Incident>;
  }

  async getPersonneDetails(id: number): Promise<ApiResponse<any>> {
    return this.makeRequest(`/personnes/${id}`);
  }

  async addPersonne(data: any): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('nom', data.nom);
    formData.append('prenom', data.prenom);
    formData.append('CIN', data.CIN);
    formData.append('statut', data.statut);
    formData.append('faitAssocie', data.faitAssocie);

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

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: responseData.message || 'Erreur lors de l\'ajout',
        };
      }

      return {
        success: true,
        data: responseData.data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur de connexion au serveur',
      };
    }
  }

  async addInterpellation(personneId: number, data: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/personnes/${personneId}/interpellations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Rapports
  async getReports(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/rapports');
  }

  async generateReport(data: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/rapports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async downloadReport(id: number): Promise<ApiResponse<any>> {
    return this.makeRequest(`/rapports/${id}/download`);
  }

  // Utilisateurs (pour admin)
  async getUsers(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/users');
  }

  async addUser(data: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: number, data: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: number): Promise<ApiResponse<any>> {
    return this.makeRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async resetUserPassword(id: number): Promise<ApiResponse<any>> {
    return this.makeRequest(`/users/${id}/reset-password`, {
      method: 'POST',
    });
  }

  async toggleUserStatus(id: number): Promise<ApiResponse<any>> {
    return this.makeRequest(`/users/${id}/toggle-status`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();