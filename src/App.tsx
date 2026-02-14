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
        console.log('User logged in (Frontend):', decoded);
        
        // 1. Optimistic Login: Update UI immediately
        // Use decoded data temporarily until backend returns full user object
        const optimisticUser = {
          email: decoded.email,
          username: decoded.name || decoded.given_name || decoded.email.split('@')[0], 
          avatarUrl: decoded.picture || decoded.photo || decoded.avatar,
          walletAddress: '0xe087a0ab3b923216b1792aa6343efa5b6bdd90c7c684741e047c3b9b5629e077', 
          ...decoded
        };
        
        console.log('[Auth] Optimistic Login Data:', optimisticUser);
        login(optimisticUser);

        // 2. Sync with Supabase Backend (Background)
        fetch('/api/auth/google', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${decoded.email}` // Send email as identification
          },
          body: JSON.stringify({
            email: decoded.email,
            username: decoded.name,
            avatarUrl: decoded.picture,
            walletAddress: optimisticUser.walletAddress,
          })
        })
        .then(res => {
            if (!res.ok) throw new Error('Backend sync failed');
            return res.json();
        })
        .then(data => {
          console.log('Backend Sync Success:', data.user);
          // 3. Update with real data from DB (e.g. real wallet address if exists)
          login(data.user);
        })
        .catch(err => {
            console.error('Backend Sync Error:', err);
            // User stays logged in even if backend sync fails
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
    console.log('[UI] Drop Vibe button clicked');
    if (!navigator.geolocation) {
      console.error('[Geolocation] Not supported by this browser');
      alert("Geolocation not supported");
      return;
    }

    WebApp.HapticFeedback.impactOccurred('heavy');

    console.log('[Geolocation] Requesting current position...');
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      console.log(`[Geolocation] Position found: ${latitude}, ${longitude}`);
      
      try {
        console.log('[Backend] Sending /api/check-ins/sponsor request...');
        const response = await fetch('/api/check-ins/sponsor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${isAuthenticated ? (isAuthenticated as any).sub : ''}` 
          },
          body: JSON.stringify({
            venueId: '1', 
            latitude,
            longitude,
            caption: 'Dropped a Vibe!',
            imageUrl: 'https://vibemap.app/default-stamp.png',
            rating: 5
          })
        });

        console.log('[Backend] Response status:', response.status);
        if (response.ok) {
          const result = await response.json();
          console.log('[Backend] Vibe Drop Success:', result);
          alert(`Success! Vibe dropped at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } else {
          const err = await response.json();
          console.error('[Backend] Vibe Drop Failed:', err);
          alert("Failed to drop Vibe: " + (err.error || "Unknown error"));
        }
      } catch (e) {
        console.error('[Network] Fetch error during Vibe Drop:', e);
        alert("Network error occurred");
      }
    }, (error) => {
        console.error('[Geolocation] Error getting position:', error.message);
        alert('Gagal mendapatkan lokasi: ' + error.message);
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

      {/* Header Overlay - User Profile */}
      <header className="absolute top-4 left-4 right-4 z-30 flex justify-between items-center pointer-events-none">
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-2 pr-4 rounded-full shadow-lg pointer-events-auto border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          {isAuthenticated && useAuthStore.getState().user?.avatarUrl ? (
            <img 
              src={useAuthStore.getState().user.avatarUrl} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border-2 border-blue-500"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {useAuthStore.getState().user?.username?.charAt(0) || 'U'}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 leading-tight">
              {useAuthStore.getState().user?.username || 'Vibe Explorer'}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {useAuthStore.getState().user?.walletAddress?.slice(0, 6)}...{useAuthStore.getState().user?.walletAddress?.slice(-4)}
            </span>
          </div>
        </div>
        
        {/* Settings/Points Badge */}
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-2 rounded-full shadow-lg pointer-events-auto border border-zinc-200 dark:border-zinc-800 flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-bold">Online</span>
        </div>
      </header>

      {selectedVenue && <VenueSheet venue={selectedVenue} />}
      
      {/* Navigation Bar */}
      <nav className="absolute bottom-8 left-0 right-0 z-30 flex justify-center pointer-events-auto">
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl px-8 py-4 rounded-full shadow-2xl flex gap-10 items-center border border-zinc-200 dark:border-zinc-800">
          <button 
            onClick={() => console.log('Home Clicked')}
            className="text-blue-600 dark:text-blue-400 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all active:scale-90"
          >
            <Home size={28} strokeWidth={2.5} />
          </button>
          
          <button 
            onClick={() => console.log('Info Clicked')}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all active:scale-90"
          >
            <Info size={28} strokeWidth={2.5} />
          </button>

          {/* Large Drop Vibe Button */}
          <button 
            onClick={handleVibeDrop}
            className="bg-blue-600 dark:bg-blue-500 text-white p-5 rounded-full shadow-lg shadow-blue-500/40 -mt-12 border-4 border-white dark:border-zinc-900 transition-all active:scale-75 flex items-center justify-center relative cursor-pointer"
          >
            <div className="absolute animate-ping w-full h-full rounded-full bg-blue-400 opacity-20"></div>
            <MapPin size={32} fill="white" />
          </button>

          <button 
            onClick={() => console.log('Profile Clicked')}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all active:scale-90"
          >
            <User size={28} strokeWidth={2.5} />
          </button>
        </div>
      </nav>
    </div>
  )
}

export default App
