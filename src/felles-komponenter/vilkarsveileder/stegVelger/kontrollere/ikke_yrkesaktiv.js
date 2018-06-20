import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingIkkeYrkesaktiv from '../../vurderinger/vurderingIkkeYrkesaktiv';

class IkkeYrkesaktiv extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        kriterier: 'alle andre valg',
        erOppfylt: () => true,
        nesteSteg: STEG.BOSTEDSLAND,
      },
    ];
    this._id = STEG.IKKE_YRKESAKTIV;
    this._komponent = VurderingIkkeYrkesaktiv;
    this._dataHenter = () => ({ });
    this._tilstand = () => {};
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default IkkeYrkesaktiv;
