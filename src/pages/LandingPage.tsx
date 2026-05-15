import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Film, MapPin, FolderOpen, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export function LandingPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) navigate('/trips')
  }, [user, loading, navigate])

  const features = [
    { icon: Film, title: 'Paste any reel', desc: 'Instagram, YouTube, or TikTok — drop the link and we do the rest.', color: 'bg-orange-50 text-orange-600' },
    { icon: Sparkles, title: 'AI-structured notes', desc: 'Highlights, costs, food tips, links — extracted from the video for you.', color: 'bg-fuchsia-50 text-fuchsia-600' },
    { icon: MapPin, title: 'Organize by trip', desc: 'Group POIs by trip and category so you find them later.', color: 'bg-sky-50 text-sky-600' },
    { icon: FolderOpen, title: 'Reuse past finds', desc: 'Going back to a country? Import POIs from previous trips with one click.', color: 'bg-emerald-50 text-emerald-600' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-20 flex h-14 items-center border-b border-gray-100 bg-white/95 backdrop-blur px-4 lg:px-8">
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
            <Film className="h-4 w-4 text-white" />
          </div>
          ReelTrip
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign in</Button>
          <Button size="sm" onClick={() => navigate('/login')}>Get started</Button>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-orange-50 via-amber-50 to-teal-50 px-4 py-20 text-center lg:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-50 border border-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
            <Film className="h-3.5 w-3.5" />
            Travel reels, organized
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl text-balance">
            Turn every reel into a<br />
            <span className="text-primary-600">trip you can actually use.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-gray-600 text-balance">
            Paste a video link. Get a clean, structured travel note — saved next to every other place you want to go.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => navigate('/login')}>Start for free</Button>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">
            Built for the way you actually plan travel
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="mt-1.5 text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-gray-50 px-4 py-6 text-center text-xs text-gray-400">
        <p>© {new Date().getFullYear()} ReelTrip</p>
      </footer>
    </div>
  )
}
