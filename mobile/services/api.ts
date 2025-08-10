import { ApiResponse, User, Camera, Incident, EfaTratra, DashboardStats } from '@/types';
import { useAuthStore } from '@/stores/auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.smmc-port.mg';

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

  // Authentication
  async login(matricule: string, password: string): Promise<ApiResponse<{ user: User; token: string; refreshToken: string }>> {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ matricule, password }),
    });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    return this.makeRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async resetPassword(email: string): Promise<ApiResponse<null>> {
    return this.makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async logout(): Promise<ApiResponse<null>> {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
    });
  }

  // Dashboard
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.makeRequest('/dashboard/stats');
  }

  // Cameras
  async getCameras(): Promise<ApiResponse<Camera[]>> {
    return this.makeRequest('/cameras');
  }

  async getCamera(id: string): Promise<ApiResponse<Camera>> {
    return this.makeRequest(`/cameras/${id}`);
  }

  async createCamera(camera: Omit<Camera, 'id'>): Promise<ApiResponse<Camera>> {
    return this.makeRequest('/cameras', {
      method: 'POST',
      body: JSON.stringify(camera),
    });
  }

  async updateCamera(id: string, updates: Partial<Camera>): Promise<ApiResponse<Camera>> {
    return this.makeRequest(`/cameras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCamera(id: string): Promise<ApiResponse<null>> {
    return this.makeRequest(`/cameras/${id}`, {
      method: 'DELETE',
    });
  }

  // Incidents
  async getIncidents(): Promise<ApiResponse<Incident[]>> {
    return this.makeRequest('/incidents');
  }

  async createIncident(incident: Omit<Incident, 'id'>): Promise<ApiResponse<Incident>> {
    return this.makeRequest('/incidents', {
      method: 'POST',
      body: JSON.stringify(incident),
    });
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<ApiResponse<Incident>> {
    return this.makeRequest(`/incidents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Efa Tratra
  async getEfaTratra(): Promise<ApiResponse<EfaTratra[]>> {
    return this.makeRequest('/efa-tratra');
  }

  async createEfaTratra(efa: Omit<EfaTratra, 'id'>): Promise<ApiResponse<EfaTratra>> {
    return this.makeRequest('/efa-tratra', {
      method: 'POST',
      body: JSON.stringify(efa),
    });
  }

  async updateEfaTratra(id: string, updates: Partial<EfaTratra>): Promise<ApiResponse<EfaTratra>> {
    return this.makeRequest(`/efa-tratra/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // File upload
  async uploadPhoto(uri: string): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('photo', {
      uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);

    const { token } = useAuthStore.getState();

    const response = await fetch(`${API_BASE_URL}/upload/photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Erreur lors du téléchargement',
      };
    }

    return {
      success: true,
      data: data.data,
    };
  }
}

export const apiService = new ApiService();