/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

export const behandlingstemaSelector = createSelector(
  state => (state.behandlingstema.data ? state.behandlingstema.data : []),
  behandlingstema => behandlingstema
);

export const muligeBehandlingstema = createSelector(
  state => behandlingstemaSelector(state),
  behandlingstema => behandlingstema || []
);
