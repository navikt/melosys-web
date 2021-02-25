import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger/stegMotor/typer";
import VurderingStart from "../../../../felleskomponenter/stegvelger/stegKomponenter/ftrl/vurderingStart";

class Start extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    const harAvklaring = propsLight.vurder_start_valid;
    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.VIRKSOMHET,
      },
    ];
    this.id = STEG.START;
    this.tittel = "Start";
    this.komponent = VurderingStart;
    this.samleRelevanteData = (_propsLight) => ({
      alleLandkoder: _propsLight.landkoder,
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = () => ({ harAvklaring });
    this.handlers = {
      bekreft: propsLight.tilgjengeligeHandlers.bekreft,
      oppdater: propsLight.tilgjengeligeHandlers.oppdater,
    };
    this.status = FANE_STATUS.OK;
  }
}
export default Start;
