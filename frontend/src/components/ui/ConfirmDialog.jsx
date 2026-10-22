import React from 'react'
import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmer la suppression',
  message = 'Es-tu sûr de vouloir supprimer cet élément ? Cette action est irréversible.',
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-6">
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#FDF4F3] border border-[#A65D57]/25 text-[#332821]">
          <AlertTriangle className="w-5 h-5 text-[#A65D57] shrink-0 mt-0.5" />
          <p className="text-sm text-[#332821] leading-relaxed">{message}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full py-3 px-4 rounded-full bg-[#E8D8C3]/80 hover:bg-[#E8D8C3] text-[#332821] font-medium text-sm transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-3 px-4 rounded-full bg-[#A65D57] hover:bg-[#914E48] text-white font-medium text-sm transition-colors disabled:opacity-60"
          >
            {loading ? 'Suppression...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
