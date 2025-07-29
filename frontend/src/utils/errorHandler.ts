// Gestionnaire d'erreurs global pour les appels API
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Erreur de réponse du serveur
    const { status, data } = error.response
    
    switch (status) {
      case 400:
        return data.message || 'Données invalides'
      case 401:
        return 'Session expirée, veuillez vous reconnecter'
      case 403:
        return 'Vous n\'avez pas les permissions nécessaires'
      case 404:
        return 'Ressource non trouvée'
      case 422:
        // Erreurs de validation Laravel
        if (data.errors) {
          const firstError = Object.values(data.errors)[0] as string[]
          return firstError[0] || 'Erreur de validation'
        }
        return data.message || 'Erreur de validation'
      case 500:
        return 'Erreur interne du serveur'
      default:
        return data.message || 'Une erreur est survenue'
    }
  } else if (error.request) {
    // Erreur de réseau
    return 'Impossible de contacter le serveur'
  } else {
    // Autre erreur
    return error.message || 'Une erreur inattendue est survenue'
  }
}

// Fonction pour afficher les notifications d'erreur
export const showErrorNotification = (error: string) => {
  // Ici vous pouvez intégrer une librairie de notifications comme react-toastify
  console.error('Erreur:', error)
  // Exemple avec une notification simple
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Erreur SMMC', {
      body: error,
      icon: '/favicon.ico'
    })
  }
}

// Fonction pour formater les erreurs de validation Laravel
export const formatValidationErrors = (errors: Record<string, string[]>): string => {
  return Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
    .join('\n')
}