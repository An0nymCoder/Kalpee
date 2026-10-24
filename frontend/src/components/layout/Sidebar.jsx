import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  ShoppingBag,
  PiggyBank,
  Target,
  ShieldCheck,
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
  { to: '/admin', label: 'Administration', icon: ShieldCheck },
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
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-[#FFFDF9]/95 backdrop-blur-md border-r border-[#E8D8C3]/80 px-4 py-6 select-none z-30 shadow-[4px_0_24px_-4px_rgba(107,66,38,0.05)]">
      {/* Logo Kalpee */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2A1B12] via-[#3E2723] to-[#6B4226] text-[#FFFDF9] flex items-center justify-center font-serif text-lg tracking-wider shadow-md ring-2 ring-[#E8D8C3]/60">
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
              `flex items-center gap-3.5 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-[#6B4226] to-[#58351D] text-[#FFFDF9] shadow-[0_6px_16px_rgba(107,66,38,0.24)] translate-x-0.5'
                  : 'text-[#332821] hover:bg-[#F1E6D6]/85 hover:translate-x-1'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {!isAdmin && (
        <>
          <div className="my-5 border-t border-[#E8D8C3]/80" />
          <nav aria-label="Compte" className="space-y-1.5">
            <NavLink
              to="/profil"
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#6B4226] to-[#58351D] text-[#FFFDF9] shadow-[0_6px_16px_rgba(107,66,38,0.24)] translate-x-0.5'
                    : 'text-[#332821] hover:bg-[#F1E6D6]/85 hover:translate-x-1'
                }`
              }
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Mon compte</span>
            </NavLink>
          </nav>
        </>
      )}

      <div className="mt-auto pt-6 space-y-2">
        {/* Carte utilisateur en bas de la sidebar */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-[#F7F1E8] to-[#F1E6D6]/80 border border-[#E8D8C3] flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-3 text-left min-w-0 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B4226] to-[#3E2723] text-[#FFFDF9] font-semibold text-sm flex items-center justify-center shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#332821] truncate">
                {fullName}
              </p>
              <p className="text-xs text-[#806F62] truncate">
                {isAdmin ? 'Administrateur' : 'Gérer mon compte'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Se déconnecter"
            aria-label="Se déconnecter"
            className="p-2 rounded-full text-[#806F62] hover:text-[#A65D57] hover:bg-[#E8D8C3]/60 transition-all duration-200 shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
