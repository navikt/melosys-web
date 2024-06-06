import { createSelector, Selector } from "reselect";
import { RootState } from "AppTypes";
import { KTObject } from "@navikt/melosys-kodeverk";
import MKV from "../../melosyskodeverk";
import { SakstypeKodeSelector } from "../fagsaker/selectors";
import { erFeatureToggleEnabled } from "../../featuretoggle";
import { MELOSYS_TRYGDEAVTALE_KOREA } from "../../featuretoggle/toggleNavn";

export const LandkoderSelector: Selector<RootState, KTObject[]> = createSelector(
  (state: RootState) => state.landkoder,
  (landkoder) => landkoder.data || []
);

export const LandkoderFraSakstypeSelector = createSelector(
  (state: RootState) => LandkoderSelector(state),
  (state: RootState) => SakstypeKodeSelector(state),
  (state: RootState) => erFeatureToggleEnabled(MELOSYS_TRYGDEAVTALE_KOREA, state),
  (landkoder, sakstype, koreaToggle): KTObject[] => {
    switch (sakstype) {
      case MKV.Koder.sakstyper.TRYGDEAVTALE:
        if (koreaToggle) {
          return MKV.KTObjects.trygdeavtale_myndighetsland;
        }
        return MKV.KTObjects.trygdeavtale_myndighetsland.filter((land: KTObject) => land.kode !== "KR");
      case MKV.Koder.sakstyper.FTRL:
        return landkoder;
      case MKV.Koder.sakstyper.EU_EOS:
      default:
        return MKV.KTObjects.landkoder;
    }
  }
);
