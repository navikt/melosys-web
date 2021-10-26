import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingRepresentant from "../stegKomponenter/vurderingRepresentant";

class Reprensentant extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    const harAvklaring = propsLight.vurder_representant_valid;
    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.FAMILIE,
      },
    ];
    this.id = STEG.REPRESENTANT;
    this.tittel = "Representant";
    this.komponent = VurderingRepresentant;
    this.samleRelevanteData = (_propsLight) => ({
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = (_propsLight) => ({ harAvklaring });
    this.handlers = {
      bekreft: propsLight.tilgjengeligeHandlers.bekreft,
      oppdater: propsLight.tilgjengeligeHandlers.oppdater,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
    };
    this.status = FANE_STATUS.OK;
  }
}
export default Reprensentant;
