/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

// eslint-disable-next-line
export const SoknadenFormSelector = createSelector(
  state => (state.form.soknad ? state.form.soknad : {}),
  soknaden => soknaden
);
