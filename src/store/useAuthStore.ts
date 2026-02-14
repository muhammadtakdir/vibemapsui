import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null; // Replace with proper User type
  login: (user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false, // Default to false
  user: null,
  login: (user) => set({ isAuthenticated: true, user }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));
