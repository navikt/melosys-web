/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

export const SedSelector = createSelector(
  state => (state.sed.data ? state.sed.data : {}),
  sed => sed
);

export const SedUnderArbeidSelector = createSelector(
  state => SedSelector(state).sedunderarbeid || [],
  sedunderarbeid => sedunderarbeid
);

export const BucinformasjonSelector = createSelector(
  state => SedSelector(state).bucinfo || {},
  bucinfo => bucinfo
);
