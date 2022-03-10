/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector, Selector } from "reselect";
import { RootState, StateSection } from "AppTypes";
import * as Types from "./types";

export const BehandlingsstatusSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  (state: RootState) => state.behandlingsstatus,
  (behandlingsstatus) => behandlingsstatus
);

export const BehandlingsstatusDataSelector: Selector<RootState, Types.Data> = createSelector(
  BehandlingsstatusSelector,
  (behandlingsstatus) => behandlingsstatus.data
);

export const MuligeBehandlingsstatusSelector = createSelector(
  BehandlingsstatusDataSelector,
  (behandlingsstatus) => behandlingsstatus.muligeBehandlingsstatuser || []
);
