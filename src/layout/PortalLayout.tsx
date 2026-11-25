import { Outlet } from 'react-router-dom'
import type { Portal } from '../auth/sesion'
import { Topbar } from './Topbar'

export function PortalLayout({ portal }: { portal: Portal }) {
  return (
    <div className="min-h-screen">
      <Topbar portal={portal} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
