import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Film, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export function AppShell() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-50">
      <header className="sticky top-0 z-20 flex h-14 items-center border-b border-gray-100 bg-white/95 backdrop-blur px-4">
        <Link to="/trips" className="flex items-center gap-2 font-semibold text-gray-900">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
            <Film className="h-4 w-4 text-white" />
          </div>
          ReelTrip
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {user?.email && (
            <span className="hidden sm:inline text-xs text-gray-500 truncate max-w-[180px]">
              {user.email}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={handleSignOut} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
