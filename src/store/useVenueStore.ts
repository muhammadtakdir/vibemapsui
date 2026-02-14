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
  venues: [
    {
      id: '1',
      name: 'Pantai Losari',
      category: 'Landmark',
      latitude: -5.1425,
      longitude: 119.4075,
      address: 'Jl. Penghibur, Makassar',
    },
    {
      id: '2',
      name: 'Fort Rotterdam',
      category: 'Museum',
      latitude: -5.1337,
      longitude: 119.4031,
      address: 'Jl. Ujung Pandang, Makassar',
    },
    {
      id: '3',
      name: 'Trans Studio Mall',
      category: 'Mall',
      latitude: -5.1583,
      longitude: 119.3944,
      address: 'Jl. Metro Tanjung Bunga',
    }
  ],
  selectedVenue: null,
  setVenues: (venues) => set({ venues }),
  setSelectedVenue: (venue) => set({ selectedVenue: venue }),
}))
