import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArbeidsforhold from '../../vurderinger/vurderingArbeidsforhold';

class Sysselsetting extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.SEKTOR,
      },
    ];
    this._id = STEG.ARBEIDSFORHOLD;
    this._tittel = 'Arbeids\u00ADgiver';
    this._komponent = VurderingArbeidsforhold;
    this._dataHenter = _propsLight => ({ relevanteArbeidsforholdene: _propsLight.relevanteArbeidsforholdene });
    this._tilstand = _propsLight => {};
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Sysselsetting;
