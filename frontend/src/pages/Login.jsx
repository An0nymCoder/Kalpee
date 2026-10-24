import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { loginSchema } from '../utils/validators'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { extractErrorMessage, extractFieldErrors } from '../services/api'
import SplashScreen from '../components/ui/SplashScreen'

const OAUTH_ERRORS = {
  google_email_unverified:
    "Ton adresse Google n'est pas certifiée. Vérifie ton compte Google ou connecte-toi par e-mail.",
  google_auth_failed:
    "La connexion avec Google n'a pas pu aboutir. Réessaie ou utilise ton e-mail et mot de passe.",
  access_denied: 'Connexion Google annulée.',
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const [serverError, setServerError] = useState('')

  const oauthErrorKey = searchParams.get('error')
  const oauthErrorMessage = oauthErrorKey
    ? OAUTH_ERRORS[oauthErrorKey] || 'Une erreur est survenue lors de la connexion Google.'
    : ''

  // Affiche la page de chargement dynamique Kalpee pendant ~2.6s avant la page de connexion
  const [showSplash, setShowSplash] = useState(!oauthErrorKey)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      motDePasse: '',
    },
  })

  const onSubmit = async (values) => {
    setServerError('')
    try {
      const loggedUser = await login(values)
      toast.success('Bon retour sur Kalpee !')
      navigate(loggedUser?.role === 'ADMIN' ? '/admin' : '/dashboard')
    } catch (err) {
      const fieldErrors = extractFieldErrors(err)
      Object.entries(fieldErrors).forEach(([field, msg]) => {
        setError(field, { type: 'server', message: msg })
      })
      setServerError(
        extractErrorMessage(err, 'Identifiants incorrects. Vérifie ton e-mail et ton mot de passe.')
      )
    }
  }

  const handleGoogleLogin = () => {
    window.location.assign('/api/oauth2/authorization/google')
  }

  return (
    <>
      {showSplash && (
        <SplashScreen duration={2600} onComplete={() => setShowSplash(false)} />
      )}

      <div className="relative min-h-screen bg-[#F7F1E8] flex flex-col justify-center items-center px-4 py-10 overflow-hidden">
        {/* Halos décoratifs chaleureux (couleurs Kalpee) */}
        <div className="pointer-events-none absolute -top-24 -left-20 w-80 h-80 rounded-full bg-[#E8D8C3]/65 blur-3xl animate-pulse-slow" />
        <div className="pointer-events-none absolute -bottom-24 -right-20 w-96 h-96 rounded-full bg-[#C58B45]/15 blur-3xl animate-float-slow" />

        <div
          className={`relative z-10 w-full max-w-md transition-all duration-700 ${
            showSplash ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0 animate-fade-up'
          }`}
        >
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2A1B12] via-[#3E2723] to-[#6B4226] text-[#FFFDF9] flex items-center justify-center font-serif text-2xl mb-3.5 shadow-[0_8px_24px_rgba(42,27,18,0.22)] ring-4 ring-[#E8D8C3]/60 transition-transform duration-300 hover:scale-105">
              K
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#332821] tracking-tight">
              Bon retour sur Kalpee
            </h1>
            <p className="text-sm text-[#806F62] mt-1.5">
              Planifie tranquillement tes achats et ton argent mis de côté.
            </p>
          </div>

          {/* Card */}
          <div className="bg-[#FFFDF9]/95 backdrop-blur-sm rounded-[28px] border border-[#E8D8C3] shadow-[0_12px_40px_-8px_rgba(107,66,38,0.12)] p-6 sm:p-8 transition-all duration-300">
            {(oauthErrorMessage || serverError) && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#FDF4F3] border border-[#A65D57]/40 text-xs font-medium text-[#A65D57] animate-fade-up"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{serverError || oauthErrorMessage}</span>
              </div>
            )}

            {/* Bouton Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3.5 px-4 rounded-full bg-[#F7F1E8] hover:bg-[#F1E6D6] border border-[#E8D8C3] hover:border-[#8B6245]/50 text-[#332821] font-medium text-sm flex items-center justify-center gap-3 shadow-sm hover:shadow hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              <span>Continuer avec Google</span>
            </button>

            <div className="relative my-6 flex items-center justify-center">
              <div className="border-t border-[#E8D8C3] w-full" />
              <span className="bg-[#FFFDF9] px-3 text-xs text-[#806F62] uppercase tracking-wider">
                ou par e-mail
              </span>
              <div className="border-t border-[#E8D8C3] w-full" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-[#332821] mb-1.5">
                  Adresse e-mail
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="ouz@example.com"
                  {...register('email')}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:ring-2 focus:ring-[#6B4226]/15 focus:bg-[#FFFDF9] focus:outline-none text-sm text-[#332821] placeholder:text-[#806F62]/70 transition-all duration-200"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-[#A65D57]">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-[#332821] mb-1.5">
                  Mot de passe
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('motDePasse')}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:ring-2 focus:ring-[#6B4226]/15 focus:bg-[#FFFDF9] focus:outline-none text-sm text-[#332821] placeholder:text-[#806F62]/70 transition-all duration-200"
                />
                {errors.motDePasse && (
                  <p className="mt-1 text-xs text-[#A65D57]">{errors.motDePasse.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-5 rounded-full bg-gradient-to-r from-[#6B4226] via-[#58351D] to-[#3E2723] hover:from-[#58351D] hover:to-[#2A1B12] text-[#FFFDF9] font-medium text-sm shadow-[0_6px_20px_rgba(107,66,38,0.28)] hover:shadow-[0_10px_25px_rgba(107,66,38,0.38)] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 mt-2"
              >
                {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </form>

            <p className="text-center text-sm text-[#806F62] mt-6">
              Pas encore de compte ?{' '}
              <Link to="/register" className="font-semibold text-[#6B4226] hover:text-[#3E2723] hover:underline transition-colors">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
