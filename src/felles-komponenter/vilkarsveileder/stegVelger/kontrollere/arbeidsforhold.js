import Steg from '../steg';
import { FANE_STATUS, STEG } from '../../stegLogikk/typer';
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
    this._komponent = VurderingArbeidsforhold;
    this._dataHenter = props => ({ relevanteArbeidsforholdene: props.relevanteArbeidsforholdene });
    this._tilstand = () => {};
    this._handlers = {
      bekreftOgFortsett: this.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Sysselsetting;
