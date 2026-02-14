import { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import { MapView } from './components/MapView'
import { VenueSheet } from './components/VenueSheet'
import { LoginScreen } from './components/LoginScreen'
import { useVenueStore } from './store/useVenueStore'
import { useAuthStore } from './store/useAuthStore'
import { jwtDecode } from 'jwt-decode'
import { Home, User, Info, MapPin } from 'lucide-react'

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
        console.log('User logged in:', decoded);
        
        // Sync with Supabase Backend
        fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: decoded.email,
            username: decoded.name,
            avatarUrl: decoded.picture,
            walletAddress: '0xe087a0ab3b923216b1792aa6343efa5b6bdd90c7c684741e047c3b9b5629e077', // Placeholder
          })
        }).then(res => res.json()).then(data => {
          login(data.user);
        });

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

  const handleVibeDrop = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    WebApp.HapticFeedback.impactOccurred('heavy');

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      
      try {
        const response = await fetch('/api/check-ins/sponsor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${isAuthenticated ? (isAuthenticated as any).sub : ''}` // Using JWT sub as placeholder for ID
          },
          body: JSON.stringify({
            venueId: '1', // Placeholder for now, should use nearest venue
            latitude,
            longitude,
            caption: 'Dropped a Vibe!',
            imageUrl: 'https://vibemap.app/default-stamp.png',
            rating: 5
          })
        });

        if (response.ok) {
          alert(`Success! Vibe dropped at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } else {
          const err = await response.json();
          console.error(err);
          alert("Failed to drop Vibe: " + (err.error || "Unknown error"));
        }
      } catch (e) {
        console.error(e);
        alert("Network error occurred");
      }
    });
  };

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="h-screen w-full relative overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* ... previous code ... */}
      <main className="absolute inset-0 z-0">
        <MapView />
      </main>

      {/* Header Overlay */}
      <header className="absolute top-4 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg pointer-events-auto border border-zinc-200 dark:border-zinc-800">
          <h1 className="font-bold text-lg tracking-tight text-blue-600 dark:text-blue-400">VibeMap</h1>
        </div>
      </header>

      {selectedVenue && <VenueSheet venue={selectedVenue} />}
      
      {/* Navigation Bar */}
      <nav className="absolute bottom-8 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl px-8 py-4 rounded-full shadow-2xl flex gap-10 items-center border border-zinc-200 dark:border-zinc-800 pointer-events-auto">
          <button 
            onClick={() => console.log('Home clicked')}
            className="text-blue-600 dark:text-blue-400 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all active:scale-90"
          >
            <Home size={28} strokeWidth={2.5} />
          </button>
          
          <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all active:scale-90">
            <Info size={28} strokeWidth={2.5} />
          </button>

          {/* Large Drop Vibe Button */}
          <button 
            onClick={handleVibeDrop}
            className="bg-blue-600 dark:bg-blue-500 text-white p-5 rounded-full shadow-lg shadow-blue-500/40 -mt-12 border-4 border-white dark:border-zinc-900 transition-all active:scale-75 flex items-center justify-center relative"
          >
            <div className="absolute animate-ping w-full h-full rounded-full bg-blue-400 opacity-20"></div>
            <MapPin size={32} fill="white" />
          </button>

          <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all active:scale-90">
            <User size={28} strokeWidth={2.5} />
          </button>
        </div>
      </nav>
    </div>
  )
}

export default App
