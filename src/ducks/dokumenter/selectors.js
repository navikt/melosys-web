/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

export const dokumenterSelector = createSelector(
  state => state.dokumenter.data,
  dokumenter => dokumenter
);
/*
export const dokumenterResponseStatusSelector = createSelector(
  state => state.dokumenter.response,
  response => response
);
*/
