import Steg from '../steg';
import { STEG } from '../../stegLogikk/typer';
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
  }
}

export default Periode;
