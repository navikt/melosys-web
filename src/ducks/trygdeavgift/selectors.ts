import { createSelector, Selector } from "reselect";
import { RootState, StateSection } from "AppTypes";
import * as Types from "./types";

export const TrygdeavgiftSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  (state: RootState) => state.trygdeavgift,
  (trygdeavgift) => trygdeavgift
);

export const TrygdeavgiftDataSelector: Selector<RootState, Types.Data> = createSelector(
  TrygdeavgiftSelector,
  (trygdeavgift) => trygdeavgift.data || {}
);

export const BeregnetTrygdeavgiftSelector = createSelector(
  TrygdeavgiftDataSelector,
  (trygdeavgiftData) => trygdeavgiftData.beregnetTrygdeavgift || null
);

export const FakturamottakerSelector = createSelector(
  BeregnetTrygdeavgiftSelector,
  (beregnetTrygdeavgift) => beregnetTrygdeavgift?.fakturamottaker
);

export const TrygdeavgiftsperioderSelector = createSelector(
  BeregnetTrygdeavgiftSelector,
  (beregnetTrygdeavgift) => beregnetTrygdeavgift?.trygdeavgiftsperioder
);
