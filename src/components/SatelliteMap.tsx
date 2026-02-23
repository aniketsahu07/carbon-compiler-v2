'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface SatelliteMapProps {
  coordinateString: string; // e.g. "27.53° N, 71.91° E"
  projectType: string;
}

/** Parse "27.53° N, 71.91° E" or "0.78° S, 36.30° E" into [lat, lng] */
function parseCoordinates(raw: string): [number, number] | null {
  // Match: optional minus, digits, optional decimal, optional degree symbol, space, N/S/E/W
  const matches = raw.match(
    /(-?\d+\.?\d*)\s*°?\s*([NSns])\s*,\s*(-?\d+\.?\d*)\s*°?\s*([EWew])/
  );
  if (!matches) return null;

  let lat = parseFloat(matches[1]);
  let lng = parseFloat(matches[3]);

  if (matches[2].toUpperCase() === 'S') lat = -lat;
  if (matches[4].toUpperCase() === 'W') lng = -lng;

  if (isNaN(lat) || isNaN(lng)) return null;
  return [lat, lng];
}

export default function SatelliteMap({ coordinateString, projectType }: SatelliteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // Store the Leaflet map instance so we can destroy it on unmount
  const leafletMapRef = useRef<import('leaflet').Map | null>(null);

  useEffect(() => {
    const coords = parseCoordinates(coordinateString);
    if (!mapRef.current || !coords) return;

    // Destroy previous map instance before creating a new one (avoids "already initialized" error)
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    // Dynamically import Leaflet so it never runs on the server
    import('leaflet').then((L) => {
      // Fix default marker icon paths broken by webpack
      // @ts-expect-error – _getIconUrl is not on the type but exists at runtime
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: coords,
        zoom: 12,
        zoomControl: true,
      });

      // Esri World Imagery — free, no API key needed, high quality satellite
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution:
            'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
          maxZoom: 19,
        }
      ).addTo(map);

      // Label overlay so city/country names appear on top of satellite
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, opacity: 0.7 }
      ).addTo(map);

      // Marker at the project location
      L.marker(coords)
        .addTo(map)
        .bindPopup(
          `<strong>${projectType}</strong><br/>${coordinateString}`
        )
        .openPopup();

      leafletMapRef.current = map;
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [coordinateString, projectType]);

  return (
    <div
      ref={mapRef}
      style={{ height: '400px', width: '100%', borderRadius: '8px' }}
    />
  );
}
