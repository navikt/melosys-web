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

export default useFeatureToggle;
