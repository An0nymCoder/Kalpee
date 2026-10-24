import React, { useEffect, useState, useCallback } from 'react'
import {
  PiggyBank,
  Plus,
  Minus,
  ArrowDownLeft,
  ArrowUpRight,
  Target,
  ShoppingBag,
} from 'lucide-react'
import { tirelireService } from '../services/tirelireService'
import { objectifService } from '../services/objectifService'
import { useToast } from '../context/ToastContext'
import { formatMontant, groupTransactionsByDate } from '../utils/formatters'
import TransactionModal from '../components/tirelire/TransactionModal'

export default function Tirelire() {
  const toast = useToast()

  const [tirelire, setTirelire] = useState({ solde: 0, totalDepose: 0, totalRetire: 0 })
  const [transactions, setTransactions] = useState([])
  const [page, setPage] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [objectifs, setObjectifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const [modalType, setModalType] = useState(null) // 'DEPOT' | 'RETRAIT' | null

  const fetchInitialData = useCallback(async () => {
    try {
      const [tirRes, txRes, objRes] = await Promise.all([
        tirelireService.getTirelire(),
        tirelireService.getTransactions(0, 20),
        objectifService.list().catch(() => []),
      ])
      setTirelire(tirRes || { solde: 0, totalDepose: 0, totalRetire: 0 })
      setTransactions(txRes?.content || [])
      setPage(0)
      setHasNext(Boolean(txRes?.hasNext))
      setObjectifs(Array.isArray(objRes) ? objRes : [])
    } catch {
      toast.error('Impossible de charger ta tirelire.')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  const handleLoadMore = async () => {
    if (!hasNext || loadingMore) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const txRes = await tirelireService.getTransactions(nextPage, 20)
      setTransactions((prev) => [...prev, ...(txRes?.content || [])])
      setPage(nextPage)
      setHasNext(Boolean(txRes?.hasNext))
    } catch {
      toast.error("Impossible de charger plus d'historique.")
    } finally {
      setLoadingMore(false)
    }
  }

  const handleTransactionSubmit = async (values) => {
    if (modalType === 'DEPOT') {
      await tirelireService.deposer(values)
      toast.success('Argent ajouté dans ta tirelire !')
    } else {
      await tirelireService.retirer(values)
      toast.success('Retrait enregistré.')
    }
    setModalType(null)
    fetchInitialData()
  }

  const groupedTransactions = groupTransactionsByDate(transactions)

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#332821]">
          Ma tirelire
        </h1>
        <p className="text-sm text-[#806F62] mt-1">
          Mets de l&apos;argent de côté et suis tes mouvements.
        </p>
      </div>

      {/* Grande carte marron centrale */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#3E2723] via-[#6B4226] to-[#8B6245] text-[#FFFDF9] px-6 py-10 sm:py-12 text-center shadow-[0_16px_40px_-8px_rgba(62,39,35,0.32)] border border-[#FFFDF9]/15 animate-fade-up-delay-1">
        <div className="pointer-events-none absolute -right-12 -top-12 w-60 h-60 rounded-full bg-[#C58B45]/25 blur-2xl animate-pulse-slow" />
        <div className="pointer-events-none absolute -left-16 -bottom-20 w-72 h-72 rounded-full bg-[#2A1B12]/40 blur-2xl animate-float-slow" />

        <div className="relative z-10 max-w-md mx-auto flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-[#FFFDF9]/15 backdrop-blur-sm border border-[#FFFDF9]/20 flex items-center justify-center mb-4 shadow-md">
            <PiggyBank className="w-7 h-7 text-[#FFFDF9]" />
          </div>

          <p className="font-serif text-4xl sm:text-5xl tracking-tight drop-shadow-sm">
            {formatMontant(tirelire.solde)}
          </p>
          <p className="text-sm text-[#E8D8C3] mt-2">Argent disponible</p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 w-full">
            <button
              type="button"
              onClick={() => setModalType('DEPOT')}
              className="min-w-[140px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FFFDF9] hover:bg-[#F1E6D6] text-[#332821] text-sm font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>

            <button
              type="button"
              onClick={() => setModalType('RETRAIT')}
              className="min-w-[140px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#FFFDF9]/40 bg-[#FFFDF9]/5 hover:bg-[#FFFDF9]/15 text-[#FFFDF9] text-sm font-medium hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
            >
              <Minus className="w-4 h-4" />
              <span>Retirer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cartes Total déposé / Total retiré */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-[#FFFDF9] rounded-[24px] border border-[#E8D8C3] p-5 flex items-center gap-4 shadow-card">
          <div className="w-12 h-12 rounded-full bg-[#E7ECE1] text-[#718355] flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#806F62]">Total déposé</p>
            <p className="font-serif text-2xl text-[#332821] mt-0.5">
              {formatMontant(tirelire.totalDepose)}
            </p>
          </div>
        </div>

        <div className="bg-[#FFFDF9] rounded-[24px] border border-[#E8D8C3] p-5 flex items-center gap-4 shadow-card">
          <div className="w-12 h-12 rounded-full bg-[#F6E6E4] text-[#A65D57] flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#806F62]">Total retiré</p>
            <p className="font-serif text-2xl text-[#332821] mt-0.5">
              {formatMontant(tirelire.totalRetire)}
            </p>
          </div>
        </div>
      </div>

      {/* Historique des transactions */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl text-[#332821]">Historique</h2>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 rounded-2xl bg-[#E8D8C3]/50" />
            ))}
          </div>
        ) : groupedTransactions.length === 0 ? (
          <div className="bg-[#FFFDF9] rounded-[28px] border border-dashed border-[#E8D8C3] py-12 px-6 text-center">
            <p className="font-serif text-lg text-[#332821]">
              Aucun mouvement pour le moment
            </p>
            <p className="text-sm text-[#806F62] mt-1">
              Tes dépôts et retraits apparaîtront ici jour par jour.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedTransactions.map((group) => (
              <div key={group.label} className="space-y-2.5">
                <h3 className="text-xs font-semibold text-[#806F62] px-1">
                  {group.label}
                </h3>

                <div className="space-y-2.5">
                  {group.items.map((tx) => {
                    const isDepot = tx.type === 'DEPOT'
                    return (
                      <div
                        key={tx.id}
                        className="bg-[#FFFDF9] rounded-[22px] border border-[#E8D8C3] p-4 sm:px-5 flex items-center justify-between gap-4 shadow-card"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              isDepot
                                ? 'bg-[#E7ECE1] text-[#718355]'
                                : 'bg-[#F6E6E4] text-[#A65D57]'
                            }`}
                          >
                            {isDepot ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#332821] truncate">
                              {tx.motif}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              <span className="text-xs text-[#806F62]">
                                {isDepot ? 'Dépôt' : 'Retrait'}
                              </span>
                              {tx.objectifNom && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EFE6D8] text-[11px] font-medium text-[#6B4226]">
                                  <Target className="w-3 h-3" />
                                  {tx.objectifNom}
                                </span>
                              )}
                              {tx.articleNom && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F1E6D6] text-[11px] font-medium text-[#332821]">
                                  <ShoppingBag className="w-3 h-3" />
                                  {tx.articleNom}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-sm sm:text-base font-semibold shrink-0 ${
                            isDepot ? 'text-[#718355]' : 'text-[#A65D57]'
                          }`}
                        >
                          {isDepot ? '+ ' : '- '}
                          {formatMontant(tx.montant)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {hasNext && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 rounded-full bg-[#EFE6D8] hover:bg-[#E8D8C3] text-xs font-semibold text-[#332821] transition-colors"
                >
                  {loadingMore ? 'Chargement...' : 'Voir plus'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={Boolean(modalType)}
        onClose={() => setModalType(null)}
        type={modalType || 'DEPOT'}
        onSubmitTransaction={handleTransactionSubmit}
        objectifs={objectifs}
      />
    </div>
  )
}
