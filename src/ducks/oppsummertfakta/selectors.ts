import { createSelector, Selector } from "reselect";
import { RootState, StateSection } from "AppTypes";
import * as Types from "./types";

export const OppsummertFaktaSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  (state) => state.oppsummertfakta,
  (oppsummertfakta) => oppsummertfakta
);

export const OppsummertFaktaDataSelector: Selector<RootState, Types.Data> = createSelector(
  OppsummertFaktaSelector,
  (oppsummertfakta) => oppsummertfakta.data
);

export const VirksomheterSelector = createSelector(
  OppsummertFaktaDataSelector,
  (oppsummertfakta) => oppsummertfakta.virksomheter
);

export const VirksomhetIDerSelector = createSelector(VirksomheterSelector, (virksomheter) =>
  virksomheter ? virksomheter.virksomhetIDer : []
);

export const MedfolgendeFamilieSelector = createSelector(
  OppsummertFaktaDataSelector,
  (oppsummertfakta) => oppsummertfakta.medfolgendeFamilie
);
