import Steg from '../steg';
import { FANE_STATUS, STEG } from '../../stegLogikk/typer'
import VurderingVedtak from '../../vurderinger/vurderingVedtak';

class Virksomhet extends Steg {
  constructor(faktaavklaring) {
    super(faktaavklaring);
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
      bekreftOgFortsett: this.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Virksomhet;
