import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus,
  Minus,
  PiggyBank,
  ShoppingBag,
  Target,
  ArrowRight,
  Wallet,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { dashboardService } from '../services/dashboardService'
import { achatService } from '../services/achatService'
import { tirelireService } from '../services/tirelireService'
import { objectifService } from '../services/objectifService'
import { formatMontant, formatDateFr } from '../utils/formatters'
import AchatCard from '../components/achat/AchatCard'
import AchatFormModal from '../components/achat/AchatFormModal'
import TransactionModal from '../components/tirelire/TransactionModal'
import ObjectifFormModal from '../components/objectifs/ObjectifFormModal'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [data, setData] = useState(null)
  const [objectifsList, setObjectifsList] = useState([])
  const [loading, setLoading] = useState(true)

  const [isAchatModalOpen, setIsAchatModalOpen] = useState(false)
  const [txModalType, setTxModalType] = useState(null) // 'DEPOT' | 'RETRAIT' | null
  const [isObjectifModalOpen, setIsObjectifModalOpen] = useState(false)

  const fetchDashboard = useCallback(async () => {
    try {
      const [dashRes, objRes] = await Promise.all([
        dashboardService.getDashboard(),
        objectifService.list().catch(() => []),
      ])
      setData(dashRes)
      setObjectifsList(Array.isArray(objRes) ? objRes : [])
    } catch {
      toast.error('Impossible de charger le tableau de bord.')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const handleCreateAchat = async (values) => {
    const created = await achatService.create(values)
    setIsAchatModalOpen(false)
    toast.success(`Achat "${created.nom}" créé !`)
    navigate(`/achats/${created.id}?nouvelArticle=true`)
  }

  const handleTransaction = async (values) => {
    if (txModalType === 'DEPOT') {
      await tirelireService.deposer(values)
      toast.success('Dépôt enregistré dans ta tirelire !')
    } else {
      await tirelireService.retirer(values)
      toast.success('Retrait effectué depuis ta tirelire.')
    }
    setTxModalType(null)
    fetchDashboard()
  }

  const handleCreateObjectif = async (values) => {
    await objectifService.create(values)
    setIsObjectifModalOpen(false)
    toast.success('Objectif créé avec succès !')
    fetchDashboard()
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 w-64 bg-[#E8D8C3]/60 rounded-2xl" />
        <div className="h-44 w-full bg-[#E8D8C3]/60 rounded-[28px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-[#E8D8C3]/60 rounded-[28px]" />
          <div className="h-64 bg-[#E8D8C3]/60 rounded-[28px]" />
        </div>
      </div>
    )
  }

  const solde = data?.solde ?? 0
  const totalDepose = data?.totalDepose ?? 0
  const totalRetire = data?.totalRetire ?? 0
  const nombreAchats = data?.nombreAchats ?? 0
  const totalPrevu = data?.totalPrevu ?? 0
  const dejaAchete = data?.dejaAchete ?? 0
  const resteAFinancer = data?.resteAFinancer ?? 0
  const progressionAchats = Math.min(100, Math.max(0, Number(data?.progressionAchats ?? 0)))
  const achatsParPriorite = data?.achatsParPriorite || {
    URGENT: 0,
    IMPORTANT: 0,
    NORMAL: 0,
    FAIBLE: 0,
  }
  const objectifPrincipal = data?.objectifPrincipal || null
  const achatsPrioritaires = data?.achatsPrioritaires || []

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[#806F62] mb-1">
            Bonjour {user?.prenom || 'toi'} 👋
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#332821]">
            Voici où tu en es.
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setIsAchatModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#6B4226] hover:bg-[#58351D] text-[#FFFDF9] text-sm font-medium shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel achat</span>
        </button>
      </div>

      {/* Grande carte marron : Ma tirelire disponible */}
      <div className="relative overflow-hidden rounded-[28px] bg-[#6B4226] text-[#FFFDF9] p-6 sm:p-8 shadow-soft">
        <div className="pointer-events-none absolute -right-12 -top-12 w-56 h-56 rounded-full bg-[#8B6245]/30" />
        <div className="pointer-events-none absolute -left-16 -bottom-20 w-64 h-64 rounded-full bg-[#3E2723]/25" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9]/15 text-xs font-medium text-[#F1E6D6] mb-4">
              <PiggyBank className="w-3.5 h-3.5" />
              <span>Ma tirelire disponible</span>
            </div>

            <p className="font-serif text-4xl sm:text-5xl tracking-tight">
              {formatMontant(solde)}
            </p>

            <p className="text-xs sm:text-sm text-[#E8D8C3] mt-3">
              Déposé : {formatMontant(totalDepose)} <span className="mx-1.5">•</span> Retiré : {formatMontant(totalRetire)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setTxModalType('DEPOT')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#FFFDF9] hover:bg-[#F1E6D6] text-[#332821] text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Déposer</span>
            </button>
            <button
              type="button"
              onClick={() => setTxModalType('RETRAIT')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[#FFFDF9]/35 hover:bg-[#FFFDF9]/10 text-[#FFFDF9] text-sm font-medium transition-colors"
            >
              <Minus className="w-4 h-4" />
              <span>Retirer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Deux cartes : Budget des achats & Objectif d'épargne */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carte Budget des achats */}
        <div className="bg-[#FFFDF9] rounded-[28px] border border-[#E8D8C3] p-6 flex flex-col justify-between shadow-card">
          <div>
            <div className="flex items-center justify-between gap-2 mb-5">
              <div className="flex items-center gap-2.5 text-[#332821] font-medium">
                <ShoppingBag className="w-4 h-4 text-[#6B4226]" />
                <span>Budget des achats</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#EFE6D8] text-xs font-semibold text-[#332821]">
                {nombreAchats} projet{nombreAchats > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#EFE6D8]/75 mb-5">
              <div>
                <p className="text-xs text-[#806F62] mb-1">Total prévu</p>
                <p className="font-serif text-xl sm:text-2xl text-[#332821]">
                  {formatMontant(totalPrevu)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#806F62] mb-1">Reste à financer</p>
                <p className="font-serif text-xl sm:text-2xl text-[#6B4226]">
                  {formatMontant(resteAFinancer)}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-[#806F62] mb-2">
                <span>Déjà acheté : {formatMontant(dejaAchete)}</span>
                <span className="font-semibold text-[#332821]">{progressionAchats}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#EFE6D8] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#6B4226] transition-all duration-300"
                  style={{ width: `${progressionAchats}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 px-4 py-3 rounded-2xl bg-[#F7F1E8] text-xs text-[#806F62]">
            {nombreAchats === 0
              ? 'Ajoute ton premier achat pour suivre ton budget.'
              : `Tu as financé ${progressionAchats}% de tes projets d'achats.`}
          </div>
        </div>

        {/* Carte Objectif d'épargne + Répartition par priorité */}
        <div className="bg-[#FFFDF9] rounded-[28px] border border-[#E8D8C3] p-6 flex flex-col justify-between shadow-card">
          <div>
            <div className="flex items-center justify-between gap-2 mb-5">
              <div className="flex items-center gap-2.5 text-[#332821] font-medium">
                <Target className="w-4 h-4 text-[#6B4226]" />
                <span>Objectif d&apos;épargne</span>
              </div>
              <Link
                to="/objectifs"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#332821] hover:text-[#6B4226]"
              >
                <span>Gérer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {objectifPrincipal ? (
              <div className="p-4 rounded-2xl bg-[#EFE6D8]/75 mb-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-[#332821]">
                      {objectifPrincipal.nom}
                    </p>
                    <p className="text-xs text-[#806F62]">
                      Échéance : {formatDateFr(objectifPrincipal.dateCible)}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#6B4226]">
                    {objectifPrincipal.progression ?? 0}%
                  </span>
                </div>
                <p className="text-xs text-[#332821] mb-2">
                  {formatMontant(objectifPrincipal.montantEpargne)} /{' '}
                  {formatMontant(objectifPrincipal.montantCible)}
                </p>
                <div className="w-full h-2 rounded-full bg-[#E8D8C3] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#718355]"
                    style={{
                      width: `${Math.min(100, Math.max(0, objectifPrincipal.progression || 0))}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#EFE6D8]/75 mb-5">
                <div>
                  <p className="text-sm font-semibold text-[#332821]">
                    Aucun objectif actif
                  </p>
                  <p className="text-xs text-[#806F62] mt-0.5">
                    Épargne à ton rythme pour un projet important.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsObjectifModalOpen(true)}
                  className="px-4 py-2 rounded-full bg-[#E8D8C3] hover:bg-[#D8C4AC] text-xs font-semibold text-[#332821] transition-colors shrink-0"
                >
                  Créer
                </button>
              </div>
            )}
          </div>

          {/* Répartition par priorité */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#806F62] mb-2.5">
              Répartition par priorité
            </p>
            <div className="grid grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-[#F6E6E4]/70 text-center">
                <p className="font-serif text-lg text-[#A65D57]">
                  {achatsParPriorite.URGENT ?? 0}
                </p>
                <p className="text-[11px] text-[#806F62]">Urgent</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#F8EFE2]/80 text-center">
                <p className="font-serif text-lg text-[#C58B45]">
                  {achatsParPriorite.IMPORTANT ?? 0}
                </p>
                <p className="text-[11px] text-[#806F62]">Important</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#EFE6D8]/90 text-center">
                <p className="font-serif text-lg text-[#332821]">
                  {achatsParPriorite.NORMAL ?? 0}
                </p>
                <p className="text-[11px] text-[#806F62]">Normal</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#F3ECE1] text-center">
                <p className="font-serif text-lg text-[#806F62]">
                  {achatsParPriorite.FAIBLE ?? 0}
                </p>
                <p className="text-[11px] text-[#806F62]">Faible</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Mes achats prioritaires */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl text-[#332821]">
            Mes achats prioritaires
          </h2>
          <Link
            to="/achats"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#332821] hover:text-[#6B4226]"
          >
            <span>Tout voir</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {achatsPrioritaires.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {achatsPrioritaires.map((achat) => (
              <AchatCard key={achat.id} achat={achat} />
            ))}
          </div>
        ) : (
          <div className="bg-[#FFFDF9] rounded-[28px] border border-dashed border-[#E8D8C3] p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-[#EFE6D8] text-[#6B4226] flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl text-[#332821]">
              Aucun achat en cours
            </h3>
            <p className="text-sm text-[#806F62] mt-1 max-w-md mx-auto">
              Crée ton premier projet d&apos;achat pour organiser tes articles et suivre tes priorités.
            </p>
            <button
              type="button"
              onClick={() => setIsAchatModalOpen(true)}
              className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#6B4226] hover:bg-[#58351D] text-[#FFFDF9] text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel achat</span>
            </button>
          </div>
        )}
      </div>

      {/* Modales */}
      <AchatFormModal
        isOpen={isAchatModalOpen}
        onClose={() => setIsAchatModalOpen(false)}
        onSubmitAchat={handleCreateAchat}
      />

      <TransactionModal
        isOpen={Boolean(txModalType)}
        onClose={() => setTxModalType(null)}
        type={txModalType || 'DEPOT'}
        onSubmitTransaction={handleTransaction}
        objectifs={objectifsList}
      />

      <ObjectifFormModal
        isOpen={isObjectifModalOpen}
        onClose={() => setIsObjectifModalOpen(false)}
        onSubmitObjectif={handleCreateObjectif}
      />
    </div>
  )
}
