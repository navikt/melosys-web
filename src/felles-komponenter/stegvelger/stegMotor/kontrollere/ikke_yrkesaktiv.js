import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingIkkeYrkesaktiv from '../../stegKomponenter/vurderingIkkeYrkesaktiv';

class IkkeYrkesaktiv extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this._id = STEG.IKKE_YRKESAKTIV;
    this._tittel = 'Ikke yrkesaktiv';
    this._komponent = VurderingIkkeYrkesaktiv;
    this._samleRelevanteData = () => ({});
    this._beregnRelevantUI = () => ({});
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default IkkeYrkesaktiv;
