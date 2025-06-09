import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "AppTypes";
import type { store } from "../store";

// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch;

// Create a typed dispatch hook
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Create a typed selector hook (for completeness and consistency)
export const useAppSelector = <TSelected>(
  selector: (state: RootState) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean,
) => useSelector<RootState, TSelected>(selector, equalityFn);

// Export types for use in other files
export type { RootState } from "AppTypes";
