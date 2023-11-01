import { createSelector, Selector } from "reselect";
import { RootState, StateSection } from "AppTypes";
import * as Api from "../../services/api";

export const TrygdeavgiftSelector: Selector<
  RootState,
  StateSection<Api.Trygdeavgift.BeregnetTrygdeavgift>
> = createSelector(
  (state: RootState) => state.trygdeavgift,
  (trygdeavgift) => trygdeavgift
);

export const TrygdeavgiftStatusSelector = createSelector(TrygdeavgiftSelector, (trygdeavgift) => trygdeavgift.status);

export const TrygdeavgiftDataSelector: Selector<RootState, Api.Trygdeavgift.BeregnetTrygdeavgift> = createSelector(
  TrygdeavgiftSelector,
  (trygdeavgift) => trygdeavgift.data || {}
);

export const FakturamottakerSelector = createSelector(
  TrygdeavgiftDataSelector,
  (beregnetTrygdeavgift) => beregnetTrygdeavgift?.fakturamottaker
);

export const TrygdeavgiftsperioderSelector = createSelector(
  TrygdeavgiftDataSelector,
  (beregnetTrygdeavgift) => beregnetTrygdeavgift?.trygdeavgiftsperioder
);
