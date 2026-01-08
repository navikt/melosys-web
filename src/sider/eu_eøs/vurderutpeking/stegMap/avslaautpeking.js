import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/stegLegacy";
import { STEG, FANE_STATUS } from "../../../../felleskomponenter/stegvelger";
import VurderingAvslaaUtpeking from "../../stegKomponenter/vurderingAvslaaUtpeking/vurderingAvslaaUtpeking";

class AvslaaUtpeking extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this.kriterier = [];
    this.id = STEG.AVSLAA_UTPEKING;
    this.tittel = "Avvis utpeking";
    this.komponent = VurderingAvslaaUtpeking;
    this.samleRelevanteData = (_propsLight) => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = (_propsLight) => {
      const harAvklaring = true;

      return {
        harAvklaring,
      };
    };
    this.handlers = {
      avvisUtpeking: propsLight.tilgjengeligeHandlers.avvisUtpeking,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default AvslaaUtpeking;
