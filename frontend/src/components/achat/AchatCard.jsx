import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import CategoryIcon from '../ui/CategoryIcon'
import {
  formatMontant,
  formatDateFr,
  getPrioriteConfig,
  getStatutAchatConfig,
  getCategorieLabel,
} from '../../utils/formatters'

export default function AchatCard({ achat }) {
  const priorite = getPrioriteConfig(achat.priorite)
  const statut = getStatutAchatConfig(achat.statut)
  const progression = Math.min(100, Math.max(0, Number(achat.progression || 0)))

  return (
    <Link
      to={`/achats/${achat.id}`}
      className="group block bg-[#FFFDF9] rounded-[24px] border border-[#E8D8C3]/90 p-5 shadow-card hover:shadow-soft hover:border-[#6B4226]/40 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-[#F1E6D6] text-[#332821] flex items-center justify-center shrink-0 group-hover:bg-[#E8D8C3] transition-colors">
          <CategoryIcon categorie={achat.categorie} className="w-5 h-5" />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 justify-end">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${priorite.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorite.dotClass}`} />
            {priorite.label}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statut.badgeClass}`}
          >
            {statut.label}
          </span>
        </div>
      </div>

      <h3 className="font-serif text-xl text-[#332821] group-hover:text-[#6B4226] transition-colors truncate">
        {achat.nom}
      </h3>
      <p className="text-xs text-[#806F62] mt-0.5 truncate">
        {achat.description || getCategorieLabel(achat.categorie)}
      </p>

      <div className="mt-4 pt-3 border-t border-[#F1E6D6] flex items-baseline justify-between">
        <div>
          <p className="font-serif text-xl text-[#332821]">
            {formatMontant(achat.total)}
          </p>
          <p className="text-xs text-[#806F62] mt-0.5">
            {achat.nombreArticles || 0} article{(achat.nombreArticles || 0) > 1 ? 's' : ''}
          </p>
        </div>

        {achat.dateLimite && (
          <div className="flex items-center gap-1 text-xs text-[#806F62]">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDateFr(achat.dateLimite)}</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-[#806F62] mb-1.5">
          <span>Déjà acheté : {formatMontant(achat.dejaAchete)}</span>
          <span className="font-semibold text-[#332821]">{progression}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#EFE6D8] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#6B4226] transition-all duration-300"
            style={{ width: `${progression}%` }}
          />
        </div>
      </div>
    </Link>
  )
}
