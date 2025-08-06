import React, { useState, useMemo, useEffect } from 'react'
import { useApiList } from '../hooks/useApi'
import { personnesAPI } from '../services/api'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  User,
  Eye,
  Plus,
  X
} from 'lucide-react'

const PersonsView: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Utiliser les API réelles au lieu des données de démonstration
  const { 
    data: persons, 
    loading: personsLoading, 
    error: personsError,
    fetchData: fetchPersons 
  } = useApiList(personnesAPI.getAll)

  const [newPerson, setNewPerson] = useState({
    nom: '',
    prenom: '',
    CIN: '',
    statut: '',
    photo: null
  })

  const [newInterpellation, setNewInterpellation] = useState({
    faitAssocie: '',
    dateHeure: new Date().toISOString(),
    idUtilisateur: 1
  })

  // Charger les données au montage du composant
  useEffect(() => {
    fetchPersons()
  }, [])

  const internalPersons = useMemo(() =>
    persons?.filter(p => p.statut === 'interne') || [], [persons]
  )

  const externalPersons = useMemo(() =>
    persons?.filter(p => p.statut === 'externe') || [], [persons]
  )

  const getLastInterpellation = () => {
    // This function relies on interpellations which are no longer fetched.
    // It will return 'Aucune' or a placeholder if interpellations are not available.
    return 'Aucune'
  }

  const viewPerson = (person: any) => {
    setSelectedPerson(person)
  }

  const deletePerson = async (id: number) => {
  const confirmDelete = window.confirm("Confirmer la suppression de cette personne ?");
  if (!confirmDelete) return;

  try {
    const response = await personnesAPI.delete(id);
    if (response.data.success) {
      fetchPersons(); // Recharge la liste après suppression
    } else {
      alert(response.data.message || "Échec de la suppression.");
    }
  } catch (error) {
    console.error("Erreur lors de la suppression logique:", error);
    alert("Une erreur est survenue.");
  }
}


  const addInterpellation = (person: any) => {
    // Pré-remplir les données de la personne existante
    setNewPerson({ ...person })
    setShowAddForm(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewPerson(prev => ({ ...prev, [name]: value }))
  }

  const handleInterpellationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewInterpellation(prev => ({ ...prev, [name]: value }))
  }

  const submitInterpellation = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Vérifier si la personne existe déjà
      let existingPerson = persons?.find(p => p.CIN === newPerson.CIN)
      
      if (!existingPerson) {
        // Créer une nouvelle personne via API
        const personData = new FormData()
        personData.append('nom', newPerson.nom)
        personData.append('prenom', newPerson.prenom)
        personData.append('CIN', newPerson.CIN)
        personData.append('statut', newPerson.statut)
        personData.append('faitAssocie', newInterpellation.faitAssocie)
        if (newPerson.photo) {
          personData.append('photo', newPerson.photo)
        }

        const personResponse = await personnesAPI.create(personData)
        if (personResponse.success) {
          existingPerson = personResponse.data
          // Recharger la liste des personnes
          fetchPersons()
        } else {
          throw new Error(personResponse.message || 'Erreur lors de la création de la personne')
        }
      }
      
      
      // Réinitialiser le formulaire
      setNewPerson({
        nom: '',
        prenom: '',
        CIN: '',
        statut: '',
        photo: null
      })
      setNewInterpellation({
        faitAssocie: '',
        dateHeure: new Date().toISOString(),
        idUtilisateur: 1
      })
      
      setShowAddForm(false)
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (personsLoading) {
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

  if (personsError) {
    return (
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-64">
          <Header onToggleSidebar={() => setSidebarOpen(true)} />
          <main className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">Erreur: {personsError}</p>
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
              <h1 className="text-2xl font-bold text-secondary-900">Personnes appréhendées</h1>
              <p className="text-secondary-600 mt-1">Gestion des interpellations</p>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nouvelle interpellation</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Total personnes</p>
                  <p className="text-2xl font-bold text-secondary-900">{persons?.length || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Personnel interne</p>
                  <p className="text-2xl font-bold text-secondary-900">{internalPersons.length}</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <UserX className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Externes</p>
                  <p className="text-2xl font-bold text-secondary-900">{externalPersons.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Persons List */}
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Personne
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      CIN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Dernière interpellation
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {persons?.map((person) => (
                    <tr
                      key={person.idPersonne}
                      className="hover:bg-secondary-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-secondary-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-secondary-900">
                              {person.prenom} {person.nom}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {person.CIN}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`status-badge ${
                            person.statut === 'interne' ? 'status-active' : 'status-inactive'
                          }`}
                        >
                          {person.statut}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {getLastInterpellation()}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => viewPerson(person)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => addInterpellation(person)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Person/Interpellation Modal */}
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
                      Nouvelle interpellation
                    </h3>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="text-secondary-400 hover:text-secondary-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={submitInterpellation} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Nom *
                      </label>
                      <input
                        name="nom"
                        type="text"
                        value={newPerson.nom}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Prénom *
                      </label>
                      <input
                        name="prenom"
                        type="text"
                        value={newPerson.prenom}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        CIN *
                      </label>
                      <input
                        name="CIN"
                        type="text"
                        value={newPerson.CIN}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Ex: 123456789012"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Statut *
                      </label>
                      <select 
                        name="statut" 
                        value={newPerson.statut} 
                        onChange={handleInputChange}
                        className="input-field" 
                        required
                      >
                        <option value="">Sélectionner</option>
                        <option value="interne">Personnel interne</option>
                        <option value="externe">Personne externe</option>
                      </select>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Fait associé *
                        </label>
                        <textarea
                          name="faitAssocie"
                          rows={3}
                          value={newInterpellation.faitAssocie}
                          onChange={handleInterpellationChange}
                          className="input-field"
                          placeholder="Décrivez le fait associé à l'interpellation..."
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary flex-1 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="btn-secondary px-6"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Person Details Modal */}
          {selectedPerson && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedPerson(null)}
            >
              <div
                className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-secondary-900">
                      Détails - {selectedPerson.prenom} {selectedPerson.nom}
                    </h3>
                    <button
                      onClick={() => setSelectedPerson(null)}
                      className="text-secondary-400 hover:text-secondary-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700">CIN</label>
                        <p className="text-secondary-900">{selectedPerson.CIN}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700">Statut</label>
                        <span
                          className={`status-badge ${
                            selectedPerson.statut === 'interne' ? 'status-active' : 'status-inactive'
                          }`}
                        >
                          {selectedPerson.statut}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-secondary-900 mb-2">Historique des interpellations</h4>
                      <div className="text-sm text-secondary-500">
                        Aucune interpellation enregistrée pour cette personne.
                      </div>
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

export default PersonsView