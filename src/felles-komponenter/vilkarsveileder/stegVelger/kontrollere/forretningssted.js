import Steg from '../steg';
import { FANE_STATUS, STEG } from '../../stegLogikk/typer'
import VurderingForretningssted from '../../vurderinger/vurderingForretningssted';

class Forretningssted extends Steg {
  constructor(faktaavklaring) {
    super(faktaavklaring);
    this._kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this._id = STEG.SYSSELSETTING;
    this._komponent = VurderingForretningssted;
    this._dataHenter = props => ({ valgteArbeidsforhold: props.valgteArbeidsforhold });
    this._tilstand = () => {};
    this._handlers = {
      bekreftOgFortsett: this.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Forretningssted;
