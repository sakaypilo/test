import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import logo from '../assets/smmc.png'



const LoginView: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()

  const [form, setForm] = useState({
    matricule: '',
    motDePasse: ''
  })

  const [errors, setErrors] = useState({
    matricule: '',
    motDePasse: ''
  })

  const [loginError, setLoginError] = useState('')

  const validateForm = () => {
    const newErrors = {
      matricule: '',
      motDePasse: ''
    }

    if (!form.matricule) {
      newErrors.matricule = 'Le matricule est requis'
    } else if (!/^\d{7}$/.test(form.matricule)) {
      newErrors.matricule = 'Le matricule doit contenir 7 chiffres'
    }

    if (!form.motDePasse) {
      newErrors.motDePasse = 'Le mot de passe est requis'
    }

    setErrors(newErrors)
    return !newErrors.matricule && !newErrors.motDePasse
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoginError('')

    const result = await login(form.matricule, form.motDePasse)

    if (result.success) {
      navigate('/')
    } else {
      setLoginError(result.error || 'Erreur de connexion')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 animate-fade-in">
        <div className="text-center mb-8">
          <img src={logo} alt="Logo SMMC" style={{ width: 379, height: 105, marginBottom: 16 }} />
          <h1 className="text-2xl font-bold text-secondary-900">SMMC Security</h1>
          <p className="text-secondary-600 mt-2">Port de Toamasina</p>
          <p className="text-sm text-secondary-500">Plateforme de gestion sécurisée</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="matricule" className="block text-sm font-medium text-secondary-700 mb-2">
              Matricule
            </label>
            <input
              id="matricule"
              name="matricule"
              type="text"
              placeholder="Ex: 2018025"
              value={form.matricule}
              onChange={handleInputChange}
              className={`input-field ${errors.matricule ? 'border-red-300' : ''}`}
              required
            />
            {errors.matricule && <p className="text-red-500 text-sm mt-1">{errors.matricule}</p>}
          </div>

          <div>
            <label htmlFor="motDePasse" className="block text-sm font-medium text-secondary-700 mb-2">
              Mot de passe
            </label>
            <input
              id="motDePasse"
              name="motDePasse"
              type="password"
              placeholder="Votre mot de passe"
              value={form.motDePasse}
              onChange={handleInputChange}
              className={`input-field ${errors.motDePasse ? 'border-red-300' : ''}`}
              required
            />
            {errors.motDePasse && <p className="text-red-500 text-sm mt-1">{errors.motDePasse}</p>}
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{loginError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
          <p className="text-xs text-secondary-500">Connectez-vous avec vos identifiants SMMC</p>
        </div>
      </div>
    </div>
  )
}

export default LoginView
