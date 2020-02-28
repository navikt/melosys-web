
import { Virksomheter } from '../../../felleskomponenter/stegvelger/stegMap';
import { STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import * as KV from '../../../kodeverk';

import SokkelSkip from './sokkel_skip';
import YrkesaktivitetAntallLand from './yrkesaktivitet_antall_land';
import Yrkesgruppe from './yrkesgruppe';

class SaksbehandlingVirksomheter extends Virksomheter {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: '',
        exec: avklartefakta => {
          const harValgtArbeidsgiver = Virksomheter.harValgtArbeidsgiver(avklartefakta);
          const garDirekteTilArtikkel16 = Yrkesgruppe.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.ORDINAER_UTEN_ART12);

          return harValgtArbeidsgiver && garDirekteTilArtikkel16;
        },
        nesteSteg: STEG.ARTIKKEL_16_ANMODNING,
      },
      {
        beskrivelse: 'Valgt minst én arbeidsgiver og yrkesgruppeType === ORDINAER og kun ET_LAND',
        exec: avklartefakta => {
          const harValgtArbeidsgiver = Virksomheter.harValgtArbeidsgiver(avklartefakta);
          const erVanligYrkesaktiv = Virksomheter.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.ORDINAER);
          const erFlyendePersonell = Virksomheter.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.FLYENDE_PERSONELL);
          const erKunEtLand = YrkesaktivitetAntallLand.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetAntallLandTyper.ETT_LAND_IKKE_NORGE);
          return harValgtArbeidsgiver && (erVanligYrkesaktiv || erFlyendePersonell) && erKunEtLand;
        },
        nesteSteg: STEG.YRKESAKTIVITET,
      },
      {
        beskrivelse: 'Valgt minst én arbeidsgiver og yrkesgruppeType === SOKKEL_ELLER_SKIP && sokkelSkipKonklusjon === SOKKEL_UTLAND',
        exec: avklartefakta => {
          const harValgtArbeidsgiver = Virksomheter.harValgtArbeidsgiver(avklartefakta);
          const arbeiderPaSokkelEllerSkip = Virksomheter.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP);
          const erSokkelUtland = SokkelSkip.finnAvklaring(avklartefakta, KV.Koder.VurderingSokkelSkipTyper.SOKKEL_UTLAND);
          return harValgtArbeidsgiver && arbeiderPaSokkelEllerSkip && erSokkelUtland;
        },
        nesteSteg: STEG.YRKESAKTIVITET,
      },
      {
        beskrivelse: 'Valgt minst én arbeidsgiver og yrkesgruppeType === SOKKEL_ELLER_SKIP && sokkelSkipKonklusjon === SKIP_ETT_LAND',
        exec: avklartefakta => {
          const harValgtArbeidsgiver = Virksomheter.harValgtArbeidsgiver(avklartefakta);
          const arbeiderPaSokkelEllerSkip = Virksomheter.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP);
          const erSkipEttLand = SokkelSkip.finnAvklaring(avklartefakta, KV.Koder.VurderingSokkelSkipTyper.SKIP_ETT_LAND);
          return harValgtArbeidsgiver && arbeiderPaSokkelEllerSkip && erSkipEttLand;
        },
        nesteSteg: STEG.BOSTEDSLAND,
      },
      {
        beskrivelse: 'Valgt minst én arbeidsgiver og ordinaert arbeid og i flere land',
        exec: avklartefakta => {
          const harValgtArbeidsgiver = Virksomheter.harValgtArbeidsgiver(avklartefakta);
          const erVanligYrkesaktiv = Virksomheter.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.ORDINAER);
          const erFlyendePersonell = Virksomheter.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.FLYENDE_PERSONELL);
          const erToEllerFlereLand = YrkesaktivitetAntallLand.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetAntallLandTyper.TO_ELLER_FLERE_LAND);
          return harValgtArbeidsgiver && (erVanligYrkesaktiv || erFlyendePersonell) && erToEllerFlereLand;
        },
        nesteSteg: STEG.YRKESAKTIVITET,
      },
    ];
  }
}

export default SaksbehandlingVirksomheter;
