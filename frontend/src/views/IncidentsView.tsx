import React, { useState, useMemo } from 'react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useIncidentsStore } from '../stores/incidents'
import { useAuthStore } from '../stores/auth'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import { 
  Plus, 
  Filter, 
  Eye, 
  Check, 
  X 
} from 'lucide-react'

const IncidentsView: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<any>(null)

  const { incidents, isLoading, fetchIncidents, validateIncident, rejectIncident } = useIncidentsStore()
  const { user } = useAuthStore()

  const [filters, setFilters] = useState({
    statut: '',
    type: '',
    zone: '',
    date: ''
  })

  const canValidate = useMemo(() => 
    ['responsable', 'admin'].includes(user?.role || ''), [user?.role]
  )

  useEffect(() => {
    fetchIncidents()
  }, [fetchIncidents])

  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      if (filters.statut && incident.statut !== filters.statut) return false
      if (filters.type && incident.typeIncident !== filters.type) return false
      if (filters.zone && incident.zone !== filters.zone) return false
      if (filters.date) {
        const incidentDate = new Date(incident.dateHeure).toDateString()
        const filterDate = new Date(filters.date).toDateString()
        if (incidentDate !== filterDate) return false
      }
      return true
    })
  }, [incidents, filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    fetchIncidents({ ...filters, [key]: value })
  }

  const viewIncident = (incident: any) => {
    setSelectedIncident(incident)
  }

  return (
    <div className="flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64">
        <Header onToggleSidebar={() => setSidebarOpen(true)} />
        
        <main className="p-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Gestion des incidents</h1>
              <p className="text-secondary-600 mt-1">Suivi et validation des incidents signalés</p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filtres</span>
              </button>
              
              <Link to="/incidents/new" className="btn-primary flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Nouvel incident</span>
              </Link>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="card mb-6 animate-slide-up">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Statut</label>
                  <select 
                    value={filters.statut} 
                    onChange={(e) => handleFilterChange('statut', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Tous</option>
                    <option value="en_attente">En attente</option>
                    <option value="valide">Validé</option>
                    <option value="rejete">Rejeté</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Type</label>
                  <select 
                    value={filters.type} 
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Tous</option>
                    <option value="Intrusion">Intrusion</option>
                    <option value="Vol suspect">Vol suspect</option>
                    <option value="Vandalisme">Vandalisme</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Zone</label>
                  <select 
                    value={filters.zone} 
                    onChange={(e) => handleFilterChange('zone', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Toutes</option>
                    <option value="Zone Portuaire Nord">Zone Portuaire Nord</option>
                    <option value="Zone Portuaire Sud">Zone Portuaire Sud</option>
                    <option value="Zone Administrative">Zone Administrative</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Date</label>
                  <input 
                    type="date" 
                    value={filters.date} 
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="input-field" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Incidents List */}
          <div className="card">
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Incident
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Zone / Caméra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {filteredIncidents.map((incident) => (
                    <tr 
                      key={incident.idIncident}
                      className="hover:bg-secondary-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-secondary-900">
                            {incident.typeIncident}
                          </div>
                          <div className="text-sm text-secondary-500 max-w-xs truncate">
                            {incident.description}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-900">{incident.zone}</div>
                        <div className="text-sm text-secondary-500">
                          {incident.cameraInfo?.numeroSerie}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {new Date(incident.dateHeure).toLocaleDateString('fr-FR')}
                        <br />
                        <span className="text-secondary-500">
                          {new Date(incident.dateHeure).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`status-badge ${
                            incident.statut === 'valide' ? 'status-active' :
                            incident.statut === 'rejete' ? 'status-inactive' : 'status-pending'
                          }`}
                        >
                          {incident.statut.replace('_', ' ')}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => viewIncident(incident)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {incident.statut === 'en_attente' && canValidate && (
                          <>
                            <button
                              onClick={() => validateIncident(incident.idIncident)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => rejectIncident(incident.idIncident)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Incident Detail Modal */}
          {selectedIncident && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedIncident(null)}
            >
              <div 
                className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-secondary-900">
                      Détails de l'incident #{selectedIncident.idIncident}
                    </h3>
                    <button 
                      onClick={() => setSelectedIncident(null)}
                      className="text-secondary-400 hover:text-secondary-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700">Type</label>
                        <p className="text-secondary-900">{selectedIncident.typeIncident}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700">Statut</label>
                        <span 
                          className={`status-badge ${
                            selectedIncident.statut === 'valide' ? 'status-active' :
                            selectedIncident.statut === 'rejete' ? 'status-inactive' : 'status-pending'
                          }`}
                        >
                          {selectedIncident.statut.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Description</label>
                      <p className="text-secondary-900">{selectedIncident.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700">Zone</label>
                        <p className="text-secondary-900">{selectedIncident.zone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700">Date/Heure</label>
                        <p className="text-secondary-900">
                          {new Date(selectedIncident.dateHeure).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Caméra</label>
                      <p className="text-secondary-900">
                        {selectedIncident.cameraInfo?.numeroSerie} - 
                        {selectedIncident.cameraInfo?.emplacement}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default IncidentsView