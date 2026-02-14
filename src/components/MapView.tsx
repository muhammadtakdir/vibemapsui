import { MapContainer, TileLayer, Marker, useMap, ZoomControl, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useVenueStore } from '../store/useVenueStore';
import { useEffect, useState } from 'react';
import L from 'leaflet';

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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPos: [number, number] = [latitude, longitude];
          setCenter(newPos);
          setUserLocation(newPos);
          fetchVenues(latitude, longitude); // Fetch real venues nearby
        },
        (error) => {
          console.error("Error getting location", error);
          // Fallback fetch for default location
          fetchVenues(-5.1476, 119.4173);
        }
      );
    } else {
       fetchVenues(-5.1476, 119.4173);
    }
  }, [fetchVenues]);

  return (
    <div className="w-full h-full relative z-0">
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
            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
          />
        )}
        {userLocation && (
          <Circle 
            center={userLocation} 
            radius={5} 
            pathOptions={{ color: 'white', fillColor: 'blue', fillOpacity: 1, weight: 2 }}
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
