import { useVenueStore } from '../store/useVenueStore';
import { Camera, MapPin, X } from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import { useState } from 'react';
import { CheckInModal } from './CheckInModal';
import { useCollectionStore } from '../store/useCollectionStore';
import type { Stamp } from '../store/useCollectionStore';

export const VenueSheet = ({ venue }: { venue: any }) => {
  const { setSelectedVenue } = useVenueStore();
  const [showCheckIn, setShowCheckIn] = useState(false);

  const handleCheckIn = () => {
    WebApp.HapticFeedback.impactOccurred('medium');
    setShowCheckIn(true);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-3xl shadow-2xl z-30 p-6 transform transition-transform animate-in slide-in-from-bottom duration-300 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1 block">{venue.category}</span>
          <h2 className="text-2xl font-bold">{venue.name}</h2>
          <div className="flex items-center gap-1 text-zinc-500 text-sm mt-1">
            <MapPin size={14} />
            <span>{venue.address || 'Address not available'}</span>
          </div>
        </div>
        <button 
          onClick={() => setSelectedVenue(null)}
          className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200"
        >
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl text-center">
          <div className="text-xl font-bold">128</div>
          <div className="text-[10px] text-zinc-500 uppercase font-semibold">Stamps</div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl text-center">
          <div className="text-xl font-bold">4.8</div>
          <div className="text-[10px] text-zinc-500 uppercase font-semibold">Rating</div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl text-center">
          <div className="text-xl font-bold">#2</div>
          <div className="text-[10px] text-zinc-500 uppercase font-semibold">Trending</div>
        </div>
      </div>

      <button 
        onClick={handleCheckIn}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
      >
        <Camera size={20} />
        Check In & Mint Stamp
      </button>

      {showCheckIn && (
        <CheckInModal venue={venue} onClose={() => setShowCheckIn(false)} onSuccess={(res) => {
          // Add to local collection store (works offline / mock too)
          const add = useCollectionStore.getState().addStamp;
          const stamp: Stamp = {
            id: String(res?.checkIn?.id || res?.stampNftId || `local-${Date.now()}`),
            venueName: venue.name,
            photoUrl: (res?.checkIn?.photoUrl || res?.photoUrl) || 'https://vibemap.app/default-stamp.png',
            caption: String(res?.checkIn?.caption || 'Visited!'),
            rating: Number(res?.checkIn?.rating || 5),
            timestamp: new Date().toISOString(),
            rarity: 'SILVER',
            nftId: res?.stampNftId || res?.checkIn?.stampNftId || undefined
          };

          add(stamp);
          console.log('Check-in success (added to local collection):', stamp);
        }} />
      )}
    </div>
  );
};
