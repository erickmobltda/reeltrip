import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Film } from 'lucide-react'
import { EmailPasswordForm } from '@/components/auth/EmailPasswordForm'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { DEMO_EMAIL, DEMO_PASSWORD } from '@/lib/firebase'

export function LoginPage() {
  const { user, loading, signInWithPassword } = useAuth()
  const navigate = useNavigate()
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoError, setDemoError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && user) navigate('/trips')
  }, [user, loading, navigate])

  async function tryDemo() {
    setDemoLoading(true)
    setDemoError(null)
    try {
      await signInWithPassword(DEMO_EMAIL, DEMO_PASSWORD)
      navigate('/trips')
    } catch (err) {
      setDemoError(err instanceof Error ? err.message : 'Could not open the demo')
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 shadow-lg">
            <Film className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to ReelTrip</h1>
          <p className="mt-1.5 text-gray-500 text-sm">Paste reels in, get organized trips out.</p>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-xl p-8">
          <h2 className="mb-1 text-lg font-semibold text-gray-900">Sign in</h2>
          <p className="mb-6 text-sm text-gray-500">With email & password.</p>
          <EmailPasswordForm />

          <div className="mt-6 border-t border-gray-100 pt-6">
            <Button variant="outline" className="w-full" onClick={tryDemo} disabled={demoLoading}>
              {demoLoading ? 'Opening the demo...' : 'Try the demo'}
            </Button>
            <p className="mt-2 text-center text-xs text-gray-500">
              Explore sample trips — no sign-up needed.
            </p>
            {demoError && (
              <p className="mt-2 rounded-md bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
                {demoError}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
