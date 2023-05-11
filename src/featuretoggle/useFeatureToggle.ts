import { useEffect, useState } from "react";
import * as Api from "../services/api";

import { FEATURE_TOGGLE, alleToggleNavn } from "./toggleNavn";
import { getCachedItem, setCachedItem } from "../services/utils";

export const hentAlleFeatureToggles = () => {
  Api.Featuretoggle.hent(alleToggleNavn).then((alleToggles) => {
    setCachedItem(FEATURE_TOGGLE, JSON.stringify(alleToggles));
  });
};

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
  const [featureToggleEnabled, setFeatureToggleEnabled] = useState(undefined);

  useEffect(() => {
    setFeatureToggleEnabled(erFeatureToggleEnabled(toggleName));
  }, [toggleName]);

  return featureToggleEnabled;
};

export default useFeatureToggle;
