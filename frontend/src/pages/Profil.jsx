import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Lock, ShieldCheck, LogOut, Info } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { authService } from '../services/authService'
import { profilSchema, createPasswordSchema } from '../utils/validators'
import { extractErrorMessage, extractFieldErrors } from '../services/api'

export default function Profil() {
  const { user, setUser, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const googleLinkedParam = searchParams.get('googleLinked') === 'true'
  const showGoogleLinkedNotice =
    googleLinkedParam || Boolean(user?.motDePasseSupprimeParLiaisonGoogle)

  const [profilError, setProfilError] = useState('')
  const [pwdError, setPwdError] = useState('')

  const {
    register: registerProfil,
    handleSubmit: handleSubmitProfil,
    reset: resetProfil,
    setError: setFieldErrorProfil,
    formState: { errors: profilErrors, isSubmitting: isSavingProfil },
  } = useForm({
    resolver: zodResolver(profilSchema),
    defaultValues: {
      prenom: user?.prenom || '',
      nom: user?.nom || '',
      email: user?.email || '',
    },
  })

  const aMotDePasse = Boolean(user?.aMotDePasse)

  const {
    register: registerPwd,
    handleSubmit: handleSubmitPwd,
    reset: resetPwd,
    setError: setFieldErrorPwd,
    formState: { errors: pwdErrors, isSubmitting: isSavingPwd },
  } = useForm({
    resolver: zodResolver(createPasswordSchema(aMotDePasse)),
    defaultValues: {
      motDePasseActuel: '',
      nouveauMotDePasse: '',
    },
  })

  useEffect(() => {
    if (user) {
      resetProfil({
        prenom: user.prenom || '',
        nom: user.nom || '',
        email: user.email || '',
      })
    }
  }, [user, resetProfil])

  const onSaveProfil = async (values) => {
    setProfilError('')
    try {
      const updated = await authService.updateProfil(values)
      setUser(updated)
      toast.success('Informations personnelles enregistrées.')
    } catch (err) {
      const fieldErrors = extractFieldErrors(err)
      Object.entries(fieldErrors).forEach(([field, msg]) => {
        setFieldErrorProfil(field, { type: 'server', message: msg })
      })
      setProfilError(extractErrorMessage(err, 'Impossible de mettre à jour ton profil.'))
    }
  }

  const onSavePassword = async (values) => {
    setPwdError('')
    try {
      const payload = {
        nouveauMotDePasse: values.nouveauMotDePasse,
      }
      if (aMotDePasse) {
        payload.motDePasseActuel = values.motDePasseActuel
      }
      const updated = await authService.updateMotDePasse(payload)
      setUser(updated)
      resetPwd({ motDePasseActuel: '', nouveauMotDePasse: '' })
      toast.success(
        aMotDePasse
          ? 'Ton mot de passe a été modifié.'
          : 'Ton mot de passe a été défini avec succès.'
      )
    } catch (err) {
      const fieldErrors = extractFieldErrors(err)
      Object.entries(fieldErrors).forEach(([field, msg]) => {
        setFieldErrorPwd(field, { type: 'server', message: msg })
      })
      setPwdError(extractErrorMessage(err, 'Impossible de mettre à jour le mot de passe.'))
    }
  }

  const handleLogout = async () => {
    await logout()
    toast.info('À bientôt sur Kalpee !')
    navigate('/login')
  }

  return (
    <div className="space-y-6">
      {/* En-tête (sans mention d'abonnement Pro) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#332821]">
            Mon compte
          </h1>
          <p className="text-sm text-[#806F62] mt-1">
            Gère ton profil et ta sécurité.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#EFE6D8] hover:bg-[#F6E6E4] text-[#332821] hover:text-[#A65D57] text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Se déconnecter</span>
        </button>
      </div>

      {/* Bannière explicative après liaison Google ayant désactivé l'ancien mot de passe (D13) */}
      {showGoogleLinkedNotice && (
        <div
          role="status"
          className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#F8EFE2] border border-[#C58B45]/40 text-sm text-[#332821]"
        >
          <Info className="w-5 h-5 text-[#C58B45] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#332821]">
              Ton compte est maintenant relié à Google
            </p>
            <p className="text-xs text-[#806F62] mt-1 leading-relaxed">
              Par mesure de sécurité lors de la liaison automatique avec ton adresse Google vérifiée, ton ancien mot de passe a été désactivé. Tu peux continuer avec Google ou définir un nouveau mot de passe ci-dessous.
            </p>
          </div>
        </div>
      )}

      {/* Carte 1 : Informations personnelles */}
      <div className="bg-[#FFFDF9] rounded-[28px] border border-[#E8D8C3] p-6 sm:p-8 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#EFE6D8] text-[#332821] flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-xl text-[#332821]">
            Informations personnelles
          </h2>
        </div>

        <form onSubmit={handleSubmitProfil(onSaveProfil)} className="space-y-4" noValidate>
          {profilError && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-[#FDF4F3] border border-[#A65D57]/30 text-xs font-medium text-[#A65D57]"
            >
              {profilError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profil-prenom" className="block text-sm font-medium text-[#332821] mb-1.5">
                Prénom
              </label>
              <input
                id="profil-prenom"
                type="text"
                {...registerProfil('prenom')}
                className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821]"
              />
              {profilErrors.prenom && (
                <p className="mt-1 text-xs text-[#A65D57]">{profilErrors.prenom.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="profil-nom" className="block text-sm font-medium text-[#332821] mb-1.5">
                Nom
              </label>
              <input
                id="profil-nom"
                type="text"
                {...registerProfil('nom')}
                className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821]"
              />
              {profilErrors.nom && (
                <p className="mt-1 text-xs text-[#A65D57]">{profilErrors.nom.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="profil-email" className="block text-sm font-medium text-[#332821] mb-1.5">
              Adresse e-mail
            </label>
            <input
              id="profil-email"
              type="email"
              {...registerProfil('email')}
              className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821]"
            />
            {profilErrors.email && (
              <p className="mt-1 text-xs text-[#A65D57]">{profilErrors.email.message}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSavingProfil}
              className="px-6 py-3 rounded-full bg-[#6B4226] hover:bg-[#58351D] text-[#FFFDF9] text-sm font-medium transition-colors disabled:opacity-60"
            >
              {isSavingProfil ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>

      {/* Carte 2 : Connexion & Compte Google */}
      <div className="bg-[#FFFDF9] rounded-[28px] border border-[#E8D8C3] p-6 sm:p-8 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#EFE6D8] text-[#332821] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-xl text-[#332821]">
            Comptes connectés
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3]">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
            <div>
              <p className="text-sm font-semibold text-[#332821]">Google</p>
              <p className="text-xs text-[#806F62]">
                {user?.connexionGoogle
                  ? 'Ton compte Kalpee est relié à ton compte Google.'
                  : 'Ton compte utilise actuellement la connexion par e-mail.'}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto ${
              user?.connexionGoogle
                ? 'bg-[#E7ECE1] text-[#718355]'
                : 'bg-[#EFE6D8] text-[#806F62]'
            }`}
          >
            {user?.connexionGoogle ? 'Relié' : 'Non relié'}
          </span>
        </div>
      </div>

      {/* Carte 3 : Mot de passe */}
      <div className="bg-[#FFFDF9] rounded-[28px] border border-[#E8D8C3] p-6 sm:p-8 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#EFE6D8] text-[#332821] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-[#332821]">
              {aMotDePasse ? 'Modifier mon mot de passe' : 'Définir un mot de passe'}
            </h2>
            {!aMotDePasse && (
              <p className="text-xs text-[#806F62] mt-0.5">
                Tu te connectes avec Google. Définis un mot de passe si tu souhaites aussi te connecter par e-mail.
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmitPwd(onSavePassword)} className="space-y-4" noValidate>
          {pwdError && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-[#FDF4F3] border border-[#A65D57]/30 text-xs font-medium text-[#A65D57]"
            >
              {pwdError}
            </div>
          )}

          {aMotDePasse && (
            <div>
              <label htmlFor="pwd-actuel" className="block text-sm font-medium text-[#332821] mb-1.5">
                Mot de passe actuel
              </label>
              <input
                id="pwd-actuel"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...registerPwd('motDePasseActuel')}
                className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821]"
              />
              {pwdErrors.motDePasseActuel && (
                <p className="mt-1 text-xs text-[#A65D57]">{pwdErrors.motDePasseActuel.message}</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="pwd-nouveau" className="block text-sm font-medium text-[#332821] mb-1.5">
              Nouveau mot de passe
            </label>
            <input
              id="pwd-nouveau"
              type="password"
              autoComplete="new-password"
              placeholder="8 caractères minimum"
              {...registerPwd('nouveauMotDePasse')}
              className="w-full px-4 py-3 rounded-2xl bg-[#F7F1E8] border border-[#E8D8C3] focus:border-[#6B4226] focus:outline-none text-sm text-[#332821]"
            />
            {pwdErrors.nouveauMotDePasse && (
              <p className="mt-1 text-xs text-[#A65D57]">{pwdErrors.nouveauMotDePasse.message}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSavingPwd}
              className="px-6 py-3 rounded-full bg-[#6B4226] hover:bg-[#58351D] text-[#FFFDF9] text-sm font-medium transition-colors disabled:opacity-60"
            >
              {isSavingPwd
                ? 'Enregistrement...'
                : aMotDePasse
                ? 'Mettre à jour le mot de passe'
                : 'Définir le mot de passe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
