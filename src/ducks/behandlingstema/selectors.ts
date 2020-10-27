/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector, Selector } from 'reselect';
import { RootState, StateSection } from 'AppTypes';
import * as Types from './types';

export const BehandlingstemaSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  state => state.behandlingstema,
  behandlingstema => behandlingstema
);

export const BehandlingstemaDataSelector: Selector<RootState, Types.Data> = createSelector(
  BehandlingstemaSelector,
  behandlingstema => behandlingstema.data
);

export const MuligeBehandlingstemaSelector = createSelector(
  BehandlingstemaDataSelector,
  behandlingstema => behandlingstema.muligeBehandlingstema || []
);
