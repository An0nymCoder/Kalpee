/**
 * Formate un montant entier en FCFA avec espaces pour les milliers.
 * Exemple : 150000 -> "150 000 FCFA"
 */
export function formatMontant(montant, includeCurrency = true) {
  const num = Number(montant ?? 0)
  if (Number.isNaN(num)) {
    return includeCurrency ? '0 FCFA' : '0'
  }
  const rounded = Math.round(num)
  const isNegative = rounded < 0
  const absStr = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  const formatted = isNegative ? `-${absStr}` : absStr
  return includeCurrency ? `${formatted} FCFA` : formatted
}

/**
 * Formate une date ISO (YYYY-MM-DD ou ISO timestamp) en français : "15 septembre 2026"
 */
export function formatDateFr(dateStr) {
  if (!dateStr) return 'Non définie'
  try {
    // Support YYYY-MM-DD without timezone shift
    const cleanStr = typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
      ? `${dateStr}T12:00:00`
      : dateStr
    const date = new Date(cleanStr)
    if (Number.isNaN(date.getTime())) return String(dateStr)
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  } catch {
    return String(dateStr)
  }
}

/**
 * Groupe une date de transaction en "Aujourd'hui", "Hier", ou "15 septembre 2026"
 */
export function formatGroupDateFr(dateStr, referenceDate = new Date()) {
  if (!dateStr) return 'Date inconnue'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return String(dateStr)

  const today = new Date(referenceDate)
  today.setHours(0, 0, 0, 0)

  const target = new Date(date)
  target.setHours(0, 0, 0, 0)

  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: target.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  }).format(date)
}

/**
 * Regroupe une liste de transactions par étiquette de jour ("Aujourd'hui", "Hier", etc.)
 */
export function groupTransactionsByDate(transactions = [], referenceDate = new Date()) {
  const groups = []
  const map = new Map()

  for (const tx of transactions) {
    const label = formatGroupDateFr(tx.date, referenceDate)
    if (!map.has(label)) {
      const group = { label, items: [] }
      map.set(label, group)
      groups.push(group)
    }
    map.get(label).items.push(tx)
  }

  return groups
}

export const PRIORITES = [
  { value: 'URGENT', label: 'Urgent', badgeClass: 'bg-[#F6E6E4] text-[#A65D57]', dotClass: 'bg-[#A65D57]' },
  { value: 'IMPORTANT', label: 'Important', badgeClass: 'bg-[#F8EFE2] text-[#C58B45]', dotClass: 'bg-[#C58B45]' },
  { value: 'NORMAL', label: 'Normal', badgeClass: 'bg-[#EFE6D8] text-[#6B4226]', dotClass: 'bg-[#6B4226]' },
  { value: 'FAIBLE', label: 'Faible', badgeClass: 'bg-[#F3ECE1] text-[#806F62]', dotClass: 'bg-[#806F62]' },
]

export const CATEGORIES = [
  { value: 'VETEMENTS', label: 'Vêtements' },
  { value: 'ELECTRONIQUE', label: 'Électronique' },
  { value: 'ACCESSOIRES', label: 'Accessoires' },
  { value: 'EQUIPEMENT', label: 'Équipement' },
  { value: 'AUTRE', label: 'Autre' },
]

export const STATUTS_ACHAT = {
  A_PLANIFIER: { label: 'À planifier', badgeClass: 'bg-[#F1E6D6] text-[#806F62]' },
  EN_COURS: { label: 'En cours', badgeClass: 'bg-[#F8EFE2] text-[#C58B45]' },
  TERMINE: { label: 'Terminé', badgeClass: 'bg-[#E7ECE1] text-[#718355]' },
}

export const STATUTS_ARTICLE = [
  { value: 'A_ACHETER', label: 'À acheter', badgeClass: 'bg-[#F1E6D6] text-[#806F62]' },
  { value: 'MIS_DE_COTE', label: 'Mis de côté', badgeClass: 'bg-[#F8EFE2] text-[#C58B45]' },
  { value: 'ACHETE', label: 'Acheté', badgeClass: 'bg-[#E7ECE1] text-[#718355]' },
]

export function getPrioriteConfig(value) {
  return PRIORITES.find((p) => p.value === value) || PRIORITES[2]
}

export function getCategorieLabel(value) {
  return CATEGORIES.find((c) => c.value === value)?.label || 'Autre'
}

export function getStatutAchatConfig(value) {
  return STATUTS_ACHAT[value] || STATUTS_ACHAT.A_PLANIFIER
}

export function getStatutArticleConfig(value) {
  return STATUTS_ARTICLE.find((s) => s.value === value) || STATUTS_ARTICLE[0]
}
