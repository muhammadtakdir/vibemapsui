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
}

export const useVenueStore = create<VenueState>((set) => ({
  venues: [],
  selectedVenue: null,
  setVenues: (venues) => set({ venues }),
  setSelectedVenue: (venue) => set({ selectedVenue: venue }),
}))
