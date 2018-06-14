import Steg from '../steg';
import { STEG } from '../../stegLogikk/typer';
import VurderingIkkeYrkesaktiv from '../../vurderinger/vurderingIkkeYrkesaktiv';

class IkkeYrkesaktiv extends Steg {
  constructor(faktaavklaring) {
    super(faktaavklaring);
    this._kriterier = [
      {
        kriterier: 'alle andre valg',
        erOppfylt: () => true,
        nesteSteg: STEG.BOSTEDSLAND,
      },
    ];
    this._id = STEG.IKKE_YRKESAKTIV;
    this._komponent = VurderingIkkeYrkesaktiv;
  }
}

export default IkkeYrkesaktiv;
