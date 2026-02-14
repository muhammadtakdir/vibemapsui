import { useVenueStore } from '../store/useVenueStore';
import { Camera, MapPin, X } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

export const VenueSheet = ({ venue }: { venue: any }) => {
  const { setSelectedVenue } = useVenueStore();

  const handleCheckIn = () => {
    WebApp.HapticFeedback.impactOccurred('medium');
    // Proceed to check-in camera or flow
    console.log('Checking in at', venue.name);
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
    </div>
  );
};
