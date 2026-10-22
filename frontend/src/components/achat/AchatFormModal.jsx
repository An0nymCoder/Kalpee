import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '../ui/Modal'
import { achatSchema } from '../../utils/validators'
import { PRIORITES, CATEGORIES } from '../../utils/formatters'
import { extractErrorMessage, extractFieldErrors } from '../../services/api'

export default function AchatFormModal({
  isOpen,
  onClose,
  onSubmitAchat,
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
    resolver: zodResolver(achatSchema),
    defaultValues: {
      nom: '',
      description: '',
      priorite: 'NORMAL',
      categorie: 'AUTRE',
      dateLimite: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      setServerError('')
      reset({
        nom: initialData?.nom || '',
        description: initialData?.description || '',
        priorite: initialData?.priorite || 'NORMAL',
        categorie: initialData?.categorie || 'AUTRE',
        dateLimite: initialData?.dateLimite || '',
      })
    }
  }, [isOpen, initialData, reset])

  const onFormSubmit = async (values) => {
    setServerError('')
    try {
      await onSubmitAchat(values)
    } catch (err) {
      const fieldErrors = extractFieldErrors(err)
      Object.entries(fieldErrors).forEach(([field, msg]) => {
        setError(field, { type: 'server', message: msg })
      })
      setServerError(extractErrorMessage(err, "Impossible d'enregistrer l'achat."))
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Modifier l'achat" : 'Créer un nouvel achat'}
      subtitle="Regroupe les articles que tu veux acheter ensemble."
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
          <label htmlFor="achat-nom" className="block text-sm font-medium text-[#332821] mb-1.5">
            Nom de l&apos;achat
          </label>
          <input
            id="achat-nom"
            type="text"
            placeholder="Habits pour les vacances"
            {...register('nom')}
            className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821] placeholder:text-[#806F62]/70"
          />
          {errors.nom && (
            <p className="mt-1 text-xs text-[#A65D57]">{errors.nom.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="achat-description" className="block text-sm font-medium text-[#332821] mb-1.5">
            Description
          </label>
          <textarea
            id="achat-description"
            rows={3}
            placeholder="Quelques vêtements pour les vacances"
            {...register('description')}
            className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821] placeholder:text-[#806F62]/70 resize-none"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-[#A65D57]">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="achat-priorite" className="block text-sm font-medium text-[#332821] mb-1.5">
              Priorité
            </label>
            <select
              id="achat-priorite"
              {...register('priorite')}
              className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821]"
            >
              {PRIORITES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            {errors.priorite && (
              <p className="mt-1 text-xs text-[#A65D57]">{errors.priorite.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="achat-categorie" className="block text-sm font-medium text-[#332821] mb-1.5">
              Catégorie
            </label>
            <select
              id="achat-categorie"
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

        <div>
          <label htmlFor="achat-dateLimite" className="block text-sm font-medium text-[#332821] mb-1.5">
            Date prévue
          </label>
          <input
            id="achat-dateLimite"
            type="date"
            {...register('dateLimite')}
            className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821]"
          />
          {errors.dateLimite && (
            <p className="mt-1 text-xs text-[#A65D57]">{errors.dateLimite.message}</p>
          )}
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
              : "Créer l'achat"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
