import type { ConfigureStoreOptions, Store } from "@reduxjs/toolkit";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "../../reducer";
import type { RootState } from "AppTypes";

/**
 * Creates a Redux store for testing purposes.
 * Uses the real application reducers for accurate testing.
 *
 * @param preloadedState - Initial state for the store
 * @param options - Additional store configuration options
 * @returns Configured Redux store
 */
export const createTestStore = (
  preloadedState: Partial<RootState> = {},
  options: Partial<ConfigureStoreOptions<RootState>> = {},
): Store<RootState> => {
  return configureStore({
    reducer: rootReducer as any,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // Disable checks for better test performance
        serializableCheck: false,
        immutableCheck: false,
        // Keep thunk for async actions
        thunk: true,
      }),
    ...options,
  });
};

/**
 * Helper to create a store with minimal setup for simple tests
 * @param stateSlice - Specific state slice to set up
 * @returns Configured Redux store
 */
export const createMinimalTestStore = (stateSlice: Partial<RootState> = {}): Store<RootState> => {
  const minimalState: Partial<RootState> = {
    behandlinger: { data: [] },
    anmodningsperioder: { data: [] },
    lovvalgsperioder: { data: [] },
    mottatteOpplysninger: { data: [] },
    utpekingsperioder: { data: [] },
    vilkar: { data: [] },
    sok: { data: [] },
    ...stateSlice,
  };

  return createTestStore(minimalState);
};

export default createTestStore;
