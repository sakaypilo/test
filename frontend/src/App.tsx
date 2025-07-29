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
  const { token, user, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au démarrage
    if (token && !user) {
      // Ici, vous pourriez faire un appel API pour récupérer les infos utilisateur
      // Pour la démo, on redirige vers login
      logout()
      navigate('/login')
    }
  }, [token, user, logout, navigate])

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