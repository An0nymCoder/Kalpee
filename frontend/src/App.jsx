import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Achats from './pages/Achats'
import AchatDetail from './pages/AchatDetail'
import Tirelire from './pages/Tirelire'
import Objectifs from './pages/Objectifs'
import Profil from './pages/Profil'
import AdminDashboard from './pages/AdminDashboard'
import AdminUtilisateurs from './pages/AdminUtilisateurs'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F1E8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#2A1B12] text-[#FFFDF9] flex items-center justify-center font-serif text-xl animate-pulse">
            K
          </div>
          <p className="text-sm text-[#806F62]">Chargement de ton espace Kalpee...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} replace />
  }

  return children
}

function UserOnlyRoute({ children }) {
  const { user } = useAuth()
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />
  }
  return children
}

function AdminOnlyRoute({ children }) {
  const { user } = useAuth()
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function DefaultRedirect() {
  const { user } = useAuth()
  return <Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DefaultRedirect />} />

        {/* Routes Utilisateur classique */}
        <Route
          path="/dashboard"
          element={
            <UserOnlyRoute>
              <Dashboard />
            </UserOnlyRoute>
          }
        />
        <Route
          path="/achats"
          element={
            <UserOnlyRoute>
              <Achats />
            </UserOnlyRoute>
          }
        />
        <Route
          path="/achats/:id"
          element={
            <UserOnlyRoute>
              <AchatDetail />
            </UserOnlyRoute>
          }
        />
        <Route
          path="/tirelire"
          element={
            <UserOnlyRoute>
              <Tirelire />
            </UserOnlyRoute>
          }
        />
        <Route
          path="/objectifs"
          element={
            <UserOnlyRoute>
              <Objectifs />
            </UserOnlyRoute>
          }
        />

        {/* Routes Administrateur exclusives */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminOnlyRoute>
              <AdminDashboard />
            </AdminOnlyRoute>
          }
        />
        <Route
          path="/admin/utilisateurs"
          element={
            <AdminOnlyRoute>
              <AdminUtilisateurs />
            </AdminOnlyRoute>
          }
        />

        {/* Mon compte (accessible à tous) */}
        <Route path="/profil" element={<Profil />} />
        <Route path="/compte" element={<Profil />} />
      </Route>

      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  )
}
