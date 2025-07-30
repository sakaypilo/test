import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIncidentsStore } from '../stores/incidents'
import { useApi } from '../hooks/useApi'
import { camerasAPI } from '../services/api'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import { Upload, X } from 'lucide-react'

const NewIncidentView: React.FC = () => {
  const navigate = useNavigate()
  const { createIncident } = useIncidentsStore()

  // Utiliser les API réelles pour les caméras disponibles
  const { 
    data: availableCameras, 
    loading: camerasLoading, 
    error: camerasError,
    execute: fetchCameras 
  } = useApi(camerasAPI.getAll)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    typeIncident: '',
    description: '',
    zone: '',
    idCamera: '',
    photos: [null, null, null, null, null, null] as (File | null)[]
  })
  
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Charger les caméras au montage du composant
  useEffect(() => {
    fetchCameras()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (index: number, file: File | null) => {
    const newPhotos = [...form.photos]
    newPhotos[index] = file
    setForm(prev => ({ ...prev, photos: newPhotos }))
  }

  const removePhoto = (index: number) => {
    const newPhotos = [...form.photos]
    newPhotos[index] = null
    setForm(prev => ({ ...prev, photos: newPhotos }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      console.log('Début de soumission du formulaire')
      
      // Créer la date/heure en format ISO compatible avec MySQL
      const dateTime = `${form.date} ${form.time}:00`
      console.log('Date/heure formatée:', dateTime)
      
      const incidentData = new FormData()
      incidentData.append('dateHeure', dateTime)
      incidentData.append('typeIncident', form.typeIncident)
      incidentData.append('description', form.description)
      incidentData.append('zone', form.zone)
      incidentData.append('idCamera', form.idCamera)
      
      console.log('Données de base ajoutées à FormData')
      
      // Ajouter les photos
      form.photos.forEach((photo, index) => {
        if (photo) {
          incidentData.append(`photos[${index}]`, photo)
          console.log(`Photo ${index} ajoutée:`, photo.name)
        }
      })
      console.log('Photos ajoutées à FormData')
      
      // Log du contenu de FormData pour debug
      for (let pair of incidentData.entries()) {
        console.log(pair[0], pair[1])
      }
      
      const result = await createIncident(incidentData)
      
      if (result.success) {
        navigate('/incidents')
      } else {
        setSubmitError(result.error || 'Erreur lors de la création de l\'incident')
      }
    } catch (error) {
      setSubmitError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (camerasLoading) {
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

  if (camerasError) {
    return (
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-64">
          <Header onToggleSidebar={() => setSidebarOpen(true)} />
          <main className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">Erreur: {camerasError}</p>
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
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-secondary-900">Signaler un incident</h1>
              <p className="text-secondary-600 mt-1">Enregistrement d'un nouvel incident de sécurité</p>
            </div>

            <form onSubmit={handleSubmit} className="card space-y-6">
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{submitError}</p>
                </div>
              )}
              
              {/* Type d'incident */}
              <div>
                <label htmlFor="typeIncident" className="block text-sm font-medium text-secondary-700 mb-2">
                  Type d'incident *
                </label>
                <select
                  id="typeIncident"
                  name="typeIncident"
                  value={form.typeIncident}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Sélectionner un type</option>
                  <option value="Intrusion">Intrusion</option>
                  <option value="Vol suspect">Vol suspect</option>
                  <option value="Vandalisme">Vandalisme</option>
                  <option value="Bagarre">Bagarre</option>
                  <option value="Accident">Accident</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* Zone */}
              <div>
                <label htmlFor="zone" className="block text-sm font-medium text-secondary-700 mb-2">
                  Zone *
                </label>
                <select
                  id="zone"
                  name="zone"
                  value={form.zone}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Sélectionner une zone</option>
                  <option value="Zone Portuaire Nord">Zone Portuaire Nord</option>
                  <option value="Zone Portuaire Sud">Zone Portuaire Sud</option>
                  <option value="Zone Administrative">Zone Administrative</option>
                  <option value="Zone de Stockage">Zone de Stockage</option>
                  <option value="Parking">Parking</option>
                </select>
              </div>

              {/* Caméra */}
              <div>
                <label htmlFor="idCamera" className="block text-sm font-medium text-secondary-700 mb-2">
                  Caméra concernée *
                </label>
                <select
                  id="idCamera"
                  name="idCamera"
                  value={form.idCamera}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Sélectionner une caméra</option>
                  {availableCameras?.map((camera: any) => (
                    <option 
                      key={camera.idCamera}
                      value={camera.idCamera}
                    >
                      {camera.numeroSerie} - {camera.emplacement}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date et heure */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-secondary-700 mb-2">
                    Date *
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-secondary-700 mb-2">
                    Heure *
                  </label>
                  <input
                    id="time"
                    name="time"
                    type="time"
                    value={form.time}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-2">
                  Description détaillée *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={form.description}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Décrivez l'incident en détail..."
                  required
                />
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Photos (jusqu'à 6 max)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {form.photos.map((photo, index) => (
                    <div 
                      key={index}
                      className="relative"
                    >
                      {photo ? (
                        <img 
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-secondary-200"
                        />
                      ) : (
                        <div 
                          className="w-full h-24 border-2 border-dashed border-secondary-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-400"
                          onClick={() => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.accept = 'image/jpeg,image/png'
                            input.onchange = (event) => {
                              const file = (event.target as HTMLInputElement).files?.[0]
                              if (file) {
                                handlePhotoChange(index, file)
                              }
                            }
                            input.click()
                          }}
                        >
                          <div className="text-center">
                            <Upload className="w-6 h-6 text-secondary-400 mx-auto mb-1" />
                            <p className="text-xs text-secondary-500">Ajouter photo</p>
                          </div>
                        </div>
                      )}
                      {photo && (
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer l\'incident'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/incidents')}
                  className="btn-secondary px-6"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default NewIncidentView