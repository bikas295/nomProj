export interface Beach {
  id: string;
  name: string;
  lat: number;
  lng: number;
  pollution: number;
  lastUpdated: Date;
  history: PollutionUpdate[];
}

export interface PollutionUpdate {
  timestamp: Date;
  type: 'COMPLAINT' | 'CLEANUP';
  previousValue: number;
  newValue: number;
  description?: string;
}

export interface BeachState {
  beaches: Beach[];
  selectedBeachId: string | null;
  isLoading: boolean;
  error: string | null;
}

export type BeachAction =
  | { type: 'SELECT_BEACH'; payload: string }
  | { type: 'UPDATE_POLLUTION'; payload: { beachId: string; type: 'COMPLAINT' | 'CLEANUP'; description?: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }; 