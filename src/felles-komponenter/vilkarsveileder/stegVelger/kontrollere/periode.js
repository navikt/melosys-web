import Steg from '../steg';
import { FANE_STATUS, STEG } from '../../stegLogikk/typer'
import VurderingPeriode from '../../vurderinger/vurderingPeriode';

class Periode extends Steg {
  constructor(faktaavklaring) {
    super(faktaavklaring);
    this._kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.SYSSELSETTING,
      },
    ];
    this._id = STEG.PERIODE;
    this._komponent = VurderingPeriode;
    this._dataHenter = props => ({ });
    this._tilstand = skjema => {};
    this._handlers = {
      bekreftOgFortsett: this.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Periode;
