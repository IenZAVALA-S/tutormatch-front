import { useCallback, useEffect, useRef, useState } from 'react'

export interface Toast {
  id: number
  texto: string
  tono: 'info' | 'error'
}

/** Lista de toasts con autocierre. */
export function useToasts(duracionMs = 6000) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const siguiente = useRef(1)

  const cerrar = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const mostrar = useCallback(
    (texto: string, tono: Toast['tono'] = 'info') => {
      const id = siguiente.current++
      setToasts((t) => [...t, { id, texto, tono }])
      setTimeout(() => cerrar(id), duracionMs)
    },
    [cerrar, duracionMs],
  )

  return { toasts, mostrar, cerrar }
}

/** Toasts abajo a la izquierda. */
export function Toasts({ toasts, alCerrar }: { toasts: Toast[]; alCerrar: (id: number) => void }) {
  return (
    <div aria-live="polite" className="fixed bottom-4 left-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} alCerrar={alCerrar} />
      ))}
    </div>
  )
}

function ToastItem({ toast, alCerrar }: { toast: Toast; alCerrar: (id: number) => void }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const estilo =
    toast.tono === 'error'
      ? 'border-marca-300 bg-marca-50 text-marca-900 dark:border-marca-700 dark:bg-marca-900 dark:text-marca-50'
      : 'border-acento-200 bg-superficie text-texto dark:border-acento-700'

  return (
    <div
      role={toast.tono === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-xl border p-4 text-sm shadow-xl transition duration-300 ease-out ${estilo} ${
        visible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
      }`}
    >
      <span
        aria-hidden
        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${toast.tono === 'error' ? 'bg-marca-500' : 'bg-acento-500'}`}
      />
      <p className="flex-1">{toast.texto}</p>
      <button
        type="button"
        onClick={() => alCerrar(toast.id)}
        aria-label="Cerrar"
        className="-m-1 rounded p-1 text-texto-suave hover:text-texto"
      >
        ✕
      </button>
    </div>
  )
}
