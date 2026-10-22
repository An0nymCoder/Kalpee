import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import Modal from '../ui/Modal'
import { transactionSchema } from '../../utils/validators'
import { formatMontant } from '../../utils/formatters'
import { extractErrorMessage, extractFieldErrors } from '../../services/api'

export default function TransactionModal({
  isOpen,
  onClose,
  type = 'DEPOT', // 'DEPOT' | 'RETRAIT'
  onSubmitTransaction,
  objectifs = [],
}) {
  const isDepot = type === 'DEPOT'
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      montant: '',
      motif: '',
      objectifId: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      setServerError('')
      reset({
        montant: '',
        motif: '',
        objectifId: '',
      })
    }
  }, [isOpen, reset, type])

  const onFormSubmit = async (values) => {
    setServerError('')
    try {
      await onSubmitTransaction(values)
    } catch (err) {
      const fieldErrors = extractFieldErrors(err)
      Object.entries(fieldErrors).forEach(([field, msg]) => {
        setError(field, { type: 'server', message: msg })
      })
      setServerError(
        extractErrorMessage(
          err,
          isDepot
            ? 'Impossible d’enregistrer ce dépôt.'
            : 'Impossible d’effectuer ce retrait.'
        )
      )
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isDepot ? 'Déposer dans ma tirelire' : 'Retirer de ma tirelire'}
      subtitle={
        isDepot
          ? 'Ajoute de l’argent mis de côté et associe-le éventuellement à un objectif.'
          : 'Retire une somme de ta tirelire disponible.'
      }
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4" noValidate>
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
          <label htmlFor="tx-montant" className="block text-sm font-medium text-[#332821] mb-1.5">
            Montant
          </label>
          <input
            id="tx-montant"
            type="number"
            min={1}
            placeholder="25 000"
            {...register('montant')}
            className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821] placeholder:text-[#806F62]/70"
          />
          <span className="block text-[11px] text-[#806F62] mt-1">En FCFA</span>
          {errors.montant && (
            <p className="mt-0.5 text-xs text-[#A65D57]">{errors.montant.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="tx-motif" className="block text-sm font-medium text-[#332821] mb-1.5">
            Motif
          </label>
          <input
            id="tx-motif"
            type="text"
            placeholder={isDepot ? 'Ex : Salaire, Épargne mensuelle...' : 'Ex : Achat imprévu, Dépense...'}
            {...register('motif')}
            className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821] placeholder:text-[#806F62]/70"
          />
          {errors.motif && (
            <p className="mt-1 text-xs text-[#A65D57]">{errors.motif.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="tx-objectifId" className="block text-sm font-medium text-[#332821] mb-1.5">
            Objectif d&apos;épargne associé (optionnel)
          </label>
          <select
            id="tx-objectifId"
            {...register('objectifId')}
            className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821]"
          >
            <option value="">Sans objectif spécifique</option>
            {objectifs.map((obj) => (
              <option key={obj.id} value={obj.id}>
                {obj.nom} ({formatMontant(obj.montantEpargne)} / {formatMontant(obj.montantCible)})
              </option>
            ))}
          </select>
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
              ? 'Validation...'
              : isDepot
              ? 'Confirmer le dépôt'
              : 'Confirmer le retrait'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
