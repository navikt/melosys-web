import * as Qs from 'qs';

import { getAsJson } from '../utils';
import { API_BASE_URL, FEATURETOGGLE } from '../api-constants';

interface FeaturetoggleResDto {
  [index: string]: boolean,
}

export const hent = (features: string[]): Promise<FeaturetoggleResDto> => {
  const queryparams = Qs.stringify({ features }, { indices: false });

  return getAsJson(`${API_BASE_URL}${FEATURETOGGLE}?${queryparams}`);
};
