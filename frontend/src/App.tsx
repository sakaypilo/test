import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from './stores/auth'
import LoginView from './views/LoginView'
import DashboardView from './views/DashboardView'
import CamerasView from './views/CamerasView'
import IncidentsView from './views/IncidentsView'
import NewIncidentView from './views/NewIncidentView'
import ReportsView from './views/ReportsView'
import PersonsView from './views/PersonsView'
import UsersView from './views/UsersView'

function App() {
  const { token, user, isInitialized, initialize } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    // Initialiser l'authentification au démarrage
    if (!isInitialized) {
      initialize()
    }
  }, [isInitialized, initialize])

  // Rediriger vers login si pas authentifié après initialisation
  useEffect(() => {
    if (isInitialized && !token) {
      navigate('/login')
    }
  }, [isInitialized, token, navigate])

  // Afficher un loader pendant l'initialisation
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-secondary-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route 
          path="/" 
          element={token ? <DashboardView /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/cameras" 
          element={token ? <CamerasView /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/incidents" 
          element={token ? <IncidentsView /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/incidents/new" 
          element={token ? <NewIncidentView /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/reports" 
          element={token ? <ReportsView /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/persons" 
          element={token ? <PersonsView /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/users" 
          element={token ? <UsersView /> : <Navigate to="/login" />} 
        />
      </Routes>
    </div>
  )
}

export default App