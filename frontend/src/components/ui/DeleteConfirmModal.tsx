import React, { useState } from 'react'
import { X, AlertTriangle, Trash2 } from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason?: string) => void
  title: string
  message: string
  itemName?: string
  isPermanent?: boolean
  isLoading?: boolean
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isPermanent = false,
  isLoading = false
}) => {
  const [reason, setReason] = useState('')

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm(reason || undefined)
    setReason('')
  }

  const handleClose = () => {
    setReason('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <div className={`p-2 rounded-full mr-3 ${
              isPermanent ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              {isPermanent ? (
                <Trash2 className="w-6 h-6 text-red-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4">
            {message}
          </p>

          {itemName && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Élément concerné :</span> {itemName}
              </p>
            </div>
          )}

          {isPermanent && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700">
                <strong>Attention :</strong> Cette action est irréversible. 
                L'élément sera définitivement supprimé et ne pourra pas être récupéré.
              </p>
            </div>
          )}

          {!isPermanent && (
            <div className="mb-4">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Raison de la suppression (optionnel)
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Expliquez pourquoi vous supprimez cet élément..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                disabled={isLoading}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading}
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isPermanent
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Suppression...
              </div>
            ) : (
              isPermanent ? 'Supprimer définitivement' : 'Déplacer vers la corbeille'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal
