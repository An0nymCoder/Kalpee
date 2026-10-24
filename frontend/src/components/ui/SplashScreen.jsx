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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#2A1B12] via-[#3E2723] to-[#6B4226] text-[#FFFDF9] select-none transition-all duration-500 ease-out ${
        exiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      aria-label="Chargement de Kalpee"
    >
      {/* Halos lumineux dynamiques en arrière-plan (palette Kalpee) */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#8B6245]/30 blur-3xl animate-pulse-slow" />
      <div className="pointer-events-none absolute -bottom-28 -right-24 w-[28rem] h-[28rem] rounded-full bg-[#C58B45]/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#E8D8C3]/10 blur-2xl animate-pulse" />

      {/* Contenu central : Logo + Nom de l'appli Kalpee au milieu */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Médaillon K animé avec anneaux concentriques */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#C58B45]/30 blur-md scale-125 animate-ping-slow" />
          <div className="absolute -inset-2.5 rounded-full border border-[#E8D8C3]/25 animate-spin-slow" />
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#FFFDF9] to-[#E8D8C3] text-[#2A1B12] flex items-center justify-center font-serif text-4xl sm:text-5xl shadow-[0_12px_40px_rgba(0,0,0,0.35)] animate-splash-pop">
            K
          </div>
        </div>

        {/* Nom de l'application au centre */}
        <h1 className="font-serif text-5xl sm:text-7xl tracking-tight text-[#FFFDF9] drop-shadow-sm animate-splash-title">
          Kalpee
        </h1>

        {/* Sous-titre chaleureux */}
        <p className="mt-3 text-sm sm:text-base text-[#E8D8C3]/90 font-medium tracking-wide max-w-xs sm:max-w-sm animate-splash-subtitle">
          Planifie tes achats. Maîtrise ton épargne.
        </p>

        {/* Barre de chargement fluide */}
        <div className="mt-9 w-48 sm:w-56 h-1.5 rounded-full bg-[#FFFDF9]/15 overflow-hidden p-0.5">
          <div className="h-full rounded-full bg-gradient-to-r from-[#E8D8C3] via-[#C58B45] to-[#FFFDF9] animate-splash-progress" />
        </div>
      </div>
    </div>
  )
}
