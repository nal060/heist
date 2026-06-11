import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import {
  getFavoriteBagIds,
  getFavoriteBusinessIds,
  addFavoriteBag as apiBagAdd,
  removeFavoriteBag as apiBagRemove,
  addFavoriteBusiness as apiBizAdd,
  removeFavoriteBusiness as apiBizRemove,
} from '../data';
import { useAuth } from './AuthContext';

interface FavoritesState {
  favoriteBusinessIds: Set<string>;
  favoriteBagIds: Set<string>;
}

type FavoritesAction =
  | { type: 'SET_BUSINESSES'; ids: string[] }
  | { type: 'SET_BAGS'; ids: string[] }
  | { type: 'ADD_BUSINESS'; id: string }
  | { type: 'REMOVE_BUSINESS'; id: string }
  | { type: 'ADD_BAG'; id: string }
  | { type: 'REMOVE_BAG'; id: string };

const initialState: FavoritesState = {
  favoriteBusinessIds: new Set<string>(),
  favoriteBagIds: new Set<string>(),
};

function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case 'SET_BUSINESSES':
      return { ...state, favoriteBusinessIds: new Set(action.ids) };
    case 'SET_BAGS':
      return { ...state, favoriteBagIds: new Set(action.ids) };
    case 'ADD_BUSINESS': {
      const next = new Set(state.favoriteBusinessIds);
      next.add(action.id);
      return { ...state, favoriteBusinessIds: next };
    }
    case 'REMOVE_BUSINESS': {
      const next = new Set(state.favoriteBusinessIds);
      next.delete(action.id);
      return { ...state, favoriteBusinessIds: next };
    }
    case 'ADD_BAG': {
      const next = new Set(state.favoriteBagIds);
      next.add(action.id);
      return { ...state, favoriteBagIds: next };
    }
    case 'REMOVE_BAG': {
      const next = new Set(state.favoriteBagIds);
      next.delete(action.id);
      return { ...state, favoriteBagIds: next };
    }
    default:
      return state;
  }
}

interface FavoritesContextType {
  favoriteBusinessIds: Set<string>;
  favoriteBagIds: Set<string>;
  isFavorite: (businessId: string) => boolean;
  isBagFavorite: (bagId: string) => boolean;
  isItemFavorited: (bagId: string, businessId: string) => boolean;
  addFavorites: (bagId: string | null, businessId: string | null) => void;
  removeBagFavorite: (bagId: string) => void;
  removeBusinessFavorite: (businessId: string) => void;
  toggleFavorite: (businessId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [state, dispatch] = useReducer(favoritesReducer, initialState);

  // Load from Supabase when user is available
  useEffect(() => {
    if (!userId) return;
    getFavoriteBagIds(userId)
      .then((ids) => dispatch({ type: 'SET_BAGS', ids }))
      .catch(() => {});
    getFavoriteBusinessIds(userId)
      .then((ids) => dispatch({ type: 'SET_BUSINESSES', ids }))
      .catch(() => {});
  }, [userId]);

  const isFavorite = useCallback(
    (businessId: string) => state.favoriteBusinessIds.has(businessId),
    [state.favoriteBusinessIds],
  );

  const isBagFavorite = useCallback(
    (bagId: string) => state.favoriteBagIds.has(bagId),
    [state.favoriteBagIds],
  );

  const isItemFavorited = useCallback(
    (bagId: string, businessId: string) =>
      state.favoriteBagIds.has(bagId) || state.favoriteBusinessIds.has(businessId),
    [state.favoriteBagIds, state.favoriteBusinessIds],
  );

  const addFavorites = useCallback((bagId: string | null, businessId: string | null) => {
    if (!userId) return;
    if (bagId) {
      dispatch({ type: 'ADD_BAG', id: bagId });
      apiBagAdd(userId, bagId).catch(() => dispatch({ type: 'REMOVE_BAG', id: bagId }));
    }
    if (businessId) {
      dispatch({ type: 'ADD_BUSINESS', id: businessId });
      apiBizAdd(userId, businessId).catch(() => dispatch({ type: 'REMOVE_BUSINESS', id: businessId }));
    }
  }, [userId]);

  const removeBagFavorite = useCallback((bagId: string) => {
    if (!userId) return;
    dispatch({ type: 'REMOVE_BAG', id: bagId });
    apiBagRemove(userId, bagId).catch(() => dispatch({ type: 'ADD_BAG', id: bagId }));
  }, [userId]);

  const removeBusinessFavorite = useCallback((businessId: string) => {
    if (!userId) return;
    dispatch({ type: 'REMOVE_BUSINESS', id: businessId });
    apiBizRemove(userId, businessId).catch(() => dispatch({ type: 'ADD_BUSINESS', id: businessId }));
  }, [userId]);

  // Backward compat: toggle business favorite
  const toggleFavorite = useCallback((businessId: string) => {
    if (state.favoriteBusinessIds.has(businessId)) {
      removeBusinessFavorite(businessId);
    } else {
      addFavorites(null, businessId);
    }
  }, [state.favoriteBusinessIds, addFavorites, removeBusinessFavorite]);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteBusinessIds: state.favoriteBusinessIds,
        favoriteBagIds: state.favoriteBagIds,
        isFavorite,
        isBagFavorite,
        isItemFavorited,
        addFavorites,
        removeBagFavorite,
        removeBusinessFavorite,
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
