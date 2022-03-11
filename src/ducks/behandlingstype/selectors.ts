/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector, Selector } from "reselect";
import { RootState, StateSection } from "AppTypes";
import * as Types from "./types";

export const BehandlingstypeSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  (state: RootState) => state.behandlingstype,
  (type) => type
);

export const BehandlingstypeDataSelector: Selector<RootState, Types.Data> = createSelector(
  BehandlingstypeSelector,
  (type) => type.data
);

export const MuligeBehandlingstyperSelector = createSelector(
  BehandlingstypeDataSelector,
  (type) => type.muligeBehandlingstyper || []
);
