/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

/* eslint import/prefer-default-export:"off" */
export const BehandlingsresultatSelector = createSelector(
  state => (state.behandlingsresultat ? state.behandlingsresultat.data : []),
  behandlingsresultat => behandlingsresultat
);
