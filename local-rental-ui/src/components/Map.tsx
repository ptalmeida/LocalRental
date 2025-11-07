import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import type { Property } from '../services/api';
import { theme } from '../theme';

interface MapProps {
  properties: Property[];
  selectedProperty: Property | null;
  onPropertySelect: (property: Property | null) => void;
  onSearchHere?: (bounds: { min_lat: number; max_lat: number; min_lng: number; max_lng: number }) => void;
}

export default function Map({ properties, selectedProperty, onPropertySelect, onSearchHere }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  const handleSearchHere = () => {
    if (!map.current || !onSearchHere) return;

    const bounds = map.current.getBounds();
    onSearchHere({
      min_lat: bounds.getSouth(),
      max_lat: bounds.getNorth(),
      min_lng: bounds.getWest(),
      max_lng: bounds.getEast(),
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'satellite': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          },
          'labels': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: '',
          },
        },
        layers: [
          {
            id: 'satellite',
            type: 'raster',
            source: 'satellite',
          },
          {
            id: 'labels',
            type: 'raster',
            source: 'labels',
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
      el.style.width = '16px';
      el.style.height = '16px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = selectedProperty?.id === property.id ? '#ef4444' : '#0f2f7f';
      el.style.border = '3px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = selectedProperty?.id === property.id
        ? '0 0 0 3px rgba(239, 68, 68, 0.3), 0 4px 12px rgba(0,0,0,0.5)'
        : '0 0 0 2px rgba(15, 47, 127, 0.3), 0 3px 8px rgba(0,0,0,0.4)';
      // Only transition visual properties, not position
      el.style.transition = 'background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out';

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onPropertySelect(property);
      });

      markersRef.current.push(marker);
    });
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

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Search Here Button */}
      {onSearchHere && (
        <button
          onClick={handleSearchHere}
          style={{
            position: 'absolute',
            top: theme.spacing.md,
            left: theme.spacing.md,
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            backgroundColor: theme.colors.white,
            color: theme.colors.navy,
            border: `2px solid ${theme.colors.navy}`,
            borderRadius: theme.borderRadius.sm,
            fontFamily: theme.typography.fontHeading,
            fontSize: theme.typography.sizeSm,
            fontWeight: theme.typography.weightBold,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: theme.transitions.fast,
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
            zIndex: 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.navy;
            e.currentTarget.style.color = theme.colors.white;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.white;
            e.currentTarget.style.color = theme.colors.navy;
          }}
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search Here
        </button>
      )}
    </div>
  );
}
