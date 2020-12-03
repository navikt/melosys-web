import * as Api from '../services/api';
import * as Utils from '../utils';

import { useAsyncCallbackState } from './useCallbackState';

export enum Status {
  fetching = 'fetching',
  enabled = 'enabled',
  disabled = 'disabled',
}

const useFeatureToggle = (toggleName: string, deps: unknown[] = []): [Status] => {
  const [toggles] = useAsyncCallbackState(() => Api.Featuretoggle.hent([toggleName]), {}, Utils.logger.error, [toggleName, ...deps]);

  const toggleFetched = toggles[toggleName] !== undefined;

  let toggleStatus: Status | null = null;

  if (!toggleFetched) {
    toggleStatus = Status.fetching;
  } else if (toggles[toggleName]) {
    toggleStatus = Status.enabled;
  } else {
    toggleStatus = Status.disabled;
  }

  return [toggleStatus];
};

export default useFeatureToggle;
