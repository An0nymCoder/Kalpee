import React, { useEffect, useState } from 'react'

export default function SplashScreen({ duration = 2600, onComplete }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setExiting(true)
    }, Math.max(400, duration - 450))

    const doneTimer = setTimeout(() => {
      if (onComplete) onComplete()
    }, duration)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(doneTimer)
    }
  }, [duration, onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#F7F1E8] via-[#F1E6D6] to-[#E8D8C3] text-[#332821] select-none transition-all duration-500 ease-out ${
        exiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      aria-label="Chargement de Kalpee"
    >
      {/* Halos lumineux dynamiques en arrière-plan (tons beiges & ambrés Kalpee) */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#FFFDF9]/80 blur-3xl animate-pulse-slow" />
      <div className="pointer-events-none absolute -bottom-28 -right-24 w-[28rem] h-[28rem] rounded-full bg-[#C58B45]/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#8B6245]/10 blur-2xl animate-pulse" />

      {/* Contenu central : Logo + Nom de l'appli Kalpee au milieu */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Médaillon K animé avec anneaux concentriques */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#C58B45]/25 blur-md scale-125 animate-ping-slow" />
          <div className="absolute -inset-3 rounded-full border border-[#6B4226]/25 animate-spin-slow" />
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#2A1B12] via-[#3E2723] to-[#6B4226] text-[#FFFDF9] flex items-center justify-center font-serif text-4xl sm:text-5xl shadow-[0_14px_36px_rgba(107,66,38,0.28)] ring-4 ring-[#FFFDF9]/80 animate-splash-pop">
            K
          </div>
        </div>

        {/* Nom de l'application au centre */}
        <h1 className="font-serif text-5xl sm:text-7xl tracking-tight text-[#332821] drop-shadow-sm animate-splash-title">
          Kalpee
        </h1>

        {/* Sous-titre chaleureux */}
        <p className="mt-3 text-sm sm:text-base text-[#806F62] font-medium tracking-wide max-w-xs sm:max-w-sm animate-splash-subtitle">
          Planifie tes achats. Maîtrise ton épargne.
        </p>

        {/* Barre de chargement fluide */}
        <div className="mt-9 w-48 sm:w-56 h-2 rounded-full bg-[#E8D8C3] border border-[#8B6245]/20 overflow-hidden p-0.5 shadow-inner">
          <div className="h-full rounded-full bg-gradient-to-r from-[#6B4226] via-[#8B6245] to-[#C58B45] animate-splash-progress" />
        </div>
      </div>
    </div>
  )
}
