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
  return featureToggleReduxState.status === STATUS.OK ? featureToggleReduxState.data[toggleName] : undefined;
};

const useFeatureToggle = (toggleName: string): boolean | undefined => {
  const featureToggleReduxState: any = useSelector((state: any) => featureToggleSelectors.FeatureToggleSelector(state));
  return featureToggleReduxState.status === STATUS.OK ? featureToggleReduxState.data[toggleName] : undefined;
};

export default useFeatureToggle;
