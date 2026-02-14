import { create } from 'zustand'

interface Venue {
  id: string
  name: string
  category: string
  latitude: number
  longitude: number
  address?: string
  photos?: string[]
  onChainId?: string
}

interface VenueState {
  venues: Venue[]
  selectedVenue: Venue | null
  setVenues: (venues: Venue[]) => void
  setSelectedVenue: (venue: Venue | null) => void
  fetchVenues: (lat: number, lng: number) => Promise<void>
}

export const useVenueStore = create<VenueState>((set) => ({
  venues: [],
  selectedVenue: null,
  setVenues: (venues) => set({ venues }),
  setSelectedVenue: (venue) => set({ selectedVenue: venue }),
  fetchVenues: async (lat, lng) => {
    console.log(`[Store] Fetching venues near: ${lat}, ${lng}...`);
    const SAMPLE_VENUES = [
      { id: 'local-1', name: 'Kopi Kenangan Panakkukang', category: 'Café', latitude: -5.1476, longitude: 119.4173, address: 'Jl. Boulevard, Makassar', photos: [], totalCheckIns: 47 },
      { id: 'local-2', name: 'Warung Coto Nusantara', category: 'Restaurant', latitude: -5.1480, longitude: 119.4165, address: 'Jl. Pettarani', photos: [], totalCheckIns: 23 }
    ];

    try {
      const response = await fetch(`/api/venues/nearby?lat=${lat}&lng=${lng}`);
      console.log('[Store] Fetch response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          console.log(`[Store] Venues fetched: ${data.length} items`);
          set({ venues: data });
          return;
        }
        console.warn('[Store] venues response not array, using SAMPLE_VENUES', data);
        set({ venues: SAMPLE_VENUES });
        return;
      } else {
        console.error('[Store] Fetch failed, using SAMPLE_VENUES:', await response.text());
        set({ venues: SAMPLE_VENUES });
      }
    } catch (e) {
      console.error('[Store] Network error fetching venues, using SAMPLE_VENUES:', e);
      set({ venues: SAMPLE_VENUES });
    }
  }
}))
