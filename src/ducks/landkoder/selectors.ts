import { createSelector, Selector } from "reselect";
import { RootState } from "AppTypes";
import MKV from "../../melosyskodeverk";
import { SakstypeKodeSelector } from "../fagsaker/selectors";
import * as MPT from "../../proptypes";

export const LandkoderSelector: Selector<RootState, typeof MPT.Kodeverk[]> = createSelector(
  (state: RootState) => state.landkoder,
  (landkoder) => landkoder.data || []
);

export const LandkoderFraSakstypeSelector = createSelector(
  (state: RootState) => LandkoderSelector(state),
  (state: RootState) => SakstypeKodeSelector(state),
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
