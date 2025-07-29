import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCamerasStore } from '../stores/cameras'
import { useIncidentsStore } from '../stores/incidents'
import { useApi } from '../hooks/useApi'
import { dashboardAPI } from '../services/api'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import { 
  Camera, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Plus, 
  UserCheck 
} from 'lucide-react'

const DashboardView: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { cameras, getCamerasByStatus, fetchCameras } = useCamerasStore()
  const { incidents, fetchIncidents } = useIncidentsStore()

  // Utiliser les API réelles pour les statistiques du dashboard
  const { 
    loading: statsLoading, 
    error: statsError,
    execute: fetchDashboardStats 
  } = useApi(dashboardAPI.getStats)

  // Charger les données au montage du composant
  useEffect(() => {
    fetchCameras()
    fetchIncidents()
    fetchDashboardStats()
  }, [])

  const activeCameras = getCamerasByStatus('actif').length
  const recentIncidents = incidents.slice(0, 5)
  const monthlyIncidents = incidents.length
  const pendingIncidents = incidents.filter(i => i.statut === 'en_attente').length
  const totalReports = incidents.filter(i => i.statut === 'valide').length

  if (statsLoading) {
    return (
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-64">
          <Header onToggleSidebar={() => setSidebarOpen(true)} />
          <main className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-secondary-600">Chargement...</div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (statsError) {
    return (
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-64">
          <Header onToggleSidebar={() => setSidebarOpen(true)} />
          <main className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">Erreur: {statsError}</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64">
        <Header onToggleSidebar={() => setSidebarOpen(true)} />
        
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-600">Caméras actives</p>
                  <p className="text-2xl font-bold text-secondary-900">{activeCameras}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Camera className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-600">Incidents ce mois</p>
                  <p className="text-2xl font-bold text-secondary-900">{monthlyIncidents}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-600">En attente de validation</p>
                  <p className="text-2xl font-bold text-secondary-900">{pendingIncidents}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-600">Rapports générés</p>
                  <p className="text-2xl font-bold text-secondary-900">{totalReports}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Incidents */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-secondary-900">Incidents récents</h2>
                <Link 
                  to="/incidents" 
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Voir tout
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentIncidents.map((incident) => (
                  <div 
                    key={incident.idIncident}
                    className="flex items-center space-x-4 p-3 bg-secondary-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-secondary-900">{incident.typeIncident}</p>
                      <p className="text-sm text-secondary-600">{incident.zone}</p>
                      <p className="text-xs text-secondary-500">
                        {new Date(incident.dateHeure).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <span 
                      className={`status-badge ${
                        incident.statut === 'valide' ? 'status-active' :
                        incident.statut === 'rejete' ? 'status-inactive' : 'status-pending'
                      }`}
                    >
                      {incident.statut.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Camera Status */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-secondary-900">État des caméras</h2>
                <Link 
                  to="/cameras" 
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Gérer
                </Link>
              </div>
              
              <div className="space-y-4">
                {cameras.slice(0, 5).map((camera) => (
                  <div 
                    key={camera.idCamera}
                    className="flex items-center space-x-4 p-3 bg-secondary-50 rounded-lg"
                  >
                    <div 
                      className={`w-3 h-3 rounded-full ${
                        camera.statut === 'actif' ? 'bg-green-400' :
                        camera.statut === 'panne' ? 'bg-red-400' : 'bg-yellow-400'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-secondary-900">{camera.numeroSerie}</p>
                      <p className="text-sm text-secondary-600">{camera.zone}</p>
                    </div>
                    <span 
                      className={`status-badge ${
                        camera.statut === 'actif' ? 'status-active' :
                        camera.statut === 'panne' ? 'status-inactive' : 'status-pending'
                      }`}
                    >
                      {camera.statut}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Actions rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                to="/incidents/new" 
                className="card hover:bg-primary-50 hover:border-primary-200 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">Signaler un incident</p>
                    <p className="text-sm text-secondary-600">Enregistrer un nouvel incident</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                to="/reports" 
                className="card hover:bg-primary-50 hover:border-primary-200 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">Générer un rapport</p>
                    <p className="text-sm text-secondary-600">Créer un rapport PDF</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                to="/persons" 
                className="card hover:bg-primary-50 hover:border-primary-200 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">Personnes appréhendées</p>
                    <p className="text-sm text-secondary-600">Gérer les interpellations</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardView