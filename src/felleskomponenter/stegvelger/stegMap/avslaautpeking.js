
import Steg from '../../stegvelger/stegMotor/steg';
import { STEG, FANE_STATUS } from '../../stegvelger/stegMotor/typer';
import VurderingAvslaaUtpeking from '../stegKomponenter/vurderingAvslaaUtpeking';

class AvslaaUtpeking extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this.kriterier = [];
    this.id = STEG.AVSLAA_UTPEKING;
    this.tittel = 'Avvis utpeking';
    this.komponent = VurderingAvslaaUtpeking;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const harAvklaring = true;

      return ({
        harAvklaring,
      });
    };
    this.handlers = {
      avvisUtpeking: propsLight.tilgjengeligeHandlers.avvisUtpeking,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default AvslaaUtpeking;
