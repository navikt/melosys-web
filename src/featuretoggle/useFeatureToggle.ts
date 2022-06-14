import * as Api from "../services/api";

import { useAsyncCallbackState } from "../hooks";

export enum Status {
  fetching = "fetching",
  enabled = "enabled",
  disabled = "disabled",
}

const hentFeatureToggle = (toggleName: string) => Api.Featuretoggle.hent([toggleName]);

export const erFeatureToggleEnabled = (toggleName: string): Promise<boolean> =>
  hentFeatureToggle(toggleName)
    .then((response) => response[toggleName])
    .catch(() => false);

const useFeatureToggle = (toggleName: string, deps: unknown[] = []): Status => {
  const [toggles] = useAsyncCallbackState(() => hentFeatureToggle(toggleName), {}, [toggleName, ...deps]);

  const toggleFetched = toggles[toggleName] !== undefined;

  if (!toggleFetched) {
    return Status.fetching;
  }
  if (toggles[toggleName]) {
    return Status.enabled;
  }
  return Status.disabled;
};

export default useFeatureToggle;
