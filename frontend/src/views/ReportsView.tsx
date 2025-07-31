import React, { useState, useEffect } from 'react'
import { useIncidentsStore } from '../stores/incidents'
import { useAuthStore } from '../stores/auth'
import { useApi } from '../hooks/useApi'
import { rapportsAPI } from '../services/api'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import { FileText, Download, X } from 'lucide-react'

const ReportsView: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showGenerateForm, setShowGenerateForm] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<any>(null)
  const [reportNotes, setReportNotes] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { incidents, fetchIncidents } = useIncidentsStore()
  const { user } = useAuthStore()

  // Utiliser les API réelles pour les rapports
  const { 
    data: generatedReports, 
    loading: reportsLoading, 
    error: reportsError,
    execute: fetchReports 
  } = useApi(rapportsAPI.getAll)

  // Charger les données au montage du composant
  useEffect(() => {
    fetchIncidents()
    fetchReports()
  }, [])

  const validatedIncidents = incidents.filter(incident => incident.statut === 'valide')

  const hasReport = (incidentId: number) => {
    return generatedReports?.some((report: any) => report.idIncident === incidentId) || false
  }

  const generateReport = (incident: any) => {
    setSelectedIncident(incident)
    setShowGenerateForm(true)
    setReportNotes('')
    setError(null)
  }

  const confirmGenerateReport = async () => {
    if (!selectedIncident) return
    
    setIsGenerating(true)
    setError(null)
    
    try {
      const reportData = {
        observations: reportNotes
      }

      const response = await rapportsAPI.generateIncidentReport(selectedIncident.idIncident, reportData)
      
      if (response.success) {
        // Recharger la liste des rapports
        await fetchReports()
        
        setShowGenerateForm(false)
        setSelectedIncident(null)
        setReportNotes('')
      } else {
        setError(response.message || 'Erreur lors de la génération du rapport')
      }
    } catch (error) {
      setError('Erreur de connexion lors de la génération du rapport')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadReport = (incidentId: number) => {
    const report = generatedReports?.find((r: any) => r.idIncident === incidentId)
    if (report) {
      // Créer un lien de téléchargement
      const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/rapports/${report.idRapport}/download`
      window.open(downloadUrl, '_blank')
    }
  }

  if (reportsLoading) {
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

  if (reportsError) {
    return (
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-64">
          <Header onToggleSidebar={() => setSidebarOpen(true)} />
          <main className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">Erreur: {reportsError}</p>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Gestion des rapports</h1>
              <p className="text-secondary-600 mt-1">Génération et validation des rapports d'incidents</p>
            </div>
            
            <button
              onClick={() => setShowGenerateForm(true)}
              className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
            >
              <FileText className="w-4 h-4" />
              <span>Générer rapport</span>
            </button>
          </div>

          {/* Validated Incidents for Reports */}
          <div className="card">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">
              Incidents validés disponibles pour rapport
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Incident
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Rapport
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {validatedIncidents.map((incident) => (
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
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {incident.zone}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {new Date(incident.dateHeure).toLocaleDateString('fr-FR')}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`status-badge ${
                            hasReport(incident.idIncident) ? 'status-active' : 'status-pending'
                          }`}
                        >
                          {hasReport(incident.idIncident) ? 'Généré' : 'En attente'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {!hasReport(incident.idIncident) ? (
                          <button
                            onClick={() => generateReport(incident)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => downloadReport(incident.idIncident)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statistiques des rapports */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Rapports générés</p>
                  <p className="text-2xl font-bold text-secondary-900">{generatedReports?.length || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Incidents validés</p>
                  <p className="text-2xl font-bold text-secondary-900">{validatedIncidents.length}</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">En attente de rapport</p>
                  <p className="text-2xl font-bold text-secondary-900">
                    {validatedIncidents.filter(i => !hasReport(i.idIncident)).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Report Generation Modal */}
          {showGenerateForm && selectedIncident && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowGenerateForm(false)}
            >
              <div
                className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-secondary-900">
                      Générer rapport - Incident #{selectedIncident.idIncident}
                    </h3>
                    <button
                      onClick={() => setShowGenerateForm(false)}
                      className="text-secondary-400 hover:text-secondary-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Report Preview */}
                  <div className="space-y-6">
                    <div className="bg-secondary-50 p-4 rounded-lg">
                      <h4 className="font-medium text-secondary-900 mb-3">Aperçu du rapport</h4>
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}
                  
                      
                      <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium">Numéro:</span>
                            RPT-{selectedIncident.idIncident}-{new Date().getFullYear()}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span>
                            {new Date().toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium">Type d'incident:</span>
                          {selectedIncident.typeIncident}
                        </div>
                        
                        <div>
                          <span className="font-medium">Description:</span>
                          {selectedIncident.description}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium">Zone:</span>
                            {selectedIncident.zone}
                          </div>
                          <div>
                            <span className="font-medium">Date incident:</span>
                            {new Date(selectedIncident.dateHeure).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium">Caméra:</span>
                          {selectedIncident.cameraInfo?.numeroSerie} - 
                          {selectedIncident.cameraInfo?.emplacement}
                        </div>
                        
                        <div>
                          <span className="font-medium">Photos jointes:</span>
                          {selectedIncident.photos.length} photo(s)
                        </div>
                      </div>
                    </div>
                    
                    <div>
                        
                        <div>
                          <span className="font-medium">Validé par:</span>
                          {user?.prenom} {user?.nom} ({user?.role})
                        </div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Observations complémentaires
                      </label>
                      <textarea
                        value={reportNotes}
                        onChange={(e) => setReportNotes(e.target.value)}
                        rows={4}
                        className="input-field"
                        placeholder="Ajouter des observations pour le rapport..."
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={confirmGenerateReport}
                        disabled={isGenerating}
                        className="btn-primary flex-1 disabled:opacity-50"
                      >
                        {isGenerating ? 'Génération...' : 'Générer et valider'}
                      </button>
                      <button
                        onClick={() => setShowGenerateForm(false)}
                        className="btn-secondary px-6"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {validatedIncidents.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                <p className="text-secondary-500">Aucun incident validé disponible pour rapport</p>
              </div>
            )}
          )}
        </main>
      </div>
    </div>
  )
}

export default ReportsView