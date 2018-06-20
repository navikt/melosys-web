import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingVedtak from '../../vurderinger/vurderingVedtak';

class Virksomhet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'alle valg',
        exec: () => true,
        nesteSteg: false,
      },
    ];
    this._id = STEG.VEDTAK;
    this._komponent = VurderingVedtak;
    this._dataHenter = () => ({ });
    this._tilstand = () => {};
    this._handlers = {
      fattVedtak: this._propsLight.tilgjengeligeHandlers.fattVedtak,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Virksomhet;
