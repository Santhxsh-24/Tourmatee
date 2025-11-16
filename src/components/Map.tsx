import React, { useEffect, useRef } from 'react';
import { loadGoogleMaps } from '../lib/googleMapsLoader';

export interface MapMarker {
  id: string;
  position: google.maps.LatLngLiteral;
  title?: string;
  onClick?: () => void;
}

interface MapProps {
  center: google.maps.LatLngLiteral;
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
}

const Map: React.FC<MapProps> = ({ center, zoom = 13, markers = [], className }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Record<string, any>>({});

  useEffect(() => {
    let isMounted = true;
    loadGoogleMaps().then(async (g) => {
      if (!isMounted || !ref.current) return;
      const hasImport = typeof (g.maps as any).importLibrary === 'function';
      const mapId = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_GOOGLE_MAP_ID) as string | undefined;

      // Prefer legacy constructor for compatibility
      const MapCtor = (g.maps as any).Map as (typeof google.maps.Map | undefined);
      if (!MapCtor) {
        // Fallback: try importLibrary to obtain Map class
        try {
          if (hasImport) {
            const lib = await ((g.maps as any).importLibrary('maps') as Promise<{ Map?: typeof google.maps.Map }>);
            const ImportedMap = (lib as any).Map as (typeof google.maps.Map | undefined);
            if (!ImportedMap) {
              console.error('Google Maps Map class unavailable');
              return;
            }
            if (!mapRef.current) {
              mapRef.current = new ImportedMap(ref.current, {
                center,
                zoom,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                ...(mapId ? { mapId } : {}),
              });
            }
          } else {
            console.error('Google Maps Map constructor not found');
            return;
          }
        } catch (e) {
          console.error('Failed to initialize Google Map:', e);
          return;
        }
      }

      if (!mapRef.current && MapCtor) {
        mapRef.current = new MapCtor(ref.current, {
          center,
          zoom,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          ...(mapId ? { mapId } : {}),
        });
      } else if (mapRef.current) {
        mapRef.current.setCenter(center);
        mapRef.current.setZoom(zoom);
      }

      // Update markers
      const existing = markersRef.current;
      const nextIds = new Set(markers.map(m => m.id));
      // Remove old
      Object.keys(existing).forEach(id => {
        if (!nextIds.has(id)) {
          existing[id].setMap(null);
          delete existing[id];
        }
      });
      // Add/update
      // Load marker library when available; otherwise fallback to classic Marker
      let AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement | undefined;
      if (hasImport) {
        const lib = await ((g.maps as any).importLibrary('marker') as Promise<{ AdvancedMarkerElement?: typeof google.maps.marker.AdvancedMarkerElement }>);
        AdvancedMarkerElement = (lib as any).AdvancedMarkerElement;
      } else {
        AdvancedMarkerElement = (g.maps as any).marker?.AdvancedMarkerElement as typeof google.maps.marker.AdvancedMarkerElement;
      }

      markers.forEach(m => {
        const current = existing[m.id];
        if (!current) {
          let marker: any;
          if (AdvancedMarkerElement) {
            marker = new AdvancedMarkerElement({
              position: m.position,
              title: m.title,
              map: mapRef.current!,
            });
          } else {
            marker = new g.maps.Marker({
              position: m.position,
              title: m.title,
              map: mapRef.current!,
            });
          }
          if (m.onClick && marker.addListener) marker.addListener('click', m.onClick as any);
          existing[m.id] = marker;
        } else {
          // Update existing
          (current as any).position = m.position;
          (current as any).title = m.title || '';
        }
      });
    });
    return () => { isMounted = false; };
  }, [center.lat, center.lng, zoom, JSON.stringify(markers)]);

  return <div ref={ref} className={className || 'w-full h-full'} />;
};

export default Map;


