
import { Virksomheter } from '../../../felleskomponenter/stegvelger/stegMap';
import { STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import * as KV from '../../../kodeverk';

import SokkelSkip from './sokkel_skip';
import Yrkesgruppe from './yrkesgruppe';

class SaksbehandlingVirksomheter extends Virksomheter {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const harValgtArbeidsgiver = Virksomheter.harValgtArbeidsgiver(propsLight.avklartefakta);
    const arbeiderPaSokkelEllerSkip = Virksomheter.finnAvklaring(propsLight.avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP);

    this.kriterier = [
      {
        exec: avklartefakta => {
          const garDirekteTilArtikkel16 = Yrkesgruppe.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.ORDINAER_UTEN_ART12);

          return harValgtArbeidsgiver && garDirekteTilArtikkel16;
        },
        nesteSteg: STEG.ARTIKKEL_16_ANMODNING,
      },
      {
        exec: () => {
          const erToEllerFlereLand = propsLight.erSoknadArbeidFlereLand;

          return harValgtArbeidsgiver && erToEllerFlereLand;
        },
        nesteSteg: STEG.VURDER_ARBEIDSLAND,
      },
      {
        exec: () => harValgtArbeidsgiver && propsLight.erArbeidEttLandOvrig,
        nesteSteg: STEG.ARBEID_ETT_LAND_OVRIG_VEDTAK,
      },
      {
        exec: avklartefakta => {
          const erVanligYrkesaktiv = Virksomheter.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.ORDINAER);
          const erFlyendePersonell = Virksomheter.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.FLYENDE_PERSONELL);
          const erSokkelUtland = SokkelSkip.finnAvklaring(avklartefakta, KV.Koder.VurderingSokkelSkipTyper.SOKKEL_UTLAND);

          return harValgtArbeidsgiver && (
            ((erVanligYrkesaktiv || erFlyendePersonell)) ||
            (arbeiderPaSokkelEllerSkip && erSokkelUtland)
          );
        },
        nesteSteg: STEG.YRKESAKTIVITET,
      },
      {
        exec: avklartefakta => {
          const erSkipEttLand = SokkelSkip.finnAvklaring(avklartefakta, KV.Koder.VurderingSokkelSkipTyper.SKIP_ETT_LAND);
          return harValgtArbeidsgiver && arbeiderPaSokkelEllerSkip && erSkipEttLand;
        },
        nesteSteg: STEG.BOSTEDSLAND,
      },
    ];
  }
}

export default SaksbehandlingVirksomheter;
