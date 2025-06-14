'use client';

import { useReducer, useCallback, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer } from 'react-leaflet';
import BeachControls from './BeachControls';
import { beachReducer, initialBeachState } from '@/reducers/beachReducer';
import MapLayers from './MapLayers';

const mapContainerStyle = {
  height: '100%',
  width: '100%',
  border: '2px solid #ccc',
};

export default function MapComponent() {
  const [state, dispatch] = useReducer(beachReducer, initialBeachState);

  useEffect(() => {
    // console.log('MapComponent mounted!'); // Removed debug log
    return () => {
      // console.log('MapComponent UNMOUNTED!'); // Removed debug log
    };
  }, []);

  const getHeatPoints = useCallback((): [number, number, number][] => {
    // console.log('getHeatPoints re-created'); // Removed debug log
    return state.beaches.map((b) => [b.lat, b.lng, b.pollution]);
  }, [state.beaches]);

  const handleSelectBeach = useCallback((beachId: string) => {
    // console.log('handleSelectBeach re-created'); // Removed debug log
    dispatch({ type: 'SELECT_BEACH', payload: beachId });
  }, [dispatch]);

  const handleUpdatePollution = useCallback((beachId: string, type: 'COMPLAINT' | 'CLEANUP', description?: string) => {
    // console.log('handleUpdatePollution re-created'); // Removed debug log
    dispatch({
      type: 'UPDATE_POLLUTION',
      payload: { beachId, type, description },
    });
  }, [dispatch]);

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      <MapContainer
        center={[19.0760, 72.8777]}
        zoom={12}
        style={mapContainerStyle}
        zoomControl={false}
      >
        <MapLayers
          beaches={state.beaches}
          getHeatPoints={getHeatPoints}
          onSelectBeach={handleSelectBeach}
        />
      </MapContainer>

      <BeachControls
        beaches={state.beaches}
        selectedBeachId={state.selectedBeachId}
        onSelectBeach={handleSelectBeach}
        onUpdatePollution={handleUpdatePollution}
      />

      {state.error && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {state.error}
        </div>
      )}
    </div>
  );
}
