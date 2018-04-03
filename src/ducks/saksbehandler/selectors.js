/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

export const SaksbehandlerSelector = createSelector(
  state => state.saksbehandler.data,
  saksbehandler => saksbehandler
);

export const SaksbehandlerStatusSelector = createSelector(
  state => state.saksbehandler.status,
  saksbehandler => saksbehandler
);
