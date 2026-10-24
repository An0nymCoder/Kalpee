import React, { useEffect, useState, useCallback } from 'react'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  Plus,
  Package,
  Store,
  Image as ImageIcon,
} from 'lucide-react'
import { achatService } from '../services/achatService'
import { articleService } from '../services/articleService'
import { tirelireService } from '../services/tirelireService'
import { objectifService } from '../services/objectifService'
import { useToast } from '../context/ToastContext'
import CategoryIcon from '../components/ui/CategoryIcon'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import AchatFormModal from '../components/achat/AchatFormModal'
import ArticleFormModal from '../components/achat/ArticleFormModal'
import RetraitSuggereModal from '../components/achat/RetraitSuggereModal'
import {
  formatMontant,
  formatDateFr,
  getPrioriteConfig,
  getStatutAchatConfig,
  STATUTS_ARTICLE,
} from '../utils/formatters'

export default function AchatDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()

  const [achat, setAchat] = useState(null)
  const [objectifs, setObjectifs] = useState([])
  const [loading, setLoading] = useState(true)

  const [isEditAchatOpen, setIsEditAchatOpen] = useState(false)
  const [isDeleteAchatOpen, setIsDeleteAchatOpen] = useState(false)
  const [deletingAchat, setDeletingAchat] = useState(false)

  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState(null)
  const [articleToDelete, setArticleToDelete] = useState(null)
  const [deletingArticle, setDeletingArticle] = useState(false)

  const [retraitSuggere, setRetraitSuggere] = useState(null)

  const fetchAchatDetail = useCallback(async () => {
    try {
      const [detail, objList] = await Promise.all([
        achatService.getById(id),
        objectifService.list().catch(() => []),
      ])
      setAchat(detail)
      setObjectifs(Array.isArray(objList) ? objList : [])
    } catch {
      toast.error('Achat introuvable.')
      navigate('/achats')
    } finally {
      setLoading(false)
    }
  }, [id, navigate, toast])

  useEffect(() => {
    fetchAchatDetail()
  }, [fetchAchatDetail])

  // Flux clé 1 : ouvrir directement l'ajout d'article si ?nouvelArticle=true
  useEffect(() => {
    if (searchParams.get('nouvelArticle') === 'true') {
      setEditingArticle(null)
      setIsArticleModalOpen(true)
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('nouvelArticle')
      setSearchParams(nextParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleUpdateAchat = async (values) => {
    await achatService.update(id, values)
    setIsEditAchatOpen(false)
    toast.success('Achat mis à jour.')
    fetchAchatDetail()
  }

  const handleDeleteAchat = async () => {
    setDeletingAchat(true)
    try {
      await achatService.remove(id)
      toast.success('Achat supprimé.')
      navigate('/achats')
    } catch {
      toast.error('Impossible de supprimer cet achat.')
    } finally {
      setDeletingAchat(false)
      setIsDeleteAchatOpen(false)
    }
  }

  const handleSaveArticle = async (values, { file, removeExistingPhoto }) => {
    let savedArticle
    if (editingArticle?.id) {
      savedArticle = await articleService.update(editingArticle.id, values)
      if (removeExistingPhoto && !file) {
        await articleService.deletePhoto(editingArticle.id).catch(() => {})
      }
      if (file) {
        await articleService.uploadPhoto(editingArticle.id, file)
      }
      toast.success('Article modifié.')
    } else {
      savedArticle = await articleService.create(id, values)
      if (file && savedArticle?.id) {
        await articleService.uploadPhoto(savedArticle.id, file)
      }
      toast.success('Article ajouté !')
    }
    setIsArticleModalOpen(false)
    setEditingArticle(null)
    fetchAchatDetail()
  }

  const handleDeleteArticle = async () => {
    if (!articleToDelete) return
    setDeletingArticle(true)
    try {
      await articleService.remove(articleToDelete.id)
      toast.success('Article supprimé.')
      setArticleToDelete(null)
      fetchAchatDetail()
    } catch {
      toast.error("Impossible de supprimer l'article.")
    } finally {
      setDeletingArticle(false)
    }
  }

  // Flux clé 2 : Changement de statut d'un article -> proposition de retrait
  const handleChangeStatutArticle = async (article, newStatut) => {
    if (article.statut === newStatut) return
    try {
      const response = await articleService.updateStatut(article.id, newStatut)
      await fetchAchatDetail()
      if (response?.retraitSuggere) {
        setRetraitSuggere(response.retraitSuggere)
      } else {
        toast.success('Statut de l’article mis à jour.')
      }
    } catch {
      toast.error('Impossible de modifier le statut de cet article.')
    }
  }

  const handleConfirmRetraitSuggere = async (payload) => {
    await tirelireService.retirer(payload)
    setRetraitSuggere(null)
    toast.success('Retrait effectué depuis ta tirelire !')
  }

  if (loading || !achat) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-[#E8D8C3]/60 rounded-full" />
        <div className="h-64 bg-[#E8D8C3]/60 rounded-[28px]" />
        <div className="h-48 bg-[#E8D8C3]/60 rounded-[28px]" />
      </div>
    )
  }

  const priorite = getPrioriteConfig(achat.priorite)
  const statut = getStatutAchatConfig(achat.statut)
  const progression = Math.min(100, Math.max(0, Number(achat.progression || 0)))
  const articles = achat.articles || []

  return (
    <div className="space-y-8">
      {/* Barre supérieure : Retour Mes achats (sans bouton Partager WhatsApp) */}
      <div className="flex items-center justify-between">
        <Link
          to="/achats"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#806F62] hover:text-[#332821] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Mes achats</span>
        </Link>
      </div>

      {/* Carte principale de l'achat */}
      <div className="bg-[#FFFDF9] rounded-[28px] border border-[#E8D8C3] p-6 sm:p-8 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-[#EFE6D8] text-[#332821] flex items-center justify-center shrink-0">
              <CategoryIcon categorie={achat.categorie} className="w-6 h-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${priorite.badgeClass}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${priorite.dotClass}`} />
                  {priorite.label}
                </span>

                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statut.badgeClass}`}
                >
                  {statut.label}
                </span>
              </div>

              <h1 className="font-serif text-3xl text-[#332821]">{achat.nom}</h1>
              {achat.description && (
                <p className="text-sm text-[#806F62] mt-1">{achat.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start">
            {achat.statut !== 'TERMINE' && (
              <button
                type="button"
                onClick={() => setIsEditAchatOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#EFE6D8] hover:bg-[#E8D8C3] text-[#332821] text-xs font-semibold transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Modifier</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsDeleteAchatOpen(true)}
              aria-label="Supprimer l'achat"
              className="w-10 h-10 rounded-full bg-[#F6E6E4] hover:bg-[#A65D57] text-[#A65D57] hover:text-white flex items-center justify-center transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 encarts : Coût total, Déjà acheté, Échéance prévue */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-[#EFE6D8]/75">
            <p className="text-xs text-[#806F62] mb-1">Coût total</p>
            <p className="font-serif text-2xl text-[#332821]">
              {formatMontant(achat.total)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#EFE6D8]/75">
            <p className="text-xs text-[#806F62] mb-1">Déjà acheté</p>
            <p className="font-serif text-2xl text-[#718355]">
              {formatMontant(achat.dejaAchete)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#EFE6D8]/75">
            <div className="flex items-center gap-1.5 text-xs text-[#806F62] mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Échéance prévue</span>
            </div>
            <p className="font-serif text-xl text-[#332821]">
              {formatDateFr(achat.dateLimite)}
            </p>
          </div>
        </div>

        {/* Barre de progression */}
        <div>
          <div className="flex items-center justify-between text-xs text-[#806F62] mb-2">
            <span>Reste à acheter : {formatMontant(achat.resteAAcheter)}</span>
            <span className="font-semibold text-[#332821]">{progression}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#EFE6D8] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#6B4226] transition-all duration-300"
              style={{ width: `${progression}%` }}
            />
          </div>
        </div>
      </div>

      {/* Section Articles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-[#332821]">
            Articles{' '}
            <span className="text-base font-sans text-[#806F62]">
              ({articles.length})
            </span>
          </h2>

          <button
            type="button"
            onClick={() => {
              setEditingArticle(null)
              setIsArticleModalOpen(true)
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6B4226] hover:bg-[#58351D] text-[#FFFDF9] text-xs sm:text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un article</span>
          </button>
        </div>

        {articles.length === 0 ? (
          <div className="bg-[#FFFDF9] rounded-[28px] border border-dashed border-[#E8D8C3] py-14 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#EFE6D8] text-[#332821] flex items-center justify-center mx-auto mb-3">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl text-[#332821]">Aucun article</h3>
            <p className="text-sm text-[#806F62] mt-1 max-w-md mx-auto">
              Ajoute les articles que tu souhaites acheter avec leur photo et leur prix.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingArticle(null)
                setIsArticleModalOpen(true)
              }}
              className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#6B4226] hover:bg-[#58351D] text-[#FFFDF9] text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un article</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {articles.map((article) => {
              const isBought = article.statut === 'ACHETE'
              return (
                <div
                  key={article.id}
                  className={`bg-[#FFFDF9] rounded-[24px] border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    isBought
                      ? 'border-[#718355]/40 bg-[#FAFDF8]'
                      : 'border-[#E8D8C3]'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    {/* Photo ou placeholder */}
                    <div className="w-16 h-16 rounded-2xl bg-[#EFE6D8] border border-[#E8D8C3] flex items-center justify-center overflow-hidden shrink-0">
                      {article.aPhoto && article.photoUrl ? (
                        <img
                          src={article.photoUrl}
                          alt={article.nom}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-[#806F62]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3
                        className={`font-serif text-lg text-[#332821] truncate ${
                          isBought ? 'line-through opacity-80' : ''
                        }`}
                      >
                        {article.nom}
                      </h3>
                      {article.description && (
                        <p className="text-xs text-[#806F62] truncate mt-0.5">
                          {article.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#806F62] mt-1.5">
                        <span>
                          {article.quantite} × {formatMontant(article.prixUnitaire)}
                        </span>
                        <span className="font-semibold text-[#332821]">
                          = {formatMontant(article.total)}
                        </span>
                        {article.magasin && (
                          <span className="inline-flex items-center gap-1 text-[#6B4226]">
                            <Store className="w-3.5 h-3.5" />
                            {article.magasin}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sélecteur de statut + actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F1E6D6]">
                    {isBought ? (
                      <span
                        aria-label={`Statut de ${article.nom}`}
                        title="Article acheté — état verrouillé"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#E7ECE1] text-[#718355] border border-[#718355]/30 select-none"
                      >
                        <span>✓ Acheté (Terminé)</span>
                      </span>
                    ) : (
                      <>
                        <select
                          aria-label={`Statut de ${article.nom}`}
                          value={article.statut}
                          onChange={(e) => handleChangeStatutArticle(article, e.target.value)}
                          className={`px-3.5 py-2 rounded-full text-xs font-semibold border border-[#E8D8C3] focus:outline-none focus:border-[#6B4226] cursor-pointer ${
                            article.statut === 'MIS_DE_COTE'
                              ? 'bg-[#F8EFE2] text-[#C58B45]'
                              : 'bg-[#F1E6D6] text-[#332821]'
                          }`}
                        >
                          {STATUTS_ARTICLE.map((st) => (
                            <option key={st.value} value={st.value}>
                              {st.label}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingArticle(article)
                            setIsArticleModalOpen(true)
                          }}
                          aria-label={`Modifier ${article.nom}`}
                          className="p-2 rounded-full bg-[#EFE6D8] hover:bg-[#E8D8C3] text-[#332821] transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => setArticleToDelete(article)}
                      aria-label={`Supprimer ${article.nom}`}
                      className="p-2 rounded-full bg-[#F6E6E4] hover:bg-[#A65D57] text-[#A65D57] hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modales */}
      <AchatFormModal
        isOpen={isEditAchatOpen}
        onClose={() => setIsEditAchatOpen(false)}
        onSubmitAchat={handleUpdateAchat}
        initialData={achat}
      />

      <ConfirmDialog
        isOpen={isDeleteAchatOpen}
        onClose={() => setIsDeleteAchatOpen(false)}
        onConfirm={handleDeleteAchat}
        loading={deletingAchat}
        title="Supprimer cet achat ?"
        message={`Es-tu sûr de vouloir supprimer l'achat "${achat.nom}" et tous ses articles ? Cette action est irréversible.`}
      />

      <ArticleFormModal
        isOpen={isArticleModalOpen}
        onClose={() => {
          setIsArticleModalOpen(false)
          setEditingArticle(null)
        }}
        onSubmitArticle={handleSaveArticle}
        initialData={editingArticle}
      />

      <ConfirmDialog
        isOpen={Boolean(articleToDelete)}
        onClose={() => setArticleToDelete(null)}
        onConfirm={handleDeleteArticle}
        loading={deletingArticle}
        title="Supprimer cet article ?"
        message={`Veux-tu vraiment supprimer l'article "${articleToDelete?.nom || ''}" ?`}
      />

      <RetraitSuggereModal
        isOpen={Boolean(retraitSuggere)}
        onClose={() => setRetraitSuggere(null)}
        retraitSuggere={retraitSuggere}
        onConfirmRetrait={handleConfirmRetraitSuggere}
        objectifs={objectifs}
      />
    </div>
  )
}
