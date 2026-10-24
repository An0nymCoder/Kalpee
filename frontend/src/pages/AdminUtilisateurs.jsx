import React, { useEffect, useMemo, useState } from 'react'
import {
  Users,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import {
  getAdminDashboard,
  updateUser,
  deleteUser,
} from '../services/adminService'
import { extractErrorMessage } from '../services/api'
import { formatMontant, formatDateFr } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function AdminUtilisateurs() {
  const { user: currentUser } = useAuth()
  const toast = useToast()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')

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

  const loadUsers = async () => {
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
    loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      if (roleFilter === 'ADMIN' && u.role !== 'ADMIN') return false
      if (roleFilter === 'USER' && u.role !== 'USER') return false
      if (roleFilter === 'GOOGLE' && !u.connexionGoogle) return false
      if (!q) return true
      const fullName = `${u.prenom || ''} ${u.nom || ''}`.toLowerCase()
      return fullName.includes(q) || (u.email || '').toLowerCase().includes(q)
    })
  }, [users, search, roleFilter])

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
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6B4226]/10 text-[#6B4226] text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administration Kalpee</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#332821]">Utilisateurs</h1>
          <p className="text-sm text-[#806F62] mt-1">
            Recherche, modifie ou supprime les comptes utilisateurs ({users.length} inscrits).
          </p>
        </div>

        <button
          type="button"
          onClick={loadUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFFDF9] hover:bg-[#F1E6D6] border border-[#E8D8C3] text-sm font-medium text-[#332821] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Recherche et filtres */}
      <div className="bg-[#FFFDF9] rounded-[28px] border border-[#E8D8C3] p-5 sm:p-7 shadow-soft space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Barre de recherche */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#806F62] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, prénom ou adresse e-mail..."
              className="w-full pl-11 pr-4 py-3 rounded-full bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821]"
            />
          </div>

          {/* Filtres par pilules */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'ALL', label: 'Tous' },
              { key: 'USER', label: 'Utilisateurs' },
              { key: 'ADMIN', label: 'Admins' },
              { key: 'GOOGLE', label: 'Google' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setRoleFilter(item.key)}
                className={`px-3.5 py-2 rounded-full text-xs font-medium transition-colors ${
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

        {/* Liste des utilisateurs */}
        {loading && users.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-20 rounded-2xl bg-[#F7F1E8] animate-pulse"
              />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-sm text-[#806F62]">
            Aucun utilisateur trouvé pour cette recherche.
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

                  {/* Statistiques utilisateur */}
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

                  {/* Boutons Modifier / Supprimer */}
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
        subtitle="Modifie les informations du compte, son rôle ou définis un nouveau mot de passe."
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
            ? `Es-tu sûr de vouloir supprimer le compte de ${userToDelete.prenom} ${userToDelete.nom} (${userToDelete.email}) ? Ses achats, articles, photos, objectifs et sa tirelire seront définitivement supprimés.`
            : ''
        }
        confirmLabel="Supprimer le compte"
      />
    </div>
  )
}
