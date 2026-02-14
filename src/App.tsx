import { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import { MapView } from './components/MapView'
import { VenueSheet } from './components/VenueSheet'
import { useVenueStore } from './store/useVenueStore'

function App() {
  const { selectedVenue } = useVenueStore()

  useEffect(() => {
    WebApp.ready()
    WebApp.expand()
    
    // Set theme colors
    document.documentElement.className = WebApp.colorScheme
  }, [])

  return (
    <div className="h-screen w-full relative overflow-hidden bg-background text-foreground">
      <header className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center pointer-events-none">
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg pointer-events-auto">
          <h1 className="font-bold text-lg">VibeMap</h1>
        </div>
      </header>

      <main className="h-full w-full absolute top-0 left-0 bottom-0 right-0 z-0">
        <MapView />
      </main>

      {selectedVenue && <VenueSheet venue={selectedVenue} />}
      
      {/* Navigation Bar */}
      <nav className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-black/90 backdrop-blur-xl px-6 py-3 rounded-full shadow-2xl z-20 flex gap-8 items-center border border-white/20">
        <button className="text-primary hover:scale-110 transition-transform">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </button>
        <button className="text-muted-foreground hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
        </button>
        <button className="text-muted-foreground hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
      </nav>
    </div>
  )
}

export default App
