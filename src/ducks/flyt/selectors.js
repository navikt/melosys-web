import { createSelector } from 'reselect';

import { vilkarSelectors } from '../vilkar';

export const ErIArtikkel11_4Selector = createSelector(
  vilkarSelectors.art11_4_1,
  vilkarSelectors.art11_4_2,
  (...vilkar) => vilkar.some(enkeltVilkar => enkeltVilkar.oppfylt)
);
