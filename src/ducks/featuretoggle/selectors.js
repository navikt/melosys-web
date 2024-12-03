// selector(s)
import { createSelector } from "reselect";

export const FeatureToggleSelector = createSelector(
  (state) => (state.featureToggle ? state.featureToggle : undefined),
  (featureToggle) => featureToggle,
);
