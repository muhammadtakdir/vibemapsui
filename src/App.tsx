import { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import { MapView } from './components/MapView'
import { VenueSheet } from './components/VenueSheet'
import { LoginScreen } from './components/LoginScreen'
import { useVenueStore } from './store/useVenueStore'
import { useAuthStore } from './store/useAuthStore'
import { jwtDecode } from 'jwt-decode'
import { Home, User, Info } from 'lucide-react'

function App() {
  const { selectedVenue } = useVenueStore()
  const { isAuthenticated, login } = useAuthStore()

  useEffect(() => {
    // Check for zkLogin callback in URL
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const idToken = params.get('id_token');

    if (idToken) {
      try {
        const decoded: any = jwtDecode(idToken);
        login(decoded);
        window.history.replaceState(null, '', window.location.pathname);
      } catch (e) {
        console.error('Invalid token', e);
      }
    }

    WebApp.ready()
    WebApp.expand()
    // Default to dark if not set
    document.documentElement.className = WebApp.colorScheme || 'dark'
  }, [login])

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="h-screen w-full relative overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Map Background */}
      <main className="absolute inset-0 z-0">
        <MapView />
      </main>

      {/* Header Overlay */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4 pointer-events-none">
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg pointer-events-auto border border-zinc-200 dark:border-zinc-800 w-fit mx-auto">
          <h1 className="font-bold text-lg tracking-tight text-blue-600 dark:text-blue-400">VibeMap</h1>
        </div>
      </header>

      {selectedVenue && <VenueSheet venue={selectedVenue} />}
      
      {/* Navigation Bar */}
      <nav className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-4 items-center pointer-events-none">
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl px-8 py-4 rounded-full shadow-2xl flex gap-10 items-center border border-zinc-200 dark:border-zinc-800 pointer-events-auto">
          <button className="text-blue-600 dark:text-blue-400 transition-all active:scale-75">
            <Home size={28} strokeWidth={2.5} />
          </button>
          <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all active:scale-75">
            <Info size={28} strokeWidth={2.5} />
          </button>
          <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all active:scale-75">
            <User size={28} strokeWidth={2.5} />
          </button>
        </div>
      </nav>
    </div>
  )
}

export default App
