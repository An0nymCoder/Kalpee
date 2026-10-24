import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { LayoutGrid, ShoppingBag, PiggyBank, Target, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/achats', label: 'Mes achats', icon: ShoppingBag },
  { to: '/tirelire', label: 'Ma tirelire', icon: PiggyBank },
  { to: '/objectifs', label: 'Objectifs', icon: Target },
]

export default function MobileNav() {
  const { user } = useAuth()
  const initials = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`.toUpperCase() || 'K'

  return (
    <>
      {/* Top Bar Mobile */}
      <header className="md:hidden sticky top-0 z-30 bg-[#FFFDF9]/95 backdrop-blur-sm border-b border-[#E8D8C3] px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#2A1B12] text-[#FFFDF9] flex items-center justify-center font-serif text-base">
            K
          </div>
          <span className="font-serif text-xl text-[#332821]">Kalpee</span>
        </Link>

        <div className="flex items-center gap-2">
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              aria-label="Administration"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#6B4226] text-[#FFFDF9] text-xs font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          )}

          <Link
            to="/profil"
            aria-label="Mon compte"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F1E6D6] text-[#332821] text-xs font-medium"
          >
            <span className="w-6 h-6 rounded-full bg-[#6B4226] text-white flex items-center justify-center text-[11px] font-semibold">
              {initials}
            </span>
            <span>Mon compte</span>
          </Link>
        </div>
      </header>

      {/* Bottom Navigation Mobile (4 entrées) */}
      <nav
        aria-label="Navigation mobile"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#FFFDF9] border-t border-[#E8D8C3] px-2 py-1.5 grid grid-cols-4 gap-1"
      >
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 rounded-2xl text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-[#6B4226] bg-[#F1E6D6]/80 font-semibold'
                  : 'text-[#806F62] hover:text-[#332821]'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
