import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '../ui/Modal'
import { objectifSchema } from '../../utils/validators'
import { CATEGORIES } from '../../utils/formatters'
import { extractErrorMessage, extractFieldErrors } from '../../services/api'

export default function ObjectifFormModal({
  isOpen,
  onClose,
  onSubmitObjectif,
  initialData = null,
}) {
  const isEdit = Boolean(initialData?.id)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(objectifSchema),
    defaultValues: {
      nom: '',
      description: '',
      montantCible: '',
      montantInitial: 0,
      dateCible: '',
      categorie: 'AUTRE',
    },
  })

  useEffect(() => {
    if (isOpen) {
      setServerError('')
      reset({
        nom: initialData?.nom || '',
        description: initialData?.description || '',
        montantCible: initialData?.montantCible ?? '',
        montantInitial: initialData?.montantInitial ?? 0,
        dateCible: initialData?.dateCible || '',
        categorie: initialData?.categorie || 'AUTRE',
      })
    }
  }, [isOpen, initialData, reset])

  const onFormSubmit = async (values) => {
    setServerError('')
    try {
      await onSubmitObjectif(values)
    } catch (err) {
      const fieldErrors = extractFieldErrors(err)
      Object.entries(fieldErrors).forEach(([field, msg]) => {
        setError(field, { type: 'server', message: msg })
      })
      setServerError(extractErrorMessage(err, "Impossible d'enregistrer l'objectif."))
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Modifier l'objectif d'épargne" : "Nouvel objectif d'épargne"}
      subtitle="Fixe un montant à atteindre et une échéance."
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

        <div>
          <label htmlFor="obj-nom" className="block text-sm font-medium text-[#332821] mb-1.5">
            Nom de l&apos;objectif
          </label>
          <input
            id="obj-nom"
            type="text"
            placeholder="Acheter mon ordinateur"
            {...register('nom')}
            className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821] placeholder:text-[#806F62]/70"
          />
          {errors.nom && (
            <p className="mt-1 text-xs text-[#A65D57]">{errors.nom.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="obj-description" className="block text-sm font-medium text-[#332821] mb-1.5">
            Description
          </label>
          <textarea
            id="obj-description"
            rows={3}
            placeholder="Un bon PC pour le travail"
            {...register('description')}
            className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821] placeholder:text-[#806F62]/70 resize-none"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-[#A65D57]">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="obj-montantCible" className="block text-sm font-medium text-[#332821] mb-1.5">
              Montant cible
            </label>
            <input
              id="obj-montantCible"
              type="number"
              min={1}
              placeholder="300 000"
              {...register('montantCible')}
              className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821] placeholder:text-[#806F62]/70"
            />
            <span className="block text-[11px] text-[#806F62] mt-1">En FCFA</span>
            {errors.montantCible && (
              <p className="mt-0.5 text-xs text-[#A65D57]">{errors.montantCible.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="obj-montantInitial" className="block text-sm font-medium text-[#332821] mb-1.5">
              Déjà épargné
            </label>
            <input
              id="obj-montantInitial"
              type="number"
              min={0}
              placeholder="0"
              {...register('montantInitial')}
              className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821] placeholder:text-[#806F62]/70"
            />
            <span className="block text-[11px] text-[#806F62] mt-1">En FCFA</span>
            {errors.montantInitial && (
              <p className="mt-0.5 text-xs text-[#A65D57]">{errors.montantInitial.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="obj-dateCible" className="block text-sm font-medium text-[#332821] mb-1.5">
              Date cible
            </label>
            <input
              id="obj-dateCible"
              type="date"
              {...register('dateCible')}
              className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821]"
            />
            {errors.dateCible && (
              <p className="mt-1 text-xs text-[#A65D57]">{errors.dateCible.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="obj-categorie" className="block text-sm font-medium text-[#332821] mb-1.5">
              Catégorie
            </label>
            <select
              id="obj-categorie"
              {...register('categorie')}
              className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821]"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            {errors.categorie && (
              <p className="mt-1 text-xs text-[#A65D57]">{errors.categorie.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3">
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
              : "Créer l'objectif"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
