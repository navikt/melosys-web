import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingIkkeYrkesaktiv from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingIkkeYrkesaktiv';

class IkkeYrkesaktiv extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        exec: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this.id = STEG.IKKE_YRKESAKTIV;
    this.tittel = 'Ikke yrkesaktiv';
    this.komponent = VurderingIkkeYrkesaktiv;
    this.samleRelevanteData = () => ({});
    this.beregnRelevantUI = () => ({});
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this.status = FANE_STATUS.OK;
  }
}

export default IkkeYrkesaktiv;
