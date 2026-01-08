import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/stegLegacy";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingAvslag12_x_og_16 from "../../stegKomponenter/vurderingAvslag12_x_og_16";

class Avslag_12_x_og_16 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [];
    this.id = STEG.AVSLAG_12_X_OG_16;
    this.tittel = "Vedtak";
    this.komponent = VurderingAvslag12_x_og_16;
    this.samleRelevanteData = (_propsLight) => ({
      redigerbart: _propsLight.redigerbart,
      harFeilmeldinger: _propsLight.harFeilmeldinger,
    });
    this.beregnRelevantUI = (_propsLight) => {};
    this.handlers = {
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      validerMottatteOpplysninger: propsLight.tilgjengeligeHandlers.validerMottatteOpplysninger,
    };
    this.status = FANE_STATUS.OK;
  }
}

export default Avslag_12_x_og_16;
