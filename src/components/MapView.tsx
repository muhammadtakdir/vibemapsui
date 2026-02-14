import { MapContainer, TileLayer, Marker, useMap, ZoomControl, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useVenueStore } from '../store/useVenueStore';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix for default marker icon in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper to update map center
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export const MapView = () => {
  const { venues, setSelectedVenue, fetchVenues } = useVenueStore();
  // Default to Makassar, Indonesia
  const [center, setCenter] = useState<[number, number]>([-5.1476, 119.4173]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const locateAndFetch = (opts?: PositionOptions) => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by this browser');
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPos: [number, number] = [latitude, longitude];
        setCenter(newPos);
        setUserLocation(newPos);
        fetchVenues(latitude, longitude);
        setLocating(false);
      },
      (error) => {
        console.error('Error getting location', error);
        setLocationError(error.message || 'Failed to get location');
        // Fallback fetch for default location
        fetchVenues(-5.1476, 119.4173);
        setLocating(false);
      },
      opts
    );
  };

  useEffect(() => {
    // Try to auto-locate on mount (high accuracy not requested by default)
    locateAndFetch();
  }, [fetchVenues]);

  return (
    <div className="w-full h-full relative z-0">
      {/* Locate button (top-right) */}
      <div className="absolute top-4 right-4 z-40 pointer-events-auto">
        <button
          onClick={() => locateAndFetch({ enableHighAccuracy: true, maximumAge: 0, timeout: 10000 })}
          title={locating ? 'Mencari lokasi...' : 'Lokasi saya'}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-lg"
        >
          {locating ? (
            <div className="w-5 h-5 border-2 border-t-blue-600 rounded-full animate-spin" />
          ) : (
            <MapPin size={16} />
          )}
          <span className="text-xs">Lokasi saya</span>
        </button>
        {locationError && <div className="mt-2 text-xs text-red-500 bg-white/90 dark:bg-zinc-900/90 p-2 rounded">{locationError}</div>}
      </div>

      <MapContainer 
        center={center} 
        zoom={15} 
        style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ChangeView center={center} />

        {/* User Location Marker */}
        {userLocation && (
          <Circle 
            center={userLocation} 
            radius={50} 
            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.12 }}
          />
        )}
        {userLocation && (
          <Circle 
            center={userLocation} 
            radius={6} 
            pathOptions={{ color: 'white', fillColor: '#1e90ff', fillOpacity: 1, weight: 2 }}
          />
        )}

        {venues.map((venue) => (
          <Marker 
            key={venue.id} 
            position={[venue.latitude, venue.longitude]}
            eventHandlers={{
              click: () => {
                setSelectedVenue(venue);
              },
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
};
