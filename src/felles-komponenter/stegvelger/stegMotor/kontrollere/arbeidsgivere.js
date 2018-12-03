import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArbeidsgiver from '../../stegKomponenter/vurderingArbeidsgiver';

import * as Koder from '../../../../koder';
import { VurderingSysselsettingTyper } from '../../stegKomponenter/vurderingSysselsetting';

class Arbeidsgivere extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'Valgt minst én arbeidsgivr og sysselsettingType === YRKESAKTIV',
        exec: avklartefakta => {
          const harValgtArbeidsgiver = Arbeidsgivere.harValgtArbeidsgiver(avklartefakta);
          const erVanligYrkesaktiv = Arbeidsgivere.finnAvklaring(avklartefakta, VurderingSysselsettingTyper.YRKESAKTIV);
          return harValgtArbeidsgiver && erVanligYrkesaktiv;
        },
        nesteSteg: STEG.YRKESAKTIVITET,
      },
      {
        beskrivelse: 'Valgt minst én arbeidsgivr og sysselsettingType === YRKESAKTIV_SOKKEL_SKIP',
        exec: avklartefakta => {
          const harValgtArbeidsgiver = Arbeidsgivere.harValgtArbeidsgiver(avklartefakta);
          const arbeiderPaSokkelEllerSkip = Arbeidsgivere.finnAvklaring(avklartefakta, VurderingSysselsettingTyper.YRKESAKTIV_SOKKEL_SKIP);
          return harValgtArbeidsgiver && arbeiderPaSokkelEllerSkip;
        },
        nesteSteg: STEG.SOKKEL_SKIP,
      },
      {
        beskrivelse: 'Stopp steg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this._id = STEG.ARBEIDSGIVERE;
    this._tittel = 'Arbeids\u00ADgiver';
    this._komponent = VurderingArbeidsgiver;
    this._samleRelevanteData = _propsLight => ({ arbeidsgivereIPerioden: _propsLight.arbeidsgivereIPerioden });
    this._beregnRelevantUI = _propsLight => {
      const { arbeidsgivere } = _propsLight.skjema.avklartefakta;
      const harAvklaring = arbeidsgivere.some(arbeidsgiver => arbeidsgiver.fakta.includes('TRUE'));

      return ({
        harAvklaring,
      });
    };
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }

  static harValgtArbeidsgiver = avklartefakta => {
    const harAvklartArbeidsgiver = avklartefakta.some(enkeltFakta => ((enkeltFakta.referanse === Koder.AVKLARTE_ARBEIDSGIVER) && enkeltFakta.fakta.includes('TRUE')));
    return harAvklartArbeidsgiver;
  };

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === STEG.SYSSELSETTING);
    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  };
}

export default Arbeidsgivere;
