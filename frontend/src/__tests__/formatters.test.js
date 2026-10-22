import { describe, it, expect } from 'vitest'
import {
  formatMontant,
  formatDateFr,
  formatGroupDateFr,
  groupTransactionsByDate,
  getPrioriteConfig,
  getCategorieLabel,
  getStatutAchatConfig,
} from '../utils/formatters'

describe('formatters utilities', () => {
  it('formate les montants entiers en FCFA avec un espace pour les milliers', () => {
    expect(formatMontant(0)).toBe('0 FCFA')
    expect(formatMontant(5000)).toBe('5 000 FCFA')
    expect(formatMontant(150000)).toBe('150 000 FCFA')
    expect(formatMontant(1250000)).toBe('1 250 000 FCFA')
    expect(formatMontant(30000, false)).toBe('30 000')
  })

  it('gère les valeurs nulles ou invalides proprement', () => {
    expect(formatMontant(null)).toBe('0 FCFA')
    expect(formatMontant(undefined)).toBe('0 FCFA')
    expect(formatMontant('abc')).toBe('0 FCFA')
  })

  it('formate les dates au format français', () => {
    const formatted = formatDateFr('2026-09-15')
    expect(formatted.toLowerCase()).toContain('15')
    expect(formatted.toLowerCase()).toContain('septembre')
    expect(formatted.toLowerCase()).toContain('2026')
    expect(formatDateFr(null)).toBe('Non définie')
  })

  it("regroupe les transactions par Aujourd'hui, Hier et date", () => {
    const refDate = new Date('2026-10-22T15:00:00Z')
    expect(formatGroupDateFr('2026-10-22T10:00:00Z', refDate)).toBe("Aujourd'hui")
    expect(formatGroupDateFr('2026-10-21T10:00:00Z', refDate)).toBe('Hier')

    const groups = groupTransactionsByDate(
      [
        { id: 1, date: '2026-10-22T12:00:00Z', montant: 5000 },
        { id: 2, date: '2026-10-22T09:00:00Z', montant: 10000 },
        { id: 3, date: '2026-10-21T18:00:00Z', montant: 2000 },
      ],
      refDate
    )
    expect(groups).toHaveLength(2)
    expect(groups[0].label).toBe("Aujourd'hui")
    expect(groups[0].items).toHaveLength(2)
    expect(groups[1].label).toBe('Hier')
    expect(groups[1].items).toHaveLength(1)
  })

  it('retourne les configurations de priorité, catégorie et statut', () => {
    expect(getPrioriteConfig('URGENT').label).toBe('Urgent')
    expect(getCategorieLabel('ELECTRONIQUE')).toBe('Électronique')
    expect(getStatutAchatConfig('EN_COURS').label).toBe('En cours')
  })
})
