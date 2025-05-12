// selector(s)
import { createSelector } from "reselect";

/**
 * @typedef {{ [key: string]: boolean }} FeatureToggleMap
 * @typedef {{ status: string, data: FeatureToggleMap }} FeatureToggleSlice
 * @type {import('reselect').Selector<import('../../AppTypes').RootState, FeatureToggleSlice | undefined>}
 */
export const FeatureToggleSelector = createSelector(
  /** @param {import('../../AppTypes').RootState} state */
  (state) => (state.featureToggle ? state.featureToggle : undefined),
  (featureToggle) => featureToggle,
);
