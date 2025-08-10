import { ApiResponse, User, Camera, Incident, EfaTratra, DashboardStats } from '@/types';
import { useAuthStore } from '@/stores/auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

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
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          user: {
            id: response.data.user.idUtilisateur.toString(),
            matricule: response.data.user.matricule,
            nom: response.data.user.nom,
            prenom: response.data.user.prenom,
            email: response.data.user.email,
            telephone: response.data.user.telephone,
            role: response.data.user.role === 'agent' ? 'agent' : 'technicien',
            isActive: true,
          },
          token: response.data.token,
          refreshToken: response.data.token, // Laravel Sanctum n'utilise pas de refresh token
        }
      };
    }

    return response;
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
    const response = await this.makeRequest('/dashboard');

    if (response.success && response.data) {
      // Adapter les données Laravel au format mobile
      const stats = response.data.statistiques;
      return {
        success: true,
        data: {
          camerasTotal: stats.cameras.total,
          camerasEnLigne: stats.cameras.actives,
          camerasHorsLigne: stats.cameras.hors_ligne + stats.cameras.en_panne,
          incidentsTotal: stats.incidents.total,
          incidentsDuMois: stats.incidents.ce_mois,
          efaTratraTotal: stats.personnes.total,
          zonesRisque: response.data.cameras_par_zone ? 
            Object.entries(response.data.cameras_par_zone).map(([zone, data]: [string, any]) => ({
              zone,
              incidents: data.reduce((sum: number, item: any) => sum + item.count, 0)
            })) : []
        }
      };
    }

    return response;
  }

  // Cameras - Utilise les endpoints Laravel
  async getCameras(): Promise<ApiResponse<Camera[]>> {
    const response = await this.makeRequest('/cameras');

    if (response.success && response.data) {
      // Adapter les données Laravel au format mobile
      const cameras = response.data.map((camera: any) => ({
        id: camera.idCamera.toString(),
        numero: camera.numeroSerie,
        zone: camera.zone,
        emplacement: camera.emplacement,
        ip: camera.adresseIP,
        statut: camera.statut === 'actif' ? 'en_ligne' : 
                camera.statut === 'panne' ? 'maintenance' : 'hors_ligne',
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

    return response;
  }

  async getCamera(id: string): Promise<ApiResponse<Camera>> {
    const response = await this.makeRequest(`/cameras/${id}`);

    if (response.success && response.data) {
      const camera = response.data;
      return {
        success: true,
        data: {
          id: camera.idCamera.toString(),
          numero: camera.numeroSerie,
          zone: camera.zone,
          emplacement: camera.emplacement,
          ip: camera.adresseIP,
          statut: camera.statut === 'actif' ? 'en_ligne' : 
                  camera.statut === 'panne' ? 'maintenance' : 'hors_ligne',
          dateInstallation: new Date(camera.dateInstallation),
          latitude: -18.1569,
          longitude: 49.4085,
          historiquePannes: [],
          historiqueMutations: [],
        }
      };
    }

    return response;
  }

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

    if (response.success && response.data) {
      const newCamera = response.data;
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

    return response;
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

    if (response.success && response.data) {
      // Adapter les données Laravel au format mobile
      const incidents = response.data.map((incident: any) => ({
        id: incident.idIncident.toString(),
        type: incident.typeIncident.toLowerCase().replace(' ', '_'),
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
      }));

      return {
        success: true,
        data: incidents
      };
    }

    return response;
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

    if (response.success && response.data) {
      // Adapter les données Laravel au format mobile
      const efaTratra = response.data.map((personne: any) => ({
        id: personne.idPersonne.toString(),
        nom: personne.nom,
        prenom: personne.prenom,
        age: null, // Non disponible dans Laravel
        adresse: null, // Non disponible dans Laravel
        telephone: null, // Non disponible dans Laravel
        photo: personne.photo,
        faitsAssocies: personne.interpellations?.map((i: any) => i.faitAssocie) || [],
        dateApprehension: personne.interpellations?.[0]?.dateHeure ? 
          new Date(personne.interpellations[0].dateHeure) : new Date(),
        agent: personne.interpellations?.[0]?.utilisateur ? 
          `${personne.interpellations[0].utilisateur.prenom} ${personne.interpellations[0].utilisateur.nom}` : 
          'Agent inconnu',
        statut: 'en_garde_a_vue', // Statut par défaut
        observations: personne.interpellations?.map((i: any) => i.faitAssocie).join('; ') || '',
      }));

      return {
        success: true,
        data: efaTratra
      };
    }

    return response;
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

    if (response.success && response.data) {
      return {
        success: true,
        data: {
          id: response.data.user.idUtilisateur.toString(),
          matricule: response.data.user.matricule,
          nom: response.data.user.nom,
          prenom: response.data.user.prenom,
          email: response.data.user.email,
          telephone: response.data.user.telephone,
          role: response.data.user.role === 'agent' ? 'agent' : 'technicien',
          isActive: true,
        }
      };
    }

    return response;
  }
}

export const apiService = new ApiService();