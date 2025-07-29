import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'

interface HeaderProps {
  onToggleSidebar: () => void
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation()
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('fr-FR'))

  const pageTitle = React.useMemo(() => {
    const titles: Record<string, string> = {
      '/': 'Tableau de bord',
      '/cameras': 'Gestion des caméras',
      '/incidents': 'Gestion des incidents',
      '/incidents/new': 'Nouvel incident',
      '/reports': 'Rapports',
      '/persons': 'Personnes appréhendées',
      '/users': 'Gestion des utilisateurs'
    }
    return titles[location.pathname] || 'SMMC Security'
  }, [location.pathname])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('fr-FR'))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <header className="bg-white shadow-sm border-b border-secondary-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-secondary-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div>
          <h1 className="text-xl font-semibold text-secondary-900">{pageTitle}</h1>
          <p className="text-sm text-secondary-500">Port de Toamasina - Sécurité</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        {/* <button className="relative p-2 rounded-md hover:bg-secondary-100">
          <Bell className="w-5 h-5 text-secondary-600" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </button> */}

        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-secondary-600">En ligne</span>
        </div>

        {/* Current Time */}
        <div className="text-sm text-secondary-600">
          {currentTime}
        </div>
      </div>
    </header>
  )
}

export default Header