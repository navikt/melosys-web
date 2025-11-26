import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/stegLegacy";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingVideresend from "../../stegKomponenter/vurderingVideresend/vurderingVideresend";

class Videresend extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [];

    this.id = STEG.VIDERESEND;
    this.tittel = "Videresending av søknad";
    this.komponent = VurderingVideresend;
    this.samleRelevanteData = (_propsLight) => ({
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = (_propsLight) => ({});
    this.handlers = {
      videresendSoknad: this._propsLight.tilgjengeligeHandlers.videresendSoknad,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
    };
    this.status = FANE_STATUS.OK;
  }
}

export default Videresend;
