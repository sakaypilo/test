import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:8000/api'; // Changez selon votre configuration

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Rediriger vers login si nécessaire
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface LoginRequest {
  matricule: string;
  motDePasse: string;
}

export interface LoginResponse {
  user: {
    idUtilisateur: number;
    matricule: string;
    nom: string;
    prenom: string;
    role: string;
    email: string;
    telephone: string;
  };
  token: string;
}

export const authAPI = {
  login: (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> =>
    api.post('/login', credentials).then(res => res.data),
  logout: (): Promise<ApiResponse> =>
    api.post('/logout').then(res => res.data),
  me: (): Promise<ApiResponse<LoginResponse['user']>> =>
    api.get('/me').then(res => res.data),
};

export const dashboardAPI = {
  getStats: (): Promise<ApiResponse> =>
    api.get('/dashboard').then(res => res.data),
};

export const incidentsAPI = {
  getAll: (params?: any): Promise<ApiResponse> =>
    api.get('/incidents', { params }).then(res => res.data),
  create: (data: FormData): Promise<ApiResponse> =>
    api.post('/incidents', data, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    }).then(res => res.data),
  validate: (id: number, data: any): Promise<ApiResponse> =>
    api.post(`/incidents/${id}/validate`, data).then(res => res.data),
};

export const camerasAPI = {
  getAll: (params?: any): Promise<ApiResponse> =>
    api.get('/cameras', { params }).then(res => res.data),
  create: (data: any): Promise<ApiResponse> =>
    api.post('/cameras', data).then(res => res.data),
};

export const personnesAPI = {
  getAll: (params?: any): Promise<ApiResponse> =>
    api.get('/personnes', { params }).then(res => res.data),
  create: (data: FormData): Promise<ApiResponse> =>
    api.post('/personnes', data, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    }).then(res => res.data),
};

export const rapportsAPI = {
  getAll: (): Promise<ApiResponse> =>
    api.get('/rapports').then(res => res.data),
  generateIncidentReport: (incidentId: number, data: any): Promise<ApiResponse> =>
    api.post(`/rapports/incidents/${incidentId}`, data).then(res => res.data),
};

export default api;