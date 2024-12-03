import { createSelector } from "reselect";
import { RootState } from "AppTypes";

import MKV from "../../melosyskodeverk";
import * as KV from "../../kodeverk";
import * as Api from "../../services/api";

import { avklartefaktaSelectors } from "../avklartefakta";
import { vilkarSelectors } from "../vilkar";
import { behandlingerSelectors } from "../behandlinger";
import { behandlingsresultatSelectors } from "../behandlingsresultat";
import { harUnntaksregistreringFlyt } from "../../url/url";
import { fagsakSelectors } from "../fagsaker";

export const ErIArtikkel11_4Eller13_4FlytSelector = createSelector(
  (state: RootState) => vilkarSelectors.Artikkel11_4_1Eller13_4_1Selector(state),
  (state: RootState) => vilkarSelectors.Artikkel11_4_2Eller13_4_2Selector(state),
  (...vilkar) => vilkar.some((enkeltVilkar) => enkeltVilkar.oppfylt),
);

export const HarOffentligTjenesteINorgeSelector = createSelector(
  (state: RootState) => avklartefaktaSelectors.OffentligArbeidAntallLandFaktaVerdiSelector(state),
  (offentligArbeidAntallLand) =>
    offentligArbeidAntallLand === KV.Koder.OffentligArbeidAntallLand.NORGE_OG_ANNEN_VIRKSOMHET,
);

export const HarOffentligTjenesteAnnetLandSelector = createSelector(
  (state: RootState) => avklartefaktaSelectors.OffentligArbeidAntallLandFaktaVerdiSelector(state),
  (offentligArbeidAntallLand) =>
    offentligArbeidAntallLand === KV.Koder.OffentligArbeidAntallLand.ANNET_LAND_OG_ANNEN_VIRKSOMHET,
);

export const HarLonnetArbeidAnnetLand = createSelector(
  (state: RootState) => avklartefaktaSelectors.LoennetArbeidAntallLandFaktaVerdiSelector(state),
  (loennetArbeidAntallLand) => loennetArbeidAntallLand === KV.Koder.LoennetArbeidAntallLand.ETT_ANNET_LAND,
);

export const UtpekingVurderingSelector = createSelector(
  (state: RootState) => behandlingerSelectors.BehandlingstemaKodeSelector(state),
  (state: RootState) => behandlingsresultatSelectors.UtfallRegistreringUnntakSelector(state),
  (state: RootState) => behandlingsresultatSelectors.UtfallUtpekingSelector(state),
  (behandlingstema, utfallRegistreringUnntak, utfallUtpeking) =>
    behandlingstema === MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND
      ? utfallRegistreringUnntak
      : utfallUtpeking,
);

export const ErIDirekteTilArtikkel16FlytSelector = createSelector(
  (state: RootState) => avklartefaktaSelectors.AvklartefaktaSelector(state),
  (avklarteFakta) =>
    avklarteFakta.some((avklartFakta: Api.Avklartefakta.Avklartfakta) => {
      if (!avklartFakta.fakta) return false;
      return avklartFakta.fakta.includes(KV.Koder.VurderingYrkesgruppeTyper.ORDINAER_UTEN_ART12);
    }),
);

export const HarValgtNorskArbeidsgiverSelector = createSelector(
  (state: RootState) => avklartefaktaSelectors.AvklarteNorskeVirksomheterSelector(state),
  (avklarteNorskeVirksomheter) => avklarteNorskeVirksomheter.length > 0,
);

export const HarUnntaksregistreringFlytSelector = createSelector(
  (state: RootState) => fagsakSelectors.SakstypeKodeSelector(state),
  (state: RootState) => fagsakSelectors.SakstemaKodeSelector(state),
  (state: RootState) => behandlingerSelectors.BehandlingstemaKodeSelector(state),
  (sakstype, sakstema, behandlingstema) => harUnntaksregistreringFlyt(sakstype, sakstema, behandlingstema),
);
