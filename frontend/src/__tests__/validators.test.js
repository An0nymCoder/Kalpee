import { describe, it, expect } from 'vitest'
import {
  registerSchema,
  achatSchema,
  articleSchema,
  transactionSchema,
  objectifSchema,
} from '../utils/validators'

describe('Zod form validators', () => {
  it('valide le formulaire d’inscription et rejette un mot de passe < 8 caractères', () => {
    const valid = registerSchema.safeParse({
      prenom: 'Ouz',
      nom: 'Diarizo',
      email: 'ouz@example.com',
      motDePasse: 'motdepasse123',
    })
    expect(valid.success).toBe(true)

    const invalid = registerSchema.safeParse({
      prenom: '',
      nom: 'Diarizo',
      email: 'invalide',
      motDePasse: 'court',
    })
    expect(invalid.success).toBe(false)
  })

  it('valide la création d’un achat', () => {
    const res = achatSchema.safeParse({
      nom: 'Habits pour les vacances',
      description: 'Vêtements',
      priorite: 'URGENT',
      categorie: 'VETEMENTS',
      dateLimite: '2026-09-15',
    })
    expect(res.success).toBe(true)

    const emptyName = achatSchema.safeParse({
      nom: '   ',
      priorite: 'NORMAL',
      categorie: 'AUTRE',
    })
    expect(emptyName.success).toBe(false)
  })

  it('valide un article (quantité >= 1, prixUnitaire >= 0)', () => {
    const valid = articleSchema.safeParse({
      nom: 'Jean noir',
      quantite: '2',
      prixUnitaire: '15000',
      magasin: 'Zara',
    })
    expect(valid.success).toBe(true)
    expect(valid.data.quantite).toBe(2)
    expect(valid.data.prixUnitaire).toBe(15000)

    const invalidQty = articleSchema.safeParse({
      nom: 'Jean noir',
      quantite: 0,
      prixUnitaire: 15000,
    })
    expect(invalidQty.success).toBe(false)
  })

  it('valide une transaction de tirelire', () => {
    const valid = transactionSchema.safeParse({
      montant: '25000',
      motif: 'Épargne mensuelle',
      objectifId: '',
    })
    expect(valid.success).toBe(true)
    expect(valid.data.montant).toBe(25000)
    expect(valid.data.objectifId).toBeNull()

    const invalid = transactionSchema.safeParse({
      montant: 0,
      motif: '',
    })
    expect(invalid.success).toBe(false)
  })

  it('valide un objectif et vérifie que le montant déjà épargné ne dépasse pas la cible', () => {
    const valid = objectifSchema.safeParse({
      nom: 'Acheter mon ordinateur',
      montantCible: 300000,
      montantInitial: 150000,
      dateCible: '2026-11-30',
      categorie: 'ELECTRONIQUE',
    })
    expect(valid.success).toBe(true)

    const initialExceedsTarget = objectifSchema.safeParse({
      nom: 'Acheter mon ordinateur',
      montantCible: 100000,
      montantInitial: 150000,
      dateCible: '2026-11-30',
      categorie: 'ELECTRONIQUE',
    })
    expect(initialExceedsTarget.success).toBe(false)
  })
})
