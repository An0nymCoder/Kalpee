import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "L'adresse e-mail est obligatoire")
    .email("L'adresse e-mail n'est pas valide"),
  motDePasse: z
    .string()
    .min(1, 'Le mot de passe est obligatoire'),
})

export const registerSchema = z.object({
  prenom: z
    .string()
    .trim()
    .min(1, 'Le prénom est obligatoire')
    .max(100, 'Le prénom est trop long'),
  nom: z
    .string()
    .trim()
    .min(1, 'Le nom est obligatoire')
    .max(100, 'Le nom est trop long'),
  email: z
    .string()
    .trim()
    .min(1, "L'adresse e-mail est obligatoire")
    .email("L'adresse e-mail n'est pas valide"),
  motDePasse: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

export const profilSchema = z.object({
  prenom: z
    .string()
    .trim()
    .min(1, 'Le prénom est obligatoire')
    .max(100, 'Le prénom est trop long'),
  nom: z
    .string()
    .trim()
    .min(1, 'Le nom est obligatoire')
    .max(100, 'Le nom est trop long'),
  email: z
    .string()
    .trim()
    .min(1, "L'adresse e-mail est obligatoire")
    .email("L'adresse e-mail n'est pas valide"),
})

export const createPasswordSchema = (aMotDePasse) =>
  z.object({
    motDePasseActuel: aMotDePasse
      ? z.string().min(1, 'Le mot de passe actuel est obligatoire')
      : z.string().optional(),
    nouveauMotDePasse: z
      .string()
      .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
  })

export const achatSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(1, "Le nom de l'achat est obligatoire")
    .max(150, 'Le nom est trop long'),
  description: z
    .string()
    .max(1000, 'La description est trop longue')
    .optional()
    .or(z.literal('')),
  priorite: z.enum(['URGENT', 'IMPORTANT', 'NORMAL', 'FAIBLE'], {
    errorMap: () => ({ message: 'La priorité est invalide' }),
  }),
  categorie: z.enum(['VETEMENTS', 'ELECTRONIQUE', 'ACCESSOIRES', 'EQUIPEMENT', 'AUTRE'], {
    errorMap: () => ({ message: 'La catégorie est invalide' }),
  }),
  dateLimite: z
    .string()
    .optional()
    .or(z.literal('')),
})

export const articleSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(1, "Le nom de l'article est obligatoire")
    .max(150, 'Le nom est trop long'),
  description: z
    .string()
    .max(1000, 'La description est trop longue')
    .optional()
    .or(z.literal('')),
  quantite: z.coerce
    .number({ invalid_type_error: 'La quantité doit être un nombre' })
    .int('La quantité doit être un entier')
    .min(1, 'La quantité doit être au moins 1'),
  prixUnitaire: z.coerce
    .number({ invalid_type_error: 'Le prix unitaire doit être un nombre' })
    .int('Le prix unitaire doit être un entier')
    .min(0, 'Le prix unitaire ne peut pas être négatif'),
  magasin: z
    .string()
    .max(150, 'Le nom du magasin est trop long')
    .optional()
    .or(z.literal('')),
  statut: z
    .enum(['A_ACHETER', 'MIS_DE_COTE', 'ACHETE'])
    .optional()
    .default('A_ACHETER'),
})

export const transactionSchema = z.object({
  montant: z.coerce
    .number({ invalid_type_error: 'Le montant doit être un nombre' })
    .int('Le montant doit être un entier en FCFA')
    .min(1, 'Le montant doit être supérieur à 0 FCFA'),
  motif: z
    .string()
    .trim()
    .min(1, 'Le motif est obligatoire')
    .max(255, 'Le motif est trop long'),
  objectifId: z
    .union([z.coerce.number().int().positive(), z.literal(''), z.null()])
    .optional()
    .transform((val) => (val === '' || val === undefined || val === null ? null : Number(val))),
})

export const objectifSchema = z
  .object({
    nom: z
      .string()
      .trim()
      .min(1, "Le nom de l'objectif est obligatoire")
      .max(150, 'Le nom est trop long'),
    description: z
      .string()
      .max(1000, 'La description est trop longue')
      .optional()
      .or(z.literal('')),
    montantCible: z.coerce
      .number({ invalid_type_error: 'Le montant cible doit être un nombre' })
      .int('Le montant cible doit être un entier')
      .min(1, 'Le montant cible doit être supérieur à 0 FCFA'),
    montantInitial: z.coerce
      .number({ invalid_type_error: 'Le montant déjà épargné doit être un nombre' })
      .int('Le montant doit être un entier')
      .min(0, 'Le montant initial ne peut pas être négatif')
      .default(0),
    dateCible: z
      .string()
      .min(1, 'La date cible est obligatoire'),
    categorie: z.enum(['VETEMENTS', 'ELECTRONIQUE', 'ACCESSOIRES', 'EQUIPEMENT', 'AUTRE'], {
      errorMap: () => ({ message: 'La catégorie est invalide' }),
    }),
  })
  .refine((data) => data.montantInitial <= data.montantCible, {
    message: 'Le montant déjà épargné ne peut pas dépasser le montant cible',
    path: ['montantInitial'],
  })
