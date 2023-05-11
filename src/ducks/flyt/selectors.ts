import { createSelector } from "reselect";
import { RootState } from "AppTypes";

import MKV from "../../melosyskodeverk";
import * as KV from "../../kodeverk";
import * as Api from "../../services/api";

import { avklartefaktaSelectors } from "../avklartefakta";
import { vilkarSelectors } from "../vilkar";
import { behandlingerSelectors } from "../behandlinger";
import { behandlingsresultatSelectors } from "../behandlingsresultat";
import { harUnntakFlyt } from "../../routing/url";
import { fagsakSelectors } from "../fagsaker";
import { erFeatureToggleEnabled } from "../../featuretoggle";
import { MELOSYS_REGISTRERING_UNNTAK_FRA_MEDLEMSKAP } from "../../featuretoggle/toggleNavn";

export const ErIArtikkel11_4Selector = createSelector(
  (state: RootState) => vilkarSelectors.art11_4_1(state),
  (state: RootState) => vilkarSelectors.art11_4_2(state),
  (...vilkar) => vilkar.some((enkeltVilkar) => enkeltVilkar.oppfylt)
);

export const HarOffentligTjenesteINorgeSelector = createSelector(
  (state: RootState) => avklartefaktaSelectors.OffentligArbeidAntallLandFaktaVerdiSelector(state),
  (offentligArbeidAntallLand) =>
    offentligArbeidAntallLand === KV.Koder.OffentligArbeidAntallLand.NORGE_OG_ANNEN_VIRKSOMHET
);

export const HarOffentligTjenesteAnnetLandSelector = createSelector(
  (state: RootState) => avklartefaktaSelectors.OffentligArbeidAntallLandFaktaVerdiSelector(state),
  (offentligArbeidAntallLand) =>
    offentligArbeidAntallLand === KV.Koder.OffentligArbeidAntallLand.ANNET_LAND_OG_ANNEN_VIRKSOMHET
);

export const HarLonnetArbeidAnnetLand = createSelector(
  (state: RootState) => avklartefaktaSelectors.LoennetArbeidAntallLandFaktaVerdiSelector(state),
  (loennetArbeidAntallLand) => loennetArbeidAntallLand === KV.Koder.LoennetArbeidAntallLand.ETT_ANNET_LAND
);

export const UtpekingVurderingSelector = createSelector(
  (state: RootState) => behandlingerSelectors.BehandlingstemaKodeSelector(state),
  (state: RootState) => behandlingsresultatSelectors.UtfallRegistreringUnntakSelector(state),
  (state: RootState) => behandlingsresultatSelectors.UtfallUtpekingSelector(state),
  (behandlingstema, utfallRegistreringUnntak, utfallUtpeking) =>
    behandlingstema === MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND
      ? utfallRegistreringUnntak
      : utfallUtpeking
);

export const ErIDirekteTilArtikkel16FlytSelector = createSelector(
  (state: RootState) => avklartefaktaSelectors.AvklartefaktaSelector(state),
  (avklarteFakta) =>
    avklarteFakta.some((avklartFakta: Api.Avklartefakta.Avklartfakta) => {
      if (!avklartFakta.fakta) return false;
      return avklartFakta.fakta.includes(KV.Koder.VurderingYrkesgruppeTyper.ORDINAER_UTEN_ART12);
    })
);

export const HarValgtNorskArbeidsgiverSelector = createSelector(
  (state: RootState) => avklartefaktaSelectors.AvklarteNorskeVirksomheterSelector(state),
  (avklarteNorskeVirksomheter) => avklarteNorskeVirksomheter.length > 0
);

export const HarUnntakFlytSelector = createSelector(
  (state: RootState) => fagsakSelectors.SakstypeKodeSelector(state),
  (state: RootState) => fagsakSelectors.SakstemaKodeSelector(state),
  (state: RootState) => behandlingerSelectors.BehandlingstemaKodeSelector(state),
  async (sakstype, sakstema, behandlingstema) =>
    harUnntakFlyt(
      sakstype,
      sakstema,
      behandlingstema,
      erFeatureToggleEnabled(MELOSYS_REGISTRERING_UNNTAK_FRA_MEDLEMSKAP)
    )
);
