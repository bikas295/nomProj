'use client';

import React, { useRef, useEffect } from 'react';
import { TileLayer, useMap } from 'react-leaflet';
import CustomHeatmapLayer from './CustomHeatmapLayer';
import { Beach } from '@/types/beach';
import L from 'leaflet'; // Import Leaflet for direct marker creation

interface MapLayersProps {
  beaches: Beach[];
  getHeatPoints: () => [number, number, number][];
  onSelectBeach: (beachId: string) => void;
}

const MapLayers: React.FC<MapLayersProps> = ({ beaches, getHeatPoints, onSelectBeach }) => {
  const map = useMap();
  const leafletMarkersRef = useRef<{ [key: string]: L.Marker }>({}); // Stores active Leaflet marker instances

  useEffect(() => {
    const currentMarkers = leafletMarkersRef.current;
    const newMarkersMap = new Map<string, L.Marker>();

    // Add/Update markers that are in the new 'beaches' array
    beaches.forEach(beach => {
      let marker = currentMarkers[beach.id];

      if (!marker) {
        // Create new marker if it doesn't exist in our ref
        marker = L.marker([beach.lat, beach.lng], { zIndexOffset: 1000 });
        marker.addTo(map);
        marker.on('click', () => onSelectBeach(beach.id));
      }

      // Always update popup content, regardless if marker was new or existing
      const popupContent = `
        <div>
          <b>${beach.name}</b><br/>
          Pollution level: ${(beach.pollution * 100).toFixed(0)}%<br/>
          Last updated: ${new Date(beach.lastUpdated).toLocaleString()}
        </div>
      `;
      marker.bindPopup(popupContent);

      // If the popup is currently open, update its content in place
      if (marker.isPopupOpen()) {
        marker.getPopup()?.setContent(popupContent);
      }
      newMarkersMap.set(beach.id, marker);
    });

    // Remove markers that are no longer in the 'beaches' array
    Object.keys(currentMarkers).forEach(markerId => {
      if (!newMarkersMap.has(markerId)) {
        map.removeLayer(currentMarkers[markerId]);
        delete currentMarkers[markerId]; // Remove from our ref as well
      }
    });

    // Update the ref to reflect the current set of active markers
    leafletMarkersRef.current = Object.fromEntries(newMarkersMap);

    // Cleanup function: remove all markers when component unmounts
    return () => {
      Object.values(leafletMarkersRef.current).forEach(marker => {
        map.removeLayer(marker);
      });
      leafletMarkersRef.current = {};
    };
  }, [beaches, map, onSelectBeach]); // Dependencies for this effect

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
        url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
      />

      {/* Heatmap Layer */}
      <CustomHeatmapLayer points={getHeatPoints()} />
    </>
  );
};

export default React.memo(MapLayers);