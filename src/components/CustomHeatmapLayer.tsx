'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import H from 'heatmap.js';

interface CustomHeatmapLayerProps {
  points: [number, number, number][]; // [latitude, longitude, intensity]
  options?: any; // Changed from H.Options
}

export default function CustomHeatmapLayer({ points, options }: CustomHeatmapLayerProps) {
  const map = useMap();
  const heatmapInstanceRef = useRef<any | null>(null); // Changed from H.Instance
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the heatmap container
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // For debouncing

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!map || !H || !L) {
      // Ensure Leaflet and heatmap.js are loaded
      return;
    }

    // Ensure the heatmap container exists
    if (!containerRef.current) {
      return;
    }

    if (!heatmapInstanceRef.current) {
      // Initialize heatmap.js instance only once, using the dedicated container
      // @ts-ignore: H.create options might have properties not in H.Options
      heatmapInstanceRef.current = H.create({
        container: containerRef.current,
        radius: 20,
        maxOpacity: 0.5,
        minOpacity: 0,
        blur: 0.75,
        gradient: {
          0.2: 'pink',
          0.4: '#ff6666',
          0.7: 'red',
          1.0: 'darkred',
        },
        ...options,
      });

      // After heatmap.js creates its canvas, set willReadFrequently on its context
      if (containerRef.current) {
        const heatmapCanvas = containerRef.current.querySelector('canvas');
        if (heatmapCanvas instanceof HTMLCanvasElement) {
          const ctx = heatmapCanvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            // console.log('Canvas context set with willReadFrequently: true'); // Removed debug log
          }
        }
      }

      // Position and size the heatmap canvas to match the map viewport
      const updateHeatmapCanvas = () => {
        if (containerRef.current) {
          const mapPane = map.getPane('overlayPane');
          if (mapPane) {
            const mapRect = map.getContainer().getBoundingClientRect();
            containerRef.current.style.position = 'absolute';
            containerRef.current.style.top = '0px';
            containerRef.current.style.left = '0px';
            containerRef.current.style.width = mapRect.width + 'px';
            containerRef.current.style.height = mapRect.height + 'px';
            const heatmapCanvas = containerRef.current.querySelector('canvas');
            if (heatmapCanvas) {
              heatmapCanvas.style.width = '100%';
              heatmapCanvas.style.height = '100%';
            }
          }
        }
      };

      updateHeatmapCanvas();
      map.on('resize', updateHeatmapCanvas);

      // Apply the marker icon fix here
      if (L.Icon && L.Icon.Default && L.Icon.Default.prototype) {
        // @ts-expect-error: Leaflet's internal _getIconUrl is not part of public types
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
      }
    }

    const data = points.map(p => {
      const containerPoint = map.latLngToContainerPoint([p[0], p[1]]);
      return {
        x: containerPoint.x,
        y: containerPoint.y,
        value: p[2],
      };
    });

    if (heatmapInstanceRef.current) {
      heatmapInstanceRef.current.setData({
        max: 1.0,
        data: data,
      });
      heatmapInstanceRef.current.repaint();
    }

    const debouncedHandleMapChange = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        if (heatmapInstanceRef.current) {
          const updatedData = points.map(p => {
            const containerPoint = map.latLngToContainerPoint([p[0], p[1]]);
            return {
              x: containerPoint.x,
              y: containerPoint.y,
              value: p[2],
            };
          });
          heatmapInstanceRef.current.setData({
            max: 1.0,
            data: updatedData,
          });
          heatmapInstanceRef.current.repaint();
        }
      }, 200);
    };

    map.on('zoomend', debouncedHandleMapChange);
    map.on('moveend', debouncedHandleMapChange);
    map.on('dragend', debouncedHandleMapChange);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      map.off('zoomend', debouncedHandleMapChange);
      map.off('moveend', debouncedHandleMapChange);
      map.off('dragend', debouncedHandleMapChange);

      if (heatmapInstanceRef.current) {
        heatmapInstanceRef.current.setData({ max: 1, data: [] });
        if (containerRef.current && containerRef.current.parentNode) {
          containerRef.current.parentNode.removeChild(containerRef.current);
        }
      }
    };
  }, [map, points, options]);

  return <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 600, pointerEvents: 'none' }} />;
} 