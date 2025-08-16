import axios from 'axios'

export type UserRole = 'admin' | 'agent' | 'technicien' | 'responsable'

const API_BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  pagination?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface LoginRequest {
  matricule: string
  motDePasse: string
}

export interface LoginResponse {
  user: {
    idUtilisateur: number
    matricule: string
    nom: string
    prenom: string
    role: UserRole
    email: string
    telephone: string
  }
  token: string
}

export const authAPI = {
  login: (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> =>
  api.post('/login', credentials).then(res => {
    const data = res.data
    // Si le backend renvoie user et token à la racine, on les place dans data
    return {
      success: data.success,
      data: {
        user: data.user,
        token: data.token
      },
      message: data.message
    }
  }),

  logout: (): Promise<ApiResponse> =>
    api.post('/logout').then(res => res.data),
  me: (): Promise<ApiResponse<LoginResponse['user']>> =>
    api.get('/me').then(res => res.data),
}

export const dashboardAPI = {
  getStats: (): Promise<ApiResponse> =>
    api.get('/dashboard').then(res => res.data),
  getAlertes: (): Promise<ApiResponse> =>
    api.get('/dashboard/alertes').then(res => res.data),
}

export const incidentsAPI = {
  getAll: (params?: { statut?: string; type?: string; zone?: string; date?: string; page?: number }): Promise<ApiResponse> =>
    api.get('/incidents', { params }).then(res => res.data),
  getById: (id: number): Promise<ApiResponse> =>
    api.get(`/incidents/${id}`).then(res => res.data),
  create: (data: FormData): Promise<ApiResponse> =>
    api.post('/incidents', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
  validate: (id: number, data: { statut: 'valide' | 'rejete'; commentaire?: string }): Promise<ApiResponse> =>
    api.post(`/incidents/${id}/validate`, data).then(res => res.data),
  getStatistics: (): Promise<ApiResponse> =>
    api.get('/incidents-statistics').then(res => res.data),
}

export const camerasAPI = {
  getAll: (params?: { statut?: string; zone?: string }): Promise<ApiResponse> =>
    api.get('/cameras', { params }).then(res => res.data),
  getById: (id: number): Promise<ApiResponse> =>
    api.get(`/cameras/${id}`).then(res => res.data),
  create: (data: { numeroSerie: string; adresseIP: string; zone: string; emplacement: string; dateInstallation: string }): Promise<ApiResponse> =>
    api.post('/cameras', data).then(res => res.data),
  update: (id: number, data: any): Promise<ApiResponse> =>
    api.put(`/cameras/${id}`, data).then(res => res.data),
  delete: (id: number): Promise<ApiResponse> =>
    api.delete(`/cameras/${id}`).then(res => res.data),
  getStatistics: (): Promise<ApiResponse> =>
    api.get('/cameras-statistics').then(res => res.data),
}

export const personnesAPI = {
  getAll: (params?: { statut?: string; search?: string; page?: number }): Promise<ApiResponse> =>
    api.get('/personnes', { params }).then(res => res.data),
  getById: (id: number): Promise<ApiResponse> =>
    api.get(`/personnes/${id}`).then(res => res.data),
  create: (data: FormData): Promise<ApiResponse> =>
    api.post('/personnes', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
  update: (id: number, data: FormData): Promise<ApiResponse> =>
    api.post(`/personnes/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
  addInterpellation: (id: number, data: { faitAssocie: string }): Promise<ApiResponse> =>
    api.post(`/personnes/${id}/interpellations`, data).then(res => res.data),
  getStatistics: (): Promise<ApiResponse> =>
    api.get('/personnes-statistics').then(res => res.data),
}

export const rapportsAPI = {
  getAll: (): Promise<ApiResponse> =>
    api.get('/rapports').then(res => res.data),
  generateIncidentReport: (incidentId: number, data: any): Promise<ApiResponse> =>
    api.post(`/rapports/incidents/${incidentId}`, data).then(res => res.data),
  downloadReport: (reportId: number): Promise<Blob> =>
    api.get(`/rapports/${reportId}/download`, { responseType: 'blob' }).then(res => res.data),
}

export const usersAPI = {
  getAll: (params?: { role?: string; actif?: boolean; search?: string; page?: number }): Promise<ApiResponse> =>
    api.get('/users', { params }).then(res => res.data),
  getById: (id: number): Promise<ApiResponse> =>
    api.get(`/users/${id}`).then(res => res.data),
  create: (data: FormData): Promise<ApiResponse> =>
    api.post('/users', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
  update: (id: number, data: FormData): Promise<ApiResponse> =>
    api.put(`/users/${id}`, data).then(res => res.data),
  resetPassword: (id: number): Promise<ApiResponse> =>
    api.post(`/users/${id}/reset-password`).then(res => res.data),
  toggleStatus: (id: number): Promise<ApiResponse> =>
    api.post(`/users/${id}/toggle-status`).then(res => res.data),
  getStatistics: (): Promise<ApiResponse> =>
    api.get('/users-statistics').then(res => res.data),
}

// API pour la corbeille
export const trashAPI = {
  getAll: (type?: string): Promise<ApiResponse> =>
    api.get('/trash', { params: { type } }).then(res => res.data),
  restore: (type: string, id: number): Promise<ApiResponse> =>
    api.post(`/trash/${type}/${id}/restore`).then(res => res.data),
  permanentDelete: (type: string, id: number): Promise<ApiResponse> =>
    api.delete(`/trash/${type}/${id}/permanent`).then(res => res.data),
  emptyTrash: (daysOld?: number): Promise<ApiResponse> =>
    api.post('/trash/empty', { days_old: daysOld }).then(res => res.data)
}

export default api
