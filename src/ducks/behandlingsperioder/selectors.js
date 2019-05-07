/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

/* eslint import/prefer-default-export:"off" */
export const behandlingsPerioderSelector = createSelector(
  state => (state.behandlingsperioder.data ? state.behandlingsperioder.data : {}),
  behandlingsperioder => behandlingsperioder
);

export const tidligereMedlemskap = createSelector(
  state => behandlingsPerioderSelector(state),
  behandlingsperioder => behandlingsperioder.tidligere_medlemsperiode_ids || []
);
