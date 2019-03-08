import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArbeidsgiver from '../../stegKomponenter/vurderingArbeidsgiver';
import * as KV from '../../../../kodeverk';

import SokkelSkip from './sokkel_skip';

class Yrkesgruppe extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'Valgt minst én arbeidsgivr og yrkesgruppeType === ORDINAER',
        exec: avklartefakta => {
          const harValgtArbeidsgiver = Yrkesgruppe.harValgtArbeidsgiver(avklartefakta);
          const erVanligYrkesaktiv = Yrkesgruppe.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.ORDINAER);
          return harValgtArbeidsgiver && erVanligYrkesaktiv;
        },
        nesteSteg: STEG.YRKESAKTIVITET,
      },
      {
        beskrivelse: 'Valgt minst én arbeidsgivr og yrkesgruppeType === SOKKEL_ELLER_SKIP && sokkelSkipKonklusjon === SOKKEL_UTLAND',
        exec: avklartefakta => {
          const harValgtArbeidsgiver = Yrkesgruppe.harValgtArbeidsgiver(avklartefakta);
          const arbeiderPaSokkelEllerSkip = Yrkesgruppe.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP);
          const erSokkelUtland = SokkelSkip.finnAvklaring(avklartefakta, KV.Koder.VurderingSokkelSkipTyper.SOKKEL_UTLAND);
          return harValgtArbeidsgiver && arbeiderPaSokkelEllerSkip && erSokkelUtland;
        },
        nesteSteg: STEG.YRKESAKTIVITET,
      },
      {
        beskrivelse: 'Valgt minst én arbeidsgivr og yrkesgruppeType === SOKKEL_ELLER_SKIP && sokkelSkipKonklusjon === SKIP_ETT_LAND',
        exec: avklartefakta => {
          const harValgtArbeidsgiver = Yrkesgruppe.harValgtArbeidsgiver(avklartefakta);
          const arbeiderPaSokkelEllerSkip = Yrkesgruppe.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP);
          const erSkipEttLand = SokkelSkip.finnAvklaring(avklartefakta, KV.Koder.VurderingSokkelSkipTyper.SKIP_ETT_LAND);
          return harValgtArbeidsgiver && arbeiderPaSokkelEllerSkip && erSkipEttLand;
        },
        nesteSteg: STEG.BOSTEDSLAND,
      },
      {
        beskrivelse: 'Stopp steg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this.id = STEG.ARBEIDSGIVERE;
    this.tittel = 'Arbeids\u00ADgiver';
    this.komponent = VurderingArbeidsgiver;
    this.samleRelevanteData = _propsLight => ({
      arbeidsgivereIPerioden: _propsLight.arbeidsgivereIPerioden,
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const { arbeidsgivere } = _propsLight.skjema.avklartefakta;
      const harAvklaring = arbeidsgivere.some(arbeidsgiver => arbeidsgiver.fakta.includes('TRUE'));

      return ({
        harAvklaring,
      });
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }

  static harValgtArbeidsgiver = avklartefakta => avklartefakta.some(enkeltFakta => ((enkeltFakta.referanse === KV.Koder.AVKLARTE_ARBEIDSGIVER) && enkeltFakta.fakta.includes('TRUE')));

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === STEG.YRKESGRUPPE);
    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  };
}

export default Yrkesgruppe;
