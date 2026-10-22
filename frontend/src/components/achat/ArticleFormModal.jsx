import React, { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Trash2 } from 'lucide-react'
import Modal from '../ui/Modal'
import { articleSchema } from '../../utils/validators'
import { formatMontant } from '../../utils/formatters'
import { extractErrorMessage, extractFieldErrors } from '../../services/api'

export default function ArticleFormModal({
  isOpen,
  onClose,
  onSubmitArticle,
  initialData = null,
}) {
  const isEdit = Boolean(initialData?.id)
  const [serverError, setServerError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [removeExistingPhoto, setRemoveExistingPhoto] = useState(false)
  const fileInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      nom: '',
      description: '',
      quantite: 1,
      prixUnitaire: '',
      magasin: '',
      statut: 'A_ACHETER',
    },
  })

  const watchedQuantite = watch('quantite')
  const watchedPrixUnitaire = watch('prixUnitaire')

  const calcTotal =
    Math.max(0, Number(watchedQuantite) || 0) *
    Math.max(0, Number(watchedPrixUnitaire) || 0)

  useEffect(() => {
    if (isOpen) {
      setServerError('')
      setSelectedFile(null)
      setRemoveExistingPhoto(false)
      setPreviewUrl(
        initialData?.aPhoto && initialData?.photoUrl
          ? initialData.photoUrl
          : null
      )
      reset({
        nom: initialData?.nom || '',
        description: initialData?.description || '',
        quantite: initialData?.quantite ?? 1,
        prixUnitaire: initialData?.prixUnitaire ?? '',
        magasin: initialData?.magasin || '',
        statut: initialData?.statut || 'A_ACHETER',
      })
    }
  }, [isOpen, initialData, reset])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setServerError('Formats acceptés : JPEG, PNG ou WebP uniquement.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setServerError('La photo ne doit pas dépasser 5 Mo.')
      return
    }
    setServerError('')
    setSelectedFile(file)
    setRemoveExistingPhoto(false)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleClearPhoto = (e) => {
    e.stopPropagation()
    setSelectedFile(null)
    setPreviewUrl(null)
    if (initialData?.aPhoto) {
      setRemoveExistingPhoto(true)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onFormSubmit = async (values) => {
    setServerError('')
    try {
      await onSubmitArticle(values, {
        file: selectedFile,
        removeExistingPhoto,
      })
    } catch (err) {
      const fieldErrors = extractFieldErrors(err)
      Object.entries(fieldErrors).forEach(([field, msg]) => {
        setError(field, { type: 'server', message: msg })
      })
      setServerError(extractErrorMessage(err, "Impossible d'enregistrer l'article."))
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Modifier l'article" : 'Ajouter un article'}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-[#FDF4F3] border border-[#A65D57]/30 text-xs font-medium text-[#A65D57]"
          >
            {serverError}
          </div>
        )}

        {/* Zone Photo visuelle */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Prendre ou choisir une photo"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
            }}
            className="relative w-full h-36 rounded-2xl bg-[#EFE6D8]/70 hover:bg-[#EFE6D8] border border-[#E8D8C3] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors"
          >
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Aperçu de l'article"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleClearPhoto}
                  aria-label="Retirer la photo"
                  className="absolute top-2.5 right-2.5 p-2 rounded-full bg-[#2A1B12]/70 text-white hover:bg-[#A65D57] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#806F62]">
                <Camera className="w-6 h-6" />
                <span className="text-sm font-medium">
                  Prendre ou choisir une photo
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="article-nom" className="block text-sm font-medium text-[#332821] mb-1.5">
            Nom
          </label>
          <input
            id="article-nom"
            type="text"
            placeholder="Jean noir"
            {...register('nom')}
            className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821] placeholder:text-[#806F62]/70"
          />
          {errors.nom && (
            <p className="mt-1 text-xs text-[#A65D57]">{errors.nom.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="article-description" className="block text-sm font-medium text-[#332821] mb-1.5">
            Description
          </label>
          <input
            id="article-description"
            type="text"
            placeholder="Jean noir coupe droite"
            {...register('description')}
            className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821] placeholder:text-[#806F62]/70"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-[#A65D57]">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="article-quantite" className="block text-sm font-medium text-[#332821] mb-1.5">
              Quantité
            </label>
            <input
              id="article-quantite"
              type="number"
              min={1}
              {...register('quantite')}
              className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821]"
            />
            {errors.quantite && (
              <p className="mt-1 text-xs text-[#A65D57]">{errors.quantite.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="article-prixUnitaire" className="block text-sm font-medium text-[#332821] mb-1.5">
              Prix unitaire
            </label>
            <input
              id="article-prixUnitaire"
              type="number"
              min={0}
              placeholder="15 000"
              {...register('prixUnitaire')}
              className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821] placeholder:text-[#806F62]/70"
            />
            <span className="block text-[11px] text-[#806F62] mt-1">En FCFA</span>
            {errors.prixUnitaire && (
              <p className="mt-0.5 text-xs text-[#A65D57]">{errors.prixUnitaire.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="article-magasin" className="block text-sm font-medium text-[#332821] mb-1.5">
            Magasin / source
          </label>
          <input
            id="article-magasin"
            type="text"
            placeholder="Ex : Zara, Marché Sandaga, Jumia..."
            {...register('magasin')}
            className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821] placeholder:text-[#806F62]/70"
          />
          {errors.magasin && (
            <p className="mt-1 text-xs text-[#A65D57]">{errors.magasin.message}</p>
          )}
        </div>

        {/* Total calculé en direct */}
        <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-[#EFE6D8] border border-[#E8D8C3]">
          <span className="text-sm text-[#806F62] font-medium">Total article</span>
          <span className="font-serif text-xl text-[#332821]" data-testid="article-live-total">
            {formatMontant(calcTotal)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-5 rounded-full bg-[#E8D8C3]/80 hover:bg-[#E8D8C3] text-[#332821] font-medium text-sm transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-5 rounded-full bg-[#6B4226] hover:bg-[#58351D] text-[#FFFDF9] font-medium text-sm transition-colors disabled:opacity-60"
          >
            {isSubmitting
              ? 'Enregistrement...'
              : isEdit
              ? 'Enregistrer'
              : "Ajouter l'article"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
