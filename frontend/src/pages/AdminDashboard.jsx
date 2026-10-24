import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Package,
  PiggyBank,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
} from 'lucide-react'
import { getAdminDashboard } from '../services/adminService'
import { extractErrorMessage } from '../services/api'
import { formatMontant } from '../utils/formatters'
import { useToast } from '../context/ToastContext'

function DonutChartArticles({ achetes = 0, aAcheter = 0, misDeCote = 0 }) {
  const total = achetes + aAcheter + misDeCote
  const radius = 58
  const circumference = 2 * Math.PI * radius

  const segments = [
    { label: 'Achetés', value: achetes, color: '#718355' },
    { label: 'À acheter', value: aAcheter, color: '#6B4226' },
    { label: 'Mis de côté', value: misDeCote, color: '#C58B45' },
  ]

  let accumulatedPercent = 0

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
        <svg className="w-40 h-40 -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="transparent"
            stroke="#F1E6D6"
            strokeWidth="16"
          />
          {total > 0 &&
            segments.map((seg) => {
              if (seg.value <= 0) return null
              const pct = seg.value / total
              const strokeDasharray = `${pct * circumference} ${circumference}`
              const strokeDashoffset = -accumulatedPercent * circumference
              accumulatedPercent += pct
              return (
                <circle
                  key={seg.label}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="16"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="butt"
                />
              )
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-serif text-2xl text-[#332821]">{total}</span>
          <span className="text-[11px] text-[#806F62]">articles</span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-3">
        {segments.map((seg) => {
          const pct = total > 0 ? Math.round((seg.value * 100) / total) : 0
          return (
            <div key={seg.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="font-medium text-[#332821]">{seg.label}</span>
                </div>
                <span className="text-[#806F62] font-semibold">
                  {seg.value} ({pct}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#F1E6D6] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: seg.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BarChartFinances({ depose = 0, retire = 0, solde = 0, budgetAchats = 0 }) {
  const maxVal = Math.max(depose, retire, solde, budgetAchats, 1)

  const bars = [
    {
      label: 'Argent ajouté (Dépôts)',
      value: depose,
      color: '#718355',
      bg: '#718355',
    },
    {
      label: 'Solde en tirelire',
      value: solde,
      color: '#6B4226',
      bg: '#6B4226',
    },
    {
      label: 'Argent retiré',
      value: retire,
      color: '#A65D57',
      bg: '#A65D57',
    },
    {
      label: 'Coût total des articles',
      value: budgetAchats,
      color: '#C58B45',
      bg: '#C58B45',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Diagramme vertical en colonnes */}
      <div className="h-44 flex items-end justify-around gap-3 pt-6 px-2 border-b border-[#E8D8C3]">
        {bars.map((bar) => {
          const heightPct = Math.max(6, Math.round((bar.value / maxVal) * 100))
          return (
            <div key={bar.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-[10px] font-semibold text-[#332821] text-center leading-tight">
                {formatMontant(bar.value)}
              </span>
              <div
                className="w-full max-w-[54px] rounded-t-2xl transition-all duration-500 shadow-sm"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: bar.bg,
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Légende sous les barres */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {bars.map((bar) => (
          <div key={bar.label} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: bar.bg }}
            />
            <span className="text-[#806F62] truncate" title={bar.label}>
              {bar.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const toast = useToast()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const data = await getAdminDashboard()
      setStats(data)
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Impossible de charger les statistiques.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const classiquesCount = stats
    ? Math.max(0, stats.totalUtilisateurs - stats.utilisateursGoogle)
    : 0
  const googlePct =
    stats && stats.totalUtilisateurs > 0
      ? Math.round((stats.utilisateursGoogle * 100) / stats.totalUtilisateurs)
      : 0

  return (
    <div className="space-y-8 pb-10">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6B4226]/10 text-[#6B4226] text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administration Kalpee</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#332821]">Dashboard</h1>
          <p className="text-sm text-[#806F62] mt-1">
            Vue d'ensemble des utilisateurs, des articles et de l'argent ajouté dans les tirelires.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FFFDF9] hover:bg-[#F1E6D6] border border-[#E8D8C3] text-sm font-medium text-[#332821] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>

          <Link
            to="/admin/utilisateurs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6B4226] hover:bg-[#58351D] text-sm font-medium text-[#FFFDF9] transition-colors shadow-sm"
          >
            <Users className="w-4 h-4" />
            <span>Gérer les utilisateurs</span>
          </Link>
        </div>
      </div>

      {/* Cartes de statistiques principales */}
      {loading && !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-36 rounded-[24px] bg-[#FFFDF9] border border-[#E8D8C3] animate-pulse p-5"
            />
          ))}
        </div>
      ) : (
        stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Nombre d'utilisateurs */}
              <div className="bg-[#FFFDF9] rounded-[24px] border border-[#E8D8C3] p-5 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#806F62]">
                    Utilisateurs
                  </span>
                  <div className="w-9 h-9 rounded-full bg-[#F1E6D6] text-[#6B4226] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <p className="font-serif text-3xl text-[#332821]">{stats.totalUtilisateurs}</p>
                <p className="mt-3 text-xs text-[#806F62]">
                  {stats.utilisateursGoogle} via Google • {stats.totalAdmins} admin(s)
                </p>
              </div>

              {/* 2. Nombre d'articles */}
              <div className="bg-[#FFFDF9] rounded-[24px] border border-[#E8D8C3] p-5 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#806F62]">
                    Nombre d'articles
                  </span>
                  <div className="w-9 h-9 rounded-full bg-[#F1E6D6] text-[#6B4226] flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <p className="font-serif text-3xl text-[#332821]">{stats.totalArticles}</p>
                <p className="mt-3 text-xs text-[#806F62]">
                  Répartis dans {stats.totalAchats} achat(s) • {stats.articlesAchetes} acheté(s)
                </p>
              </div>

              {/* 3. Argent ajouté (Tirelire) */}
              <div className="bg-gradient-to-br from-[#6B4226] to-[#3E2723] text-[#FFFDF9] rounded-[24px] p-5 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#F1E6D6]/85">
                    Argent ajouté (Dépôts)
                  </span>
                  <div className="w-9 h-9 rounded-full bg-white/15 text-[#FFFDF9] flex items-center justify-center">
                    <PiggyBank className="w-4 h-4" />
                  </div>
                </div>
                <p className="font-serif text-2xl sm:text-3xl">
                  {formatMontant(stats.totalGlobalDepose)}
                </p>
                <p className="mt-3 text-xs text-[#F1E6D6]/85">
                  Solde actuel : {formatMontant(stats.soldeGlobalTirelires)}
                </p>
              </div>

              {/* 4. Montant total des articles */}
              <div className="bg-[#FFFDF9] rounded-[24px] border border-[#E8D8C3] p-5 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#806F62]">
                    Valeur des articles
                  </span>
                  <div className="w-9 h-9 rounded-full bg-[#F1E6D6] text-[#6B4226] flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <p className="font-serif text-2xl sm:text-3xl text-[#332821]">
                  {formatMontant(stats.montantTotalAchats)}
                </p>
                <p className="mt-3 text-xs text-[#806F62]">
                  Articles achetés : {formatMontant(stats.montantTotalArticlesAchetes)}
                </p>
              </div>
            </div>

            {/* Section Diagrammes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Diagramme 1 : Répartition des articles */}
              <div className="bg-[#FFFDF9] rounded-[28px] border border-[#E8D8C3] p-6 shadow-soft">
                <div className="mb-5">
                  <h2 className="font-serif text-xl text-[#332821]">
                    Diagramme des articles par statut
                  </h2>
                  <p className="text-xs text-[#806F62]">
                    Proportion des articles achetés, à acheter et mis de côté.
                  </p>
                </div>

                <DonutChartArticles
                  achetes={stats.articlesAchetes}
                  aAcheter={stats.articlesAAcheter}
                  misDeCote={stats.articlesMisDeCote}
                />
              </div>

              {/* Diagramme 2 : Argent ajouté vs Retiré vs Solde */}
              <div className="bg-[#FFFDF9] rounded-[28px] border border-[#E8D8C3] p-6 shadow-soft">
                <div className="mb-4">
                  <h2 className="font-serif text-xl text-[#332821]">
                    Diagramme des flux financiers (FCFA)
                  </h2>
                  <p className="text-xs text-[#806F62]">
                    Comparaison entre l'argent ajouté en tirelire, les retraits et le coût des articles.
                  </p>
                </div>

                <BarChartFinances
                  depose={stats.totalGlobalDepose}
                  retire={stats.totalGlobalRetire}
                  solde={stats.soldeGlobalTirelires}
                  budgetAchats={stats.montantTotalAchats}
                />
              </div>
            </div>

            {/* Diagramme 3 : Répartition des utilisateurs et aperçu */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-[#FFFDF9] rounded-[28px] border border-[#E8D8C3] p-6 shadow-soft space-y-4">
                <div>
                  <h2 className="font-serif text-xl text-[#332821]">Modes d'inscription</h2>
                  <p className="text-xs text-[#806F62]">
                    Répartition entre connexion Google et e-mail/mot de passe.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-[#332821]">Comptes Google</span>
                      <span className="font-semibold text-[#6B4226]">
                        {stats.utilisateursGoogle} ({googlePct}%)
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-[#F1E6D6] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#6B4226]"
                        style={{ width: `${googlePct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-[#332821]">Comptes E-mail classiques</span>
                      <span className="font-semibold text-[#8B6245]">
                        {classiquesCount} ({100 - googlePct}%)
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-[#F1E6D6] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#8B6245]"
                        style={{ width: `${100 - googlePct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Top utilisateurs par tirelire / articles */}
              <div className="lg:col-span-2 bg-[#FFFDF9] rounded-[28px] border border-[#E8D8C3] p-6 shadow-soft flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-serif text-xl text-[#332821]">Derniers utilisateurs</h2>
                    <p className="text-xs text-[#806F62]">
                      Aperçu rapide des membres et de leur tirelire.
                    </p>
                  </div>
                  <Link
                    to="/admin/utilisateurs"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B4226] hover:underline"
                  >
                    <span>Voir tous ({stats.totalUtilisateurs})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {(stats.utilisateurs || []).slice(0, 4).map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#F7F1E8]/80 border border-[#E8D8C3]/80 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[#332821] truncate">
                          {u.prenom} {u.nom}{' '}
                          <span className="text-[11px] font-normal text-[#806F62]">
                            ({u.email})
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-[#806F62]">{u.nombreArticles} art.</span>
                        <span className="font-semibold text-[#6B4226]">
                          {formatMontant(u.soldeTirelire)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )
      )}
    </div>
  )
}
