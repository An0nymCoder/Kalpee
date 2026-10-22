import React, { useEffect, useState, useCallback } from 'react'
import {
  Plus,
  Target,
  Pencil,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { objectifService } from '../services/objectifService'
import { useToast } from '../context/ToastContext'
import CategoryIcon from '../components/ui/CategoryIcon'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import ObjectifFormModal from '../components/objectifs/ObjectifFormModal'
import {
  formatMontant,
  formatDateFr,
  getCategorieLabel,
} from '../utils/formatters'

export default function Objectifs() {
  const toast = useToast()

  const [objectifs, setObjectifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingObjectif, setEditingObjectif] = useState(null)
  const [objectifToDelete, setObjectifToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchObjectifs = useCallback(async () => {
    try {
      const list = await objectifService.list()
      setObjectifs(Array.isArray(list) ? list : [])
    } catch {
      toast.error('Impossible de charger tes objectifs.')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchObjectifs()
  }, [fetchObjectifs])

  const handleSaveObjectif = async (values) => {
    if (editingObjectif?.id) {
      await objectifService.update(editingObjectif.id, values)
      toast.success('Objectif mis à jour.')
    } else {
      await objectifService.create(values)
      toast.success('Nouvel objectif créé !')
    }
    setIsModalOpen(false)
    setEditingObjectif(null)
    fetchObjectifs()
  }

  const handleDeleteObjectif = async () => {
    if (!objectifToDelete) return
    setDeleting(true)
    try {
      await objectifService.remove(objectifToDelete.id)
      toast.success('Objectif supprimé.')
      setObjectifToDelete(null)
      fetchObjectifs()
    } catch {
      toast.error('Impossible de supprimer cet objectif.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête (sans barre de quota Plan Gratuit) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#332821]">
            Mes objectifs
          </h1>
          <p className="text-sm text-[#806F62] mt-1">
            Épargne pas à pas pour ce qui compte vraiment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingObjectif(null)
            setIsModalOpen(true)
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#6B4226] hover:bg-[#58351D] text-[#FFFDF9] text-sm font-medium shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel objectif</span>
        </button>
      </div>

      {/* Liste des objectifs ou État vide */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map((n) => (
            <div key={n} className="h-64 rounded-[28px] bg-[#E8D8C3]/50" />
          ))}
        </div>
      ) : objectifs.length === 0 ? (
        <div className="bg-[#FFFDF9] rounded-[28px] border border-dashed border-[#E8D8C3] py-16 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-[#EFE6D8] text-[#332821] flex items-center justify-center mx-auto mb-4">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-xl text-[#332821]">
            Aucun objectif pour l&apos;instant
          </h2>
          <p className="text-sm text-[#806F62] mt-1 max-w-md mx-auto">
            Crée ton premier objectif d&apos;épargne pour calculer automatiquement ton effort mensuel.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingObjectif(null)
              setIsModalOpen(true)
            }}
            className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#6B4226] hover:bg-[#58351D] text-[#FFFDF9] text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un objectif</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {objectifs.map((obj) => {
            const progression = Math.min(100, Math.max(0, Number(obj.progression || 0)))
            return (
              <div
                key={obj.id}
                className="bg-[#FFFDF9] rounded-[28px] border border-[#E8D8C3] p-6 flex flex-col justify-between shadow-card"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-[#EFE6D8] text-[#332821] flex items-center justify-center shrink-0">
                        <CategoryIcon categorie={obj.categorie} className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#806F62]">
                          {getCategorieLabel(obj.categorie)}
                        </span>
                        <h3 className="font-serif text-xl text-[#332821]">
                          {obj.nom}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingObjectif(obj)
                          setIsModalOpen(true)
                        }}
                        aria-label={`Modifier ${obj.nom}`}
                        className="p-2 rounded-full bg-[#EFE6D8] hover:bg-[#E8D8C3] text-[#332821] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setObjectifToDelete(obj)}
                        aria-label={`Supprimer ${obj.nom}`}
                        className="p-2 rounded-full bg-[#F6E6E4] hover:bg-[#A65D57] text-[#A65D57] hover:text-white transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {obj.description && (
                    <p className="text-xs text-[#806F62] mb-4">{obj.description}</p>
                  )}

                  <div className="p-4 rounded-2xl bg-[#EFE6D8]/75 mb-4">
                    <div className="flex items-baseline justify-between gap-2 mb-2">
                      <p className="font-serif text-2xl text-[#332821]">
                        {formatMontant(obj.montantEpargne)}
                      </p>
                      <p className="text-xs text-[#806F62]">
                        sur {formatMontant(obj.montantCible)} ({progression}%)
                      </p>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-[#E8D8C3] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#6B4226] transition-all duration-300"
                        style={{ width: `${progression}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#806F62] mt-2.5">
                      <span>
                        {obj.atteint
                          ? 'Objectif atteint !'
                          : `Il reste ${formatMontant(obj.reste)}`}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDateFr(obj.dateCible)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recommandation mensuelle */}
                {obj.atteint ? (
                  <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#E7ECE1] text-xs font-medium text-[#718355]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Bravo ! Tu as atteint cet objectif d&apos;épargne.</span>
                  </div>
                ) : obj.epargneMensuelleRecommandee ? (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] text-xs text-[#332821]">
                    <Sparkles className="w-4 h-4 text-[#6B4226] shrink-0 mt-0.5" />
                    <span>
                      Pour atteindre ton objectif, essaie de mettre de côté{' '}
                      <strong className="text-[#6B4226]">
                        {formatMontant(obj.epargneMensuelleRecommandee)} / mois
                      </strong>
                      .
                    </span>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}

      <ObjectifFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingObjectif(null)
        }}
        onSubmitObjectif={handleSaveObjectif}
        initialData={editingObjectif}
      />

      <ConfirmDialog
        isOpen={Boolean(objectifToDelete)}
        onClose={() => setObjectifToDelete(null)}
        onConfirm={handleDeleteObjectif}
        loading={deleting}
        title="Supprimer cet objectif ?"
        message={`Es-tu sûr de vouloir supprimer l'objectif "${objectifToDelete?.nom || ''}" ? Les transactions de ta tirelire seront conservées.`}
      />
    </div>
  )
}
