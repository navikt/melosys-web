import Steg from '../steg';
import { STEG } from '../../stegLogikk/typer';
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
  }
}

export default Virksomhet;
