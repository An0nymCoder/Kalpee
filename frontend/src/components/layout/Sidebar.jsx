import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  ShoppingBag,
  PiggyBank,
  Target,
  Users,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

const userNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/achats', label: 'Mes achats', icon: ShoppingBag },
  { to: '/tirelire', label: 'Ma tirelire', icon: PiggyBank },
  { to: '/objectifs', label: 'Objectifs', icon: Target },
]

const adminNavItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const isAdmin = user?.role === 'ADMIN'
  const navItems = isAdmin ? adminNavItems : userNavItems

  const initials = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`.toUpperCase() || 'K'
  const fullName = user ? `${user.prenom} ${user.nom}` : 'Mon compte'

  const handleLogout = async () => {
    await logout()
    toast.info('À bientôt sur Kalpee !')
    navigate('/login')
  }

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-[#FFFDF9] border-r border-[#E8D8C3]/80 px-4 py-6 select-none z-30">
      {/* Logo Kalpee */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-full bg-[#2A1B12] text-[#FFFDF9] flex items-center justify-center font-serif text-lg tracking-wider shadow-sm">
          K
        </div>
        <div className="flex items-center gap-2">
          <span className="font-serif text-2xl text-[#332821] tracking-tight">
            Kalpee
          </span>
          {isAdmin && (
            <span className="px-2 py-0.5 rounded-full bg-[#6B4226]/15 text-[#6B4226] text-[10px] font-bold uppercase tracking-wider">
              Admin
            </span>
          )}
        </div>
      </div>

      {/* Section PRINCIPAL / ADMINISTRATION */}
      <div className="px-3 mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#806F62]">
          {isAdmin ? 'Administration' : 'Principal'}
        </span>
      </div>

      <nav className="space-y-1.5" aria-label="Navigation principale">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#6B4226] text-[#FFFDF9] shadow-sm'
                  : 'text-[#332821] hover:bg-[#F1E6D6]/70'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="my-5 border-t border-[#E8D8C3]/80" />

      {/* Mon compte */}
      <nav aria-label="Compte" className="space-y-1.5">
        <NavLink
          to="/profil"
          className={({ isActive }) =>
            `flex items-center gap-3.5 px-4 py-3 rounded-full text-sm font-medium transition-all ${
              isActive
                ? 'bg-[#6B4226] text-[#FFFDF9] shadow-sm'
                : 'text-[#332821] hover:bg-[#F1E6D6]/70'
            }`
          }
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>Mon compte</span>
        </NavLink>
      </nav>

      <div className="mt-auto pt-6 space-y-2">
        {/* Carte utilisateur en bas de la sidebar */}
        <div className="p-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3]/90 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => navigate('/profil')}
            className="flex items-center gap-3 text-left min-w-0 flex-1 group"
          >
            <div className="w-10 h-10 rounded-full bg-[#6B4226] text-[#FFFDF9] font-semibold text-sm flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#332821] truncate group-hover:text-[#6B4226] transition-colors">
                {fullName}
              </p>
              <p className="text-xs text-[#806F62] truncate">
                Gérer mon compte
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title="Se déconnecter"
            aria-label="Se déconnecter"
            className="p-2 rounded-full text-[#806F62] hover:text-[#A65D57] hover:bg-[#E8D8C3]/50 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
