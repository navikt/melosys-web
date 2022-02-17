import { createSelector, Selector } from "reselect";
import { RootState, StateSection } from "AppTypes";
import MKV from "../../melosyskodeverk";
import * as Types from "./types";
import { SakstypeKodeSelector } from "../fagsaker/selectors";

export const LandkoderSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  (state: RootState) => state.landkoder,
  (landkoder) => landkoder.data || []
);

export const LandkoderFraSakstypeSelector = createSelector(
  LandkoderSelector,
  SakstypeKodeSelector,
  (landkoder, sakstype) => {
    switch (sakstype) {
      case MKV.Koder.sakstyper.FTRL:
      case MKV.Koder.sakstyper.TRYGDEAVTALE:
        return landkoder;
      case MKV.Koder.sakstyper.EU_EOS:
      default:
        return MKV.KTObjects.landkoder;
    }
  }
);
