import { createSelector, Selector } from "reselect";
import { RootState, StateSection } from "AppTypes";
import MKV from "../../melosyskodeverk";
import * as Types from "./types";
import { SakstypeKodeSelector } from "../fagsaker/selectors";

export const LandkoderDataSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  (state) => state.landkoder,
  (landkoder) => landkoder.data || []
);

export const LandkoderSelector = createSelector(LandkoderDataSelector, SakstypeKodeSelector, (landkoder, sakstype) => {
  switch (sakstype) {
    case MKV.Koder.sakstyper.FTRL:
    case MKV.Koder.sakstyper.TRYGDEAVTALE:
      return landkoder;
    case MKV.Koder.sakstyper.EU_EOS:
    default:
      return MKV.KTObjects.landkoder;
  }
});
