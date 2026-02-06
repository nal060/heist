import React, { createContext, useContext, useReducer, useCallback } from 'react';

interface FavoritesState {
  favoriteBusinessIds: Set<string>;
}

type FavoritesAction =
  | { type: 'TOGGLE_FAVORITE'; businessId: string }
  | { type: 'SET_FAVORITES'; businessIds: string[] };

const initialState: FavoritesState = {
  favoriteBusinessIds: new Set<string>(),
};

function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case 'TOGGLE_FAVORITE': {
      const newFavorites = new Set(state.favoriteBusinessIds);
      if (newFavorites.has(action.businessId)) {
        newFavorites.delete(action.businessId);
      } else {
        newFavorites.add(action.businessId);
      }
      return { ...state, favoriteBusinessIds: newFavorites };
    }
    case 'SET_FAVORITES':
      return { ...state, favoriteBusinessIds: new Set(action.businessIds) };
    default:
      return state;
  }
}

interface FavoritesContextType {
  favoriteBusinessIds: Set<string>;
  isFavorite: (businessId: string) => boolean;
  toggleFavorite: (businessId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);

  const isFavorite = useCallback(
    (businessId: string) => state.favoriteBusinessIds.has(businessId),
    [state.favoriteBusinessIds]
  );

  const toggleFavorite = useCallback((businessId: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE', businessId });
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteBusinessIds: state.favoriteBusinessIds,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}