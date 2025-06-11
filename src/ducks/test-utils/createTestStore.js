import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "../../reducer";

/**
 * Creates a Redux store for testing purposes.
 * Uses the real application reducers for accurate testing.
 *
 * @param {Object} preloadedState - Initial state for the store
 * @param {Object} options - Additional store configuration options
 * @returns {Object} Configured Redux store
 */
export const createTestStore = (preloadedState = {}, options = {}) => {
  const store = configureStore({
    reducer: rootReducer,
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

  return store;
};

/**
 * Helper to create a store with minimal setup for simple tests
 * @param {Object} stateSlice - Specific state slice to set up
 * @returns {Object} Configured Redux store
 */
export const createMinimalTestStore = (stateSlice = {}) => {
  const minimalState = {
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
