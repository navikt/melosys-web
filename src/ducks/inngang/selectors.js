/* eslint import/prefer-default-export:"off" */
/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

// selector(s)
export const InngangSelector = createSelector(
  state => (state.inngang.data ? state.inngang.data : {}),
  inngang => inngang || {}
);
