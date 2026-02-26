import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@user_location';

export interface UserLocation {
  name: string;
  latitude: number;
  longitude: number;
}

interface LocationContextValue {
  location: UserLocation | null;
  setLocation: (loc: UserLocation) => Promise<void>;
  isLoaded: boolean;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<UserLocation | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          setLocationState(JSON.parse(raw));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  const setLocation = useCallback(async (loc: UserLocation) => {
    setLocationState(loc);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation, isLoaded }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
