import React, { useState, useEffect } from 'react'
import { useApiList } from '../hooks/useApi'
import { usersAPI } from '../services/api'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import {
  UserPlus,
  User,
  Edit,
  Key,
  UserX,
  UserCheck,
  X
} from 'lucide-react'

const UsersView: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Utiliser les API réelles au lieu des données de démonstration
  const { 
    data: users, 
    loading: usersLoading, 
    error: usersError,
    fetchData: fetchUsers 
  } = useApiList(usersAPI.getAll)

  const [userForm, setUserForm] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    role: '',
    email: '',
    telephone: '',
    motDePasse: ''
  })

  // Charger les données au montage du composant
  useEffect(() => {
    fetchUsers()
  }, [])

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      responsable: 'bg-blue-100 text-blue-800',
      technicien: 'bg-green-100 text-green-800',
      agent: 'bg-yellow-100 text-yellow-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setUserForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      const userData = new FormData()
      userData.append('matricule', userForm.matricule)
      userData.append('nom', userForm.nom)
      userData.append('prenom', userForm.prenom)
      userData.append('role', userForm.role)
      userData.append('email', userForm.email)
      userData.append('telephone', userForm.telephone)
      userData.append('motDePasse', userForm.motDePasse) // motDePasse only on creation

      const response = await usersAPI.create(userData)
      
      if (response.success) {
        // Recharger la liste des utilisateurs
        fetchUsers()
        
        // Réinitialiser le formulaire
        setUserForm({
          matricule: '',
          nom: '',
          prenom: '',
          role: '',
          email: '',
          telephone: '',
          motDePasse: ''
        })
        
        setShowAddForm(false)
        setEditingUser(null)
      } else {
        setSubmitError(response.message || 'Erreur lors de la création de l\'utilisateur')
      }
    } catch (error) {
      setSubmitError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (user: any) => {
    setEditingUser(user)
    setUserForm({
      matricule: user.matricule,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      email: user.email,
      telephone: user.telephone || '',
      motDePasse: ''
    })
    setShowAddForm(true)
    setSubmitError(null)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Déclare userData avec let ou const avant de l'utiliser
      const userData: any = {
        matricule: userForm.matricule,
        nom: userForm.nom,
        prenom: userForm.prenom,
        role: userForm.role,
        email: userForm.email,
        telephone: userForm.telephone,
        actif: true
      }

      const response = await usersAPI.update(editingUser.idUtilisateur, userData)

      if (response.success) {
        // Recharger la liste des utilisateurs
        fetchUsers()

        setEditingUser(null)
        setUserForm({
          matricule: '',
          nom: '',
          prenom: '',
          role: '',
          email: '',
          telephone: '',
          motDePasse: ''
        })

        setShowAddForm(false)
      } else {
        setSubmitError(response.message || 'Erreur lors de la mise à jour de l\'utilisateur')
      }
    } catch (error) {
      setSubmitError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async (userId: number) => {
    const confirmReset = window.confirm('Êtes-vous sûr de vouloir réinitialiser le mot de passe de cet utilisateur ?')
    if (!confirmReset) return

    try {
      const response = await usersAPI.resetPassword(userId)
      if (response.success) {
        alert(`Mot de passe réinitialisé avec succès!\nNouveau mot de passe temporaire: ${response.data?.temporary_password || 'Contactez l\'administrateur'}`)
      } else {
        alert(`Erreur: ${response.message || 'Erreur lors de la réinitialisation'}`)
      }
    } catch (error) {
      alert('Erreur de connexion lors de la réinitialisation du mot de passe')
    }
  }

  const handleToggleStatus = async (userId: number) => {
    const user = users.find(u => u.idUtilisateur === userId)
    const action = user?.actif ? 'désactiver' : 'activer'
    const confirmToggle = window.confirm(`Êtes-vous sûr de vouloir ${action} cet utilisateur ?`)
    if (!confirmToggle) return

    try {
      const response = await usersAPI.toggleStatus(userId)
      if (response.success) {
        // Recharger la liste des utilisateurs
        fetchUsers()
        alert(`Utilisateur ${action} avec succès`)
      } else {
        alert(`Erreur: ${response.message || 'Erreur lors du changement de statut'}`)
      }
    } catch (error) {
      alert('Erreur de connexion lors du changement de statut')
    }
  }

  if (usersLoading) {
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

  if (usersError) {
    return (
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-64">
          <Header onToggleSidebar={() => setSidebarOpen(true)} />
          <main className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">Erreur: {usersError}</p>
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
              <h1 className="text-2xl font-bold text-secondary-900">Gestion des utilisateurs</h1>
              <p className="text-secondary-600 mt-1">Administration des comptes et des rôles</p>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nouvel utilisateur</span>
            </button>
          </div>

          {/* Users List */}
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Matricule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {users.map((user) => (
                    <tr
                      key={user.idUtilisateur}
                      className="hover:bg-secondary-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-secondary-900">
                              {user.prenom} {user.nom}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {user.matricule}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`status-badge ${getRoleColor(user.role)}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-900">{user.email}</div>
                        <div className="text-sm text-secondary-500">{user.telephone}</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleResetPassword(user.idUtilisateur)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleToggleStatus(user.idUtilisateur)}
                          className={`hover:text-red-900 ${
                            user.actif ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {user.actif ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add/Edit User Modal */}
          {(showAddForm || editingUser) && (
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
                      {editingUser ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
                    </h3>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="text-secondary-400 hover:text-secondary-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={editingUser ? handleUpdate : handleSubmit} className="space-y-4">
                    {submitError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-700 text-sm">{submitError}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Matricule *
                      </label>
                      <input
                        name="matricule"
                        type="text"
                        value={userForm.matricule}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Ex: 2024001"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Nom *
                        </label>
                        <input
                          name="nom"
                          type="text"
                          value={userForm.nom}
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
                          value={userForm.prenom}
                          onChange={handleInputChange}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Rôle *
                      </label>
                      <select 
                        name="role" 
                        value={userForm.role} 
                        onChange={handleInputChange}
                        className="input-field" 
                        required
                      >
                        <option value="">Sélectionner un rôle</option>
                        <option value="agent">Agent de sécurité</option>
                        <option value="technicien">Technicien</option>
                        <option value="responsable">Responsable</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Email *
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={userForm.email}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        name="telephone"
                        type="tel"
                        value={userForm.telephone}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="+261 34 12 345 67"
                      />
                    </div>
                    
                    {!editingUser && (
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Mot de passe *
                        </label>
                        <input
                          name="motDePasse"
                          type="password"
                          value={userForm.motDePasse}
                          onChange={handleInputChange}
                          className="input-field"
                          required
                        />
                      </div>
                    )}
                    
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary flex-1 disabled:opacity-50"
                      >
                        {isSubmitting 
                          ? (editingUser ? 'Modification...' : 'Création...') 
                          : (editingUser ? 'Modifier' : 'Créer')
                        }
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false)
                          setEditingUser(null)
                          setSubmitError(null)
                        }}
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
        </main>
      </div>
    </div>
  )
}

export default UsersView