import type { ReactNode } from 'react'

/** Contenedor centrado para login, registro e inscripción como tutor. */
export function LayoutPublico({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2 font-semibold text-indigo-700">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-indigo-600 text-sm text-white">TM</span>
          TutorMatch
        </div>
        {children}
      </div>
    </div>
  )
}
