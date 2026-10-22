import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PiggyBank, AlertCircle } from 'lucide-react'
import Modal from '../ui/Modal'
import { transactionSchema } from '../../utils/validators'
import { formatMontant } from '../../utils/formatters'
import { extractErrorMessage } from '../../services/api'

export default function RetraitSuggereModal({
  isOpen,
  onClose,
  retraitSuggere,
  onConfirmRetrait,
  objectifs = [],
}) {
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      montant: retraitSuggere?.montant || 0,
      motif: retraitSuggere?.motif || '',
      objectifId: '',
    },
  })

  const currentMontant = watch('montant')

  useEffect(() => {
    if (isOpen && retraitSuggere) {
      setServerError('')
      reset({
        montant: retraitSuggere.montant ?? 0,
        motif: retraitSuggere.motif ?? '',
        objectifId: '',
      })
    }
  }, [isOpen, retraitSuggere, reset])

  const onFormSubmit = async (values) => {
    setServerError('')
    try {
      await onConfirmRetrait({
        montant: values.montant,
        motif: values.motif,
        objectifId: values.objectifId,
        articleId: retraitSuggere?.articleId || null,
      })
    } catch (err) {
      setServerError(
        extractErrorMessage(
          err,
          'Le solde de ta tirelire est insuffisant pour effectuer ce retrait.'
        )
      )
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Retirer ${formatMontant(currentMontant ?? retraitSuggere?.montant ?? 0)} de ta tirelire ?`}
      subtitle="Ton article est bien marqué comme acheté. Souhaites-tu déduire cette dépense de ta tirelire ?"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4" noValidate>
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F1E6D6]/70 border border-[#E8D8C3]">
          <div className="w-10 h-10 rounded-full bg-[#6B4226] text-[#FFFDF9] flex items-center justify-center shrink-0">
            <PiggyBank className="w-5 h-5" />
          </div>
          <p className="text-xs text-[#332821] leading-relaxed">
            Tu peux ajuster le montant ou le motif avant de confirmer, ou choisir de ne pas toucher à ta tirelire.
          </p>
        </div>

        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#FDF4F3] border border-[#A65D57]/40 text-xs font-medium text-[#A65D57]"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <div>
          <label htmlFor="retrait-suggere-montant" className="block text-sm font-medium text-[#332821] mb-1.5">
            Montant à retirer (FCFA)
          </label>
          <input
            id="retrait-suggere-montant"
            type="number"
            min={1}
            {...register('montant')}
            className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821]"
          />
          {errors.montant && (
            <p className="mt-1 text-xs text-[#A65D57]">{errors.montant.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="retrait-suggere-motif" className="block text-sm font-medium text-[#332821] mb-1.5">
            Motif
          </label>
          <input
            id="retrait-suggere-motif"
            type="text"
            {...register('motif')}
            className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821]"
          />
          {errors.motif && (
            <p className="mt-1 text-xs text-[#A65D57]">{errors.motif.message}</p>
          )}
        </div>

        {objectifs.length > 0 && (
          <div>
            <label htmlFor="retrait-suggere-objectif" className="block text-sm font-medium text-[#332821] mb-1.5">
              Associer à un objectif d&apos;épargne (optionnel)
            </label>
            <select
              id="retrait-suggere-objectif"
              {...register('objectifId')}
              className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821]"
            >
              <option value="">Aucun objectif</option>
              {objectifs.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.nom} ({formatMontant(obj.montantEpargne)} épargnés)
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-full bg-[#E8D8C3]/80 hover:bg-[#E8D8C3] text-[#332821] font-medium text-sm transition-colors"
          >
            Non, garder sans retirer
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-full bg-[#6B4226] hover:bg-[#58351D] text-[#FFFDF9] font-medium text-sm transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'Retrait en cours...' : 'Confirmer le retrait'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
