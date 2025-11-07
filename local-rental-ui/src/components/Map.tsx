import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import type { Property } from '../services/api';

interface MapProps {
  properties: Property[];
  selectedProperty: Property | null;
  onPropertySelect: (property: Property | null) => void;
}

export default function Map({ properties, selectedProperty, onPropertySelect }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      },
      center: [-8.6291, 39.6943], // Portugal center
      zoom: 6,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers when properties change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    properties.forEach((property) => {
      if (!property.latitude || !property.longitude) return;

      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '12px';
      el.style.height = '12px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = selectedProperty?.id === property.id ? '#ef4444' : '#3b82f6';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onPropertySelect(property);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all properties
    if (properties.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      properties.forEach((property) => {
        if (property.latitude && property.longitude) {
          bounds.extend([property.longitude, property.latitude]);
        }
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [properties, selectedProperty, mapLoaded, onPropertySelect]);

  // Fly to selected property
  useEffect(() => {
    if (!map.current || !selectedProperty || !selectedProperty.latitude || !selectedProperty.longitude) return;

    map.current.flyTo({
      center: [selectedProperty.longitude, selectedProperty.latitude],
      zoom: 14,
      duration: 1000,
    });
  }, [selectedProperty]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
