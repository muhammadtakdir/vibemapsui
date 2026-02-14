import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useVenueStore } from '../store/useVenueStore';

// Access token should ideally come from env
mapboxgl.accessToken = 'pk.eyJ1IjoicGxhY2Vob2xkZXIiLCJhIjoiY2x4eHh4eHh4eHh4eHh4eHh4eHh4In0.xxxxxxxxxxxxxx';

export const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { venues, setSelectedVenue } = useVenueStore();

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [119.4173, -5.1476], // Makassar
      zoom: 13,
    });

    map.current.on('load', () => {
      // Add markers when map is loaded
      venues.forEach((venue) => {
        const marker = new mapboxgl.Marker({ color: '#3b82f6' })
          .setLngLat([venue.longitude, venue.latitude])
          .addTo(map.current!);

        marker.getElement().addEventListener('click', () => {
          setSelectedVenue(venue);
        });
      });
    });
  }, [venues, setSelectedVenue]);

  return <div ref={mapContainer} className="h-full w-full" />;
};
