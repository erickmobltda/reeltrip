import { useEffect, useRef } from 'react'
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { AppShell } from '@/components/layout/AppShell'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { TripsPage } from '@/pages/TripsPage'
import { TripFormPage } from '@/pages/TripFormPage'
import { TripDetailPage } from '@/pages/TripDetailPage'
import { PoiDetailPage } from '@/pages/PoiDetailPage'
import { Spinner } from '@/components/ui/spinner'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

// Handles Supabase magic-link redirects that land on the base URL with #access_token=...
function CatchAll() {
  const navigate = useNavigate()
  const hasAuthToken = window.location.hash.includes('access_token=')
  const handled = useRef(false)

  useEffect(() => {
    if (!hasAuthToken) {
      navigate('/', { replace: true })
      return
    }

    const timeout = setTimeout(() => {
      if (!handled.current) navigate('/login', { replace: true })
    }, 8000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && !handled.current) {
        handled.current = true
        clearTimeout(timeout)
        navigate('/trips', { replace: true })
      }
    })

    supabase.auth.getSession().then(({ data }) => {
      if (data.session && !handled.current) {
        handled.current = true
        clearTimeout(timeout)
        navigate('/trips', { replace: true })
      }
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [hasAuthToken, navigate])

  if (!hasAuthToken) return null

  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/trips/new" element={<TripFormPage />} />
          <Route path="/trips/:id" element={<TripDetailPage />} />
          <Route path="/trips/:id/edit" element={<TripFormPage />} />
          <Route path="/trips/:tripId/pois/:poiId" element={<PoiDetailPage />} />
        </Route>
        <Route path="*" element={<CatchAll />} />
      </Routes>
    </HashRouter>
  )
}
