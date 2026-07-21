import React, { useState, useEffect } from 'react'
import { useIncidentsStore } from '../stores/incidents'
import { useAuthStore } from '../stores/auth'
import { useApi } from '../hooks/useApi'
import { rapportsAPI, getIncidentPhotoUrl, default as api } from '../services/api'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import { FileText, Download, X, AlertCircle, CheckCircle } from 'lucide-react'

const ReportsView: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showGenerateForm, setShowGenerateForm] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<any>(null)
  const [reportNotes, setReportNotes] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [zone, setZone] = useState('')
  const [exporting, setExporting] = useState(false)

  const { incidents, fetchIncidents } = useIncidentsStore()
  const { user } = useAuthStore()

  const { 
    data: generatedReports, 
    loading: reportsLoading, 
    error: reportsError,
    execute: fetchReports 
  } = useApi(rapportsAPI.getAll)

  useEffect(() => {
    fetchIncidents()
    fetchReports()
  }, [])

  const validatedIncidents = incidents
    .filter(incident => incident.statut === 'valide')
    .filter(incident => !zone || incident.zone === zone)

  const hasReport = (incidentId: number) => {
    return generatedReports?.some((report: any) => report.idIncident === incidentId) || false
  }

  const canRunRange = fromDate && toDate && new Date(fromDate) <= new Date(toDate)

  const applyRangeFilter = async () => {
    if (!canRunRange) return
    setError(null)
    await fetchIncidents({ from: fromDate, to: toDate, zone: zone || undefined })
  }

  const exportIncidentsByDateRange = async (): Promise<Blob> => {
    const params: any = {}
    if (fromDate) params.from = fromDate
    if (toDate) params.to = toDate
    if (zone) params.zone = zone
    const response = await api.get('/rapports/incidents/export', { params, responseType: 'blob' })
    return response.data
  }

  const downloadCSV = async () => {
    if (!canRunRange) {
      setError("Veuillez sélectionner une plage de dates valide.")
      return
    }
    setError(null)
    setExporting(true)
    try {
      const blob = await exportIncidentsByDateRange()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `incidents_${fromDate}_au_${toDate}${zone ? `_zone_${zone.replace(/\s/g,'_')}` : ''}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (e) {
      setError('Erreur lors de l\'export CSV')
    } finally {
      setExporting(false)
    }
  }

  const generateReport = (incident: any) => {
    setSelectedIncident(incident)
    setShowGenerateForm(true)
    setReportNotes('')
    setError(null)
    setSuccess(null)
  }

  const confirmGenerateReport = async () => {
    if (!selectedIncident) return
    
    setIsGenerating(true)
    setError(null)
    setSuccess(null)
    
    try {
      const reportData = {
        observations: reportNotes
      }

      console.log('Génération rapport pour incident:', selectedIncident.idIncident)
      const response = await rapportsAPI.generateIncidentReport(selectedIncident.idIncident, reportData)
      
      if (response.success) {
        setSuccess('Rapport généré avec succès !')
        
        await fetchReports()
        
        setTimeout(() => {
          setShowGenerateForm(false)
          setSelectedIncident(null)
          setReportNotes('')
          setSuccess(null)
        }, 2000)
      } else {
        setError(response.message || 'Erreur lors de la génération du rapport')
      }
    } catch (error: any) {
      console.error('Erreur génération rapport:', error)
      setError(error.response?.data?.message || 'Erreur de connexion lors de la génération du rapport')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadReport = async (incidentId: number) => {
    if (reportsLoading || !generatedReports) {
      setError('Les rapports sont en cours de chargement...')
      return
    }

    const report = generatedReports.find((r: any) => r.idIncident === incidentId || r.incident?.idIncident === incidentId)
    if (!report) {
      setError('Rapport introuvable pour cet incident')
      return
    }

    try {
      const blob = await rapportsAPI.downloadReport(report.idRapport)
      if (!(blob instanceof Blob)) {
        throw new Error('La réponse du serveur n\'est pas un fichier PDF valide')
      }

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `rapport_incident_${incidentId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error('Erreur téléchargement:', error)
      setError(error?.message || 'Erreur lors du téléchargement du rapport')
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
          </div>

          {/* Filtre plage de dates + zone + export */}
          <div className="card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-2">Du</label>
                <input type="date" className="input-field" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-2">Au</label>
                <input type="date" className="input-field" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-2">Zone</label>
                <select className="input-field" value={zone} onChange={(e) => setZone(e.target.value)}>
                  <option value="">Toutes</option>
                  <option value="Zone Portuaire Nord">Zone Portuaire Nord</option>
                  <option value="Zone Portuaire Sud">Zone Portuaire Sud</option>
                  <option value="Zone Administrative">Zone Administrative</option>
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={applyRangeFilter} disabled={!canRunRange} className="btn-secondary w-full disabled:opacity-50">
                  Afficher
                </button>
              </div>
              <div className="flex items-end">
                <button onClick={downloadCSV} disabled={!canRunRange || exporting} className="btn-primary w-full disabled:opacity-50">
                  {exporting ? 'Export...' : 'Exporter CSV'}
                </button>
              </div>
            </div>
          </div>

          {reportsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-700">Erreur: {reportsError}</p>
              </div>
            </div>
          )}

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
                  <CheckCircle className="w-6 h-6 text-green-600" />
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

          {/* Validated Incidents for Reports */}
          <div className="card">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">
              Incidents validés disponibles pour rapport
            </h2>
            
            {validatedIncidents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                <p className="text-secondary-500">Aucun incident validé disponible pour rapport</p>
              </div>
            ) : (
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
                              className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                              title="Générer rapport"
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Générer
                            </button>
                          ) : (
                            <button
                              onClick={() => downloadReport(incident.idIncident)}
                              className="text-green-600 hover:text-green-900 inline-flex items-center"
                              title="Télécharger rapport"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Télécharger
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Report Generation Modal */}
          {showGenerateForm && selectedIncident && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => !isGenerating && setShowGenerateForm(false)}
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
                    {!isGenerating && (
                      <button
                        onClick={() => setShowGenerateForm(false)}
                        className="text-secondary-400 hover:text-secondary-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <p className="text-green-700 text-sm">{success}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <div className="bg-secondary-50 p-4 rounded-lg">
                      <h4 className="font-medium text-secondary-900 mb-3">Aperçu du rapport</h4>
                      
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
                          <span className="font-medium">Type d'incident:</span> {selectedIncident.typeIncident}
                        </div>
                        
                        <div>
                          <span className="font-medium">Description:</span> {selectedIncident.description}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium">Zone:</span> {selectedIncident.zone}
                          </div>
                          <div>
                            <span className="font-medium">Date incident:</span>
                            {new Date(selectedIncident.dateHeure).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium">Caméra:</span>
                          {selectedIncident.cameraInfo?.numeroSerie || 'N/A'} - 
                          {selectedIncident.cameraInfo?.emplacement || 'N/A'}
                        </div>
                        
                        {(() => {
                          const photos = [
                            selectedIncident.photo1,
                            selectedIncident.photo2,
                            selectedIncident.photo3,
                            selectedIncident.photo4,
                            selectedIncident.photo5,
                            selectedIncident.photo6,
                          ].filter(Boolean)
                          if (!photos.length) return <span>Aucune photo</span>
                          return (
                            <div className="grid grid-cols-3 gap-3 mt-2">
                              {photos.map((photo: string, idx: number) => (
                                <img
                                  key={idx}
                                  src={getIncidentPhotoUrl(photo) || ''}
                                  alt={`Photo ${idx + 1}`}
                                  className="w-full h-24 object-cover rounded border border-secondary-200"
                                />
                              ))}
                            </div>
                          )
                        })()}
                        
                        <div>
                          <span className="font-medium">Validé par:</span>
                          {user?.prenom} {user?.nom} ({user?.role})
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Observations complémentaires
                      </label>
                      <textarea
                        value={reportNotes}
                        onChange={(e) => setReportNotes(e.target.value)}
                        rows={4}
                        className="input-field"
                        placeholder="Ajouter des observations pour le rapport..."
                        disabled={isGenerating}
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={confirmGenerateReport}
                        disabled={isGenerating}
                        className="btn-primary flex-1 disabled:opacity-50"
                      >
                        {isGenerating ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Génération...
                          </div>
                        ) : (
                          'Générer et valider'
                        )}
                      </button>
                      {!isGenerating && (
                        <button
                          onClick={() => setShowGenerateForm(false)}
                          className="btn-secondary px-6"
                        >
                          Annuler
                        </button>
                      )}
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

export default ReportsView