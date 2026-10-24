import React, { useEffect, useState } from 'react'
import { Download, Share, PlusSquare, X } from 'lucide-react'

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIos, setIsIos] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem('kalpee_pwa_dismissed') === 'true'
    } catch {
      return false
    }
  })
  const [showIosGuide, setShowIosGuide] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    setIsStandalone(standalone)

    const ua = window.navigator.userAgent.toLowerCase()
    const iosDevice = /iphone|ipad|ipod/.test(ua) && !window.MSStream
    setIsIos(iosDevice)

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setIsStandalone(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    } else if (isIos) {
      setShowIosGuide(true)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem('kalpee_pwa_dismissed', 'true')
    } catch {
      // ignore
    }
  }

  if (isStandalone || dismissed || (!deferredPrompt && !isIos)) {
    return null
  }

  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-40 bg-[#FFFDF9] border border-[#E8D8C3] rounded-[24px] p-4 shadow-[0_14px_36px_rgba(42,27,18,0.18)] flex items-center justify-between gap-3 animate-fade-up">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2A1B12] via-[#3E2723] to-[#6B4226] text-[#FFFDF9] flex items-center justify-center font-serif text-xl shrink-0 shadow-sm">
            K
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#332821] truncate">
              Ajouter Kalpee à ton écran
            </p>
            <p className="text-xs text-[#806F62] truncate">
              Accède à l&apos;appli en 1 clic sans chercher
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#6B4226] to-[#3E2723] text-[#FFFDF9] text-xs font-semibold shadow-sm hover:opacity-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Installer</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Fermer"
            className="p-1.5 rounded-full text-[#806F62] hover:bg-[#F1E6D6] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-[#2A1B12]/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#FFFDF9] rounded-[28px] border border-[#E8D8C3] p-6 shadow-xl animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#2A1B12] text-[#FFFDF9] flex items-center justify-center font-serif text-lg">
                  K
                </div>
                <h3 className="font-serif text-xl text-[#332821]">
                  Ajouter sur ton iPhone
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="p-1.5 rounded-full text-[#806F62] hover:bg-[#F1E6D6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ol className="space-y-3 text-sm text-[#332821]">
              <li className="flex items-center gap-3 p-3 rounded-2xl bg-[#F7F1E8]">
                <Share className="w-5 h-5 text-[#6B4226] shrink-0" />
                <span>
                  1. Appuie sur le bouton <strong>Partager</strong> en bas de Safari.
                </span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-2xl bg-[#F7F1E8]">
                <PlusSquare className="w-5 h-5 text-[#6B4226] shrink-0" />
                <span>
                  2. Choisis <strong>« Sur l&apos;écran d&apos;accueil »</strong> puis <strong>Ajouter</strong>.
                </span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="mt-5 w-full py-3 rounded-full bg-[#6B4226] text-[#FFFDF9] text-sm font-medium"
            >
              Compris !
            </button>
          </div>
        </div>
      )}
    </>
  )
}
