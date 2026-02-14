import { create } from 'zustand'

export interface Stamp {
  id: string
  venueName: string
  photoUrl: string
  caption?: string
  rating?: number
  timestamp: string
  rarity?: 'GOLD' | 'SILVER' | 'BRONZE'
  nftId?: string
}

interface CollectionState {
  stamps: Stamp[]
  addStamp: (s: Stamp) => void
  load: () => void
  clear: () => void
}

const STORAGE_KEY = 'vibemap_collection_v1'

export const useCollectionStore = create<CollectionState>((set, get) => ({
  stamps: [],
  addStamp: (s) => {
    const newStamps = [s, ...get().stamps]
    set({ stamps: newStamps })
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newStamps)) } catch (e) { /* ignore */ }
  },
  load: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) set({ stamps: JSON.parse(raw) })
    } catch (e) { console.error('Failed to load collection', e) }
  },
  clear: () => {
    set({ stamps: [] })
    try { localStorage.removeItem(STORAGE_KEY) } catch (e) {}
  }
}))
