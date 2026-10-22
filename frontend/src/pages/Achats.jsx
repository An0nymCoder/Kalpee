import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, ShoppingBag } from 'lucide-react'
import { achatService } from '../services/achatService'
import { useToast } from '../context/ToastContext'
import AchatCard from '../components/achat/AchatCard'
import AchatFormModal from '../components/achat/AchatFormModal'

const FILTRES_PRIORITE = [
  { value: 'TOUS', label: 'Tous' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'IMPORTANT', label: 'Important' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'FAIBLE', label: 'Faible' },
]

export default function Achats() {
  const navigate = useNavigate()
  const toast = useToast()

  const [achats, setAchats] = useState([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [prioriteFilter, setPrioriteFilter] = useState('TOUS')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchAchats = useCallback(async () => {
    setLoading(true)
    try {
      const list = await achatService.list({
        recherche,
        priorite: prioriteFilter === 'TOUS' ? '' : prioriteFilter,
      })
      setAchats(Array.isArray(list) ? list : [])
    } catch {
      toast.error('Impossible de charger tes achats.')
    } finally {
      setLoading(false)
    }
  }, [recherche, prioriteFilter, toast])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAchats()
    }, 150)
    return () => clearTimeout(timer)
  }, [fetchAchats])

  const handleCreateAchat = async (values) => {
    const created = await achatService.create(values)
    setIsModalOpen(false)
    toast.success(`Achat "${created.nom}" créé !`)
    navigate(`/achats/${created.id}?nouvelArticle=true`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#332821]">
            Mes achats
          </h1>
          <p className="text-sm text-[#806F62] mt-1">
            Organise ce que tu veux acheter et suis ta progression.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#6B4226] hover:bg-[#58351D] text-[#FFFDF9] text-sm font-medium shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel achat</span>
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#806F62] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un achat..."
          aria-label="Rechercher un achat"
          className="w-full pl-11 pr-4 py-3.5 rounded-full bg-[#FFFDF9] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821] placeholder:text-[#806F62]"
        />
      </div>

      {/* Filtres par pilules */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer par priorité">
        {FILTRES_PRIORITE.map((filtre) => {
          const active = prioriteFilter === filtre.value
          return (
            <button
              key={filtre.value}
              type="button"
              onClick={() => setPrioriteFilter(filtre.value)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors border ${
                active
                  ? 'bg-[#6B4226] text-[#FFFDF9] border-[#6B4226]'
                  : 'bg-[#FFFDF9] text-[#332821] border-[#E8D8C3] hover:bg-[#F1E6D6]'
              }`}
            >
              {filtre.label}
            </button>
          )
        })}
      </div>

      {/* Grille des achats ou État vide */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-52 rounded-[24px] bg-[#E8D8C3]/50" />
          ))}
        </div>
      ) : achats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {achats.map((achat) => (
            <AchatCard key={achat.id} achat={achat} />
          ))}
        </div>
      ) : (
        <div className="bg-[#FFFDF9] rounded-[28px] border border-dashed border-[#E8D8C3] py-16 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-[#EFE6D8] text-[#332821] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-xl text-[#332821]">
            Aucun achat trouvé
          </h2>
          <p className="text-sm text-[#806F62] mt-1 max-w-sm mx-auto">
            Crée ton premier achat pour commencer à t&apos;organiser.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#6B4226] hover:bg-[#58351D] text-[#FFFDF9] text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel achat</span>
          </button>
        </div>
      )}

      <AchatFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitAchat={handleCreateAchat}
      />
    </div>
  )
}
