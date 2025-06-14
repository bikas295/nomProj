'use client';

import { useState } from 'react';
import { Beach } from '@/types/beach';

interface BeachControlsProps {
  beaches: Beach[];
  selectedBeachId: string | null;
  onSelectBeach: (beachId: string) => void;
  onUpdatePollution: (beachId: string, type: 'COMPLAINT' | 'CLEANUP', description?: string) => void;
}

export default function BeachControls({
  beaches,
  selectedBeachId,
  onSelectBeach,
  onUpdatePollution,
}: BeachControlsProps) {
  const [description, setDescription] = useState('');

  const selectedBeach = beaches.find(b => b.id === selectedBeachId);

  const handleSubmit = (type: 'COMPLAINT' | 'CLEANUP') => {
    if (selectedBeachId) {
      onUpdatePollution(selectedBeachId, type, description);
      setDescription('');
    }
  };

  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-lg max-w-sm text-gray-900">
      <h2 className="text-lg font-semibold mb-4">Beach Pollution Control</h2>
      
      <div className="mb-4">
        <label htmlFor="beachSelect" className="block text-sm font-medium text-gray-700 mb-1">
          Select Beach
        </label>
        <select
          id="beachSelect"
          value={selectedBeachId || ''}
          onChange={(e) => onSelectBeach(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a beach...</option>
          {beaches.map((beach) => (
            <option key={beach.id} value={beach.id}>
              {beach.name} ({(beach.pollution * 100).toFixed(0)}% pollution)
            </option>
          ))}
        </select>
      </div>

      {selectedBeach && (
        <>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about the complaint or cleanup..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleSubmit('COMPLAINT')}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              🚨 File Complaint
            </button>
            <button
              onClick={() => handleSubmit('CLEANUP')}
              className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              🧹 Report Cleanup
            </button>
          </div>

          {selectedBeach.history.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Updates</h3>
              <div className="max-h-40 overflow-y-auto">
                {selectedBeach.history.slice(-3).reverse().map((update, index) => (
                  <div
                    key={index}
                    className={`text-sm p-2 rounded-md mb-1 ${
                      update.type === 'COMPLAINT'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    <div className="font-medium">
                      {update.type === 'COMPLAINT' ? '🚨 Complaint' : '🧹 Cleanup'}
                    </div>
                    <div className="text-xs">
                      {new Date(update.timestamp).toLocaleString()}
                    </div>
                    {update.description && (
                      <div className="text-xs mt-1">{update.description}</div>
                    )}
                    <div className="text-xs mt-1">
                      Pollution: {update.previousValue.toFixed(1)} → {update.newValue.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 