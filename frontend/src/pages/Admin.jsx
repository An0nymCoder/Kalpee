import React, { useEffect, useMemo, useState } from 'react'
import {
  ShieldCheck,
  Users,
  Activity,
  UserPlus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import {
  getAdminDashboard,
  updateUser,
  deleteUser,
} from '../services/adminService'
import { extractErrorMessage } from '../services/api'
import { formatDateFr } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const MOIS_COURT = [
  'Janv.',
  'Févr.',
  'Mars',
  'Avr.',
  'Mai',
  'Juin',
  'Juil.',
  'Août',
  'Sept.',
  'Oct.',
  'Nov.',
  'Déc.',
]

function isUserActive(u) {
  return (
    (u.nombreAchats || 0) > 0 ||
    (u.nombreArticles || 0) > 0 ||
    (u.soldeTirelire || 0) > 0 ||
    (u.nombreObjectifs || 0) > 0
  )
}

function getUserActivityScore(u) {
  return (
    (u.nombreAchats || 0) +
    (u.nombreArticles || 0) +
    (u.nombreObjectifs || 0) +
    ((u.soldeTirelire || 0) > 0 ? 1 : 0)
  )
}

function MonthlyUsersActivityChart({ users = [] }) {
  const monthsData = useMemo(() => {
    const now = new Date()
    const buckets = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        year: d.getFullYear(),
        month: d.getMonth(),
        label: `${MOIS_COURT[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`,
        inscrits: 0,
        actifs: 0,
      })
    }

    users.forEach((u) => {
      if (!u.dateCreation) return
      const d = new Date(u.dateCreation)
      if (Number.isNaN(d.getTime())) return
      const bucket = buckets.find(
        (b) => b.year === d.getFullYear() && b.month === d.getMonth()
      )
      if (bucket) {
        bucket.inscrits += 1
        if (isUserActive(u)) {
          bucket.actifs += 1
        }
      }
    })

    return buckets
  }, [users])

  const maxVal = Math.max(
    ...monthsData.map((m) => Math.max(m.inscrits, m.actifs)),
    1
  )

  return (
    <div className="space-y-4">
      <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2 border-b border-[#E8D8C3]">
        {monthsData.map((m) => {
          const inscritsHeight =
            m.inscrits > 0 ? Math.max(12, Math.round((m.inscrits / maxVal) * 100)) : 4
          const actifsHeight =
            m.actifs > 0 ? Math.max(12, Math.round((m.actifs / maxVal) * 100)) : 4

          return (
            <div
              key={m.key}
              className="flex-1 flex flex-col items-center justify-end h-full gap-2"
            >
              <div className="flex items-end justify-center gap-1.5 w-full h-full">
                {/* Barre Inscrits */}
                <div className="flex flex-col items-center justify-end h-full flex-1 max-w-[26px]">
                  <span className="text-[10px] font-semibold text-[#6B4226] mb-1">
                    {m.inscrits}
                  </span>
                  <div
                    className="w-full rounded-t-xl bg-[#6B4226] transition-all duration-500"
                    style={{ height: `${inscritsHeight}%` }}
                    title={`${m.inscrits} inscrit(s) en ${m.label}`}
                  />
                </div>

                {/* Barre Actifs */}
                <div className="flex flex-col items-center justify-end h-full flex-1 max-w-[26px]">
                  <span className="text-[10px] font-semibold text-[#718355] mb-1">
                    {m.actifs}
                  </span>
                  <div
                    className="w-full rounded-t-xl bg-[#718355] transition-all duration-500"
                    style={{ height: `${actifsHeight}%` }}
                    title={`${m.actifs} utilisateur(s) actif(s) en ${m.label}`}
                  />
                </div>
              </div>

              <span className="text-[11px] font-medium text-[#806F62]">{m.label}</span>
            </div>
          )
        })}
      </div>

      {/* Légende */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs pt-1">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#6B4226]" />
          <span className="text-[#332821] font-medium">Utilisateurs inscrits par mois</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#718355]" />
          <span className="text-[#332821] font-medium">Utilisateurs actifs par mois</span>
        </div>
      </div>
    </div>
  )
}

function ActivityDonutChart({ actifs = 0, inactifs = 0, google = 0, total = 0 }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const actifsPct = total > 0 ? Math.round((actifs * 100) / total) : 0
  const googlePct = total > 0 ? Math.round((google * 100) / total) : 0
  const strokeDasharray = `${(actifsPct / 100) * circumference} ${circumference}`

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 130 130">
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="transparent"
            stroke="#E8D8C3"
            strokeWidth="14"
          />
          {total > 0 && actifs > 0 && (
            <circle
              cx="65"
              cy="65"
              r={radius}
              fill="transparent"
              stroke="#718355"
              strokeWidth="14"
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-serif text-2xl text-[#332821]">{actifsPct}%</span>
          <span className="text-[11px] text-[#806F62]">actifs</span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-3.5">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-[#332821]">Utilisateurs actifs</span>
            <span className="font-semibold text-[#718355]">
              {actifs} / {total} ({actifsPct}%)
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-[#F1E6D6] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#718355] transition-all duration-500"
              style={{ width: `${actifsPct}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-[#332821]">Utilisateurs sans activité</span>
            <span className="font-semibold text-[#806F62]">
              {inactifs} / {total} ({total > 0 ? 100 - actifsPct : 0}%)
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-[#F1E6D6] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#C58B45] transition-all duration-500"
              style={{ width: `${total > 0 ? 100 - actifsPct : 0}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-[#332821]">Connectés via Google</span>
            <span className="font-semibold text-[#6B4226]">
              {google} / {total} ({googlePct}%)
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-[#F1E6D6] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#6B4226] transition-all duration-500"
              style={{ width: `${googlePct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  const { user: currentUser } = useAuth()
  const toast = useToast()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')

  // État pour la modale de modification
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    role: 'USER',
    nouveauMotDePasse: '',
  })
  const [savingEdit, setSavingEdit] = useState(false)

  // État pour la modale de suppression
  const [userToDelete, setUserToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getAdminDashboard()
      setUsers(data?.utilisateurs || [])
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Impossible de charger les utilisateurs.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const statsSummary = useMemo(() => {
    const total = users.length
    const actifs = users.filter(isUserActive).length
    const inactifs = Math.max(0, total - actifs)
    const google = users.filter((u) => u.connexionGoogle).length

    const now = new Date()
    const inscritsCeMois = users.filter((u) => {
      if (!u.dateCreation) return false
      const d = new Date(u.dateCreation)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length

    return { total, actifs, inactifs, google, inscritsCeMois }
  }, [users])

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      if (filter === 'ACTIFS' && !isUserActive(u)) return false
      if (filter === 'INACTIFS' && isUserActive(u)) return false
      if (filter === 'ADMIN' && u.role !== 'ADMIN') return false
      if (!q) return true
      const fullName = `${u.prenom || ''} ${u.nom || ''}`.toLowerCase()
      return fullName.includes(q) || (u.email || '').toLowerCase().includes(q)
    })
  }, [users, search, filter])

  const openEditModal = (u) => {
    setEditingUser(u)
    setEditForm({
      prenom: u.prenom || '',
      nom: u.nom || '',
      email: u.email || '',
      role: u.role || 'USER',
      nouveauMotDePasse: '',
    })
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editingUser) return
    setSavingEdit(true)
    try {
      const payload = {
        prenom: editForm.prenom.trim(),
        nom: editForm.nom.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
        nouveauMotDePasse: editForm.nouveauMotDePasse.trim() || null,
      }
      const updated = await updateUser(editingUser.id, payload)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      toast.success(`Utilisateur ${updated.prenom} ${updated.nom} modifié avec succès.`)
      setEditingUser(null)
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Erreur lors de la modification de cet utilisateur.'))
    } finally {
      setSavingEdit(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return
    setDeleting(true)
    try {
      await deleteUser(userToDelete.id)
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id))
      toast.success(`Le compte de ${userToDelete.prenom} ${userToDelete.nom} a été supprimé.`)
      setUserToDelete(null)
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Impossible de supprimer cet utilisateur.'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-8 pb-10">
      {/* En-tête Administration */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6B4226]/10 text-[#6B4226] text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administration</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#332821]">
            Gestion des utilisateurs
          </h1>
          <p className="text-sm text-[#806F62] mt-1">
            Évolution mensuelle des inscriptions, activité des comptes et administration des utilisateurs.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFFDF9] hover:bg-[#F1E6D6] border border-[#E8D8C3] text-sm font-medium text-[#332821] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Résumé rapide Utilisateurs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFDF9] rounded-[24px] border border-[#E8D8C3] p-5 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#806F62]">
              Total utilisateurs
            </p>
            <p className="font-serif text-3xl text-[#332821] mt-1">
              {statsSummary.total}
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#F1E6D6] text-[#6B4226] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FFFDF9] rounded-[24px] border border-[#E8D8C3] p-5 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#806F62]">
              Utilisateurs actifs
            </p>
            <p className="font-serif text-3xl text-[#718355] mt-1">
              {statsSummary.actifs}
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#718355]/15 text-[#718355] flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FFFDF9] rounded-[24px] border border-[#E8D8C3] p-5 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#806F62]">
              Inscrits ce mois-ci
            </p>
            <p className="font-serif text-3xl text-[#6B4226] mt-1">
              +{statsSummary.inscritsCeMois}
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#F1E6D6] text-[#6B4226] flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Diagrammes : Nombre d'utilisateurs par mois & Activité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#FFFDF9] rounded-[28px] border border-[#E8D8C3] p-6 shadow-soft">
          <div className="mb-4">
            <h2 className="font-serif text-xl text-[#332821]">
              Utilisateurs par mois et activité
            </h2>
            <p className="text-xs text-[#806F62]">
              Nombre d'inscriptions mensuelles et nombre d'utilisateurs actifs sur les 6 derniers mois.
            </p>
          </div>
          <MonthlyUsersActivityChart users={users} />
        </div>

        <div className="bg-[#FFFDF9] rounded-[28px] border border-[#E8D8C3] p-6 shadow-soft flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="font-serif text-xl text-[#332821]">
              Taux d'activité des utilisateurs
            </h2>
            <p className="text-xs text-[#806F62]">
              Proportion des comptes actifs sur l'application et mode de connexion.
            </p>
          </div>
          <ActivityDonutChart
            actifs={statsSummary.actifs}
            inactifs={statsSummary.inactifs}
            google={statsSummary.google}
            total={statsSummary.total}
          />
        </div>
      </div>

      {/* Liste, recherche, modification et suppression des utilisateurs */}
      <div className="bg-[#FFFDF9] rounded-[28px] border border-[#E8D8C3] p-5 sm:p-7 shadow-soft space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#806F62] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un utilisateur par nom, prénom ou e-mail..."
              className="w-full pl-11 pr-4 py-3 rounded-full bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'ALL', label: 'Tous' },
              { key: 'ACTIFS', label: 'Actifs' },
              { key: 'INACTIFS', label: 'Inactifs' },
              { key: 'ADMIN', label: 'Admins' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`px-3.5 py-2 rounded-full text-xs font-medium transition-colors ${
                  filter === item.key
                    ? 'bg-[#6B4226] text-[#FFFDF9]'
                    : 'bg-[#F7F1E8] text-[#332821] hover:bg-[#E8D8C3]/70'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {loading && users.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 rounded-2xl bg-[#F7F1E8] animate-pulse" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-sm text-[#806F62]">
            Aucun utilisateur trouvé.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((u) => {
              const isSelf = currentUser?.id === u.id
              const active = isUserActive(u)
              const score = getUserActivityScore(u)
              const initials =
                `${u.prenom?.[0] || ''}${u.nom?.[0] || ''}`.toUpperCase() || 'U'

              return (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl bg-[#F7F1E8]/70 border border-[#E8D8C3] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  {/* Infos utilisateur */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#6B4226] text-[#FFFDF9] font-semibold text-sm flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-sm text-[#332821] truncate">
                          {u.prenom} {u.nom}
                        </p>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            u.role === 'ADMIN'
                              ? 'bg-[#6B4226] text-[#FFFDF9]'
                              : 'bg-[#E8D8C3] text-[#332821]'
                          }`}
                        >
                          {u.role}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            active
                              ? 'bg-[#718355]/15 text-[#718355]'
                              : 'bg-[#E8D8C3]/60 text-[#806F62]'
                          }`}
                        >
                          {active ? `Actif (${score} actions)` : 'Inactif'}
                        </span>
                        {u.connexionGoogle && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#FFFDF9] border border-[#E8D8C3] text-[11px] text-[#806F62]">
                            Google
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#806F62] truncate mt-0.5">{u.email}</p>
                      <p className="text-[11px] text-[#806F62]/80 mt-0.5">
                        Inscrit le {formatDateFr(u.dateCreation)}
                      </p>
                    </div>
                  </div>

                  {/* Actions Modifier / Supprimer */}
                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(u)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFFDF9] hover:bg-[#E8D8C3]/70 border border-[#E8D8C3] text-xs font-medium text-[#332821] transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#6B4226]" />
                      <span>Modifier</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSelf}
                      onClick={() => setUserToDelete(u)}
                      title={
                        isSelf
                          ? 'Tu ne peux pas supprimer ton propre compte'
                          : 'Supprimer cet utilisateur'
                      }
                      aria-label={`Supprimer ${u.prenom} ${u.nom}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FDF4F3] hover:bg-[#A65D57] text-[#A65D57] hover:text-white border border-[#A65D57]/30 text-xs font-medium disabled:opacity-40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modale de modification d'un utilisateur */}
      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title="Modifier l'utilisateur"
        subtitle="Modifie le nom, le prénom, l'e-mail, le rôle ou le mot de passe."
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#332821] mb-1.5">
                Prénom
              </label>
              <input
                type="text"
                required
                value={editForm.prenom}
                onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] text-sm text-[#332821] focus:border-[#6B4226] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#332821] mb-1.5">
                Nom
              </label>
              <input
                type="text"
                required
                value={editForm.nom}
                onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] text-sm text-[#332821] focus:border-[#6B4226] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#332821] mb-1.5">
              Adresse e-mail
            </label>
            <input
              type="email"
              required
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] text-sm text-[#332821] focus:border-[#6B4226] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#332821] mb-1.5">
              Rôle
            </label>
            <select
              value={editForm.role}
              disabled={currentUser?.id === editingUser?.id}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] text-sm text-[#332821] focus:border-[#6B4226] focus:outline-none disabled:opacity-50"
            >
              <option value="USER">Utilisateur (USER)</option>
              <option value="ADMIN">Administrateur (ADMIN)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#332821] mb-1.5">
              Nouveau mot de passe (optionnel)
            </label>
            <input
              type="password"
              minLength={8}
              placeholder="Laisser vide pour ne pas changer"
              value={editForm.nouveauMotDePasse}
              onChange={(e) =>
                setEditForm({ ...editForm, nouveauMotDePasse: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] text-sm text-[#332821] focus:border-[#6B4226] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="px-5 py-2.5 rounded-full bg-[#E8D8C3] hover:bg-[#decab0] text-sm font-medium text-[#332821] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={savingEdit}
              className="px-6 py-2.5 rounded-full bg-[#6B4226] hover:bg-[#58351D] text-sm font-medium text-[#FFFDF9] transition-colors disabled:opacity-60"
            >
              {savingEdit ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation de suppression */}
      <ConfirmDialog
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Supprimer cet utilisateur ?"
        message={
          userToDelete
            ? `Es-tu sûr de vouloir supprimer le compte de ${userToDelete.prenom} ${userToDelete.nom} (${userToDelete.email}) ?`
            : ''
        }
        confirmLabel="Supprimer le compte"
      />
    </div>
  )
}
