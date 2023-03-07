import { createSelector, Selector } from "reselect";
import { RootState } from "AppTypes";
import { KTObject } from "@navikt/melosys-kodeverk";
import MKV from "../../melosyskodeverk";
import { SakstypeKodeSelector } from "../fagsaker/selectors";

export const LandkoderSelector: Selector<RootState, KTObject[]> = createSelector(
  (state: RootState) => state.landkoder,
  (landkoder) => landkoder.data || []
);

export const LandkoderFraSakstypeSelector = createSelector(
  (state: RootState) => LandkoderSelector(state),
  (state: RootState) => SakstypeKodeSelector(state),
  (landkoder, sakstype): KTObject[] => {
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
