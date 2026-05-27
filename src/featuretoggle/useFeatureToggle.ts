import { useSelector } from "react-redux";
import { RootState } from "AppTypes";
import { STATUS } from "../services";
import { featureToggleSelectors } from "../ducks/featuretoggle";

/**
 * erFeatureToggleEnabled
 * OBS: Bruk heller useFeatureToggle dersom du er i funksjonell komponent.
 */
export const erFeatureToggleEnabled = (toggleName: string, state: RootState) => {
  const featureToggleReduxState = featureToggleSelectors.FeatureToggleSelector(state);
  if (!featureToggleReduxState) {
    return undefined;
  }
  return featureToggleReduxState.status === STATUS.OK ? featureToggleReduxState.data[toggleName] : undefined;
};

const useFeatureToggle = (toggleName: string): boolean | undefined => {
  const featureToggleReduxState = useSelector((state: RootState) =>
    featureToggleSelectors.FeatureToggleSelector(state),
  );

  if (!featureToggleReduxState || featureToggleReduxState.status !== STATUS.OK) {
    return undefined;
  }
  return featureToggleReduxState.data[toggleName];
};

/**
 * Returnerer navnene på alle aktive feature toggles, sortert alfabetisk.
 * Returnerer tom liste hvis toggle-state ikke er ferdig lastet.
 */
export const useAktiveToggles = (): string[] => {
  const featureToggleReduxState = useSelector((state: RootState) =>
    featureToggleSelectors.FeatureToggleSelector(state),
  );

  if (!featureToggleReduxState || featureToggleReduxState.status !== STATUS.OK || !featureToggleReduxState.data) {
    return [];
  }
  return Object.entries(featureToggleReduxState.data)
    .filter(([, paa]) => paa === true)
    .map(([navn]) => navn)
    .sort();
};

export default useFeatureToggle;
