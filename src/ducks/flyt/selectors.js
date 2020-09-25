import { createSelector } from 'reselect';

import MKV from '../../melosyskodeverk';
import * as KV from '../../kodeverk';

import { avklartefaktaSelectors } from '../avklartefakta';
import { vilkarSelectors } from '../vilkar';
import { behandlingerSelectors } from '../behandlinger';
import { behandlingsresultatSelectors } from '../behandlingsresultat';

export const ErIArtikkel11_4Selector = createSelector(
  state => vilkarSelectors.art11_4_1(state),
  state => vilkarSelectors.art11_4_2(state),
  (...vilkar) => vilkar.some(enkeltVilkar => enkeltVilkar.oppfylt)
);

export const HarOffentligTjenesteINorgeSelector = createSelector(
  state => avklartefaktaSelectors.OffentligArbeidAntallLandFaktaVerdiSelector(state),
  offentligArbeidAntallLand => offentligArbeidAntallLand === KV.Koder.OffentligArbeidAntallLand.NORGE_OG_ANNEN_VIRKSOMHET
);

export const HarOffentligTjenesteAnnetLandSelector = createSelector(
  state => avklartefaktaSelectors.OffentligArbeidAntallLandFaktaVerdiSelector(state),
  offentligArbeidAntallLand => offentligArbeidAntallLand === KV.Koder.OffentligArbeidAntallLand.ANNET_LAND_OG_ANNEN_VIRKSOMHET
);

export const HarLonnetArbeidAnnetLand = createSelector(
  state => avklartefaktaSelectors.LoennetArbeidAntallLandFaktaVerdiSelector(state),
  loennetArbeidAntallLand => loennetArbeidAntallLand === KV.Koder.LoennetArbeidAntallLand.ETT_ANNET_LAND
);

export const UtpekingVurderingSelector = createSelector(
  state => behandlingerSelectors.BehandlingstemaKodeSelector(state),
  behandlingsresultatSelectors.UtfallRegistreringUnntakSelector,
  behandlingsresultatSelectors.UtfallUtpekingSelector,
  (behandlingstema, utfallRegistreringUnntak, utfallUtpeking) => (
    behandlingstema === MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND
      ? utfallRegistreringUnntak
      : utfallUtpeking
  )
);

export const EnVirksomhetErAvklartSelector = createSelector(
  state => avklartefaktaSelectors.AvklarteVirksomheterSelector(state),
  avklarteVirksomheter => avklarteVirksomheter.length === 1
);

export const ErIArtikkel13_1FlytSelector = createSelector(
  state => behandlingerSelectors.BehandlingstemaKodeSelector(state),
  behandlingstema => behandlingstema === MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND
);

export const ErIDirekteTilArtikkel16FlytSelector = createSelector(
  state => avklartefaktaSelectors.AvklartefaktaSelector(state),
  avklarteFakta => (
    avklarteFakta.some(avklartFakta => {
      if (!avklartFakta.fakta) return false;
      return avklartFakta.fakta.includes(KV.Koder.VurderingYrkesgruppeTyper.ORDINAER_UTEN_ART12);
    })
  )
);
