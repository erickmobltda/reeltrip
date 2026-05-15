import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Film } from 'lucide-react'
import { EmailPasswordForm } from '@/components/auth/EmailPasswordForm'
import { MagicLinkForm } from '@/components/auth/MagicLinkForm'
import { useAuth } from '@/hooks/useAuth'

export function LoginPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [useMagicLink, setUseMagicLink] = useState(false)

  useEffect(() => {
    if (!loading && user) navigate('/trips')
  }, [user, loading, navigate])

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
          {useMagicLink ? (
            <>
              <h2 className="mb-1 text-lg font-semibold text-gray-900">Sign in with a link</h2>
              <p className="mb-6 text-sm text-gray-500">We&apos;ll email you a one-click sign-in link.</p>
              <MagicLinkForm />
            </>
          ) : (
            <>
              <h2 className="mb-1 text-lg font-semibold text-gray-900">Sign in</h2>
              <p className="mb-6 text-sm text-gray-500">With email & password.</p>
              <EmailPasswordForm />
            </>
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={() => setUseMagicLink((v) => !v)}
            className="mt-4 w-full text-sm text-primary-600 hover:underline"
          >
            {useMagicLink ? 'Use password instead' : 'Use a magic link instead'}
          </button>
        </div>
      </div>
    </div>
  )
}
