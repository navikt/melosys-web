import Steg from '../steg';
import { FANE_STATUS, STEG } from '../../stegLogikk/typer'
import VurderingInngang from '../../vurderinger/vurderingInngang';

class Inngang extends Steg {
  constructor(faktaavklaring) {
    super(faktaavklaring);
    this._kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.PERIODE,
      },
    ];
    this._id = STEG.INNGANG;
    this._komponent = VurderingInngang;
    this._dataHenter = props => ({ inngangsvilkar: props.inngang });
    this._tilstand = skjema => {};
    this._handlers = {
      bekreftOgFortsett: this.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Inngang;
