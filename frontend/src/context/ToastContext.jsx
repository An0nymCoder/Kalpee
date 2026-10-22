import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }, [removeToast])

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error', 5000),
    info: (msg) => addToast(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 md:px-0"
      >
        {toasts.map((item) => {
          const isError = item.type === 'error'
          const isInfo = item.type === 'info'
          const bgClass = isError
            ? 'bg-[#FDF4F3] border-[#A65D57]/40 text-[#A65D57]'
            : isInfo
            ? 'bg-[#FFFDF9] border-[#E8D8C3] text-[#332821]'
            : 'bg-[#F4F7F0] border-[#718355]/40 text-[#332821]'

          return (
            <div
              key={item.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-soft transition-all ${bgClass}`}
            >
              {isError ? (
                <AlertCircle className="w-5 h-5 text-[#A65D57] shrink-0 mt-0.5" />
              ) : isInfo ? (
                <Info className="w-5 h-5 text-[#6B4226] shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-[#718355] shrink-0 mt-0.5" />
              )}
              <p className="text-sm font-medium flex-1 leading-snug">{item.message}</p>
              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="text-[#806F62] hover:text-[#332821] p-0.5 rounded-full"
                aria-label="Fermer la notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    return {
      success: () => {},
      error: () => {},
      info: () => {},
    }
  }
  return ctx
}
