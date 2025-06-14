import { Beach, BeachState, BeachAction } from '@/types/beach';

const POLLUTION_CHANGE = 0.1;
const MAX_POLLUTION = 1.0;
const MIN_POLLUTION = 0.0;

export const initialBeachState: BeachState = {
  beaches: [
    { 
      id: 'juhu',
      name: 'Juhu Beach',
      lat: 19.100,
      lng: 72.830,
      pollution: 0.7,
      lastUpdated: new Date(),
      history: []
    },
    {
      id: 'versova',
      name: 'Versova Beach',
      lat: 19.120,
      lng: 72.820,
      pollution: 0.3,
      lastUpdated: new Date(),
      history: []
    },
    {
      id: 'girgaon',
      name: 'Girgaon Chowpatty',
      lat: 18.951,
      lng: 72.811,
      pollution: 0.9,
      lastUpdated: new Date(),
      history: []
    },
    {
      id: 'aksa',
      name: 'Aksa Beach',
      lat: 19.176,
      lng: 72.795,
      pollution: 0.5,
      lastUpdated: new Date(),
      history: []
    },
    {
      id: 'marve',
      name: 'Marvé Beach',
      lat: 19.1973,
      lng: 72.7968,
      pollution: 0.4,
      lastUpdated: new Date(),
      history: []
    },
    {
      id: 'gorai',
      name: 'Gorai Beach',
      lat: 19.2408,
      lng: 72.7819,
      pollution: 0.6,
      lastUpdated: new Date(),
      history: []
    },
    {
      id: 'manori',
      name: 'Manori Beach',
      lat: 19.210,
      lng: 72.790,
      pollution: 0.8,
      lastUpdated: new Date(),
      history: []
    },
  ],
  selectedBeachId: null,
  isLoading: false,
  error: null,
};

export function beachReducer(state: BeachState, action: BeachAction): BeachState {
  switch (action.type) {
    case 'SELECT_BEACH':
      return {
        ...state,
        selectedBeachId: action.payload,
      };

    case 'UPDATE_POLLUTION': {
      const { beachId, type, description } = action.payload;
      const beachIndex = state.beaches.findIndex(b => b.id === beachId);
      
      if (beachIndex === -1) {
        return {
          ...state,
          error: 'Beach not found',
        };
      }

      const beach = state.beaches[beachIndex];
      const previousValue = beach.pollution;
      const change = type === 'COMPLAINT' ? POLLUTION_CHANGE : -POLLUTION_CHANGE;
      const newValue = Math.max(
        MIN_POLLUTION,
        Math.min(MAX_POLLUTION, previousValue + change)
      );

      const updatedBeach: Beach = {
        ...beach,
        pollution: newValue,
        lastUpdated: new Date(),
        history: [
          ...beach.history,
          {
            timestamp: new Date(),
            type,
            previousValue,
            newValue,
            description,
          },
        ],
      };

      const newBeaches = [...state.beaches];
      newBeaches[beachIndex] = updatedBeach;

      return {
        ...state,
        beaches: newBeaches,
        error: null,
      };
    }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
} 