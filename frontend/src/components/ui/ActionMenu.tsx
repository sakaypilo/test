import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit, Trash2, Eye, RotateCcw } from 'lucide-react'

interface ActionMenuProps {
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
  onRestore?: () => void
  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean
  canRestore?: boolean
  isDeleted?: boolean
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  onEdit,
  onDelete,
  onView,
  onRestore,
  canEdit = true,
  canDelete = true,
  canView = true,
  canRestore = false,
  isDeleted = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {canView && onView && (
              <button
                onClick={() => handleAction(onView)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Eye className="w-4 h-4 mr-3" />
                Voir les détails
              </button>
            )}

            {!isDeleted && canEdit && onEdit && (
              <button
                onClick={() => handleAction(onEdit)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit className="w-4 h-4 mr-3" />
                Modifier
              </button>
            )}

            {isDeleted && canRestore && onRestore && (
              <button
                onClick={() => handleAction(onRestore)}
                className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
              >
                <RotateCcw className="w-4 h-4 mr-3" />
                Restaurer
              </button>
            )}

            {canDelete && onDelete && (
              <button
                onClick={() => handleAction(onDelete)}
                className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                {isDeleted ? 'Supprimer définitivement' : 'Supprimer'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ActionMenu
