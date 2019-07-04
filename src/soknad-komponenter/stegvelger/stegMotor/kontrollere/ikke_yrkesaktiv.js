import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingIkkeYrkesaktiv from '../../stegKomponenter/vurderingIkkeYrkesaktiv';

class IkkeYrkesaktiv extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'alle andre valg',
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
