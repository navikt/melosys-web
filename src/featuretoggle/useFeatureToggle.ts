import * as Api from "../services/api";

import { useAsyncCallbackState } from "../hooks/useCallbackState";

export enum Status {
  fetching = "fetching",
  enabled = "enabled",
  disabled = "disabled",
}

const useFeatureToggle = (toggleName: string, deps: unknown[] = []): Status => {
  const [toggles] = useAsyncCallbackState(() => Api.Featuretoggle.hent([toggleName]), {}, [toggleName, ...deps]);

  const toggleFetched = toggles[toggleName] !== undefined;

  if (!toggleFetched) {
    return Status.fetching;
  } else if (toggles[toggleName]) {
    return Status.enabled;
  }
  return Status.disabled;
};

export default useFeatureToggle;
