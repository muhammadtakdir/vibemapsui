import { MapContainer, TileLayer, Marker, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useVenueStore } from '../store/useVenueStore';
import { useEffect } from 'react';
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
  const { venues, setSelectedVenue } = useVenueStore();
  // Default to Makassar, Indonesia
  const defaultCenter: [number, number] = [-5.1476, 119.4173];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ChangeView center={defaultCenter} />

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
