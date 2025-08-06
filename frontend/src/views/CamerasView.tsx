import React, { useState, useMemo, useEffect } from 'react'
import { useCamerasStore } from '../stores/cameras'
import { useAuthStore } from '../stores/auth'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import { camerasAPI } from '../services/api'

import {
  Camera,
  Plus,
  Eye,
  Settings,
  MapPin,
  Navigation,
  Calendar,
  X
} from 'lucide-react'

const CamerasView: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedCamera, setSelectedCamera] = useState<any>(null)
  const [showCameraDetails, setShowCameraDetails] = useState(false)
  const [editingCamera, setEditingCamera] = useState<any>(null)

  const { cameras, getCamerasByStatus, fetchCameras, createCamera, isLoading, error } = useCamerasStore()
  const { user } = useAuthStore()

  const [newCamera, setNewCamera] = useState({
    numeroSerie: '',
    adresseIP: '',
    zone: '',
    emplacement: '',
    statut: 'actif' as const,
    dateInstallation: new Date().toISOString().split('T')[0]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const viewCamera = (camera: any) => {
    setSelectedCamera(camera)
    setShowCameraDetails(true)
  }

  const editCamera = (camera: any) => {
    setEditingCamera(camera)
    setNewCamera({
      numeroSerie: camera.numeroSerie,
      adresseIP: camera.adresseIP,
      zone: camera.zone,
      emplacement: camera.emplacement,
      statut: camera.statut,
      dateInstallation: camera.dateInstallation.split('T')[0]
    })
    setShowAddForm(true)
  }

  const handleUpdateCamera = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCamera) return
    
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      const cameraData = {
        numeroSerie: newCamera.numeroSerie.trim(),
        adresseIP: newCamera.adresseIP.trim(),
        zone: newCamera.zone,
        emplacement: newCamera.emplacement.trim(),
        statut: newCamera.statut
      }

      const response = await camerasAPI.update(editingCamera.idCamera, cameraData)
      
      if (response.success) {
        setNewCamera({
          numeroSerie: '',
          adresseIP: '',
          zone: '',
          emplacement: '',
          statut: 'actif' as const,
          dateInstallation: new Date().toISOString().split('T')[0]
        })
        
        setShowAddForm(false)
        setEditingCamera(null)
        setSubmitError(null)
        
        await fetchCameras()
      } else {
        setSubmitError(response.message || 'Erreur lors de la mise à jour de la caméra')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      setSubmitError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Charger les caméras au montage du composant
  useEffect(() => {
    fetchCameras()
  }, [])

  const activeCameras = getCamerasByStatus('actif')
  const faultyCameras = getCamerasByStatus('panne')
  const offlineCameras = getCamerasByStatus('hors ligne')

  const canManageCameras = useMemo(() =>
    ['admin', 'technicien'].includes(user?.role || ''), [user?.role]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewCamera(prev => ({ ...prev, [name]: value }))
  }

  const handleAddCamera = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      // Validation côté client
      if (!newCamera.numeroSerie.trim()) {
        setSubmitError('Le numéro de série est requis')
        return
      }
      if (!newCamera.adresseIP.trim()) {
        setSubmitError('L\'adresse IP est requise')
        return
      }
      if (!newCamera.zone.trim()) {
        setSubmitError('La zone est requise')
        return
      }
      if (!newCamera.emplacement.trim()) {
        setSubmitError('L\'emplacement est requis')
        return
      }

      // Validation format IP
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      if (!ipRegex.test(newCamera.adresseIP)) {
        setSubmitError('Format d\'adresse IP invalide')
        return
      }

      // Préparer les données pour l'API (objet simple, pas FormData)
      const cameraData = {
        numeroSerie: newCamera.numeroSerie.trim(),
        adresseIP: newCamera.adresseIP.trim(),
        zone: newCamera.zone,
        emplacement: newCamera.emplacement.trim(),
        dateInstallation: newCamera.dateInstallation
      }

      const result = await createCamera(cameraData)
      
      if (result.success) {
        // Reset form
        setNewCamera({
          numeroSerie: '',
          adresseIP: '',
          zone: '',
          emplacement: '',
          statut: 'actif' as const,
          dateInstallation: new Date().toISOString().split('T')[0]
        })
        
        setShowAddForm(false)
        setSubmitError(null)
        
        // Recharger les caméras pour afficher la nouvelle
        await fetchCameras()
      } else {
        setSubmitError(result.error || 'Erreur lors de la création de la caméra')
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error)
      setSubmitError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
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

  if (error) {
    return (
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-64">
          <Header onToggleSidebar={() => setSidebarOpen(true)} />
          <main className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">Erreur: {error}</p>
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
              <h1 className="text-2xl font-bold text-secondary-900">Gestion des caméras</h1>
              <p className="text-secondary-600 mt-1">Installation, maintenance et surveillance</p>
            </div>
            
            {canManageCameras && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter caméra</span>
              </button>
            )}
          </div>

          {/* Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <div>
                  <p className="text-sm text-secondary-600">Caméras actives</p>
                  <p className="text-2xl font-bold text-secondary-900">{activeCameras.length}</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div>
                  <p className="text-sm text-secondary-600">En panne</p>
                  <p className="text-2xl font-bold text-secondary-900">{faultyCameras.length}</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div>
                  <p className="text-sm text-secondary-600">Hors ligne</p>
                  <p className="text-2xl font-bold text-secondary-900">{offlineCameras.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cameras Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cameras.map((camera) => (
              <div
                key={camera.idCamera}
                className="card hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <Camera className="w-6 h-6 text-secondary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">{camera.numeroSerie}</h3>
                      <p className="text-sm text-secondary-500">{camera.adresseIP}</p>
                    </div>
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
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-secondary-400" />
                    <span className="text-sm text-secondary-600">{camera.zone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Navigation className="w-4 h-4 text-secondary-400" />
                    <span className="text-sm text-secondary-600">{camera.emplacement}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-secondary-400" />
                    <span className="text-sm text-secondary-600">
                      Installée le {new Date(camera.dateInstallation).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => viewCamera(camera)}
                    className="btn-secondary flex-1 text-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Voir
                  </button>
                  {canManageCameras && (
                    <button 
                      onClick={() => editCamera(camera)}
                      className="btn-secondary text-sm"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Camera Modal */}
          {showAddForm && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowAddForm(false)}
            >
              <div
                className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-secondary-900">
                      {editingCamera ? 'Modifier la caméra' : 'Ajouter une caméra'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddForm(false)
                        setEditingCamera(null)
                        setSubmitError(null)
                      }}
                      className="text-secondary-400 hover:text-secondary-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={editingCamera ? handleUpdateCamera : handleAddCamera} className="space-y-4">
                    {submitError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-700 text-sm">{submitError}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Numéro de série *
                      </label>
                      <input
                        name="numeroSerie"
                        type="text"
                        value={newCamera.numeroSerie}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Ex: CAM-004-2024"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Adresse IP *
                      </label>
                      <input
                        name="adresseIP"
                        type="text"
                        value={newCamera.adresseIP}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Ex: 192.168.1.104"
                        pattern="^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
                        title="Format: xxx.xxx.xxx.xxx"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Zone *
                      </label>
                      <select 
                        name="zone" 
                        value={newCamera.zone} 
                        onChange={handleInputChange}
                        className="input-field" 
                        required
                        disabled={isSubmitting}
                      >
                        <option value="">Sélectionner une zone</option>
                        <option value="Zone Portuaire Nord">Zone Portuaire Nord</option>
                        <option value="Zone Portuaire Sud">Zone Portuaire Sud</option>
                        <option value="Zone Administrative">Zone Administrative</option>
                        <option value="Zone de Stockage">Zone de Stockage</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Emplacement *
                      </label>
                      <textarea
                        name="emplacement"
                        value={newCamera.emplacement}
                        onChange={handleInputChange}
                        className="input-field"
                        rows={3}
                        placeholder="Description précise de l'emplacement..."
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    {editingCamera && (
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Statut *
                        </label>
                        <select 
                          name="statut" 
                          value={newCamera.statut} 
                          onChange={handleInputChange}
                          className="input-field" 
                          required
                          disabled={isSubmitting}
                        >
                          <option value="actif">Actif</option>
                          <option value="panne">En panne</option>
                          <option value="hors ligne">Hors ligne</option>
                        </select>
                      </div>
                    )}
                    
                    {!editingCamera && (
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Date d'installation *
                        </label>
                        <input
                          name="dateInstallation"
                          type="date"
                          value={newCamera.dateInstallation}
                          onChange={handleInputChange}
                          className="input-field"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    )}
                    
                    <div className="flex space-x-3 pt-4">
                      <button 
                        type="submit" 
                        className="btn-primary flex-1"
                        disabled={isSubmitting}
                      >
                        {isSubmitting 
                          ? (editingCamera ? 'Modification...' : 'Enregistrement...') 
                          : (editingCamera ? 'Modifier' : 'Ajouter')
                        }
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false)
                          setEditingCamera(null)
                          setSubmitError(null)
                        }}
                        className="btn-secondary px-6"
                        disabled={isSubmitting}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Camera Details Modal */}
          {showCameraDetails && selectedCamera && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowCameraDetails(false)}
            >
              <div
                className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-secondary-900">
                      Détails de la caméra {selectedCamera.numeroSerie}
                    </h3>
                    <button
                      onClick={() => setShowCameraDetails(false)}
                      className="text-secondary-400 hover:text-secondary-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Informations générales */}
                    <div>
                      <h4 className="font-medium text-secondary-900 mb-3">Informations générales</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Numéro de série</label>
                          <p className="text-secondary-900">{selectedCamera.numeroSerie}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Adresse IP</label>
                          <p className="text-secondary-900">{selectedCamera.adresseIP}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Zone</label>
                          <p className="text-secondary-900">{selectedCamera.zone}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Statut</label>
                          <span
                            className={`status-badge ${
                              selectedCamera.statut === 'actif' ? 'status-active' :
                              selectedCamera.statut === 'panne' ? 'status-inactive' : 'status-pending'
                            }`}
                          >
                            {selectedCamera.statut}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Emplacement */}
                    <div>
                      <h4 className="font-medium text-secondary-900 mb-3">Emplacement</h4>
                      <p className="text-secondary-900 bg-secondary-50 p-3 rounded-lg">
                        {selectedCamera.emplacement}
                      </p>
                    </div>

                    {/* Installation */}
                    <div>
                      <h4 className="font-medium text-secondary-900 mb-3">Installation</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Date d'installation</label>
                          <p className="text-secondary-900">
                            {new Date(selectedCamera.dateInstallation).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        {selectedCamera.technicien && (
                          <div>
                            <label className="block text-sm font-medium text-secondary-700">Technicien responsable</label>
                            <p className="text-secondary-900">
                              {selectedCamera.technicien.prenom} {selectedCamera.technicien.nom}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3 pt-4 border-t">
                      {canManageCameras && (
                        <button
                          onClick={() => {
                            setShowCameraDetails(false)
                            editCamera(selectedCamera)
                          }}
                          className="btn-primary"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Modifier
                        </button>
                      )}
                      <button
                        onClick={() => setShowCameraDetails(false)}
                        className="btn-secondary"
                      >
                        Fermer
                      </button>
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

export default CamerasView