import Steg from '../../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingPerioder from '../../../../felleskomponenter/stegvelger/stegKomponenter/ftrl/vurderingPerioder';

class Perioder extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    const harAvklaring = true;
    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.TRYGDEAVGIFT,
      },
    ];
    this.id = STEG.PERIODER;
    this.tittel = 'Perioder';
    this.komponent = VurderingPerioder;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => ({ harAvklaring });
    this.handlers = {
      bekreft: propsLight.tilgjengeligeHandlers.bekreft,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
    };
    this.status = FANE_STATUS.OK;
  }
}
export default Perioder;
