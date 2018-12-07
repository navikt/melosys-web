import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArbeidsgiver from '../../stegKomponenter/vurderingArbeidsgiver';

import * as Koder from '../../../../koder';

class Yrkesgruppe extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'Hvis det finnes minst én avklart arbeidsgiver i avklartefakta',
        exec: avklartefakta => (Yrkesgruppe.harValgtArbeidsgiver(avklartefakta)),
        nesteSteg: STEG.YRKESAKTIVITET,
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
}

export default Yrkesgruppe;
