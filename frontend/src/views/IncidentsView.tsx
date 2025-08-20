import React, { useState, useMemo } from 'react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useIncidentsStore } from '../stores/incidents'
import { useAuthStore } from '../stores/auth'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal'
import { 
  Plus, 
  Filter, 
  Eye, 
  Check, 
  X,
  Edit,
  Trash2
} from 'lucide-react'

const IncidentsView: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<any>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
  const [bulkEditData, setBulkEditData] = useState({ typeIncident: '', zone: '', dateHeure: '', description: '' })
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')

  const { incidents, isLoading, fetchIncidents, validateIncident, rejectIncident, bulkUpdateIncidents, bulkDeleteIncidents } = useIncidentsStore()
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

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredIncidents.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredIncidents.map(i => i.idIncident))
    }
  }

  const toggleSelectOne = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const openBulkEdit = () => {
    setBulkEditData({ typeIncident: '', zone: '', dateHeure: '', description: '' })
    setIsBulkEditOpen(true)
  }

  const applyBulkEdit = async () => {
    await bulkUpdateIncidents({ ids: selectedIds, ...Object.fromEntries(Object.entries(bulkEditData).filter(([_, v]) => v)) })
    setIsBulkEditOpen(false)
    setSelectedIds([])
  }

  const openBulkDelete = () => {
    setIsDeleteModalOpen(true)
  }

  const confirmBulkDelete = async (reason?: string) => {
    setIsBulkDeleting(true)
    await bulkDeleteIncidents({ ids: selectedIds, reason: reason || deleteReason || undefined })
    setIsBulkDeleting(false)
    setSelectedIds([])
    setDeleteReason('')
    setIsDeleteModalOpen(false)
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
            
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-3 items-center">
              {selectedIds.length > 0 && (
                <>
                  <button
                    onClick={openBulkEdit}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Modifier ({selectedIds.length})</span>
                  </button>
                  <button
                    onClick={openBulkDelete}
                    className="btn-secondary flex items-center space-x-2"
                    disabled={isBulkDeleting}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{isBulkDeleting ? 'Suppression...' : `Supprimer (${selectedIds.length})`}</span>
                  </button>
                </>
              )}
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
                    <th className="px-2 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredIncidents.length && filteredIncidents.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
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
                      <td className="px-2 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(incident.idIncident)}
                          onChange={() => toggleSelectOne(incident.idIncident)}
                        />
                      </td>
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

          {/* Bulk Edit Modal */}
          {isBulkEditOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setIsBulkEditOpen(false)}
            >
              <div 
                className="bg-white rounded-xl max-w-lg w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-secondary-900">Modifier {selectedIds.length} incident(s)</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Type (optionnel)</label>
                    <select
                      value={bulkEditData.typeIncident}
                      onChange={(e) => setBulkEditData(v => ({ ...v, typeIncident: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">Ne pas changer</option>
                      <option value="Intrusion">Intrusion</option>
                      <option value="Vol suspect">Vol suspect</option>
                      <option value="Vandalisme">Vandalisme</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Zone (optionnel)</label>
                    <input
                      type="text"
                      value={bulkEditData.zone}
                      onChange={(e) => setBulkEditData(v => ({ ...v, zone: e.target.value }))}
                      className="input-field"
                      placeholder="Ne pas changer si vide"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Date/Heure (optionnel)</label>
                    <input
                      type="datetime-local"
                      value={bulkEditData.dateHeure}
                      onChange={(e) => setBulkEditData(v => ({ ...v, dateHeure: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Description (optionnel)</label>
                    <textarea
                      value={bulkEditData.description}
                      onChange={(e) => setBulkEditData(v => ({ ...v, description: e.target.value }))}
                      className="input-field"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t bg-secondary-50">
                  <button className="btn-secondary" onClick={() => setIsBulkEditOpen(false)}>Annuler</button>
                  <button className="btn-primary" onClick={applyBulkEdit}>Appliquer</button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirm Modal */}
          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmBulkDelete}
            title={`Supprimer ${selectedIds.length} incident(s)`}
            message="Ces incidents seront déplacés vers la corbeille. Vous pourrez les restaurer depuis la corbeille."
            isPermanent={false}
            isLoading={isBulkDeleting}
          />

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