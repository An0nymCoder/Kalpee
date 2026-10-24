import React, { useEffect, useMemo, useState } from 'react'
import {
  ShieldCheck,
  Users,
  ShoppingBag,
  PiggyBank,
  Target,
  Search,
  Trash2,
  RefreshCw,
  UserCheck,
  Package,
} from 'lucide-react'
import { getAdminDashboard, updateUserRole, deleteUser } from '../services/adminService'
import { extractErrorMessage } from '../services/api'
import { formatMontant, formatDateFr } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function Admin() {
  const { user: currentUser } = useAuth()
  const toast = useToast()

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [userToDelete, setUserToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [updatingRoleId, setUpdatingRoleId] = useState(null)

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const data = await getAdminDashboard()
      setStats(data)
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Impossible de charger le tableau de bord administrateur.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const filteredUsers = useMemo(() => {
    const list = stats?.utilisateurs || []
    const q = search.trim().toLowerCase()
    return list.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false
      if (!q) return true
      const fullName = `${u.prenom || ''} ${u.nom || ''}`.toLowerCase()
      return fullName.includes(q) || (u.email || '').toLowerCase().includes(q)
    })
  }, [stats, search, roleFilter])

  const handleToggleRole = async (targetUser) => {
    const nextRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN'
    setUpdatingRoleId(targetUser.id)
    try {
      const updated = await updateUserRole(targetUser.id, nextRole)
      setStats((prev) => {
        if (!prev) return prev
        const nextList = prev.utilisateurs.map((u) => (u.id === updated.id ? updated : u))
        const totalAdmins = nextList.filter((u) => u.role === 'ADMIN').length
        return { ...prev, totalAdmins, utilisateurs: nextList }
      })
      toast.success(
        `Rôle de ${targetUser.prenom} ${targetUser.nom} changé en ${nextRole}.`
      )
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Impossible de modifier le rôle.'))
    } finally {
      setUpdatingRoleId(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return
    setDeleting(true)
    try {
      await deleteUser(userToDelete.id)
      toast.success(`Le compte de ${userToDelete.prenom} ${userToDelete.nom} a été supprimé.`)
      setUserToDelete(null)
      await loadDashboard()
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Impossible de supprimer cet utilisateur.'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-8 pb-10">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6B4226]/10 text-[#6B4226] text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Espace Administrateur</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#332821]">
            Administration Kalpee
          </h1>
          <p className="text-sm text-[#806F62] mt-1">
            Statistiques globales des utilisateurs, des articles et de la tirelire.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#FFFDF9] hover:bg-[#F1E6D6] border border-[#E8D8C3] text-sm font-medium text-[#332821] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Cartes de statistiques globales */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Carte 1 : Utilisateurs */}
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
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#806F62]">
                <span className="px-2.5 py-0.5 rounded-full bg-[#F7F1E8]">
                  {stats.totalAdmins} admin(s)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#F7F1E8]">
                  {stats.utilisateursGoogle} Google
                </span>
              </div>
            </div>

            {/* Carte 2 : Articles & Achats */}
            <div className="bg-[#FFFDF9] rounded-[24px] border border-[#E8D8C3] p-5 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#806F62]">
                  Articles & Achats
                </span>
                <div className="w-9 h-9 rounded-full bg-[#F1E6D6] text-[#6B4226] flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <p className="font-serif text-3xl text-[#332821]">
                {stats.totalArticles}{' '}
                <span className="text-sm font-sans font-normal text-[#806F62]">
                  articles ({stats.totalAchats} achats)
                </span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-[#718355]/15 text-[#718355] font-medium">
                  {stats.articlesAchetes} achetés
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#F7F1E8] text-[#806F62]">
                  {stats.articlesAAcheter} à acheter
                </span>
                {stats.articlesMisDeCote > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#C58B45]/15 text-[#C58B45]">
                    {stats.articlesMisDeCote} de côté
                  </span>
                )}
              </div>
            </div>

            {/* Carte 3 : Tirelire globale */}
            <div className="bg-gradient-to-br from-[#6B4226] to-[#3E2723] text-[#FFFDF9] rounded-[24px] p-5 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#F1E6D6]/80">
                  Tirelires cumulées
                </span>
                <div className="w-9 h-9 rounded-full bg-white/15 text-[#FFFDF9] flex items-center justify-center">
                  <PiggyBank className="w-4 h-4" />
                </div>
              </div>
              <p className="font-serif text-2xl sm:text-3xl">
                {formatMontant(stats.soldeGlobalTirelires)}
              </p>
              <p className="mt-3 text-xs text-[#F1E6D6]/85">
                Déposé : {formatMontant(stats.totalGlobalDepose)} • Retiré :{' '}
                {formatMontant(stats.totalGlobalRetire)} ({stats.totalTransactions} mouv.)
              </p>
            </div>

            {/* Carte 4 : Volume d'achats & Objectifs */}
            <div className="bg-[#FFFDF9] rounded-[24px] border border-[#E8D8C3] p-5 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#806F62]">
                  Volume prévu & Objectifs
                </span>
                <div className="w-9 h-9 rounded-full bg-[#F1E6D6] text-[#6B4226] flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <p className="font-serif text-2xl text-[#332821]">
                {formatMontant(stats.montantTotalAchats)}
              </p>
              <p className="mt-3 text-xs text-[#806F62]">
                Déjà acheté : {formatMontant(stats.montantTotalArticlesAchetes)} •{' '}
                {stats.totalObjectifs} objectif(s)
              </p>
            </div>
          </div>
        )
      )}

      {/* Gestion des utilisateurs */}
      <div className="bg-[#FFFDF9] rounded-[28px] border border-[#E8D8C3] p-5 sm:p-7 shadow-soft space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl text-[#332821]">Gestion des utilisateurs</h2>
            <p className="text-xs sm:text-sm text-[#806F62]">
              Consulte l'activité de chaque compte, modifie les rôles ou supprime un compte.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'ALL', label: 'Tous' },
              { key: 'ADMIN', label: 'Admins' },
              { key: 'USER', label: 'Utilisateurs' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setRoleFilter(item.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  roleFilter === item.key
                    ? 'bg-[#6B4226] text-[#FFFDF9]'
                    : 'bg-[#F7F1E8] text-[#332821] hover:bg-[#E8D8C3]/70'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#806F62] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur par nom, prénom ou e-mail..."
            className="w-full pl-11 pr-4 py-3 rounded-full bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821]"
          />
        </div>

        {/* Liste des utilisateurs */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-10 text-sm text-[#806F62]">
            Aucun utilisateur ne correspond à ta recherche.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((u) => {
              const isSelf = currentUser?.id === u.id
              const initials = `${u.prenom?.[0] || ''}${u.nom?.[0] || ''}`.toUpperCase() || 'U'
              return (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl bg-[#F7F1E8]/70 border border-[#E8D8C3] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
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
                        {u.connexionGoogle && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#FFFDF9] border border-[#E8D8C3] text-[11px] text-[#806F62]">
                            Google
                          </span>
                        )}
                        {isSelf && (
                          <span className="px-2 py-0.5 rounded-full bg-[#718355]/15 text-[#718355] text-[11px] font-medium">
                            Toi
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#806F62] truncate mt-0.5">{u.email}</p>
                      <p className="text-[11px] text-[#806F62]/80 mt-0.5">
                        Inscrit le {formatDateFr(u.dateCreation)}
                      </p>
                    </div>
                  </div>

                  {/* Statistiques du compte */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center bg-[#FFFDF9] px-4 py-2.5 rounded-2xl border border-[#E8D8C3]/80">
                    <div>
                      <p className="text-[11px] text-[#806F62]">Achats / Art.</p>
                      <p className="text-xs sm:text-sm font-semibold text-[#332821]">
                        {u.nombreAchats} / {u.nombreArticles}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#806F62]">Tirelire</p>
                      <p className="text-xs sm:text-sm font-semibold text-[#6B4226]">
                        {formatMontant(u.soldeTirelire)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#806F62]">Objectifs</p>
                      <p className="text-xs sm:text-sm font-semibold text-[#332821]">
                        {u.nombreObjectifs}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isSelf || updatingRoleId === u.id}
                      onClick={() => handleToggleRole(u)}
                      title={
                        isSelf
                          ? 'Tu ne peux pas modifier ton propre rôle'
                          : u.role === 'ADMIN'
                          ? 'Rétrograder en utilisateur'
                          : 'Promouvoir administrateur'
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FFFDF9] hover:bg-[#E8D8C3]/70 border border-[#E8D8C3] text-xs font-medium text-[#332821] disabled:opacity-40 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#6B4226]" />
                      <span>{u.role === 'ADMIN' ? 'Passer USER' : 'Passer ADMIN'}</span>
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
                      className="p-2 rounded-full bg-[#FDF4F3] hover:bg-[#A65D57] text-[#A65D57] hover:text-white border border-[#A65D57]/30 disabled:opacity-40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Confirmation de suppression */}
      <ConfirmDialog
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Supprimer cet utilisateur ?"
        message={
          userToDelete
            ? `Es-tu sûr de vouloir supprimer le compte de ${userToDelete.prenom} ${userToDelete.nom} (${userToDelete.email}) ? Ses achats, articles, photos, objectifs et sa tirelire seront définitivement supprimés.`
            : ''
        }
        confirmLabel="Supprimer le compte"
      />
    </div>
  )
}
