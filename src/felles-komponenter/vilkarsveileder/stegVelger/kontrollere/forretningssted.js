import Steg from '../steg';
import { STEG } from '../../stegLogikk/typer';
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
  }
}

export default Forretningssted;
