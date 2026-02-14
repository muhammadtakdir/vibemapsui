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
    try {
      const response = await fetch(`/api/venues/nearby?lat=${lat}&lng=${lng}`);
      if (response.ok) {
        const data = await response.json();
        set({ venues: data });
      }
    } catch (e) {
      console.error('Failed to fetch venues', e);
    }
  }
}))
