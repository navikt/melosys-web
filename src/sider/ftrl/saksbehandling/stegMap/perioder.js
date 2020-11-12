import Steg from '../../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingPerioder from "../../../../felleskomponenter/stegvelger/stegKomponenter/ftrl/vurderingPerioder";

class Perioder extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    const harAvklaring = false;
    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.TRYGDEAVGIFT,
      },
    ];
    this.id = STEG.PERIODER;
    this.tittel = 'Perioder';
    this.komponent = VurderingPerioder;
    this.samleRelevanteData = _propsLight => ({});
    this.beregnRelevantUI = _propsLight => ({ harAvklaring: false });
    this.handlers = {
      bekreftOgFortsett: propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this.status = FANE_STATUS.OK;
  }
}
export default Perioder;
