import { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { FEATURE_TOGGLE } from "./toggleNavn";
import { STATUS, getCachedItem } from "../services/utils";
import { featureToggleSelectors } from "../ducks/featuretoggle";

/**
 * erFeatureToggleEnabled
 * OBS: Bruk heller useFeatureToggle dersom du er i funksjonell komponent.
 */
export const erFeatureToggleEnabled = (featureToggle: string) => {
  if (getCachedItem(FEATURE_TOGGLE) === undefined) {
    return null;
  }
  const toggles = JSON.parse(getCachedItem(FEATURE_TOGGLE)!);
  return toggles && toggles[featureToggle];
};

const useFeatureToggle = (toggleName: string): boolean | undefined => {
  const [featureToggle, setFeatureToggle] = useState(undefined);
  const featureToggleReduxState: any = useSelector((state: any) => featureToggleSelectors.FeatureToggleSelector(state));

  useEffect(() => {
    if (featureToggleReduxState.status === STATUS.OK) {
      setFeatureToggle(featureToggleReduxState.data[toggleName]);
    }
  }, [toggleName, featureToggleReduxState]);

  return featureToggle;
};

export default useFeatureToggle;
