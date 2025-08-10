import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth'
import logo from '../../assets/smmc.png'
import { 
  Camera, 
  LayoutDashboard, 
  AlertTriangle, 
  FileText, 
  Users, 
  UserCheck,
  // Settings,
  User,
  LogOut,
  X
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const navigationItems = React.useMemo(() => {
    const baseItems = [
      { name: 'Tableau de bord', path: '/', icon: LayoutDashboard },
      { name: 'Incidents', path: '/incidents', icon: AlertTriangle },
      { name: 'Personnes', path: '/persons', icon: UserCheck },
    ]

    const roleBasedItems = []

    if (['admin', 'technicien', 'responsable'].includes(user?.role || '')) {
      roleBasedItems.push({ name: 'Caméras', path: '/cameras', icon: Camera })
    }

    if (['responsable', 'admin'].includes(user?.role || '')) {
      roleBasedItems.push({ name: 'Rapports', path: '/reports', icon: FileText })
    }

    if (user?.role === 'admin') {
      roleBasedItems.push({ name: 'Utilisateurs', path: '/users', icon: Users })
      // roleBasedItems.push({ name: 'Paramètres', path: '/settings', icon: Settings })
    }

    return [...baseItems, ...roleBasedItems]
  }, [user?.role])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div 
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-secondary-200">
        <div className="flex items-center space-x-3">
          
            <img src={logo} alt="Logo SMMC" className="w-10 h-10" />
          
          <div>
            <h1 className="text-lg font-bold text-secondary-900">SMMC</h1>
            <p className="text-xs text-secondary-500">Security Platform</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="lg:hidden p-1 rounded-md hover:bg-secondary-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                  : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-secondary-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-secondary-900">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-xs text-secondary-500 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 rounded-md hover:bg-secondary-100 text-secondary-400 hover:text-secondary-600"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar